// Synthetic decisions only. Passing these tests is not proof of a host Agent,
// deployment, actual approval, business delivery, or installed execution engine.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  GATE_KINDS, digest, createWorkLock, assertWorkLock, validateStage, validateWorkflow,
  resolveDefinitions, selectBranches, readyNodes, assertApproval, assertDispatch,
  assertToolRequest, canAutoApprove, validateVerification, normalizeBuiltins,
} from './support/workflow-model.mjs';

const copy = value => structuredClone(value);
const output = (contract, name = `${contract}.md`) => ({ name, contract, template: `team:templates/${name}` });
const stage = (id, kind, inputs, contract, extra = {}) => ({
  id, kind, role: `team:roles/${kind}.md`, prompt: `team:prompts/${kind}.md`,
  inputs, optional_inputs: [], outputs: [output(contract)], capabilities: [], auto_eligible: false, routing_facts: {}, ...extra,
});
const definitions = [
  stage('team.plan', 'planning', ['request'], 'plan', { auto_eligible: true }),
  stage('team.implement', 'implementation', ['plan'], 'implementation', { capabilities: ['product.write'], auto_eligible: true }),
  stage('team.verify', 'verification', ['implementation'], 'verification', { auto_eligible: true }),
  stage('team.assess', 'analysis', ['request'], 'analysis', { routing_facts: { approved_path: 'boolean' } }),
  stage('team.report', 'analysis', ['analysis'], 'analysis'),
  stage('team.learn', 'learning', ['verification'], 'outcome', { capabilities: ['evidence.read'] }),
];
const delivery = () => ({
  id: 'team.delivery', intent: 'delivery', risk_ceiling: 'low', entry: 'plan',
  nodes: [
    { step_id: 'plan', stage_id: 'team.plan', bindings: { request: ['$request'] } },
    { step_id: 'write', stage_id: 'team.implement', bindings: { plan: ['plan'] }, authority: 'plan' },
    { step_id: 'check', stage_id: 'team.verify', bindings: { implementation: ['write'] } },
  ],
  edges: [{ from: 'plan', to: 'write' }, { from: 'write', to: 'check' }], switches: [],
  terminals: [{ step_id: 'check', outcome: 'verified' }],
});
const branch = () => ({
  id: 'team.branch', intent: 'analysis', risk_ceiling: 'any', entry: 'assess',
  nodes: [
    { step_id: 'assess', stage_id: 'team.assess', bindings: { request: ['$request'] } },
    { step_id: 'left', stage_id: 'team.report', bindings: { analysis: ['assess'] } },
    { step_id: 'right', stage_id: 'team.report', bindings: { analysis: ['assess'] } },
    { step_id: 'join', stage_id: 'team.report', bindings: { analysis: ['left', 'right'] } },
  ],
  edges: [
    { from: 'assess', to: 'left', when: { switch: 'route', case: 'yes' } },
    { from: 'assess', to: 'right', when: { switch: 'route', case: 'no' } },
    { from: 'left', to: 'join' }, { from: 'right', to: 'join' },
  ],
  switches: [{ id: 'route', after: 'assess', fact: 'approved_path', cases: [{ id: 'yes', op: 'eq', value: true }, { id: 'no', default: true }] }],
  terminals: [{ step_id: 'join', outcome: 'analysis_complete' }],
});
const pack = (id, stages = [], workflows = [], overrides = []) => ({ contract_version: 1, core_contract: 1, id, version: '1.0', stages, workflows, overrides, tool_bindings: [] });
const context = (ids = ['plan', 'write', 'check']) => ({ work_id: 'synthetic-work', lock_digest: 'locked', request_digest: 'request-v1', artifact_digests: Object.fromEntries(ids.map(id => [id, `artifact-${id}`])) });
const approval = (id, ctx = context()) => ({
  decision: 'approved', actor: 'synthetic-human', source: 'user', step_id: id,
  work_id: ctx.work_id, lock_digest: ctx.lock_digest, request_digest: ctx.request_digest, artifact_digest: ctx.artifact_digests[id],
});
function routingRecord(value = true) {
  const facts = { approved_path: value };
  const artifact = { routing_facts: facts, assessment: 'synthetic fixture' };
  const ctx = context(['assess', 'left', 'right', 'join']);
  ctx.artifact_digests.assess = digest(artifact);
  return { ctx, records: { assess: { artifact, facts, artifact_digest: digest(artifact), approval: approval('assess', ctx) } } };
}

test('synthetic DAG validates by semantic kinds and contracts, independent of display filenames', () => {
  const workflow = delivery();
  workflow.nodes[2].outputs = [output('verification', 'assurance-summary.md')];
  assert.deepEqual(validateWorkflow(workflow, definitions), { order: ['plan', 'write', 'check'], scenarios: 1, required_gate_kinds: ['architecture', 'quality'] });
  workflow.nodes[2].outputs[0].contract = 'analysis';
  assert.throws(() => validateWorkflow(workflow, definitions), /preserve semantic contracts/);
});

