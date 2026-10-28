// Maintainer-only synthetic contract model. Not installed, an Agent runtime,
// an authentication service, or evidence of live Jira/GitLab/browser integration.
import { createHash } from 'node:crypto';

const need = (condition, message) => { if (!condition) throw new Error(message); };
const text = value => typeof value === 'string' && value.trim().length > 0;
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
export const digest = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const bytesDigest = value => createHash('sha256').update(value).digest('hex');
const same = (a, b) => digest(a) === digest(b);
const unique = values => Array.isArray(values) && values.length > 0 && values.every(text) && new Set(values).size === values.length;
const sameSet = (a, b) => unique(a) && unique(b) && a.length === b.length && a.every(item => b.includes(item));
const isRef = ref => ref && text(ref.uri) && /^[a-f0-9]{64}$/.test(ref.sha256 ?? '');
const isWorkflowRef = ref => ref && text(ref.path) && /^[a-f0-9]{64}$/.test(ref.sha256 ?? '');
const time = value => text(value) && Number.isFinite(Date.parse(value));
const inInterval = (value, start, end) => time(value) && Date.parse(value) >= Date.parse(start) && Date.parse(value) <= Date.parse(end);

export function readSnapshot(ref, files) {
  need(isRef(ref), 'invalid snapshot ref');
  const raw = files?.[ref.uri];
  need((typeof raw === 'string' || Buffer.isBuffer(raw)) && bytesDigest(raw) === ref.sha256, 'missing/truncated/drifted snapshot');
  return JSON.parse(Buffer.from(raw).toString());
}

// A saved approval/lease is an identity baseline, not current revocation state.
// Each side effect requires an action-specific live read of the controller's
// authoritative ledger. The fixtures model host observations, not a new service.
export function validateLiveControlStatus(action, { observation, raw_files, now } = {}) {
  need(text(action?.invocation_id) && text(action.work_id) && text(action.project_id) && text(action.story_id)
    && text(action.controller_id) && text(action.control_locator) && text(action.executor_actor_id)
    && text(action.operation) && Number.isInteger(action.source_revision) && action.source_revision > 0
    && isRef(action.dispatch_ref) && isRef(action.method_ref) && isWorkflowRef(action.workflow_ref)
    && isRef(action.authorization_ref) && time(action.started_at) && time(now), 'missing live control action identity');
  need(observation?.contract_version === 1 && observation.invocation_id === action.invocation_id
    && observation.control_locator === action.control_locator && inInterval(observation.observed_at, action.started_at, now)
    && Date.parse(now) - Date.parse(action.started_at) <= 60000, 'stale/unreadable control observation');
  const status = readSnapshot(observation.response_ref, raw_files);
  need(status.source === 'live_control_read' && status.invocation_id === action.invocation_id
    && status.control_locator === action.control_locator && status.observed_at === observation.observed_at
    && status.work_id === action.work_id && status.project_id === action.project_id && status.story_id === action.story_id
    && status.controller_id === action.controller_id && status.executor_actor_id === action.executor_actor_id
    && status.source_revision === action.source_revision && same(status.dispatch_ref, action.dispatch_ref)
    && same(status.method_ref, action.method_ref) && same(status.workflow_ref, action.workflow_ref)
    && same(status.candidate, action.candidate) && same(status.authorization_ref, action.authorization_ref), 'foreign/stale control ledger');
  need(status.controller_state === 'active' && status.dispatch_state === 'active' && status.grant_state === 'active'
    && status.revoked_at === null && status.closed_at === null && status.allowed_operations?.includes(action.operation)
    && time(status.lease_expires_at) && Date.parse(now) < Date.parse(status.lease_expires_at), 'live authority revoked/closed/reassigned');
  return true;
}

