import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { prepareExecution, reconcileExecution, verificationPlan } from '../helpers/prepare-execution.mjs';
import { instructionPlan } from './support/context-model.mjs';
import { normalizeBuiltins } from './support/workflow-model.mjs';

const read = file => readFileSync(new URL('../' + file, import.meta.url));
const json = file => JSON.parse(read(file));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function fixture() {
  const catalog = json('workflow/review-cards.json');
  const refs = [...new Set(catalog.cards.flatMap(c => [c.ref, ...c.source_refs]))];
  const assets = refs.map(ref => ({ ref, path: ref.slice(5), sha256: hash(read(ref.slice(5))) }));
  const policy = json('workflow/execution-policy.json');
  policy.enabled = true;
  for (const tier of ['light', 'medium', 'heavy']) policy.models[tier] = { primary: 'test-' + tier, fallbacks: [], reasoning: 'test-reasoning' };
  const host = { model_selection: true, models: ['light', 'medium', 'heavy'].map(tier => ({ id: 'test-' + tier,
    tiers: [tier], capabilities: ['tools'], reasoning: ['test-reasoning'] })) };
  return { policy, host, catalog, assets,
    assignment: { kind: 'leaf', run_id: 'gate-a', attempt: 1,
      stage: { id: 'core.verify', kind: 'verification', role: 'core:agents/qe.md' }, gate_assignment: { kind: 'architecture' } },
    request: { role: 'architecture-gate-reviewer', task_tier: 'light', risk_tags: ['auth'], required_capabilities: ['tools'] },
    assessment: { status: 'assessed', risk_tags: ['auth'], changed_paths: ['src/auth.js'], required_card_ids: [] },
    receipts: [], pending: [{ run_id: 'gate-a', attempt: 1, executor_id: null, kind: 'leaf', calls: 1, retries: 0 }] };
}
function receipt() {
  return { ...json('templates/work/execution-receipt.json'), receipt_id: 'host-event-1', work_id: 'work-1',
    run_id: 'gate-a', executor_id: 'native-agent-a', kind: 'leaf', source_ref: 'host-trace#event-1',
    actual_model: 'test-heavy', actual_reasoning: 'test-reasoning' };
}
const expected = { work_id: 'work-1', run_id: 'gate-a', attempt: 1, executor_id: 'native-agent-a' };