test('cycle, missing dependency and dangling input each block resolution', () => {
  const cycle = delivery();
  cycle.edges.push({ from: 'check', to: 'write' });
  assert.throws(() => validateWorkflow(cycle, definitions), /cycle/);
  const dependency = delivery();
  dependency.edges[0].from = 'missing';
  assert.throws(() => validateWorkflow(dependency, definitions), /missing dependency/);
  const dangling = delivery();
  dangling.nodes[2].bindings.implementation = ['missing'];
  assert.throws(() => validateWorkflow(dangling, definitions), /dangling input/);
});

test('input contracts require a producer, dependency order, and compatible semantic output', () => {
  const missing = delivery();
  missing.nodes[2].bindings = {};
  assert.throws(() => validateWorkflow(missing, definitions), /missing required input/);
  const mismatch = delivery();
  mismatch.nodes[2].bindings.implementation = ['plan'];
  assert.throws(() => validateWorkflow(mismatch, definitions), /producer lacks contract/);
  const external = delivery();
  external.nodes[2].bindings.implementation = ['$implementation'];
  assert.throws(() => validateWorkflow(external, definitions), /invalid external/);
  const fork = branch();
  fork.switches = [];
  fork.edges.forEach(edge => delete edge.when);
  fork.nodes[1].bindings.analysis = ['right'];
  assert.throws(() => validateWorkflow(fork, definitions), /not a dependency/);
});

test('reusing a stage at multiple steps is valid; duplicate step identity is not', () => {
  const workflow = branch();
  assert.equal(validateWorkflow(workflow, definitions).scenarios, 2);
  assert.equal(workflow.nodes.filter(node => node.stage_id === 'team.report').length, 3);
  workflow.nodes[2].step_id = 'left';
  assert.throws(() => validateWorkflow(workflow, definitions), /duplicate step/);
});

test('entry permits only readonly investigation kinds and cannot begin implementation or verification', () => {
  const contracts = { analysis: 'analysis', specification: 'spec', design: 'architecture', planning: 'plan', quality_design: 'quality', implementation: 'implementation', verification: 'verification', release_readiness: 'release', learning: 'outcome' };
  for (const kind of ['analysis', 'specification', 'design', 'planning']) {
    const entry = stage('entry', kind, ['request'], contracts[kind]);
    const workflow = { id: 'entry-test', intent: 'analysis', risk_ceiling: 'any', entry: 'start', nodes: [{ step_id: 'start', stage_id: entry.id, bindings: { request: ['$request'] } }], edges: [], switches: [], terminals: [{ step_id: 'start', outcome: 'analysis_complete' }] };
    validateWorkflow(workflow, [entry]);
    for (const forbidden of ['quality_design', 'implementation', 'verification', 'release_readiness', 'learning']) {
      const capabilities = forbidden === 'implementation' ? ['product.write'] : ['release_readiness', 'learning'].includes(forbidden) ? ['evidence.read'] : [];
      assert.throws(() => validateWorkflow(workflow, [{ ...entry, kind: forbidden, capabilities, outputs: [output(contracts[forbidden])] }]), /permitted readonly investigation/);
    }
  }
});

test('non-analysis stage kinds always supply their fixed semantic output contract', () => {
  const kinds = { specification: 'spec', design: 'architecture', quality_design: 'quality', planning: 'plan', implementation: 'implementation', verification: 'verification', release_readiness: 'release', learning: 'outcome' };
  for (const [kind, contract] of Object.entries(kinds)) {
    const capabilities = kind === 'implementation' ? ['product.write'] : ['release_readiness', 'learning'].includes(kind) ? ['evidence.read'] : [];
    const definition = stage(`typed-${kind}`, kind, ['request'], contract, { capabilities });
    validateStage(definition);
    assert.throws(() => validateStage({ ...definition, outputs: [output('analysis')] }), /fixed semantic output/);
  }
});

test('unknown effects fail closed and only implementation may declare product.write', () => {
  assert.throws(() => validateStage({ ...definitions[0], capabilities: ['network.any'] }), /unknown capability/);
  assert.throws(() => validateStage({ ...definitions[0], capabilities: ['product.write'] }), /implementation kind/);
  assert.throws(() => validateStage({ ...definitions[1], capabilities: [] }), /must declare product.write/);
  assert.throws(() => validateStage({ ...definitions[5], capabilities: [] }), /external evidence/);
  const bad = pack('team', definitions, [delivery()]);
  bad.tool_bindings = [{ id: 'arbitrary', capabilities: ['shell.any'] }];
  assert.throws(() => resolveDefinitions(bad), /unknown tool effect/);
});

test('implementation requires bound upstream authority before downstream verification', () => {
  const missing = delivery();
  delete missing.nodes[1].authority;
  assert.throws(() => validateWorkflow(missing, definitions), /upstream authority/);
  const wrong = delivery();
  wrong.nodes[1].authority = 'check';
  assert.throws(() => validateWorkflow(wrong, definitions), /upstream authority/);
  const noBinding = delivery();
  const optional = copy(definitions);
  optional[1].inputs = [];
  optional[1].optional_inputs = ['plan'];
  noBinding.nodes[1].bindings = {};
  assert.throws(() => validateWorkflow(noBinding, optional), /bound plan\/change/);
});

