import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeBuiltins, resolveDefinitions } from './support/workflow-model.mjs';
import { instructionPlan, bindInstructions, byteDigest, safeFile } from './support/context-model.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFileSync(path.join(root, name));
const json = name => JSON.parse(read(name));
const context = json('workflow/context.json');
const core = normalizeBuiltins(json('workflow/stages.json'), json('workflow/stage-contracts.json'), json('manifest.json').version);
const definition = id => core.stages.find(stage => stage.id === 'core.' + id);
const bytes = plan => plan.filter(item => !item.ref.startsWith('core:templates/'))
  .reduce((total, item) => total + read(item.ref.slice(5)).length, 0);

test('core compact instruction budgets halve the frozen conservative baseline including feedback', () => {
  const baseline = json('tests/fixtures/context-baseline.json');
  assert.ok(context.common.reduce((sum, file) => sum + read(file).length, 0) <= 6000);
  for (const id of ['fix', 'enhance']) {
    const workflow = core.workflows.find(item => item.id === 'core.' + id);
    let before = 0, after = 0;
    for (const node of workflow.nodes) {
      const stage = core.stages.find(stage => stage.id === node.stage_id);
      const plan = instructionPlan(context, stage, node, { feedback: stage.kind === 'implementation' ? 2 : 0 });
      const size = bytes(plan); before += baseline.stages[node.step_id].bytes; after += size;
      assert.ok(!plan.some(item => /workflow\/(extensions|dag|protocol|orchestration|approval|knowledge)\.md$/.test(item.ref)));
      assert.equal(new Set(plan.map(item => item.ref)).size, plan.length);
    }
    assert.ok(after <= before * 0.5, id + ': ' + after + ' > 50% of ' + before);
  }
});
test('capabilities, semantic outputs and feedback select only the relevant instruction surface', () => {
  const refs = (id, options = {}) => instructionPlan(context, definition(id), {}, options).map(item => item.ref);
  assert.ok(refs('scope').includes('core:workflow/knowledge-read.md'));
  assert.ok(!refs('scope').includes('core:workflow/knowledge-publish.md'));
  assert.ok(refs('verify').includes('core:workflow/knowledge-prepare.md'));
  assert.ok(refs('verify').includes('core:workflow/gate-execution.md'));
  assert.ok(!refs('implement').includes('core:workflow/feedback-request.md'));
  assert.ok(refs('implement', { feedback: 2 }).includes('core:workflow/feedback-request.md'));
  assert.throws(() => refs('verify', { feedback: 2 }), /feedback/);
  const leaf = refs('verify', { leaf: 'gate-execution' });
  assert.ok(!leaf.includes('core:workflow/knowledge-prepare.md'));
  assert.throws(() => refs('verify', { leaf: 'invented' }), /unknown leaf/);
});
test('actual team DAGs and custom stage/template/instructions retain their declared resources', () => {
  for (const id of ['api-team', 'design-team']) {
    const resolved = resolveDefinitions(core, json('examples/team-packs/' + id + '/pack.json'));
    for (const workflow of resolved.workflows.filter(w => w.id.startsWith('team.'))) {
      for (const node of workflow.nodes) {
        const stage = resolved.stages.find(stage => stage.id === node.stage_id);
        const plan = instructionPlan(context, stage, node);
        assert.ok(plan.some(item => item.ref === stage.prompt));
        for (const output of node.outputs ?? stage.outputs) assert.ok(plan.some(item => item.ref === output.template));
      }
    }
  }
  const stage = { ...definition('scope'), id: 'team.scope', instructions: ['team:policy.md'], prompt: 'team:scope.md' };
  const node = { outputs: [{ name: 'brief.md', contract: 'change', template: 'team:brief.md' }] };
  const plan = instructionPlan(context, stage, node).map(item => item.ref);
  for (const ref of ['team:policy.md', 'team:scope.md', 'team:brief.md', 'core:workflow/gate-design.md']) assert.ok(plan.includes(ref));
});
function fixture() {
  const project = mkdtempSync(path.join(tmpdir(), 'aidlc-context-'));
  const workflow = core.workflows.find(w => w.id === 'core.enhance'), node = workflow.nodes[0], stage = definition('scope');
  const plan = instructionPlan(context, stage, node);
  const assets = [...plan, { ref: 'core:workflow/context.json' }].map(item => {
    const relative = 'frozen/' + item.ref.replace(':', '/');
    mkdirSync(path.dirname(path.join(project, relative)), { recursive: true });
    const body = read(item.ref.slice(5)); writeFileSync(path.join(project, relative), body);
    return { ref: item.ref, path: relative, sha256: byteDigest(body) };
  });
  const lock = { work_id: 'synthetic-work', workflow, stages: core.stages, assets };
  const lockBytes = Buffer.from(JSON.stringify(lock)); writeFileSync(path.join(project, 'lock.json'), lockBytes);
  const dispatch = { ...json('templates/work/dispatch.json'), work_id: lock.work_id, step_id: node.step_id, stage_id: stage.id,
    stage_kind: stage.kind, input_bindings: node.bindings, workflow_ref: { path: 'lock.json', sha256: byteDigest(lockBytes) },
    role_path: assets.find(a => a.ref === stage.role).path, stage_prompt_path: assets.find(a => a.ref === stage.prompt).path,
    instruction_refs: plan.map(item => ({ ...assets.find(a => a.ref === item.ref), purpose: item.purpose })) };
  return { project, dispatch };
}
test('verified full lock yields a node projection; omitted, changed or widened references block', () => {
  const { project, dispatch } = fixture();
  const projection = bindInstructions(project, dispatch);
  assert.equal(projection.node.step_id, 'scope');
  assert.ok(!Object.hasOwn(projection, 'workflow'));
  for (const change of [
    d => d.instruction_refs.pop(),
    d => d.instruction_refs.push(d.instruction_refs[0]),
    d => { d.instruction_refs[0].sha256 = '0'.repeat(64); },
    d => { d.instruction_refs[0].path = '../outside'; },
    d => { d.stage_id = 'core.verify'; },
    d => { d.input_bindings = {}; },
    d => { d.role_path = 'active/role.md'; },
    d => { d.schema_version = 3; },
  ]) {
    const copy = structuredClone(dispatch); change(copy);
    assert.throws(() => bindInstructions(project, copy));
  }
  writeFileSync(path.join(project, dispatch.instruction_refs[0].path), 'tampered');
  assert.throws(() => bindInstructions(project, dispatch), /fixed bytes changed/);
});
test('drift anywhere in the full lock and symlinks cannot be hidden by a correct-looking projection', () => {
  const { project, dispatch } = fixture();
  const lock = JSON.parse(readFileSync(path.join(project, 'lock.json')));
  lock.workflow.nodes.at(-1).stage_id = 'core.scope';
  writeFileSync(path.join(project, 'lock.json'), JSON.stringify(lock));
  assert.throws(() => bindInstructions(project, dispatch), /fixed bytes changed/);
  symlinkSync(path.join(project, 'lock.json'), path.join(project, 'alias.json'));
  assert.throws(() => safeFile(project, 'alias.json'), /symlink/);
});
