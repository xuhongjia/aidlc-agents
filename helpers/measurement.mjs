// Read-only evidence checks and descriptive measurements. Never approval or Gate authority.
import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';

const sha256 = value => createHash('sha256').update(value).digest('hex');
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const digest = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const canonical = value => Array.isArray(value) ? value.map(canonical) : object(value)
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const refKey = ref => ref.path + ':' + ref.sha256;
const refEqual = (a, b) => a?.path === b?.path && a?.sha256 === b?.sha256;
const timestamp = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) return false;
  const day = value.slice(0, 10);
  return new Date(day + 'T00:00:00Z').toISOString().slice(0, 10) === day && Number(value.slice(11, 13)) < 24;
};
const nonnegative = value => value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0);
const HOUR = 3_600_000;
const eventTypes = ['intake', 'dispatch', 'result', 'candidate', 'review', 'approval', 'human_effort', 'overhead', 'usage', 'cost', 'waiting', 'quality', 'closed', 'cancelled', 'correction'];
const eventKeys = 'schema_version event_id work_id sequence occurred_at recorded_at actor type step_id run_id attempt candidate_ref source_refs corrects_event_id prev_hash event_hash';
const metricNames = ['baseline_hours', 'actual_human_hours', 'overhead_hours', 'net_hours_saved', 'net_savings_percent', 'cycle_hours', 'waiting_hours', 'active_cycle_hours', 'total_actual_cost', 'cost_per_accepted_work'];
const emptyMetrics = () => Object.fromEntries(metricNames.map(key => [key, null]));

function fields(value, keys, label) {
  requireThat(object(value) && same(Object.keys(value).sort(), keys.split(' ').sort()), 'invalid fields: ' + label);
}
function choice(value, options, label) { requireThat(options.includes(value), 'invalid ' + label); }
function bool(value, label) { requireThat(typeof value === 'boolean', 'invalid ' + label); }
function nullableId(value, label) { requireThat(value === null || text(value), 'invalid ' + label); }
function uniqueIds(values, label) {
  requireThat(Array.isArray(values) && values.every(text) && new Set(values).size === values.length, 'invalid or duplicate ' + label);
}
function projectRoot(root) {
  requireThat(typeof root === 'string' && path.isAbsolute(root) && realpathSync(root) === path.resolve(root)
    && lstatSync(root).isDirectory() && !lstatSync(root).isSymbolicLink(), 'unsafe project root');
  return path.resolve(root);
}
function readRef(root, ref) {
  fields(ref, 'path sha256', 'file reference');
  requireThat(text(ref.path) && !path.isAbsolute(ref.path) && !ref.path.includes('\\') && !ref.path.includes('\0')
    && !ref.path.split('/').some(part => ['', '.', '..'].includes(part)), 'unsafe relative path');
  requireThat(digest(ref.sha256), 'invalid file digest');
  let target = root;
  for (const part of ref.path.split('/')) {
    target = path.join(target, part);
    requireThat(!lstatSync(target).isSymbolicLink(), 'symlink reference');
  }
  requireThat(lstatSync(target).isFile(), 'reference is not a file');
  const bytes = readFileSync(target);
  requireThat(sha256(bytes) === ref.sha256, 'file digest mismatch: ' + ref.path);
  return bytes;
}
function parseJson(bytes, label) {
  try { return JSON.parse(bytes); } catch { throw new Error('invalid JSON: ' + label); }
}

// SHA-256 of UTF-8 JSON with recursively sorted object keys, preserving array order,
// excluding only the top-level event_hash. This detects drift, not authenticity.
export function canonicalEventHash(event) {
  requireThat(object(event), 'event must be an object');
  const { event_hash: ignored, ...body } = event;
  return sha256(JSON.stringify(canonical(body)));
}

