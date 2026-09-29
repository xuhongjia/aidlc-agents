// Maintainer-only reference model: not shipped as an installer or Agent runtime.
import { createHash } from 'node:crypto';
import { readFileSync, lstatSync } from 'node:fs';
import path from 'node:path';
import { validateStage } from './workflow-model.mjs';

export const byteDigest = bytes => createHash('sha256').update(bytes).digest('hex');
const requireThat = (ok, message) => { if (!ok) throw new Error(message); };
export function safeFile(root, relative) {
  requireThat(typeof relative === 'string' && relative && !path.isAbsolute(relative)
    && !relative.includes('\\') && !relative.split('/').some(part => ['', '.', '..'].includes(part)), 'unsafe resource path');
  let current = root;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    requireThat(!lstatSync(current).isSymbolicLink(), 'symlink resource');
  }
  requireThat(lstatSync(current).isFile(), 'resource must be a file');
  return current;
}
export function instructionPlan(context, stage, node, { feedback = 0, leaf = null } = {}) {
  requireThat(context.contract_version === 1, 'unknown context contract');
  validateStage(stage);
  requireThat([0, 2].includes(feedback), 'unsupported feedback budget');
  requireThat(!feedback || (stage.kind === 'implementation' && !leaf), 'feedback not available for this task');
  const refs = new Map();
  const add = (ref, purpose) => {
    requireThat(typeof ref === 'string' && /^(core|team|project):/.test(ref), 'unknown instruction namespace');
    if (!refs.has(ref)) refs.set(ref, { ref, purpose });
  };
  const core = (files, purpose) => files.forEach(file => add('core:' + file, purpose));
  core(context.common, 'common');
  if (/^(core|team|project):/.test(stage.role)) add(stage.role, 'role');
  add(stage.prompt, 'stage');
  (stage.instructions ?? []).forEach(ref => add(ref, 'team'));
  for (const output of node.outputs ?? stage.outputs) add(output.template, 'template');
  if (leaf) {
    requireThat(['gate-design', 'gate-execution'].includes(leaf), 'unknown leaf assignment');
    core(context[leaf === 'gate-design' ? 'gate_design_leaf' : 'gate_execution_leaf'], 'leaf');
  } else {
    core(context.by_kind[stage.kind] ?? [], 'kind');
    for (const capability of stage.capabilities) core(context.by_capability[capability] ?? [], 'capability');
    for (const output of node.outputs ?? stage.outputs) core(context.by_output_contract[output.contract] ?? [], 'output-contract');
    if (feedback) core(context.implementation_feedback, 'feedback');
  }
  return [...refs.values()];
}
function verified(root, ref) {
  const bytes = readFileSync(safeFile(root, ref.path));
  requireThat(byteDigest(bytes) === ref.sha256, 'fixed bytes changed');
  return bytes;
}
export function bindInstructions(root, dispatch) {
  requireThat(dispatch.schema_version === 4, 'legacy dispatch requires original method');
  requireThat(dispatch.kind === 'stage', 'use the bounded leaf contract separately');
  const lock = JSON.parse(verified(root, dispatch.workflow_ref));
  requireThat(lock.work_id === dispatch.work_id, 'wrong work');
  const nodes = lock.workflow.nodes.filter(node => node.step_id === dispatch.step_id);
  requireThat(nodes.length === 1, 'unknown or duplicate step');
  const node = nodes[0], matches = lock.stages.filter(stage => stage.id === node.stage_id);
  requireThat(matches.length === 1, 'unknown or duplicate stage');
  const stage = matches[0];
  requireThat(stage.id === dispatch.stage_id && stage.kind === dispatch.stage_kind, 'wrong stage identity');
  requireThat(JSON.stringify(node.bindings) === JSON.stringify(dispatch.input_bindings), 'input binding drift');
  const assets = new Map();
  for (const asset of lock.assets) {
    requireThat(!assets.has(asset.ref), 'duplicate asset');
    assets.set(asset.ref, asset);
  }
  const config = assets.get('core:workflow/context.json');
  requireThat(config, 'context asset missing');
  const context = JSON.parse(verified(root, config));
  const expected = instructionPlan(context, stage, node, { feedback: dispatch.implementation_feedback?.max_correction_rounds ?? 0 });
  requireThat(Array.isArray(dispatch.instruction_refs) && dispatch.instruction_refs.length === expected.length, 'instruction set incomplete or widened');
  const seen = new Set();
  for (const item of expected) {
    const got = dispatch.instruction_refs.filter(ref => ref.ref === item.ref);
    requireThat(got.length === 1 && !seen.has(item.ref), 'duplicate or missing instruction');
    const asset = assets.get(item.ref); requireThat(asset, 'instruction asset missing');
    requireThat(got[0].path === asset.path && got[0].sha256 === asset.sha256 && got[0].purpose === item.purpose, 'instruction identity drift');
    verified(root, got[0]); seen.add(item.ref);
  }
  const rolePath = /^(core|team|project):/.test(stage.role) ? assets.get(stage.role)?.path : null;
  requireThat(dispatch.role_path === rolePath && dispatch.stage_prompt_path === assets.get(stage.prompt)?.path, 'role or Prompt drift');
  // Projection comes from the verified full bytes, never caller-supplied prose.
  return { node, stage, instruction_refs: structuredClone(dispatch.instruction_refs) };
}