// decision_files represents independently retrieved decisions, not an Agent's
// assertion that Jira's assignee or current status constitutes an approval.
export function validateRoleApproval(approval, context) {
  const { role, actor_id, project_id, story_id, artifact_ref, method_ref, decision_files, now } = context;
  need(approval?.contract_version === 1 && text(approval.approval_id), 'approval identity');
  need(text(actor_id) && approval.actor_id === actor_id && approval.role === role, 'configured role identity mismatch');
  need(approval.project_id === project_id && approval.story_id === story_id
    && same(approval.artifact_ref, artifact_ref) && same(approval.method_ref, method_ref), 'approval subject drift');
  need(approval.decision === 'approved' && approval.revoked_at === null && time(approval.decided_at)
    && time(now) && Date.parse(approval.decided_at) <= Date.parse(now), 'missing/revoked/future approval');
  const decision = readSnapshot(approval.decision_ref, decision_files);
  need(decision.source === 'user' && text(decision.statement) && decision.actor_id === actor_id
    && decision.role === role && decision.decision === 'approved' && decision.at === approval.decided_at
    && decision.project_id === project_id && decision.story_id === story_id
    && same(decision.artifact_ref, artifact_ref) && same(decision.method_ref, method_ref), 'not a matching actual decision');
  return true;
}

// Core templates/spec/acceptance.json is schema 1. Extra explanatory metadata
// cannot stand in for its semantic fields. This validates shape/mapping only;
// approval authenticity and complete extraction from source material are separate.
export function validateAcceptanceContract(acceptance) {
  const sourceRef = value => text(value) || isRef(value) || isWorkflowRef(value);
  const present = (object, key, label) => need(object && Object.hasOwn(object, key), `missing canonical ${label}.${key}`);
  need(acceptance?.schema_version === 1, 'unsupported acceptance schema_version');
  need(unique(acceptance.criteria?.map(c => c.id)), 'empty/duplicate acceptance criteria');
  need(unique(acceptance.requirements?.map(r => r.id)), 'empty/duplicate acceptance requirements');
  const acIds = acceptance.criteria.map(c => c.id), reqIds = acceptance.requirements.map(r => r.id);
  for (const criterion of acceptance.criteria) {
    for (const field of ['id', 'statement', 'verification', 'source_refs']) present(criterion, field, 'criteria');
    need(text(criterion.statement), 'empty canonical criteria.statement');
    need(['automated', 'manual'].includes(criterion.verification), 'invalid criteria.verification');
    need(Array.isArray(criterion.source_refs) && criterion.source_refs.length > 0 && criterion.source_refs.every(sourceRef)
      && new Set(criterion.source_refs.map(digest)).size === criterion.source_refs.length, 'invalid criteria.source_refs');
  }
  for (const requirement of acceptance.requirements) {
    for (const field of ['id', 'source_ref', 'ac_ids', 'exclusion']) present(requirement, field, 'requirements');
    need(sourceRef(requirement.source_ref), 'invalid requirements.source_ref');
    need(Array.isArray(requirement.ac_ids), 'invalid requirements.ac_ids');
    if (requirement.exclusion === null) {
      need(unique(requirement.ac_ids) && requirement.ac_ids.every(id => acIds.includes(id)), 'unmapped requirements.ac_ids');
    } else {
      need(requirement.exclusion && typeof requirement.exclusion === 'object' && !Array.isArray(requirement.exclusion)
        && text(requirement.exclusion.reason) && sourceRef(requirement.exclusion.approval_ref ?? requirement.exclusion.approved_ref)
        && requirement.ac_ids.length === 0, 'invalid/unjustified requirements.exclusion');
    }
  }
  for (const criterion of acceptance.criteria) {
    const mapped = acceptance.requirements.filter(r => r.ac_ids.includes(criterion.id));
    need(mapped.length > 0, 'AC is not mapped from a source requirement');
    const namedRequirements = criterion.source_refs.filter(ref => typeof ref === 'string' && reqIds.includes(ref));
    if (namedRequirements.length) need(namedRequirements.every(id => mapped.some(r => r.id === id))
      && mapped.every(r => namedRequirements.includes(r.id)), 'inconsistent AC source requirement mapping');
  }
  return true;
}