test('every reachable sink needs its own valid terminal and final verification', () => {
  const noTerminal = delivery();
  noTerminal.terminals = [{ step_id: 'plan', outcome: 'analysis_complete' }];
  assert.throws(() => validateWorkflow(noTerminal, definitions), /no terminal/);
  const noVerify = delivery();
  noVerify.nodes.pop(); noVerify.edges.pop();
  noVerify.terminals = [{ step_id: 'write', outcome: 'verified' }];
  assert.throws(() => validateWorkflow(noVerify, definitions), /verification kind/);
  const falseAnalysis = delivery();
  falseAnalysis.terminals[0].outcome = 'analysis_complete';
  assert.throws(() => validateWorkflow(falseAnalysis, definitions), /delivery terminal/);
});

test('each branch is validated, including an implementation hidden on an unselected path', () => {
  const workflow = delivery();
  workflow.nodes.unshift({ step_id: 'assess', stage_id: 'team.assess', bindings: { request: ['$request'] } });
  workflow.entry = 'assess';
  workflow.nodes.push({ step_id: 'unsafe', stage_id: 'team.implement', bindings: { plan: ['plan'] }, authority: 'plan' });
  workflow.edges.unshift({ from: 'assess', to: 'plan' });
  workflow.edges.push({ from: 'plan', to: 'unsafe' });
  workflow.terminals.push({ step_id: 'unsafe', outcome: 'analysis_complete' });
  assert.throws(() => validateWorkflow(workflow, definitions), /writers must be explicitly ordered|implementation path|delivery terminal/);
});

test('a write after an earlier verification cannot inherit its terminal guarantee', () => {
  const workflow = delivery();
  workflow.nodes.push({ step_id: 'late-write', stage_id: 'team.implement', bindings: { plan: ['plan'] }, authority: 'plan' });
  workflow.nodes.push({ step_id: 'learn', stage_id: 'team.learn', bindings: { verification: ['check'] } });
  workflow.edges.push({ from: 'check', to: 'late-write' }, { from: 'late-write', to: 'learn' });
  workflow.terminals = [{ step_id: 'learn', outcome: 'learned' }];
  assert.throws(() => validateWorkflow(workflow, definitions), /downstream final verification/);
});

test('analysis routes cannot write products or claim verified outcomes', () => {
  const workflow = delivery(); workflow.intent = 'analysis';
  assert.throws(() => validateWorkflow(workflow, definitions), /cannot write product/);
  const analysis = branch(); analysis.terminals[0].outcome = 'verified';
  assert.throws(() => validateWorkflow(analysis, definitions), /analysis cannot claim/);
});

test('exclusive routing uses exact approved typed facts; false may select the default', () => {
  const yes = routingRecord(true);
  const selected = selectBranches(branch(), definitions, yes.records, yes.ctx);
  assert.deepEqual(selected.choices, { route: 'yes' });
  assert.deepEqual([...selected.active], ['assess', 'left', 'join']);
  assert.deepEqual(selected.pruned, ['right']);
  const no = routingRecord(false);
  assert.deepEqual(selectBranches(branch(), definitions, no.records, no.ctx).choices, { route: 'no' });
  const string = routingRecord('true');
  assert.throws(() => selectBranches(branch(), definitions, string.records, string.ctx), /mistyped/);
});

test('missing, stale, unapproved, or altered routing facts cannot trigger even a default branch', () => {
  const missing = routingRecord();
  missing.records.assess.facts = {};
  assert.throws(() => selectBranches(branch(), definitions, missing.records, missing.ctx), /differ from approved artifact/);
  const stale = routingRecord();
  stale.ctx.artifact_digests.assess = 'changed';
  assert.throws(() => selectBranches(branch(), definitions, stale.records, stale.ctx), /stale/);
  const pending = routingRecord(); pending.records.assess.approval.decision = 'pending';
  assert.throws(() => selectBranches(branch(), definitions, pending.records, pending.ctx), /approval missing/);
  const tampered = routingRecord(); tampered.records.assess.facts = { approved_path: false };
  assert.throws(() => selectBranches(branch(), definitions, tampered.records, tampered.ctx), /differ from approved artifact/);
  const absent = routingRecord(undefined);
  absent.records.assess.artifact.routing_facts = {};
  absent.records.assess.facts = {};
  absent.records.assess.artifact_digest = digest(absent.records.assess.artifact);
  absent.ctx.artifact_digests.assess = absent.records.assess.artifact_digest;
  absent.records.assess.approval = approval('assess', absent.ctx);
  assert.throws(() => selectBranches(branch(), definitions, absent.records, absent.ctx), /missing or mistyped/);
});

test('no-match and multiple-match switches stop instead of choosing by case order', () => {
  const workflow = branch();
  workflow.switches[0].cases[1] = { id: 'no', op: 'eq', value: false };
  const defs = copy(definitions); defs[3].routing_facts.approved_path = 'string';
  workflow.switches[0].cases[0].value = 'left'; workflow.switches[0].cases[1].value = 'right';
  const facts = routingRecord('unknown');
  assert.throws(() => selectBranches(workflow, defs, facts.records, facts.ctx), /no switch case/);
  const duplicate = branch(); duplicate.switches[0].cases[1] = { id: 'no', op: 'eq', value: true };
  const yes = routingRecord(true);
  assert.throws(() => selectBranches(duplicate, definitions, yes.records, yes.ctx), /multiple switch cases/);
});

