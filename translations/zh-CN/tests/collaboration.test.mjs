// Synthetic contracts only: these fixtures are not user approvals or live runs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  digest, caseDigest, validateAcceptanceContract, validateRequirements, validateTestDesign, validateRoleApproval,
  classifyCaseChange, validateScriptMapping, validateTestRun, validateHandoff, validateLiveControlStatus, planSyncAttempt,
} from './support/collaboration-model.mjs';

const clone = value => structuredClone(value);
const time = '2026-10-28T02:00:00Z';
function fixture() {
  const files = {};
  const snapshot = (id, body) => {
    const uri = `fixture:${id}`, raw = JSON.stringify(body);
    files[uri] = raw;
    return { uri, sha256: createHash('sha256').update(raw).digest('hex') };
  };
  const method_ref = snapshot('method', { version: 'synthetic' });
  const workflow_ref = { path: 'work/workflow.lock.json', sha256: digest({ graph: 'synthetic' }) };
  const source_ref = snapshot('source', { id: 'FR-1', statement: 'Return zero results and readable explanation' });
  const source_requirements = [{ id: 'FR-1', source_ref, po_actor_id: 'po-1' }];
  const spec = { schema_version: 1, project_id: 'P', story_id: '100', revision: 1, unresolved: [],
    requirements: [{ id: 'FR-1', source_ref, ac_ids: ['AC-1', 'AC-2'], exclusion: null }],
    criteria: [
      { id: 'AC-1', statement: 'Empty search returns 0', verification: 'automated', source_refs: ['FR-1'] },
      { id: 'AC-2', statement: 'Explanation is understandable', verification: 'manual', source_refs: ['FR-1'] },
    ] };
  const spec_ref = snapshot('spec', spec);
  const dataset_ref = snapshot('data', { seed: 'empty-search-fixture', version: 1 });
  const oracle_ref = snapshot('oracle', { spec_ref, expected: '0' });
  const design = { contract_version: 1, project_id: 'P', story_id: '100', design_task_id: '101', revision: 1,
    source_spec_ref: spec_ref, owner_role: 'qa', unresolved: [], cases: [
      { id: 'TC-1', revision: 1, title: 'Empty search', ac_ids: ['AC-1'], required: true, execution_mode: 'browser',
        preconditions: ['Test user signed in'], data: { dataset_ref, prepare: 'Seed isolated fixture', cleanup: 'Delete fixture rows' },
        steps: [{ id: 'S1', action: 'Search for missing item', expected: '0', oracle_ref }], limitations: [] },
      { id: 'TC-2', revision: 1, title: 'Readable explanation', ac_ids: ['AC-2'], required: true, execution_mode: 'manual',
        preconditions: ['Empty result visible'], data: { dataset_ref, prepare: 'Reuse isolated fixture', cleanup: 'Delete fixture rows' },
        steps: [{ id: 'S1', action: 'Assess explanation', expected: 'Understandable explanation', oracle_ref }], limitations: [] },
    ] };
  const design_ref = snapshot('design', design);
  const approvalFor = (role, artifact_ref, id = role) => {
    const actor_id = `${role}-1`;
    const decision = { source: 'user', actor_id, role, decision: 'approved', statement: 'Synthetic fixture decision',
      at: time, project_id: 'P', story_id: '100', artifact_ref, method_ref };
    const approval = { contract_version: 1, approval_id: `A-${id}`, project_id: 'P', story_id: '100', role,
      actor_id, decision: 'approved', artifact_ref, method_ref, decision_ref: snapshot(`decision-${id}`, decision), decided_at: time, revoked_at: null };
    return { approval, ref: snapshot(`approval-${id}`, approval), context: { role, actor_id, project_id: 'P', story_id: '100', artifact_ref, method_ref, decision_files: files, now: time } };
  };
  const qa = approvalFor('qa', design_ref);
  const candidate = { commit: 'a'.repeat(40), digest: digest({ source: 'code and tests' }), artifact: `sha256:${'b'.repeat(64)}` };
  const environment = { id: 'qa', url: 'https://test.example/app' };
  const dispatch = { source_revision: 2, workflow_ref, run_id: 'qa-run', candidate };
  const dispatch_ref = snapshot('dispatch', dispatch);
  const run = { contract_version: 1, run_id: 'qa-run', project_id: 'P', story_id: '100',
    handoff_ref: snapshot('input-handoff', { candidate }), method_ref, workflow_ref, dispatch_ref, source_revision: 2,
    test_design_ref: design_ref, candidate,
    environment: { ...environment, observed_artifact: candidate.artifact,
      identity_evidence_ref: snapshot('identity', { environment_id: 'qa', url: environment.url, artifact: candidate.artifact,
        candidate_digest: candidate.digest, observed_at: '2026-10-28T01:30:00Z' }) },
    executor: { actor_id: 'qa-1', agent_run_id: 'qa-agent-1' }, started_at: '2026-10-28T01:00:00Z', finished_at: time,
    status: 'PASS', results: [], evidence_refs: [], limitations: [], blockers: [] };
  for (const testcase of design.cases) {
    const actual = testcase.execution_mode === 'manual' ? 'The observer understood the explanation' : '0';
    const evidence_ref = snapshot(`evidence-${testcase.id}`, { complete: true, truncated: false, project_id: 'P', story_id: '100',
      run_id: run.run_id, case_id: testcase.id, case_digest: caseDigest(testcase), step_id: 'S1', actor_id: 'qa-1',
      candidate_digest: candidate.digest, environment_id: 'qa', data_ref: dataset_ref, oracle_ref,
      expected: testcase.steps[0].expected, actual, status: 'PASS', observed_at: '2026-10-28T01:40:00Z',
      source: testcase.execution_mode === 'manual' ? 'human' : 'browser', check_id: 'count-visible', statement: 'Synthetic observation fixture' });
    run.results.push({ case_id: testcase.id, case_revision: 1, case_digest: caseDigest(testcase), status: 'PASS',
      mode: testcase.execution_mode, actor_id: 'qa-1', data_ref: dataset_ref,
      steps: [{ step_id: 'S1', actual, status: 'PASS', evidence_ref }] });
    run.evidence_refs.push(evidence_ref);
  }
  return { files, snapshot, method_ref, workflow_ref, source_ref, source_requirements, spec, spec_ref, dataset_ref,
    oracle_ref, design, design_ref, approvalFor, qa, candidate, environment, dispatch_ref, run };
}
const designContext = f => ({ spec: f.spec, spec_ref: f.spec_ref, design_ref: f.design_ref, raw_files: f.files,
  approval: f.qa.approval, approval_context: f.qa.context });