test('one assessment drives role/task/risk selection, selected Gate cards and budget reservation', () => {
  const f = fixture(), plan = prepareExecution(f);
  assert.equal(plan.status, 'prepared', JSON.stringify(plan));
  assert.equal(plan.decision.tier, 'heavy');
  assert.equal(plan.decision.requested_model, 'test-heavy');
  assert.ok(plan.review_cards.length > 0);
  assert.ok(plan.review_cards.every(c => c.reviewers.includes('architecture')));
  assert.equal(plan.budget.reserved.calls, 1);
  assert.equal(reconcileExecution(plan, receipt(), expected).model_verified, true);
});
test('Gate role spoofing, contradictory assessments and omitted reservations block before dispatch', () => {
  for (const change of [
    f => { f.request.role = 'fixed-content-helper'; },
    f => { f.assessment.risk_tags = []; },
    f => { f.assessment.status = 'unassessed'; },
    f => { f.pending = []; },
    f => { f.pending[0].run_id = 'someone-else'; },
    f => { f.assignment.kind = f.pending[0].kind = 'hook'; f.assignment.task_type = 'knowledge-publish'; f.request.role = 'fixed-content-helper'; },
    f => { f.assignment.kind = f.pending[0].kind = 'parent'; f.request.role = 'coordinator'; },
  ]) { const f = fixture(); change(f); assert.equal(prepareExecution(f).status, 'blocked'); }
});
test('unsupported model, capability failure and exhausted budgets never downgrade the Reviewer', () => {
  for (const change of [
    f => { f.host.model_selection = false; },
    f => { f.host.models.find(m => m.id === 'test-heavy').capabilities = []; },
    f => { f.policy.budgets.max_calls = 0; },
    f => { f.policy.models.heavy.primary = 'test-light'; },
  ]) { const f = fixture(); change(f); const plan = prepareExecution(f);
    assert.equal(plan.status, 'blocked'); assert.equal(plan.decision?.tier, 'heavy'); }
});
test('actual model, reasoning and executor must match; missing meters alone stay unavailable', () => {
  const plan = prepareExecution(fixture());
  for (const change of [
    r => { r.actual_model = 'test-medium'; }, r => { r.actual_model = null; },
    r => { r.actual_reasoning = null; }, r => { r.executor_id = 'different-agent'; },
    r => { r.run_id = 'stale-run'; }, r => { r.attempt = 2; },
    r => { r.kind = 'parent'; },
  ]) { const r = receipt(); change(r); assert.equal(reconcileExecution(plan, r, expected).valid, false); }
  assert.equal(reconcileExecution(plan, receipt(), expected).valid, true);
  const f = fixture(); f.policy.enabled = false;
  const inherited = prepareExecution(f), unknown = receipt(); unknown.actual_model = unknown.actual_reasoning = null;
  assert.deepEqual(reconcileExecution(inherited, unknown, expected), { valid: true, model_verified: false, blockers: [] });
});
test('ordinary stages use canonical roles and never inject Reviewer cards; team roles need explicit mappings', () => {
  const f = fixture();
  f.assignment = { kind: 'stage', run_id: 'gate-a', attempt: 1,
    stage: { id: 'core.implement', kind: 'implementation', role: 'core:agents/software-engineer.md' } };
  f.pending[0].kind = 'stage'; f.request.role = 'software-engineer';
  assert.equal(prepareExecution(f).status, 'prepared');
  assert.deepEqual(prepareExecution(f).review_cards, []);
  f.assignment.stage.role = 'team:agents/specialist.md'; f.request.role = f.assignment.stage.role;
  assert.equal(prepareExecution(f).status, 'blocked');
  f.policy.role_defaults[f.request.role] = 'medium';
  assert.equal(prepareExecution(f).status, 'prepared');
});
test('direct Verify reserves three distinct runs, preserves both Gate dependencies and never grants approval', () => {
  const ids = { architecture: 'a', quality: 'q', collector: 'c', initial_collector: 'i' };
  const direct = verificationPlan({ status: 'valid', verify: { eligible: true, mode: 'direct', host_attested: true } }, ids);
  assert.equal(direct.tasks.length, 3); assert.equal(direct.grants_approval, false);
  assert.deepEqual(direct.tasks[2].after, ['a', 'q']);
  assert.ok(direct.tasks.slice(0, 2).every(t => t.collector_run_id === 'c'));
  const fallback = verificationPlan({ status: 'valid', verify: { eligible: false, mode: 'fallback' } }, ids);
  assert.equal(fallback.tasks.length, 4); assert.deepEqual(fallback.tasks[1].after, ['i']);
  assert.ok(fallback.tasks.slice(1, 3).every(t => t.collector_run_id === 'i'));
  assert.deepEqual(verificationPlan({ status: 'blocked', verify: { eligible: false } }, ids).tasks, []);
  for (const input of [{ status: 'valid' }, { status: 'valid', verify: { mode: 'unknown', eligible: true } },
    { status: 'valid', verify: { mode: 'direct', eligible: true } }]) assert.deepEqual(verificationPlan(input, ids).tasks, []);
  assert.throws(() => verificationPlan({ status: 'valid', verify: { eligible: true, mode: 'direct', host_attested: true } }, { ...ids, quality: 'a' }));
});
test('selected cards extend only Gate read lists and preserve mandatory rules and team templates', () => {
  const context = json('workflow/context.json');
  const core = normalizeBuiltins(json('workflow/stages.json'), json('workflow/stage-contracts.json'), json('manifest.json').version);
  const stage = core.stages.find(s => s.id === 'core.verify');
  const cards = prepareExecution(fixture()).review_cards;
  const base = instructionPlan(context, stage, {}, { leaf: 'gate-execution', gate_kind: 'architecture' });
  const selected = instructionPlan(context, stage, {}, { leaf: 'gate-execution', gate_kind: 'architecture', review_cards: cards });
  for (const ref of base) assert.ok(selected.some(r => r.ref === ref.ref));
  assert.equal(selected.length, base.length + cards.length);
  const custom = structuredClone(cards);
  custom[0].source_refs.push({ ref: 'team:policy/payments.md', path: 'frozen/team/policy/payments.md', sha256: 'a'.repeat(64) });
  const extended = instructionPlan(context, stage, {}, { leaf: 'gate-execution', gate_kind: 'architecture', review_cards: custom });
  assert.ok(extended.some(r => r.ref === 'team:policy/payments.md' && r.purpose === 'review-card-source'));
  assert.equal(extended.length, selected.length + 1);
  assert.throws(() => instructionPlan(context, stage, {}, { review_cards: cards }), /Reviewer/);
});
test('new execution assets are shipped, old locks and templates grant no model or approval authority', () => {
  assert.ok(json('manifest.json').payload_directories.includes('helpers'));
  assert.equal(json('workflow/execution-policy.json').enabled, false);
  assert.equal(json('templates/work/workflow-lock.json').execution, null);
  assert.equal(json('templates/work/dispatch.json').execution, null);
  assert.equal(json('templates/work/stage-result.json').execution_receipt_ref, null);
  assert.deepEqual(json('templates/work/state.json').execution_receipts, []);
  assert.deepEqual(json('templates/work/state.json').execution_reservations, []);
});