export function validateRequirements(spec, { source_requirements, raw_files } = {}) {
  validateAcceptanceContract(spec);
  need(text(spec?.project_id) && text(spec.story_id) && Number.isInteger(spec.revision) && spec.revision > 0, 'spec identity');
  need(Array.isArray(spec.unresolved) && spec.unresolved.length === 0, 'unresolved requirement');
  need(source_requirements?.length && sameSet(source_requirements.map(r => r.id), spec.requirements?.map(r => r.id)), 'source requirement omitted/duplicated');
  need(unique(spec.criteria?.map(c => c.id)), 'empty/duplicate AC');
  const acIds = spec.criteria.map(c => c.id), reqIds = spec.requirements.map(r => r.id);
  for (const criterion of spec.criteria) {
    need(text(criterion.statement) && ['automated', 'manual'].includes(criterion.verification)
      && unique(criterion.source_refs) && criterion.source_refs.every(id => reqIds.includes(id)), 'untraceable AC');
  }
  for (const requirement of spec.requirements) {
    const source = source_requirements.find(r => r.id === requirement.id);
    need(same(requirement.source_ref, source.source_ref), 'changed source identity');
    readSnapshot(source.source_ref, raw_files);
    if (requirement.exclusion) {
      const decision = readSnapshot(requirement.exclusion.approval_ref, raw_files);
      need(text(requirement.exclusion.reason) && decision.source === 'user' && decision.role === 'po'
        && decision.actor_id === source.po_actor_id && decision.decision === 'exclude'
        && decision.project_id === spec.project_id && decision.story_id === spec.story_id
        && decision.requirement_id === requirement.id && same(decision.source_ref, source.source_ref)
        && time(decision.at) && decision.revoked_at === null, 'unapproved exclusion');
      need(Array.isArray(requirement.ac_ids) && requirement.ac_ids.length === 0, 'excluded requirement has contradictory AC');
      need(spec.criteria.every(c => !c.source_refs.includes(requirement.id)), 'excluded requirement still asserted by AC');
    } else {
      need(unique(requirement.ac_ids) && requirement.ac_ids.every(id => acIds.includes(id)
        && spec.criteria.find(c => c.id === id).source_refs.includes(requirement.id)), 'unmapped requirement');
    }
  }
  return true;
}

export const caseDigest = testcase => digest(testcase);
const caseSemantics = testcase => ({ ac_ids: testcase.ac_ids, required: testcase.required,
  execution_mode: testcase.execution_mode, preconditions: testcase.preconditions, data: testcase.data, steps: testcase.steps });
export function validateTestDesign(design, { spec, spec_ref, design_ref, raw_files, approval, approval_context } = {}) {
  need(design?.contract_version === 1 && design.project_id === spec.project_id && design.story_id === spec.story_id
    && text(design.design_task_id) && Number.isInteger(design.revision) && design.revision > 0
    && design.owner_role === 'qa', 'test design identity');
  need(same(design.source_spec_ref, spec_ref) && same(readSnapshot(spec_ref, raw_files), spec)
    && same(readSnapshot(design_ref, raw_files), design), 'test design/source baseline drift');
  need(Array.isArray(design.unresolved) && !design.unresolved.length && unique(design.cases?.map(c => c.id)), 'unresolved/empty/duplicate cases');
  const acIds = spec.criteria.map(c => c.id);
  for (const testcase of design.cases) {
    need(Number.isInteger(testcase.revision) && testcase.revision > 0 && text(testcase.title)
      && typeof testcase.required === 'boolean' && unique(testcase.ac_ids) && testcase.ac_ids.every(id => acIds.includes(id)), 'case identity/AC mapping');
    need(['browser', 'manual', 'automated'].includes(testcase.execution_mode) && Array.isArray(testcase.preconditions)
      && text(testcase.data?.prepare) && text(testcase.data?.cleanup) && isRef(testcase.data.dataset_ref), 'case mode/data preparation');
    readSnapshot(testcase.data.dataset_ref, raw_files);
    need(unique(testcase.steps?.map(s => s.id)) && testcase.steps.every(s => text(s.action) && text(s.expected) && isRef(s.oracle_ref)), 'case steps/Oracle');
    testcase.steps.forEach(step => readSnapshot(step.oracle_ref, raw_files));
    need(!Object.hasOwn(testcase, 'automation_refs') && Array.isArray(testcase.limitations), 'script mappings must stay outside approved case bytes');
  }
  need(acIds.every(id => design.cases.some(c => c.required && c.ac_ids.includes(id))), 'AC lacks required test case');
  validateRoleApproval(approval, { ...approval_context, role: 'qa', project_id: spec.project_id,
    story_id: spec.story_id, artifact_ref: design_ref });
  return true;
}