const runContext = f => ({ design: f.design, design_ref: f.design_ref, candidate: f.candidate, environment: f.environment,
  raw_files: f.files, method_ref: f.method_ref, workflow_ref: f.workflow_ref, dispatch_ref: f.dispatch_ref, source_revision: 2, now: time });

test('collaboration templates are opt-in and contain no manufactured approval or result', () => {
  const json = name => JSON.parse(readFileSync(new URL(`../templates/collaboration/${name}.json`, import.meta.url)));
  const config = json('config');
  assert.equal(config.enabled, false); assert.equal(config.workflow_id, 'team.role-delivery');
  assert.deepEqual(config.authorization_refs, []);
  assert.ok(Object.values(config.approvers).every(value => value === null));
  assert.deepEqual(config.sync.triggers, ['explicit', 'dev_resume']);
  assert.equal(config.sync.max_write_attempts_per_target, 1);
  assert.equal(json('approval').decision, 'pending'); assert.equal(json('test-run').status, 'NOT_RUN');
  assert.deepEqual(json('test-design').cases, []); assert.equal(json('handoff').outcome, 'blocked');
  assert.deepEqual(json('authorization').operations, []); assert.equal(json('sync-receipt').write_attempts, 0);
});

test('requirements cover the original source set, not only already-generated AC', () => {
  const f = fixture();
  assert.equal(validateRequirements(f.spec, { source_requirements: f.source_requirements, raw_files: f.files }), true);
  assert.throws(() => validateRequirements(f.spec, { source_requirements: [...f.source_requirements, { id: 'NFR-2', source_ref: f.source_ref }], raw_files: f.files }), /source requirement/);
  const bad = clone(f.spec); bad.requirements[0].ac_ids = [];
  assert.throws(() => validateRequirements(bad, { source_requirements: f.source_requirements, raw_files: f.files }), /unmapped/);
  const excluded = clone(f.spec), excludedSource = f.snapshot('excluded-source', { id: 'FR-2', statement: 'Excluded fixture requirement' });
  excluded.requirements.push({ id: 'FR-2', source_ref: excludedSource, ac_ids: [], exclusion: { reason: 'Skip', approval_ref: f.source_ref } });
  assert.throws(() => validateRequirements(excluded, { source_requirements: [...f.source_requirements,
    { id: 'FR-2', source_ref: excludedSource, po_actor_id: 'po-1' }], raw_files: f.files }), /unapproved exclusion/);
});

