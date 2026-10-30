// Read-only structural checks. This is not an approval, Gate or permission engine.
import { createHash } from 'node:crypto';
import { readFileSync, lstatSync, readdirSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const nonempty = value => typeof value === 'string' && value.length > 0;
const digest = value => /^[a-f0-9]{64}$/.test(value ?? '');
const refEqual = (a, b) => a?.path === b?.path && a?.sha256 === b?.sha256 && digest(a?.sha256);
const hostChecks = ['authority', 'revocation', 'candidate_scope', 'input_approvals', 'semantic_requirements'];

function relativePath(value) {
  requireThat(nonempty(value) && !path.isAbsolute(value) && !value.includes('\\')
    && !value.split('/').some(part => ['', '.', '..'].includes(part)), 'unsafe relative path');
  return value;
}
function rootPath(root) {
  requireThat(!lstatSync(root).isSymbolicLink() && lstatSync(root).isDirectory(), 'unsafe project root');
  return realpathSync(root);
}
function safePath(root, relative, allowMissing = false) {
  let current = root;
  for (const part of relativePath(relative).split('/')) {
    current = path.join(current, part);
    let stat;
    try { stat = lstatSync(current); } catch (error) {
      if (allowMissing && error.code === 'ENOENT') return null;
      throw error;
    }
    requireThat(!stat.isSymbolicLink(), 'symlink path');
  }
  return current;
}
function readRef(root, ref) {
  requireThat(ref && digest(ref.sha256), 'missing or invalid file digest');
  const file = safePath(root, ref.path);
  requireThat(lstatSync(file).isFile(), 'reference is not a file');
  const bytes = readFileSync(file);
  requireThat(sha256(bytes) === ref.sha256, 'file digest mismatch: ' + ref.path);
  return bytes;
}
function parseJson(bytes, name) {
  try { return JSON.parse(bytes); } catch { throw new Error('invalid JSON: ' + name); }
}
const readJson = (root, ref) => parseJson(readRef(root, ref), ref.path);
function unique(items, key, description) {
  requireThat(Array.isArray(items), description + ' must be an array');
  requireThat(items.every(item => nonempty(key(item))), description + ' missing identity');
  requireThat(new Set(items.map(key)).size === items.length, description + ' duplicate identity');
}
function productPath(relative) {
  relativePath(relative);
  requireThat(!relative.split('/').some(part => ['.git', '.aidlc'].includes(part)), 'control path in candidate');
}
function candidateFiles(root, candidate, requiredScope) {
  requireThat(Array.isArray(requiredScope) && requiredScope.length > 0 && same(candidate.scope, requiredScope), 'candidate scope mismatch');
  unique(candidate.files, file => file.path, 'candidate files');
  requireThat(candidate.files.length > 0, 'empty candidate manifest');
  const actual = new Set();
  function walk(relative) {
    productPath(relative);
    const file = safePath(root, relative, true);
    if (!file) return;
    const stat = lstatSync(file);
    if (stat.isDirectory()) {
      for (const child of readdirSync(file).sort()) walk(relative + '/' + child);
    } else {
      requireThat(stat.isFile(), 'nonregular candidate file');
      actual.add(relative);
    }
  }
  for (const scope of requiredScope) walk(scope);
  const present = new Set();
  for (const file of candidate.files) {
    productPath(file.path);
    requireThat(requiredScope.some(scope => file.path === scope || file.path.startsWith(scope + '/')), 'candidate file outside scope');
    if (file.deleted === true) {
      requireThat(file.sha256 === null && !safePath(root, file.path, true), 'deleted candidate file exists');
    } else {
      readRef(root, file);
      present.add(file.path);
    }
  }
  requireThat(same([...actual].sort(), [...present].sort()), 'candidate enumeration mismatch');
}

function joinedApproval(root, pair, dispatch, lock, ancestors) {
  const review = readJson(root, pair.review_ref), approval = readJson(root, pair.approval_ref);
  for (const record of [review, approval]) {
    requireThat(record.work_id === dispatch.work_id && refEqual(record.workflow_ref, dispatch.workflow_ref), 'approval work or workflow mismatch');
    requireThat(nonempty(record.step_id) && Number.isInteger(record.revision) && record.revision > 0, 'approval identity missing');
    const node = lock.workflow.nodes.find(item => item.step_id === record.step_id);
    requireThat(node?.stage_id === record.stage_id && ancestors.has(record.step_id), 'approval is not a locked ancestor');
  }
  requireThat(approval.step_id === review.step_id && approval.revision === review.revision
    && approval.stage_id === review.stage_id, 'approval revision mismatch');
  requireThat(approval.review_digest === pair.review_ref.sha256 && approval.decision === 'approved', 'approval does not approve exact review');
  requireThat(approval.by && nonempty(approval.at), 'approval decision source missing');
  for (const file of review.files ?? []) {
    relativePath(file.path); requireThat(digest(file.sha256), 'invalid review artifact digest');
  }
  return { review, review_ref: pair.review_ref, approval };
}

function reviewFileMatches(root, pair, file, target) {
  // Canonical promoted-review files are artifact-relative. Older explicit
  // project-relative mappings remain usable only when their exact target matches.
  relativePath(file.path);
  const promoted = path.posix.join(path.posix.dirname(pair.review_ref.path), file.path);
  if (file.sha256 !== target.sha256 || ![promoted, file.path].includes(target.path)) return false;
  requireThat(target.path === promoted || promoted === file.path || !safePath(root, promoted, true), 'ambiguous review artifact path');
  readRef(root, target);
  return true;
}

function instructionRefs(root, lock, node, stage, dispatch) {
  const contextAsset = lock.assets.find(asset => asset.ref === 'core:workflow/context.json');
  requireThat(contextAsset, 'frozen context contract missing');
  const context = readJson(root, contextAsset);
  requireThat(context.contract_version === 1, 'unknown context contract');
  const expected = new Set(), add = ref => {
    requireThat(typeof ref === 'string' && /^(core|team|project):/.test(ref), 'unknown instruction namespace');
    expected.add(ref);
  };
  const core = files => { requireThat(Array.isArray(files), 'context resource list missing'); files.forEach(file => add('core:' + file)); };
  core(context.common);
  if (/^(core|team|project):/.test(stage.role)) add(stage.role);
  add(stage.prompt);
  for (const ref of stage.instructions ?? []) add(ref);
  const outputs = node.outputs ?? stage.outputs;
  requireThat(Array.isArray(outputs), 'stage outputs missing');
  for (const output of outputs) add(output.template);
  core(context.by_kind[stage.kind] ?? []);
  for (const capability of stage.capabilities ?? []) {
    requireThat(['product.write', 'knowledge.read', 'knowledge.prepare', 'evidence.read'].includes(capability), 'unknown capability');
    core(context.by_capability[capability] ?? []);
  }
  for (const output of outputs) core(context.by_output_contract[output.contract] ?? []);
  if (dispatch.implementation_feedback?.max_correction_rounds) {
    requireThat(stage.kind === 'implementation', 'feedback outside implementation'); core(context.implementation_feedback);
  }
  const bindingIds = lock.delivery?.steps?.find(step => step.step_id === node.step_id)?.binding_ids ?? [];
  if (bindingIds.length) {
    core(context.pipeline_execution);
    for (const id of bindingIds) {
      const binding = lock.delivery.bindings?.find(item => item.id === id);
      requireThat(binding && context.pipeline_adapters[binding.provider], 'pipeline adapter missing');
      core([context.pipeline_adapters[binding.provider]]);
    }
  }
  const actual = new Set(dispatch.instruction_refs.map(ref => ref.ref));
  requireThat(expected.size === actual.size && [...expected].every(ref => actual.has(ref)), 'mandatory instruction set incomplete or widened');
  const optional = stage.kind === 'implementation' ? Object.values(context.implementation_optional ?? {}).map(file => 'core:' + file) : [];
  requireThat(optional.length === dispatch.optional_instruction_refs.length && optional.every(ref => dispatch.optional_instruction_refs.some(item => item.ref === ref)), 'optional instruction set mismatch');
}

function evidence(root, ref, rule, dispatch) {
  const report = readJson(root, ref);
  requireThat(report.work_id === dispatch.work_id && refEqual(report.workflow_ref, dispatch.workflow_ref), 'evidence work or workflow mismatch');
  requireThat(refEqual(report.candidate_ref, dispatch.candidate.ref), 'evidence candidate mismatch');
  requireThat(report.complete === true && report.truncated !== true, 'incomplete or truncated evidence');
  requireThat(Array.isArray(report.raw_refs) && report.raw_refs.length > 0, 'raw evidence missing');
  for (const raw of report.raw_refs) requireThat(readRef(root, raw).length > 0, 'empty raw evidence');
  if (rule.require_checks) {
    requireThat(Array.isArray(report.checks) && report.checks.length > 0, 'zero checks');
    unique(report.checks, check => check.id, 'evidence checks');
    for (const check of report.checks) {
      requireThat(Number.isSafeInteger(check.executed_count) && check.executed_count > 0, 'zero or invalid executed checks');
      requireThat(check.status === 'PASS' && check.skipped !== true, 'required check not passing');
      requireThat(check.raw_ref && report.raw_refs.some(raw => refEqual(raw, check.raw_ref)), 'check raw source missing');
    }
  }
  return report;
}

function inspect(root, request, result) {
  requireThat(request.schema_version === 1 && ['validate', 'verify-preflight'].includes(request.operation), 'unsupported validation request');
  const dispatch = readJson(root, request.dispatch_ref);
  for (const key of ['work_id', 'step_id', 'stage_id', 'stage_kind', 'run_id']) requireThat(nonempty(dispatch[key]), 'missing dispatch ' + key);
  requireThat(Number.isInteger(dispatch.revision) && dispatch.revision > 0, 'missing dispatch revision');
  requireThat(dispatch.kind === 'stage', 'helper supports stage dispatch only; use host leaf validation');
  const lock = readJson(root, dispatch.workflow_ref);
  requireThat(lock.work_id === dispatch.work_id, 'wrong locked work');
  unique(lock.workflow.nodes, node => node.step_id, 'workflow nodes');
  unique(lock.stages, stage => stage.id, 'locked stages');
  const node = lock.workflow.nodes.find(item => item.step_id === dispatch.step_id);
  const stage = lock.stages.find(item => item.id === node?.stage_id);
  requireThat(stage && stage.id === dispatch.stage_id && stage.kind === dispatch.stage_kind, 'stage identity mismatch');
  requireThat(['analysis', 'specification', 'design', 'quality_design', 'planning', 'implementation', 'verification', 'release_readiness', 'learning'].includes(stage.kind), 'unknown stage kind');
  requireThat(same(node.bindings, dispatch.input_bindings), 'input binding drift');
  unique(lock.assets, asset => asset.ref, 'locked assets');
  for (const asset of lock.assets) readRef(root, asset);
  for (const list of ['instruction_refs', 'optional_instruction_refs']) {
    unique(dispatch[list] ?? [], item => item.ref, list);
    for (const ref of dispatch[list] ?? []) {
      requireThat(lock.assets.some(asset => asset.ref === ref.ref && refEqual(asset, ref)), 'instruction outside locked assets');
      readRef(root, ref);
    }
  }
  instructionRefs(root, lock, node, stage, dispatch);
  requireThat(lock.execution?.contract_version === 1 && lock.execution.validation_ref, 'frozen validation contract missing');
  const requirements = readJson(root, lock.execution.validation_ref);
  requireThat(requirements.schema_version === 1, 'unknown validation requirements');
  unique(requirements.steps, step => step.step_id, 'validation steps');
  const required = requirements.steps.find(item => item.step_id === dispatch.step_id);
  requireThat(required, 'step validation requirements missing');
  requireThat(Array.isArray(required.required_inputs) && stage.inputs.every(contract => required.required_inputs.includes(contract)), 'required semantic input omitted');
  const refs = dispatch.execution?.validation;
  requireThat(refs, 'dispatch validation references missing');
  const dependencies = current => [...Object.values(current.bindings).flat(),
    ...(lock.workflow.edges ?? []).filter(edge => edge.to === current.step_id).map(edge => edge.from)];
  const ancestors = new Set(), remaining = dependencies(node);
  while (remaining.length) {
    const id = remaining.pop();
    if (id.startsWith('$') || ancestors.has(id)) continue;
    const producer = lock.workflow.nodes.find(item => item.step_id === id);
    requireThat(producer && producer.step_id !== node.step_id, 'invalid input dependency');
    ancestors.add(id); remaining.push(...dependencies(producer));
  }
  unique(refs.approval_pairs, pair => pair.role, 'approval roles');
  requireThat(Array.isArray(required.approval_roles) && required.approval_roles.every(role => refs.approval_pairs.some(pair => pair.role === role)), 'required approval missing');
  const pairs = refs.approval_pairs.map(pair => ({ role: pair.role, ...joinedApproval(root, pair, dispatch, lock, ancestors) }));
  for (const ref of dispatch.input_refs ?? []) readRef(root, ref);
  unique(refs.input_refs, ref => ref.contract + ':' + ref.producer_step_id + ':' + ref.path, 'bound input refs');
  for (const contract of required.required_inputs) {
    const producers = node.bindings[contract];
    requireThat(Array.isArray(producers) && producers.length > 0, 'required input producer missing');
    for (const producer of producers) requireThat(refs.input_refs.some(ref => ref.contract === contract
      && ref.producer_step_id === producer), 'required input reference missing');
  }
  for (const ref of refs.input_refs) {
    requireThat(node.bindings[ref.contract]?.includes(ref.producer_step_id), 'unknown input producer');
    requireThat(dispatch.input_refs.some(input => refEqual(input, ref)), 'input reference outside dispatch');
    readRef(root, ref);
    if (!ref.producer_step_id.startsWith('$')) {
      const approvedFile = pairs.some(pair => pair.review.step_id === ref.producer_step_id
        && pair.review.files?.some(file => reviewFileMatches(root, pair, file, ref)));
      if (!approvedFile) {
        requireThat(ref.producer_result_ref, 'input missing producer provenance');
        const source = readJson(root, ref.producer_result_ref);
        const producerNode = lock.workflow.nodes.find(item => item.step_id === ref.producer_step_id);
        requireThat(source.work_id === dispatch.work_id && refEqual(source.workflow_ref, dispatch.workflow_ref)
          && source.step_id === producerNode?.step_id && source.stage_id === producerNode?.stage_id
          && nonempty(source.run_id) && source.status === 'ready_for_review', 'producer result identity or status mismatch');
        requireThat(source.artifacts?.some(file => file.contract === ref.contract && refEqual(file, ref)), 'input not in producer artifacts');
      }
    }
  }
  if (required.candidate_scope.length) {
    const candidate = readJson(root, dispatch.candidate.ref);
    requireThat(same(candidate.scope, dispatch.candidate.scope) && same(candidate.files, dispatch.candidate.files)
      && (candidate.commit ?? null) === (dispatch.candidate.commit ?? null), 'dispatch candidate mismatch');
    candidateFiles(root, candidate, required.candidate_scope);
    if (required.candidate_approval_required === true) requireThat(pairs.some(pair => same(pair.review.candidate?.scope, candidate.scope)
      && same(pair.review.candidate?.files, candidate.files) && (pair.review.candidate?.commit ?? null) === (candidate.commit ?? null)), 'candidate has no exact approved review');
  } else requireThat(stage.kind !== 'verification', 'verification candidate scope missing');
  unique(required.required_evidence, rule => rule.id, 'evidence requirements');
  unique(refs.evidence_refs, ref => ref.id, 'evidence references');
  for (const rule of required.required_evidence) {
    const ref = refs.evidence_refs.find(item => item.id === rule.id);
    requireThat(ref, 'required evidence missing: ' + rule.id);
    evidence(root, ref, rule, dispatch);
  }
  result.checks.push({ id: 'frozen-files-and-structural-joins', status: 'valid' });
  result.coverage = ['full-locked-asset-bytes', 'declared-input-producers', 'approval-reference-joins', 'declared-candidate-enumeration', 'required-evidence-structure'];
  if (request.operation !== 'verify-preflight') return;
  requireThat(stage.kind === 'verification' && dispatch.kind === 'stage', 'fast path requires verification stage');
  requireThat(pairs.some(pair => pair.approval.next_stage_authorized === true
    && pair.approval.authorized_steps?.includes(dispatch.step_id)), 'continuation not authorized');
  const qaProducer = Object.values(node.bindings).flat().some(producer => {
    const producerNode = lock.workflow.nodes.find(item => item.step_id === producer);
    const producerStage = lock.stages.find(item => item.id === producerNode?.stage_id);
    return producerStage?.outputs.some(output => output.template === 'core:templates/collaboration/test-run.json')
      || Boolean(lock.collaboration && producerStage?.kind === 'analysis' && producerStage.inputs.includes('implementation')
        && producerStage.outputs.some(output => output.contract === 'analysis'));
  });
  requireThat(!qaProducer || required.qa_required === true, 'QA prerequisite omitted');
  if (required.qa_required) requireThat(required.required_evidence.some(rule => rule.id === 'qa' && rule.require_checks), 'QA evidence requirement missing');
  unique(refs.gate_baselines, item => item.kind, 'Gate baselines');
  for (const kind of ['architecture', 'quality']) {
    requireThat(required.gate_baselines?.includes(kind), 'Gate baseline requirement missing');
    const baseline = refs.gate_baselines.find(item => item.kind === kind);
    requireThat(baseline, 'missing Gate: ' + kind);
    readRef(root, baseline.ref);
    requireThat(pairs.some(pair => pair.review.files?.some(file => reviewFileMatches(root, pair, file, baseline.ref))), 'Gate baseline is not in approved review');
  }
  const bindingIds = lock.delivery?.steps?.find(step => step.step_id === dispatch.step_id)?.binding_ids ?? [];
  for (const bindingId of bindingIds) {
    const rule = required.required_evidence.find(item => item.id === 'pipeline:' + bindingId);
    requireThat(rule, 'pipeline evidence requirement missing');
    const report = readJson(root, refs.evidence_refs.find(item => item.id === rule.id));
    requireThat(report.binding_id === bindingId && report.status === 'PASS'
      && report.collection_status === 'complete', 'pipeline still pending or incomplete');
  }
  requireThat(nonempty(request.invocation_id), 'current invocation identity missing');
  if (!request.host_receipt_ref) {
    result.verify.reasons.push('Current host confirmation is required; helper checks do not authenticate authority.');
    return;
  }
  const host = readJson(root, request.host_receipt_ref);
  requireThat(host.schema_version === 1 && host.invocation_id === request.invocation_id, 'stale host invocation');
  requireThat(host.work_id === dispatch.work_id && host.step_id === dispatch.step_id && host.revision === dispatch.revision
    && refEqual(host.dispatch_ref, request.dispatch_ref) && refEqual(host.candidate_ref, dispatch.candidate.ref), 'host receipt identity mismatch');
  requireThat(Number.isFinite(Date.parse(host.observed_at)) && Date.now() - Date.parse(host.observed_at) >= 0
    && Date.now() - Date.parse(host.observed_at) <= 60_000, 'host receipt is not current');
  unique(host.checks, check => check.id, 'host checks');
  for (const id of hostChecks) {
    const check = host.checks.find(item => item.id === id);
    requireThat(check?.status === 'confirmed' && check.source_refs?.length > 0, 'host confirmation missing: ' + id);
    for (const ref of check.source_refs) readRef(root, ref);
  }
  result.verify = { eligible: true, mode: 'direct', reasons: [], host_attested: true };
}

export function validateWork(root, request) {
  const result = { schema_version: 1, status: 'blocked', checks: [], blockers: [], coverage: [],
    verify: { eligible: false, mode: 'fallback', reasons: [] }, required_host_checks: hostChecks,
    limitations: 'Structural checks only; host authenticates current identity, permission, revocation, selected conditional branches, semantic completeness and actual execution. No approval or Gate PASS.' };
  try {
    inspect(rootPath(root), request, result);
    result.status = 'valid';
  } catch (error) {
    result.blockers.push(error.message);
    result.verify = { eligible: false, mode: 'blocked', reasons: [error.message] };
  }
  return result;
}
export const preflightVerify = (root, request) => validateWork(root, { ...request, operation: 'verify-preflight' });

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let result;
  try {
    requireThat(process.argv.length === 4, 'Usage: node validate-work.mjs PROJECT_ROOT REQUEST_RELATIVE_PATH');
    const root = rootPath(process.argv[2]);
    const request = parseJson(readFileSync(safePath(root, process.argv[3]), 'utf8'), process.argv[3]);
    result = validateWork(root, request);
  } catch (error) {
    result = { schema_version: 1, status: 'blocked', blockers: [error.message] };
  }
  process.stdout.write(JSON.stringify(result) + '\n');
  process.exitCode = result.status === 'blocked' ? 1 : 0;
}
