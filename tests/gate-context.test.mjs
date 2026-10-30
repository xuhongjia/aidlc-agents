import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeBuiltins, resolveDefinitions } from './support/workflow-model.mjs';
import { instructionPlan, byteDigest } from './support/context-model.mjs';
import { freezeDelivery } from './support/pipeline-model.mjs';
import { selectReviewCards } from '../helpers/review-cards.mjs';

const read = name => readFileSync(new URL('../' + name, import.meta.url));
const json = name => JSON.parse(read(name));
const context = json('workflow/context.json');
const core = normalizeBuiltins(json('workflow/stages.json'), json('workflow/stage-contracts.json'), json('manifest.json').version);
const verify = core.stages.find(stage => stage.id === 'core.verify');
const common = 'core:workflow/gate-execution.md';
const reviewer = 'core:workflow/gate-reviewer.md';
const collector = 'core:workflow/gate-collector.md';
const fitness = 'core:skills/reusable-capability/aidlc-fitness-check/SKILL.md';
const refs = plan => plan.map(item => item.ref);
const leafPlan = (kind, options = {}, stage = verify) => instructionPlan(context, stage, {}, {
  leaf: 'gate-execution', gate_kind: kind, ...options,
});

test('both Reviewer leaves load shared guards and their own role, excluding collector execution prose', () => {
  const plans = ['architecture', 'quality'].map(kind => leafPlan(kind));
  for (const [index, kind] of ['architecture', 'quality'].entries()) {
    const plan = plans[index];
    assert.deepEqual(new Set(refs(plan)), new Set([
      ...context.common.map(file => 'core:' + file),
      'core:agents/' + kind + '-gate-reviewer.md', 'core:prompts/gate-review.md',
      common, reviewer, fitness, 'core:templates/work/gate-result.json',
    ]));
    assert.equal(new Set(refs(plan)).size, plan.length);
    assert.ok(!refs(plan).includes(collector));
    assert.ok(!refs(plan).includes(verify.role));
    assert.ok(!refs(plan).includes(verify.prompt));
  }
  assert.notEqual(plans[0].find(item => item.purpose === 'role').ref,
    plans[1].find(item => item.purpose === 'role').ref);
  assert.throws(() => leafPlan(null), /Gate kind/);
  assert.throws(() => leafPlan('architecture', {}, core.stages.find(stage => stage.kind === 'implementation')), /verification/);
});

test('every core and team verification collector loads collection with shared guards, never Reviewer-only guidance', () => {
  const definitions = [core, ...['api-team', 'design-team'].map(id => resolveDefinitions(core, json('examples/team-packs/' + id + '/pack.json')))];
  let examined = 0;
  for (const resolved of definitions) for (const workflow of resolved.workflows) for (const node of workflow.nodes) {
    const stage = resolved.stages.find(item => item.id === node.stage_id);
    if (stage.kind !== 'verification') continue;
    examined++;
    const plan = instructionPlan(context, stage, node), selected = refs(plan);
    for (const ref of [common, collector, stage.role, stage.prompt, 'core:templates/work/gate-result.json',
      ...(stage.instructions ?? []), ...(node.outputs ?? stage.outputs).map(output => output.template)]) {
      assert.ok(selected.includes(ref), workflow.id + ': missing ' + ref);
    }
    for (const ref of [reviewer, fitness, 'core:prompts/gate-review.md',
      ...Object.values(context.gate_reviewers).map(item => 'core:' + item.role)]) {
      assert.ok(!selected.includes(ref), workflow.id + ': unexpected ' + ref);
    }
    assert.equal(new Set(selected).size, plan.length);
  }
  assert.ok(examined > core.workflows.length);
});