test('switch definitions reject undeclared facts, wrong case types, and unconditional fan-out', () => {
  const unknown = branch(); unknown.switches[0].fact = 'free_text';
  assert.throws(() => validateWorkflow(unknown, definitions), /must be declared/);
  const wrongType = branch(); wrongType.switches[0].cases[0].value = 'true';
  assert.throws(() => validateWorkflow(wrongType, definitions), /typed switch case/);
  const both = branch(); both.edges.push({ from: 'assess', to: 'join' });
  assert.throws(() => validateWorkflow(both, definitions), /unconditional/);
});

test('AND-join waits for every selected predecessor; a pruned predecessor is never approved', () => {
  const workflow = branch();
  const choices = { route: 'yes' };
  assert.deepEqual(readyNodes(workflow, definitions, { choices, approved: ['assess'] }).ready, ['left']);
  assert.deepEqual(readyNodes(workflow, definitions, { choices, approved: ['assess', 'left'] }), { ready: ['join'], pruned: ['right'], pending: [] });
  assert.throws(() => readyNodes(workflow, definitions, { choices, approved: ['assess', 'left', 'right'] }), /cannot count as approved/);
  const fork = branch(); fork.switches = []; fork.edges.forEach(edge => delete edge.when);
  validateWorkflow(fork, definitions);
  assert.deepEqual(readyNodes(fork, definitions, { approved: ['assess'] }).ready, ['left', 'right']);
  assert.deepEqual(readyNodes(fork, definitions, { approved: ['assess', 'left'] }).ready, ['right']);
  assert.deepEqual(readyNodes(fork, definitions, { approved: ['assess', 'left', 'right'] }).ready, ['join']);
});

test('undecided switches leave descendants pending and cannot authorize them', () => {
  const status = readyNodes(branch(), definitions, { approved: ['assess'] });
  assert.deepEqual(status.ready, []);
  assert.deepEqual(status.pruned, []);
  assert.deepEqual(new Set(status.pending), new Set(['left', 'right', 'join']));
});

test('join reachable through a completed lane still waits for another lane with an unresolved switch', () => {
  const workflow = branch();
  workflow.nodes.unshift({ step_id: 'start', stage_id: 'team.assess', bindings: { request: ['$request'] } });
  workflow.nodes.push({ step_id: 'independent', stage_id: 'team.report', bindings: { analysis: ['start'] } });
  workflow.entry = 'start';
  workflow.edges.unshift({ from: 'start', to: 'assess' }, { from: 'start', to: 'independent' });
  workflow.edges.push({ from: 'independent', to: 'join' });
  workflow.nodes.find(node => node.step_id === 'join').bindings.analysis.push('independent');
  validateWorkflow(workflow, definitions);
  assert.deepEqual(readyNodes(workflow, definitions, { approved: ['start', 'assess', 'independent'] }).ready, []);
  assert.deepEqual(readyNodes(workflow, definitions, { choices: { route: 'yes' }, approved: ['start', 'assess', 'independent'] }).ready, ['left']);
  assert.deepEqual(readyNodes(workflow, definitions, { choices: { route: 'yes' }, approved: ['start', 'assess', 'independent', 'left'] }).ready, ['join']);
});

test('dispatch cannot forge a branch choice or reuse facts without their approved artifact', () => {
  const { ctx, records } = routingRecord(true);
  const options = { context: ctx, choices: { route: 'yes' }, approvals: { assess: records.assess.approval } };
  assert.throws(() => assertDispatch(branch(), definitions, 'left', options), /approval missing/);
  assertDispatch(branch(), definitions, 'left', { ...options, branch_records: records });
  assert.throws(() => assertDispatch(branch(), definitions, 'right', { ...options, choices: { route: 'no' }, branch_records: records }), /differs from approved/);
});

test('two product writers require explicit ordering even if a scheduler would serialize them', () => {
  const workflow = delivery();
  workflow.nodes.splice(2, 0, { step_id: 'write-2', stage_id: 'team.implement', bindings: { plan: ['plan'] }, authority: 'plan' });
  workflow.nodes[3].bindings.implementation.push('write-2');
  workflow.edges.push({ from: 'plan', to: 'write-2' }, { from: 'write-2', to: 'check' });
  assert.throws(() => validateWorkflow(workflow, definitions), /writers must be explicitly ordered/);
  workflow.edges = [{ from: 'plan', to: 'write' }, { from: 'write', to: 'write-2' }, { from: 'write-2', to: 'check' }];
  assert.deepEqual(validateWorkflow(workflow, definitions).order, ['plan', 'write', 'write-2', 'check']);
});

test('dispatch enforces current approvals, readiness, and approved implementation authority', () => {
  const ctx = context();
  assert.throws(() => assertDispatch(delivery(), definitions, 'write', { context: ctx }), /not ready/);
  const approved = { plan: approval('plan', ctx) };
  assert.deepEqual(assertDispatch(delivery(), definitions, 'write', { context: ctx, approvals: approved }).capabilities, ['product.write']);
  ctx.artifact_digests.plan = 'revised';
  assert.throws(() => assertDispatch(delivery(), definitions, 'write', { context: ctx, approvals: approved }), /stale/);
});

