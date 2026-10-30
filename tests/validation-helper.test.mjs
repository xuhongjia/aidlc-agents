import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { validateWork, preflightVerify } from '../helpers/validate-work.mjs';

const hash = body => createHash('sha256').update(body).digest('hex');
const helper = fileURLToPath(new URL('../helpers/validate-work.mjs', import.meta.url));
function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'aidlc-validation-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const put = (name, value) => {
    const body = typeof value === 'string' ? value : JSON.stringify(value);
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    writeFileSync(path.join(root, name), body);
    return { path: name, sha256: hash(body) };
  };
  const source = put('src/index.js', 'export const answer = 42;\n');
  const candidate = { scope: ['src'], files: [source], commit: null };
  const candidateRef = put('work/candidate.json', candidate);
  const rules = ['architecture', 'quality'].map(kind => ({ kind, ref: put(`work/${kind}.md`, `${kind} approved rule`) }));
  const requirement = { step_id: 'verify', candidate_scope: ['src'], required_inputs: ['implementation', 'analysis'],
    approval_roles: ['technical'], required_evidence: [{ id: 'qa', require_checks: true }],
    gate_baselines: ['architecture', 'quality'], qa_required: true, candidate_approval_required: true };
  const requirements = { schema_version: 1, steps: [requirement] };
  const requirementsRef = put('work/requirements.json', requirements);
  const instruction = { ...put('work/frozen/instruction.md', 'Frozen method'), ref: 'core:workflow/worker.md' };
  const stageAssets = ['agents/qe.md', 'prompts/verify.md', 'templates/verify/verification.md'].map(name =>
    ({ ...put('work/frozen/' + name, 'Frozen ' + name), ref: 'core:' + name }));
  const context = { contract_version: 1, common: ['workflow/worker.md'], by_kind: {}, by_capability: {}, by_output_contract: {},
    pipeline_execution: [], pipeline_adapters: { gitlab: 'adapters/delivery/gitlab.md' } };
  const contextAsset = { ...put('work/frozen/context.json', context), ref: 'core:workflow/context.json' };
  const pipelineAsset = { ...put('work/frozen/pipeline.md', 'Frozen pipeline'), ref: 'core:adapters/delivery/gitlab.md' };
  const lock = { contract_version: 1, work_id: 'REQ-1', workflow: { nodes: [
    { step_id: 'implement', stage_id: 'core.implement', bindings: {} },
    { step_id: 'qa', stage_id: 'team.qa', bindings: {} },
    { step_id: 'verify', stage_id: 'core.verify', bindings: { implementation: ['implement'], analysis: ['qa'] } }
  ] }, stages: [
    { id: 'core.implement', kind: 'implementation', inputs: [], outputs: [] },
    { id: 'team.qa', kind: 'analysis', inputs: ['implementation'], outputs: [{ contract: 'analysis', template: 'core:templates/collaboration/test-run.json' }] },
    { id: 'core.verify', kind: 'verification', inputs: ['implementation', 'analysis'], role: 'core:agents/qe.md',
      prompt: 'core:prompts/verify.md', outputs: [{ contract: 'verification', template: 'core:templates/verify/verification.md' }] }
  ], assets: [instruction, ...stageAssets, contextAsset, pipelineAsset], execution: { contract_version: 1, validation_ref: requirementsRef }, delivery: null };
  let lockRef = put('work/lock.json', lock);
  const review = { work_id: 'REQ-1', workflow_ref: lockRef, step_id: 'implement', stage_id: 'core.implement',
    revision: 1, candidate, files: [...rules.map(item => item.ref), candidateRef] };
  let reviewRef = put('work/review.json', review);
  const approval = { ...review, candidate: undefined, files: undefined, decision: 'approved', review_digest: reviewRef.sha256,
    authorized_steps: ['verify'], next_stage_authorized: true, by: 'synthetic-only', at: new Date().toISOString() };
  let approvalRef = put('work/approval.json', approval);
  const raw = put('work/raw.txt', 'Synthetic fixture: observed 1 passing assertion.');
  const report = { work_id: 'REQ-1', workflow_ref: lockRef, candidate_ref: candidateRef, complete: true, truncated: false,
    raw_refs: [raw], checks: [{ id: 'case-1', executed_count: 1, status: 'PASS', raw_ref: raw }] };
  let qaRef = put('work/qa.json', report);
  const qaResult = { work_id: 'REQ-1', workflow_ref: lockRef, step_id: 'qa', stage_id: 'team.qa', run_id: 'qa-1',
    status: 'ready_for_review', artifacts: [{ ...qaRef, contract: 'analysis' }] };
  let qaResultRef = put('work/qa-result.json', qaResult);
  const dispatch = { schema_version: 5, work_id: 'REQ-1', workflow_ref: lockRef, step_id: 'verify', stage_id: 'core.verify',
    stage_kind: 'verification', run_id: 'verify-1', kind: 'stage', revision: 1,
    input_bindings: lock.workflow.nodes[2].bindings, instruction_refs: [instruction, ...stageAssets], optional_instruction_refs: [],
    input_refs: [candidateRef, qaRef], candidate: { ...candidate, ref: candidateRef },
    execution: { validation: { input_refs: [
      { ...candidateRef, contract: 'implementation', producer_step_id: 'implement' },
      { ...qaRef, contract: 'analysis', producer_step_id: 'qa', producer_result_ref: qaResultRef }
    ], approval_pairs: [{ role: 'technical', review_ref: reviewRef, approval_ref: approvalRef }],
    evidence_refs: [{ ...qaRef, id: 'qa' }], gate_baselines: rules } } };
  let dispatchRef = put('work/dispatch.json', dispatch);
  const host = { schema_version: 1, invocation_id: 'invocation-1', work_id: 'REQ-1', step_id: 'verify', revision: 1,
    dispatch_ref: dispatchRef, candidate_ref: candidateRef, observed_at: new Date().toISOString(),
    checks: ['authority', 'revocation', 'candidate_scope', 'input_approvals', 'semantic_requirements']
      .map(id => ({ id, status: 'confirmed', source_refs: [approvalRef, raw] })) };
  const request = { schema_version: 1, operation: 'verify-preflight', invocation_id: host.invocation_id,
    dispatch_ref: dispatchRef, host_receipt_ref: put('work/host.json', host) };
  // Re-sign synthetic test fixtures only; these functions are never approval/runtime tools.
  const saveDispatch = () => {
    dispatchRef = put('work/dispatch.json', dispatch); request.dispatch_ref = dispatchRef;
    host.dispatch_ref = dispatchRef; host.observed_at = new Date().toISOString();
    request.host_receipt_ref = put('work/host.json', host);
  };
  const saveReport = () => {
    qaRef = put('work/qa.json', report); dispatch.input_refs[1] = qaRef;
    qaResult.workflow_ref = lockRef; qaResult.artifacts = [{ ...qaRef, contract: 'analysis' }];
    qaResultRef = put('work/qa-result.json', qaResult);
    dispatch.execution.validation.input_refs[1] = { ...qaRef, contract: 'analysis', producer_step_id: 'qa', producer_result_ref: qaResultRef };
    dispatch.execution.validation.evidence_refs[0] = { ...qaRef, id: 'qa' }; saveDispatch();
  };
  const saveApproval = () => {
    reviewRef = put('work/review.json', review); approval.review_digest = reviewRef.sha256;
    approvalRef = put('work/approval.json', approval);
    dispatch.execution.validation.approval_pairs[0] = { role: 'technical', review_ref: reviewRef, approval_ref: approvalRef };
    for (const check of host.checks) check.source_refs = [approvalRef, raw]; saveDispatch();
  };
  const saveLock = () => {
    lock.execution.validation_ref = put('work/requirements.json', requirements);
    lockRef = put('work/lock.json', lock); dispatch.workflow_ref = review.workflow_ref = approval.workflow_ref = report.workflow_ref = lockRef;
    saveReport(); saveApproval();
  };
  return { root, put, request, dispatch, lock, requirements, requirement, review, approval, report, host, raw, pipelineAsset,
    saveDispatch, saveReport, saveApproval, saveLock };
}

