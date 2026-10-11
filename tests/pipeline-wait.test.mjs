import test from 'node:test';
import assert from 'node:assert/strict';
import { digest } from './support/workflow-model.mjs';
import { createWaitState, registerWait, wakeWait, collectWaitResult, cancelWait, reusableCheck } from './support/pipeline-wait-model.mjs';
import { pipelineFixture, collectCI, collectCD, reference, hashBytes } from './support/pipeline-fixtures.mjs';
const copy = value => structuredClone(value);
function fixture({ mode = 'manual', supported = true, contexts = null } = {}) {
  const pipeline = pipelineFixture();
  const context = { work_id: 'work', step_id: 'verify', revision: 1, workflow_digest: 'original-lock', candidate_digest: 'candidate-v1',
    delivery_digest: digest(pipeline.delivery), input_digest: 'approved-input', baseline_digest: 'approved-rules', authorized: true,
    authorization_ref: reference('synthetic-wait-authorization.json'),
    binding_ids: pipeline.requests.map(r => r.binding_id) };
  const state = createWaitState(contexts ?? context, mode), actions = [], leases = new Set(), monitors = [];
  let spawned = 0;
  const results = [collectCI(pipeline), collectCD(pipeline)];
  const raw = {};
  for (const result of results) { const body = JSON.stringify(result); result.ref = reference(result.binding_id + '.json', body); raw[result.ref.path] = body; }
  const host = { supported,
    create: request => { actions.push({ action: 'create', request }); const id = 'monitor-' + (monitors.length + 1); monitors.push(id); return id; },
    find: () => monitors[0], update: (id, request) => { actions.push({ action: 'update', id, request }); return true; },
    stop: id => { actions.push({ action: 'stop', id }); return true; },
    claim: key => { if (leases.has(key)) return false; leases.add(key); actions.push({ action: 'claim', key }); return true; },
    release: key => { leases.delete(key); actions.push({ action: 'release', key }); },
    spawn: request => { const n = ++spawned; actions.push({ action: 'spawn', request }); return { run_id: 'resume-' + n, agent_id: 'child-' + n }; },
    stopWorker: id => { actions.push({ action: 'stop_worker', id }); return true; },
    validateReview: (_result, outputs) => outputs.every(r => r.status === 'PASS' && raw[r.ref?.path]
      && hashBytes(raw[r.ref.path]) === r.ref.sha256 && digest(JSON.parse(raw[r.ref.path])) === digest(Object.fromEntries(Object.entries(r).filter(([k]) => k !== 'ref')))),
  };
  const initial = { ...context, run_id: 'initial-1', agent_id: 'initial-child-1', finished: true, status: 'waiting_external',
    wait_request: { ...context, evidence_refs: [reference('initial-ci-evidence.json')], origin_run_id: 'initial-1' } };
  return { context, state, host, initial, actions, results, raw, pipeline };
}
const start = f => registerWait(f.state, f.initial, f.context, f.host, 0);
const resumeResult = (f, run, status = 'ready_for_review') => ({ ...f.context, ...run, finished: true, status });