function ledger(root, request, measurement, report) {
  const bytes = readRef(root, request.ledger_ref);
  const raw = bytes.toString('utf8');
  requireThat(Buffer.from(raw, 'utf8').equals(bytes), 'ledger is not valid UTF-8');
  const lines = raw === '' ? [] : raw.replace(/\n$/, '').split('\n');
  const events = [], ids = new Set(), corrected = new Set(), identities = new Set();
  let previous = null, recorded = -Infinity;
  for (const line of lines) {
    requireThat(line.trim().length > 0, 'empty ledger line');
    const event = parseJson(line, 'ledger event');
    fields(event, eventKeys, 'event');
    requireThat(event.schema_version === 1 && event.work_id === request.work_id, 'event schema or work mismatch');
    requireThat(text(event.event_id) && !ids.has(event.event_id), 'duplicate or missing event_id');
    requireThat(event.sequence === events.length + 1, 'event sequence gap');
    requireThat((event.occurred_at === null || timestamp(event.occurred_at)) && timestamp(event.recorded_at)
      && (event.occurred_at === null || Date.parse(event.occurred_at) <= Date.parse(event.recorded_at))
      && Date.parse(event.recorded_at) >= recorded, 'invalid event timestamps');
    requireThat(Date.parse(event.recorded_at) <= Date.parse(measurement.observed_at), 'event recorded after observation');
    fields(event.actor, 'kind id', 'event actor');
    choice(event.actor.kind, ['human', 'agent', 'host', 'external'], 'actor kind');
    requireThat(text(event.actor.id), 'missing actor id');
    choice(event.type, eventTypes, 'event type');
    nullableId(event.step_id, 'step_id'); nullableId(event.run_id, 'run_id');
    requireThat(event.attempt === null || (Number.isSafeInteger(event.attempt) && event.attempt > 0), 'invalid attempt');
    requireThat(event.run_id === null ? event.attempt === null : text(event.step_id) && event.attempt !== null, 'incomplete run identity');
    if (['dispatch', 'result'].includes(event.type)) requireThat(text(event.run_id), 'run identity required');
    if (['review', 'approval'].includes(event.type)) requireThat(text(event.step_id), 'step identity required');
    if (event.type === 'candidate') requireThat(event.candidate_ref !== null, 'candidate event requires candidate reference');
    if (event.candidate_ref !== null) readRef(root, event.candidate_ref);
    requireThat(Array.isArray(event.source_refs) && event.source_refs.length > 0, 'event sources missing');
    const sourceKeys = new Set();
    for (const ref of event.source_refs) {
      requireThat(readRef(root, ref).length > 0, 'empty event source');
      requireThat(!sourceKeys.has(refKey(ref)), 'duplicate event source'); sourceKeys.add(refKey(ref));
    }
    const identity = JSON.stringify(canonical([event.type, event.step_id, event.run_id, event.attempt, event.candidate_ref,
      [...sourceKeys].sort(), event.occurred_at, event.corrects_event_id]));
    requireThat(!identities.has(identity), 'duplicate source event identity'); identities.add(identity);
    if (event.type === 'correction') {
      requireThat(ids.has(event.corrects_event_id) && !corrected.has(event.corrects_event_id), 'correction must reference an uncorrected earlier event');
      requireThat(events.find(item => item.event_id === event.corrects_event_id).type !== 'correction', 'correction cannot restore an invalidated event');
      corrected.add(event.corrects_event_id);
    } else requireThat(event.corrects_event_id === null, 'only correction events can correct');
    requireThat(event.prev_hash === previous && digest(event.event_hash) && event.event_hash === canonicalEventHash(event), 'event hash chain mismatch');
    ids.add(event.event_id); events.push(event); previous = event.event_hash; recorded = Date.parse(event.recorded_at);
  }
  fields(measurement.expected_head, 'sequence event_hash', 'expected head');
  requireThat(measurement.expected_head.sequence === events.length && measurement.expected_head.event_hash === previous, 'ledger head anchor mismatch');
  const live = events.filter(event => !corrected.has(event.event_id));
  const sources = new Set(live.flatMap(event => event.source_refs.map(refKey)));
  const checkRefs = refs => {
    requireThat(Array.isArray(refs), 'source_refs must be an array');
    const seen = new Set();
    for (const ref of refs) {
      requireThat(readRef(root, ref).length > 0, 'empty measurement source');
      requireThat(sources.has(refKey(ref)), 'measurement source is not in active ledger');
      requireThat(!seen.has(refKey(ref)), 'duplicate measurement source'); seen.add(refKey(ref));
    }
    return refs.length > 0;
  };
  report.ledger = { event_count: events.length, corrected_event_count: corrected.size, source_count: sources.size,
    head: measurement.expected_head, authenticity: 'not_verified' };
  report.checks.push({ id: 'ledger-chain-head-and-source-bytes', status: 'valid' });
  return { events, live, checkRefs };
}

