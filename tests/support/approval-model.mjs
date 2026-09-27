// Maintainer-only synthetic contract model, never installed as a workflow runtime.
// Callers supply inspected records. This does not authenticate users or execute Gates.
import { digest, canAutoApprove, validateVerification } from './workflow-model.mjs';

const requireThat = (value, message) => { if (!value) throw new Error(message); };
const same = (a, b) => digest(a) === digest(b);
const ref = value => value && typeof value.path === 'string' && value.path
  && /^[a-f0-9]{64}$/.test(value.sha256);
const refs = values => Array.isArray(values) && values.length > 0 && values.every(ref);
const safePath = value => typeof value === 'string' && value && value !== '.'
  && !value.startsWith('/') && !value.includes('\\') && !/[?*]/.test(value)
  && !value.split('/').some(part => ['..', '.', '', '.aidlc'].includes(part));
const within = (value, roots) => safePath(value) && roots.some(root => safePath(root) && (value === root || value.startsWith(`${root}/`)));

export function delegationTerms(policy) {
  return Object.fromEntries(['mode', 'work_id', 'workflow_ref', 'method_revision', 'request_sha256',
    'allowed_steps', 'allowed_tool_bindings', 'allowed_write_paths', 'allowed_commands',
    'auto_continue', 'entry_review_ref', 'implementation_feedback', 'knowledge_publish',
    'additional_stop_conditions'].map(key => [key, policy[key] ?? null]));
}

function assertGrant(policy, context) {
  requireThat(policy?.schema_version === 3, 'new delegation requires schema 3');
  requireThat(!context.revoked && !policy.revoked && !policy.revoked_at && policy.status !== 'revoked', 'delegation revoked');
  requireThat(context.identity_current === true, 'identity unresolved or changed');
  requireThat(ref(context.policy_ref) && context.policy_ref.sha256 === digest(policy), 'policy bytes changed');
  for (const key of ['work_id', 'method_revision', 'request_sha256']) {
    requireThat(context[key] && policy[key] === context[key], `delegation mismatch: ${key}`);
  }
  requireThat(ref(context.workflow_ref) && same(policy.workflow_ref, context.workflow_ref), 'workflow changed');
  const authorization = policy.authorization;
  requireThat(authorization?.source === 'user' && authorization.by && authorization.at && authorization.user_statement, 'real initial authorization missing');
  requireThat(ref(authorization.card_ref) && authorization.card_ref.sha256 === digest(context.card)
    && context.card?.statement === authorization.user_statement && same(context.card.terms, delegationTerms(policy)), 'card does not authorize these terms');
}

function assertScope(paths, commands, policy) {
  requireThat(Array.isArray(paths) && paths.every(path => within(path, policy.allowed_write_paths ?? [])), 'write scope exceeded');
  requireThat(Array.isArray(commands) && commands.every(command => policy.allowed_commands?.some(allowed => same(allowed, command))), 'command or side effects changed');
}

function nodeFor(workflow, stages, step) {
  const node = workflow.nodes.find(item => item.step_id === step);
  const stage = stages.find(item => item.id === node?.stage_id);
  requireThat(node && stage, 'unknown node');
  return { node, stage };
}

function assertChecks(checks, policy, candidate, requiredIds = []) {
  requireThat(Array.isArray(checks) && checks.some(check => check.blocking), 'missing checks');
  requireThat(requiredIds.every(id => checks.some(check => check.blocking && check.check_id === id)), 'required DEV or Gate check missing');
  for (const check of checks.filter(item => item.blocking)) {
    requireThat(check.status === 'PASS' && check.exit_code === 0 && Number.isInteger(check.executed_count)
      && check.executed_count > 0 && check.skipped_count === 0 && refs(check.raw_evidence), 'unverified candidate');
    requireThat(candidate?.sha256 && check.candidate_sha256 === candidate.sha256, 'stale check candidate');
    assertScope([], [check.command], policy);
  }
}