test('acceptance contract uses canonical core fields with supported source-reference shapes', () => {
  const f = fixture(), acceptance = { schema_version: 1, criteria: f.spec.criteria, requirements: f.spec.requirements };
  assert.equal(validateAcceptanceContract(acceptance), true);
  for (const source of ['requirements.md#FR-1', { path: 'frozen/requirements.md', sha256: 'a'.repeat(64), document_id: 'PRD-1', revision: 3 }, f.source_ref]) {
    const linked = clone(acceptance); linked.requirements[0].source_ref = source;
    linked.criteria.forEach(row => { row.source_refs = [source]; });
    assert.equal(validateAcceptanceContract(linked), true, 'resource references are not forced to FR IDs');
  }
});

test('semantic-looking alias output from a Story generator cannot replace canonical acceptance fields', () => {
  const alias = { schema_version: 1, criteria: [{ id: 'AC-1', given: 'a permitted user', when: 'searching an empty set',
    then: 'zero results', expected: '0', verification: 'automated', source_refs: ['FR-1'] }],
    requirements: [{ id: 'FR-1', source_ref: 'source.md#FR-1', acceptance_ids: ['AC-1'], approved_exclusion: null }] };
  assert.throws(() => validateAcceptanceContract(alias), /statement/);
  alias.criteria[0].statement = 'An empty search displays zero results';
  assert.throws(() => validateAcceptanceContract(alias), /ac_ids/);
  alias.requirements[0].ac_ids = ['AC-1'];
  assert.throws(() => validateAcceptanceContract(alias), /exclusion/);
});

test('acceptance contract rejects empty values, duplicate IDs, invalid types and unmapped relationships', () => {
  const f = fixture(), source = { schema_version: 1, criteria: f.spec.criteria, requirements: f.spec.requirements };
  const mutations = [
    a => { a.schema_version = 2; }, a => { a.criteria = []; }, a => { a.requirements = []; },
    a => { a.criteria[0].statement = ' '; }, a => { a.criteria[0].verification = 'ui'; },
    a => { a.criteria[0].source_refs = []; }, a => { a.criteria[0].source_refs = [{}]; },
    a => { a.criteria[1].id = a.criteria[0].id; }, a => { a.requirements.push(clone(a.requirements[0])); },
    a => { a.requirements[0].source_ref = null; }, a => { a.requirements[0].ac_ids = 'AC-1'; },
    a => { a.requirements[0].ac_ids = ['unknown-AC']; }, a => { a.requirements[0].ac_ids = ['AC-1']; },
    a => { a.requirements[0].exclusion = false; },
  ];
  for (const mutate of mutations) { const bad = clone(source); mutate(bad); assert.throws(() => validateAcceptanceContract(bad)); }
  const contradictory = clone(source);
  contradictory.requirements.push({ id: 'FR-2', source_ref: 'source.md#FR-2', ac_ids: ['AC-2'], exclusion: null });
  contradictory.requirements[0].ac_ids = ['AC-1'];
  assert.throws(() => validateAcceptanceContract(contradictory), /source requirement mapping/);
});

test('configured role and actual exact-subject decision are required, not Jira assignee/status', () => {
  const f = fixture();
  assert.equal(validateRoleApproval(f.qa.approval, f.qa.context), true);
  for (const change of [ { actor_id: 'dev-1' }, { role: 'po' }, { revoked_at: time }, { decided_at: '2027-01-01T00:00:00Z' },
    { artifact_ref: f.spec_ref }, { decision_ref: f.snapshot('fake-status', { assignee: 'qa-1', status: 'Approved' }) } ]) {
    assert.throws(() => validateRoleApproval({ ...f.qa.approval, ...change }, f.qa.context));
  }
});

test('QA design approval binds nonempty cases, source Spec, data, Oracle and all AC', () => {
  const f = fixture();
  assert.equal(validateTestDesign(f.design, designContext(f)), true);
  const bad = clone(f.design); bad.cases.pop();
  const badRef = f.snapshot('bad-design', bad), badApproval = f.approvalFor('qa', badRef, 'bad');
  assert.throws(() => validateTestDesign(bad, { ...designContext(f), design_ref: badRef, approval: badApproval.approval }), /AC lacks/);
  f.files[f.dataset_ref.uri] = '{}';
  assert.throws(() => validateTestDesign(f.design, designContext(f)), /drifted snapshot/);
});