export function classifyCaseChange(previous, current, { approved_spec_unchanged = false, semantic_review_ref = null } = {}) {
  need(previous.id === current.id, 'case identity cannot be reassigned');
  if (same(previous, current)) return { kind: 'unchanged', scripts: 'current', results: 'current', requires_po: false };
  need(Number.isInteger(current.revision) && current.revision > previous.revision, 'case revision must advance');
  const behavior = !same(previous.ac_ids, current.ac_ids) || !same(previous.steps.map(s => ({ id: s.id, expected: s.expected, oracle_ref: s.oracle_ref })),
    current.steps.map(s => ({ id: s.id, expected: s.expected, oracle_ref: s.oracle_ref })));
  if (!same(caseSemantics(previous), caseSemantics(current))) return { kind: 'semantic', scripts: 'pending_sync', results: 'stale', requires_po: behavior || !approved_spec_unchanged };
  // Text-only edits still require recorded review before evidence can be mapped
  // forward. A new revision is never covered simply by copying a green status.
  return { kind: 'editorial', scripts: 'review_mapping', results: isRef(semantic_review_ref) ? 'review_reuse' : 'stale', requires_po: false };
}

export function validateScriptMapping(mapping, { design, design_ref, candidate } = {}) {
  need(mapping?.contract_version === 1 && mapping.project_id === design.project_id && mapping.story_id === design.story_id
    && same(mapping.source_design_ref, design_ref) && same(mapping.candidate, candidate), 'script mapping source/candidate drift');
  need(mapping.status === 'current' && sameSet(mapping.links?.map(row => row.case_id), design.cases.map(c => c.id)), 'incomplete script mapping');
  for (const testcase of design.cases) {
    const row = mapping.links.find(link => link.case_id === testcase.id);
    need(row.case_revision === testcase.revision && row.case_digest === caseDigest(testcase), 'script stale against case revision');
    if (testcase.execution_mode === 'manual') {
      need(row.status === 'manual_only' && text(row.reason) && Array.isArray(row.test_refs) && !row.test_refs.length, 'manual case cannot claim generated automation');
    } else if (testcase.execution_mode === 'browser' && row.status === 'browser_protocol') {
      need(same(row.protocol_ref, design_ref) && Array.isArray(row.test_refs) && !row.test_refs.length, 'browser protocol must use approved case baseline');
    } else {
      need(row.status === 'implemented' && row.test_refs?.length && row.test_refs.every(ref => text(ref.repository_id)
        && text(ref.path) && !ref.path.startsWith('/') && !ref.path.split('/').includes('..')
        && text(ref.test_id) && ref.commit === candidate.commit), 'script location/candidate missing');
    }
  }
  return true; // Mapping is not execution evidence or a Gate PASS.
}

