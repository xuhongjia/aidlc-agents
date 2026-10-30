import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync, realpathSync, symlinkSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { canonicalEventHash, measureWork } from '../helpers/measurement.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
const clone = value => JSON.parse(JSON.stringify(value));
const time = hour => new Date(Date.UTC(2026, 9, 30) + hour * 3_600_000).toISOString();
const template = JSON.parse(readFileSync(new URL('../templates/work/measurement.json', import.meta.url)));

function fixture(t, full = false) {
  const root = realpathSync(mkdtempSync(path.join(os.tmpdir(), 'aidlc-measurement-')));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(path.join(root, 'sources'));
  const measurement = { ...clone(template), measurement_id: 'measurement-1', work_id: 'work-1', business_root_id: 'business-1', observed_at: time(12) };
  const events = [];
  function save(relative, content) {
    const bytes = typeof content === 'string' ? content : JSON.stringify(content, null, 2) + '\n';
    writeFileSync(path.join(root, relative), bytes);
    return { path: relative, sha256: hash(bytes) };
  }
  const source = (name, value = {}) => save('sources/' + name + '.json', value);
  function event(type, refs, options = {}) {
    const value = { schema_version: 1, event_id: 'event-' + (events.length + 1), work_id: 'work-1', sequence: events.length + 1,
      occurred_at: time(1), recorded_at: time(11), actor: { kind: 'host', id: 'host-1' }, type,
      step_id: null, run_id: null, attempt: null, candidate_ref: null, source_refs: refs,
      corrects_event_id: null, prev_hash: events.at(-1)?.event_hash ?? null, event_hash: null, ...options };
    value.event_hash = canonicalEventHash(value); events.push(value); return value;
  }
  function resign() {
    for (let i = 0; i < events.length; i++) {
      events[i].sequence = i + 1; events[i].prev_hash = events[i - 1]?.event_hash ?? null; events[i].event_hash = canonicalEventHash(events[i]);
    }
  }
  function request() {
    measurement.expected_head = { sequence: events.length, event_hash: events.at(-1)?.event_hash ?? null };
    const ledger_ref = save('evidence.jsonl', events.map(item => JSON.stringify(item)).join('\n') + (events.length ? '\n' : ''));
    const measurement_ref = save('measurement.json', measurement);
    return { work_id: 'work-1', ledger_ref, measurement_ref };
  }
  const run = () => measureWork(root, request());
  const result = { root, measurement, events, save, source, event, resign, request, run };
  if (!full) return result;
  const intake = event('intake', [source('request', { work_id: 'work-1', received_at: time(0) })], { occurred_at: time(0) });
  const candidate = { scope: ['product.txt'], files: [{ path: 'product.txt', sha256: hash('product') }] };
  const candidateRef = source('candidate', candidate);
  const lock = { work_id: 'work-1', workflow: { nodes: [{ step_id: 'verify', stage_id: 'verify' }], edges: [] }, stages: [{ id: 'verify', kind: 'verification' }] };
  const workflowRef = source('workflow', lock);
  const reviewRef = source('review', { work_id: 'work-1', step_id: 'verify', stage_id: 'verify', revision: 1, workflow_ref: workflowRef, candidate });
  const approvalRef = source('approval', { work_id: 'work-1', step_id: 'verify', stage_id: 'verify', revision: 1,
    workflow_ref: workflowRef, review_digest: reviewRef.sha256, decision: 'approved', by: 'reviewer', at: time(10) });
  for (const attempt of [1, 2]) {
    event('dispatch', [source('dispatch-' + attempt, { attempt })], { step_id: 'implement', run_id: 'run-' + attempt, attempt, candidate_ref: candidateRef });
    event('result', [source('result-' + attempt, { status: attempt === 1 ? 'failed' : 'ready_for_review' })],
      { step_id: 'implement', run_id: 'run-' + attempt, attempt, candidate_ref: candidateRef });
  }
  const waitSource = source('wait-attestation', { complete: true });
  for (const [id, start, end] of [['wait-a', 2, 5], ['wait-b', 4, 6]]) {
    const startEvent = event('waiting', [source(id + '-start', { at: time(start) })], { occurred_at: time(start) });
    const endEvent = event('waiting', [source(id + '-end', { at: time(end) })], { occurred_at: time(end) });
    measurement.cycle.waiting.push({ id, start_event_id: startEvent.event_id, end_event_id: endEvent.event_id });
  }
  const baselineRef = source('baseline', { hours: 12, work_ids: ['old-work'], scope_ids: ['scope-1'] });
  event('human_effort', [baselineRef]);
  measurement.baseline = { kind: 'historical', hours: 12, scope_ids: ['scope-1'], provenance: 'native', source_refs: [baselineRef],
    comparability: ['scope', 'complexity', 'quality', 'risk', 'team', 'window'].map(dimension => ({ dimension, confirmed: true, source_refs: [baselineRef] })) };
  const actualRef = source('actual-attestation', { complete: true, all_team_roles: true, review_rework_included: true });
  event('human_effort', [actualRef, waitSource]);
  measurement.actual = { scope_ids: ['scope-1'], coverage: 'complete', all_team_roles_confirmed: true, review_rework_included: true,
    zero_attested: false, source_refs: [actualRef], entries: [] };
  for (const [id, person, category, hours, start] of [['delivery', 'person-a', 'delivery', 6, 0], ['review', 'person-b', 'review', 2, 6], ['rework', 'person-a', 'rework', 1, 8]]) {
    const ref = source('effort-' + id, { person, hours }); event('human_effort', [ref]);
    measurement.actual.entries.push({ id, person_id: person, role: category, category, hours, provenance: 'native',
      span: { start: time(start), end: time(start + hours) }, source_refs: [ref] });
  }
  const overheadRef = source('overhead-attestation', { complete: true, excluded_from_actual: true });
  const overheadEntryRef = source('coordination', { person: 'person-a', hours: 1 });
  event('overhead', [overheadRef, overheadEntryRef]);
  measurement.overhead = { coverage: 'complete', excluded_from_actual_confirmed: true, zero_attested: false, source_refs: [overheadRef],
    entries: [{ id: 'coordination', person_id: 'person-a', role: 'coordinator', category: 'coordination', hours: 1, provenance: 'self_reported',
      span: { start: time(9), end: time(10) }, source_refs: [overheadEntryRef] }] };
  const final = event('approval', [workflowRef, reviewRef, approvalRef, candidateRef], { step_id: 'verify', occurred_at: time(10), candidate_ref: candidateRef });
  Object.assign(measurement.cycle, { intake_event_id: intake.event_id, final_verify_event_id: final.event_id,
    workflow_ref: workflowRef, review_ref: reviewRef, approval_ref: approvalRef, candidate_ref: candidateRef,
    waiting_coverage: 'complete', waiting_source_refs: [waitSource] });
  const costRef = source('cost-attestation', { complete: true, includes_labor_tools_and_failed_attempts: true });
  event('cost', [costRef]);
  measurement.cost = { coverage: 'complete', all_inputs_included: true, currency: 'USD', accepted_work_units: 1, zero_attested: false, source_refs: [costRef], entries: [] };
  for (const [id, amount, kind, outcome] of [['labor', 100, 'labor', 'accepted'], ['failed-tool', 20, 'tool', 'failed'], ['cancelled-tool', 5, 'tool', 'cancelled']]) {
    const ref = source(id, { amount, currency: 'USD' }); event('cost', [ref]);
    measurement.cost.entries.push({ id, amount, currency: 'USD', kind, basis: 'actual', outcome, source_refs: [ref] });
  }
  const qualityRef = source('quality', { work_id: 'work-1', status: 'verified', artifact_ids: ['test-artifact-42'], window_start: time(10), window_end: time(11), candidate_ref: candidateRef });
  event('quality', [qualityRef], { candidate_ref: candidateRef });
  measurement.quality = { status: 'verified', window_start: time(10), window_end: time(11), matured: true, artifact_ids: ['test-artifact-42'], source_refs: [qualityRef] };
  return result;
}