export function decisionMode(workflow, stages, step, context) {
  const { stage } = nodeFor(workflow, stages, step);
  const policy = context.policy;
  if (!policy || policy.mode === 'manual') return 'manual';
  requireThat(['checkpoint_low_risk', 'auto_low_risk'].includes(policy.mode), 'unknown approval mode');
  if (policy.mode === 'checkpoint_low_risk' && stage.kind !== 'implementation') return 'manual';
  assertGrant(policy, context);
  requireThat(context.risk === 'low' && context.blockers?.length === 0, 'risk or blockers');
  assertScope(context.changed_paths, context.commands, policy);
  if (policy.mode === 'checkpoint_low_risk') {
    const baseline = context.core.workflows.find(item => item.id === workflow.id);
    requireThat(['core.fix', 'core.enhance'].includes(workflow.id) && same(baseline, workflow), 'not an unmodified builtin');
    requireThat(workflow.nodes.every(node => same(stages.find(item => item.id === node.stage_id), context.core.stages.find(item => item.id === node.stage_id)))
      && refs(context.core_assets) && same(context.core_assets, context.locked_assets), 'overridden builtin assets or stages');
    requireThat(step === 'implement' && same(policy.allowed_steps, ['implement']), 'checkpoint only delegates implementation');
    const approval = context.entry_approval;
    requireThat(ref(policy.entry_approval_ref) && policy.entry_approval_ref.sha256 === digest(approval)
      && approval?.decision === 'approved' && approval.approval_mode === 'manual'
      && approval.by && approval.user_statement && approval.work_id === context.work_id
      && approval.step_id === workflow.entry && same(approval.workflow_ref, context.workflow_ref)
      && approval.review_digest === policy.entry_review_ref?.sha256 && ref(policy.entry_review_ref), 'manual entry approval missing or stale');
  } else {
    requireThat(canAutoApprove(workflow, stage, { risk: context.risk, step_id: step, work_id: context.work_id,
      lock_digest: context.workflow_ref.sha256, policy: { ...policy, lock_digest: policy.workflow_ref.sha256,
        steps: policy.allowed_steps, authorization: { source: 'user', actor: policy.authorization.by, statement: policy.authorization.user_statement } } }), 'not eligible for auto approval');
  }
  assertChecks(context.checks, policy, context.candidate, stage.kind === 'implementation' ? ['dev-self-test', 'architecture', 'quality'] : []);
  requireThat(ref(context.candidate) && same(context.candidate, context.current_candidate), 'candidate drift');
  if (stage.kind === 'verification') {
    requireThat(context.verification_candidate?.digest === context.candidate.sha256, 'verification candidate missing');
    validateVerification(context.verification, context.verification_candidate, { approved_commands: policy.allowed_commands.map(item => item.command) });
  }
  return policy.mode;
}

export function feedbackLimit(policy) {
  return policy?.schema_version === 3 && policy.implementation_feedback?.max_correction_rounds === 2 ? 2 : 0;
}

export function checkpointContinuation(workflow, stages, context) {
  const mode = decisionMode(workflow, stages, 'implement', context);
  requireThat(mode === 'checkpoint_low_risk', 'not a checkpoint decision');
  // This is the future delegation explicitly confirmed on the entry card.
  // allowed_steps restricts delegated decisions, not the independent Verify dispatch.
  return context.policy.auto_continue === true ? ['verify'] : [];
}

