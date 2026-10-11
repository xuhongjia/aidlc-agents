// Maintainer-only contract model. Does not call GitLab or ship in the payload.
import { createHash } from 'node:crypto';
import { digest } from './workflow-model.mjs';
const need = (value, message) => { if (!value) throw new Error(message); };
const copy = value => structuredClone(value);
const nonempty = value => typeof value === 'string' && value.length > 0;
const sha = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const safePath = value => nonempty(value) && !value.startsWith('/') && !value.includes('\\') && !value.split('/').some(p => ['', '.', '..'].includes(p));
const unique = values => Array.isArray(values) && new Set(values).size === values.length;
const WAIT = new Set(['created', 'preparing', 'waiting_for_resource', 'waiting_for_callback', 'pending', 'running', 'scheduled', 'manual', 'blocked', 'canceling']);
const BAD = new Set(['failed', 'canceled', 'skipped']);
const KINDS = new Set(['verification', 'release_readiness', 'learning']);
const members = {
  checks: ['rule_id', 'status', 'executed_count', 'skipped_count', 'evidence'],
  producer: ['project_id', 'pipeline_id', 'job_id', 'source_commit'], upstream: ['project_id', 'pipeline_id', 'job_id', 'source_commit'],
  artifacts: ['id', 'type', 'repository', 'digest', 'digest_type', 'platform', 'uri', 'sha256'],
  deployments: ['id', 'environment', 'status', 'finished_at', 'commit'],
  observed_artifacts: ['id', 'type', 'repository', 'digest', 'digest_type', 'platform', 'uri', 'sha256', 'deployment_id', 'environment', 'observed_at', 'source'],
  environment_checks: ['id', 'status', 'executed_count', 'skipped_count', 'deployment_id', 'environment', 'observed_at', 'artifact_id'],
};
const logical = { gate: ['candidate_commit', 'rule_digest', 'checks'], artifact: ['producer', 'artifacts'],
  deployment: ['upstream', 'deployments'], environment: ['upstream', 'observed_artifacts', 'environment_checks'] };

