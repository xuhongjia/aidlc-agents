// Maintainer-only contracts. No real Jira approvals, browser execution or delivery.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { normalizeBuiltins, resolveDefinitions, validateWorkflow, readyNodes } from './support/workflow-model.mjs';
import { instructionPlan, safeFile, byteDigest } from './support/context-model.mjs';

const root = new URL('../', import.meta.url);
const json = file => JSON.parse(readFileSync(new URL(file, root)));
const team = json('examples/team-packs/role-team/pack.json');
const builtin = normalizeBuiltins(json('workflow/stages.json'), json('workflow/stage-contracts.json'), json('manifest.json').version);
const resolved = resolveDefinitions(builtin, team);
const flow = resolved.workflows.find(item => item.id === 'team.role-delivery');
const context = json('workflow/context.json');
const stageFor = (graph, stages, step) => stages.find(item => item.id === graph.nodes.find(node => node.step_id === step).stage_id);

// Synthetic setup-readiness model, separate from generic graph validity. Names
// here are fixtures, never proposed production browser tool names or permissions.
const observedBrowser = [
  { id: 'fixture.read', connector: 'synthetic-browser', operation: 'fixture-observe', effect: 'read', input_contract: 'request', output_contract: 'analysis' },
  { id: 'fixture.write', connector: 'synthetic-browser', operation: 'fixture-interact', effect: 'write', input_contract: 'request', output_contract: 'analysis' },
];
const testTarget = 'synthetic:test-environment';
const baseBytes = readFileSync(new URL('examples/team-packs/role-team/pack.json', root));
function assertBrowserReady(pack, workflowId, observed, target, provenance) {
  const definitions = resolveDefinitions(builtin, pack);
  const workflow = definitions.workflows.find(item => item.id === workflowId);
  const qa = stageFor(workflow, definitions.stages, 'qa');
  assert.ok(qa.tool_binding_ids?.length, 'QA browser bindings absent');
  assert.equal(provenance?.kind, 'local-derived', 'configured pack needs derived provenance');
  assert.equal(provenance.base_sha256, byteDigest(baseBytes), 'base template identity drift');
  assert.equal(provenance.derived_sha256, byteDigest(Buffer.from(JSON.stringify(pack))), 'derived pack identity drift');
  assert.deepEqual([...qa.tool_binding_ids].sort(), observed.map(item => item.id).sort(), 'operation set differs from observed host schema');
  for (const required of observed) {
    const binding = definitions.tool_bindings.find(item => item.id === required.id);
    assert.ok(binding, 'browser binding unregistered');
    for (const field of ['connector', 'operation', 'effect', 'input_contract', 'output_contract'])
      assert.equal(binding[field], required[field], `browser ${field} differs from observed host schema`);
    assert.equal(binding.target, target, 'browser target differs from configured test target');
    assert.equal(binding.authorization_ref, null, 'package must not preauthorize a browser write');
  }
  return { status: 'configured', execution_authorized: false };
}
function browserFixture() {
  const pack = structuredClone(team);
  const workflow = pack.workflows.find(item => item.id === 'team.role-delivery');
  const qa = stageFor(workflow, pack.stages, 'qa');
  pack.tool_bindings = observedBrowser.map(item => ({ ...item, target: testTarget, authorization_ref: null }));
  qa.tool_binding_ids = observedBrowser.map(item => item.id);
  const provenance = { kind: 'local-derived', base_sha256: byteDigest(baseBytes), derived_sha256: byteDigest(Buffer.from(JSON.stringify(pack))) };
  return { pack, provenance };
}

// Additional semantic contract for this opt-in recipe. The generic DAG validator
// cannot infer that an arbitrary analysis artifact is an approved QA execution.
function validateRolePath(graph, stages) {
  const validated = validateWorkflow(graph, stages);
  const qa = graph.nodes.find(node => node.step_id === 'qa');
  const verify = graph.nodes.find(node => node.step_id === 'verify');
  const implement = graph.nodes.find(node => node.step_id === 'implement');
  assert.ok(qa && verify && implement, 'role checkpoints required');
  assert.equal(stageFor(graph, stages, 'qa').kind, 'analysis');
  assert.ok(!stageFor(graph, stages, 'qa').capabilities.includes('product.write'));
  assert.deepEqual(qa.bindings.implementation, ['implement']);
  assert.deepEqual(verify.bindings.analysis, ['qa'], 'final verifier requires the QA execution producer');
  assert.ok(stageFor(graph, stages, 'verify').inputs.includes('analysis'), 'QA evidence must be required');
  assert.ok(graph.edges.some(edge => edge.from === 'implement' && edge.to === 'qa'));
  assert.ok(graph.edges.some(edge => edge.from === 'qa' && edge.to === 'verify'));
  assert.deepEqual(graph.terminals, [{ step_id: 'verify', outcome: 'verified' }]);
  assert.equal(stages.filter(stage => graph.nodes.some(node => node.stage_id === stage.id) && stage.kind === 'verification').length, 1);
  return validated;
}