export function reserveCorrection(workflow, stages, step, context, attempts, request) {
  const { stage } = nodeFor(workflow, stages, step);
  const policy = context.policy;
  assertGrant(policy, context);
  requireThat(['manual', 'checkpoint_low_risk', 'auto_low_risk'].includes(policy.mode), 'unknown approval mode');
  requireThat(workflow.intent === 'delivery' && workflow.id !== 'core.standard' && workflow.risk_ceiling === 'low'
    && stage.kind === 'implementation' && context.kind === 'stage' && context.risk === 'low', 'not an eligible implementation');
  requireThat(context.authority_valid === true && context.candidate_review_exists === false && context.blockers?.length === 0, 'authority or stage boundary');
  requireThat(context.worker_stopped === true && context.history_complete === true, 'worker or history unresolved');
  requireThat(feedbackLimit(policy) === 2 && policy.implementation_feedback.step_id === step
    && policy.implementation_feedback.revision === context.revision, 'no matching feedback budget');
  requireThat(refs(context.protected_refs) && same(context.protected_refs, context.current_protected_refs), 'protected Oracle or check changed');
  requireThat(attempts.every((attempt, index) => attempt.round === index + 1 && attempt.work_id === context.work_id && attempt.method_revision === context.method_revision
    && attempt.step_id === step && attempt.revision === context.revision && same(attempt.workflow_ref, context.workflow_ref))
    && same(attempts.map(digest), context.attempt_digests), 'feedback ledger missing, changed, or noncontiguous');
  requireThat(attempts.length < feedbackLimit(policy), 'feedback budget exhausted');
  requireThat(request?.failure_kind === 'introduced_regression' && request.status === 'FAIL'
    && ref(request.failure_result_ref) && refs(request.failure_refs) && refs(request.cause_evidence_refs), 'not a proven implementation regression');
  requireThat(!attempts.some(item => same(item.failure_result_ref, request.failure_result_ref)), 'failure already reserved');
  requireThat(ref(request.candidate) && same(request.candidate, context.current_candidate), 'candidate drift');
  requireThat(request.proposed_write_paths?.length > 0 && request.commands?.length > 0, 'empty repair scope');
  assertScope(request.proposed_write_paths, request.commands, policy);
  requireThat(request.proposed_write_paths.every(path => !context.protected_refs.some(item => within(item.path, [path]) || within(path, [item.path]))), 'repair would edit protected check');
  requireThat(request.commands.every(command => same(command.side_effects, ['local-check'])), 'external mutation retry forbidden');
  requireThat(context.next_run_id && !attempts.some(item => item.run_id === context.next_run_id), 'reservation run reused');
  requireThat(context.now, 'reservation time missing');
  return { schema_version: 1, work_id: context.work_id, workflow_ref: context.workflow_ref, method_revision: context.method_revision,
    step_id: step, revision: context.revision, round: attempts.length + 1, policy_ref: context.policy_ref,
    failure_result_ref: request.failure_result_ref, failure_refs: request.failure_refs, input_candidate: request.candidate,
    run_id: context.next_run_id, reserved_at: context.now };
}

export function assertFeedbackDispatch(context, attempts, packet) {
  assertGrant(context.policy, context);
  requireThat(context.history_complete && context.worker_stopped, 'worker or history unresolved');
  const budget = packet.implementation_feedback;
  requireThat(packet.work_id === context.work_id && packet.method_revision === context.method_revision
    && same(packet.workflow_ref, context.workflow_ref), 'dispatch identity changed');
  requireThat(feedbackLimit(context.policy) === 2 && budget?.max_correction_rounds === 2
    && same(budget.policy_ref, context.policy_ref), 'dispatch budget not granted');
  requireThat(context.policy.implementation_feedback.step_id === packet.step_id
    && context.policy.implementation_feedback.revision === packet.revision, 'dispatch revision changed');
  requireThat(attempts.length > 0 && attempts.length <= 2 && attempts.every((item, index) => item.round === index + 1
    && item.work_id === context.work_id && item.method_revision === context.method_revision && same(item.workflow_ref, context.workflow_ref)
    && item.step_id === packet.step_id && item.revision === packet.revision)
    && same(attempts.map(digest), context.attempt_digests)
    && refs(budget.attempt_refs) && same(budget.attempt_refs.map(item => item.sha256), context.attempt_digests), 'incomplete dispatch ledger');
  const reserved = attempts.at(-1);
  requireThat(budget.round === reserved.round && packet.run_id === reserved.run_id
    && packet.step_id === reserved.step_id && packet.revision === reserved.revision
    && same(packet.workflow_ref, reserved.workflow_ref) && same(reserved.policy_ref, context.policy_ref)
    && same(packet.candidate, reserved.input_candidate), 'dispatch differs from reservation');
  requireThat(context.run_already_started !== true, 'reservation already started');
  return true;
}
