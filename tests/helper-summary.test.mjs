import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync, realpathSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { SUMMARY_MAX_BYTES, OPERATIONS } from '../helpers/check.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const helper = fileURLToPath(new URL('../helpers/check.mjs', import.meta.url));
const ref = { path: 'work/candidate.json', sha256: 'a'.repeat(64) };
function fixture(t) {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'aidlc-helper-')));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const put = (name, value) => {
    const bytes = typeof value === 'string' ? value : JSON.stringify(value);
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    writeFileSync(path.join(root, name), bytes);
    return { path: name, sha256: hash(bytes) };
  };
  const request = (operation, args) => {
    const args_ref = put('work/helper-args.json', args);
    put('work/helper-request.json', { schema_version: 1, operation, args_ref });
    return args_ref;
  };
  const run = (full = false, requestPath = 'work/helper-request.json', project = root, extra = []) => {
    const process = spawnSync(globalThis.process.execPath, [helper, project, requestPath, ...(full ? ['--full'] : []), ...extra],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    assert.equal(process.error, undefined);
    assert.equal(process.stderr, '');
    const output = JSON.parse(process.stdout);
    if (!full) assert.ok(Buffer.byteLength(process.stdout) <= SUMMARY_MAX_BYTES, 'bounded stdout');
    return { ...process, output };
  };
  return { root, put, request, run };
}
function receipt(i = 0, meters = true) {
  return { receipt_id: 'receipt-' + i, work_id: 'work-1', run_id: 'run-' + i, attempt: 1,
    executor_id: 'agent-' + i, kind: 'leaf', source_ref: 'native-event-' + i, scope: 'exclusive',
    actual_model: 'model-medium', actual_reasoning: null,
    usage: Object.fromEntries(Object.entries({ input_tokens: 2, cached_input_tokens: 1, output_tokens: 1,
      tool_output_bytes: 10, calls: 1, retries: 0 }).map(([key, value]) => [key, meters ? value : null])) };
}
function policy() {
  return { contract_version: 1, enabled: true, role_defaults: { coordinator: 'medium' }, risk_tiers: {},
    models: { medium: { primary: 'model-medium', fallbacks: [], reasoning: null } },
    budgets: { max_calls: null, max_agents: null, max_retries: null, max_input_tokens: null,
      max_output_tokens: null, max_tool_output_bytes: null, unknown_usage: 'pause' } };
}
function prepare() {
  return { policy: policy(), assignment: { kind: 'parent', run_id: 'run-0', attempt: 1 },
    request: { role: 'coordinator', task_tier: 'light', risk_tags: [], required_capabilities: [] },
    host: { model_selection: true, models: [{ id: 'model-medium', tiers: ['medium'], capabilities: [], reasoning: [] }] },
    catalog: { contract_version: 1, cards: [] }, assets: [],
    assessment: { status: 'assessed', risk_tags: [], changed_paths: [] }, receipts: [],
    pending: [{ run_id: 'run-0', attempt: 1, executor_id: null, kind: 'parent', calls: 1, retries: 0 }] };
}
function validation(f) {
  const context = { contract_version: 1, common: [], by_kind: {}, by_capability: {}, by_output_contract: {} };
  const contextRef = { ref: 'core:workflow/context.json', ...f.put('frozen/context.json', context) };
  const prompt = { ref: 'core:prompts/plan.md', ...f.put('frozen/plan.md', 'Frozen synthetic plan instructions') };
  const required = f.put('work/requirements.json', { schema_version: 1, steps: [{ step_id: 'plan', required_inputs: [],
    approval_roles: [], candidate_scope: [], required_evidence: [] }] });
  const lock = f.put('work/lock.json', { work_id: 'work-1', workflow: { nodes: [{ step_id: 'plan', stage_id: 'core.plan', bindings: {} }] },
    stages: [{ id: 'core.plan', kind: 'planning', inputs: [], outputs: [], prompt: prompt.ref }], assets: [contextRef, prompt],
    execution: { contract_version: 1, validation_ref: required }, delivery: null });
  const dispatch = f.put('work/dispatch.json', { work_id: 'work-1', step_id: 'plan', stage_id: 'core.plan', stage_kind: 'planning',
    run_id: 'run-1', revision: 1, kind: 'stage', workflow_ref: lock, input_bindings: {}, instruction_refs: [prompt],
    optional_instruction_refs: [], input_refs: [], execution: { validation: { approval_pairs: [], input_refs: [], evidence_refs: [] } } });
  return { request: { schema_version: 1, operation: 'validate', dispatch_ref: dispatch } };
}
function snapshot(root, prefix = '') {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? snapshot(path.join(root, entry.name), prefix + entry.name + '/')
    : [[prefix + entry.name, hash(readFileSync(path.join(root, entry.name)))]]);
}
function envelope(operation, result) {
  return { schema_version: 1, operation, args_ref: ref, status: result.status, result,
    result_sha256: hash(JSON.stringify(result)), grants_approval: false, gate_pass_evaluated: false };
}