test('role recipe is an optional five-node delivery graph with one final verification', () => {
  assert.equal(team.contract_version, 1);
  assert.deepEqual(team.overrides, []);
  assert.equal(flow.risk_ceiling, 'any');
  assert.deepEqual(validateRolePath(flow, resolved.stages).order, ['intake', 'design', 'implement', 'qa', 'verify']);
  for (const stage of team.stages) assert.equal(stage.auto_eligible, false);
  for (const original of builtin.stages) assert.deepEqual(resolved.stages.find(stage => stage.id === original.id), original);
  for (const original of builtin.workflows) assert.deepEqual(resolved.workflows.find(workflow => workflow.id === original.id), original);
});

test('PO and test-design preparation use real analysis DAGs without claiming delivery', () => {
  for (const id of ['team.prd', 'team.story', 'team.test-design']) {
    const workflow = resolved.workflows.find(item => item.id === id);
    assert.equal(workflow.intent, 'analysis');
    assert.equal(workflow.nodes.length, 1);
    assert.deepEqual(workflow.terminals, [{ step_id: workflow.entry, outcome: 'analysis_complete' }]);
    assert.deepEqual(validateWorkflow(workflow, resolved.stages).order, [workflow.entry]);
    assert.deepEqual(readyNodes(workflow, resolved.stages).ready, [workflow.entry]);
    const stage = stageFor(workflow, resolved.stages, workflow.entry);
    assert.ok(!stage.capabilities.includes('product.write'));
    const refs = instructionPlan(context, stage, workflow.nodes[0]).map(item => item.ref);
    assert.ok(!refs.includes('core:skills/reusable-capability/test-driven-development/SKILL.md'));
    const fake = structuredClone(workflow);
    fake.terminals[0].outcome = 'verified';
    assert.throws(() => validateWorkflow(fake, resolved.stages), /analysis cannot claim/);
  }
});

test('QA and final verification cannot run before their real predecessor approvals', () => {
  assert.deepEqual(readyNodes(flow, resolved.stages).ready, ['intake']);
  assert.deepEqual(readyNodes(flow, resolved.stages, { approved: ['intake'] }).ready, ['design']);
  assert.deepEqual(readyNodes(flow, resolved.stages, { approved: ['intake', 'design'] }).ready, ['implement']);
  assert.deepEqual(readyNodes(flow, resolved.stages, { approved: ['intake', 'design', 'implement'] }).ready, ['qa']);
  assert.deepEqual(readyNodes(flow, resolved.stages, { approved: ['intake', 'design', 'implement'], running: ['qa'] }).ready, []);
  assert.deepEqual(readyNodes(flow, resolved.stages, { approved: ['intake', 'design', 'implement', 'qa'] }).ready, ['verify']);
});

test('omitting QA evidence, bypassing QA or using imported case design as a result is rejected', () => {
  const missing = structuredClone(flow);
  delete missing.nodes.find(node => node.step_id === 'verify').bindings.analysis;
  assert.throws(() => validateRolePath(missing, resolved.stages), /required input binding/);
  const bypass = structuredClone(flow);
  bypass.edges = bypass.edges.filter(edge => edge.from !== 'qa');
  bypass.edges.push({ from: 'implement', to: 'verify' });
  assert.throws(() => validateRolePath(bypass, resolved.stages), /dependency|terminal/);
  const wrong = structuredClone(flow);
  wrong.nodes.find(node => node.step_id === 'verify').bindings.analysis = ['intake'];
  assert.throws(() => validateRolePath(wrong, resolved.stages), /QA execution producer/);
  const weakenedStages = structuredClone(resolved.stages);
  const verifier = stageFor(flow, weakenedStages, 'verify');
  verifier.inputs = verifier.inputs.filter(input => input !== 'analysis');
  verifier.optional_inputs.push('analysis');
  assert.throws(() => validateRolePath(flow, weakenedStages), /QA evidence must be required/);
});

test('implementation has explicit plan authority and no DEV or QA completion terminal', () => {
  const implementation = flow.nodes.find(node => node.step_id === 'implement');
  assert.equal(implementation.authority, 'design');
  assert.deepEqual(implementation.bindings.plan, ['design']);
  assert.ok(stageFor(flow, resolved.stages, 'design').outputs.some(output => output.contract === 'architecture'));
  assert.ok(stageFor(flow, resolved.stages, 'design').outputs.some(output => output.contract === 'quality'));
  assert.ok(stageFor(flow, resolved.stages, 'design').outputs.some(output => output.contract === 'plan'));
  const early = structuredClone(flow);
  early.nodes = early.nodes.filter(node => !['qa', 'verify'].includes(node.step_id));
  early.edges = early.edges.filter(edge => !['qa', 'verify'].includes(edge.from) && !['qa', 'verify'].includes(edge.to));
  early.terminals = [{ step_id: 'implement', outcome: 'verified' }];
  assert.throws(() => validateWorkflow(early, resolved.stages), /verification kind/);
});

