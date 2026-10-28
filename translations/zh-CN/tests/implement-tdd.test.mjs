// Maintainer contracts, not real Agent approvals or a delivery runtime.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { normalizeBuiltins, validateVerification, digest } from './support/workflow-model.mjs';
import { instructionPlan, optionalInstructionPlan } from './support/context-model.mjs';
import { validateTddEvidence, validateHandoff } from './support/tdd-model.mjs';
const json = name => JSON.parse(readFileSync(new URL('../' + name, import.meta.url)));
const core = normalizeBuiltins(json('workflow/stages.json'), json('workflow/stage-contracts.json'), json('manifest.json').version);
const context = json('workflow/context.json');
const hash = body => createHash('sha256').update(body).digest('hex');

test('standard ends at verified implementation handoff, not automatic release or learning', () => {
  const workflow = core.workflows.find(w => w.id === 'core.standard');
  assert.deepEqual(workflow.nodes.map(n => n.step_id), ['intake', 'spec', 'architecture', 'quality', 'plan', 'implement', 'verify']);
  assert.deepEqual(workflow.terminals, [{ step_id: 'verify', outcome: 'verified' }]);
  assert.ok(core.stages.some(s => s.kind === 'release_readiness'));
  assert.ok(core.stages.some(s => s.kind === 'learning'));
});