test('complete source-backed comparison retains retries, negative possibility, failed inputs and no authority', t => {
  const f = fixture(t, true), request = f.request();
  const before = readFileSync(path.join(f.root, 'evidence.jsonl'));
  const report = measureWork(f.root, request);
  assert.equal(report.status, 'measured', JSON.stringify(report.blockers));
  assert.deepEqual(report.metrics, { baseline_hours: 12, actual_human_hours: 9, overhead_hours: 1, net_hours_saved: 2,
    net_savings_percent: 2 / 12 * 100, cycle_hours: 10, waiting_hours: 4, active_cycle_hours: 6, total_actual_cost: 125, cost_per_accepted_work: 125 });
  assert.equal(report.comparison_basis, 'comparison_estimate');
  assert.deepEqual(report.coverage.overhead.provenance, ['self_reported']);
  assert.deepEqual(report.coverage.actual.observed_subtotals_by_provenance, { native: 9, self_reported: null });
  assert.equal(report.coverage.overhead.aggregate_basis, 'self_reported');
  assert.deepEqual(report.coverage.cost.outcomes, { accepted: 1, failed: 1, cancelled: 1 });
  assert.equal(report.ledger.event_count, f.events.length);
  for (const key of ['approvals_granted', 'gate_pass', 'causal_proof']) assert.equal(report[key], false);
  assert.deepEqual(readFileSync(path.join(f.root, 'evidence.jsonl')), before);
});

