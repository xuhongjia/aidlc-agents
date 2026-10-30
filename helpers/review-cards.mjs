// Read-only data checks; the host verifies frozen bytes, evidence and authority.
const ensure = (condition, message) => { if (!condition) throw new Error(message); };
const gates = ['architecture', 'quality'];
const statuses = ['confirmed', 'disproved', 'inconclusive'];
const identifier = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:-]*$/.test(value);
const strings = value => Array.isArray(value) && value.every(item => typeof item === 'string' && item.length > 0);
const unique = values => new Set(values).size === values.length;
function safePath(value) {
  return typeof value === 'string' && value.length > 0 && !value.includes('\\') && !value.includes('\0')
    && !value.startsWith('/') && !/^[A-Za-z]:/.test(value)
    && !value.split('/').some(part => ['', '.', '..'].includes(part));
}
function namespaceRef(value) {
  return typeof value === 'string' && /^(core|team|project):/.test(value) && safePath(value.slice(value.indexOf(':') + 1));
}
function fileRef(value) {
  return value && safePath(value.path) && typeof value.sha256 === 'string' && /^[a-f0-9]{64}$/.test(value.sha256);
}
const sameRef = (left, right) => left.path === right.path && left.sha256 === right.sha256;
function matches(pattern, file) {
  // Only path globs, never regular expressions, commands or user-provided code.
  ensure(safePath(pattern) && pattern.length <= 512 && !pattern.includes('?'), 'invalid card path pattern');
  let expression = '';
  for (let i = 0; i < pattern.length; i++) {
    if (pattern.slice(i, i + 3) === '**/') { expression += '(?:.*/)?'; i += 2; }
    else if (pattern.slice(i, i + 2) === '**') { expression += '.*'; i++; }
    else if (pattern[i] === '*') expression += '[^/]*';
    else expression += pattern[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp('^' + expression + '$').test(file);
}

export function selectReviewCards(catalog, assessment, frozenAssets) {
  ensure(catalog?.contract_version === 1 && Array.isArray(catalog.cards), 'unknown review card contract');
  ensure(Array.isArray(frozenAssets), 'frozen assets required');
  const assets = new Map();
  for (const asset of frozenAssets) {
    ensure(namespaceRef(asset.ref) && fileRef(asset) && !assets.has(asset.ref), 'invalid or duplicate frozen asset');
    assets.set(asset.ref, asset);
  }
  const ids = new Set(), knownTags = new Set();
  for (const card of catalog.cards) {
    ensure(identifier(card.id) && !ids.has(card.id) && Number.isSafeInteger(card.version) && card.version > 0, 'invalid or duplicate card identity');
    ensure(namespaceRef(card.ref) && assets.has(card.ref), 'card missing from frozen assets');
    ensure(strings(card.source_refs) && card.source_refs.length > 0 && unique(card.source_refs)
      && card.source_refs.every(ref => namespaceRef(ref) && assets.has(ref)), 'card provenance missing from frozen assets');
    ensure(strings(card.reviewers) && card.reviewers.length > 0 && unique(card.reviewers)
      && card.reviewers.every(gate => gates.includes(gate)), 'invalid card reviewers');
    ensure(strings(card.risk_tags) && unique(card.risk_tags) && card.risk_tags.every(identifier), 'invalid card risk tags');
    ensure(strings(card.path_patterns) && unique(card.path_patterns), 'invalid card path patterns');
    ensure(card.risk_tags.length + card.path_patterns.length > 0, 'card requires applicability');
    card.path_patterns.forEach(pattern => matches(pattern, 'validate-pattern'));
    card.risk_tags.forEach(tag => knownTags.add(tag)); ids.add(card.id);
  }
  ensure(['assessed', 'unassessed'].includes(assessment?.status), 'risk assessment status required');
  ensure(strings(assessment.risk_tags) && unique(assessment.risk_tags), 'risk tags must be unique');
  ensure(strings(assessment.changed_paths) && unique(assessment.changed_paths)
    && assessment.changed_paths.every(safePath), 'invalid changed paths');
  const required = assessment.required_card_ids ?? [];
  ensure(strings(required) && unique(required) && required.every(id => ids.has(id)), 'unknown or duplicate required card');
  ensure(assessment.reviewer == null || gates.includes(assessment.reviewer), 'unknown Reviewer');
  const unknownTags = assessment.risk_tags.filter(tag => !knownTags.has(tag));
  const cards = [];
  for (const card of catalog.cards) {
    if (assessment.reviewer && !card.reviewers.includes(assessment.reviewer)) continue;
    const reasons = [];
    if (required.includes(card.id)) reasons.push('required:' + card.id);
    for (const tag of assessment.risk_tags) if (card.risk_tags.includes(tag)) reasons.push('risk:' + tag);
    for (const file of assessment.changed_paths) if (card.path_patterns.some(pattern => matches(pattern, file))) reasons.push('path:' + file);
    if (!reasons.length) continue;
    const asset = assets.get(card.ref);
    cards.push({ id: card.id, version: card.version, reviewers: [...card.reviewers], reasons,
      instruction_ref: { ref: card.ref, path: asset.path, sha256: asset.sha256, purpose: 'review-card' },
      source_refs: card.source_refs.map(ref => ({ ...assets.get(ref) })) });
  }
  return { status: assessment.status === 'assessed' && unknownTags.length === 0 ? 'selected' : 'needs_assessment',
    cards, unknown_tags: unknownTags, risk_clearance: false };
}

export function validateFindings(findings, context) {
  ensure(Array.isArray(findings) && fileRef(context?.candidate_ref) && gates.includes(context.reviewer), 'finding context required');
  ensure(['PASS', 'FAIL', 'BLOCKED', 'NOT_RUN'].includes(context.gate_status), 'invalid Gate status');
  const required = context.required_rule_ids ?? [], blocking = context.approved_blocking_rules ?? [];
  ensure(strings(required) && unique(required), 'invalid required rules');
  ensure(Array.isArray(blocking), 'invalid blocking rules');
  const blockingIds = new Set();
  for (const rule of blocking) {
    ensure(identifier(rule.rule_id) && fileRef(rule.approval_ref) && !blockingIds.has(rule.rule_id), 'invalid approved blocking rule');
    blockingIds.add(rule.rule_id);
  }
  const ids = new Set();
  for (const finding of findings) {
    ensure(identifier(finding.id) && !ids.has(finding.id) && identifier(finding.rule_id), 'invalid or duplicate finding identity');
    ensure(statuses.includes(finding.status), 'invalid finding status');
    ensure(finding.location && safePath(finding.location.path) && Number.isSafeInteger(finding.location.line)
      && finding.location.line > 0, 'invalid finding location');
    ensure(fileRef(finding.candidate_ref) && sameRef(finding.candidate_ref, context.candidate_ref), 'finding candidate drift');
    ensure(typeof finding.summary === 'string' && finding.summary.trim(), 'finding summary required');
    ensure(Array.isArray(finding.evidence) && finding.evidence.every(fileRef)
      && unique(finding.evidence.map(ref => ref.path)), 'invalid finding evidence');
    if (finding.status !== 'inconclusive') ensure(finding.evidence.length > 0, 'confirmed/disproved finding needs evidence');
    else ensure(typeof finding.limitation === 'string' && finding.limitation.trim(), 'inconclusive finding needs limitation');
    if (context.gate_status === 'PASS') {
      ensure(!(blockingIds.has(finding.rule_id) && finding.status !== 'disproved'), 'unresolved approved blocking finding');
      ensure(!(required.includes(finding.rule_id) && finding.status === 'inconclusive'), 'required finding remains inconclusive');
      ensure(finding.evidence.length > 0, 'missing finding evidence cannot support PASS');
    }
    ids.add(finding.id);
  }
  // This validates references/status consistency, not raw evidence or Gate truth.
  return { valid: true, finding_count: findings.length, gate_pass_evaluated: false };
}