test('only implementation dispatches load TDD and incremental execution skills', () => {
  for (const stage of core.stages) {
    const refs = instructionPlan(context, stage, {}).map(i => i.ref);
    for (const id of ['test-driven-development', 'incremental-implementation']) {
      assert.equal(refs.includes('core:skills/reusable-capability/' + id + '/SKILL.md'), stage.kind === 'implementation', stage.id);
    }
    assert.ok(!refs.some(ref => /skills\/(?:reusable-capability\/)?(debugging-and-error-recovery|code-review-and-quality)\//.test(ref)));
  }
});

export function tddFixture() {
  const raw_files = {};
  const record = (path, value) => {
    const body = JSON.stringify(value); raw_files[path] = Buffer.from(body);
    return { path, sha256: hash(body) };
  };
  const task = { id: 'TASK-1', requirements: ['FR-1'], ac_ids: ['AC-1'], behavior_change: true, oracle_ref: { path: 'approved-oracle.json', sha256: hash('approved oracle') }, test_ids: ['search-zero'], expected_values: { 'search-zero': 0 } };
  const run = (phase, status, sequence, candidate) => record(phase + '.json', {
    phase, command: 'node --test search.test.mjs', executed_count: 1, skipped_count: 0,
    exit_code: status === 'FAIL' ? 1 : 0, status, failure_kind: status === 'FAIL' ? 'behavior_assertion' : null,
    failed_test_ids: status === 'FAIL' ? ['search-zero'] : [], passed_test_ids: status === 'PASS' ? ['search-zero'] : [],
    sequence, snapshot_digest: candidate, oracle_digest: task.oracle_ref.sha256,
    assertions: [{ test_id: 'search-zero', expected: 0, actual: status === 'FAIL' ? 1 : 0 }],
    complete: true, truncated: false, environment: 'synthetic fixture', executed_at: '2026-10-11T01:00:00Z',
    work_id: 'work', lock_digest: 'locked', run_id: 'dev-run', actor: 'dev',
  });
  const ledger = { contract_version: '2.1', work_id: 'work', lock_digest: 'locked', run_id: 'dev-run', actor: 'dev',
    final_candidate_digest: 'final', slices: [{ task_id: task.id, requirements: task.requirements, ac_ids: task.ac_ids,
      oracle_ref: task.oracle_ref, test_ids: task.test_ids, red: run('RED', 'FAIL', 1, 'before'),
      green: run('GREEN', 'PASS', 2, 'slice'), refactor: { action: 'no_change', reason: 'No useful structural change in this slice', evidence_ref: run('REFACTOR', 'PASS', 3, 'slice') } }],
    exceptions: [], final_regression: record('final.json', { phase: 'FINAL', command: 'node --test search.test.mjs', status: 'PASS', exit_code: 0,
      executed_count: 1, skipped_count: 0, passed_test_ids: ['search-zero'], sequence: 4, snapshot_digest: 'final',
      assertions: [{ test_id: 'search-zero', expected: 0, actual: 0, oracle_digest: task.oracle_ref.sha256 }],
      work_id: 'work', lock_digest: 'locked', run_id: 'dev-run', actor: 'dev', complete: true, truncated: false,
      environment: 'synthetic fixture', executed_at: '2026-10-11T01:00:00Z' }) };
  const candidate = { work_id: 'work', lock_digest: 'locked', digest: 'final', implementation_runs: [{ run_id: 'dev-run', actor: 'dev' }] };
  return { ledger, candidate, options: { tasks: [task], raw_files, approved_commands: ['node --test search.test.mjs'] }, record };
}

test('a complete behavior-first slice and final regression are eligible for independent review, not approval', () => {
  const f = tddFixture();
  assert.equal(validateTddEvidence(f.ledger, f.candidate, f.options), true);
  assert.equal(Object.hasOwn(f.ledger, 'approval'), false);
});

test('environment failure, unrelated RED, altered Oracle, phase order, missing tasks and stale final candidate block TDD', () => {
  const mutateRaw = (f, ref, mutate) => {
    const raw = JSON.parse(f.options.raw_files[ref.path]); mutate(raw);
    Object.assign(ref, f.record(ref.path, raw));
  };
  for (const mutate of [
    f => mutateRaw(f, f.ledger.slices[0].red, r => { r.failure_kind = 'environment'; }),
    f => mutateRaw(f, f.ledger.slices[0].red, r => { r.status = 'PASS'; r.exit_code = 0; }),
    f => mutateRaw(f, f.ledger.slices[0].red, r => { r.failed_test_ids = ['other']; }),
    f => mutateRaw(f, f.ledger.slices[0].red, r => { r.assertions[0].expected = 100; }),
    f => mutateRaw(f, f.ledger.slices[0].green, r => { r.assertions[0].expected = 1; r.assertions[0].actual = 1; }),
    f => mutateRaw(f, f.ledger.slices[0].green, r => { r.oracle_digest = 'changed'; }),
    f => mutateRaw(f, f.ledger.slices[0].green, r => { r.sequence = 1; }),
    f => mutateRaw(f, f.ledger.slices[0].green, r => { r.executed_count = 0; }),
    f => mutateRaw(f, f.ledger.slices[0].green, r => { r.skipped_count = 1; }),
    f => mutateRaw(f, f.ledger.slices[0].green, r => { r.complete = false; }),
    f => mutateRaw(f, f.ledger.slices[0].refactor.evidence_ref, r => { r.status = 'FAIL'; }),
    f => mutateRaw(f, f.ledger.final_regression, r => { r.snapshot_digest = 'old'; }),
    f => mutateRaw(f, f.ledger.final_regression, r => { r.passed_test_ids = []; }),
    f => mutateRaw(f, f.ledger.final_regression, r => { r.assertions[0].expected = 1; r.assertions[0].actual = 1; }),
    f => { f.options.tasks.push({ ...f.options.tasks[0], id: 'unaccounted' }); },
    f => { f.ledger.slices[0].ac_ids = ['unapproved']; },
    f => { delete f.options.raw_files[f.ledger.slices[0].red.path]; },
    f => { f.options.raw_files[f.ledger.slices[0].green.path] = Buffer.from('truncated'); },
    f => { f.options.approved_commands = []; },
  ]) {
    const f = tddFixture(); mutate(f);
    assert.throws(() => validateTddEvidence(f.ledger, f.candidate, f.options));
  }
});

test('a documented behavior-free exception can use real alternative validation but cannot excuse behavior changes', () => {
  const f = tddFixture(); f.options.tasks[0].behavior_change = false; f.options.tasks[0].type = 'documentation';
  f.ledger.slices = [];
  const raw = JSON.parse(f.options.raw_files['final.json']); raw.phase = 'ALTERNATIVE'; raw.sequence = 1;
  f.ledger.exceptions = [{ task_id: 'TASK-1', reason: 'Only documentation text, no behavior change', validation_refs: [f.record('lint.json', raw)] }];
  assert.equal(validateTddEvidence(f.ledger, f.candidate, f.options), true);
  f.options.tasks[0].behavior_change = true;
  assert.throws(() => validateTddEvidence(f.ledger, f.candidate, f.options), /exception/);
  f.options.tasks[0].behavior_change = false; f.ledger.exceptions[0].reason = '';
  assert.throws(() => validateTddEvidence(f.ledger, f.candidate, f.options), /exception/);
});

test('optional engineering skills are frozen metadata, never upstream/Gate default instructions', () => {
  const stage = core.stages.find(s => s.kind === 'implementation');
  assert.deepEqual(optionalInstructionPlan(context, stage).map(r => r.id), ['debugging-and-error-recovery', 'code-review-and-quality']);
  for (const upstream of core.stages.filter(s => s.kind !== 'implementation')) {
    assert.deepEqual(optionalInstructionPlan(context, upstream), []);
  }
  const verifier = core.stages.find(s => s.kind === 'verification');
  for (const kind of ['architecture', 'quality']) {
    const refs = instructionPlan(context, verifier, {}, { leaf: 'gate-execution', gate_kind: kind }).map(r => r.ref);
    assert.ok(refs.includes('core:agents/' + kind + '-gate-reviewer.md'));
    assert.ok(refs.includes('core:prompts/gate-review.md'));
    assert.ok(!refs.includes(verifier.role)); assert.ok(!refs.includes(verifier.prompt));
    assert.ok(!refs.some(r => r.includes('/test-driven-development/')));
  }
  assert.throws(() => instructionPlan(context, verifier, {}, { leaf: 'gate-execution' }), /reviewer required/);
});

test('engineering execution Skills in flat or categorized layouts are forbidden outside Implement', () => {
  const names = ['test-driven-development', 'incremental-implementation', 'debugging-and-error-recovery', 'code-review-and-quality'];
  const verifier = core.stages.find(stage => stage.kind === 'verification');
  for (const namespace of ['core', 'team', 'project']) {
    for (const directory of ['skills/', 'skills/reusable-capability/']) {
      for (const name of names) {
        const ref = namespace + ':' + directory + name + '/SKILL.md';
        for (const upstream of core.stages.filter(stage => stage.kind !== 'implementation')) {
          assert.throws(() => instructionPlan(context, { ...upstream, instructions: [ref] }, {}),
            /implementation only/, upstream.id + ': ' + ref);
        }
        for (const gate_kind of ['architecture', 'quality']) {
          assert.throws(() => instructionPlan(context, { ...verifier, instructions: [ref] }, {},
            { leaf: 'gate-execution', gate_kind }), /implementation only/, gate_kind + ': ' + ref);
        }
      }
    }
  }
});

function gateFixture() {
  const f = tddFixture();
  const verification = { work_id: 'work', lock_digest: 'locked', candidate_digest: 'final', step_id: 'verify', revision: 1,
    input_digest: 'inputs', baseline_digest: 'rules', actor: 'collector', run_id: 'collect-run', gates: [] };
  const execution_refs = [];
  for (const kind of ['architecture', 'quality']) {
    const raw = f.record(kind + '-raw.json', { status: 'PASS', count: 1 });
    const gate = { ...verification, gates: undefined, kind, status: 'PASS', actor: kind + '-reviewer', run_id: kind + '-run',
      reviewer_role: kind + '-gate-reviewer', checks: [{ command: kind + '-check', status: 'PASS', blocking: true, exit_code: 0,
        ac_ids: kind === 'quality' ? ['AC-1'] : [],
        executed_count: 1, skipped_count: 0, evidence_digest: raw.sha256, raw_evidence: [raw],
        rule_evidence: [{ rule_id: kind + '-rule', evidence_refs: [raw.path] }] }] };
    delete gate.gates; verification.gates.push(gate);
    execution_refs.push({ ...verification, gates: undefined, actor: gate.actor, run_id: gate.run_id,
      gate_digest: digest(gate), gate_ref: f.record(kind + '-gate.json', gate) });
  }
  verification.ac_results = [{ id: 'AC-1', mode: 'automated', status: 'PASS', evidence: [verification.gates[1].checks[0].raw_evidence[0]] }];
  return { ...f, verification, verificationOptions: { approved_commands: ['architecture-check', 'quality-check'],
    raw_files: f.options.raw_files, execution_refs, reviewer_policy: 'independent-specialists' } };
}

test('two specialist reviewer identities and final collector must be distinct from each other and DEV', () => {
  const f = gateFixture(); assert.equal(validateVerification(f.verification, f.candidate, f.verificationOptions), true);
  for (const mutate of [
    v => { v.gates[1].actor = v.gates[0].actor; },
    v => { v.gates[1].run_id = v.gates[0].run_id; },
    v => { v.gates[0].actor = 'dev'; },
    v => { v.gates[0].actor = v.actor; },
    v => { v.gates[0].reviewer_role = 'software-engineer'; },
    v => { v.gates[0].candidate_digest = 'old'; },
  ]) {
    const g = gateFixture(), changed = structuredClone(g.verification); mutate(changed);
    // Keep origin bytes valid: this must reject the reviewer boundary, not just a stale hash.
    g.verificationOptions.execution_refs = changed.gates.map(gate => ({ ...changed, gates: undefined,
      actor: gate.actor, run_id: gate.run_id, gate_digest: digest(gate), gate_ref: g.record(gate.kind + '-gate.json', gate) }));
    assert.throws(() => validateVerification(changed, g.candidate, g.verificationOptions));
  }
});

test('a complete TDD/Gate packet still needs exact real-attributed approval; candidate drift or a missing Gate blocks handoff', () => {
  const f = gateFixture();
  const expected = { work_id: 'work', lock_digest: 'locked', step_id: 'verify', request_digest: 'request', artifact_digest: digest(f.verification) };
  const finalApproval = { ...expected, decision: 'approved', actor: 'synthetic human', source: 'user' };
  const state = { delivery_status: 'in_progress', implementation_verified_handoff: null };
  const finish = (approval, candidate = f.candidate) => {
    validateHandoff({ ledger: f.ledger, candidate, verification: f.verification, approval }, {
      tdd_options: f.options, gate_options: f.verificationOptions,
      approved_acs: [{ id: 'AC-1', mode: 'automated', quality_rule_ids: ['quality-rule'] }],
      approval_context: expected, current_candidate_digest: candidate.digest, workflow_id: 'core.standard',
    });
    state.implementation_verified_handoff = { candidate_digest: candidate.digest, verify_review_digest: expected.artifact_digest };
    state.delivery_status = 'verified';
  };
  assert.throws(() => finish(null)); assert.equal(state.implementation_verified_handoff, null);
  assert.throws(() => finish({ ...finalApproval, artifact_digest: 'old' }));
  assert.throws(() => finish(finalApproval, { ...f.candidate, digest: 'changed' }));
  const ac = f.verification.ac_results.pop(); assert.throws(() => finish(finalApproval)); f.verification.ac_results.push(ac);
  const quality = f.verification.gates.pop(); assert.throws(() => finish(finalApproval)); f.verification.gates.push(quality);
  finish(finalApproval); assert.equal(state.delivery_status, 'verified');
  assert.equal(Object.hasOwn(state, 'production'), false);
});

test('human approval cannot waive missing/failed/unrelated AC evidence; manual AC needs an actual observation', () => {
  const approveAndCheck = (f, acs = [{ id: 'AC-1', mode: 'automated', quality_rule_ids: ['quality-rule'] }]) => {
    const scope = { work_id: 'work', lock_digest: 'locked', step_id: 'verify', request_digest: 'request', artifact_digest: digest(f.verification) };
    return validateHandoff({ ledger: f.ledger, candidate: f.candidate, verification: f.verification,
      approval: { ...scope, decision: 'approved', actor: 'synthetic human', source: 'user' } }, {
      tdd_options: f.options, gate_options: f.verificationOptions, approved_acs: acs,
      approval_context: scope, current_candidate_digest: 'final', workflow_id: 'core.standard',
    });
  };
  for (const mutate of [
    f => { f.verification.ac_results[0].status = 'FAIL'; },
    f => { f.verification.ac_results[0].evidence = []; },
    f => { f.verification.ac_results[0].id = 'wrong-ac'; },
    f => { f.verification.ac_results.push(f.verification.ac_results[0]); },
    f => { f.verification.ac_results[0].evidence = [f.verification.gates[0].checks[0].raw_evidence[0]]; },
  ]) { const f = gateFixture(); mutate(f); assert.throws(() => approveAndCheck(f)); }
  const f = gateFixture(); f.verification.ac_results[0].mode = 'manual';
  const acs = [{ id: 'AC-1', mode: 'manual' }];
  f.verification.ac_results[0].evidence = [f.record('observation.json', { source: 'agent', actor: 'QE Agent', ac_id: 'AC-1' })];
  assert.throws(() => approveAndCheck(f, acs), /human observation/);
  f.verification.ac_results[0].evidence = [f.record('observation.json', { source: 'human', actor: 'synthetic observer', ac_id: 'AC-1' })];
  assert.equal(approveAndCheck(f, acs), true);
});

test('standard never obtains automatic final approval; compact delegation must already be validated', () => {
  const f = gateFixture();
  const scope = { work_id: 'work', lock_digest: 'locked', step_id: 'verify', request_digest: 'request', artifact_digest: digest(f.verification), validated_delegation_ref: 'policy' };
  const approval = { ...scope, decision: 'approved', actor: 'parent', source: 'delegation', policy_ref: 'policy' };
  const options = { tdd_options: f.options, gate_options: f.verificationOptions,
    approved_acs: [{ id: 'AC-1', mode: 'automated', quality_rule_ids: ['quality-rule'] }],
    approval_context: scope, current_candidate_digest: 'final', workflow_id: 'core.standard' };
  const packet = { ledger: f.ledger, candidate: f.candidate, verification: f.verification, approval };
  assert.throws(() => validateHandoff(packet, options), /human approval/);
  options.workflow_id = 'core.fix'; assert.equal(validateHandoff(packet, options), true);
  options.approval_context = { ...scope, validated_delegation_ref: null };
  assert.throws(() => validateHandoff(packet, options), /not validated/);
});