function effort(bucket, name, checkRefs, seenIds, seenRefs, spans, observedAt) {
  const actual = name === 'actual';
  fields(bucket, actual ? 'scope_ids coverage all_team_roles_confirmed review_rework_included zero_attested source_refs entries'
    : 'coverage excluded_from_actual_confirmed zero_attested source_refs entries', name);
  choice(bucket.coverage, ['complete', 'partial', 'unknown'], name + ' coverage');
  bool(bucket.zero_attested, name + ' zero_attested');
  if (actual) {
    uniqueIds(bucket.scope_ids, 'actual scope_ids');
    bool(bucket.all_team_roles_confirmed, 'all_team_roles_confirmed'); bool(bucket.review_rework_included, 'review_rework_included');
  } else bool(bucket.excluded_from_actual_confirmed, 'excluded_from_actual_confirmed');
  const attested = checkRefs(bucket.source_refs);
  requireThat(Array.isArray(bucket.entries), name + ' entries missing');
  let total = 0, complete = true, unknownCount = 0;
  const provenance = new Set();
  const subtotals = { native: null, self_reported: null }, unknownProvenance = new Set();
  for (const entry of bucket.entries) {
    fields(entry, 'id person_id role category hours provenance span source_refs', 'effort entry');
    requireThat(text(entry.id) && !seenIds.has(entry.id), 'duplicate effort identity'); seenIds.add(entry.id);
    requireThat(text(entry.person_id) && text(entry.role), 'effort person or role missing');
    choice(entry.category, actual ? ['delivery', 'review', 'rework'] : ['coordination', 'setup', 'training', 'other'], 'effort category');
    choice(entry.provenance, ['native', 'self_reported'], 'effort provenance'); provenance.add(entry.provenance);
    requireThat(nonnegative(entry.hours), 'invalid effort hours');
    const sourced = checkRefs(entry.source_refs);
    for (const ref of entry.source_refs) {
      requireThat(!seenRefs.has(refKey(ref)), 'effort source reused; split source records to prevent double counting'); seenRefs.add(refKey(ref));
    }
    if (entry.span !== null) {
      fields(entry.span, 'start end', 'effort span');
      requireThat(timestamp(entry.span.start) && timestamp(entry.span.end) && Date.parse(entry.span.start) < Date.parse(entry.span.end), 'invalid effort span');
      const start = Date.parse(entry.span.start), end = Date.parse(entry.span.end);
      requireThat(end <= Date.parse(observedAt), 'effort span ends after observation');
      requireThat(entry.hours === null || entry.hours <= (end - start) / HOUR, 'effort exceeds source span');
      for (const other of spans) requireThat(other.person !== entry.person_id || start >= other.end || end <= other.start, 'overlapping effort for same person');
      spans.push({ person: entry.person_id, start, end });
    }
    if (entry.hours === null || !sourced) { complete = false; unknownCount++; unknownProvenance.add(entry.provenance); }
    else {
      total += entry.hours; requireThat(Number.isFinite(total), 'effort total overflow');
      subtotals[entry.provenance] = (subtotals[entry.provenance] ?? 0) + entry.hours;
    }
  }
  // A complete source-backed coverage attestation is required even if there are entries.
  const scopeComplete = actual ? bucket.all_team_roles_confirmed && bucket.review_rework_included && bucket.scope_ids.length > 0
    : bucket.excluded_from_actual_confirmed;
  const available = bucket.coverage === 'complete' && attested && complete && scopeComplete
    && (bucket.entries.length > 0 ? total > 0 || bucket.zero_attested : bucket.zero_attested);
  for (const kind of unknownProvenance) subtotals[kind] = null;
  return { hours: available ? total : null, coverage: bucket.coverage, provenance: [...provenance].sort(),
    aggregate_basis: !available || !provenance.size ? 'unavailable' : provenance.size === 1 ? [...provenance][0] : 'mixed',
    observed_subtotals_by_provenance: subtotals, unknown_entry_count: unknownCount,
    entry_count: bucket.entries.length, source_attested: attested, complete: available };
}