test('CLI exposes every fixed operation and all successful summaries retain their decision boundary', t => {
  const f = fixture(t), p = prepare();
  const seen = new Set();
  const check = (operation, args, expected) => {
    seen.add(operation); f.request(operation, args);
    const actual = f.run();
    assert.equal(actual.status, 0, JSON.stringify(actual.output));
    assert.equal(actual.output.status, expected);
    assert.equal(actual.output.grants_approval, false);
    assert.equal(actual.output.gate_pass_evaluated, false);
    assert.equal(actual.output.from_stored_result, false);
    const full = f.run(true);
    assert.equal(full.output.result_sha256, hash(JSON.stringify(full.output.result)));
    assert.equal(actual.output.full_result_sha256, hash(full.stdout));
    return full.output;
  };
  check('validate', validation(f), 'valid');
  const plan = check('prepare', p, 'prepared');
  check('usage', { receipts: [receipt()] }, 'measured');
  check('budget', { policy: policy(), receipts: [receipt()] }, 'within_budget');
  check('cards', { catalog: p.catalog, assessment: p.assessment, assets: [] }, 'selected');
  check('findings', { findings: [], context: { candidate_ref: ref, reviewer: 'quality', gate_status: 'NOT_RUN' } }, 'valid');
  const r = { ...receipt(), kind: 'parent' };
  check('reconcile', { plan: plan.result, receipt: r,
    expected: { work_id: r.work_id, run_id: r.run_id, attempt: 1, executor_id: r.executor_id } }, 'valid');
  check('verify-plan', { preflight: { status: 'valid', verify: { eligible: false, mode: 'fallback' } },
    ids: { architecture: 'a', quality: 'q', collector: 'c', initial_collector: 'c0' } }, 'planned');
  const stored = f.put('work/stored.json', plan);
  f.request('summary', { result_ref: stored });
  const summarized = f.run(); seen.add('summary');
  assert.equal(summarized.status, 0); assert.equal(summarized.output.from_stored_result, true);
  assert.equal(summarized.output.full_result_sha256, stored.sha256);
  assert.deepEqual([...seen].sort(), [...OPERATIONS].sort());
});

test('thousands of actual usage runs stay complete in --full and compact stdout stays below 2 KiB', t => {
  const f = fixture(t), size = 12000;
  f.request('usage', { receipts: Array.from({ length: size }, (_, i) => receipt(i)) });
  const compact = f.run(), full = f.run(true);
  assert.equal(compact.status, 0); assert.equal(full.status, 0);
  assert.equal(compact.output.counts.runs, size);
  assert.equal(compact.output.usage.totals.calls, size);
  assert.equal(full.output.result.runs.length, size);
  assert.equal(full.output.result.runs.at(-1).run_id, 'run-' + (size - 1));
  assert.equal(compact.output.full_result_sha256, hash(full.stdout));
  assert.ok(full.stdout.length > 500000);
});

test('usage unavailable remains null and false, distinct from measured zero', t => {
  const f = fixture(t);
  for (const receipts of [[], [receipt(0, false)]]) {
    f.request('usage', { receipts });
    const { output, status } = f.run();
    assert.equal(status, 0); assert.equal(output.status, 'unavailable');
    assert.equal(output.usage.totals.calls, null); assert.equal(output.usage.available.calls, false);
  }
  const zero = receipt(); Object.keys(zero.usage).forEach(key => { zero.usage[key] = 0; });
  f.request('usage', { receipts: [zero] });
  assert.equal(f.run().output.usage.totals.calls, 0);
  assert.equal(f.run().output.usage.available.calls, true);
});

