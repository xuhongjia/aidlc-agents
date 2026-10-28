// Synthetic project-readiness contracts; no live service, installation, login or approval claims.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveSetup, authorizeSetupReads, evaluateSetup } from './support/setup-model.mjs';
import { digest } from './support/workflow-model.mjs';

const read = name => JSON.parse(readFileSync(new URL('../' + name, import.meta.url), 'utf8'));
const copy = value => structuredClone(value);
const base = () => ({ package: 'aidlc-agents', package_version: 'synthetic', source: { revision: 'a'.repeat(40) }, tool: 'synthetic-host',
  execution: { mode: 'isolated-subagents', context_policy: 'fresh-minimal', max_parallel_workers: 2 },
  setup: { required: [{ id: 'aidlc', capability: 'aidlc', target_id: null }], read_check_authorization: null },
  knowledge: { targets: [] }, delivery: null });
const wiki = (id = 'wiki') => ({ id, provider: 'confluence_cloud', transport: 'twg_cli', site: 'https://example.atlassian.net',
  space_id: 'space', parent_page_id: 'parent-' + id, types: ['lesson'] });
const config = () => {
  const config = base(); config.knowledge.targets.push(wiki());
  config.delivery = read('examples/delivery/gitlab-same-project.json').delivery;
  config.setup.required.push({ id: 'knowledge', capability: 'confluence', target_id: 'wiki' },
    { id: 'ci', capability: 'gitlab', target_id: config.delivery.bindings.find(binding => binding.phase === 'ci').id });
  return config;
};
const authorization = resolved => ({ user_statement: 'Synthetic explicit authorization to read the listed setup targets.',
  source: 'synthetic-user-request', at: '2026-10-26T00:00:00Z', scope_digest: resolved.scope_digest });
const verified = { aidlc: ['package_integrity', 'spawn', 'isolated_context', 'collect_results'],
  confluence: ['authenticated', 'target_read'], gitlab: ['authenticated', 'target_read', 'mappings_read'] };
const checks = resolved => resolved.requirements.map(requirement => ({ requirement_id: requirement.id, status: 'ready',
  invocation_id: 'synthetic-call', config_digest: resolved.scope_digest, observed_at: '2026-10-26T00:01:00Z',
  authorization_digest: authorizeSetupReads(resolved, authorization(resolved)).authorization_digest,
  verified_checks: copy(verified[requirement.capability]),
  evidence_refs: [{ path: 'synthetic/' + requirement.id + '.json', sha256: digest(requirement) }] }));
const invocation = resolved => ({ intent: 'new_work', invocation_id: 'synthetic-call', resolved,
  authorization: authorization(resolved), checks: checks(resolved),
  invocation_started_at: '2026-10-26T00:00:30Z', evaluated_at: '2026-10-26T00:02:00Z' });

test('new template and legacy missing setup require aidlc only without inventing authority', () => {
  const template = read('templates/setup/config.json');
  assert.deepEqual(template.setup, { required: [{ id: 'aidlc', capability: 'aidlc', target_id: null }], read_check_authorization: null });
  const legacy = base(); delete legacy.setup;
  for (const config of [template, legacy]) {
    const resolved = resolveSetup(config);
    assert.deepEqual(resolved.blockers, []); assert.equal(resolved.requirements.length, 1);
    assert.deepEqual(authorizeSetupReads(resolved, null), { authorized: true, external_reads: [], authorization_digest: null });
    assert.equal(evaluateSetup({ ...invocation(resolved), authorization: null }).status, 'ready');
  }
});

test('invalid explicit setup does not fall back; unfinished external targets remain mandatory', () => {
  for (const setup of [null, {}, { required: [] }, { required: [{ id: 'wiki', capability: 'confluence', target_id: null }] }]) {
    const resolved = resolveSetup({ ...base(), setup });
    assert.ok(resolved.blockers.length); assert.equal(evaluateSetup(invocation(resolved)).status, 'blocked');
  }
  const config = base(); config.setup.required.push({ id: 'wiki', capability: 'confluence', target_id: null });
  const resolved = resolveSetup(config);
  assert.equal(resolved.requirements[1].target_id, null);
  assert.equal(evaluateSetup(invocation(resolved)).create_work, false);
});

