// Maintainer-only synthetic contract: no installation, login, network, or payload runtime.
// Evidence identities and declarations are validated here; live observations remain the host's duty.
import { digest } from './workflow-model.mjs';
import { validateDelivery } from './pipeline-model.mjs';

const copy = value => structuredClone(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const timestamp = value => text(value) && Number.isFinite(Date.parse(value));
const unique = values => new Set(values).size === values.length;
const safeRef = ref => object(ref) && text(ref.path) && !ref.path.startsWith('/')
  && !ref.path.includes('\\') && !ref.path.split('/').some(part => ['', '.', '..'].includes(part))
  && /^[a-f0-9]{64}$/.test(ref.sha256);
const coreRequirement = () => ({ id: 'aidlc', capability: 'aidlc', target_id: null });
const probes = {
  aidlc: ['package_integrity', 'spawn', 'isolated_context', 'collect_results'],
  confluence: ['authenticated', 'target_read'],
  gitlab: ['authenticated', 'target_read', 'mappings_read'],
};
const controls = new Set(['status', 'approval', 'revoke', 'close', 'terminate', 'closing']);
const continuations = new Set(['continue', 'continuation', 'rework', 'resume']);
const scopeDigest = requirements => digest({ requirements });

function secretFree(value) {
  if (!object(value) && !Array.isArray(value)) return true;
  return Object.entries(value).every(([key, child]) => !/^(?:password|token|secret|credentials|api_key|access_token)$/i.test(key) && secretFree(child));
}

function confluenceTarget(config, targetId) {
  const matches = config.knowledge?.targets?.filter?.(target => target.id === targetId) ?? [];
  if (matches.length !== 1) throw new Error('missing or duplicate Confluence target');
  const target = matches[0];
  if (target.provider !== 'confluence_cloud' || target.transport !== 'twg_cli'
    || !text(target.space_id) || !text(target.parent_page_id)
    || !Array.isArray(target.types) || !target.types.length || !unique(target.types)
    || target.types.some(type => !['architecture', 'quality', 'anti_pattern', 'lesson'].includes(type))) {
    throw new Error('incomplete or incompatible Confluence target');
  }
  const url = new URL(target.site);
  if (url.protocol !== 'https:' || url.username || url.password || !secretFree(target)) throw new Error('unsafe Confluence target');
  return copy(target);
}

function gitlabTarget(config, targetId) {
  const delivery = config.delivery, selected = [];
  function select(id, ancestors = []) {
    if (ancestors.includes(id)) throw new Error('cyclic GitLab upstream binding');
    const matches = delivery?.bindings?.filter?.(binding => binding.id === id) ?? [];
    if (matches.length !== 1) throw new Error('missing or duplicate GitLab binding');
    const binding = matches[0];
    if (!selected.some(item => item.id === id)) selected.push(binding);
    if (binding.selector?.upstream_binding) select(binding.selector.upstream_binding, [...ancestors, id]);
  }
  select(targetId);
  const target = copy({ contract_version: delivery.contract_version, gate_mode: delivery.gate_mode,
    wait: delivery.wait, bindings: selected });
  if (!secretFree(target)) throw new Error('credentials must remain in the host connection');
  validateDelivery(target);
  const fields = { gate: ['candidate_commit', 'rule_digest', 'checks'], artifact: ['producer', 'artifacts'],
    deployment: ['upstream', 'deployments'], environment: ['upstream', 'observed_artifacts', 'environment_checks'] };
  for (const binding of target.bindings) {
    if (!binding.reports.length) throw new Error('GitLab reports are not configured');
    for (const report of binding.reports) {
      // JSON follows the existing decoder. JUnit keeps the host parser/rule mapping contract.
      if (report.format === 'json' ? fields[report.type].some(field => !text(report.mapping[field]))
        : !Object.keys(report.mapping).length) throw new Error('incomplete GitLab report mapping');
    }
  }
  return target;
}

export function resolveSetup(config) {
  const blockers = [], requirements = [];
  const setup = Object.hasOwn(config, 'setup') ? config.setup : { required: [coreRequirement()] };
  if (!object(setup) || !Array.isArray(setup.required)) blockers.push('invalid setup requirements');
  const required = Array.isArray(setup?.required) ? setup.required : [];
  if (required.filter(item => item?.capability === 'aidlc').length !== 1) blockers.push('exactly one aidlc requirement is mandatory');
  const ids = new Set(), targets = new Set();
  for (const item of required) {
    if (!object(item) || !text(item.id) || !Object.hasOwn(probes, item.capability)
      || (item.target_id !== null && !text(item.target_id))) {
      blockers.push('invalid requirement'); continue;
    }
    const targetKey = item.capability + ':' + item.target_id;
    if (ids.has(item.id) || targets.has(targetKey)) blockers.push('duplicate requirement identity or target');
    ids.add(item.id); targets.add(targetKey);
    const requirement = { id: item.id, capability: item.capability, target_id: item.target_id, target: null };
    requirements.push(requirement);
    if (item.capability === 'aidlc') {
      if (item.target_id !== null) blockers.push(item.id + ': aidlc must not reference an external target');
    } else if (item.target_id === null) blockers.push(item.id + ': target setup is pending');
    else {
      try {
        requirement.target = item.capability === 'confluence' ? confluenceTarget(config, item.target_id) : gitlabTarget(config, item.target_id);
      } catch (error) { blockers.push(item.id + ': ' + error.message); }
    }
  }
  requirements.sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0);
  return { requirements, scope_digest: scopeDigest(requirements), blockers };
}