export function validateDelivery(config) {
  if (config == null) return null;
  need(config.contract_version === 1 && ['local', 'ci', 'hybrid'].includes(config.gate_mode), 'unknown delivery contract or Gate mode');
  need(['native_wakeup', 'manual_resume'].includes(config.wait?.mode), 'unknown wait mode');
  need(Number.isInteger(config.wait.interval_seconds) && config.wait.interval_seconds > 0
    && Number.isInteger(config.wait.timeout_seconds) && config.wait.timeout_seconds >= config.wait.interval_seconds, 'invalid finite wait budget');
  need(Array.isArray(config.bindings) && config.bindings.length > 0, 'delivery has no configured bindings');
  need(unique(config.bindings.map(b => b.id)), 'duplicate binding');
  for (const binding of config.bindings) {
    need(/^[a-z0-9][a-z0-9._-]*$/.test(binding.id), 'unsafe binding ID');
    need(binding.provider === 'gitlab' && ['ci', 'cd'].includes(binding.phase), 'unknown provider or phase');
    need(nonempty(binding.connection_ref) && (nonempty(binding.project) || (Number.isInteger(binding.project) && binding.project > 0)), 'connection/project required');
    need(Array.isArray(binding.apply_to) && binding.apply_to.length > 0, 'stage selection required');
    for (const match of binding.apply_to) {
      need(KINDS.has(match.kind) && unique(match.workflow_ids) && unique(match.step_ids), 'invalid stage selection');
      need([...match.workflow_ids, ...match.step_ids].every(nonempty), 'invalid selection identity');
      need(!(binding.phase === 'cd' && match.kind === 'verification' && binding.approval_dependency === 'verify_final'), 'CD depends on final Verify: approval cycle');
    }
    need(['none', 'verify_final'].includes(binding.approval_dependency), 'unknown approval dependency');
    const selector = binding.selector;
    need(selector && (selector.pipeline_id === null || (Number.isInteger(selector.pipeline_id) && selector.pipeline_id > 0))
      && (selector.ref === null || nonempty(selector.ref)) && unique(selector.sources) && selector.sources.length > 0 && selector.sources.every(nonempty), 'pipeline selector required');
    need(unique(binding.required_jobs) && binding.required_jobs.length > 0 && binding.required_jobs.every(nonempty), 'nonempty exact required jobs');
    need(Array.isArray(binding.reports) && unique(binding.reports.map(r => r.id)), 'report IDs must be unique');
    for (const report of binding.reports) {
      need(/^[a-z0-9][a-z0-9._-]*$/.test(report.id) && binding.required_jobs.includes(report.job) && safePath(report.artifact_path), 'invalid report job/path');
      need(['json', 'junit'].includes(report.format) && ['gate', 'artifact', 'deployment', 'environment'].includes(report.type), 'unknown report format/type');
      need(binding.phase === 'ci' ? ['gate', 'artifact'].includes(report.type) : ['deployment', 'environment'].includes(report.type), 'report incompatible with phase');
      need(report.mapping && Object.values(report.mapping).every(v => nonempty(v) && /^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*$/.test(v)
        && !v.split('.').some(p => ['__proto__', 'constructor', 'prototype'].includes(p))), 'unsafe or missing field mapping');
      const allowed = logical[report.type].flatMap(key => [key, ...(members[key] ?? []).map(member => key + '.' + member)]);
      need(Object.keys(report.mapping).every(key => allowed.includes(key) && (!key.includes('.') || Object.hasOwn(report.mapping, key.split('.')[0]))), 'unknown logical mapping field');
      if (report.type === 'gate') need(['architecture', 'quality'].includes(report.gate_kind), 'unknown Gate kind');
    }
    if (binding.phase === 'cd') {
      need(nonempty(binding.environment?.name) && unique(binding.environment.required_checks) && binding.environment.required_checks.length > 0
        && binding.environment.required_checks.every(nonempty), 'post-deploy environment/checks required');
      const observations = binding.environment.observation_tool_binding_ids ?? [];
      need(unique(observations) && observations.every(nonempty), 'invalid observation tool references');
      need(binding.reports.some(r => r.type === 'deployment') && (binding.reports.some(r => r.type === 'environment') || observations.length), 'deployment and runtime observations required');
    } else need(binding.environment === null && selector.upstream_binding === null, 'CI cannot declare deployment/upstream');
  }
  for (const binding of config.bindings.filter(b => b.selector.upstream_binding)) {
    const upstream = config.bindings.find(b => b.id === binding.selector.upstream_binding);
    need(upstream?.phase === 'ci' && upstream.reports.some(r => r.type === 'artifact'), 'upstream CI artifact binding missing');
  }
  return config;
}

export function bindingsForStep(config, workflow, stage, node) {
  return (config?.bindings ?? []).filter(binding => binding.apply_to.some(match => match.kind === stage.kind
    && (!match.workflow_ids.length || match.workflow_ids.includes(workflow.id))
    && (!match.step_ids.length || match.step_ids.includes(node.step_id))));
}