test('stored huge checks, findings and blocker arrays retain every item and report first errors plus exact omissions', t => {
  const f = fixture(t), size = 10000, marker = 'FIRST_BLOCKER';
  const result = { status: 'blocked', checks: Array.from({ length: size }, (_, id) => ({ id, status: 'valid' })),
    findings: Array.from({ length: size }, (_, id) => ({ id, summary: 'detail-' + id })),
    blockers: [marker, ...Array.from({ length: size - 1 }, (_, id) => 'blocked-' + id)], warnings: ['warning-one', 'warning-two'] };
  const stored = envelope('validate', result), storedRef = f.put('work/stored.json', stored);
  f.request('summary', { result_ref: storedRef });
  const compact = f.run(), full = f.run(true);
  assert.equal(compact.status, 1); assert.equal(full.status, 1);
  assert.equal(compact.output.counts.checks, size); assert.equal(compact.output.counts.findings, size);
  assert.equal(compact.output.blockers.count, size);
  assert.equal(compact.output.blockers.sample[0].message, marker);
  assert.equal(compact.output.blockers.omitted + compact.output.blockers.sample.length, size);
  assert.equal(compact.output.warnings.omitted, 1);
  assert.deepEqual(full.output, stored);
});

test('huge findings inputs are processed fully; malformed last finding fails instead of being hidden by sampling', t => {
  const f = fixture(t), findings = Array.from({ length: 6000 }, (_, id) => ({ id: 'finding-' + id, rule_id: 'rule',
    status: 'inconclusive', candidate_ref: ref, location: { path: 'src/index.js', line: 1 }, summary: 'Investigate',
    evidence: [], limitation: 'Not executed' }));
  const context = { candidate_ref: ref, reviewer: 'quality', gate_status: 'NOT_RUN' };
  f.request('findings', { findings, context });
  assert.equal(f.run().output.counts.findings, findings.length);
  findings.at(-1).candidate_ref = { ...ref, sha256: 'b'.repeat(64) };
  f.request('findings', { findings, context });
  const invalid = f.run();
  assert.equal(invalid.status, 1); assert.match(invalid.output.blockers.sample[0].message, /candidate drift/);
  assert.equal(f.run(true).output.result.blockers.length, 1);
});

test('nested budget blockers, long strings and escaped control characters remain bounded and visible', t => {
  const f = fixture(t), p = prepare(), huge = '\u0001中'.repeat(10000);
  p.policy.models.medium.primary = p.host.models[0].id = huge;
  p.policy.budgets.max_calls = 0;
  p.receipts = [receipt(1, false)];
  f.request('prepare', p);
  const result = f.run();
  assert.equal(result.status, 1); assert.equal(result.output.execution.tier, 'medium');
  assert.match(result.output.execution.requested_model, /…$/);
  assert.ok(result.output.blockers.count >= 3);
  assert.ok(result.output.blockers.omitted > 0);
  assert.equal(result.output.blockers.count, result.output.blockers.sample.length + result.output.blockers.omitted);
});

test('a stored summary does not rerun validation or refresh host attestation', t => {
  const f = fixture(t), args = validation(f);
  f.request('validate', args);
  const full = f.run(true); assert.equal(full.status, 0);
  const stored = f.put('work/validation-full.json', full.stdout);
  rmSync(path.join(f.root, 'work/dispatch.json'));
  const rerun = f.run(); assert.equal(rerun.status, 1);
  f.request('summary', { result_ref: stored });
  const replay = f.run();
  assert.equal(replay.status, 0); assert.equal(replay.output.status, 'valid');
  assert.equal(replay.output.from_stored_result, true);
  assert.equal(replay.output.grants_approval, false);
});

test('wrong digests and tampered stored result content or status fail closed', t => {
  const f = fixture(t);
  f.request('usage', { receipts: [] });
  f.put('work/helper-args.json', { receipts: [receipt()] });
  assert.match(f.run().output.blockers.sample[0].message, /digest mismatch/);
  const full = envelope('usage', { status: 'unavailable', runs: [] });
  full.result.runs.push({ run_id: 'changed' });
  let stored = f.put('work/stored.json', full); f.request('summary', { result_ref: stored });
  assert.match(f.run().output.blockers.sample[0].message, /digest mismatch/);
  full.result_sha256 = hash(JSON.stringify(full.result)); full.status = 'measured';
  stored = f.put('work/stored.json', full); f.request('summary', { result_ref: stored });
  assert.match(f.run().output.blockers.sample[0].message, /status mismatch/);
  full.status = 'unavailable'; full.grants_approval = true;
  stored = f.put('work/stored.json', full); f.request('summary', { result_ref: stored });
  assert.equal(f.run().status, 1);
  full.grants_approval = false; full.result.blockers = ['Cannot claim success'];
  full.result_sha256 = hash(JSON.stringify(full.result));
  stored = f.put('work/stored.json', full); f.request('summary', { result_ref: stored });
  assert.equal(f.run().status, 1);
  assert.match(f.run().output.blockers.sample[0].message, /contradict status/);
  full.result.blockers = 'Not an issue array'; full.result_sha256 = hash(JSON.stringify(full.result));
  stored = f.put('work/stored.json', full); f.request('summary', { result_ref: stored });
  assert.equal(f.run().status, 1);
});