function baseline(value, actual, checkRefs) {
  fields(value, 'kind hours scope_ids provenance source_refs comparability', 'baseline');
  choice(value.kind, ['none', 'historical', 'paired', 'estimated'], 'baseline kind');
  choice(value.provenance, [null, 'native', 'self_reported', 'estimate'], 'baseline provenance');
  requireThat(nonnegative(value.hours), 'invalid baseline hours'); uniqueIds(value.scope_ids, 'baseline scope_ids');
  const sourced = checkRefs(value.source_refs);
  requireThat(Array.isArray(value.comparability), 'comparability missing');
  const dimensions = new Map();
  for (const fact of value.comparability) {
    fields(fact, 'dimension confirmed source_refs', 'comparability fact');
    choice(fact.dimension, ['scope', 'complexity', 'quality', 'risk', 'team', 'window'], 'comparability dimension');
    requireThat(!dimensions.has(fact.dimension), 'duplicate comparability dimension');
    requireThat(fact.confirmed === null || typeof fact.confirmed === 'boolean', 'invalid comparability confirmation');
    dimensions.set(fact.dimension, fact.confirmed === true && checkRefs(fact.source_refs));
    // Validate referenced bytes even for a false or unknown comparison.
    checkRefs(fact.source_refs);
  }
  if (value.kind === 'none') requireThat(value.hours === null && value.provenance === null, 'none baseline cannot carry hours');
  if (value.kind === 'estimated') requireThat(value.provenance === 'estimate', 'estimated baseline provenance mismatch');
  if (['historical', 'paired'].includes(value.kind)) requireThat(['native', 'self_reported'].includes(value.provenance), 'observed baseline provenance mismatch');
  const available = value.kind !== 'none' && value.hours !== null && sourced && value.scope_ids.length > 0
    && same([...value.scope_ids].sort(), [...actual.scope_ids].sort()) && dimensions.size === 6 && [...dimensions.values()].every(Boolean);
  return { hours: available ? value.hours : null, comparable: available, kind: value.kind, provenance: value.provenance,
    comparison_basis: available ? value.kind === 'estimated' ? 'scenario_estimate' : 'comparison_estimate' : 'unavailable' };
}