export function freezeDelivery(config, workflow, stages, knownWorkflowIds = null, toolBindings = []) {
  if (config == null) return null;
  validateDelivery(config);
  if (knownWorkflowIds) need(config.bindings.every(b => b.apply_to.every(m => m.workflow_ids.every(id => knownWorkflowIds.includes(id)))), 'unknown pipeline workflow');
  const steps = workflow.nodes.map(node => {
    const stage = stages.find(s => s.id === node.stage_id);
    need(stage, 'unknown stage');
    const bindings = bindingsForStep(config, workflow, stage, node);
    need(!bindings.length || stage.capabilities.includes('evidence.read'), 'pipeline binding requires evidence.read');
    for (const id of bindings.flatMap(b => b.environment?.observation_tool_binding_ids ?? [])) {
      need(stage.tool_binding_ids?.includes(id) && toolBindings.some(t => t.id === id && t.effect === 'read'), 'observation requires registered stage read operation');
    }
    if (config.gate_mode === 'ci' && stage.kind === 'verification') {
      const kinds = new Set(bindings.flatMap(b => b.reports.filter(r => r.type === 'gate').map(r => r.gate_kind)));
      need(kinds.has('architecture') && kinds.has('quality'), 'CI mode requires both Gate mappings');
    }
    return { step_id: node.step_id, binding_ids: bindings.map(b => b.id) };
  });
  for (const binding of config.bindings) for (const match of binding.apply_to) {
    if (!match.workflow_ids.length || match.workflow_ids.includes(workflow.id)) {
      need(match.step_ids.every(id => workflow.nodes.some(n => n.step_id === id
        && stages.find(s => s.id === n.stage_id)?.kind === match.kind)), 'unknown or incompatible pipeline step');
    }
  }
  const used = new Set(steps.flatMap(s => s.binding_ids));
  for (const binding of config.bindings.filter(b => used.has(b.id))) if (binding.selector.upstream_binding) used.add(binding.selector.upstream_binding);
  if (!used.size) return null;
  return copy({ contract_version: 1, gate_mode: config.gate_mode, bindings: config.bindings.filter(b => used.has(b.id)), wait: config.wait, steps });
}

export function pipelineRequests(delivery, stepId, candidate, upstreamResults = [], toolBindings = []) {
  const step = delivery?.steps.find(s => s.step_id === stepId);
  if (!step) return [];
  need(sha(candidate?.ref?.sha256) && /^[a-f0-9]{40}$/.test(candidate.commit), 'fixed candidate and full commit required');
  return step.binding_ids.map(id => {
    const binding = delivery.bindings.find(b => b.id === id);
    need(binding, 'frozen binding missing');
    const upstream = upstreamResults.find(r => r.binding_id === binding.selector.upstream_binding);
    if (binding.selector.upstream_binding) {
      need(!upstream || (upstream.status === 'PASS' && upstream.candidate_commit === candidate.commit && upstream.artifacts.length > 0 && upstream.ref?.sha256), 'current upstream artifact proof required');
      need(upstream || step.binding_ids.includes(binding.selector.upstream_binding), 'upstream proof required outside this step');
    }
    const observationIds = binding.environment?.observation_tool_binding_ids ?? [];
    const observationRefs = observationIds.map(id => {
      const tool = toolBindings.find(t => t.id === id && t.effect === 'read'); need(tool, 'registered observation missing');
      return { id, sha256: digest(tool) };
    });
    return { binding_id: id, binding_digest: digest(binding), phase: binding.phase, candidate_ref: copy(candidate.ref), candidate_commit: candidate.commit,
      upstream_binding: binding.selector.upstream_binding,
      ...(observationRefs.length ? { observation_bindings: observationRefs } : {}),
      expected_artifacts: copy(upstream?.artifacts ?? candidate.expected_artifacts ?? []), upstream_result_refs: upstream ? [copy(upstream.ref)] : [] };
  });
}

export function resolvePipeline(binding, request, records, { projectId, upstream = null, links = [] } = {}) {
  need(request.binding_digest === digest(binding), 'binding drift');
  if (binding.selector.upstream_binding) need(upstream?.source_commit === request.candidate_commit, 'upstream candidate mismatch');
  const linked = pipe => (upstream && pipe.project_id === upstream.project_id && pipe.id === upstream.pipeline_id && pipe.sha === upstream.source_commit)
    || links.some(link => link.project_id === pipe.project_id && link.pipeline_id === pipe.id
      && upstream && ['project_id', 'pipeline_id', 'job_id', 'source_commit'].every(k => link.upstream[k] === upstream[k]));
  let matches = records.filter(pipe => pipe.project_id === projectId
    && (!binding.selector.ref || pipe.ref === binding.selector.ref) && binding.selector.sources.includes(pipe.source)
    && (binding.phase === 'ci' || !binding.selector.upstream_binding ? pipe.sha === request.candidate_commit : linked(pipe)));
  const latest = [...matches].sort((a, b) => b.id - a.id)[0];
  if (binding.selector.pipeline_id) {
    matches = matches.filter(p => p.id === binding.selector.pipeline_id);
    need(matches.length === 1, 'explicit pipeline candidate/source/lineage mismatch');
    need(!latest || latest.id <= matches[0].id, 'explicit old pipeline cannot hide newer matching run');
  }
  if (!matches.length) return null;
  need(unique(matches.map(p => p.id)), 'ambiguous pipeline records');
  return copy(matches.sort((a, b) => b.id - a.id)[0]);
}