test('unknown operations, fields, types, CLI flags and missing fields fail safely', t => {
  const f = fixture(t), args_ref = f.put('work/args.json', { receipts: [] });
  for (const request of [
    { schema_version: 1, operation: 'shell', args_ref },
    { schema_version: 1, operation: 'usage', args_ref, command: 'touch dangerous' },
    { schema_version: 1, operation: 'usage' },
    { schema_version: '1', operation: 'usage', args_ref },
    { schema_version: 1, operation: 'usage', args_ref: { ...args_ref, extra: true } },
    [], null
  ]) {
    f.put('work/helper-request.json', request); assert.equal(f.run().status, 1);
  }
  for (const args of [{ receipts: [], command: 'anything' }, { receipts: {} }, {}, null, []]) {
    f.request('usage', args); assert.equal(f.run().status, 1);
  }
  f.request('usage', { receipts: [] });
  assert.equal(f.run(false, undefined, undefined, ['--command']).status, 1);
});

test('invalid JSON never leaks source text at request, argument or validation-reference boundaries', t => {
  const f = fixture(t), secret = 'PRIVATE_SOURCE_TEXT is not JSON';
  f.put('work/helper-request.json', secret);
  assert.ok(!f.run().stdout.includes('PRIVATE_SOURCE_TEXT'));
  const args_ref = f.put('work/args.json', secret);
  f.put('work/helper-request.json', { schema_version: 1, operation: 'usage', args_ref });
  assert.ok(!f.run().stdout.includes('PRIVATE_SOURCE_TEXT'));
  const dispatch_ref = f.put('work/invalid-dispatch.json', secret);
  f.request('validate', { request: { schema_version: 1, operation: 'validate', dispatch_ref } });
  const full = f.run(true);
  assert.equal(full.status, 1); assert.ok(!full.stdout.includes('PRIVATE_SOURCE_TEXT'));
  assert.match(full.output.result.blockers[0], /invalid JSON/);
});

test('path escapes, symlink files/directories and symlink roots are refused', t => {
  const f = fixture(t), args_ref = f.request('usage', { receipts: [] });
  for (const name of ['../escape', '/etc/passwd', 'work/../args.json', 'work\\args.json', 'C:/private', 'work//args.json', 'work/./args.json']) {
    f.put('work/helper-request.json', { schema_version: 1, operation: 'usage', args_ref: { ...args_ref, path: name } });
    assert.equal(f.run().status, 1);
  }
  f.request('usage', { receipts: [] });
  assert.equal(f.run(false, '../helper-request.json').status, 1);
  symlinkSync(path.join(f.root, 'work/helper-args.json'), path.join(f.root, 'work/alias.json'));
  f.put('work/helper-request.json', { schema_version: 1, operation: 'usage', args_ref: { ...args_ref, path: 'work/alias.json' } });
  assert.match(f.run().output.blockers.sample[0].message, /symlink/);
  symlinkSync(path.join(f.root, 'work'), path.join(f.root, 'alias-dir'));
  f.put('work/helper-request.json', { schema_version: 1, operation: 'usage', args_ref: { ...args_ref, path: 'alias-dir/helper-args.json' } });
  assert.equal(f.run().status, 1);
  symlinkSync(f.root, path.join(f.root, 'alias-root'));
  assert.equal(f.run(false, 'work/helper-request.json', path.join(f.root, 'alias-root')).status, 1);
});

test('actual CLI leaves every project byte unchanged on success, full output, stored summary and failure', t => {
  const f = fixture(t);
  f.request('validate', validation(f));
  const before = snapshot(f.root);
  assert.equal(f.run().status, 0); const full = f.run(true);
  assert.deepEqual(snapshot(f.root), before);
  const stored = f.put('work/full.json', full.stdout); f.request('summary', { result_ref: stored });
  const replayBefore = snapshot(f.root); f.run(); f.run(true);
  assert.deepEqual(snapshot(f.root), replayBefore);
  f.request('budget', { policy: policy(), receipts: [receipt(), { ...receipt(), actual_model: 'different' }] });
  const failedBefore = snapshot(f.root); assert.equal(f.run().status, 1); f.run(true);
  assert.deepEqual(snapshot(f.root), failedBefore);
});
