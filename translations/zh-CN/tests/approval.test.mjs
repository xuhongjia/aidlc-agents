// Synthetic policy/record tests, not real human approval or host-agent behavior.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { digest, normalizeBuiltins, validateVerification, readyNodes } from './support/workflow-model.mjs';
import { delegationTerms, decisionMode, feedbackLimit, reserveCorrection, assertFeedbackDispatch, checkpointContinuation } from './support/approval-model.mjs';

const json = file => JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));
const core = normalizeBuiltins(json('workflow/stages.json'), json('workflow/stage-contracts.json'), json('manifest.json').version);
const reference = (path, content = path) => ({ path, sha256: digest(content) });
const copy = value => structuredClone(value);
const command = { command: 'node --test test/change.mjs', cwd: '.', entrypoint_refs: [reference('test/change.mjs')], resources: [], side_effects: ['local-check'], timeout_seconds: 30 };

function sign(context) {
  context.card = { terms: delegationTerms(context.policy), statement: 'SYNTHETIC: authorize these exact terms' };
  context.policy.authorization = { by: 'synthetic-human', source: 'user', at: 'synthetic-time',
    user_statement: context.card.statement, card_ref: reference('policies/card.md', context.card) };
  context.policy_ref = reference('policies/policy.json', context.policy);
  return context;
}

function fixture(id = 'enhance', mode = 'checkpoint_low_risk') {
  const workflow = copy(core.workflows.find(item => item.id === `core.${id}`));
  const context = { work_id: 'synthetic-work', workflow_ref: reference('workflow.lock.json'), method_revision: 'synthetic-method',
    request_sha256: digest('request'), identity_current: true, risk: 'low', blockers: [], core,
    changed_paths: ['src/tasks.mjs'], commands: [copy(command)], candidate: reference('candidate'), current_candidate: reference('candidate'),
    core_assets: [reference('core:prompts/implement.md')], locked_assets: [reference('core:prompts/implement.md')],
    kind: 'stage', revision: 1, authority_valid: true, candidate_review_exists: false,
    worker_stopped: true, history_complete: true, attempt_digests: [], next_run_id: 'correction-1', now: 'synthetic-time',
    protected_refs: [reference('test/change.mjs'), reference('checks/architecture.mjs')],
    current_protected_refs: [reference('test/change.mjs'), reference('checks/architecture.mjs')],
    checks: ['dev-self-test', 'architecture', 'quality'].map(check_id => ({ check_id, blocking: true, command: copy(command),
      candidate_sha256: digest('candidate'), status: 'PASS', exit_code: 0, executed_count: 3, skipped_count: 0,
      raw_evidence: [reference(`evidence/${check_id}.log`)] })) };
  context.entry_approval = { work_id: context.work_id, workflow_ref: context.workflow_ref, step_id: workflow.entry,
    decision: 'approved', approval_mode: 'manual', by: 'synthetic-human', user_statement: 'SYNTHETIC approval', review_digest: digest('entry') };
  context.policy = { ...json('templates/work/approval-policy.json'), policy_id: 'synthetic-policy', mode,
    work_id: context.work_id, workflow_ref: context.workflow_ref, method_revision: context.method_revision, request_sha256: context.request_sha256,
    allowed_steps: mode === 'auto_low_risk' ? workflow.nodes.map(node => node.step_id) : ['implement'], auto_continue: true,
    allowed_write_paths: ['src'], allowed_commands: [copy(command)],
    entry_review_ref: reference('reviews/entry/review.json', 'entry'), entry_approval_ref: reference('approvals/entry.json', context.entry_approval) };
  sign(context);
  return { workflow, stages: copy(core.stages), context };
}

function feedbackFixture(mode = 'checkpoint_low_risk') {
  const f = fixture('fix', mode);
  f.context.policy.implementation_feedback = { step_id: 'implement', revision: 1, max_correction_rounds: 2 };
  sign(f.context);
  f.request = { failure_kind: 'introduced_regression', status: 'FAIL', failure_result_ref: reference('runs/initial/result.json'),
    failure_refs: [reference('runs/initial/evidence/failure.log')], cause_evidence_refs: [reference('runs/initial/evidence/cause.md')],
    candidate: f.context.current_candidate, proposed_write_paths: ['src/tasks.mjs'], commands: [copy(command)] };
  return f;
}

const decision = f => decisionMode(f.workflow, f.stages, 'implement', f.context);
const reserve = (f, attempts = []) => reserveCorrection(f.workflow, f.stages, 'implement', f.context, attempts, f.request);

test('checkpoint keeps three nodes but only the middle candidate is delegated', () => {
  for (const id of ['fix', 'enhance']) {
    const f = fixture(id);
    assert.equal(decisionMode(f.workflow, f.stages, f.workflow.entry, f.context), 'manual');
    assert.equal(decision(f), 'checkpoint_low_risk');
    assert.equal(decisionMode(f.workflow, f.stages, 'verify', f.context), 'manual');
    assert.equal(f.workflow.nodes.length, 3);
  }
});

