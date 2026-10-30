// Fixed, read-only JSON adapter. Hashes identify bytes, never authority or approval.
import { createHash } from 'node:crypto';
import { readFileSync, lstatSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { summarizeUsage, checkBudget } from './execution-policy.mjs';
import { prepareExecution, reconcileExecution, verificationPlan } from './prepare-execution.mjs';
import { selectReviewCards, validateFindings } from './review-cards.mjs';
import { validateWork } from './validate-work.mjs';
import { measureWork } from './measurement.mjs';

export const SUMMARY_MAX_BYTES = 2048;
export const OPERATIONS = Object.freeze(['validate', 'prepare', 'usage', 'budget', 'cards', 'findings', 'reconcile', 'verify-plan', 'metrics', 'summary']);
const METRICS = ['input_tokens', 'cached_input_tokens', 'output_tokens', 'tool_output_bytes', 'calls', 'retries', 'noncached_input_tokens'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = value => JSON.stringify(value) + '\n';
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const ensure = (condition, message) => { if (!condition) throw new Error(message); };
const digest = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
function fields(value, required, optional = [], label = 'object') {
  ensure(object(value), label + ' must be an object');
  ensure(required.every(key => Object.hasOwn(value, key)), label + ' missing required field');
  ensure(Object.keys(value).every(key => [...required, ...optional].includes(key)), label + ' has unknown field');
}
function relative(value) {
  ensure(typeof value === 'string' && value.length > 0 && !value.includes('\\') && !value.includes('\0')
    && !path.isAbsolute(value) && !/^[A-Za-z]:/.test(value)
    && !value.split('/').some(part => ['', '.', '..'].includes(part)), 'unsafe relative path');
  return value;
}
function reference(value) {
  fields(value, ['path', 'sha256'], [], 'reference');
  relative(value.path); ensure(digest(value.sha256), 'invalid reference digest');
}
function projectRoot(value) {
  ensure(typeof value === 'string' && value.length > 0, 'project root required');
  const absolute = path.resolve(value), stat = lstatSync(absolute);
  ensure(stat.isDirectory() && !stat.isSymbolicLink() && realpathSync(absolute) === absolute, 'unsafe project root; use its canonical path');
  return absolute;
}
function readBytes(root, name) {
  let current = root;
  const parts = relative(name).split('/');
  for (let i = 0; i < parts.length; i++) {
    current = path.join(current, parts[i]);
    const stat = lstatSync(current);
    ensure(!stat.isSymbolicLink(), 'symlink path');
    ensure(i === parts.length - 1 ? stat.isFile() : stat.isDirectory(), 'reference is not a regular file');
  }
  return readFileSync(current);
}
function parse(bytes) {
  // Never return JSON parser diagnostics, which may quote private source bytes.
  try { return JSON.parse(bytes.toString('utf8')); } catch { throw new Error('invalid JSON'); }
}
function readRef(root, ref) {
  reference(ref);
  const bytes = readBytes(root, ref.path);
  ensure(hash(bytes) === ref.sha256, 'file digest mismatch');
  return { value: parse(bytes), sha256: hash(bytes) };
}

const ARGUMENTS = {
  validate: [['request'], []],
  prepare: [['policy', 'assignment', 'request', 'host', 'catalog', 'assessment', 'assets'], ['receipts', 'pending']],
  usage: [['receipts'], []],
  budget: [['policy', 'receipts'], ['pending']],
  cards: [['catalog', 'assessment', 'assets'], []],
  findings: [['findings', 'context'], []],
  reconcile: [['plan', 'receipt', 'expected'], []],
  'verify-plan': [['preflight', 'ids'], []],
  metrics: [['request'], []],
  summary: [['result_ref'], []]
};
function argumentsFor(operation, args) {
  const [required, optional] = ARGUMENTS[operation];
  fields(args, required, optional, 'arguments');
  for (const key of [...required, ...optional]) {
    if (!Object.hasOwn(args, key)) continue;
    const array = ['receipts', 'pending', 'assets', 'findings'].includes(key);
    ensure(array ? Array.isArray(args[key]) : object(args[key]), 'invalid argument type: ' + key);
  }
  if (operation === 'validate') {
    const request = args.request;
    fields(request, ['schema_version', 'operation', 'dispatch_ref'], ['invocation_id', 'host_receipt_ref'], 'validation request');
    ensure(request.schema_version === 1 && ['validate', 'verify-preflight'].includes(request.operation), 'unsupported validation request');
    reference(request.dispatch_ref);
    if (request.host_receipt_ref != null) reference(request.host_receipt_ref);
    if (request.invocation_id != null) ensure(typeof request.invocation_id === 'string', 'invalid invocation identity');
  }
  if (operation === 'summary') reference(args.result_ref);
  if (operation === 'metrics') {
    fields(args.request, ['work_id', 'ledger_ref', 'measurement_ref'], [], 'measurement request');
    ensure(typeof args.request.work_id === 'string' && args.request.work_id.length > 0, 'measurement work identity required');
    reference(args.request.ledger_ref); reference(args.request.measurement_ref);
  }
}

function statusFor(operation, result) {
  ensure(object(result), 'invalid helper result');
  if (result.status === 'blocked') return 'blocked';
  const allowed = { validate: ['valid', 'blocked'], prepare: ['prepared', 'blocked'], usage: ['measured', 'unavailable'],
    budget: ['within_budget', 'blocked'], cards: ['selected', 'needs_assessment'], metrics: ['measured', 'partial', 'unavailable', 'blocked'] };
  if (allowed[operation]) {
    ensure(allowed[operation].includes(result.status), 'invalid helper result status');
    return result.status;
  }
  if (['findings', 'reconcile'].includes(operation)) {
    ensure(typeof result.valid === 'boolean', 'invalid helper result validity');
    return result.valid ? 'valid' : 'blocked';
  }
  ensure(operation === 'verify-plan' && ['blocked', 'direct', 'fallback'].includes(result.mode), 'invalid verification plan');
  return result.mode === 'blocked' ? 'blocked' : 'planned';
}
const blocked = status => ['blocked', 'needs_assessment'].includes(status);
function envelopeFor(operation, argsRef, result) {
  return { schema_version: 1, operation, args_ref: argsRef, status: statusFor(operation, result), result,
    result_sha256: hash(JSON.stringify(result)), grants_approval: false, gate_pass_evaluated: false };
}
function storedEnvelope(value) {
  fields(value, ['schema_version', 'operation', 'args_ref', 'status', 'result', 'result_sha256', 'grants_approval', 'gate_pass_evaluated'], [], 'stored result');
  ensure(value.schema_version === 1 && OPERATIONS.includes(value.operation) && value.operation !== 'summary', 'unsupported stored result');
  reference(value.args_ref);
  ensure(value.grants_approval === false && value.gate_pass_evaluated === false, 'stored result cannot grant approval');
  ensure(digest(value.result_sha256) && value.result_sha256 === hash(JSON.stringify(value.result)), 'stored result digest mismatch');
  ensure(value.status === statusFor(value.operation, value.result), 'stored result status mismatch');
  for (const part of [value.result, value.result.decision, value.result.budget]) {
    if (part == null) continue;
    ensure(object(part), 'invalid stored result detail');
    for (const key of ['blockers', 'warnings']) {
      ensure(part[key] === undefined || Array.isArray(part[key]), 'invalid stored result issues');
    }
    ensure(!part.blockers?.length || blocked(value.status), 'stored result blockers contradict status');
  }
  for (const key of ['checks', 'runs', 'findings', 'cards', 'review_cards', 'tasks']) {
    ensure(value.result[key] === undefined || Array.isArray(value.result[key]), 'invalid stored result collection');
  }
  ensure(value.result.finding_count === undefined || Number.isSafeInteger(value.result.finding_count)
    && value.result.finding_count >= 0, 'invalid stored result count');
  return value;
}

/** Read and hash the complete JSON parameters, then call only a fixed existing helper. */
export function executeRequest(root, requestPath) {
  root = projectRoot(root);
  const request = parse(readBytes(root, requestPath));
  fields(request, ['schema_version', 'operation', 'args_ref'], [], 'request');
  ensure(request.schema_version === 1 && OPERATIONS.includes(request.operation), 'unsupported helper operation');
  const args = readRef(root, request.args_ref).value;
  argumentsFor(request.operation, args);
  if (request.operation === 'summary') {
    const stored = readRef(root, args.result_ref);
    return { envelope: storedEnvelope(stored.value), stored_result_sha256: stored.sha256 };
  }
  let result;
  try {
    switch (request.operation) {
      case 'validate': result = validateWork(root, args.request); break;
      case 'prepare': result = prepareExecution(args); break;
      case 'usage': result = summarizeUsage(args.receipts); break;
      case 'budget': result = checkBudget(args.policy, args.receipts, args.pending); break;
      case 'cards': result = selectReviewCards(args.catalog, args.assessment, args.assets); break;
      case 'findings': result = validateFindings(args.findings, args.context); break;
      case 'reconcile': result = reconcileExecution(args.plan, args.receipt, args.expected); break;
      case 'verify-plan': result = verificationPlan(args.preflight, args.ids); break;
      case 'metrics': result = measureWork(root, args.request); break;
    }
  } catch (error) {
    result = { status: 'blocked', blockers: [error?.code ? 'input file unavailable or unsafe' : error.message] };
  }
  return { envelope: envelopeFor(request.operation, request.args_ref, result), stored_result_sha256: null };
}

// Bound escaped JSON bytes as well as Unicode; hostile control characters cannot inflate stdout.
function short(value, limit = 96) {
  const source = typeof value === 'string' ? value : JSON.stringify(value);
  if (source == null) return null;
  let output = '', bytes = 2;
  for (const character of source) {
    const next = Buffer.byteLength(JSON.stringify(character)) - 2;
    if (bytes + next > limit - 3) return output + '…';
    output += character; bytes += next;
  }
  return output;
}
function issues(result, kind) {
  const entries = [];
  for (const [source, part] of [['result', result], ['decision', result.decision], ['budget', result.budget]]) {
    if (Array.isArray(part?.[kind])) for (const value of part[kind]) entries.push({ source, message: short(value) });
  }
  if (kind === 'blockers' && result.status === 'needs_assessment') {
    if (Array.isArray(result.unknown_tags)) for (const tag of result.unknown_tags) entries.push({ source: 'assessment', message: short('Unknown risk tag: ' + tag) });
    if (!entries.length) entries.push({ source: 'assessment', message: 'Risk assessment incomplete' });
  }
  return { count: entries.length, sample: entries.slice(0, kind === 'blockers' ? 2 : 1),
    omitted: Math.max(0, entries.length - (kind === 'blockers' ? 2 : 1)) };
}
function count(value) { return Array.isArray(value) ? value.length : 0; }
function usageSummary(value) {
  if (!object(value)) return undefined;
  return { status: value.status, receipt_count: value.receipt_count, agents: value.agents,
    totals: Object.fromEntries(METRICS.map(key => [key, value.available?.[key] === true ? value.totals?.[key] ?? null : null])),
    available: Object.fromEntries(METRICS.map(key => [key, value.available?.[key] === true])) };
}
/** Compact display only; the full envelope remains the evidence-bearing result. */
export function summarizeResult(envelope, storedResultSha256 = null) {
  const r = envelope.result, decision = r.decision;
  const usage = envelope.operation === 'usage' ? r : r.usage ?? r.budget?.usage;
  const summary = { schema_version: 1, operation: envelope.operation, status: envelope.status,
    full_result_sha256: storedResultSha256 ?? hash(encode(envelope)),
    from_stored_result: storedResultSha256 !== null,
    grants_approval: false, gate_pass_evaluated: false,
    counts: { checks: count(r.checks), runs: count(usage?.runs), findings: Array.isArray(r.findings) ? r.findings.length : r.finding_count ?? 0,
      cards: count(r.cards ?? r.review_cards), tasks: count(r.tasks) },
    blockers: issues(r, 'blockers'), warnings: issues(r, 'warnings') };
  if (blocked(summary.status) && summary.blockers.count === 0) {
    summary.blockers = { count: 1, sample: [{ source: 'result', message: 'Operation blocked; inspect the full result' }], omitted: 0 };
  }
  if (decision) summary.execution = { status: short(decision.status, 48), tier: short(decision.tier, 32),
    requested_model: short(decision.requested_model, 64), requested_reasoning: short(decision.requested_reasoning, 48) };
  if (usage) summary.usage = usageSummary(usage);
  if (r.verify) summary.verify = { eligible: r.verify.eligible === true, mode: short(r.verify.mode, 32), host_attested: r.verify.host_attested === true };
  if (envelope.operation === 'verify-plan') summary.mode = short(r.mode, 32);
  if (envelope.operation === 'reconcile') summary.model_verified = r.model_verified === true;
  if (envelope.operation === 'metrics') {
    summary.measurement = {
      work_id: short(r.work_id, 64), comparison_basis: short(r.comparison_basis, 48), causal_proof: false,
      events: r.ledger?.event_count ?? null, sources: r.ledger?.source_count ?? null, issues: count(r.issues),
      currency: r.coverage?.cost?.currency == null ? null : short(r.coverage.cost.currency, 12),
      effort_basis: r.coverage?.actual?.aggregate_basis == null ? null : short(r.coverage.actual.aggregate_basis, 40),
      metrics: Object.fromEntries(['baseline_hours', 'actual_human_hours', 'overhead_hours', 'net_hours_saved',
        'net_savings_percent', 'cycle_hours', 'waiting_hours', 'active_cycle_hours', 'total_actual_cost', 'cost_per_accepted_work']
        .map(key => [key, Number.isFinite(r.metrics?.[key]) ? r.metrics[key] : null])),
      quality_status: short(r.quality?.status, 40), detail_in_full_result: true
    };
  }
  // Fixed schema normally fits. Keep counts and explicit omission if optional samples must shrink.
  for (const group of [summary.warnings, summary.blockers]) {
    while (Buffer.byteLength(encode(summary)) > SUMMARY_MAX_BYTES && group.sample.length) {
      group.sample.pop(); group.omitted++;
    }
  }
  ensure(Buffer.byteLength(encode(summary)) <= SUMMARY_MAX_BYTES, 'summary exceeds display bound');
  return summary;
}

function failure(error) {
  // OS errors may disclose absolute paths; input parser errors are already constant strings.
  const message = error?.code ? 'input file unavailable or unsafe' : short(error?.message ?? 'helper failed', 160);
  return { schema_version: 1, operation: null, status: 'blocked', full_result_sha256: null,
    grants_approval: false, gate_pass_evaluated: false,
    blockers: { count: 1, sample: [{ source: 'request', message }], omitted: 0 } };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let output, status;
  try {
    ensure(process.argv.length === 4 || process.argv.length === 5 && process.argv[4] === '--full',
      'Usage: node check.mjs PROJECT_ROOT REQUEST_RELATIVE_PATH [--full]');
    const { envelope, stored_result_sha256: stored } = executeRequest(process.argv[2], process.argv[3]);
    output = process.argv[4] === '--full' ? envelope : summarizeResult(envelope, stored);
    status = envelope.status;
  } catch (error) { output = failure(error); status = 'blocked'; }
  process.stdout.write(encode(output));
  process.exitCode = blocked(status) ? 1 : 0;
}