test('actual frozen files and approved joins allow structural fast-path eligibility without granting a Gate PASS', t => {
  const f = fixture(t), result = preflightVerify(f.root, f.request);
  assert.equal(result.status, 'valid', JSON.stringify(result));
  assert.equal(result.verify.eligible, true);
  assert.equal(result.verify.mode, 'direct');
  assert.match(result.limitations, /No approval or Gate PASS/);
  assert.ok(result.required_host_checks.includes('revocation'));
});

test('missing host attestation retains collector fallback; stale or revoked attestation blocks', t => {
  const f = fixture(t);
  assert.equal(preflightVerify(f.root, { ...f.request, host_receipt_ref: null }).verify.mode, 'fallback');
  f.host.invocation_id = 'old'; f.request.host_receipt_ref = f.put('work/host.json', f.host);
  assert.match(preflightVerify(f.root, f.request).blockers[0], /invocation/);
  f.host.invocation_id = f.request.invocation_id; f.host.checks[1].status = 'revoked';
  f.request.host_receipt_ref = f.put('work/host.json', f.host);
  assert.match(preflightVerify(f.root, f.request).blockers[0], /revocation/);
  f.host.checks[1].status = 'confirmed'; f.host.observed_at = '2020-01-01T00:00:00Z';
  f.request.host_receipt_ref = f.put('work/host.json', f.host);
  assert.match(preflightVerify(f.root, f.request).blockers[0], /not current/);
});