test('manual remains manual; auto_low_risk remains an explicit distinct option', () => {
  assert.equal(decision(fixture('enhance', 'manual')), 'manual');
  assert.equal(decision(fixture('enhance', 'auto_low_risk')), 'auto_low_risk');
  const f = fixture(); f.context.policy = null;
  assert.equal(decision(f), 'manual');
});

test('checkpoint continuation dispatches Verify without delegating its approval and respects stop mode', () => {
  const f = fixture();
  assert.deepEqual(f.context.policy.allowed_steps, ['implement']);
  const targets = checkpointContinuation(f.workflow, f.stages, f.context);
  assert.deepEqual(targets, ['verify']);
  assert.deepEqual(readyNodes(f.workflow, f.stages, {approved: [f.workflow.entry, 'implement']}).ready, targets);
  assert.equal(decisionMode(f.workflow, f.stages, 'verify', f.context), 'manual');
  f.context.policy.auto_continue = false; sign(f.context);
  assert.deepEqual(checkpointContinuation(f.workflow, f.stages, f.context), []);
  f.context.revoked = true;
  assert.throws(() => checkpointContinuation(f.workflow, f.stages, f.context));
});

test('checkpoint rejects missing initial grant, manual entry approval, and expanded card terms', () => {
  for (const alter of [
    f => { f.context.policy.authorization = null; },
    f => { f.context.entry_approval = null; },
    f => { f.context.entry_approval.approval_mode = 'auto_low_risk'; },
    f => { f.context.policy.allowed_write_paths.push('other'); },
    f => { f.context.policy.allowed_steps.push('verify'); sign(f.context); },
  ]) { const f = fixture(); alter(f); assert.throws(() => decision(f)); }
});

test('checkpoint is denied for overridden graphs, stages, assets and standard', () => {
  for (const alter of [
    f => { f.workflow.id = 'team.short'; },
    f => { f.workflow.nodes[1].outputs = [{ name: 'custom.md', contract: 'implementation', template: 'team:custom.md' }]; },
    f => { f.stages.find(stage => stage.id === 'core.implement').prompt = 'team:custom.md'; },
    f => { f.context.locked_assets[0].sha256 = digest('modified'); },
    f => { f.workflow = copy(core.workflows.find(item => item.id === 'core.standard')); },
  ]) { const f = fixture(); alter(f); assert.throws(() => decision(f)); }
});

test('delegated candidate requires current identity, risk, grant, graph and candidate', () => {
  for (const alter of [
    f => { f.context.revoked = true; },
    f => { f.context.identity_current = false; },
    f => { f.context.risk = 'high'; },
    f => { f.context.workflow_ref = reference('new.lock.json'); },
    f => { f.context.current_candidate = reference('drifted'); },
    f => { f.context.blockers = ['missing evidence']; },
    f => { f.context.changed_paths = ['../outside']; },
    f => { f.context.commands[0].side_effects = ['network-write']; },
  ]) { const f = fixture(); alter(f); assert.throws(() => decision(f)); }
});

test('PASS text, zero tests and failed DEV checks cannot release a checkpoint candidate', () => {
  for (const mutate of [c => { c.status = 'FAIL'; }, c => { c.executed_count = 0; },
    c => { c.raw_evidence = []; }, c => { c.skipped_count = 1; }, c => { c.candidate_sha256 = digest('old'); }]) {
    const f = fixture(); mutate(f.context.checks[0]); assert.throws(() => decision(f));
  }
  const f = fixture(); f.context.checks = []; assert.throws(() => decision(f));
  for (const id of ['architecture', 'quality']) {
    const f = fixture(); f.context.checks = f.context.checks.filter(check => check.check_id !== id);
    assert.throws(() => decision(f), /required DEV or Gate/);
  }
});

test('old grants and blank templates carry zero correction rounds', () => {
  assert.equal(feedbackLimit(json('templates/work/approval-policy.json')), 0);
  assert.equal(feedbackLimit({ schema_version: 2, implementation_feedback: { max_correction_rounds: 2 } }), 0);
  assert.equal(feedbackLimit({ schema_version: 3, implementation_feedback: { max_correction_rounds: 100 } }), 0);
  assert.equal(feedbackLimit(undefined), 0);
  const f = feedbackFixture(); f.context.policy.schema_version = 2; assert.throws(() => reserve(f));
});

test('feedback authorization is independent of all three approval modes', () => {
  for (const mode of ['manual', 'checkpoint_low_risk', 'auto_low_risk']) {
    const f = feedbackFixture(mode); assert.equal(reserve(f).round, 1);
    f.context.policy.implementation_feedback.max_correction_rounds = 0; sign(f.context);
    assert.throws(() => reserve(f), /budget/);
  }
});