function cycle(root, value, workId, data, report) {
  fields(value, 'intake_event_id final_verify_event_id workflow_ref review_ref approval_ref candidate_ref waiting_coverage waiting_zero_attested waiting_source_refs waiting', 'cycle');
  choice(value.waiting_coverage, ['complete', 'partial', 'unknown'], 'waiting coverage');
  bool(value.waiting_zero_attested, 'waiting_zero_attested');
  const waitingAttested = data.checkRefs(value.waiting_source_refs);
  nullableId(value.intake_event_id, 'intake_event_id'); nullableId(value.final_verify_event_id, 'final_verify_event_id');
  requireThat(Array.isArray(value.waiting), 'waiting must be an array');
  const refs = ['workflow_ref', 'review_ref', 'approval_ref', 'candidate_ref'];
  for (const key of refs) if (value[key] !== null) data.checkRefs([value[key]]);
  const byId = new Map(data.live.map(event => [event.event_id, event]));
  const intake = byId.get(value.intake_event_id), final = byId.get(value.final_verify_event_id);
  const waitingIds = new Set(), spans = [];
  let waitingComplete = true;
  for (const wait of value.waiting) {
    fields(wait, 'id start_event_id end_event_id', 'waiting interval');
    requireThat(text(wait.id) && !waitingIds.has(wait.id), 'duplicate waiting interval'); waitingIds.add(wait.id);
    nullableId(wait.start_event_id, 'waiting start'); nullableId(wait.end_event_id, 'waiting end');
    const start = byId.get(wait.start_event_id), end = byId.get(wait.end_event_id);
    if (!start || !end) { waitingComplete = false; continue; }
    requireThat(start.type === 'waiting' && end.type === 'waiting', 'waiting endpoint type mismatch');
    requireThat(start.step_id === end.step_id && start.run_id === end.run_id && start.attempt === end.attempt
      && refEqual(start.candidate_ref, end.candidate_ref), 'waiting endpoint identity mismatch');
    if (start.occurred_at === null || end.occurred_at === null) { waitingComplete = false; continue; }
    requireThat(Date.parse(start.occurred_at) <= Date.parse(end.occurred_at), 'negative waiting interval');
    spans.push([Date.parse(start.occurred_at), Date.parse(end.occurred_at)]);
  }
  if (!intake || !final || refs.some(key => value[key] === null)) return false;
  requireThat(intake.type === 'intake' && final.type === 'approval', 'cycle endpoint type mismatch');
  if (intake.occurred_at === null || final.occurred_at === null) return false;
  const read = ref => parseJson(readRef(root, ref), ref.path);
  const lock = read(value.workflow_ref), review = read(value.review_ref), approval = read(value.approval_ref), candidate = read(value.candidate_ref);
  requireThat(lock.work_id === workId && review.work_id === workId && approval.work_id === workId, 'cycle source work mismatch');
  requireThat(refEqual(final.candidate_ref, value.candidate_ref), 'cycle candidate event mismatch');
  requireThat([value.approval_ref, value.review_ref, value.workflow_ref, value.candidate_ref].every(ref => final.source_refs.some(source => refEqual(ref, source))), 'final approval event lacks exact source joins');
  requireThat(refEqual(review.workflow_ref, value.workflow_ref) && refEqual(approval.workflow_ref, value.workflow_ref), 'cycle workflow mismatch');
  requireThat(review.step_id === final.step_id && approval.step_id === final.step_id && review.stage_id === approval.stage_id
    && Number.isSafeInteger(review.revision) && review.revision > 0 && review.revision === approval.revision
    && approval.review_digest === value.review_ref.sha256, 'cycle approval review mismatch');
  const node = lock.workflow?.nodes?.find(item => item.step_id === final.step_id);
  const stage = lock.stages?.find(item => item.id === node?.stage_id);
  requireThat(stage?.kind === 'verification' && node.stage_id === review.stage_id, 'cycle endpoint is not Verify');
  const descendants = new Set(), remaining = [final.step_id];
  while (remaining.length) {
    const current = remaining.pop();
    for (const next of lock.workflow.nodes) {
      const follows = (lock.workflow.edges ?? []).some(edge => edge.from === current && edge.to === next.step_id)
        || Object.values(next.bindings ?? {}).flat().includes(current);
      if (follows && !descendants.has(next.step_id)) { descendants.add(next.step_id); remaining.push(next.step_id); }
    }
  }
  if ([...descendants].some(id => lock.stages.find(item => item.id === lock.workflow.nodes.find(item => item.step_id === id)?.stage_id)?.kind === 'verification')) return false;
  requireThat(Array.isArray(candidate.files) && candidate.files.length > 0 && Array.isArray(candidate.scope) && candidate.scope.length > 0
    && same(review.candidate?.files, candidate.files) && same(review.candidate?.scope, candidate.scope)
    && (review.candidate?.commit ?? null) === (candidate.commit ?? null), 'cycle reviewed candidate mismatch');
  // Later Verify approvals supersede this endpoint; failed/cancelled/closed never substitute.
  const laterVerify = data.live.some(event => event.type === 'approval' && event.sequence > final.sequence
    && lock.stages?.find(item => item.id === lock.workflow?.nodes?.find(item => item.step_id === event.step_id)?.stage_id)?.kind === 'verification');
  if (approval.decision !== 'approved' || laterVerify) return false;
  requireThat(text(approval.by) && timestamp(approval.at) && Date.parse(approval.at) === Date.parse(final.occurred_at), 'cycle approval time or actor missing');
  const start = Date.parse(intake.occurred_at), end = Date.parse(final.occurred_at);
  requireThat(intake.sequence < final.sequence && start <= end, 'invalid cycle endpoint order');
  requireThat(!data.live.some(event => ['cancelled', 'closed'].includes(event.type) && event.sequence > intake.sequence && event.sequence < final.sequence), 'cycle crosses closed or cancelled work');
  report.metrics.cycle_hours = (end - start) / HOUR;
  if (value.waiting_coverage === 'complete' && waitingComplete && waitingAttested && (spans.length > 0 || value.waiting_zero_attested)) {
    for (const [a, b] of spans) requireThat(a >= start && b <= end, 'waiting outside cycle');
    spans.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const interval of spans) {
      const last = merged.at(-1);
      if (last && interval[0] <= last[1]) last[1] = Math.max(last[1], interval[1]);
      else merged.push([...interval]);
    }
    const waiting = merged.reduce((sum, [a, b]) => sum + b - a, 0) / HOUR;
    report.metrics.waiting_hours = waiting; report.metrics.active_cycle_hours = report.metrics.cycle_hours - waiting;
  }
  report.checks.push({ id: 'intake-to-final-Verify-source-joins', status: 'valid' });
  // Preserve the historical cycle, but do not count the old result as the current
  // accepted unit after cancellation or new delivery on another candidate.
  return !data.live.some(event => event.sequence > final.sequence && (event.type === 'cancelled'
    || (['candidate', 'dispatch', 'result'].includes(event.type) && event.candidate_ref !== null
      && !refEqual(event.candidate_ref, value.candidate_ref))));
}