test('a product writer excludes active readers and writers; readers exclude an active writer', () => {
  const ctx = context();
  const options = { context: ctx, approvals: { plan: approval('plan', ctx) } };
  for (const access of ['read', 'write']) {
    assert.throws(() => assertDispatch(delivery(), definitions, 'write', { ...options, running: [{ step_id: 'outside-reader', product_access: access }] }), /exclusion/);
  }
  assertDispatch(delivery(), definitions, 'write', { ...options, running: [{ step_id: 'artifact-only', product_access: 'none' }] });
  assert.throws(() => assertDispatch(delivery(), definitions, 'check', {
    context: ctx, approvals: { plan: approval('plan', ctx), write: approval('write', ctx) }, running: [{ step_id: 'other-writer', product_access: 'write' }],
  }), /exclusion/);
});

test('approval identity is bound to exact work, step, request, resolution and artifact', () => {
  const ctx = context();
  const expected = { ...ctx, step_id: 'plan', artifact_digest: ctx.artifact_digests.plan };
  assertApproval(approval('plan', ctx), expected);
  for (const key of ['work_id', 'step_id', 'request_digest', 'lock_digest', 'artifact_digest']) {
    assert.throws(() => assertApproval({ ...approval('plan', ctx), [key]: 'old' }, expected), /stale/);
  }
});

function gateFixture() {
  const candidate = { digest: 'candidate-v1', work_id: 'work', lock_digest: 'lock', implementation_runs: [{ step_id: 'write', run_id: 'impl-1', actor: 'developer' }] };
  const verification = { work_id: 'work', lock_digest: 'lock', step_id: 'check', run_id: 'verify-1', actor: 'reviewer', candidate_digest: candidate.digest };
  verification.gates = GATE_KINDS.map(kind => ({
    kind, status: 'PASS', work_id: 'work', lock_digest: 'lock', run_id: 'verify-1', actor: `${kind}-reviewer`, candidate_digest: candidate.digest,
    checks: [{
      blocking: true, status: 'PASS', command: `check-${kind}`, evidence_digest: `evidence-${kind}`,
      executed_count: 1, skipped_count: 0, exit_code: 0,
      raw_evidence: [{ path: `synthetic/${kind}.json`, sha256: digest({ synthetic: kind }) }],
      rule_evidence: [{ rule_id: `${kind}-rule-1`, evidence_refs: [`synthetic/${kind}.json`] }],
    }],
  }));
  return { candidate, verification, options: { approved_commands: ['check-architecture', 'check-quality'] } };
}

test('both executable Gate contracts and an independent final verifier are mandatory', () => {
  const { candidate, verification, options } = gateFixture();
  assert.equal(validateVerification(verification, candidate, options), true);
  const missing = copy(verification); missing.gates.pop();
  assert.throws(() => validateVerification(missing, candidate, options), /both Gate/);
  const duplicate = copy(verification); duplicate.gates[1].kind = 'architecture';
  assert.throws(() => validateVerification(duplicate, candidate, options), /duplicate Gate/);
  assert.throws(() => validateVerification({ ...verification, actor: 'developer' }, candidate, options), /independent/);
  const selfGate = copy(verification); selfGate.gates[0].actor = 'developer';
  assert.throws(() => validateVerification(selfGate, candidate, options), /independent/);
});

test('stale candidate or stale Gate evidence invalidates previously passing verification', () => {
  const { candidate, verification, options } = gateFixture();
  assert.throws(() => validateVerification(verification, { ...candidate, digest: 'candidate-v2' }, options), /stale verification/);
  for (const key of ['candidate_digest', 'lock_digest', 'work_id', 'run_id']) {
    const stale = copy(verification); stale.gates[0][key] = 'old';
    assert.throws(() => validateVerification(stale, candidate, options), /stale Gate/);
  }
});

test('manual assertions, unapproved commands and empty checks cannot substitute for Gates', () => {
  const { candidate, verification, options } = gateFixture();
  const empty = copy(verification); empty.gates[0].checks = [];
  assert.throws(() => validateVerification(empty, candidate, options), /executable blocking/);
  const manual = copy(verification); delete manual.gates[0].checks[0].command;
  assert.throws(() => validateVerification(manual, candidate, options), /command\/evidence/);
  assert.throws(() => validateVerification(verification, candidate, { approved_commands: [] }), /not approved/);
  const fail = copy(verification); fail.gates[1].checks[0].status = 'FAIL';
  assert.throws(() => validateVerification(fail, candidate, options), /blocking Gate check failed/);
});

