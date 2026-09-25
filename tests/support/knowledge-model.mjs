// Maintainer-only reference model. NOT installed, NOT an approval/authentication runtime.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
export const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const targetKey = target => digest(target);
const identity = snapshot => `${snapshot.project_id}/${snapshot.id}`;
export function validateSnapshot(snapshot) {
  if (!['architecture', 'quality', 'anti_pattern', 'lesson'].includes(snapshot.type)) throw new Error('type');
  for (const key of ['project_id', 'id']) if (!/^[\w-]+$/.test(snapshot[key] ?? '')) throw new Error('identity');
  if (!Number.isInteger(snapshot.version) || snapshot.version < 1) throw new Error('version');
  if (!snapshot.applicability?.length || !snapshot.invalid_when?.length || !snapshot.source.evidence_refs?.length) throw new Error('provenance');
  if (snapshot.type === 'anti_pattern') {
    for (const key of ['condition','bad_practice','consequence','alternative','evidence','limitations']) {
      if (!snapshot.content.anti_pattern?.[key]?.length) throw new Error(`anti_pattern.${key}`);
    }
  }
  if (['architecture','quality'].includes(snapshot.type)) {
    if (snapshot.origin === 'approved_document' && (!snapshot.content.design_body || !snapshot.source.design_refs?.length)) throw new Error('approved design');
    if (snapshot.origin === 'derived' && snapshot.content.design_body !== null) throw new Error('derived full design');
  }
  if (snapshot.origin === 'observed_revision' && (!snapshot.supersedes || !snapshot.source.feedback_ref)) throw new Error('learn source');
}
export function checkSourceCoverage(requirements, criteria) {
  const ids = new Set(criteria.map(c => c.id));
  if (!ids.size || ids.size !== criteria.length) throw new Error('AC set');
  for (const requirement of requirements) {
    const coverage = criteria.filter(c => c.source_refs.includes(requirement.id));
    if (!coverage.length && !requirement.exclusion?.approved_ref) throw new Error(`unmapped ${requirement.id}`);
  }
}
// File-backed fake remote: tests inspect actual JSON state and mutation counters.
export class FakeTarget {
  constructor(file) { this.file = file; this.mode = 'ok'; }
  state() { return existsSync(this.file) ? JSON.parse(readFileSync(this.file, 'utf8')) : {writes:0, pages:{}}; }
  read(key) { return this.state().pages[key] ?? null; }
  write(key, page, expectedVersion) {
    if (this.mode === 'fail') throw Object.assign(new Error('definitely rejected'), {certain:true});
    const state = this.state();
    if ((state.pages[key]?.version ?? 0) !== expectedVersion) throw Object.assign(new Error('version conflict'), {conflict:true});
    state.writes++;
    state.pages[key] = {...page, id:state.pages[key]?.id ?? `page-${Object.keys(state.pages).length + 1}`, version:expectedVersion + 1};
    writeFileSync(this.file, JSON.stringify(state));
    if (this.mode === 'timeout') throw new Error('response lost after commit');
    return state.pages[key];
  }
  humanEdit(key) {
    const state = this.state();
    state.pages[key].body += ' HUMAN';
    state.pages[key].version++;
    writeFileSync(this.file, JSON.stringify(state));
  }
}
export function publish({snapshot, frozenDigest, approved, grant, target, remote, prior, latest, revoked = false, beforeWrite = () => false}) {
  // The caller supplies synthetic approval solely for model tests; no human identity is fabricated.
  validateSnapshot(snapshot);
  const sha = digest(snapshot);
  const receipt = {status:'pending', snapshotDigest:sha, targetKey:targetKey(target), writes:0};
  if (sha !== frozenDigest || !approved || revoked || !grant || grant.work_id !== snapshot.source.work_id || grant.project_id !== snapshot.project_id) return {...receipt, status:'blocked'};
  const supplemental = grant.snapshot_refs?.includes(sha);
  if (grant.snapshot_refs?.length && !supplemental) return {...receipt,status:'blocked'};
  if ((!supplemental && !snapshot.destinations.some(t => targetKey(t) === targetKey(target))) || !grant.targets.some(t => targetKey(t) === targetKey(target)) || !target.types.includes(snapshot.type)) return {...receipt,status:'blocked'};
  if (prior && (prior.targetKey !== receipt.targetKey || prior.identity !== identity(snapshot))) return {...receipt,status:'conflict'};
  const key = identity(snapshot);
  const desired = {owner:key, revision:snapshot.version, body:JSON.stringify(snapshot.content), snapshotDigest:sha};
  const page = remote.read(key);
  if (page?.revision > snapshot.version) {
    if (latest?.status === 'succeeded' && latest.identity === key && latest.targetKey === receipt.targetKey && latest.readbackDigest === digest(page)) return {...receipt,identity:key,status:'superseded'};
    return {...receipt,identity:key,status:'conflict'};
  }
  if (prior?.status === 'succeeded' && prior.snapshotDigest === sha) return {...prior,writes:0};
  if (page) {
    if (!prior || page.owner !== key) return {...receipt,status:'conflict'};
    if (prior.status === 'unknown') {
      if (page.snapshotDigest === sha && page.body === desired.body) return {...receipt,identity:key,status:'succeeded',page,readbackDigest:digest(page)};
      return {...receipt,identity:key,status:'unknown'};
    }
    if (prior.readbackDigest !== digest(page)) return {...receipt,identity:key,status:'conflict'};
    if (page.revision >= snapshot.version) return {...receipt,identity:key,status:'conflict'};
  } else if (prior?.status === 'unknown') return {...receipt,identity:key,status:'unknown'}; // absent search != proof
  const operation = page ? 'update_owned' : 'create';
  if (!grant.operations.includes(operation) || beforeWrite()) return {...receipt,status:'blocked'};
  receipt.identity = key;
  receipt.attempt_started = true;
  receipt.writes = 1;
  try {
    remote.write(key, desired, page?.version ?? 0);
    const readback = remote.read(key);
    if (!readback || readback.body !== desired.body || readback.snapshotDigest !== sha) return {...receipt,status:'unknown'};
    return {...receipt,status:'succeeded',page:readback,readbackDigest:digest(readback)};
  } catch (error) {
    return {...receipt,status:error.conflict ? 'conflict' : error.certain ? 'failed' : 'unknown'};
  }
}
export function publishBatch(requests) {
  const attempted = new Set();
  return requests.map(request => {
    const key = targetKey(request.target);
    if (attempted.has(key)) return {status:'pending',writes:0};
    const result = publish(request);
    if (result.writes) attempted.add(key);
    return result;
  });
}
export function applicable(snapshot, facts) {
  return snapshot.applicability.every(condition => facts.includes(condition)) && !snapshot.invalid_when.some(condition => facts.includes(condition));
}
