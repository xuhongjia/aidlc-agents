// Maintainer-only static byte accounting. This does not run Agents or estimate tokens.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { normalizeBuiltins } from './workflow-model.mjs';
import { instructionPlan } from './context-model.mjs';

const readPackage = relative => readFileSync(new URL('../../' + relative, import.meta.url));
const totals = runs => runs.reduce((sum, run) => ({
  method_bytes: sum.method_bytes + run.method_bytes,
  template_bytes: sum.template_bytes + run.template_bytes,
  total_bytes: sum.total_bytes + run.total_bytes,
}), { method_bytes: 0, template_bytes: 0, total_bytes: 0 });

export function measureInstructions(plan, read = readPackage) {
  const seen = new Set();
  const files = plan.map(({ ref }) => {
    if (!ref.startsWith('core:') || seen.has(ref)) throw new Error('Expected unique core instruction references');
    seen.add(ref);
    const relative = ref.slice(5), body = Buffer.from(read(relative));
    return { ref, bytes: body.length, sha256: createHash('sha256').update(body).digest('hex') };
  });
  const template_bytes = files.filter(file => file.ref.startsWith('core:templates/')).reduce((sum, file) => sum + file.bytes, 0);
  const total_bytes = files.reduce((sum, file) => sum + file.bytes, 0);
  return { method_bytes: total_bytes - template_bytes, template_bytes, total_bytes, files };
}

export function measureCompactWorkflow(profile, { read = readPackage, feedback = 0, extraVerifyRuns = 0 } = {}) {
  if (!['fix', 'enhance'].includes(profile)) throw new Error('Expected a compact profile');
  if (!Number.isInteger(extraVerifyRuns) || extraVerifyRuns < 0) throw new Error('Invalid extra Verify run count');
  const json = relative => JSON.parse(read(relative));
  const context = json('workflow/context.json');
  const core = normalizeBuiltins(json('workflow/stages.json'), json('workflow/stage-contracts.json'), json('manifest.json').version);
  const workflow = core.workflows.find(item => item.id === 'core.' + profile);
  const runs = workflow.nodes.map(node => {
    const stage = core.stages.find(item => item.id === node.stage_id);
    return { id: node.step_id, kind: 'stage', ...measureInstructions(instructionPlan(context, stage, node, {
      feedback: stage.kind === 'implementation' ? feedback : 0,
    }), read) };
  });
  const verifier = core.stages.find(stage => stage.id === workflow.nodes.find(node => node.step_id === 'verify').stage_id);
  const reviewers = ['architecture', 'quality'].map(gate_kind => ({
    id: gate_kind + '-reviewer', kind: 'gate-execution',
    ...measureInstructions(instructionPlan(context, verifier, {}, { leaf: 'gate-execution', gate_kind }), read),
  }));
  const verify = runs.find(run => run.id === 'verify');
  const repeats = Array.from({ length: extraVerifyRuns }, (_, index) => ({ ...verify, id: 'verify-extra-' + (index + 1) }));
  // A repeated read is deduplicated within one run by instructionPlan, never across fresh Agents.
  return { profile, feedback, extra_verify_runs: extraVerifyRuns,
    stages: totals(runs), reviewers: totals(reviewers),
    totals: totals([...runs, ...reviewers, ...repeats]), runs: [...runs, ...reviewers, ...repeats] };
}