test('tampering any frozen asset blocks even when selected instructions are unchanged', t => {
  const f = fixture(t);
  f.lock.assets.push({ ...f.put('work/unused.md', 'optional but frozen'), ref: 'core:optional.md' }); f.saveLock();
  f.put('work/unused.md', 'changed');
  assert.match(validateWork(f.root, f.request).blockers[0], /digest mismatch/);
});

test('empty or incomplete mandatory instructions and unknown stage kinds block', t => {
  const f = fixture(t), original = [...f.dispatch.instruction_refs];
  f.dispatch.instruction_refs = []; f.saveDispatch();
  assert.match(validateWork(f.root, f.request).blockers[0], /mandatory instruction set/);
  f.dispatch.instruction_refs = original.slice(1); f.saveDispatch();
  assert.match(validateWork(f.root, f.request).blockers[0], /mandatory instruction set/);
  f.dispatch.instruction_refs = original;
  f.dispatch.stage_kind = f.lock.stages[2].kind = 'made-up'; f.saveLock();
  assert.match(validateWork(f.root, f.request).blockers[0], /unknown stage kind/);
});

test('unsafe paths, project symlinks and candidate symlinks are rejected without reading outside', t => {
  const f = fixture(t);
  for (const name of ['../outside', '/etc/passwd', 'work/../dispatch.json', 'work\\dispatch.json']) {
    const result = validateWork(f.root, { ...f.request, dispatch_ref: { ...f.request.dispatch_ref, path: name } });
    assert.equal(result.status, 'blocked'); assert.match(result.blockers[0], /unsafe relative path/);
  }
  symlinkSync(path.join(f.root, 'src/index.js'), path.join(f.root, 'src/alias.js'));
  assert.match(validateWork(f.root, f.request).blockers[0], /symlink/);
  symlinkSync(f.root, path.join(f.root, 'alias-root'));
  assert.match(validateWork(path.join(f.root, 'alias-root'), f.request).blockers[0], /unsafe project root/);
});

test('candidate enumeration detects additions, deletions, edits and narrowed scope', t => {
  const f = fixture(t);
  f.put('src/untracked.js', 'new');
  assert.match(validateWork(f.root, f.request).blockers[0], /enumeration/);
  rmSync(path.join(f.root, 'src/untracked.js')); rmSync(path.join(f.root, 'src/index.js'));
  assert.equal(validateWork(f.root, f.request).status, 'blocked');
  f.put('src/index.js', 'changed'); assert.match(validateWork(f.root, f.request).blockers[0], /digest mismatch/);
  f.put('src/index.js', 'export const answer = 42;\n');
  f.requirement.candidate_scope = ['src/index.js']; f.saveLock();
  assert.match(validateWork(f.root, f.request).blockers[0], /scope mismatch/);
});