test('textual PASS cannot substitute for nonzero execution, raw output and rule evidence', () => {
  const { candidate, verification, options } = gateFixture();
  for (const patch of [
    { executed_count: 0 }, { executed_count: undefined }, { executed_count: -1 }, { executed_count: 1.5 },
    { skipped_count: 1 }, { skipped_count: undefined }, { exit_code: 1 }, { exit_code: undefined },
  ]) {
    const invalid = copy(verification); Object.assign(invalid.gates[0].checks[0], patch);
    assert.throws(() => validateVerification(invalid, candidate, options), /execute nonzero checks/);
  }
  for (const raw_evidence of [undefined, [], [{ path: '', sha256: 'x' }], [{ path: 'report.json', sha256: 'not-a-digest' }]]) {
    const invalid = copy(verification); invalid.gates[0].checks[0].raw_evidence = raw_evidence;
    assert.throws(() => validateVerification(invalid, candidate, options), /raw evidence references/);
  }
  for (const rule_evidence of [undefined, [], [{ rule_id: 'rule', evidence_refs: [] }], [{ rule_id: 'rule', evidence_refs: ['unrelated.json'] }]]) {
    const invalid = copy(verification); invalid.gates[0].checks[0].rule_evidence = rule_evidence;
    assert.throws(() => validateVerification(invalid, candidate, options), /nonzero rule evidence/);
  }
});

test('work lock covers definitions, graph, tool bindings and source/config digests', () => {
  const resolved = { ...resolveDefinitions(pack('team', definitions, [delivery()])), sources: { team: 'bytes-1', project_config: 'config-1' } };
  const lock = createWorkLock(resolved);
  assertWorkLock(lock, copy(resolved));
  assert.equal(digest({ b: 2, a: 1 }), digest({ a: 1, b: 2 }));
  for (const mutate of [
    value => { value.stages[0].prompt = 'changed'; },
    value => { value.workflows[0].risk_ceiling = 'any'; },
    value => { value.tool_bindings.push({ id: 'extra' }); },
    value => { value.sources.project_config = 'config-2'; },
  ]) {
    const changed = copy(resolved); mutate(changed);
    assert.throws(() => assertWorkLock(lock, changed), /work lock changed/);
  }
  const tampered = copy(lock); tampered.resolved.sources.team = 'changed';
  assert.throws(() => assertWorkLock(tampered, resolved), /work lock changed/);
});

test('automatic approval is bounded by low risk, explicit eligible step and work policy', () => {
  const policy = { mode: 'auto_low_risk', work_id: 'work', lock_digest: 'lock', steps: ['write'], allowed_write_paths: ['src/a'], allowed_commands: ['node test'], authorization: { source: 'user', actor: 'human', statement: 'synthetic limited delegation' } };
  const options = { risk: 'low', step_id: 'write', work_id: 'work', lock_digest: 'lock', policy, paths: ['src/a'], commands: ['node test'] };
  assert.equal(canAutoApprove(delivery(), definitions[1], options), true);
  for (const change of [{ risk: 'high' }, { policy: null }, { step_id: 'unknown' }, { work_id: 'other' }, { lock_digest: 'changed' }, { paths: ['src/b'] }, { commands: ['deploy'] }]) {
    assert.equal(canAutoApprove(delivery(), definitions[1], { ...options, ...change }), false);
  }
  assert.equal(canAutoApprove({ ...delivery(), risk_ceiling: 'any' }, definitions[1], options), false);
  assert.equal(canAutoApprove(delivery(), { ...definitions[1], auto_eligible: false }, options), false);
  for (const kind of ['release_readiness', 'learning']) assert.equal(canAutoApprove(delivery(), { ...definitions[1], kind }, options), false);
  assert.equal(canAutoApprove({ ...delivery(), intent: 'analysis' }, definitions[1], options), false);
  assert.equal(canAutoApprove({ ...delivery(), id: 'core.standard' }, definitions[1], options), false);
  assert.equal(canAutoApprove(delivery(), { ...definitions[1], id: 'undeclared-stage' }, options), false);
  const nonexistentStep = { ...options, step_id: 'undeclared-step', policy: { ...policy, steps: ['undeclared-step'] } };
  assert.equal(canAutoApprove(delivery(), definitions[1], nonexistentStep), false);
  for (const revocation of [{ revoked: true }, { revoked_at: 'synthetic-revocation-time' }, { status: 'revoked' }]) {
    assert.equal(canAutoApprove(delivery(), definitions[1], { ...options, policy: { ...policy, ...revocation } }), false);
  }
});

test('pack precedence requires full explicit replacement and never merges colliding IDs', () => {
  const builtin = pack('core', definitions, [delivery()]);
  const teamReplacement = { ...copy(definitions[0]), prompt: 'team:plan.md' };
  const projectReplacement = { ...copy(definitions[0]), prompt: 'project:plan.md' };
  const team = pack('team', [], [], [{ kind: 'stage', id: teamReplacement.id, replacement: teamReplacement }]);
  const project = pack('project', [], [], [{ kind: 'stage', id: projectReplacement.id, replacement: projectReplacement }]);
  assert.equal(resolveDefinitions(builtin, team, project).stages[0].prompt, 'project:plan.md');
  assert.throws(() => resolveDefinitions(builtin, pack('team', [teamReplacement])), /implicit stage merge/);
  const partial = pack('team', [], [], [{ kind: 'stage', id: teamReplacement.id, replacement: { id: teamReplacement.id, prompt: 'partial' } }]);
  assert.throws(() => resolveDefinitions(builtin, partial), /unknown stage kind/);
  assert.equal(builtin.stages[0].prompt, definitions[0].prompt, 'resolution does not mutate lower precedence pack');
});