test('waiting frees the stage slot, stores original evidence, and never creates an approval', () => {
  const f = fixture(); start(f);
  assert.equal(f.state.nodes.verify, 'waiting_external'); assert.deepEqual(f.state.active_runs, []); assert.deepEqual(f.state.approvals, []);
  assert.equal(f.state.waits[0].request_refs[0].origin_run_id, 'initial-1');
  assert.equal(f.state.waits[0].deadline, 7200000); assert.equal(f.state.waits[0].interval_ms, 300000);
  assert.equal(f.state.wait_monitor.status, 'active'); assert.equal(f.actions.filter(a => a.action === 'create').length, 1);
});
test('pending stays quiet, first manual operation notifies once, and no polling child is spawned', () => {
  const f = fixture(); start(f);
  assert.deepEqual(wakeWait(f.state, f.context, f.host, 300000, { status: 'WAITING', reason: 'pending' }), { action: 'WAIT', notify: false });
  assert.equal(wakeWait(f.state, f.context, f.host, 600000, { status: 'WAITING', reason: 'manual' }).notify, true);
  assert.equal(wakeWait(f.state, f.context, f.host, 900000, { status: 'WAITING', reason: 'manual' }).notify, false);
  assert.equal(f.actions.filter(a => a.action === 'spawn').length, 0); assert.deepEqual(f.state.approvals, []);
});
test('pending-to-success uses one fresh collecting child; duplicate wake cannot dispatch or approve twice', () => {
  const f = fixture(); start(f);
  const wake = wakeWait(f.state, f.context, f.host, 300000, { status: 'READY', pipeline_id: 20 });
  assert.equal(wake.action, 'COLLECT'); assert.equal(wake.run.agent_id, 'child-1');
  assert.equal(f.actions.find(a => a.action === 'spawn').request.fresh_context, true);
  assert.equal(wakeWait(f.state, f.context, f.host, 300001, { status: 'READY' }).action, 'BUSY');
  collectWaitResult(f.state, resumeResult(f, wake.run), f.context, f.host, f.results);
  assert.equal(f.state.node_status, 'awaiting_approval'); assert.equal(f.state.wait_monitor.status, 'stopped');
  assert.deepEqual(f.state.approvals, []); assert.equal(f.actions.filter(a => a.action === 'spawn').length, 1);
  assert.throws(() => collectWaitResult(f.state, resumeResult(f, wake.run), f.context, f.host, f.results), /unknown child/);
});
test('auto delegation does not turn waiting or a collecting child into an approval', () => {
  const f = fixture({ mode: 'auto_low_risk' }); start(f);
  const wake = wakeWait(f.state, f.context, f.host, 1000, { status: 'READY' });
  collectWaitResult(f.state, resumeResult(f, wake.run), f.context, f.host, f.results);
  assert.deepEqual(f.state.approvals, []); assert.equal(f.state.node_status, 'awaiting_approval');
  // The existing approval-policy validator, not this wait handler, decides auto approval.
});
test('ready inspection alone and fabricated pipeline PASS cannot produce a stage review', () => {
  const f = fixture(); start(f); const wake = wakeWait(f.state, f.context, f.host, 1000, { status: 'READY' });
  assert.throws(() => collectWaitResult(f.state, resumeResult(f, wake.run), f.context, f.host, [{ binding_id: f.context.binding_ids[0], status: 'PASS' }]), /all required/);
  const fake = f.results.map(r => ({ ...r, jobs: [] }));
  assert.throws(() => collectWaitResult(f.state, resumeResult(f, wake.run), f.context, f.host, fake), /parent evidence/);
  assert.equal(f.state.node_status, 'working'); assert.equal(f.state.wait_monitor.status, 'active'); assert.deepEqual(f.state.approvals, []);
});
test('failure collects actual failure evidence, stops monitoring and asks for human action without automatic repair', () => {
  const f = fixture(); start(f); const wake = wakeWait(f.state, f.context, f.host, 1000, { status: 'FAIL', job_id: 150 });
  collectWaitResult(f.state, resumeResult(f, wake.run, 'failed'), f.context, f.host, []);
  assert.equal(f.state.node_status, 'failed'); assert.equal(f.state.wait_monitor.status, 'stopped');
  assert.ok(f.state.events.includes('human_action_required')); assert.deepEqual(f.state.approvals, []);
  assert.equal(f.actions.filter(a => a.action === 'spawn').length, 1);
});
test('repeated wait requests preserve the first deadline and one monitor; a resumed retry may wait again', () => {
  const f = fixture(); const wait = start(f);
  registerWait(f.state, f.initial, f.context, f.host, 1000);
  assert.equal(f.actions.filter(a => a.action === 'create').length, 1); assert.equal(f.state.waits[0].request_refs.length, 1);
  const wake = wakeWait(f.state, f.context, f.host, 2000, { status: 'READY' });
  const waiting = { ...resumeResult(f, wake.run, 'waiting_external'), wait_request: { ...f.initial.wait_request, origin_run_id: wake.run.run_id } };
  collectWaitResult(f.state, waiting, f.context, f.host, []);
  assert.equal(f.state.waits[0].deadline, wait.deadline); assert.equal(f.state.wait_monitor.status, 'active'); assert.equal(f.state.active_runs.length, 0);
  const resumed = wakeWait(f.state, f.context, f.host, 3000, { status: 'READY' }); assert.equal(resumed.run.agent_id, 'child-2');
});
test('timeout and permission errors cannot approve, extend their budget or keep spawning children', () => {
  const f = fixture(); start(f);
  assert.equal(wakeWait(f.state, f.context, f.host, 7200000, { status: 'READY' }).action, 'EXPIRED');
  assert.equal(f.state.node_status, 'blocked'); assert.equal(f.state.wait_monitor.status, 'stopped');
  assert.equal(f.actions.filter(a => a.action === 'spawn').length, 0);
  assert.equal(wakeWait(f.state, f.context, f.host, 7200001, { status: 'READY' }).notify, false);
  const g = fixture(); start(g);
  assert.equal(wakeWait(g.state, g.context, g.host, 1000, { status: 'BLOCKED', reason: '403' }).action, 'BLOCKED');
  assert.equal(g.state.wait_monitor.status, 'stopped'); assert.deepEqual(g.state.approvals, []);
});
test('candidate/rules/input/workflow drift, authorization revocation and closure stop before inspection', () => {
  for (const patch of [{ candidate_digest: 'changed' }, { baseline_digest: 'changed' }, { input_digest: 'changed' }, { delivery_digest: 'changed' },
    { workflow_digest: 'changed' }, { revoked: true }, { authorized: false }, { authorization_ref: null }]) {
    const f = fixture(); start(f);
    assert.equal(wakeWait(f.state, { ...f.context, ...patch }, f.host, 1000, { status: 'READY' }).action, 'STOP');
    assert.ok(!f.state.events.includes('inspect')); assert.equal(f.actions.filter(a => a.action === 'spawn').length, 0);
    assert.equal(f.state.wait_monitor.status, 'stopped'); assert.deepEqual(f.state.approvals, []);
  }
});
test('late child results from a prior candidate/revision or revoked authority do not change state', () => {
  const f = fixture(); start(f); const wake = wakeWait(f.state, f.context, f.host, 1000, { status: 'READY' });
  const before = digest(f.state);
  for (const patch of [{ revision: 2 }, { candidate_digest: 'other' }, { run_id: 'unknown' }, { agent_id: 'unknown' }]) {
    assert.throws(() => collectWaitResult(f.state, { ...resumeResult(f, wake.run), ...patch }, f.context, f.host, f.results));
    assert.equal(digest(f.state), before);
  }
  assert.throws(() => collectWaitResult(f.state, resumeResult(f, wake.run), { ...f.context, revoked: true }, f.host, f.results), /late/);
});
test('host unavailability or absent atomic claiming falls back to explicit continue, never fake background execution', () => {
  const f = fixture({ supported: false }); start(f);
  assert.equal(f.state.wait_monitor.status, 'unavailable'); assert.equal(f.actions.filter(a => a.action === 'create').length, 0);
  assert.equal(wakeWait(f.state, f.context, f.host, 1000, { status: 'READY' }).action, 'NEEDS_CONTINUE');
  assert.equal(wakeWait(f.state, f.context, f.host, 2000, { status: 'READY' }, { explicit_continue: true }).action, 'COLLECT');
  const g = fixture(); start(g); delete g.host.claim;
  assert.equal(wakeWait(g.state, g.context, g.host, 1000, { status: 'READY' }).action, 'NEEDS_CONTINUE');
  assert.equal(g.actions.filter(a => a.action === 'spawn').length, 0);
});
test('unknown monitor-creation outcome is queried before any second creation', () => {
  const f = fixture(), create = f.host.create;
  f.host.create = input => { create(input); return undefined; }; start(f);
  assert.equal(f.state.wait_monitor.status, 'unknown');
  assert.equal(wakeWait(f.state, f.context, f.host, 1000, { status: 'READY' }).action, 'NEEDS_CONTINUE');
  registerWait(f.state, f.initial, f.context, f.host, 2000);
  assert.equal(f.state.wait_monitor.status, 'active'); assert.equal(f.state.wait_monitor.id, 'monitor-1');
  assert.equal(f.actions.filter(a => a.action === 'create').length, 1);
  const g = fixture(); let attempts = 0;
  g.host.create = () => { attempts++; throw new Error('response lost'); }; g.host.find = () => null;
  start(g); registerWait(g.state, g.initial, g.context, g.host, 1000);
  assert.equal(g.state.wait_monitor.status, 'unknown'); assert.equal(attempts, 1);
  assert.equal(wakeWait(g.state, g.context, g.host, 2000, { status: 'READY' }).action, 'NEEDS_CONTINUE');
});
test('stop waiting preserves unfinished work; explicit continue uses original time limit without restarting a monitor', () => {
  const f = fixture(); start(f); assert.equal(cancelWait(f.state, f.host), true);
  assert.equal(f.state.waits[0].status, 'waiting'); assert.equal(f.state.node_status, 'waiting_external');
  assert.equal(wakeWait(f.state, f.context, f.host, 1000, { status: 'READY' }).action, 'STOPPED');
  assert.equal(wakeWait(f.state, f.context, f.host, 2000, { status: 'READY' }, { explicit_continue: true }).action, 'COLLECT');
  assert.equal(f.state.waits[0].deadline, 7200000); assert.equal(f.actions.filter(a => a.action === 'create').length, 1);
});
test('close cleans actual monitor/child; failed cleanup remains closing and cannot claim completion', () => {
  const f = fixture(); start(f); wakeWait(f.state, f.context, f.host, 1000, { status: 'READY' });
  f.host.stop = () => false; f.host.stopWorker = () => false;
  assert.equal(cancelWait(f.state, f.host, 'close'), false); assert.equal(f.state.status, 'closing'); assert.equal(f.state.wait_monitor.status, 'stop_pending');
  assert.equal(f.state.active_runs.length, 1);
  f.host.stop = () => true; f.host.stopWorker = () => true;
  assert.equal(cancelWait(f.state, f.host, 'close'), true); assert.equal(f.state.status, 'closed'); assert.deepEqual(f.state.active_runs, []);
  assert.equal(wakeWait(f.state, f.context, f.host, 2000, { status: 'READY' }).action, 'STOP');
});
test('one work monitor covers two DAG nodes and stops only after both collecting children finish', () => {
  const seed = fixture(), a = seed.context, b = { ...a, step_id: 'team-env-check' }, f = fixture({ contexts: [a, b] });
  start(f); registerWait(f.state, { ...f.initial, ...b, run_id: 'initial-2', agent_id: 'initial-child-2', wait_request: { ...f.initial.wait_request, ...b } }, b, f.host, 1000);
  assert.equal(f.actions.filter(a => a.action === 'create').length, 1); assert.equal(f.state.waits.length, 2);
  const one = wakeWait(f.state, a, f.host, 2000, { status: 'READY' }), two = wakeWait(f.state, b, f.host, 2000, { status: 'READY' });
  assert.notEqual(one.run.agent_id, two.run.agent_id);
  collectWaitResult(f.state, resumeResult(f, one.run), a, f.host, f.results); assert.equal(f.state.wait_monitor.status, 'active');
  collectWaitResult(f.state, { ...resumeResult(f, two.run), ...b }, b, f.host, f.results); assert.equal(f.state.wait_monitor.status, 'stopped');
  assert.deepEqual(f.state.approvals, []);
});
test('a later authorized stage reuses the paused work monitor and a duplicate old wait cannot revive a finished node', () => {
  const seed = fixture(), a = seed.context, b = { ...a, step_id: 'release', input_digest: 'approved-verify-review' };
  const f = fixture({ contexts: [a, b] }); start(f);
  const wake = wakeWait(f.state, a, f.host, 1000, { status: 'READY' });
  collectWaitResult(f.state, resumeResult(f, wake.run), a, f.host, f.results);
  assert.equal(f.state.wait_monitor.status, 'stopped');
  const before = digest(f.state); registerWait(f.state, f.initial, a, f.host, 2000); assert.equal(digest(f.state), before);
  // The already-authorized release child has actually ended; this handler does not authorize its dispatch.
  registerWait(f.state, { ...f.initial, ...b, run_id: 'release-initial', agent_id: 'release-child', wait_request: { ...b } }, b, f.host, 3000);
  assert.equal(f.state.wait_monitor.id, 'monitor-1'); assert.equal(f.state.wait_monitor.status, 'active');
  assert.equal(f.actions.filter(a => a.action === 'create').length, 1);
  assert.ok(f.actions.some(a => a.action === 'update' && a.request.status === 'ACTIVE'));
  assert.equal(f.state.waits.find(w => w.context.step_id === 'release').deadline, 7203000); assert.deepEqual(f.state.approvals, []);
});
test('prior real checks reuse their original execution without rerunning and reject missing/truncated/drifted evidence', () => {
  const f = fixture(), body = 'Architecture checks: 3 passed\n';
  const previous = { ...f.context, status: 'PASS', run_id: 'initial-1', agent_id: 'initial-child-1', evidence_refs: [reference('gate.txt', body)], remote_fingerprint: 'pipeline10-job101-success' };
  const current = { ...f.context, remote_fingerprint: previous.remote_fingerprint };
  const reused = reusableCheck(previous, current, { 'gate.txt': body });
  assert.equal(reused.run_id, 'initial-1'); assert.equal(reused.agent_id, 'initial-child-1');
  assert.equal(f.actions.filter(a => a.action === 'spawn').length, 0);
  for (const patch of [{ candidate_digest: 'other' }, { input_digest: 'other' }, { baseline_digest: 'other' }, { remote_fingerprint: 'pipeline10-job150-failed' }])
    assert.throws(() => reusableCheck(previous, { ...current, ...patch }, { 'gate.txt': body }));
  for (const raw of [{}, { 'gate.txt': 'PASS' }, { 'gate.txt': body.slice(0, 8) }]) assert.throws(() => reusableCheck(previous, current, raw), /evidence/);
});
test('unended workers, widened binding scope and a changed wait policy cannot register background authority', () => {
  for (const mutate of [
    f => { f.initial.finished = false; }, f => { f.initial.agent_id = null; },
    f => { f.initial.wait_request.binding_ids = ['other-project']; }, f => { f.context.authorized = false; }, f => { f.context.authorization_ref = null; },
  ]) { const f = fixture(); mutate(f); assert.throws(() => start(f)); assert.equal(f.actions.length, 0); }
  const f = fixture(); start(f);
  assert.throws(() => registerWait(f.state, f.initial, f.context, f.host, 1000, { mode: 'native_wakeup', interval_seconds: 300, timeout_seconds: 14400 }), /policy drift/);
  const wake = wakeWait(f.state, f.context, f.host, 2000, { status: 'READY' });
  assert.throws(() => collectWaitResult(f.state, { ...resumeResult(f, wake.run, 'waiting_external'),
    wait_request: { ...f.initial.wait_request, binding_ids: ['other-project'] } }, f.context, f.host, []), /exceeds bindings/);
});