function cost(value, checkRefs, accepted, report) {
  fields(value, 'coverage all_inputs_included currency accepted_work_units zero_attested source_refs entries', 'cost');
  choice(value.coverage, ['complete', 'partial', 'unknown'], 'cost coverage');
  bool(value.all_inputs_included, 'all_inputs_included'); bool(value.zero_attested, 'cost zero_attested');
  requireThat(value.currency === null || /^[A-Z]{3}$/.test(value.currency), 'invalid cost currency');
  requireThat(value.accepted_work_units === null || value.accepted_work_units === 0 || value.accepted_work_units === 1, 'one business root permits at most one accepted work unit');
  const attested = checkRefs(value.source_refs);
  requireThat(Array.isArray(value.entries), 'cost entries missing');
  const ids = new Set(), sources = new Set(), outcomes = {};
  let total = 0, actual = true;
  for (const entry of value.entries) {
    fields(entry, 'id amount currency kind basis outcome source_refs', 'cost entry');
    requireThat(text(entry.id) && !ids.has(entry.id), 'duplicate cost identity'); ids.add(entry.id);
    requireThat(nonnegative(entry.amount), 'invalid cost amount');
    requireThat(/^[A-Z]{3}$/.test(entry.currency) && entry.currency === value.currency, 'cost currency mismatch');
    choice(entry.kind, ['labor', 'tool', 'infrastructure', 'other'], 'cost kind');
    choice(entry.basis, ['actual', 'estimated'], 'cost basis');
    choice(entry.outcome, ['accepted', 'failed', 'cancelled', 'other'], 'cost outcome');
    outcomes[entry.outcome] = (outcomes[entry.outcome] ?? 0) + 1;
    const sourced = checkRefs(entry.source_refs);
    for (const ref of entry.source_refs) {
      requireThat(!sources.has(refKey(ref)), 'cost source reused'); sources.add(refKey(ref));
    }
    if (entry.amount === null || entry.basis !== 'actual' || !sourced) actual = false;
    else { total += entry.amount; requireThat(Number.isFinite(total), 'cost total overflow'); }
  }
  const complete = value.coverage === 'complete' && value.all_inputs_included && attested && actual && value.currency !== null
    && (value.entries.length > 0 ? total > 0 || value.zero_attested : value.zero_attested);
  if (complete) {
    report.metrics.total_actual_cost = total;
    if (accepted && value.accepted_work_units === 1) report.metrics.cost_per_accepted_work = total;
  }
  return { coverage: value.coverage, complete, currency: value.currency, accepted_work_units: accepted ? value.accepted_work_units : null,
    entry_count: value.entries.length, outcomes };
}

