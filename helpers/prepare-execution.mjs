// Pure preparation, not a dispatcher. Sources must first pass full frozen-file/host checks.
import { resolveExecution, checkBudget, summarizeUsage } from './execution-policy.mjs';
import { selectReviewCards } from './review-cards.mjs';

function roleFor(assignment) {
  if (assignment.gate_assignment && (assignment.kind !== 'leaf' || assignment.stage?.kind !== 'verification')) {
    throw new Error('Gate duties require a verification leaf');
  }
  if (['parent', 'hook'].includes(assignment.kind) && assignment.stage) throw new Error('conflicting stage duties');
  if (assignment.kind === 'parent') return 'coordinator';
  if (assignment.kind === 'hook' && assignment.task_type === 'knowledge-publish') return 'fixed-content-helper';
  const stage = assignment.stage;
  if (!stage?.kind || !stage.role) throw new Error('locked stage assignment required');
  if (assignment.gate_assignment) {
    if (assignment.kind !== 'leaf' || stage.kind !== 'verification'
      || !['architecture', 'quality'].includes(assignment.gate_assignment.kind)) throw new Error('invalid Gate assignment');
    return assignment.gate_assignment.kind + '-gate-reviewer';
  }
  if (stage.kind === 'verification') return 'collector';
  if (assignment.kind === 'collector') throw new Error('collector requires verification');
  // Only the built-in namespace has this stable role identity. Team refs remain exact keys.
  return /^core:agents\/[a-z-]+\.md$/.test(stage.role) ? stage.role.slice(12, -3) : stage.role;
}

export function prepareExecution({ policy, assignment, request, host, catalog, assessment, assets, receipts = [], pending = [] }) {
  const result = { status: 'blocked', assignment: null, decision: null, budget: null, review_cards: [], blockers: [] };
  try {
    if (!['parent', 'stage', 'leaf', 'collector', 'hook'].includes(assignment?.kind)) throw new Error('unknown assignment');
    if (!pending.some(p => p.run_id === assignment.run_id && p.attempt === assignment.attempt
      && p.kind === assignment.kind)) throw new Error('proposed attempt reservation required');
    const role = roleFor(assignment);
    result.assignment = { kind: assignment.kind, run_id: assignment.run_id, attempt: assignment.attempt, role };
    if (request?.role !== role) throw new Error('role differs from locked assignment');
    if (assessment?.status !== 'assessed' || !Array.isArray(assessment.risk_tags)
      || JSON.stringify([...assessment.risk_tags].sort()) !== JSON.stringify([...(request.risk_tags ?? [])].sort())) {
      throw new Error('one complete risk assessment is required for routing and review');
    }
    result.decision = resolveExecution(policy, request, host);
    if (result.decision.status === 'blocked') throw new Error(result.decision.blockers.join('; '));
    const selection = selectReviewCards(catalog, { ...assessment, reviewer: assignment.gate_assignment?.kind ?? null }, assets);
    if (selection.status !== 'selected') throw new Error('risk card assessment incomplete: ' + selection.unknown_tags.join(', '));
    result.budget = checkBudget(policy, receipts, pending);
    if (!result.budget.allowed) throw new Error('execution budget blocked');
    // The same assessment may be recorded everywhere; card bodies belong only to Gate leaves.
    result.review_cards = assignment.gate_assignment ? selection.cards : [];
    result.status = 'prepared';
  } catch (error) { result.blockers.push(error.message); }
  return result;
}

export function reconcileExecution(plan, receipt, expected) {
  const result = { valid: false, model_verified: false, blockers: [] };
  try {
    if (plan?.status !== 'prepared') throw new Error('execution was not prepared');
    if (!plan.assignment || receipt?.kind !== plan.assignment.kind || receipt.run_id !== plan.assignment.run_id
      || receipt.attempt !== plan.assignment.attempt) throw new Error('receipt differs from prepared assignment');
    if (expected?.kind != null && expected.kind !== receipt.kind) throw new Error('actual execution kind mismatch');
    for (const key of ['work_id', 'run_id', 'attempt', 'executor_id']) {
      if (expected?.[key] == null || receipt?.[key] !== expected[key]) throw new Error('actual execution identity mismatch: ' + key);
    }
    summarizeUsage([receipt]); // Validates actual delta shape, never authenticates its source.
    if (plan.decision.status === 'selected') {
      if (receipt.actual_model !== plan.decision.requested_model) throw new Error('actual model missing or differs from selected model');
      if (plan.decision.requested_reasoning !== null && receipt.actual_reasoning !== plan.decision.requested_reasoning) {
        throw new Error('actual reasoning missing or differs from selected setting');
      }
      result.model_verified = true;
    } else if (plan.decision.status !== 'inherited') throw new Error('invalid execution decision');
    result.valid = true;
  } catch (error) { result.blockers.push(error.message); }
  return result;
}

export function verificationPlan(preflight, ids) {
  // These are reserved logical run IDs, not native Agent IDs or proof of execution.
  if (preflight?.status !== 'valid' || !['direct', 'fallback'].includes(preflight.verify?.mode)
    || typeof preflight.verify.eligible !== 'boolean') return { mode: 'blocked', tasks: [] };
  if (preflight.verify.mode === 'direct' && (preflight.verify.eligible !== true || preflight.verify.host_attested !== true)
    || preflight.verify.mode === 'fallback' && preflight.verify.eligible !== false) return { mode: 'blocked', tasks: [] };
  const direct = preflight.verify?.eligible === true && preflight.verify?.mode === 'direct'
    && preflight.verify.host_attested === true;
  const required = ['architecture', 'quality', 'collector', ...(!direct ? ['initial_collector'] : [])];
  if (required.some(key => typeof ids?.[key] !== 'string' || !ids[key])
    || new Set(required.map(key => ids[key])).size !== required.length) throw new Error('distinct reserved run IDs required');
  const tasks = direct ? [] : [{ run_id: ids.initial_collector, role: 'collector', after: [] }];
  for (const kind of ['architecture', 'quality']) tasks.push({ run_id: ids[kind], role: kind + '-gate-reviewer',
    collector_run_id: direct ? ids.collector : ids.initial_collector, after: direct ? [] : [ids.initial_collector] });
  tasks.push({ run_id: ids.collector, role: 'collector', after: [ids.architecture, ids.quality] });
  return { mode: direct ? 'direct' : 'fallback', tasks, grants_approval: false };
}