export function validateTestRun(run, context) {
  const { design, design_ref, candidate, environment, raw_files, method_ref, workflow_ref, dispatch_ref, source_revision, now } = context;
  need(run?.contract_version === 1 && text(run.run_id) && run.project_id === design.project_id && run.story_id === design.story_id, 'run identity');
  need(unique(design.cases?.map(c => c.id)) && design.cases.some(c => c.required)
    && design.cases.every(c => ['browser', 'manual', 'automated'].includes(c.execution_mode)), 'empty/invalid required case baseline');
  need(same(run.test_design_ref, design_ref) && same(readSnapshot(design_ref, raw_files), design)
    && same(run.candidate, candidate) && same(run.method_ref, method_ref) && same(run.workflow_ref, workflow_ref)
    && same(run.dispatch_ref, dispatch_ref) && run.source_revision === source_revision, 'run candidate/design/dispatch drift');
  need(text(candidate.commit) && text(candidate.digest) && text(candidate.artifact), 'unidentified candidate');
  need(time(run.started_at) && time(run.finished_at) && time(now) && Date.parse(run.started_at) <= Date.parse(run.finished_at)
    && Date.parse(run.finished_at) <= Date.parse(now), 'run timestamp order');
  need(run.environment?.id === environment.id && run.environment.url === environment.url
    && run.environment.observed_artifact === candidate.artifact, 'wrong environment/artifact');
  const identity = readSnapshot(run.environment.identity_evidence_ref, raw_files);
  need(identity.environment_id === environment.id && identity.url === environment.url && identity.artifact === candidate.artifact
    && identity.candidate_digest === candidate.digest && inInterval(identity.observed_at, run.started_at, run.finished_at), 'runtime identity unproven');
  need(text(run.executor?.actor_id) && text(run.executor.agent_run_id) && Array.isArray(run.results)
    && new Set(run.results.map(r => r.case_id)).size === run.results.length, 'executor/duplicate results');
  need(run.results.every(row => design.cases.some(c => c.id === row.case_id)), 'unknown test case result');
  for (const testcase of design.cases.filter(c => c.required)) {
    const row = run.results.find(r => r.case_id === testcase.id);
    need(row && row.case_revision === testcase.revision && row.case_digest === caseDigest(testcase)
      && row.mode === testcase.execution_mode && text(row.actor_id) && same(row.data_ref, testcase.data.dataset_ref), 'required case/data mismatch or NOT_RUN');
    need(row.status === 'PASS' && sameSet(row.steps?.map(s => s.step_id), testcase.steps.map(s => s.id)), 'required case failed/incomplete');
    let executionRunId = run.run_id, executionStart = run.started_at, executionEnd = run.finished_at;
    if (row.mode === 'automated') {
      const origin = readSnapshot(row.execution_ref, raw_files);
      need(origin.source === 'test_runner' && origin.complete === true && origin.truncated === false
        && text(origin.run_id) && origin.actor_id === row.actor_id && origin.candidate_digest === candidate.digest
        && same(origin.test_design_ref, design_ref) && same(origin.data_ref, row.data_ref)
        && time(origin.started_at) && time(origin.finished_at) && Date.parse(origin.started_at) <= Date.parse(origin.finished_at)
        && Date.parse(origin.finished_at) <= Date.parse(run.finished_at)
        && row.steps.every(s => origin.evidence_refs?.some(ref => same(ref, s.evidence_ref))), 'invalid original automated execution');
      executionRunId = origin.run_id; executionStart = origin.started_at; executionEnd = origin.finished_at;
    }
    for (const step of testcase.steps) {
      const result = row.steps.find(s => s.step_id === step.id);
      need(result.status === 'PASS' && text(result.actual), 'missing actual step observation');
      const evidence = readSnapshot(result.evidence_ref, raw_files);
      need(evidence.complete === true && evidence.truncated === false && evidence.project_id === run.project_id
        && evidence.story_id === run.story_id && evidence.run_id === executionRunId && evidence.case_id === testcase.id
        && evidence.case_digest === row.case_digest && evidence.step_id === step.id && evidence.actor_id === row.actor_id
        && evidence.candidate_digest === candidate.digest && evidence.environment_id === environment.id
        && same(evidence.data_ref, row.data_ref) && same(evidence.oracle_ref, step.oracle_ref)
        && evidence.expected === step.expected && evidence.actual === result.actual && evidence.status === 'PASS'
        && inInterval(evidence.observed_at, executionStart, executionEnd), 'unrelated/incomplete step evidence');
      need(evidence.source === (row.mode === 'manual' ? 'human' : row.mode === 'browser' ? 'browser' : 'test_runner'), 'manual/browser execution source mismatch');
      if (row.mode !== 'manual') need(text(evidence.check_id) && evidence.expected === evidence.actual, 'automated assertion not satisfied');
      else need(text(evidence.statement), 'manual observation statement missing');
    }
  }
  need(run.status === 'PASS' && Array.isArray(run.blockers) && run.blockers.length === 0, 'run not passed');
  return true; // QA execution validity only; independent final Gates remain required.
}

