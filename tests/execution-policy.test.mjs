import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveExecution, summarizeUsage, checkBudget } from '../helpers/execution-policy.mjs';

const defaults = JSON.parse(readFileSync(new URL('../workflow/execution-policy.json', import.meta.url)));
const policy = () => structuredClone(defaults);
const task = changes => ({ role: 'software-engineer', task_tier: 'medium', risk_tags: [], required_capabilities: ['tools'], ...changes });
const host = () => ({ model_selection: true, models: [
  { id: 'balanced', tiers: ['medium'], reasoning: ['normal', 'high'], capabilities: ['tools'] },
  { id: 'strong', tiers: ['heavy'], reasoning: ['high'], capabilities: ['tools', 'vision'] },
  { id: 'spare', tiers: ['medium'], reasoning: ['normal'], capabilities: ['tools'] }
] });
const configured = () => {
  const p = policy(); p.enabled = true;
  p.models.medium = { primary: 'balanced', fallbacks: ['spare'], reasoning: 'normal' };
  p.models.heavy = { primary: 'strong', fallbacks: [], reasoning: 'high' };
  return p;
};
const receipt = changes => ({
  receipt_id: 'receipt-1', work_id: 'work-1', run_id: 'run-1', attempt: 1, executor_id: 'agent-1',
  kind: 'stage', source_ref: 'host/trace-1.json', scope: 'exclusive', actual_model: 'balanced', actual_reasoning: 'normal',
  usage: { input_tokens: 100, cached_input_tokens: 60, output_tokens: 20, tool_output_bytes: 300, calls: 2, retries: 0 }, ...changes
});
const reservation = changes => ({ run_id: 'run-2', attempt: 1, executor_id: null, kind: 'leaf', calls: 1, retries: 0, ...changes });

test('default inheritance reports requested tier without claiming model selection', () => {
  const r = resolveExecution(policy(), task(), {});
  assert.equal(r.status, 'inherited'); assert.equal(r.tier, 'medium');
  assert.equal(r.requested_model, null); assert.equal(r.capability_verification, 'unverified');
});

test('roles, task complexity and risk raise the tier independently of workflow labels', () => {
  assert.equal(resolveExecution(configured(), task({ role: 'architect', task_tier: 'light' }), host()).tier, 'heavy');
  assert.equal(resolveExecution(configured(), task({ task_tier: 'heavy', workflow: 'fix' }), host()).requested_model, 'strong');
  const r = resolveExecution(configured(), task({ risk_tags: ['auth'], changed_lines: 1 }), host());
  assert.equal(r.tier, 'heavy'); assert.ok(r.reasons.includes('risk:auth=heavy'));
  assert.equal(resolveExecution(configured(), task({ workflow: 'standard' }), host()).tier, 'medium');
});

test('reviewer and collector floors cannot be weakened by role configuration', () => {
  const p = configured(); p.role_defaults['quality-gate-reviewer'] = 'light'; p.role_defaults.collector = 'light';
  for (const role of ['quality-gate-reviewer', 'collector']) {
    assert.equal(resolveExecution(p, task({ role, task_tier: 'light' }), host()).tier, 'medium');
  }
  p.risk_tiers.auth = 'light';
  assert.equal(resolveExecution(p, task({ risk_tags: ['auth'] }), host()).tier, 'heavy');
});

test('unknown roles, task tiers, unassessed risks and absent capability lists block', () => {
  for (const patch of [{ role: 'mystery' }, { task_tier: 'tiny' }, { risk_tags: ['unassessed'] }, { risk_tags: undefined }, { required_capabilities: undefined }]) {
    assert.equal(resolveExecution(policy(), task(patch), {}).status, 'blocked');
  }
  const p = configured(); p.role_defaults['team-architect'] = 'heavy';
  assert.equal(resolveExecution(p, task({ role: 'team-architect' }), host()).status, 'selected');
});

test('enabled routing requires actual host selection and matching model capability/tier/reasoning', () => {
  for (const h of [{}, { ...host(), model_selection: false }, { ...host(), models: [] }]) {
    assert.equal(resolveExecution(configured(), task(), h).status, 'blocked');
  }
  const p = configured(); p.models.heavy.primary = 'balanced';
  assert.equal(resolveExecution(p, task({ task_tier: 'heavy' }), host()).status, 'blocked');
  assert.equal(resolveExecution(configured(), task({ required_capabilities: ['vision'] }), host()).status, 'blocked');
  p.models.medium.reasoning = 'invented';
  assert.equal(resolveExecution(p, task(), host()).status, 'blocked');
});

test('fallback is explicit, same-tier, capability checked and limited to transient failure', () => {
  const request = task({ fallback_model: 'spare', fallback_reason: 'rate_limit' });
  assert.equal(resolveExecution(configured(), request, host()).requested_model, 'spare');
  for (const patch of [{ fallback_reason: 'authentication' }, { fallback_model: 'strong' }, { fallback_reason: null }]) {
    assert.equal(resolveExecution(configured(), { ...request, ...patch }, host()).status, 'blocked');
  }
  const p = configured(); p.models.medium.reasoning = 'high';
  assert.equal(resolveExecution(p, request, host()).status, 'blocked');
});