test('case edits create revisions, stale results and controlled script updates', () => {
  const f = fixture(), original = f.design.cases[0];
  assert.equal(classifyCaseChange(original, clone(original)).kind, 'unchanged');
  const next = clone(original); next.revision++; next.steps[0].expected = '1';
  assert.deepEqual(classifyCaseChange(original, next, { approved_spec_unchanged: true }), {
    kind: 'semantic', scripts: 'pending_sync', results: 'stale', requires_po: true,
  });
  const dataChange = clone(original); dataChange.revision++; dataChange.data.prepare = 'Seed two users';
  assert.equal(classifyCaseChange(original, dataChange, { approved_spec_unchanged: true }).requires_po, false);
  const editorial = clone(original); editorial.revision++; editorial.title = 'Zero results';
  assert.equal(classifyCaseChange(original, editorial).results, 'stale');
  assert.equal(classifyCaseChange(original, editorial, { semantic_review_ref: f.qa.ref }).results, 'review_reuse');
  next.revision = 1; assert.throws(() => classifyCaseChange(original, next), /revision/);
});

test('script mappings are derived outside approved cases and cannot cover changed case revisions', () => {
  const f = fixture(), mapping = { contract_version: 1, project_id: 'P', story_id: '100', source_design_ref: f.design_ref,
    candidate: f.candidate, status: 'current', links: f.design.cases.map(testcase => ({ case_id: testcase.id,
      case_revision: testcase.revision, case_digest: caseDigest(testcase),
      status: testcase.execution_mode === 'manual' ? 'manual_only' : 'implemented',
      reason: testcase.execution_mode === 'manual' ? 'Requires human readability observation' : null,
      test_refs: testcase.execution_mode === 'manual' ? [] : [{ repository_id: 'code', path: 'tests/search.test.mjs', test_id: 'zero-results', commit: f.candidate.commit }],
    })) };
  const context = { design: f.design, design_ref: f.design_ref, candidate: f.candidate };
  assert.equal(validateScriptMapping(mapping, context), true);
  const browser = clone(mapping); browser.links[0] = { ...browser.links[0], status: 'browser_protocol', protocol_ref: f.design_ref, test_refs: [] };
  assert.equal(validateScriptMapping(browser, context), true, 'host browser execution needs no new runner/scripts');
  browser.links[0].protocol_ref = f.spec_ref;
  assert.throws(() => validateScriptMapping(browser, context), /approved case baseline/);
  const changed = clone(f.design); changed.cases[0].revision++;
  assert.throws(() => validateScriptMapping(mapping, { ...context, design: changed }), /stale/);
  const missing = clone(mapping); missing.links[0].test_refs = [];
  assert.throws(() => validateScriptMapping(missing, context), /script location/);
  const fakeManual = clone(mapping); fakeManual.links[1].status = 'implemented';
  assert.throws(() => validateScriptMapping(fakeManual, context), /manual case/);
  const extra = clone(mapping); extra.links.push({ ...extra.links[0], case_id: 'TC-foreign' });
  assert.throws(() => validateScriptMapping(extra, context), /incomplete/);
  const none = { ...mapping, links: [] };
  assert.throws(() => validateScriptMapping(none, { ...context, design: { ...f.design, cases: [] } }), /incomplete/);
});

test('QA browser and human observations bind exact candidate, case, data, environment and time', () => {
  const f = fixture();
  assert.equal(validateTestRun(f.run, runContext(f)), true);
  for (const change of [ { candidate: { ...f.candidate, commit: 'c'.repeat(40) } }, { test_design_ref: f.spec_ref },
    { environment: { ...f.run.environment, id: 'production' } }, { source_revision: 3 }, { status: 'NOT_RUN' }, { results: [] } ]) {
    assert.throws(() => validateTestRun({ ...f.run, ...change }, runContext(f)));
  }
  const wrongData = clone(f.run); wrongData.results[0].data_ref = f.spec_ref;
  assert.throws(() => validateTestRun(wrongData, runContext(f)), /case\/data/);
});