export function validateHandoff(handoff, context) {
  const { project_id, story_id, method_ref, workflow_ref, source_revision, controller_ref, lease_ref,
    dispatch_ref, raw_files, expected_kind, producer_actor_id, now } = context;
  const outcomes = { prd_ready: 'prd_ready', requirements_ready: 'requirements_ready', test_design_ready: 'test_design_ready',
    implementation_ready_for_qa: 'implementation_ready_for_qa', qa_execution_complete: 'qa_execution_complete' };
  need(handoff?.contract_version === 1 && text(handoff.handoff_id) && outcomes[handoff.kind]
    && handoff.kind === expected_kind && handoff.outcome === outcomes[handoff.kind], 'handoff is not delivery completion');
  need(handoff.project_id === project_id && handoff.story_id === story_id && same(handoff.method_ref, method_ref)
    && isWorkflowRef(workflow_ref) && same(handoff.workflow_ref, workflow_ref)
    && handoff.source_revision === source_revision && same(handoff.controller_ref, controller_ref)
    && same(handoff.lease_ref, lease_ref) && same(handoff.dispatch_ref, dispatch_ref), 'stale/foreign handoff controller');
  const lease = readSnapshot(lease_ref, raw_files), dispatch = readSnapshot(dispatch_ref, raw_files);
  // Durable approved artifacts outlive their producer's worker lease. Validate
  // authority at production; current side effects separately require a fresh
  // validateLiveControlStatus observation and an active, unexpired live lease.
  need(lease.revoked_at === null && lease.actor_id === producer_actor_id && time(lease.issued_at) && time(lease.expires_at)
    && time(handoff.created_at) && time(now) && Date.parse(lease.issued_at) <= Date.parse(handoff.created_at)
    && Date.parse(handoff.created_at) < Date.parse(lease.expires_at) && same(lease.dispatch_ref, dispatch_ref)
    && dispatch.source_revision === source_revision && same(dispatch.workflow_ref, workflow_ref), 'revoked/stale dispatch lease');
  need(text(handoff.state_locator) && text(handoff.control_locator) && handoff.control_locator === context.control_locator
    && handoff.producer?.actor_id === producer_actor_id && text(handoff.producer.run_id)
    && time(handoff.created_at) && Date.parse(handoff.created_at) <= Date.parse(now), 'handoff location/producer/time');
  need(handoff.artifact_refs?.length && handoff.source_refs?.length && handoff.approval_refs?.length, 'missing handoff artifacts/approvals');
  handoff.artifact_refs.forEach(ref => readSnapshot(ref, raw_files));
  handoff.source_refs.forEach(source => {
    need(text(source.provider) && text(source.object_id) && text(String(source.version ?? '')), 'missing source version identity');
    readSnapshot(source.snapshot_ref, raw_files);
  });
  const requirements = context.approval_requirements;
  const requiredRoles = { prd_ready: ['po'], requirements_ready: ['po'], test_design_ready: ['po', 'qa'],
    implementation_ready_for_qa: ['po', 'qa', 'technical'], qa_execution_complete: ['qa'] }[handoff.kind];
  need(requirements?.length && same(handoff.approval_refs, requirements.map(r => r.ref))
    && requiredRoles.every(role => requirements.some(r => r.role === role)), 'approval requirements missing');
  requirements.forEach(requirement => validateRoleApproval(readSnapshot(requirement.ref, raw_files), {
    ...requirement, project_id, story_id, method_ref: requirement.method_ref ?? method_ref, decision_files: raw_files, now,
  }));
  if (handoff.kind === 'implementation_ready_for_qa') need(same(handoff.candidate, context.candidate) && text(handoff.candidate?.digest), 'implementation candidate missing');
  return true;
}