function quality(root, value, data, measurement) {
  fields(value, 'status window_start window_end matured artifact_ids source_refs', 'quality');
  choice(value.status, ['unavailable', 'pending', 'observed', 'verified'], 'quality status');
  requireThat(value.matured === null || typeof value.matured === 'boolean', 'invalid quality maturity');
  uniqueIds(value.artifact_ids, 'quality artifact_ids');
  const sourced = data.checkRefs(value.source_refs);
  for (const key of ['window_start', 'window_end']) requireThat(value[key] === null || timestamp(value[key]), 'invalid quality window');
  if (value.window_start !== null && value.window_end !== null) requireThat(Date.parse(value.window_start) <= Date.parse(value.window_end), 'inverted quality window');
  const mature = value.matured === true && value.window_start !== null && value.window_end !== null && Date.parse(measurement.observed_at) >= Date.parse(value.window_end);
  if (value.status === 'verified') {
    requireThat(mature && sourced && value.artifact_ids.length > 0, 'quality verified requires mature window, actual artifact IDs and evidence');
    const joined = value.source_refs.some(ref => {
      let source;
      try { source = JSON.parse(readRef(root, ref)); } catch { return false; }
      return source.work_id === measurement.work_id && source.status === 'verified'
        && source.window_start === value.window_start && source.window_end === value.window_end
        && same(source.artifact_ids, value.artifact_ids) && measurement.cycle.candidate_ref !== null
        && refEqual(source.candidate_ref, measurement.cycle.candidate_ref)
        && data.live.some(event => event.type === 'quality' && refEqual(event.candidate_ref, source.candidate_ref)
          && event.source_refs.some(item => refEqual(item, ref)));
    });
    requireThat(joined, 'quality source artifact or candidate identity mismatch');
  }
  return { ...value, maturity_confirmed: mature, status: value.status, evidence_kind: 'descriptive_only' };
}