test('overrides cannot widen effects, stage kind, auto eligibility or remove required contracts', () => {
  const builtin = pack('core', definitions, [delivery()]);
  for (const replacement of [
    { ...copy(definitions[0]), capabilities: ['knowledge.read'] },
    { ...copy(definitions[0]), kind: 'implementation', capabilities: ['product.write'], outputs: [output('implementation')] },
    { ...copy(definitions[0]), inputs: [] },
    { ...copy(definitions[0]), outputs: [output('analysis')] },
    { ...copy(definitions[3]), auto_eligible: true },
  ]) {
    const team = pack('team', [], [], [{ kind: 'stage', id: replacement.id, replacement }]);
    assert.throws(() => resolveDefinitions(builtin, team), /widens|removes required|fixed semantic output/);
  }
  const widened = { ...delivery(), risk_ceiling: 'any' };
  assert.throws(() => resolveDefinitions(builtin, pack('team', [], [], [{ kind: 'workflow', id: widened.id, replacement: widened }])), /widens workflow/);
});

test('pack rejects unsupported contracts and validates workflow replacements after resolving them', () => {
  assert.throws(() => resolveDefinitions({ ...pack('old'), core_contract: 99 }), /unsupported pack/);
  const invalid = delivery(); invalid.nodes[1].authority = 'missing';
  assert.throws(() => resolveDefinitions(pack('core', definitions, [delivery()]), pack('team', [], [], [{ kind: 'workflow', id: invalid.id, replacement: invalid }])), /upstream authority/);
});

test('tool bindings declare known effects and IDs but grant no ambient tool authorization', () => {
  const locked = { id: 'tracker-read', connector: 'synthetic-tracker', operation: 'get', effect: 'read', target: 'issue-1', input_contract: 'request', output_contract: 'project', authorization_ref: null };
  const binding = { ...locked, authorization_ref: 'tool-grant-1' };
  const caller = { ...copy(definitions[0]), tool_binding_ids: [locked.id] };
  const fixture = pack('tools', [caller]); fixture.tool_bindings = [locked];
  assert.equal(resolveDefinitions(fixture).tool_bindings.length, 1);
  assert.throws(() => resolveDefinitions(pack('unknown', [caller])), /unknown tool binding id/);
  const unsafe = copy(fixture); unsafe.tool_bindings[0].effect = 'execute';
  assert.throws(() => resolveDefinitions(unsafe), /unknown tool effect/);
  const preauthorized = copy(fixture); preauthorized.tool_bindings[0].authorization_ref = 'pack-granted-authority';
  assert.throws(() => resolveDefinitions(preauthorized), /cannot contain work authorization/);
  const authorization = { ref: 'tool-grant-1', source: 'user', actor: 'human', connector: binding.connector, operation: binding.operation, effect: binding.effect, target: binding.target, work_id: 'work', lock_digest: 'lock' };
  const options = { locked_binding: locked, available_operations: [locked], authorization, work_id: 'work', lock_digest: 'lock' };
  assert.equal(assertToolRequest(caller, binding, options), true);
  assert.throws(() => assertToolRequest(definitions[0], binding, options), /did not request/);
  assert.throws(() => assertToolRequest(caller, binding, { ...options, authorization: null }), /authorization missing/);
  assert.throws(() => assertToolRequest(caller, binding, { ...options, available_operations: [] }), /unavailable/);
  assert.throws(() => assertToolRequest(caller, binding, { ...options, authorization: { ...authorization, effect: 'write' } }), /scope mismatch/);
  assert.throws(() => assertToolRequest(caller, binding, { ...options, lock_digest: 'changed' }), /stale tool/);
  for (const revocation of [{ revoked: true }, { status: 'revoked' }, { revoked_at: 'synthetic-revocation-time' }]) {
    assert.throws(() => assertToolRequest(caller, binding, { ...options, authorization: { ...authorization, ...revocation } }), /tool authorization revoked/);
  }
  assert.throws(() => assertToolRequest(caller, binding, { ...options, locked_binding: undefined }), /locked definition/);
  for (const patch of [{ target: 'issue-2' }, { effect: 'write' }, { operation: 'update' }, { output_contract: 'knowledge' }]) {
    assert.throws(() => assertToolRequest(caller, { ...binding, ...patch }, options), /locked definition/);
  }
  assert.equal(locked.authorization_ref, null, 'runtime authorization never mutates the locked definition');
  const widened = { ...copy(definitions[0]), tool_binding_ids: [binding.id] };
  const override = pack('team', [], [], [{ kind: 'stage', id: widened.id, replacement: widened }]); override.tool_bindings = [locked];
  assert.throws(() => resolveDefinitions(pack('core', definitions), override), /widens tool/);
});