export function inspectPipeline(binding, pipeline, jobs, { complete = true } = {}) {
  need(complete, 'incomplete pagination');
  if (!pipeline) return { status: 'WAITING', reason: 'awaiting_pipeline', jobs: [] };
  if (BAD.has(pipeline.status)) return { status: 'FAIL', reason: pipeline.status, jobs: [] };
  need(pipeline.status === 'success' || WAIT.has(pipeline.status), 'unknown pipeline status');
  const selected = [], waiting = []; let failure = null;
  for (const name of binding.required_jobs) {
    const attempts = jobs.filter(job => job.name === name && job.pipeline?.id === pipeline.id && job.pipeline.project_id === pipeline.project_id)
      .sort((a, b) => b.id - a.id);
    if (!attempts.length) {
      if (WAIT.has(pipeline.status)) { waiting.push('awaiting_job'); continue; }
      throw new Error('required job missing');
    }
    need(unique(attempts.map(j => j.id)) && attempts.filter(j => !j.retried).length <= 1, 'ambiguous job attempts/matrix');
    const latest = attempts[0]; selected.push(copy(latest));
    if (BAD.has(latest.status)) { failure ??= name + ':' + latest.status; continue; }
    if (WAIT.has(latest.status)) { waiting.push(latest.status); continue; }
    need(latest.status === 'success' && latest.started_at && latest.finished_at, 'job execution unknown');
  }
  return { status: failure ? 'FAIL' : waiting.length ? 'WAITING' : 'READY',
    reason: failure ?? waiting.find(r => ['manual', 'blocked'].includes(r)) ?? waiting[0] ?? null, jobs: selected, attempts: copy(jobs) };
}

function field(value, path) {
  return path.split('.').reduce((current, part) => current && Object.hasOwn(current, part) ? current[part] : undefined, value);
}
function mapped(raw, mapping) {
  const result = {};
  for (const [key, ref] of Object.entries(mapping).filter(([key]) => !key.includes('.'))) result[key] = field(raw, ref);
  for (const group of Object.keys(result).filter(key => members[key])) {
    const mapRow = row => {
      const item = Object.fromEntries(members[group].filter(key => row && Object.hasOwn(row, key)).map(key => [key, row[key]]));
      for (const [key, ref] of Object.entries(mapping).filter(([key]) => key.startsWith(group + '.'))) item[key.slice(group.length + 1)] = field(row, ref);
      return item;
    };
    result[group] = Array.isArray(result[group]) ? result[group].map(mapRow) : result[group] == null ? result[group] : mapRow(result[group]);
  }
  return result;
}
function artifactIdentity(artifact) {
  need(nonempty(artifact.id) && nonempty(artifact.type), 'artifact identity required');
  if (artifact.type === 'image') {
    need(nonempty(artifact.repository) && /^sha256:[a-f0-9]{64}$/.test(artifact.digest)
      && ['manifest', 'index', 'platform_manifest'].includes(artifact.digest_type), 'immutable image and digest type required');
    return [artifact.id, artifact.type, artifact.repository, artifact.digest, artifact.digest_type].join('|');
  }
  need(nonempty(artifact.uri) && sha(artifact.sha256), 'immutable non-container artifact required');
  return [artifact.id, artifact.type, artifact.uri, artifact.sha256].join('|');
}