test('missing, truncated, unrelated or AI-invented manual observation cannot pass QA', () => {
  for (const change of [ { truncated: true }, { complete: false }, { case_id: 'other' },
    { observed_at: '2026-10-27T01:00:00Z' }, { source: 'browser' }, { statement: '' } ]) {
    const f = fixture(), result = f.run.results[1].steps[0];
    const raw = JSON.parse(f.files[result.evidence_ref.uri]);
    result.evidence_ref = f.snapshot('bad-human-evidence', { ...raw, ...change });
    assert.throws(() => validateTestRun(f.run, runContext(f)));
  }
  const f = fixture(); delete f.files[f.run.results[0].steps[0].evidence_ref.uri];
  assert.throws(() => validateTestRun(f.run, runContext(f)), /missing\/truncated/);
});

test('an apparently green browser row still needs the approved assertion and full step set', () => {
  const f = fixture(), run = clone(f.run), step = run.results[0].steps[0];
  const raw = JSON.parse(f.files[step.evidence_ref.uri]);
  step.actual = '1'; step.evidence_ref = f.snapshot('false-green', { ...raw, actual: '1' });
  assert.throws(() => validateTestRun(run, runContext(f)), /assertion/);
  const empty = clone(f.run); empty.results[0].steps = [];
  assert.throws(() => validateTestRun(empty, runContext(f)), /incomplete/);
});

test('empty suites and extra unrelated results cannot manufacture QA PASS', () => {
  const f = fixture(), design = { ...f.design, cases: [] }, design_ref = f.snapshot('empty-suite', design);
  assert.throws(() => validateTestRun({ ...f.run, results: [], test_design_ref: design_ref }, { ...runContext(f), design, design_ref }), /empty/);
  const extra = clone(f.run); extra.results.push({ ...extra.results[0], case_id: 'TC-foreign' });
  assert.throws(() => validateTestRun(extra, runContext(f)), /unknown test case/);
});

test('QA may reuse earlier DEV/CI automated observations with original identity and exact candidate', () => {
  const f = fixture();
  f.design.cases[0].execution_mode = 'automated';
  f.design_ref = f.snapshot('automated-design', f.design); f.run.test_design_ref = f.design_ref;
  const row = f.run.results[0]; row.mode = 'automated'; row.actor_id = 'dev-1'; row.case_digest = caseDigest(f.design.cases[0]);
  const previous = JSON.parse(f.files[row.steps[0].evidence_ref.uri]);
  row.steps[0].evidence_ref = f.snapshot('original-dev-observation', { ...previous, run_id: 'dev-run', actor_id: 'dev-1',
    source: 'test_runner', case_digest: row.case_digest, observed_at: '2026-10-28T00:30:00Z' });
  row.execution_ref = f.snapshot('original-dev-execution', { source: 'test_runner', run_id: 'dev-run', actor_id: 'dev-1',
    complete: true, truncated: false, candidate_digest: f.candidate.digest, test_design_ref: f.design_ref, data_ref: f.dataset_ref,
    started_at: '2026-10-28T00:00:00Z', finished_at: '2026-10-28T00:45:00Z', evidence_refs: [row.steps[0].evidence_ref] });
  assert.equal(validateTestRun(f.run, runContext(f)), true);
  const missingOrigin = clone(f.run); delete missingOrigin.results[0].execution_ref;
  assert.throws(() => validateTestRun(missingOrigin, runContext(f)), /snapshot ref/);
  const origin = JSON.parse(f.files[row.execution_ref.uri]);
  row.execution_ref = f.snapshot('wrong-original-candidate', { ...origin, candidate_digest: 'other-build' });
  assert.throws(() => validateTestRun(f.run, runContext(f)), /original automated/);
});

function handoffFixture() {
  const f = fixture(), po = f.approvalFor('po', f.spec_ref);
  const controller_ref = f.snapshot('controller', { owner: 'parent' });
  const lease_ref = f.snapshot('lease', { actor_id: 'po-1', revoked_at: null, issued_at: '2026-10-28T01:00:00Z', expires_at: '2026-10-28T03:00:00Z', dispatch_ref: f.dispatch_ref });
  const handoff = { contract_version: 1, handoff_id: 'H-1', kind: 'requirements_ready', project_id: 'P', story_id: '100',
    method_ref: f.method_ref, workflow_ref: f.workflow_ref, state_locator: 'fixture:shared-state-v2', control_locator: 'fixture:current-controller', controller_ref,
    dispatch_ref: f.dispatch_ref, source_revision: 2, lease_ref,
    source_refs: [{ provider: 'jira', project_id: 'P', object_id: '100', version: 1, url: 'https://jira.example/browse/P-1', snapshot_ref: f.source_ref }],
    artifact_refs: [f.spec_ref], approval_refs: [po.ref], producer: { role: 'po', actor_id: 'po-1', run_id: 'po-run' },
    candidate: null, outcome: 'requirements_ready', blockers: [], created_at: time };
  const context = { project_id: 'P', story_id: '100', method_ref: f.method_ref, workflow_ref: f.workflow_ref,
    source_revision: 2, controller_ref, lease_ref, dispatch_ref: f.dispatch_ref, raw_files: f.files, control_locator: handoff.control_locator,
    expected_kind: 'requirements_ready', producer_actor_id: 'po-1', now: time,
    approval_requirements: [{ ref: po.ref, role: 'po', actor_id: 'po-1', artifact_ref: f.spec_ref }] };
  return { ...f, handoff, context };
}