test('real builtin routes normalize equivalently while keeping compact semantic output contracts', () => {
  const root = new URL('../', import.meta.url);
  const metadataPath = new URL('workflow/stage-contracts.json', root);
  assert.ok(existsSync(metadataPath), 'builtin contract metadata must ship with model tests');
  const catalog = JSON.parse(readFileSync(new URL('workflow/stages.json', root), 'utf8'));
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
  const manifest = JSON.parse(readFileSync(new URL('manifest.json', root), 'utf8'));
  const builtin = normalizeBuiltins(catalog, metadata, manifest.version);
  assert.equal(builtin.version, manifest.version);
  assert.equal(normalizeBuiltins(catalog, metadata).version, 'synthetic-unversioned');
  assert.ok(builtin.stages.every(stage => Array.isArray(stage.tool_binding_ids) && stage.tool_binding_ids.length === 0));
  for (const [name, legacy] of Object.entries(catalog.profiles)) {
    const workflow = builtin.workflows.find(item => item.id === `core.${name}`);
    assert.deepEqual(workflow.nodes.map(node => node.step_id), legacy.stages);
    assert.equal(workflow.nodes.find(node => node.stage_id === 'core.implement').authority, legacy.implementation_authority);
    assert.equal(workflow.terminals[0].step_id, legacy.terminal_stage);
    assert.deepEqual(validateWorkflow(workflow, builtin.stages).required_gate_kinds, ['architecture', 'quality']);
    for (const node of workflow.nodes) {
      const definition = builtin.stages.find(stage => stage.id === node.stage_id);
      const expectedNames = legacy.output_overrides[node.step_id]?.map(output => output.name) ?? catalog.stages.find(stage => stage.id === node.step_id).outputs;
      assert.deepEqual((node.outputs ?? definition.outputs).map(output => output.name), expectedNames);
    }
  }
  for (const name of ['enhance', 'fix']) {
    const workflow = builtin.workflows.find(item => item.id === `core.${name}`);
    assert.equal(workflow.nodes.find(node => node.step_id === 'implement').outputs[0].contract, 'implementation');
    assert.equal(workflow.nodes.find(node => node.step_id === 'verify').outputs[0].contract, 'verification');
  }
  const standard = copy(builtin.workflows.find(workflow => workflow.id === 'core.standard'));
  standard.risk_ceiling = 'low';
  assert.throws(() => resolveDefinitions(builtin, pack('team', [], [], [{ kind: 'workflow', id: standard.id, replacement: standard }])), /core.standard risk ceiling/);
});

test('real API team pack resolves, selects review depth, and waits at its two-lane AND-join', () => {
  const root = new URL('../', import.meta.url);
  const json = name => JSON.parse(readFileSync(new URL(name, root), 'utf8'));
  const builtin = normalizeBuiltins(json('workflow/stages.json'), json('workflow/stage-contracts.json'), json('manifest.json').version);
  const api = json('examples/team-packs/api-team/pack.json');
  const resolved = resolveDefinitions(builtin, api);
  const workflow = resolved.workflows.find(item => item.id === 'team.api-enhancement');
  assert.equal(validateWorkflow(workflow, resolved.stages).scenarios, 2);
  for (const [value, selected] of [[true, 'review'], [false, 'direct']]) {
    const artifact = { routing_facts: { needs_review: value } };
    const ctx = context(['scope', 'compatibility', 'tests-review', 'implement', 'verify']);
    ctx.artifact_digests.scope = digest(artifact);
    const records = { scope: { artifact, facts: artifact.routing_facts, artifact_digest: digest(artifact), approval: approval('scope', ctx) } };
    const state = selectBranches(workflow, resolved.stages, records, ctx);
    assert.deepEqual(state.choices, { 'review-depth': selected });
    if (value) {
      assert.deepEqual(readyNodes(workflow, resolved.stages, { choices: state.choices, approved: ['scope'] }).ready, ['compatibility', 'tests-review']);
      assert.deepEqual(readyNodes(workflow, resolved.stages, { choices: state.choices, approved: ['scope', 'compatibility'] }).ready, ['tests-review']);
      assert.deepEqual(readyNodes(workflow, resolved.stages, { choices: state.choices, approved: ['scope', 'compatibility', 'tests-review'] }).ready, ['implement']);
    } else {
      assert.deepEqual(readyNodes(workflow, resolved.stages, { choices: state.choices, approved: ['scope'] }), { ready: ['implement'], pruned: ['compatibility', 'tests-review'], pending: [] });
    }
  }
});

test('real design team pack resolves to a read-only analysis terminal after both review lanes', () => {
  const root = new URL('../', import.meta.url);
  const json = name => JSON.parse(readFileSync(new URL(name, root), 'utf8'));
  const builtin = normalizeBuiltins(json('workflow/stages.json'), json('workflow/stage-contracts.json'), json('manifest.json').version);
  const design = json('examples/team-packs/design-team/pack.json');
  const resolved = resolveDefinitions(builtin, design);
  const workflow = resolved.workflows.find(item => item.id === 'team.design-analysis');
  validateWorkflow(workflow, resolved.stages);
  assert.deepEqual(readyNodes(workflow, resolved.stages, { approved: ['brief'] }).ready, ['options', 'security']);
  assert.deepEqual(readyNodes(workflow, resolved.stages, { approved: ['brief', 'options'] }).ready, ['security']);
  assert.deepEqual(readyNodes(workflow, resolved.stages, { approved: ['brief', 'options', 'security'] }).ready, ['synthesis']);
  assert.equal(workflow.terminals[0].outcome, 'analysis_complete');
  assert.ok(workflow.nodes.every(node => !resolved.stages.find(stage => stage.id === node.stage_id).capabilities.includes('product.write')));
});