export function collectPipeline(binding, request, pipeline, data, baselines = {}, upstream = null) {
  need(request.binding_digest === digest(binding), 'binding drift');
  if (pipeline && (binding.phase === 'ci' || !binding.selector.upstream_binding)) need(pipeline.sha === request.candidate_commit, 'pipeline candidate mismatch');
  if (binding.selector.upstream_binding) need(upstream?.source_commit === request.candidate_commit, 'upstream candidate mismatch');
  const inspected = inspectPipeline(binding, pipeline, data.jobs, { complete: data.complete });
  const result = { binding_id: binding.id, binding_digest: request.binding_digest, candidate_commit: request.candidate_commit,
    status: inspected.status === 'READY' ? 'PASS' : inspected.status, jobs: copy(data.jobs), pipelines: pipeline ? [copy(pipeline)] : [],
    gate_evidence: [], artifacts: [], deployments: [], environment_checks: [], sources: [] };
  if (inspected.status !== 'READY') return result;
  const items = [];
  for (const report of binding.reports) {
    const job = inspected.jobs.find(j => j.name === report.job);
    const response = data.reports.find(r => r.job_id === job.id && r.path === report.artifact_path);
    need(response?.complete === true && typeof response.body === 'string' && !response.expired && !response.truncated, 'report missing/expired/truncated');
    need(report.format === 'json', 'reference collector exercises JSON; JUnit requires host parser and rule mapping');
    const item = mapped(JSON.parse(response.body), report.mapping); items.push({ report, job, item });
    result.sources.push({ id: report.id, job_id: job.id, path: report.artifact_path, sha256: createHash('sha256').update(response.body).digest('hex') });
    if (report.type === 'gate') {
      const base = baselines[report.gate_kind];
      need(item.candidate_commit === request.candidate_commit && job.commit.id === request.candidate_commit, 'Gate candidate mismatch');
      need(base && sha(base.rule_digest) && sha(base.configuration_digest) && item.rule_digest === base.rule_digest && job.configuration_ref?.sha256 === base.configuration_digest, 'Gate approved rule/configuration mismatch');
      need(Array.isArray(item.checks) && item.checks.length > 0 && unique(item.checks.map(c => c.rule_id)), 'nonzero rule checks required');
      need(base.rule_ids.every(id => item.checks.some(c => c.rule_id === id)), 'approved rule coverage missing');
      for (const check of item.checks) {
        need(base.rule_ids.includes(check.rule_id) && Number.isInteger(check.executed_count) && check.executed_count > 0
          && check.skipped_count === 0 && Array.isArray(check.evidence) && check.evidence.length > 0, 'zero/skipped/unrelated rule evidence');
        for (const ref of check.evidence) {
          const raw = data.attachments?.find(a => a.job_id === job.id && a.path === ref.path);
          need(safePath(ref.path) && sha(ref.sha256) && raw?.complete === true && typeof raw.body === 'string' && !raw.truncated
            && createHash('sha256').update(raw.body).digest('hex') === ref.sha256, 'rule raw evidence missing/truncated/drifted');
        }
        if (check.status !== 'PASS') result.status = 'FAIL';
      }
      result.gate_evidence.push({ kind: report.gate_kind, checks: copy(item.checks), execution: { provider: 'gitlab', project_id: pipeline.project_id,
        pipeline_id: pipeline.id, job_id: job.id, job_name: job.name, status: job.status, source_commit: job.commit.id,
        attempt: job.id, rule_digest: item.rule_digest, configuration_ref: copy(job.configuration_ref), source_ids: [report.id] } });
    }
    if (report.type === 'artifact') {
      need(item.producer && ['project_id', 'pipeline_id', 'job_id', 'source_commit'].every(k => item.producer[k]
        === ({ project_id: pipeline.project_id, pipeline_id: pipeline.id, job_id: job.id, source_commit: request.candidate_commit })[k]), 'artifact producer mismatch');
      need(Array.isArray(item.artifacts) && item.artifacts.length > 0 && unique(item.artifacts.map(a => a.id)), 'build artifacts missing');
      item.artifacts.forEach(artifactIdentity); result.artifacts.push(...copy(item.artifacts)); result.producer = copy(item.producer);
    }
    if (binding.phase === 'cd') {
      if (binding.selector.upstream_binding) need(upstream?.status === 'PASS' && upstream.ref?.sha256 && item.upstream
        && ['project_id', 'pipeline_id', 'job_id', 'source_commit'].every(k => item.upstream[k] === upstream[k]), 'CD upstream lineage mismatch');
      if (report.type === 'deployment') result.deployments.push(...copy(item.deployments ?? []));
      if (report.type === 'environment') result.environment_checks.push(...copy(item.environment_checks ?? []));
    }
  }
  if (binding.phase === 'cd') {
    need(result.deployments.length === 1, 'exact deployment required');
    const deployment = result.deployments[0], actual = data.deployments?.find(d => d.id === deployment.id);
    need(actual && actual.environment.name === binding.environment.name && deployment.environment === binding.environment.name
      && actual.status === 'success' && deployment.status === 'success' && actual.sha === deployment.commit
      && actual.sha === pipeline.sha && actual.deployable?.pipeline?.id === pipeline.id && actual.deployable.pipeline.project_id === pipeline.project_id
      && inspected.jobs.some(j => j.id === actual.deployable.id) && data.current_deployment_id === actual.id, 'wrong/failed/superseded deployment');
    const expected = request.expected_artifacts.length ? request.expected_artifacts : upstream?.artifacts;
    need(Array.isArray(expected) && expected.length > 0, 'expected immutable artifacts missing');
    if (binding.selector.upstream_binding) need(digest(expected) === digest(upstream.artifacts), 'approved/upstream artifact mismatch');
    const queried = [];
    for (const id of binding.environment.observation_tool_binding_ids ?? []) {
      const response = data.observations?.find(o => o.binding_id === id), fixed = request.observation_bindings?.find(t => t.id === id);
      need(fixed && response?.tool_binding_digest === fixed.sha256 && response.complete === true && !response.truncated
        && response.input?.environment === binding.environment.name && response.input.deployment_id === actual.id
        && response.input.candidate_commit === request.candidate_commit && typeof response.body === 'string', 'readonly observation scope/source mismatch');
      const body = JSON.parse(response.body); need(body.environment === binding.environment.name && body.source_commit === request.candidate_commit, 'readonly observation output mismatch');
      queried.push(...body.observed_artifacts ?? []); result.environment_checks.push(...body.environment_checks ?? []);
      result.sources.push({ id: 'observation:' + id, sha256: createHash('sha256').update(response.body).digest('hex'), tool_binding_digest: fixed.sha256 });
    }
    const observed = [...items.filter(i => i.report.type === 'environment').flatMap(i => i.item.observed_artifacts ?? []), ...queried];
    const identities = new Set(expected.map(artifactIdentity));
    need(unique(observed.map(a => a.id)) && observed.length === identities.size, 'runtime artifact set mismatch');
    for (const artifact of observed) need(identities.has(artifactIdentity(artifact)) && artifact.source === 'runtime_observation'
      && artifact.deployment_id === actual.id && artifact.environment === binding.environment.name
      && Date.parse(artifact.observed_at) >= Date.parse(actual.finished_at), 'runtime identity or observation mismatch');
    need(unique(result.environment_checks.map(c => c.id)), 'duplicate environment checks');
    for (const id of binding.environment.required_checks) {
      const check = result.environment_checks.find(c => c.id === id);
      need(check && check.deployment_id === actual.id && check.environment === binding.environment.name
        && observed.some(a => a.id === check.artifact_id) && Date.parse(check.observed_at) >= Date.parse(actual.finished_at)
        && Number.isInteger(check.executed_count) && check.executed_count > 0 && check.skipped_count === 0, 'required environment observation missing/invalid');
      if (check.status !== 'PASS') result.status = 'FAIL';
    }
    result.artifacts = copy(observed);
  }
  return result;
}