export function measureWork(root, request) {
  const report = { schema_version: 1, status: 'blocked', work_id: request?.work_id ?? null, measurement_id: null, business_root_id: null,
    checks: [], blockers: [], issues: [], coverage: {}, metrics: emptyMetrics(), comparison_basis: 'unavailable',
    ledger: null, quality: null, approvals_granted: false, gate_pass: false, causal_proof: false,
    limitations: 'Hashes establish structural lineage, not authenticity, permissions, approval or causal AI attribution. Human effort and coverage can be self-reported. Active cycle time is wall time, not labor. Host must authenticate sources and retain the prior head independently.' };
  try {
    root = projectRoot(root); fields(request, 'work_id ledger_ref measurement_ref', 'measurement request');
    requireThat(text(request.work_id), 'missing work_id');
    const value = parseJson(readRef(root, request.measurement_ref), 'measurement');
    fields(value, 'schema_version measurement_id work_id business_root_id observed_at policy_ref expected_head baseline actual overhead cycle cost quality', 'measurement');
    requireThat(value.schema_version === 1 && value.work_id === request.work_id, 'measurement schema or work mismatch');
    requireThat(text(value.measurement_id) && text(value.business_root_id) && timestamp(value.observed_at), 'measurement identity or observation missing');
    const data = ledger(root, request, value, report);
    if (value.policy_ref !== null) requireThat(readRef(root, value.policy_ref).length > 0, 'empty policy source');
    report.measurement_id = value.measurement_id; report.business_root_id = value.business_root_id;
    const ids = new Set(), refs = new Set(), spans = [];
    const actual = effort(value.actual, 'actual', data.checkRefs, ids, refs, spans, value.observed_at);
    const overhead = effort(value.overhead, 'overhead', data.checkRefs, ids, refs, spans, value.observed_at);
    const comparison = baseline(value.baseline, value.actual, data.checkRefs);
    report.coverage = { baseline: comparison, actual, overhead };
    report.metrics.baseline_hours = comparison.hours; report.metrics.actual_human_hours = actual.hours; report.metrics.overhead_hours = overhead.hours;
    const accepted = cycle(root, value.cycle, request.work_id, data, report);
    if (comparison.comparable && actual.complete && overhead.complete && accepted) {
      report.comparison_basis = comparison.comparison_basis;
      report.metrics.net_hours_saved = comparison.hours - actual.hours - overhead.hours;
      if (comparison.hours > 0) report.metrics.net_savings_percent = report.metrics.net_hours_saved / comparison.hours * 100;
      requireThat(Number.isFinite(report.metrics.net_hours_saved) && (report.metrics.net_savings_percent === null || Number.isFinite(report.metrics.net_savings_percent)), 'comparison arithmetic overflow');
    } else report.issues.push('Net savings unavailable: accepted equivalent work, comparable baseline, complete all-team actual effort and non-overlapping incremental overhead are required.');
    report.coverage.cycle = { accepted_source_join: accepted, waiting_coverage: value.cycle.waiting_coverage };
    if (!accepted) report.issues.push('Current accepted work unavailable: exact source-backed intake and final approved Verify candidate without later invalidation are required.');
    if (report.metrics.waiting_hours === null) report.issues.push('Waiting and active cycle time unavailable: complete waiting endpoints and coverage are required.');
    report.coverage.cost = cost(value.cost, data.checkRefs, accepted, report);
    if (report.metrics.cost_per_accepted_work === null) report.issues.push('Unit cost unavailable: actual full-cost coverage, currency and one accepted business work root are required.');
    report.quality = quality(root, value.quality, data, value);
    if (report.quality.status !== 'verified') report.issues.push('Quality observation is incomplete or not yet verified; no quality uplift is inferred.');
    const hasMetric = Object.values(report.metrics).some(item => item !== null);
    report.status = !hasMetric ? 'unavailable' : report.metrics.net_hours_saved !== null && accepted
      && report.metrics.waiting_hours !== null && report.metrics.cost_per_accepted_work !== null && report.quality.status === 'verified' ? 'measured' : 'partial';
    report.checks.push({ id: 'measurement-fields-and-coverage', status: 'valid' });
  } catch (error) {
    report.status = 'blocked'; report.blockers.push(error.code ? 'measurement source cannot be read' : error.message); report.metrics = emptyMetrics();
    report.comparison_basis = 'unavailable'; report.quality = null;
  }
  return report;
}