test('empty ledger and optional independently frozen policy report unavailable, never invented zero', t => {
  const f = fixture(t); f.measurement.policy_ref = f.source('policy', { version: 1 });
  const report = f.run();
  assert.equal(report.status, 'unavailable');
  assert.ok(Object.values(report.metrics).every(value => value === null));
  assert.equal(report.ledger.event_count, 0);
});

test('canonical hash is stable for object key order but preserves arrays and full event values', () => {
  const event = { work_id: 'w', source_refs: [{ path: 'a', sha256: 'a' }, { path: 'b', sha256: 'b' }], actor: { id: 'a', kind: 'host' }, event_hash: null };
  const reordered = { actor: { kind: 'host', id: 'a' }, source_refs: event.source_refs, work_id: 'w', event_hash: 'ignored' };
  assert.equal(canonicalEventHash(event), canonicalEventHash(reordered));
  assert.notEqual(canonicalEventHash(event), canonicalEventHash({ ...event, source_refs: [...event.source_refs].reverse() }));
});

test('whole-file digest, hash chain and head anchor reject tamper and truncation independently', async t => {
  for (const mode of ['source', 'ledger-bytes', 'event-hash', 'head', 'truncated']) await t.test(mode, t => {
    const f = fixture(t, true); let request = f.request();
    if (mode === 'source') writeFileSync(path.join(f.root, f.events[0].source_refs[0].path), '{} changed');
    if (mode === 'ledger-bytes') writeFileSync(path.join(f.root, 'evidence.jsonl'), '');
    if (mode === 'event-hash') { f.events[0].actor.id = 'tampered'; request = f.request(); }
    if (mode === 'head') {
      f.measurement.expected_head.event_hash = '0'.repeat(64); request.measurement_ref = f.save('measurement.json', f.measurement);
    }
    if (mode === 'truncated') request.ledger_ref = f.save('evidence.jsonl', JSON.stringify(f.events[0]) + '\n');
    const report = measureWork(f.root, request);
    assert.equal(report.status, 'blocked'); assert.ok(report.blockers.length > 0);
    assert.ok(Object.values(report.metrics).every(value => value === null));
  });
});

test('path traversal, symlink files, directories and root aliases are rejected', async t => {
  for (const mode of ['traversal', 'file-link', 'directory-link', 'root-link']) await t.test(mode, t => {
    const f = fixture(t), ref = f.source('source', {}); f.event('intake', [ref]); let request = f.request(), root = f.root;
    if (mode === 'traversal') request.ledger_ref.path = '../evidence.jsonl';
    if (mode === 'file-link') {
      symlinkSync(path.join(f.root, ref.path), path.join(f.root, 'linked.json')); f.events[0].source_refs[0].path = 'linked.json'; f.resign(); request = f.request();
    }
    if (mode === 'directory-link') {
      symlinkSync(path.join(f.root, 'sources'), path.join(f.root, 'linked')); f.events[0].source_refs[0].path = 'linked/source.json'; f.resign(); request = f.request();
    }
    if (mode === 'root-link') {
      root = f.root + '-link'; symlinkSync(f.root, root); t.after(() => rmSync(root));
    }
    assert.equal(measureWork(root, request).status, 'blocked');
  });
});