test('all role assets resolve safely and TDD loads only for the Implement node', () => {
  for (const workflow of team.workflows) for (const node of workflow.nodes) {
    const stage = stageFor(workflow, resolved.stages, node.step_id);
    const refs = instructionPlan(context, stage, node).map(item => item.ref);
    assert.ok(refs.includes('core:workflow/role-worker.md'));
    assert.equal(refs.includes('core:skills/reusable-capability/test-driven-development/SKILL.md'), node.step_id === 'implement');
    assert.ok(!refs.includes('core:workflow/role-delivery.md'), 'Parent protocol is not a child instruction');
    for (const ref of refs) {
      const separator = ref.indexOf(':');
      const namespace = ref.slice(0, separator), relative = ref.slice(separator + 1);
      assert.ok(['core', 'team'].includes(namespace));
      safeFile(fileURLToPath(new URL(namespace === 'core' ? './' : 'examples/team-packs/role-team/', root)), relative);
    }
  }
  const qaRefs = instructionPlan(context, stageFor(flow, resolved.stages, 'qa'), flow.nodes.find(node => node.step_id === 'qa'));
  assert.ok(qaRefs.some(item => item.ref === 'core:templates/collaboration/test-run.json'));
  assert.ok(!qaRefs.some(item => item.ref === 'core:workflow/gate-execution.md'));
});

test('final verification dispatch retains distinct Architecture and Quality Reviewer resources', () => {
  const node = flow.nodes.find(item => item.step_id === 'verify');
  const stage = stageFor(flow, resolved.stages, 'verify');
  const architecture = instructionPlan(context, stage, node, { leaf: 'gate-execution', gate_kind: 'architecture' });
  const quality = instructionPlan(context, stage, node, { leaf: 'gate-execution', gate_kind: 'quality' });
  assert.ok(architecture.some(item => item.ref === 'core:agents/architecture-gate-reviewer.md'));
  assert.ok(quality.some(item => item.ref === 'core:agents/quality-gate-reviewer.md'));
  assert.ok(!quality.some(item => item.ref === 'core:skills/reusable-capability/test-driven-development/SKILL.md'));
});

test('unconfigured role template is not browser-ready while exact observed bindings configure without authorizing execution', () => {
  assert.throws(() => assertBrowserReady(team, flow.id, observedBrowser, testTarget, null), /browser bindings absent/);
  const configured = browserFixture();
  assert.deepEqual(assertBrowserReady(configured.pack, flow.id, observedBrowser, testTarget, configured.provenance),
    { status: 'configured', execution_authorized: false });
  const badBase = { ...configured.provenance, base_sha256: 'unverified-source' };
  assert.throws(() => assertBrowserReady(configured.pack, flow.id, observedBrowser, testTarget, badBase), /base template identity/);
});

test('browser readiness rejects unregistered, wrong-target, preauthorized and unobserved operations', () => {
  const cases = [
    [pack => { pack.tool_bindings.pop(); }, /unknown tool binding id/],
    [pack => { pack.tool_bindings[1].target = 'synthetic:other-environment'; }, /browser target/],
    [pack => { pack.tool_bindings[1].authorization_ref = 'fabricated-approval'; }, /cannot contain work authorization/],
    [pack => { pack.tool_bindings[0].operation = 'unobserved-operation'; }, /observed host schema/],
    [pack => { pack.tool_bindings[0].effect = 'write'; }, /observed host schema/],
  ];
  for (const [mutate, expected] of cases) {
    const fixture = browserFixture();
    mutate(fixture.pack);
    fixture.provenance.derived_sha256 = byteDigest(Buffer.from(JSON.stringify(fixture.pack)));
    assert.throws(() => assertBrowserReady(fixture.pack, flow.id, observedBrowser, testTarget, fixture.provenance), expected);
  }
});

test('registered QA permissions cannot widen through override; a newly selected namespaced workflow can declare bindings', () => {
  const fixture = browserFixture();
  const replacement = fixture.pack.stages.find(item => item.id === 'team.role-qa');
  const project = { contract_version: 1, core_contract: 1, id: 'synthetic-project', version: '1.0.0',
    stages: [], workflows: [], overrides: [{ kind: 'stage', id: replacement.id, replacement }], tool_bindings: fixture.pack.tool_bindings };
  assert.throws(() => resolveDefinitions(builtin, team, project), /widens tool operations/);
  const stage = { ...replacement, id: 'project.qa-browser' };
  const selected = structuredClone(flow);
  selected.id = 'project.browser-delivery';
  selected.nodes.find(node => node.step_id === 'qa').stage_id = stage.id;
  project.overrides = [];
  project.stages = [stage];
  project.workflows = [selected];
  const definitions = resolveDefinitions(builtin, team, project);
  const selection = { workflow_id: selected.id };
  const active = definitions.workflows.find(item => item.id === selection.workflow_id);
  assert.deepEqual(validateRolePath(active, definitions.stages).order, ['intake', 'design', 'implement', 'qa', 'verify']);
  assert.deepEqual(stageFor(flow, definitions.stages, 'qa').tool_binding_ids, [], 'original registered QA remains unconfigured');
  assert.deepEqual(stageFor(active, definitions.stages, 'qa').tool_binding_ids, observedBrowser.map(item => item.id));
});