test('only declared required targets are resolved or read, including multiple targets', () => {
  const config = base(); config.knowledge.targets = [wiki(), wiki('second')];
  config.delivery = { bindings: [{ id: 'optional-unfinished' }] };
  const before = resolveSetup(config);
  assert.equal(authorizeSetupReads(before, null).external_reads.length, 0);
  config.knowledge.targets[0].parent_page_id = 'changed-optional';
  assert.equal(resolveSetup(config).scope_digest, before.scope_digest);
  for (const target of config.knowledge.targets) config.setup.required.push({ id: target.id, capability: 'confluence', target_id: target.id });
  const resolved = resolveSetup(config), auth = authorizeSetupReads(resolved, authorization(resolved));
  assert.deepEqual(resolved.blockers, []);
  assert.deepEqual(auth.external_reads.map(item => item.target_id), ['second', 'wiki']);
  assert.equal(evaluateSetup(invocation(resolved)).status, 'ready');
});

test('unknown, duplicate, incompatible and missing identities block before external reads', () => {
  for (const mutate of [
    c => { c.setup.required[1].capability = 'unknown'; },
    c => { c.setup.required[1].id = 'aidlc'; },
    c => { c.setup.required.push(copy(c.setup.required[0])); },
    c => { c.setup.required.push({ ...c.setup.required[1], id: 'duplicate-target' }); },
    c => { c.setup.required[0].target_id = 'wiki'; },
    c => { c.setup.required[1].target_id = 'missing'; },
    c => { c.knowledge.targets.push(copy(c.knowledge.targets[0])); },
    c => { c.knowledge.targets[0].provider = 'other'; },
    c => { c.knowledge.targets[0].transport = 'other'; },
    c => { c.knowledge.targets[0].site = 'https://user:password@example.atlassian.net'; },
    c => { c.setup.required[2].target_id = 'missing'; },
    c => { c.delivery.bindings[0].provider = 'other'; },
    c => { c.delivery.bindings[0].token = 'synthetic-secret'; },
  ]) {
    const changed = config(); mutate(changed); const resolved = resolveSetup(changed);
    assert.ok(resolved.blockers.length);
    assert.deepEqual(authorizeSetupReads(resolved, authorization(resolved)).external_reads, []);
    assert.equal(evaluateSetup(invocation(resolved)).status, 'blocked');
  }
});

test('read authorization requires real structural identity, matching scope and no revocation', () => {
  const resolved = resolveSetup(config());
  assert.equal(authorizeSetupReads(resolved, authorization(resolved)).authorized, true);
  for (const auth of [null, {}, { ...authorization(resolved), user_statement: '' }, { ...authorization(resolved), source: null },
    { ...authorization(resolved), at: 'unknown' }, { ...authorization(resolved), scope_digest: 'old' },
    { ...authorization(resolved), revoked: true }, { ...authorization(resolved), status: 'revoked' },
    { ...authorization(resolved), revoked_at: '2026-10-26T00:00:30Z' }]) {
    assert.equal(authorizeSetupReads(resolved, auth).authorized, false);
    assert.equal(evaluateSetup({ ...invocation(resolved), authorization: auth }).status, 'blocked');
  }
});

