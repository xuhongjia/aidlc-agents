// Pure, read-only decisions. The host verifies provenance, reserves runs and executes tools.
const TIERS = ['light', 'medium', 'heavy'];
const FLOORS = new Set(['architecture-gate-reviewer', 'quality-gate-reviewer', 'verifier', 'collector', 'verify-collector']);
const HIGH_RISKS = new Set(['auth', 'security', 'data-migration', 'concurrency', 'cross-system']);
const METRICS = ['input_tokens', 'cached_input_tokens', 'output_tokens', 'tool_output_bytes', 'calls', 'retries'];
const KINDS = ['parent', 'stage', 'leaf', 'hook', 'collector'];
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
const text = value => typeof value === 'string' && value.trim().length > 0;
const count = value => Number.isSafeInteger(value) && value >= 0;
const tier = value => TIERS.includes(value);
const strings = value => Array.isArray(value) && value.every(text) && new Set(value).size === value.length;
const canonical = value => JSON.stringify(value, (_, v) => v && !Array.isArray(v) && typeof v === 'object'
  ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v);
const add = (a, b) => { const result = a + b; requireThat(count(result), 'counter overflow'); return result; };

export function resolveExecution(policy, request, host = {}) {
  const result = { status: 'blocked', tier: null, role: request?.role ?? null, reasons: [],
    requested_model: null, requested_reasoning: null, fallback_reason: null,
    capability_verification: 'unverified', blockers: [] };
  try {
    requireThat(policy?.contract_version === 1 && typeof policy.enabled === 'boolean', 'unsupported execution policy');
    requireThat(text(request?.role) && Object.hasOwn(policy.role_defaults ?? {}, request.role), 'role needs an explicit default');
    const roleTier = policy.role_defaults[request.role];
    requireThat(tier(roleTier) && tier(request.task_tier), 'invalid role or task tier');
    requireThat(strings(request.risk_tags) && strings(request.required_capabilities), 'risk and capability assessment required');
    const requirements = [roleTier, request.task_tier];
    result.reasons.push(`role:${request.role}=${roleTier}`, `task=${request.task_tier}`);
    if (FLOORS.has(request.role)) { requirements.push('medium'); result.reasons.push('review-floor=medium'); }
    for (const risk of request.risk_tags) {
      requireThat(risk !== 'unassessed' && Object.hasOwn(policy.risk_tiers ?? {}, risk) && tier(policy.risk_tiers[risk]), `unassessed risk: ${risk}`);
      const riskTier = HIGH_RISKS.has(risk) ? 'heavy' : policy.risk_tiers[risk];
      requirements.push(riskTier); result.reasons.push(`risk:${risk}=${riskTier}`);
    }
    result.tier = TIERS[Math.max(...requirements.map(t => TIERS.indexOf(t)))];
    if (!policy.enabled) {
      requireThat(!request.fallback_model && !request.fallback_reason, 'inheritance cannot request a model fallback');
      result.status = 'inherited'; return result;
    }
    requireThat(host.model_selection === true && Array.isArray(host.models), 'host model selection unsupported');
    requireThat(host.models.every(m => text(m?.id)) && new Set(host.models.map(m => m.id)).size === host.models.length, 'ambiguous host models');
    const binding = policy.models?.[result.tier];
    requireThat(text(binding?.primary) && strings(binding.fallbacks) && !binding.fallbacks.includes(binding.primary), 'tier model binding required');
    requireThat(binding.reasoning === null || text(binding.reasoning), 'invalid reasoning binding');
    let modelId = binding.primary;
    if (request.fallback_model != null || request.fallback_reason != null) {
      requireThat(binding.fallbacks.includes(request.fallback_model)
        && ['rate_limit', 'temporarily_unavailable'].includes(request.fallback_reason), 'fallback is not authorized for this tier and failure');
      modelId = request.fallback_model; result.fallback_reason = request.fallback_reason;
    }
    const model = host.models.find(m => m.id === modelId);
    requireThat(model && strings(model.tiers) && model.tiers.every(tier) && model.tiers.includes(result.tier), 'model does not satisfy the selected tier');
    requireThat(strings(model.capabilities) && request.required_capabilities.every(c => model.capabilities.includes(c)), 'model capabilities unavailable');
    requireThat(binding.reasoning === null || (strings(model.reasoning) && model.reasoning.includes(binding.reasoning)), 'model reasoning setting unavailable');
    result.requested_model = modelId; result.requested_reasoning = binding.reasoning;
    result.capability_verification = 'verified'; result.status = 'selected';
  } catch (error) { result.blockers.push(error.message); }
  return result;
}