test('approval joins reject stale revisions and unapproved candidate replacements', t => {
  const f = fixture(t);
  f.approval.revision = 2; f.saveApproval();
  assert.match(validateWork(f.root, f.request).blockers[0], /revision mismatch/);
  f.approval.revision = 1; f.review.candidate = { scope: ['src'], files: [] }; f.saveApproval();
  assert.match(validateWork(f.root, f.request).blockers[0], /exact approved review/);
});

test('unrelated approval identities and candidate-bound commit mismatches are rejected', t => {
  const f = fixture(t);
  f.review.step_id = f.approval.step_id = 'not-in-graph'; f.saveApproval();
  assert.match(validateWork(f.root, f.request).blockers[0], /locked ancestor/);
  f.review.step_id = f.approval.step_id = 'implement'; f.review.candidate.commit = 'a'.repeat(40); f.saveApproval();
  assert.match(validateWork(f.root, f.request).blockers[0], /exact approved review/);
});

test('candidate-bound approval accepts missing non-Git commit but not an unmatched real commit', t => {
  const f = fixture(t);
  delete f.review.candidate.commit; f.saveApproval();
  assert.equal(preflightVerify(f.root, f.request).verify.eligible, true);
  f.review.candidate.commit = 'b'.repeat(40); f.saveApproval();
  assert.match(preflightVerify(f.root, f.request).blockers[0], /exact approved review/);
});

test('canonical promoted review artifacts resolve relative to review directory', t => {
  const f = fixture(t), directory = 'work/reviews/implement/r1';
  const artifacts = f.review.files.map(file => f.put(directory + '/' + path.basename(file.path),
    readFileSync(path.join(f.root, file.path), 'utf8')));
  f.review.files = artifacts.map(file => ({ path: path.basename(file.path), sha256: file.sha256 }));
  f.dispatch.input_refs[0] = artifacts[2];
  Object.assign(f.dispatch.execution.validation.input_refs[0], artifacts[2]);
  f.dispatch.execution.validation.gate_baselines.forEach((baseline, index) => { baseline.ref = artifacts[index]; });
  const savePromoted = () => {
    const reviewRef = f.put(directory + '/review.json', f.review);
    f.approval.review_digest = reviewRef.sha256;
    const approvalRef = f.put('work/approval.json', f.approval);
    f.dispatch.execution.validation.approval_pairs[0] = { role: 'technical', review_ref: reviewRef, approval_ref: approvalRef };
    for (const check of f.host.checks) check.source_refs[0] = approvalRef;
    f.saveDispatch();
  };
  savePromoted();
  assert.equal(preflightVerify(f.root, f.request).verify.eligible, true);
  f.review.files[0].path = '../architecture.md'; savePromoted();
  assert.match(preflightVerify(f.root, f.request).blockers[0], /unsafe relative path/);
  f.review.files[0].path = 'architecture.md'; savePromoted();
  rmSync(path.join(f.root, artifacts[0].path));
  symlinkSync(path.join(f.root, 'work/architecture.md'), path.join(f.root, artifacts[0].path));
  assert.match(preflightVerify(f.root, f.request).blockers[0], /symlink/);
});

test('edge-only approval ancestry is structural and does not authorize disconnected nodes', t => {
  const f = fixture(t);
  f.lock.workflow.nodes.push({ step_id: 'review-only', stage_id: 'team.review-only', bindings: {} });
  f.lock.stages.push({ id: 'team.review-only', kind: 'quality_design', inputs: [], outputs: [] });
  f.lock.workflow.edges = [{ from: 'review-only', to: 'verify', when: { switch: 'route', case: 'selected' } }];
  f.requirement.approval_roles.push('quality-owner'); f.saveLock();
  const addApproval = () => {
    const review = { ...f.review, step_id: 'review-only', stage_id: 'team.review-only', candidate: { scope: [], files: [] } };
    const reviewRef = f.put('work/edge-review.json', review);
    const approvalRef = f.put('work/edge-approval.json', { ...f.approval, step_id: review.step_id, stage_id: review.stage_id,
      review_digest: reviewRef.sha256 });
    f.dispatch.execution.validation.approval_pairs[1] = { role: 'quality-owner', review_ref: reviewRef, approval_ref: approvalRef };
    f.saveDispatch();
  };
  addApproval();
  const accepted = preflightVerify(f.root, f.request);
  assert.equal(accepted.verify.eligible, true);
  assert.match(accepted.limitations, /selected conditional branches/);
  f.lock.workflow.edges = []; f.saveLock(); addApproval();
  assert.match(preflightVerify(f.root, f.request).blockers[0], /locked ancestor/);
});