test('work identity, unknown event types, extra fields and duplicate events block', async t => {
  for (const mode of ['work', 'type', 'field', 'event-id', 'source-identity', 'sequence', 'date']) await t.test(mode, t => {
    const f = fixture(t, true);
    if (mode === 'work') f.events[0].work_id = 'another-work';
    if (mode === 'type') f.events[0].type = 'invented';
    if (mode === 'field') f.events[0].raw_reasoning = 'not accepted';
    if (mode === 'event-id') f.events[1].event_id = f.events[0].event_id;
    if (mode === 'source-identity') f.events.push({ ...clone(f.events[0]), event_id: 'new-id' });
    if (mode === 'date') f.events[0].occurred_at = '2026-02-30T00:00:00Z';
    f.resign();
    if (mode === 'sequence') { f.events[1].sequence = 99; f.events[1].event_hash = canonicalEventHash(f.events[1]); }
    assert.equal(f.run().status, 'blocked');
  });
});

test('unknown original time preserves source lineage but cannot establish cycle', t => {
  const f = fixture(t, true); f.events[0].occurred_at = null; f.resign();
  const report = f.run();
  assert.equal(report.status, 'partial'); assert.equal(report.metrics.cycle_hours, null);
  assert.equal(report.metrics.cost_per_accepted_work, null); assert.equal(report.ledger.event_count, f.events.length);
  assert.equal(report.metrics.net_hours_saved, null);
});

test('corrections append without mutation and invalidate superseded endpoints', t => {
  const f = fixture(t, true), original = clone(f.events[0]);
  f.event('correction', [f.source('correction', { reason: 'intake timestamp unknown' })], { corrects_event_id: original.event_id });
  const report = f.run();
  assert.equal(report.status, 'partial'); assert.equal(report.metrics.cycle_hours, null);
  assert.equal(report.ledger.corrected_event_count, 1); assert.deepEqual(f.events[0], original);
});

test('incomplete actual coverage or unknown hours cannot become a net saving', async t => {
  for (const mode of ['partial', 'unknown-hours', 'roles', 'review-rework', 'unallocated-overhead', 'missing-attestation']) await t.test(mode, t => {
    const f = fixture(t, true);
    if (mode === 'partial') f.measurement.actual.coverage = 'partial';
    if (mode === 'unknown-hours') f.measurement.actual.entries[0].hours = null;
    if (mode === 'roles') f.measurement.actual.all_team_roles_confirmed = false;
    if (mode === 'review-rework') f.measurement.actual.review_rework_included = false;
    if (mode === 'unallocated-overhead') f.measurement.overhead.excluded_from_actual_confirmed = false;
    if (mode === 'missing-attestation') f.measurement.actual.source_refs = [];
    const report = f.run(); assert.equal(report.status, 'partial');
    assert.equal(report.metrics.net_hours_saved, null); assert.equal(report.metrics.net_savings_percent, null);
  });
});

test('no baseline, subset scope, incomparable risk or missing comparability never yields percentages', async t => {
  for (const mode of ['none', 'subset', 'risk', 'missing-fact', 'missing-source']) await t.test(mode, t => {
    const f = fixture(t, true), baseline = f.measurement.baseline;
    if (mode === 'none') f.measurement.baseline = clone(template.baseline);
    if (mode === 'subset') f.measurement.actual.scope_ids.push('scope-2');
    if (mode === 'risk') baseline.comparability.find(item => item.dimension === 'risk').confirmed = false;
    if (mode === 'missing-fact') baseline.comparability.pop();
    if (mode === 'missing-source') baseline.source_refs = [];
    const report = f.run(); assert.equal(report.status, 'partial'); assert.equal(report.metrics.net_hours_saved, null);
    assert.equal(report.metrics.net_savings_percent, null); assert.equal(report.comparison_basis, 'unavailable');
  });
});

