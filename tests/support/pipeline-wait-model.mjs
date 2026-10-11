// Maintainer-only simulation of host callbacks; not an installed scheduler.
import { createHash } from 'node:crypto';
import { digest } from './workflow-model.mjs';
const need = (value, message) => { if (!value) throw new Error(message); };
const copy = value => structuredClone(value);
const identity = c => [c.work_id, c.step_id, c.revision, c.workflow_digest, c.candidate_digest, c.delivery_digest, c.input_digest, c.baseline_digest];
const equalContext = (a, b) => JSON.stringify(identity(a)) === JSON.stringify(identity(b));
const key = c => `${c.step_id}:${c.revision}`;

export function createWaitState(context, mode = 'manual') {
  const contexts = Array.isArray(context) ? context : [context];
  need(contexts.length > 0 && contexts.every(c => c.work_id === contexts[0].work_id && c.workflow_digest === contexts[0].workflow_digest), 'one frozen work required');
  return { context: copy(contexts[0]), contexts: Object.fromEntries(contexts.map(c => [c.step_id, copy(c)])), mode, status: 'working', node_status: 'working',
    nodes: Object.fromEntries(contexts.map(c => [c.step_id, 'working'])), waits: [], wait_monitor: null, active_runs: [], approvals: [], events: [], leases: [], max_workers: 2 };
}
function nodeStatus(state, context, status) {
  state.nodes[context.step_id] = status; state.node_status = status;
  const statuses = Object.values(state.nodes);
  state.status = statuses.includes('working') ? 'working' : statuses.includes('waiting_external') ? 'waiting_external'
    : statuses.some(s => ['failed', 'blocked'].includes(s)) ? 'blocked' : 'awaiting_approval';
}
const liveWaits = state => state.waits.some(w => ['waiting', 'ready'].includes(w.status) && !w.paused);
function stopMonitor(state, host) {
  if (!state.wait_monitor || state.wait_monitor.status === 'stopped' || state.wait_monitor.status === 'unavailable') return true;
  if (!state.wait_monitor.id) try { state.wait_monitor.id = host.find?.(state.wait_monitor.scope) ?? null; } catch { /* Unknown is not stopped. */ }
  let stopped = false; if (state.wait_monitor.id) try { stopped = host.stop?.(state.wait_monitor.id) === true; } catch { /* Preserve pending cleanup. */ }
  if (!stopped) {
    state.wait_monitor.status = 'stop_pending'; return false;
  }
  state.wait_monitor.status = 'stopped'; return true;
}
export function registerWait(state, result, context, host, now, policy = { mode: 'native_wakeup', interval_seconds: 300, timeout_seconds: 7200 }) {
  need(result.status === 'waiting_external' && result.wait_request && result.finished === true && result.run_id && result.agent_id, 'actual ended child wait result required');
  need(equalContext(context, state.contexts[context.step_id]) && equalContext(result.wait_request, context), 'wait context drift');
  need(context.authorized === true && context.authorization_ref?.sha256 && digest(context.authorization_ref) === digest(state.contexts[context.step_id].authorization_ref)
    && context.revoked !== true && !['closing', 'closed', 'completed'].includes(state.status), 'no valid wait authority');
  need(result.wait_request.binding_ids.length > 0 && result.wait_request.binding_ids.every(id => context.binding_ids.includes(id)), 'wait exceeds bindings');
  need(!state.active_runs.some(r => r.step_id === context.step_id), 'worker must end before waiting');
  need(['native_wakeup', 'manual_resume'].includes(policy.mode) && Number.isInteger(policy.interval_seconds) && policy.interval_seconds > 0
    && Number.isInteger(policy.timeout_seconds) && policy.timeout_seconds >= policy.interval_seconds, 'invalid finite wait policy');
  need(!state.wait_policy || digest(state.wait_policy) === digest(policy), 'frozen wait policy drift'); state.wait_policy = copy(policy);
  let wait = state.waits.find(w => w.key === key(context));
  if (wait && ['finished', 'blocked', 'expired', 'canceled'].includes(wait.status)
    && wait.request_refs.some(r => digest(r) === digest(result.wait_request))) return copy(wait);
  if (!wait) {
    wait = { key: key(context), context: copy(context), request_refs: [], started_at: now,
      deadline: now + policy.timeout_seconds * 1000, interval_ms: policy.interval_seconds * 1000, status: 'waiting', last_fingerprint: null };
    state.waits.push(wait);
  }
  if (!wait.request_refs.some(r => digest(r) === digest(result.wait_request))) wait.request_refs.push(copy(result.wait_request));
  nodeStatus(state, context, 'waiting_external');
  if (!state.wait_monitor) {
    state.wait_monitor = { id: null, status: 'registering', scope: context.work_id };
    state.events.push('monitor_creation_intent');
    if (policy.mode === 'native_wakeup' && host.supported) {
      try {
        const id = host.create({ work_id: context.work_id, interval_seconds: policy.interval_seconds, deadline: wait.deadline });
        state.wait_monitor.id = id ?? null; state.wait_monitor.status = id ? 'active' : 'unknown';
      } catch {
        state.wait_monitor.status = 'unknown'; state.wait_monitor.error_kind = 'registration_unconfirmed';
      }
    } else state.wait_monitor.status = 'unavailable';
  } else if (state.wait_monitor.status === 'unknown') {
    let found; try { found = host.find?.(context.work_id); } catch { found = null; }
    if (found) { state.wait_monitor.id = found; state.wait_monitor.status = 'active'; }
  } else if (state.wait_monitor.status === 'active') {
    try { host.update?.(state.wait_monitor.id, { deadline: Math.max(...state.waits.map(w => w.deadline)), work_id: context.work_id }); }
    catch { state.wait_monitor.status = 'unknown'; }
  } else if (state.wait_monitor.status === 'stopped' && policy.mode === 'native_wakeup' && host.supported) {
    try {
      state.wait_monitor.status = host.update?.(state.wait_monitor.id, { status: 'ACTIVE', work_id: context.work_id,
        interval_seconds: policy.interval_seconds, deadline: Math.max(...state.waits.filter(w => ['waiting', 'ready'].includes(w.status)).map(w => w.deadline)) }) === true ? 'active' : 'unavailable';
    } catch { state.wait_monitor.status = 'unknown'; }
  }
  return copy(wait);
}
export function wakeWait(state, current, host, now, inspection, { explicit_continue = false } = {}) {
  const wait = state.waits.find(w => w.key === key(current));
  need(wait, 'wait missing');
  if (['closing', 'closed', 'completed'].includes(state.status) || current.revoked === true || !current.authorized
    || digest(current.authorization_ref ?? null) !== digest(wait.context.authorization_ref) || !equalContext(wait.context, current)) {
    const first = wait.status !== 'canceled';
    wait.status = 'canceled'; if (!liveWaits(state)) stopMonitor(state, host);
    state.events.push('stop_without_inspect'); return { action: 'STOP', notify: first };
  }
  if (now >= wait.deadline) {
    const first = wait.status !== 'expired';
    wait.status = 'expired'; nodeStatus(state, current, 'blocked'); if (!liveWaits(state)) stopMonitor(state, host);
    return { action: 'EXPIRED', notify: first };
  }
  if (wait.paused && !explicit_continue) return { action: 'STOPPED', notify: false };
  if (state.active_runs.length >= state.max_workers || state.active_runs.some(r => r.step_id === current.step_id) || state.leases.includes(key(current))) return { action: 'BUSY', notify: false };
  if (state.wait_monitor?.status !== 'active' && !explicit_continue) return { action: 'NEEDS_CONTINUE', notify: false };
  need(['waiting', 'ready'].includes(wait.status), 'inactive wait cannot dispatch');
  if (explicit_continue) wait.paused = false;
  need(['WAITING', 'READY', 'FAIL', 'BLOCKED'].includes(inspection.status), 'unknown inspect status');
  state.events.push('inspect'); wait.last_checked_at = now;
  const fingerprint = digest(inspection), changed = fingerprint !== wait.last_fingerprint;
  wait.last_fingerprint = fingerprint;
  if (inspection.status === 'WAITING') {
    return { action: 'WAIT', notify: changed && ['manual', 'blocked'].includes(inspection.reason) };
  }
  if (inspection.status === 'BLOCKED') {
    wait.status = 'blocked'; nodeStatus(state, current, 'blocked'); if (!liveWaits(state)) stopMonitor(state, host);
    return { action: 'BLOCKED', notify: changed };
  }
  if (!host.claim?.(key(current)) && !(explicit_continue && !host.claim)) return { action: 'NEEDS_CONTINUE', notify: changed };
  state.leases.push(key(current));
  const run = host.spawn({ context: copy(current), continuation_refs: copy(wait.request_refs), kind: 'stage', fresh_context: true });
  need(run?.agent_id && run.run_id, 'real fresh child identity required');
  state.active_runs.push({ ...run, step_id: current.step_id }); wait.status = 'ready'; nodeStatus(state, current, 'working');
  return { action: 'COLLECT', notify: false, run: copy(run) };
}
export function collectWaitResult(state, result, current, host, pipelineResults) {
  need(equalContext(state.contexts[current.step_id], current) && equalContext(result, current) && current.authorized && !current.revoked
    && digest(current.authorization_ref ?? null) === digest(state.contexts[current.step_id].authorization_ref)
    && !['closing', 'closed', 'completed'].includes(state.status), 'late/drifted result');
  need(state.active_runs.some(run => run.run_id === result.run_id && run.agent_id === result.agent_id), 'unknown child result');
  const wait = state.waits.find(w => w.key === key(current));
  need(wait?.status === 'ready' && !wait.paused && result.finished === true, 'inactive/unfinished child result');
  if (result.status === 'ready_for_review') {
    need(current.binding_ids.every(id => pipelineResults.some(r => r.binding_id === id && r.status === 'PASS')), 'all required pipeline evidence must pass');
    need(host.validateReview?.(result, pipelineResults, current) === true, 'full parent evidence validation required');
    wait.status = 'finished'; nodeStatus(state, current, 'awaiting_approval');
    state.events.push('review_required');
  } else if (result.status === 'waiting_external') {
    need(result.wait_request && equalContext(result.wait_request, current), 'new real wait request required');
    need(result.wait_request.binding_ids.length > 0 && result.wait_request.binding_ids.every(id => current.binding_ids.includes(id)), 'new wait exceeds bindings');
    wait.request_refs.push(copy(result.wait_request)); wait.status = 'waiting'; nodeStatus(state, current, 'waiting_external');
  } else {
    need(['failed', 'blocked'].includes(result.status), 'invalid result status');
    wait.status = 'blocked'; nodeStatus(state, current, result.status); state.events.push('human_action_required');
  }
  state.active_runs = state.active_runs.filter(run => run.run_id !== result.run_id); state.leases = state.leases.filter(k => k !== key(current)); host.release?.(key(current));
  if (!liveWaits(state)) stopMonitor(state, host);
  return { node_status: state.node_status, approvals: state.approvals.length };
}
export function cancelWait(state, host, reason = 'stop_waiting') {
  state.events.push(reason);
  if (reason === 'close') state.status = 'closing';
  for (const wait of state.waits) if (['waiting', 'ready'].includes(wait.status)) {
    if (reason === 'stop_waiting') wait.paused = true; else wait.status = 'canceled';
  }
  if (reason !== 'stop_waiting') for (const run of [...state.active_runs]) {
    let stopped = false; try { stopped = host.stopWorker?.(run.agent_id) === true; } catch { /* Keep the real worker active. */ }
    if (stopped) {
      state.active_runs = state.active_runs.filter(r => r.run_id !== run.run_id);
      const context = state.contexts[run.step_id]; state.leases = state.leases.filter(k => k !== key(context)); host.release?.(key(context));
    }
  }
  const stopped = stopMonitor(state, host);
  if (reason === 'close') state.status = stopped && !state.active_runs.length ? 'closed' : 'closing';
  return stopped;
}
export function reusableCheck(previous, current, rawFiles) {
  need(equalContext(previous, current) && previous.status === 'PASS' && previous.run_id && previous.agent_id, 'check reuse context/status mismatch');
  need(previous.evidence_refs?.length > 0, 'check raw evidence required');
  for (const ref of previous.evidence_refs) {
    const bytes = rawFiles[ref.path];
    need(bytes && createHash('sha256').update(bytes).digest('hex') === ref.sha256, 'reused evidence missing/truncated/drifted');
  }
  if (previous.remote_fingerprint) need(previous.remote_fingerprint === current.remote_fingerprint, 'remote attempt/state changed');
  return copy(previous); // Preserve the original producer; never relabel this as a new execution.
}