test('cross-session handoff restores exact artifacts and approvals with one current controller', () => {
  const f = handoffFixture(); assert.equal(validateHandoff(f.handoff, f.context), true);
  for (const change of [ { source_revision: 3 }, { workflow_ref: { ...f.workflow_ref, sha256: 'a'.repeat(64) } },
    { outcome: 'implementation_verified_handoff' }, { approval_refs: [] }, { source_refs: [] }, { state_locator: null } ]) {
    assert.throws(() => validateHandoff({ ...f.handoff, ...change }, f.context));
  }
  const lease = f.snapshot('revoked-lease', { actor_id: 'po-1', revoked_at: time, issued_at: '2026-10-28T01:00:00Z', expires_at: '2026-10-28T03:00:00Z', dispatch_ref: f.dispatch_ref });
  assert.throws(() => validateHandoff({ ...f.handoff, lease_ref: lease }, { ...f.context, lease_ref: lease }), /revoked/);
});

test('readable approval-shaped artifacts without real source decisions cannot authorize handoff', () => {
  const f = handoffFixture(), fake = JSON.parse(f.files[f.handoff.approval_refs[0].uri]);
  fake.decision_ref = f.snapshot('assignee-status', { assignee: 'po-1', status: 'Done' });
  const ref = f.snapshot('fake-approval', fake); f.handoff.approval_refs = [ref]; f.context.approval_requirements[0].ref = ref;
  assert.throws(() => validateHandoff(f.handoff, f.context), /actual decision/);
});

test('approved durable handoffs remain reusable after producer lease expiry, but must have been produced during that lease', () => {
  const f = handoffFixture(), later = { ...f.context, now: '2026-11-04T02:00:00Z' };
  assert.equal(validateHandoff(f.handoff, later), true, 'completed producer is not required to remain active for a week');
  for (const created_at of ['2026-10-28T00:59:59Z', '2026-10-28T03:00:00Z', '2026-10-29T01:00:00Z']) {
    assert.throws(() => validateHandoff({ ...f.handoff, created_at }, later), /lease/);
  }
});

test('late reuse still rejects changed source approval subjects, revoked approvals and drifted snapshot bytes', () => {
  const f = handoffFixture(), later = { ...f.context, now: '2026-11-04T02:00:00Z' };
  const changedSource = f.snapshot('revised-approved-spec', { ...f.spec, revision: 2 });
  assert.throws(() => validateHandoff(f.handoff, { ...later,
    approval_requirements: [{ ...later.approval_requirements[0], artifact_ref: changedSource }] }), /approval subject drift/);
  const previousApproval = JSON.parse(f.files[f.handoff.approval_refs[0].uri]);
  const revokedRef = f.snapshot('revoked-po-approval', { ...previousApproval, revoked_at: '2026-11-01T00:00:00Z' });
  assert.throws(() => validateHandoff({ ...f.handoff, approval_refs: [revokedRef] }, { ...later,
    approval_requirements: [{ ...later.approval_requirements[0], ref: revokedRef }] }), /revoked/);
  f.files[f.source_ref.uri] = JSON.stringify({ id: 'FR-1', statement: 'Different original source' });
  assert.throws(() => validateHandoff(f.handoff, later), /drifted snapshot/);
});

