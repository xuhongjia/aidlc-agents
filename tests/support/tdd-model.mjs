// Maintainer-only normalized evidence model; not an installed runner or approval service.
import { createHash } from 'node:crypto';
import { validateVerification, assertApproval, digest } from './workflow-model.mjs';
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
const same = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length
  && new Set(a).size === a.length && a.every(value => b.includes(value));

export function validateTddEvidence(ledger, candidate, { tasks, raw_files, approved_commands } = {}) {
  requireThat(ledger?.contract_version === '2.1' && candidate?.digest, 'unknown TDD contract or missing candidate');
  requireThat(ledger.final_candidate_digest === candidate.digest && ledger.work_id === candidate.work_id
    && ledger.lock_digest === candidate.lock_digest, 'TDD candidate/work drift');
  requireThat(candidate.implementation_runs?.some(run => run.run_id === ledger.run_id && run.actor === ledger.actor), 'TDD executor is not an implementation contributor');
  requireThat(Array.isArray(tasks) && tasks.length && new Set(tasks.map(t => t.id)).size === tasks.length, 'approved tasks required');
  const byId = new Map(tasks.map(task => [task.id, task]));
  requireThat(Array.isArray(ledger.slices) && Array.isArray(ledger.exceptions), 'TDD task accounting missing');
  const covered = new Set(), requiredTests = new Set();
  const read = ref => {
    const body = raw_files?.[ref?.path];
    requireThat(body && createHash('sha256').update(body).digest('hex') === ref.sha256, 'raw TDD evidence missing/truncated/drifted');
    return JSON.parse(Buffer.from(body).toString());
  };
  const execution = (ref, phase, task = null, tests = null) => {
    const raw = read(ref);
    requireThat(raw.phase === phase && approved_commands?.includes(raw.command), 'wrong phase or unapproved TDD command');
    requireThat(raw.work_id === ledger.work_id && raw.lock_digest === ledger.lock_digest && raw.run_id === ledger.run_id
      && raw.actor === ledger.actor, 'TDD execution lineage mismatch');
    requireThat(raw.complete === true && raw.truncated === false && raw.environment && Number.isFinite(Date.parse(raw.executed_at)), 'TDD output incomplete or environment/time missing');
    requireThat(Number.isInteger(raw.executed_count) && raw.executed_count > 0 && raw.skipped_count === 0
      && Number.isInteger(raw.sequence) && raw.sequence > 0 && raw.snapshot_digest, 'TDD execution is empty/skipped/unidentified');
    if (task) requireThat(raw.oracle_digest === task.oracle_ref.sha256, 'approved Oracle changed');
    if (phase === 'RED') {
      requireThat(raw.status === 'FAIL' && raw.exit_code !== 0 && Number.isInteger(raw.exit_code)
        && raw.failure_kind === 'behavior_assertion', 'RED must be a real behavior failure, not environment/runner failure');
      requireThat(raw.failed_test_ids?.length && raw.failed_test_ids.every(id => tests.includes(id)), 'RED is unrelated to approved tests');
      requireThat(raw.failed_test_ids.every(id => raw.assertions?.some(a => a.test_id === id
        && Object.hasOwn(task.expected_values, id) && a.expected === task.expected_values[id] && a.actual !== a.expected)), 'RED assertion differs from approved Oracle');
    } else {
      requireThat(raw.status === 'PASS' && raw.exit_code === 0, 'TDD required validation did not pass');
      if (tests) requireThat(tests.every(id => raw.passed_test_ids?.includes(id) && raw.assertions?.some(a => a.test_id === id
        && Object.hasOwn(task.expected_values, id) && a.expected === task.expected_values[id] && a.actual === a.expected)), 'GREEN/refactor did not verify approved behavior');
    }
    return raw;
  };
  let lastSequence = 0;
  for (const slice of ledger.slices) {
    const task = byId.get(slice.task_id);
    requireThat(task && task.behavior_change === true, 'unknown or nonbehavior slice task');
    requireThat(same(slice.requirements, task.requirements) && same(slice.ac_ids, task.ac_ids)
      && slice.oracle_ref?.path === task.oracle_ref.path && slice.oracle_ref.sha256 === task.oracle_ref.sha256, 'slice task/AC/Oracle mapping changed');
    requireThat(slice.test_ids?.length && new Set(slice.test_ids).size === slice.test_ids.length
      && slice.test_ids.every(id => task.test_ids.includes(id)), 'slice tests missing/unrelated');
    const red = execution(slice.red, 'RED', task, slice.test_ids), green = execution(slice.green, 'GREEN', task, slice.test_ids);
    requireThat(['changed', 'no_change'].includes(slice.refactor?.action)
      && (slice.refactor.action !== 'no_change' || slice.refactor.reason?.trim()), 'refactor decision missing');
    const refactor = execution(slice.refactor.evidence_ref, 'REFACTOR', task, slice.test_ids);
    requireThat(lastSequence < red.sequence && red.sequence < green.sequence && green.sequence < refactor.sequence, 'TDD phase order invalid');
    lastSequence = refactor.sequence; covered.add(task.id);
    slice.test_ids.forEach(id => requiredTests.add(id));
  }
  for (const exception of ledger.exceptions) {
    const task = byId.get(exception.task_id);
    requireThat(task?.behavior_change === false && ['documentation', 'static_configuration'].includes(task.type)
      && !covered.has(task.id) && exception.reason?.trim() && exception.validation_refs?.length, 'unjustified TDD exception');
    exception.validation_refs.forEach(ref => execution(ref, 'ALTERNATIVE'));
    covered.add(task.id);
  }
  requireThat(tasks.every(task => covered.has(task.id)), 'task omitted from TDD or exceptions');
  for (const task of tasks.filter(t => t.behavior_change)) requireThat(task.test_ids.every(id => ledger.slices
    .filter(s => s.task_id === task.id).some(s => s.test_ids.includes(id))), 'approved task test missing');
  const final = execution(ledger.final_regression, 'FINAL');
  requireThat(final.snapshot_digest === candidate.digest && final.sequence > lastSequence
    && [...requiredTests].every(id => final.passed_test_ids?.includes(id)), 'final candidate/regression not verified');
  for (const task of tasks.filter(t => t.behavior_change)) requireThat(task.test_ids.every(id => final.assertions?.some(a => a.test_id === id
    && a.oracle_digest === task.oracle_ref.sha256 && a.expected === task.expected_values[id] && a.actual === a.expected)), 'final regression weakened approved Oracle');
  return true;
}