test('receipts and snapshots bind the exact read grant; replacing a grant for the same scope invalidates checks', () => {
  const resolved = resolveSetup(config()), input = invocation(resolved), authority = authorizeSetupReads(resolved, input.authorization);
  assert.equal(authority.authorization_digest, digest(input.authorization));
  assert.equal(evaluateSetup(input).snapshot.authorization_digest, authority.authorization_digest);
  const reordered = Object.fromEntries(Object.entries(input.authorization).reverse());
  assert.equal(authorizeSetupReads(resolved, reordered).authorization_digest, authority.authorization_digest);
  assert.equal(evaluateSetup({ ...input, authorization: reordered }).status, 'ready');
  for (const patch of [{ user_statement: 'A replacement synthetic grant for the same targets.' },
    { source: 'replacement-user-request' }, { at: '2026-10-26T00:00:10Z' }]) {
    const replacement = { ...input.authorization, ...patch };
    assert.equal(authorizeSetupReads(resolved, replacement).authorized, true);
    assert.notEqual(authorizeSetupReads(resolved, replacement).authorization_digest, authority.authorization_digest);
    assert.equal(evaluateSetup({ ...input, authorization: replacement }).status, 'blocked');
  }
  // Even the aidlc receipt in this externally scoped invocation is bound to the actual grant used.
  for (let index = 0; index < input.checks.length; index++) {
    const changed = copy(input); delete changed.checks[index].authorization_digest;
    assert.equal(evaluateSetup(changed).status, 'blocked');
  }
  const local = invocation(resolveSetup(base()));
  assert.equal(evaluateSetup({ ...local, authorization: null }).snapshot.authorization_digest, null);
  assert.ok(local.checks.every(check => check.authorization_digest === null));
  local.checks[0].authorization_digest = authority.authorization_digest;
  assert.equal(evaluateSetup(local).status, 'blocked');
});

test('pending install/auth/target and executable-only evidence cannot satisfy readiness', () => {
  const resolved = resolveSetup(config());
  for (const status of ['pending_install', 'pending_auth', 'pending_target', 'blocked', 'unknown', 'installed', 'configured']) {
    const input = invocation(resolved); input.checks[1].status = status;
    assert.equal(evaluateSetup(input).status, 'blocked');
  }
  for (const mutate of [c => { c.verified_checks = ['cli_present']; }, c => { c.verified_checks = ['authenticated']; },
    c => { c.evidence_refs = []; }, c => { c.evidence_refs[0].sha256 = 'unknown'; },
    c => { c.evidence_refs[0].path = '../secret'; }]) {
    const input = invocation(resolved); mutate(input.checks[1]);
    assert.equal(evaluateSetup(input).status, 'blocked');
  }
});

test('new work rejects missing, duplicate, stale, widened and future receipts', () => {
  const resolved = resolveSetup(config());
  for (const mutate of [
    input => { input.checks.pop(); }, input => { input.checks.push(copy(input.checks[0])); },
    input => { input.checks[0].requirement_id = 'optional'; },
    input => { input.checks[0].invocation_id = 'previous-call'; },
    input => { input.checks[0].config_digest = 'previous-config'; },
    input => { input.checks[0].observed_at = 'unknown'; },
    input => { input.checks[0].observed_at = '2026-10-25T00:00:00Z'; },
    input => { input.checks[0].observed_at = '2026-10-27T00:00:00Z'; },
  ]) {
    const input = invocation(resolved); mutate(input); const result = evaluateSetup(input);
    assert.equal(result.status, 'blocked'); assert.equal(result.create_work, false); assert.equal(result.snapshot, null);
  }
});