function uniqueReceipts(receipts) {
  requireThat(Array.isArray(receipts), 'receipts must be an array');
  const ids = new Map(), attempts = new Map(), sources = new Map();
  let work;
  for (const receipt of receipts) {
    requireThat(receipt && ['receipt_id', 'work_id', 'run_id', 'executor_id', 'source_ref'].every(k => text(receipt[k])), 'receipt identity and source required');
    requireThat(receipt.scope === 'exclusive' && KINDS.includes(receipt.kind), 'receipt must contain exclusive attempt deltas');
    requireThat(count(receipt.attempt) && receipt.attempt > 0, 'invalid attempt');
    requireThat([receipt.actual_model, receipt.actual_reasoning].every(v => v === null || text(v)), 'actual model and reasoning must be observed or null');
    work ??= receipt.work_id; requireThat(work === receipt.work_id, 'mixed work receipts');
    for (const key of METRICS) requireThat(receipt.usage?.[key] === null || count(receipt.usage?.[key]), `invalid usage: ${key}`);
    const u = receipt.usage;
    requireThat(u.input_tokens === null || u.cached_input_tokens === null || u.cached_input_tokens <= u.input_tokens, 'cached input exceeds input');
    requireThat(u.calls === null || u.retries === null || u.retries <= u.calls, 'retries exceed calls');
    requireThat(u.calls !== 0 || !(u.input_tokens > 0 || u.output_tokens > 0), 'tokens without calls');
    const value = canonical(receipt), { receipt_id, ...identity } = receipt;
    const execution = canonical(identity), key = `${receipt.run_id}\0${receipt.attempt}`;
    const owner = canonical([receipt.run_id, receipt.attempt, receipt.executor_id]);
    // source_ref identifies an exclusive native event/span, not a whole shared trace.
    requireThat(!sources.has(receipt.source_ref) || sources.get(receipt.source_ref) === owner, 'source attributed to another execution');
    requireThat(!ids.has(receipt_id) || ids.get(receipt_id) === value, 'conflicting receipt ID');
    requireThat(!attempts.has(key) || attempts.get(key).value === execution, 'conflicting run attempt');
    sources.set(receipt.source_ref, owner); ids.set(receipt_id, value); attempts.set(key, { value: execution, receipt });
  }
  return [...attempts.values()].map(entry => entry.receipt);
}

export function summarizeUsage(receipts) {
  const rows = uniqueReceipts(receipts), observed = {}, totals = {}, available = {};
  for (const key of METRICS) {
    available[key] = rows.length > 0 && rows.every(r => r.usage[key] !== null);
    observed[key] = rows.reduce((sum, r) => add(sum, r.usage[key] ?? 0), 0);
    totals[key] = available[key] ? observed[key] : null;
  }
  available.noncached_input_tokens = available.input_tokens && available.cached_input_tokens;
  observed.noncached_input_tokens = rows.reduce((sum, r) => add(sum,
    r.usage.input_tokens !== null && r.usage.cached_input_tokens !== null ? r.usage.input_tokens - r.usage.cached_input_tokens : 0), 0);
  totals.noncached_input_tokens = available.noncached_input_tokens ? observed.noncached_input_tokens : null;
  return { status: Object.values(available).every(Boolean) ? 'measured' : 'unavailable',
    work_id: rows[0]?.work_id ?? null, receipt_count: rows.length,
    agents: new Set(rows.filter(r => r.kind !== 'parent').map(r => r.executor_id)).size,
    totals, observed, available,
    runs: rows.map(({ run_id, attempt, executor_id, kind }) => ({ run_id, attempt, executor_id, kind })) };
}

export function checkBudget(policy, receipts, pending = []) {
  requireThat(policy?.contract_version === 1, 'unsupported execution policy');
  const b = policy.budgets;
  requireThat(b && ['pause', 'continue'].includes(b.unknown_usage), 'unknown usage policy required');
  const limits = { calls: 'max_calls', agents: 'max_agents', retries: 'max_retries',
    input_tokens: 'max_input_tokens', output_tokens: 'max_output_tokens', tool_output_bytes: 'max_tool_output_bytes' };
  for (const key of Object.values(limits)) requireThat(b[key] === null || count(b[key]), `invalid budget: ${key}`);
  requireThat(Array.isArray(pending), 'pending reservations must be an array');
  const usage = summarizeUsage(receipts), seen = new Set(usage.runs.map(r => `${r.run_id}\0${r.attempt}`));
  const agents = new Set(usage.runs.filter(r => r.kind !== 'parent').map(r => `actual:${r.executor_id}`));
  const reserved = { calls: 0, retries: 0, agents: 0 };
  for (const p of pending) {
    requireThat(text(p?.run_id) && count(p.attempt) && p.attempt > 0 && KINDS.includes(p.kind)
      && (p.executor_id === null || text(p.executor_id)) && count(p.calls) && p.calls > 0
      && count(p.retries) && p.retries <= p.calls, 'invalid pending reservation');
    const key = `${p.run_id}\0${p.attempt}`;
    requireThat(!seen.has(key), 'duplicate or completed pending attempt'); seen.add(key);
    reserved.calls = add(reserved.calls, p.calls); reserved.retries = add(reserved.retries, p.retries);
    if (p.kind !== 'parent') agents.add(p.executor_id === null ? `reserved:${key}` : `actual:${p.executor_id}`);
  }
  reserved.agents = agents.size - usage.agents;
  const blockers = [], warnings = [];
  for (const [metric, limitKey] of Object.entries(limits)) {
    const limit = b[limitKey]; if (limit === null) continue;
    const known = metric === 'agents' || usage.receipt_count === 0 || usage.available[metric];
    const observed = metric === 'agents' ? usage.agents : usage.observed[metric];
    const projected = add(observed, reserved[metric] ?? 0);
    if (!known) {
      (b.unknown_usage === 'pause' ? blockers : warnings).push({ code: 'usage_unavailable', metric, limit });
    }
    // Known subtotals can still prove exhaustion when other meters are unavailable.
    const reservable = Object.hasOwn(reserved, metric);
    const exhausted = reservable && (pending.length > 0 || metric === 'retries') ? projected > limit : projected >= limit;
    if (exhausted) blockers.push({ code: 'budget_exhausted', metric, limit, observed, projected });
  }
  return { allowed: blockers.length === 0, status: blockers.length ? 'blocked' : 'within_budget',
    usage, reserved, blockers, warnings, hard_token_cap: false };
}