function syncFixture() {
  const f = fixture(), target = { provider: 'jira', project_id: 'P', container_id: '100', kind: 'test_design' };
  const request = { operation_id: 'op-1', project_id: 'P', story_id: '100', operation: 'create', target, source_version: 1,
    artifact_ref: f.design_ref, handoff_ref: f.run.handoff_ref, method_ref: f.method_ref, workflow_ref: f.workflow_ref,
    object_id: null, expected_remote_hash: null };
  const grantSubject = { contract_version: 1, authorization_id: 'G-1', project_id: 'P', story_ids: ['100'], actor_id: 'qa-1',
    method_ref: f.method_ref, workflow_ref: f.workflow_ref, targets: [target], operations: ['create', 'update_owned'],
    artifact_refs: [f.design_ref], expires_at: '2026-10-29T00:00:00Z', revoked_at: null };
  const grant = { ...grantSubject, decision_ref: f.snapshot('grant-decision', { source: 'user', actor_id: 'qa-1',
    decision: 'authorized', statement: 'Synthetic publish decision', scope: grantSubject }) };
  request.authorization_ref = f.snapshot('grant', grant);
  const identity = { project_id: request.project_id, story_id: request.story_id, target, artifact_ref: request.artifact_ref,
    handoff_ref: request.handoff_ref, method_ref: request.method_ref, workflow_ref: request.workflow_ref, source_version: request.source_version,
    authorization_ref: request.authorization_ref, operation: request.operation, object_id: request.object_id,
    expected_remote_hash: request.expected_remote_hash, ownership_ref: null };
  request.idempotency_key = digest(identity);
  const remote = { target, object_id: '101', operation_id: 'op-1', owner: 'P/100', source_version: 1,
    artifact_ref: f.design_ref, content_hash: f.design_ref.sha256 };
  const action = { invocation_id: 'action-1', started_at: '2026-10-28T01:59:30Z', work_id: 'W-1', project_id: 'P', story_id: '100',
    controller_id: 'controller-1', control_locator: 'fixture:current-controller', executor_actor_id: 'qa-1', operation: 'create', target,
    source_revision: 2, dispatch_ref: f.dispatch_ref, method_ref: f.method_ref, workflow_ref: f.workflow_ref,
    authorization_ref: request.authorization_ref, candidate: f.candidate };
  const liveStatus = { ...action, source: 'live_control_read', observed_at: '2026-10-28T01:59:45Z', controller_state: 'active',
    dispatch_state: 'active', grant_state: 'active', revoked_at: null, closed_at: null,
    allowed_operations: ['create', 'update_owned'], lease_expires_at: '2026-10-28T03:00:00Z' };
  const observation = { contract_version: 1, invocation_id: action.invocation_id, control_locator: action.control_locator,
    observed_at: liveStatus.observed_at, response_ref: f.snapshot('live-controller-response', liveStatus) };
  return { ...f, request, grant, identity, remote,
    context: { grant, raw_files: f.files, approved_actor_id: 'qa-1', now: time, live_control: { action, observation } } };
}

test('sync scopes exact artifact, method, workflow, project and actual grant with one attempt', () => {
  const f = syncFixture(); assert.equal(planSyncAttempt(f.request, f.context).writes, 1);
  for (const mutation of [ { project_id: 'foreign' }, { target: { ...f.request.target, container_id: 'other' } },
    { artifact_ref: f.spec_ref }, { method_ref: f.spec_ref }, { workflow_ref: { ...f.workflow_ref, sha256: '0'.repeat(64) } } ]) {
    assert.equal(planSyncAttempt({ ...f.request, ...mutation }, f.context).writes, 0);
  }
  assert.equal(planSyncAttempt(f.request, { ...f.context, grant: { ...f.grant, revoked_at: time } }).status, 'blocked');
  assert.equal(planSyncAttempt(f.request, { ...f.context, grant: { ...f.grant, operations: ['create'] } }).status, 'blocked', 'editing grant without matching source decision is invalid');
});

test('unknown write is reconciled without another create, including empty search', () => {
  const f = syncFixture(), prior = { status: 'unknown', write_attempts: 1, operation_id: 'op-1', idempotency_key: f.request.idempotency_key, identity: f.identity };
  assert.deepEqual(planSyncAttempt(f.request, { ...f.context, prior }), { status: 'unknown', action: 'read_verify_only', writes: 0 });
  const found = planSyncAttempt(f.request, { ...f.context, prior, remote: f.remote });
  assert.equal(found.status, 'succeeded'); assert.equal(found.writes, 0); assert.equal(found.object_id, '101');
  assert.equal(planSyncAttempt(f.request, { ...f.context, prior, remote: { ...f.remote, owner: 'someone-else' } }).status, 'unknown');
});