test('negative savings remain negative; estimated and self-reported inputs remain visibly distinct', t => {
  const f = fixture(t, true); f.measurement.baseline.hours = 5;
  let report = f.run(); assert.equal(report.metrics.net_hours_saved, -5); assert.equal(report.metrics.net_savings_percent, -100);
  f.measurement.baseline.kind = 'estimated'; f.measurement.baseline.provenance = 'estimate';
  f.measurement.actual.entries[0].provenance = 'self_reported'; report = f.run();
  assert.equal(report.comparison_basis, 'scenario_estimate'); assert.equal(report.causal_proof, false);
  assert.deepEqual(report.coverage.actual.provenance, ['native', 'self_reported']);
  assert.deepEqual(report.coverage.actual.observed_subtotals_by_provenance, { native: 3, self_reported: 6 });
  assert.equal(report.coverage.actual.aggregate_basis, 'mixed');
  f.measurement.baseline.hours = 0; report = f.run(); assert.equal(report.metrics.net_hours_saved, -10); assert.equal(report.metrics.net_savings_percent, null);
});

test('zero effort and zero waiting require explicit complete sourced attestation', t => {
  const f = fixture(t, true); f.measurement.overhead.entries = []; f.measurement.cycle.waiting = [];
  let report = f.run(); assert.equal(report.metrics.overhead_hours, null); assert.equal(report.metrics.waiting_hours, null);
  f.measurement.overhead.zero_attested = true; f.measurement.cycle.waiting_zero_attested = true;
  report = f.run(); assert.equal(report.metrics.overhead_hours, 0); assert.equal(report.metrics.waiting_hours, 0);
  f.measurement.cycle.waiting_source_refs = []; report = f.run(); assert.equal(report.metrics.waiting_hours, null);
});

test('duplicate effort IDs, reused sources and overlapping person spans are blocked', async t => {
  for (const mode of ['id', 'source', 'overlap']) await t.test(mode, t => {
    const f = fixture(t, true), overhead = f.measurement.overhead.entries[0], actual = f.measurement.actual.entries[0];
    if (mode === 'id') overhead.id = actual.id;
    if (mode === 'source') overhead.source_refs = actual.source_refs;
    if (mode === 'overlap') overhead.span = { start: time(5), end: time(6) };
    assert.equal(f.run().status, 'blocked');
  });
});

test('unknown or partial waits stay unavailable rather than summing parallel durations', t => {
  const f = fixture(t, true); f.measurement.cycle.waiting[0].end_event_id = null;
  let report = f.run(); assert.equal(report.metrics.cycle_hours, 10); assert.equal(report.metrics.waiting_hours, null);
  f.measurement.cycle.waiting = []; f.measurement.cycle.waiting_coverage = 'partial';
  report = f.run(); assert.equal(report.metrics.active_cycle_hours, null);
});

test('wrong work, candidate, review or non-Verify sources cannot establish an accepted cycle', async t => {
  for (const mode of ['work', 'candidate', 'review', 'non-verify']) await t.test(mode, t => {
    const f = fixture(t, true), final = f.events.find(event => event.event_id === f.measurement.cycle.final_verify_event_id);
    const key = mode === 'candidate' ? 'candidate_ref' : mode === 'non-verify' ? 'workflow_ref' : 'approval_ref';
    const old = f.measurement.cycle[key], value = JSON.parse(readFileSync(path.join(f.root, old.path)));
    if (mode === 'work') value.work_id = 'wrong';
    if (mode === 'candidate') value.files[0].sha256 = hash('wrong');
    if (mode === 'review') value.review_digest = '0'.repeat(64);
    if (mode === 'non-verify') value.stages[0].kind = 'implementation';
    const replacement = f.source('replacement', value); f.measurement.cycle[key] = replacement;
    final.source_refs = final.source_refs.map(ref => ref.path === old.path ? replacement : ref);
    if (mode === 'candidate') final.candidate_ref = replacement;
    f.resign(); assert.equal(f.run().status, 'blocked');
  });
});

test('closed or failed records never replace a final approval', t => {
  const f = fixture(t, true), closed = f.event('closed', [f.source('closure', { status: 'closed' })]);
  f.measurement.cycle.final_verify_event_id = closed.event_id;
  assert.equal(f.run().status, 'blocked');
});