test('two reservations exhaust budget across serialized sessions and policy IDs', () => {
  const f = feedbackFixture();
  const first = reserve(f);
  const attempts = JSON.parse(JSON.stringify([first]));
  f.context.attempt_digests = attempts.map(digest);
  f.context.next_run_id = 'correction-2';
  f.context.policy.policy_id = 'synthetic-new-policy'; sign(f.context);
  f.request.failure_result_ref = reference('runs/correction-1/result.json');
  attempts.push(reserve(f, attempts));
  assert.deepEqual(attempts.map(item => item.round), [1, 2]);
  f.context.attempt_digests = attempts.map(digest); f.context.next_run_id = 'correction-3';
  f.request.failure_result_ref = reference('runs/correction-2/result.json');
  assert.throws(() => reserve(f, attempts), /budget exhausted/);
});

test('missing ledger entries, reused failures and unknown worker state cannot restart budget', () => {
  const f = feedbackFixture(); const first = reserve(f); f.context.attempt_digests = [digest(first)];
  assert.throws(() => reserve(f), /ledger/);
  assert.throws(() => reserve(f, [first]), /already reserved/);
  const changed = copy(first); changed.round = 2;
  assert.throws(() => reserve(f, [changed]), /ledger/);
  f.context.worker_stopped = false;
  assert.throws(() => reserve(f, [first]), /worker/);
});

test('formal Verify failures, frozen candidates, leaves and high risk never enter feedback', () => {
  for (const alter of [
    f => { f.context.candidate_review_exists = true; },
    f => { f.context.kind = 'leaf'; },
    f => { f.context.risk = 'high'; },
    f => { f.context.authority_valid = false; },
    f => { f.context.policy.implementation_feedback.revision = 2; sign(f.context); },
  ]) { const f = feedbackFixture(); alter(f); assert.throws(() => reserve(f)); }
  const f = feedbackFixture();
  assert.throws(() => reserveCorrection(f.workflow, f.stages, 'verify', f.context, [], f.request), /eligible/);
  assert.throws(() => validateVerification({ gates: [] }, { digest: 'candidate' }), /candidate/);
});

test('protected tests/Oracle, command side effects, missing evidence and unknown causes stop correction', () => {
  for (const alter of [
    f => { f.context.current_protected_refs[0].sha256 = digest('weakened'); },
    f => { f.request.proposed_write_paths = ['test/change.mjs']; f.context.policy.allowed_write_paths.push('test'); sign(f.context); },
    f => { f.request.proposed_write_paths = ['test']; f.context.policy.allowed_write_paths.push('test'); sign(f.context); },
    f => { f.request.commands[0].side_effects = ['network-write']; f.context.policy.allowed_commands = copy(f.request.commands); sign(f.context); },
    f => { f.request.failure_refs = []; },
    f => { f.request.failure_kind = 'environment'; },
    f => { f.request.failure_kind = 'unknown'; },
    f => { f.context.revoked = true; },
  ]) { const f = feedbackFixture(); alter(f); assert.throws(() => reserve(f)); }
});

test('expected pre-fix red and approved negative-control evidence consume no correction reservation', () => {
  for (const kind of ['expected_pre_fix_red', 'expected_negative_control']) {
    const f = feedbackFixture(); f.request.failure_kind = kind;
    const attempts = []; assert.throws(() => reserve(f, attempts), /proven implementation regression/);
    assert.equal(attempts.length, 0);
  }
});

test('checkpoint/feedback never imply knowledge publication or an external operation grant', () => {
  const f = feedbackFixture();
  assert.equal(f.context.policy.knowledge_publish, null);
  assert.deepEqual(f.context.policy.allowed_tool_bindings, []);
  assert.equal(decision(f), 'checkpoint_low_risk');
  reserve(f);
  assert.equal(f.context.policy.knowledge_publish, null);
});

test('a continuation dispatch must bind the exact reservation, budget and unconsumed run', () => {
  const f = feedbackFixture(); const attempt = reserve(f);
  f.context.attempt_digests = [digest(attempt)];
  const packet = { work_id: attempt.work_id, method_revision: attempt.method_revision,
    run_id: attempt.run_id, step_id: attempt.step_id, revision: attempt.revision,
    workflow_ref: attempt.workflow_ref, candidate: attempt.input_candidate,
    implementation_feedback: { policy_ref: f.context.policy_ref, max_correction_rounds: 2, round: 1,
      attempt_refs: [reference('feedback/implement-r1/round-1.json', attempt)] } };
  assert.equal(assertFeedbackDispatch(f.context, [attempt], packet), true);
  for (const mutate of [p => { p.run_id = 'another-worker'; }, p => { p.implementation_feedback.round = 0; },
    p => { p.implementation_feedback.attempt_refs = []; }, p => { p.implementation_feedback.max_correction_rounds = 20; },
    p => { p.work_id = 'other-work'; }, p => { p.method_revision = 'other-method'; }]) {
    const changed = copy(packet); mutate(changed); assert.throws(() => assertFeedbackDispatch(f.context, [attempt], changed));
  }
  f.context.run_already_started = true;
  assert.throws(() => assertFeedbackDispatch(f.context, [attempt], packet), /already started/);
});

test('full auto cannot replace final Gate evidence with DEV checks', () => {
  const f = fixture('enhance', 'auto_low_risk');
  assert.throws(() => decisionMode(f.workflow, f.stages, 'verify', f.context), /verification candidate missing/);
});