export function authorizeSetupReads(resolved, authorization) {
  const denied = reason => ({ authorized: false, external_reads: [], authorization_digest: null, reason });
  if (!resolved || !Array.isArray(resolved.requirements) || !Array.isArray(resolved.blockers)
    || resolved.scope_digest !== scopeDigest(resolved.requirements)) return denied('invalid or changed resolved configuration');
  if (resolved.blockers.length) return denied('setup configuration is blocked');
  const external = resolved.requirements.filter(requirement => requirement.capability !== 'aidlc');
  if (!external.length) return { authorized: true, external_reads: [], authorization_digest: null };
  if (!object(authorization) || !text(authorization.user_statement) || !text(authorization.source)
    || !timestamp(authorization.at)) return denied('read authorization is missing');
  if (authorization.revoked === true || authorization.status === 'revoked' || authorization.revoked_at) return denied('read authorization is revoked');
  if (authorization.scope_digest !== resolved.scope_digest) return denied('read authorization scope changed');
  return { authorized: true, external_reads: copy(external), authorization_digest: digest(authorization) };
}

export function evaluateSetup({ intent, invocation_id, resolved, authorization, checks = [], invocation_started_at = null, evaluated_at = null } = {}) {
  // Old work and control operations must not resolve today's requirements or ask for new reads.
  if (continuations.has(intent)) return { status: 'pinned', external_reads: [], create_work: false, snapshot: null };
  if (controls.has(intent)) return { status: 'not_applicable', external_reads: [], create_work: false, snapshot: null };
  const blocked = blockers => ({ status: 'blocked', blockers, external_reads: [], create_work: false, snapshot: null });
  if (!['new_work', 'setup_check'].includes(intent) || !text(invocation_id)) return blocked(['unknown intent or missing invocation identity']);
  if (!timestamp(invocation_started_at) || !timestamp(evaluated_at)
    || Date.parse(invocation_started_at) > Date.parse(evaluated_at)) return blocked(['valid ordered invocation boundaries required']);
  if (!resolved || !Array.isArray(resolved.requirements) || !Array.isArray(resolved.blockers)
    || resolved.scope_digest !== scopeDigest(resolved.requirements)) return blocked(['invalid or changed resolved configuration']);
  if (resolved.blockers.length) return blocked(copy(resolved.blockers));
  const authority = authorizeSetupReads(resolved, authorization);
  if (!authority.authorized) return blocked([authority.reason]);
  if (!Array.isArray(checks)) return blocked(['invalid check receipts']);
  const blockers = [];
  if (checks.some(check => !resolved.requirements.some(requirement => requirement.id === check?.requirement_id))) blockers.push('unexpected optional or unknown receipt');
  for (const requirement of resolved.requirements) {
    const matches = checks.filter(check => check?.requirement_id === requirement.id);
    if (matches.length !== 1) { blockers.push(requirement.id + ': missing or duplicate receipt'); continue; }
    const check = matches[0];
    if (check.status !== 'ready') blockers.push(requirement.id + ': ' + (check.status ?? 'unknown'));
    if (check.invocation_id !== invocation_id || check.config_digest !== resolved.scope_digest) blockers.push(requirement.id + ': stale receipt identity');
    if (check.authorization_digest !== authority.authorization_digest) blockers.push(requirement.id + ': read authorization changed');
    if (!timestamp(check.observed_at)
      || Date.parse(check.observed_at) < Date.parse(invocation_started_at)
      || Date.parse(check.observed_at) > Date.parse(evaluated_at)) blockers.push(requirement.id + ': invalid observation time');
    if (!Array.isArray(check.verified_checks) || !unique(check.verified_checks)
      || probes[requirement.capability].some(probe => !check.verified_checks.includes(probe))) blockers.push(requirement.id + ': incomplete capability checks');
    if (!Array.isArray(check.evidence_refs) || !check.evidence_refs.length || !check.evidence_refs.every(safeRef)
      || !unique(check.evidence_refs.map(ref => ref.path))) blockers.push(requirement.id + ': evidence references required');
  }
  if (blockers.length) return blocked(blockers);
  return { status: 'ready', external_reads: [], create_work: intent === 'new_work',
    snapshot: copy({ invocation_id, invocation_started_at, evaluated_at, config_digest: resolved.scope_digest,
      authorization_digest: authority.authorization_digest, requirements: resolved.requirements, checks }) };
}