test('usage deduplicates identical deliveries and counts parent, child, hook and retry deltas once', () => {
  const rows = [receipt(), receipt(), receipt({ receipt_id: 'r2', run_id: 'run-2', executor_id: 'parent', kind: 'parent', source_ref: 'host/trace-1.json#parent' }),
    receipt({ receipt_id: 'r3', run_id: 'run-3', executor_id: 'hook-1', kind: 'hook', attempt: 2,
      source_ref: 'host/trace-1.json#hook-attempt-2', usage: { ...receipt().usage, retries: 1 } })];
  const s = summarizeUsage(rows);
  assert.equal(s.receipt_count, 3); assert.equal(s.agents, 2); assert.equal(s.status, 'measured');
  assert.equal(s.totals.input_tokens, 300); assert.equal(s.totals.noncached_input_tokens, 120);
  assert.equal(s.totals.calls, 6); assert.equal(s.totals.retries, 1);
  assert.equal(summarizeUsage([receipt(), receipt({ receipt_id: 'redelivery' })]).receipt_count, 1);
});

test('missing metrics remain unavailable, partial values remain separately observable', () => {
  const unavailable = receipt({ receipt_id: 'r2', run_id: 'run-2', executor_id: 'agent-2', actual_model: null, source_ref: 'host/trace-1.json#agent-2',
    usage: Object.fromEntries(Object.keys(receipt().usage).map(k => [k, null])) });
  const s = summarizeUsage([receipt(), unavailable]);
  assert.equal(s.status, 'unavailable'); assert.equal(s.totals.input_tokens, null);
  assert.equal(s.observed.input_tokens, 100); assert.equal(s.agents, 2);
  assert.equal(summarizeUsage([]).status, 'unavailable');
});

test('conflicting identities, cross-work, overlapping scope and malformed counters are rejected', () => {
  const invalid = [
    receipt({ actual_model: 'other' }), receipt({ work_id: 'different' }),
    receipt({ receipt_id: 'other', source_ref: 'overlapping-source' }),
    receipt({ scope: 'includes-children' }), receipt({ source_ref: '' }), receipt({ attempt: 0 }),
    receipt({ usage: { ...receipt().usage, input_tokens: -1 } }),
    receipt({ usage: { ...receipt().usage, cached_input_tokens: 101 } }),
    receipt({ usage: { ...receipt().usage, calls: 1.5 } }),
    receipt({ usage: { ...receipt().usage, output_tokens: undefined } })
  ];
  for (const row of invalid) assert.throws(() => summarizeUsage([receipt(), row]));
});

test('one native event or span cannot be attributed to multiple executions', () => {
  for (const changes of [
    { run_id: 'run-2' }, { attempt: 2 }, { executor_id: 'agent-2', run_id: 'run-2' }
  ]) {
    assert.throws(() => summarizeUsage([receipt(), receipt({ receipt_id: 'r2', ...changes })]), /source attributed to another execution/);
  }
  assert.equal(summarizeUsage([receipt({ source_ref: 'host/trace.json#event-1' }),
    receipt({ receipt_id: 'r2', run_id: 'run-2', source_ref: 'host/trace.json#event-2' })]).receipt_count, 2);
});

test('budgets reserve pending calls and agents before parallel dispatch', () => {
  const p = policy(); p.budgets.max_calls = 3; p.budgets.max_agents = 2;
  assert.equal(checkBudget(p, [receipt()], [reservation()]).allowed, true);
  assert.equal(checkBudget(p, [receipt()], [reservation(), reservation({ run_id: 'run-3' })]).allowed, false);
  assert.equal(checkBudget(p, [receipt()], [reservation({ calls: 2 })]).allowed, false);
  assert.throws(() => checkBudget(p, [receipt()], [reservation(), reservation()]));
  assert.throws(() => checkBudget(p, [receipt()], [reservation({ run_id: 'run-1' })]));
  p.budgets.max_retries = 0;
  assert.equal(checkBudget(p, [receipt()], [reservation()]).allowed, true);
  assert.equal(checkBudget(p, [receipt()], [reservation({ retries: 1 })]).allowed, false);
  p.budgets.max_calls = null; p.budgets.max_agents = null;
  assert.equal(checkBudget(p, [receipt()]).allowed, true);
});

test('an Agent reservation cannot disguise a model call as zero budget usage', () => {
  const p = policy(); p.budgets.max_calls = 0;
  for (const kind of ['parent', 'stage', 'leaf', 'hook', 'collector']) {
    assert.throws(() => checkBudget(p, [], [reservation({ kind, calls: 0 })]), /invalid pending reservation/);
    assert.equal(checkBudget(p, [], [reservation({ kind })]).allowed, false);
  }
});

test('token thresholds stop new dispatch without claiming an in-flight hard cap', () => {
  const p = policy(); p.budgets.max_input_tokens = 100;
  const stopped = checkBudget(p, [receipt()], [reservation()]);
  assert.equal(stopped.allowed, false); assert.equal(stopped.hard_token_cap, false);
  p.budgets.max_input_tokens = 200;
  assert.equal(checkBudget(p, [receipt()], [reservation()]).allowed, true);
});

test('unavailable metering pauses configured limits, unless explicitly allowed to continue unmetered', () => {
  const p = policy(); p.budgets.max_input_tokens = 200;
  const row = receipt({ usage: { ...receipt().usage, input_tokens: null, cached_input_tokens: null } });
  assert.equal(checkBudget(p, [row]).allowed, false);
  p.budgets.unknown_usage = 'continue';
  const r = checkBudget(p, [row]); assert.equal(r.allowed, true); assert.ok(r.warnings.length);
  assert.equal(checkBudget(policy(), [row]).allowed, true);
});