test('successful delivery is idempotent and manual edits or failed attempts do not auto-write', () => {
  const f = syncFixture(), prior = { status: 'succeeded', write_attempts: 1, object_id: '101', operation_id: 'op-1', idempotency_key: f.request.idempotency_key, identity: f.identity };
  assert.equal(planSyncAttempt(f.request, { ...f.context, prior, remote: f.remote }).writes, 0);
  assert.equal(planSyncAttempt(f.request, { ...f.context, prior, remote: { ...f.remote, content_hash: 'edited' } }).status, 'conflict');
  const failed = planSyncAttempt(f.request, { ...f.context, prior: { ...prior, status: 'failed' } });
  assert.equal(failed.action, 'explicit_retry_required'); assert.equal(failed.writes, 0);
  assert.equal(planSyncAttempt(f.request, { ...f.context, remote: f.remote }).status, 'blocked', 'unowned first create never adopts by title');
});

test('owned updates require a saved exact readback receipt or actual import decision, never just an owner string', () => {
  const f = syncFixture(), remote = { ...f.remote, source_version: 0 };
  f.context.live_control.action.operation = 'update_owned';
  const request = { ...f.request, operation: 'update_owned', object_id: '101', expected_remote_hash: remote.content_hash, ownership_ref: null };
  const identify = () => ({ ...f.identity, operation: request.operation, object_id: request.object_id,
    expected_remote_hash: request.expected_remote_hash, ownership_ref: request.ownership_ref });
  request.idempotency_key = digest(identify());
  assert.equal(planSyncAttempt(request, { ...f.context, remote }).writes, 0);
  const ownership = { contract_version: 1, kind: 'managed_receipt', status: 'succeeded', project_id: 'P', story_id: '100',
    object_id: '101', target: request.target, readback_hash: remote.content_hash, readback_ref: f.snapshot('previous-readback', remote) };
  request.ownership_ref = f.snapshot('previous-receipt', ownership); request.idempotency_key = digest(identify());
  assert.equal(planSyncAttempt(request, { ...f.context, remote }).writes, 1);
  request.ownership_ref = f.snapshot('foreign-receipt', { ...ownership, object_id: 'someone-else' });
  request.idempotency_key = digest(identify());
  assert.equal(planSyncAttempt(request, { ...f.context, remote }).writes, 0);
  const importDecision = f.snapshot('import-decision', { source: 'user', actor_id: 'qa-1', decision: 'import_owned',
    statement: 'Synthetic explicit import', project_id: 'P', story_id: '100', object_id: '101', target: request.target,
    content_hash: remote.content_hash, revoked_at: null });
  request.ownership_ref = f.snapshot('import-record', { ...ownership, kind: 'explicit_import', decision_ref: importDecision });
  request.idempotency_key = digest(identify());
  assert.equal(planSyncAttempt(request, { ...f.context, remote }).writes, 1);
});

test('distributed side effects stop when the current controller revoked after dispatch', () => {
  const f = syncFixture(), { action, observation } = f.context.live_control;
  assert.equal(validateLiveControlStatus(action, { observation, raw_files: f.files, now: time }), true);
  const current = JSON.parse(f.files[observation.response_ref.uri]);
  for (const mutation of [ { revoked_at: time }, { grant_state: 'revoked' }, { closed_at: time }, { dispatch_state: 'reassigned' },
    { controller_state: 'closed' }, { lease_expires_at: time }, { executor_actor_id: 'other' }, { source_revision: 3 }, { dispatch_ref: f.spec_ref },
    { candidate: { ...f.candidate, digest: 'new-build' } }, { authorization_ref: f.spec_ref } ]) {
    const changed = { ...observation, response_ref: f.snapshot(`live-changed-${Object.keys(mutation)[0]}`, { ...current, ...mutation }) };
    assert.throws(() => validateLiveControlStatus(action, { observation: changed, raw_files: f.files, now: time }));
    const decision = planSyncAttempt(f.request, { ...f.context, live_control: { action, observation: changed } });
    assert.equal(decision.writes, 0);
  }
});

test('a frozen old ledger, another action observation or unreadable ledger is not live authority', () => {
  const f = syncFixture(), { action, observation } = f.context.live_control;
  for (const changed of [ null, { ...observation, invocation_id: 'previous-action' },
    { ...observation, observed_at: '2026-10-27T01:00:00Z' }, { ...observation, control_locator: 'fixture:wrong-ledger' },
    { ...observation, response_ref: f.spec_ref } ]) {
    assert.equal(planSyncAttempt(f.request, { ...f.context, live_control: { action, observation: changed } }).writes, 0);
  }
  assert.equal(planSyncAttempt(f.request, { ...f.context, live_control: null }).writes, 0);
});