test('selected risk cards retain frozen source closure and team constraints in both leaf plans', () => {
  const catalog = json('workflow/review-cards.json');
  catalog.cards.push({ id: 'team-payments', version: 1, ref: 'team:cards/payments.md',
    source_refs: ['team:policy/payments.md', common], reviewers: ['architecture', 'quality'],
    risk_tags: ['payments'], path_patterns: [] });
  const sourceNames = [...new Set(catalog.cards.flatMap(card => [card.ref, ...card.source_refs]))];
  const assets = sourceNames.map(ref => ({ ref, path: 'frozen/' + ref.replace(':', '/'),
    sha256: byteDigest(ref.startsWith('core:') ? read(ref.slice(5)) : Buffer.from('Synthetic frozen team rule')) }));
  const stage = { ...verify, id: 'team.verify', prompt: 'team:verify.md', role: 'team:verifier.md', instructions: ['team:policy/payments.md'] };
  for (const kind of ['architecture', 'quality']) {
    const selection = selectReviewCards(catalog, { status: 'assessed', reviewer: kind,
      risk_tags: ['auth', 'payments'], changed_paths: [], required_card_ids: [] }, assets);
    assert.deepEqual(selection.cards.map(card => card.id), ['authorization', 'team-payments']);
    const plan = leafPlan(kind, { review_cards: selection.cards }, stage), selected = refs(plan);
    for (const card of selection.cards) for (const item of [card.instruction_ref, ...card.source_refs]) {
      assert.equal(selected.filter(ref => ref === item.ref).length, 1, 'missing or duplicated source: ' + item.ref);
      assert.equal(item.sha256, assets.find(asset => asset.ref === item.ref).sha256);
    }
    assert.equal(plan.find(item => item.ref === common).purpose, 'leaf');
    assert.equal(plan.find(item => item.ref === 'team:policy/payments.md').purpose, 'team');
    assert.ok(!selected.includes('team:verify.md'));
    assert.ok(!selected.includes(collector));
    assert.throws(() => instructionPlan(context, stage, {}, { review_cards: selection.cards }), /assigned Reviewer/);
  }
});

test('configured CI/CD instructions belong to collectors and do not widen either Reviewer leaf', () => {
  const workflow = core.workflows.find(item => item.id === 'core.enhance');
  const node = workflow.nodes.find(item => item.stage_id === verify.id);
  const delivery = freezeDelivery(json('examples/delivery/gitlab-same-project.json').delivery, workflow, core.stages);
  const bindingIds = delivery.steps.find(step => step.step_id === node.step_id).binding_ids;
  const bindings = delivery.bindings.filter(binding => bindingIds.includes(binding.id));
  assert.ok(bindings.length > 0);
  const selected = refs(instructionPlan(context, verify, node, { pipeline_bindings: bindings }));
  for (const ref of [collector, 'core:workflow/pipelines.md', 'core:adapters/delivery/gitlab.md']) assert.ok(selected.includes(ref));
  for (const kind of ['architecture', 'quality']) assert.deepEqual(
    leafPlan(kind, { pipeline_bindings: bindings }), leafPlan(kind));
  assert.ok(!refs(instructionPlan(context, verify, node)).includes('core:workflow/pipelines.md'));
});

test('all three actual read sets retain shared independence, authority, candidate and evidence barriers', () => {
  const plans = [instructionPlan(context, verify, {}), leafPlan('architecture'), leafPlan('quality')];
  const guards = [
    /two distinct actual Reviewers, then a fresh collector/,
    /every Implement contributor; DEV self-tests cannot substitute/,
    /approved baseline\/entry digests\/authority/,
    /same complete frozen candidate; enumerate\/hash before\/after/,
    /No product\/test\/Oracle\/rule edits, threshold lowering or self-approval/,
    /relevant nonempty blocking check and all mandatory approved rules passing/,
    /Zero\/all-skipped\/empty\/irrelevant assertions/,
    /missing\/truncated\/unknown raw evidence or candidate drift block/,
    /uncertainty on a required rule cannot PASS/,
  ];
  for (const plan of plans) {
    const selected = plan.filter(item => item.ref === common);
    assert.equal(selected.length, 1);
    const loaded = read(selected[0].ref.slice(5)).toString();
    for (const guard of guards) assert.match(loaded, guard);
  }
  // The shared source must not recursively reintroduce a counterpart role file.
  assert.doesNotMatch(read(common.slice(5)).toString(), /workflow\/gate-(?:collector|reviewer)\.md/);
  assert.doesNotMatch(read(reviewer.slice(5)).toString(), /workflow\/gate-collector\.md/);
  assert.doesNotMatch(read(collector.slice(5)).toString(), /workflow\/gate-reviewer\.md/);
});

test('new helper assets freeze without joining default child instructions', () => {
  for (const file of ['helpers/check.mjs', 'templates/work/helper-request.json']) {
    assert.ok(context.execution_assets.includes(file));
    for (const plan of [instructionPlan(context, verify, {}), leafPlan('architecture'), leafPlan('quality')]) {
      assert.ok(!refs(plan).includes('core:' + file));
    }
  }
});