test('actual full-cost coverage, single currency and accepted denominator are required', async t => {
  for (const mode of ['partial', 'estimated', 'currency', 'coverage', 'denominator', 'multiple-units']) await t.test(mode, t => {
    const f = fixture(t, true);
    if (mode === 'partial') f.measurement.cost.coverage = 'partial';
    if (mode === 'estimated') f.measurement.cost.entries[0].basis = 'estimated';
    if (mode === 'currency') f.measurement.cost.entries[1].currency = 'CNY';
    if (mode === 'coverage') f.measurement.cost.all_inputs_included = false;
    if (mode === 'denominator') f.measurement.cost.accepted_work_units = null;
    if (mode === 'multiple-units') f.measurement.cost.accepted_work_units = 2;
    const report = f.run(); assert.equal(report.metrics.cost_per_accepted_work, null);
    assert.equal(report.status, ['currency', 'multiple-units'].includes(mode) ? 'blocked' : 'partial');
  });
});

test('quality verified requires source artifact IDs, candidate binding and mature observation window', async t => {
  for (const mode of ['ids', 'missing-source', 'future-window', 'wrong-artifact', 'pending']) await t.test(mode, t => {
    const f = fixture(t, true);
    if (mode === 'ids') f.measurement.quality.artifact_ids = [];
    if (mode === 'missing-source') f.measurement.quality.source_refs = [];
    if (mode === 'future-window') f.measurement.quality.window_end = time(20);
    if (mode === 'wrong-artifact') f.measurement.quality.artifact_ids = ['fabricated'];
    if (mode === 'pending') { f.measurement.quality.status = 'pending'; f.measurement.quality.matured = false; }
    assert.equal(f.run().status, mode === 'pending' ? 'partial' : 'blocked');
  });
});

test('redacted JSON parse errors never echo source content', t => {
  const f = fixture(t), request = f.request();
  request.measurement_ref = f.save('measurement.json', '{ secret_token = "NEVER_ECHO" }');
  const report = measureWork(f.root, request);
  assert.equal(report.status, 'blocked'); assert.doesNotMatch(JSON.stringify(report), /NEVER_ECHO/);
});

test('future effort spans cannot be billed as completed actual effort', t => {
  const f = fixture(t, true); f.measurement.overhead.entries[0].span = { start: time(12), end: time(13) };
  const report = f.run(); assert.equal(report.status, 'blocked'); assert.match(report.blockers[0], /after observation/);
});

test('later cancellations or new candidates remove savings and unit cost without rewriting the historic cycle', async t => {
  for (const type of ['cancelled', 'candidate', 'closed']) await t.test(type, t => {
    const f = fixture(t, true), ref = f.source('late-' + type, { status: type });
    f.event(type, [ref], { candidate_ref: type === 'candidate' ? ref : null });
    const report = f.run();
    assert.equal(report.metrics.cycle_hours, 10);
    assert.equal(report.metrics.cost_per_accepted_work, type === 'closed' ? 125 : null);
    assert.equal(report.metrics.net_hours_saved, type === 'closed' ? 2 : null);
    assert.equal(report.coverage.cycle.accepted_source_join, type === 'closed');
  });
});

test('incomplete effort exposes missing counts without merging unknown native and self-reported totals', t => {
  const f = fixture(t, true); f.measurement.actual.entries[0].hours = null;
  f.measurement.actual.entries[1].provenance = 'self_reported';
  const report = f.run();
  assert.equal(report.metrics.actual_human_hours, null);
  assert.deepEqual(report.coverage.actual.observed_subtotals_by_provenance, { native: null, self_reported: 2 });
  assert.equal(report.coverage.actual.unknown_entry_count, 1); assert.equal(report.coverage.actual.aggregate_basis, 'unavailable');
});

test('missing filesystem sources do not disclose absolute project locations', t => {
  const f = fixture(t), request = f.request(); request.ledger_ref.path = 'absent.jsonl';
  const report = measureWork(f.root, request);
  assert.equal(report.status, 'blocked'); assert.equal(report.blockers[0], 'measurement source cannot be read');
  assert.ok(!JSON.stringify(report).includes(f.root));
});