export function validateHandoff({ ledger, candidate, verification, approval }, {
  tdd_options, gate_options, approved_acs, approval_context, current_candidate_digest, workflow_id,
} = {}) {
  requireThat(current_candidate_digest === candidate.digest, 'unverified candidate change');
  validateTddEvidence(ledger, candidate, tdd_options);
  validateVerification(verification, candidate, { ...gate_options, reviewer_policy: 'independent-specialists' });
  const rows = verification.ac_results;
  requireThat(approved_acs?.length && approved_acs.every(a => typeof a.id === 'string' && a.id && ['automated', 'manual'].includes(a.mode))
    && rows?.length && same(rows.map(r => r.id), approved_acs.map(a => a.id)), 'AC verification coverage incomplete');
  const quality = verification.gates.find(g => g.kind === 'quality');
  for (const row of rows) {
    const approved = approved_acs.find(ac => ac.id === row.id);
    requireThat(row.status === 'PASS' && row.mode === approved.mode && row.evidence?.length, 'AC missing required passed evidence');
    for (const ref of row.evidence) {
      const body = gate_options.raw_files?.[ref.path];
      requireThat(body && createHash('sha256').update(body).digest('hex') === ref.sha256, 'AC raw evidence missing/truncated/drifted');
      if (approved.mode === 'manual') {
        const observation = JSON.parse(Buffer.from(body).toString());
        requireThat(observation.source === 'human' && observation.actor && observation.ac_id === row.id, 'manual AC requires human observation');
      }
    }
    if (approved.mode === 'automated') requireThat(approved.quality_rule_ids?.length && approved.quality_rule_ids.every(id => quality.checks.some(check => check.blocking
      && check.status === 'PASS' && check.ac_ids?.includes(row.id) && check.rule_evidence.some(r => r.rule_id === id)
      && row.evidence.some(ref => check.raw_evidence.some(r => r.path === ref.path && r.sha256 === ref.sha256)))), 'AC has no related Quality rule proof');
  }
  assertApproval(approval, { ...approval_context, artifact_digest: digest(verification) });
  if (workflow_id === 'core.standard') requireThat(approval.source === 'user', 'Standard requires human approval');
  else if (approval.source !== 'user') requireThat(approval.source === 'delegation' && approval.policy_ref
    && approval.policy_ref === approval_context.validated_delegation_ref, 'delegated approval not validated');
  return true;
}