test('readiness requires valid ordered invocation boundaries and inclusive observation times', () => {
  const resolved = resolveSetup(config());
  for (const intent of ['new_work', 'setup_check']) {
    for (const mutate of [
      input => { delete input.invocation_started_at; }, input => { delete input.evaluated_at; },
      input => { input.invocation_started_at = null; }, input => { input.evaluated_at = null; },
      input => { input.invocation_started_at = 'invalid'; }, input => { input.evaluated_at = 'invalid'; },
      input => { input.invocation_started_at = input.evaluated_at; input.evaluated_at = '2026-10-26T00:00:00Z'; },
      input => { input.checks[0].observed_at = '2026-10-26T00:00:29.999Z'; },
      input => { input.checks[0].observed_at = '2026-10-26T00:02:00.001Z'; },
    ]) {
      const input = { ...invocation(resolved), intent }; mutate(input);
      const result = evaluateSetup(input); assert.equal(result.status, 'blocked'); assert.equal(result.create_work, false);
    }
    for (const boundary of ['invocation_started_at', 'evaluated_at']) {
      const input = { ...invocation(resolved), intent }; input.checks.forEach(check => { check.observed_at = input[boundary]; });
      assert.equal(evaluateSetup(input).status, 'ready');
    }
    const sameInstant = { ...invocation(resolved), intent };
    sameInstant.invocation_started_at = sameInstant.evaluated_at;
    sameInstant.checks.forEach(check => { check.observed_at = sameInstant.evaluated_at; });
    assert.equal(evaluateSetup(sameInstant).status, 'ready');
  }
});

test('setup_check uses full readiness checks but never creates work even when ready', () => {
  const resolved = resolveSetup(config()), input = { ...invocation(resolved), intent: 'setup_check' };
  const result = evaluateSetup(input);
  assert.equal(result.status, 'ready'); assert.equal(result.create_work, false);
  assert.deepEqual(result.snapshot, evaluateSetup({ ...input, intent: 'new_work' }).snapshot);
  input.checks.pop();
  assert.equal(evaluateSetup(input).status, 'blocked'); assert.equal(evaluateSetup(input).create_work, false);
});

test('target and requirement drift invalidate old authorization and receipts; method updates keep read scope', () => {
  for (const mutate of [c => { c.knowledge.targets[0].parent_page_id = 'moved'; },
    c => { c.delivery.bindings[0].connection_ref = 'other-host'; },
    c => { c.setup.required[1].id = 'renamed'; }]) {
    const original = config(), resolved = resolveSetup(original), oldInput = invocation(resolved);
    const changed = copy(original); mutate(changed); const current = resolveSetup(changed);
    assert.notEqual(current.scope_digest, resolved.scope_digest);
    assert.equal(authorizeSetupReads(current, oldInput.authorization).authorized, false);
    assert.equal(evaluateSetup({ ...oldInput, resolved: current, authorization: authorization(current) }).status, 'blocked');
  }
  const original = config(), methodUpdate = copy(original); methodUpdate.source.revision = 'b'.repeat(40);
  assert.equal(resolveSetup(methodUpdate).scope_digest, resolveSetup(original).scope_digest);
  const resolved = resolveSetup(config()); resolved.requirements.find(item => item.capability === 'confluence').target.parent_page_id = 'tampered';
  assert.equal(authorizeSetupReads(resolved, authorization(resolved)).authorized, false);
  assert.equal(evaluateSetup(invocation(resolved)).status, 'blocked');
});

test('GitLab setup needs complete mappings and preserves exact dependent target identities', () => {
  for (const mutate of [c => { c.delivery.bindings[0].reports = []; },
    c => { c.delivery.bindings[0].reports[0].mapping = {}; },
    c => { c.delivery.bindings[0].required_jobs = []; },
    c => { c.delivery.wait.interval_seconds = 0; }]) {
    const changed = config(); mutate(changed); assert.ok(resolveSetup(changed).blockers.length);
  }
  const current = config(), cd = current.delivery.bindings.find(binding => binding.phase === 'cd');
  current.setup.required.push({ id: 'cd', capability: 'gitlab', target_id: cd.id });
  const resolved = resolveSetup(current);
  assert.deepEqual(resolved.blockers, []);
  assert.equal(resolved.requirements.find(requirement => requirement.id === 'cd').target.bindings.length, 2);
  assert.equal(evaluateSetup(invocation(resolved)).status, 'ready');
});