test('approved entry authority can verify a newly frozen candidate without adding a candidate approval', t => {
  const f = fixture(t);
  f.lock.workflow.nodes.push({ step_id: 'plan', stage_id: 'core.plan', bindings: {} });
  f.lock.workflow.nodes[0].bindings = { plan: ['plan'] };
  f.lock.stages.push({ id: 'core.plan', kind: 'planning', inputs: [], outputs: [] });
  f.requirement.candidate_approval_required = false;
  f.review.step_id = f.approval.step_id = 'plan'; f.review.stage_id = f.approval.stage_id = 'core.plan';
  f.review.candidate = { scope: [], files: [] }; f.review.files = f.review.files.slice(0, 2); f.saveLock();
  const resultRef = f.put('work/implement-result.json', { work_id: 'REQ-1', workflow_ref: f.dispatch.workflow_ref,
    step_id: 'implement', stage_id: 'core.implement', run_id: 'implement-1', status: 'ready_for_review',
    artifacts: [{ ...f.dispatch.candidate.ref, contract: 'implementation' }] });
  f.dispatch.execution.validation.input_refs[0].producer_result_ref = resultRef; f.saveDispatch();
  assert.equal(preflightVerify(f.root, f.request).verify.eligible, true);
  f.approval.authorized_steps = ['implement']; f.saveApproval();
  assert.match(preflightVerify(f.root, f.request).blockers[0], /continuation/);
});

test('design approval need not authorize Verify but current candidate continuation must', t => {
  const f = fixture(t);
  f.lock.workflow.nodes.push({ step_id: 'design', stage_id: 'core.design', bindings: {} });
  f.lock.workflow.nodes[0].bindings = { architecture: ['design'] };
  f.lock.stages.push({ id: 'core.design', kind: 'design', inputs: [], outputs: [] });
  const baselineReview = { ...f.review, candidate: { scope: [], files: [] }, step_id: 'design', stage_id: 'core.design' };
  f.requirement.approval_roles.push('design'); f.saveLock();
  baselineReview.workflow_ref = f.dispatch.workflow_ref;
  const currentReview = f.put('work/design-review.json', baselineReview);
  const currentApproval = f.put('work/design-approval.json', { ...f.approval, step_id: 'design', stage_id: 'core.design', review_digest: currentReview.sha256,
    authorized_steps: ['implement'], next_stage_authorized: true });
  f.dispatch.execution.validation.approval_pairs.push({ role: 'design', review_ref: currentReview, approval_ref: currentApproval });
  f.saveDispatch();
  assert.equal(preflightVerify(f.root, f.request).verify.eligible, true);
  f.approval.next_stage_authorized = false; f.saveApproval();
  assert.match(preflightVerify(f.root, f.request).blockers[0], /continuation/);
});

test('required inputs cannot be removed by caller or relabeled from another producer', t => {
  const f = fixture(t);
  f.requirement.required_inputs.pop(); f.saveLock();
  assert.match(validateWork(f.root, f.request).blockers[0], /semantic input omitted/);
  f.requirement.required_inputs.push('analysis'); f.saveLock();
  f.dispatch.execution.validation.input_refs[1].producer_step_id = 'implement'; f.saveDispatch();
  assert.match(validateWork(f.root, f.request).blockers[0], /required input reference/);
});

test('a hash and producer label cannot substitute an unrelated QA artifact', t => {
  const f = fixture(t), replacement = f.put('work/unrelated.json', { message: 'not QA evidence' });
  f.dispatch.input_refs[1] = replacement;
  Object.assign(f.dispatch.execution.validation.input_refs[1], replacement); f.saveDispatch();
  assert.match(validateWork(f.root, f.request).blockers[0], /input not in producer artifacts/);
});

test('QA required by bound producer cannot be disabled; missing Gate design cannot fast-track', t => {
  const f = fixture(t);
  f.requirement.qa_required = false; f.saveLock();
  assert.match(preflightVerify(f.root, f.request).blockers[0], /QA prerequisite/);
  f.requirement.qa_required = true; f.saveLock();
  f.dispatch.execution.validation.gate_baselines.pop(); f.saveDispatch();
  assert.match(preflightVerify(f.root, f.request).blockers[0], /missing Gate/);
});