export function planSyncAttempt(request, context) {
  const { grant, raw_files, now, prior = null, remote = null, approved_actor_id } = context;
  const blocked = reason => ({ status: 'blocked', action: 'none', reason, writes: 0 });
  const check = condition => { if (!condition) throw new Error('scope'); };
  try {
    check(isRef(request.artifact_ref) && isRef(request.handoff_ref) && isRef(request.method_ref) && isRef(request.authorization_ref)
      && isWorkflowRef(request.workflow_ref) && Number.isInteger(request.source_version) && request.source_version > 0
      && ['create', 'update_owned'].includes(request.operation) && text(request.operation_id)
      && text(request.target?.provider) && text(request.target.project_id) && text(request.target.container_id));
    check(grant?.contract_version === 1 && grant.project_id === request.project_id && grant.story_ids?.includes(request.story_id)
      && grant.actor_id === approved_actor_id && grant.revoked_at === null && time(now) && time(grant.expires_at)
      && Date.parse(now) < Date.parse(grant.expires_at) && same(grant.method_ref, request.method_ref)
      && same(grant.workflow_ref, request.workflow_ref) && grant.targets?.some(t => same(t, request.target))
      && grant.operations?.includes(request.operation) && grant.artifact_refs?.some(ref => same(ref, request.artifact_ref)));
    check(same(readSnapshot(request.authorization_ref, raw_files), grant));
    const actual = readSnapshot(grant.decision_ref, raw_files);
    const { decision_ref, ...grantSubject } = grant;
    check(actual.source === 'user' && actual.actor_id === approved_actor_id && text(actual.statement)
      && actual.decision === 'authorized' && same(actual.scope, grantSubject));
    readSnapshot(request.artifact_ref, raw_files); readSnapshot(request.handoff_ref, raw_files);
    const identity = { project_id: request.project_id, story_id: request.story_id, target: request.target,
      artifact_ref: request.artifact_ref, handoff_ref: request.handoff_ref, method_ref: request.method_ref,
      workflow_ref: request.workflow_ref, source_version: request.source_version, authorization_ref: request.authorization_ref,
      operation: request.operation, object_id: request.object_id, expected_remote_hash: request.expected_remote_hash,
      ownership_ref: request.ownership_ref ?? null };
    const key = digest(identity);
    check(request.idempotency_key === key);
    if (prior) {
      check(prior.idempotency_key === key && prior.operation_id === request.operation_id && same(prior.identity, identity));
      if (prior.status === 'succeeded') {
        if (!remote) return { status: 'unknown', action: 'read_verify_only', writes: 0 };
        if (text(remote.object_id) && remote.object_id === prior.object_id && remote.owner === `${request.project_id}/${request.story_id}`
          && remote.source_version === request.source_version && same(remote.artifact_ref, request.artifact_ref)
          && remote.content_hash === request.artifact_ref.sha256 && same(remote.target, request.target)) {
          return { status: 'succeeded', action: 'none', writes: 0 };
        }
        return { status: 'conflict', action: 'none', writes: 0 };
      }
      if (prior.status === 'unknown') {
        if (remote && text(remote.object_id) && remote.operation_id === request.operation_id && remote.owner === `${request.project_id}/${request.story_id}`
          && remote.source_version === request.source_version && same(remote.artifact_ref, request.artifact_ref)
          && remote.content_hash === request.artifact_ref.sha256 && same(remote.target, request.target)) {
          return { status: 'succeeded', action: 'record_readback', writes: 0, object_id: remote.object_id };
        }
        return { status: 'unknown', action: 'read_verify_only', writes: 0 };
      }
      if (prior.write_attempts > 0) return { status: prior.status, action: 'explicit_retry_required', writes: 0 };
    }
    if (request.operation === 'create') check(!remote && request.object_id === null);
    else {
      check(remote && text(request.object_id) && remote.object_id === request.object_id && same(remote.target, request.target)
        && remote.content_hash === request.expected_remote_hash && remote.source_version < request.source_version);
      const ownership = readSnapshot(request.ownership_ref, raw_files);
      check(ownership.contract_version === 1 && ['managed_receipt', 'explicit_import'].includes(ownership.kind)
        && ownership.project_id === request.project_id && ownership.story_id === request.story_id
        && ownership.object_id === request.object_id && same(ownership.target, request.target)
        && ownership.readback_hash === request.expected_remote_hash);
      if (ownership.kind === 'managed_receipt') {
        const readback = readSnapshot(ownership.readback_ref, raw_files);
        check(ownership.status === 'succeeded' && readback.object_id === request.object_id && same(readback.target, request.target)
          && readback.content_hash === ownership.readback_hash && readback.owner === `${request.project_id}/${request.story_id}`);
      } else {
        const decision = readSnapshot(ownership.decision_ref, raw_files);
        check(decision.source === 'user' && decision.actor_id === approved_actor_id && decision.decision === 'import_owned'
          && text(decision.statement) && decision.project_id === request.project_id && decision.story_id === request.story_id
          && decision.object_id === request.object_id && same(decision.target, request.target)
          && decision.content_hash === request.expected_remote_hash && decision.revoked_at === null);
      }
    }
    const live = context.live_control;
    check(live?.action && same(live.action.authorization_ref, request.authorization_ref)
      && same(live.action.method_ref, request.method_ref) && same(live.action.workflow_ref, request.workflow_ref)
      && live.action.project_id === request.project_id && live.action.story_id === request.story_id
      && live.action.operation === request.operation && same(live.action.target, request.target));
    validateLiveControlStatus(live.action, { observation: live.observation, raw_files, now });
    return { status: 'ready', action: request.operation, writes: 1, idempotency_key: key, identity };
  } catch { return blocked('missing authorization, changed identity, or remote conflict'); }
}