test('existing same/cross-project bindings, local artifact-only CI and host-parsed JUnit remain valid', () => {
  for (const name of ['same-project', 'cross-project']) {
    const current = base(); current.delivery = read('examples/delivery/gitlab-' + name + '.json').delivery;
    for (const binding of current.delivery.bindings) current.setup.required.push({ id: binding.id, capability: 'gitlab', target_id: binding.id });
    const resolved = resolveSetup(current);
    assert.deepEqual(resolved.blockers, []); assert.equal(evaluateSetup(invocation(resolved)).status, 'ready');
  }
  const local = config(); local.delivery.gate_mode = 'local';
  local.delivery.bindings[0].reports = local.delivery.bindings[0].reports.filter(report => report.type === 'artifact');
  assert.deepEqual(resolveSetup(local).blockers, []);
  const junit = config(), report = junit.delivery.bindings[0].reports.find(report => report.type === 'gate');
  report.format = 'junit'; report.artifact_path = 'reports/architecture.xml'; report.mapping = { checks: 'testsuites.testcase' };
  assert.deepEqual(resolveSetup(junit).blockers, []);
});

test('scope digest has canonical object keys and sorted requirement IDs while target arrays retain order', () => {
  const original = config(), reordered = copy(original); reordered.setup.required.reverse();
  reordered.knowledge.targets[0] = Object.fromEntries(Object.entries(reordered.knowledge.targets[0]).reverse());
  assert.equal(resolveSetup(original).scope_digest, resolveSetup(reordered).scope_digest);
  const resolved = resolveSetup(original);
  assert.equal(resolved.requirements.find(item => item.capability === 'aidlc').target, null);
  assert.equal(resolved.scope_digest, digest({ requirements: resolved.requirements }));
  reordered.delivery.bindings[0].reports.reverse();
  assert.notEqual(resolveSetup(original).scope_digest, resolveSetup(reordered).scope_digest);
});

test('continuations and control operations neither acquire current requirements nor authorize reads', () => {
  const failIfRead = new Proxy({}, { get() { throw new Error('must not inspect changed project setup'); } });
  for (const intent of ['continue', 'continuation', 'rework', 'resume', 'status', 'approval', 'revoke', 'close', 'terminate', 'closing']) {
    const result = evaluateSetup({ intent, resolved: failIfRead, checks: failIfRead, authorization: failIfRead });
    assert.equal(result.status, ['continue', 'continuation', 'rework', 'resume'].includes(intent) ? 'pinned' : 'not_applicable');
    assert.deepEqual(result.external_reads, []); assert.equal(result.create_work, false); assert.equal(result.snapshot, null);
  }
  assert.equal(evaluateSetup({ intent: 'invented' }).status, 'blocked');
});

test('technical readiness snapshot preserves evidence without granting publication, CI PASS or stage approval', () => {
  const current = config(), before = copy(current), resolved = resolveSetup(current), input = invocation(resolved);
  const result = evaluateSetup(input);
  assert.equal(result.status, 'ready'); assert.equal(result.create_work, true);
  assert.deepEqual(result.snapshot.requirements, resolved.requirements);
  assert.deepEqual(result.snapshot.checks, input.checks);
  assert.equal(result.snapshot.config_digest, digest({ requirements: result.snapshot.requirements }));
  assert.equal(result.snapshot.authorization_digest, digest(input.authorization));
  assert.equal(result.snapshot.invocation_started_at, input.invocation_started_at);
  assert.equal(result.snapshot.evaluated_at, input.evaluated_at);
  for (const key of ['knowledge_publish', 'approval', 'pipeline_result', 'ci_status', 'stage_approval']) assert.equal(Object.hasOwn(result.snapshot, key), false);
  result.snapshot.requirements.find(item => item.capability === 'confluence').target.parent_page_id = 'changed-snapshot';
  assert.deepEqual(current, before); assert.notEqual(resolved.requirements.find(item => item.capability === 'confluence').target.parent_page_id, 'changed-snapshot');
});