test('custom QA templates retain collaboration semantic requirements', t => {
  const f = fixture(t);
  f.lock.collaboration = { enabled: true };
  f.lock.stages[1].outputs[0].template = 'team:templates/custom-ui-check.md';
  f.requirement.qa_required = false; f.saveLock();
  assert.match(preflightVerify(f.root, f.request).blockers[0], /QA prerequisite/);
});

test('zero, skipped, incomplete, truncated, wrong-candidate and missing raw evidence cannot pass', t => {
  const f = fixture(t), original = structuredClone(f.report);
  for (const mutate of [
    r => { r.checks[0].executed_count = 0; },
    r => { r.checks[0].skipped = true; },
    r => { r.complete = false; },
    r => { r.truncated = true; },
    r => { r.candidate_ref = { path: 'other.json', sha256: 'a'.repeat(64) }; },
    r => { r.raw_refs = []; },
    r => { r.checks = []; }
  ]) {
    Object.assign(f.report, structuredClone(original)); mutate(f.report); f.saveReport();
    assert.equal(validateWork(f.root, f.request).status, 'blocked');
  }
});

test('configured pipeline cannot disappear behind a successful local preflight', t => {
  const f = fixture(t);
  f.lock.delivery = { steps: [{ step_id: 'verify', binding_ids: ['ci'] }], bindings: [{ id: 'ci', provider: 'gitlab' }] };
  f.dispatch.instruction_refs.push(f.pipelineAsset); f.saveLock();
  assert.match(preflightVerify(f.root, f.request).blockers[0], /pipeline evidence requirement/);
  f.requirement.required_evidence.push({ id: 'pipeline:ci', require_checks: true }); f.saveLock();
  assert.match(preflightVerify(f.root, f.request).blockers[0], /required evidence missing/);
  f.dispatch.execution.validation.evidence_refs.push({ ...f.put('work/pipeline.json', { ...f.report,
    binding_id: 'ci', status: 'pending', collection_status: 'complete' }), id: 'pipeline:ci' }); f.saveDispatch();
  assert.match(preflightVerify(f.root, f.request).blockers[0], /pipeline still pending/);
  f.dispatch.execution.validation.evidence_refs[1] = { ...f.put('work/pipeline.json', { ...f.report,
    binding_id: 'ci', status: 'PASS', collection_status: 'complete' }), id: 'pipeline:ci' }; f.saveDispatch();
  assert.equal(preflightVerify(f.root, f.request).verify.eligible, true);
});

function snapshot(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? snapshot(path.join(directory, entry.name), prefix + entry.name + '/')
    : [[prefix + entry.name, hash(readFileSync(path.join(directory, entry.name)))]]);
}
test('CLI is read-only JSON, preserves every file and returns nonzero on failure', t => {
  const f = fixture(t); f.put('request.json', f.request);
  const before = snapshot(f.root);
  const good = spawnSync(process.execPath, [helper, f.root, 'request.json'], { encoding: 'utf8' });
  assert.equal(good.status, 0, good.stderr); assert.equal(JSON.parse(good.stdout).verify.eligible, true);
  assert.deepEqual(snapshot(f.root), before);
  f.put('src/index.js', 'drift');
  const after = snapshot(f.root), bad = spawnSync(process.execPath, [helper, f.root, 'request.json'], { encoding: 'utf8' });
  assert.equal(bad.status, 1); assert.equal(JSON.parse(bad.stdout).status, 'blocked');
  assert.deepEqual(snapshot(f.root), after);
});

test('invalid JSON diagnostics do not return source contents', t => {
  const f = fixture(t), invalid = f.put('work/invalid.json', 'PRIVATE_TEST_CONTENT is not JSON');
  const result = validateWork(f.root, { ...f.request, dispatch_ref: invalid });
  assert.equal(result.status, 'blocked');
  assert.match(result.blockers[0], /invalid JSON/);
  assert.ok(!JSON.stringify(result).includes('PRIVATE_TEST_CONTENT'));
});
