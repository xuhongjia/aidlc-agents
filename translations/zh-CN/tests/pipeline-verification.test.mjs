import test from 'node:test';
import assert from 'node:assert/strict';
import { digest, validateVerification } from './support/workflow-model.mjs';
import { pipelineFixture, reference, sourceCommit } from './support/pipeline-fixtures.mjs';
const copy = value => structuredClone(value);
function fixture() {
  const f = pipelineFixture(), raw_files = {}, remote_evidence = [], approved_remote = {};
  const store = (path, data) => { const body = typeof data === 'string' ? data : JSON.stringify(data); raw_files[path] = Buffer.from(body); return reference(path, body); };
  const candidate = { work_id: 'work', lock_digest: 'lock', digest: 'candidate-v1', commit: sourceCommit, implementation_runs: [{ run_id: 'impl-1', actor: 'developer' }] };
  const verification = { work_id: candidate.work_id, lock_digest: candidate.lock_digest, candidate_digest: candidate.digest,
    step_id: 'verify', revision: 1, input_digest: 'approved-inputs', baseline_digest: 'approved-rules', run_id: 'verify-2', actor: 'verifier-2', gates: [] };
  for (const gate of f.ciResult.gate_evidence) {
    const kind = gate.kind, job = f.ciData.jobs.find(j => j.name === kind), report = f.ciData.reports.find(r => r.job_id === job.id);
    const execution = copy(gate.execution);
    const configuration_ref = store(execution.configuration_ref.path, f.configurationBodies[kind]);
    execution.configuration_ref = configuration_ref;
    const pipeline_ref = store('raw/' + kind + '-pipeline.json', f.ciPipeline), job_ref = store('raw/' + kind + '-job.json', job);
    const report_ref = store('raw/' + kind + '-report.json', report.body);
    const detail = f.ciData.attachments.find(a => a.job_id === job.id), detail_ref = store('raw/' + kind + '-detail.txt', detail.body);
    const refs = [pipeline_ref, job_ref, report_ref, configuration_ref, detail_ref];
    remote_evidence.push({ kind, execution, pipeline_ref, job_ref, report_ref });
    approved_remote[kind] = { ...f.baselines[kind], project_id: 1, job_name: kind };
    verification.gates.push({ kind, work_id: candidate.work_id, lock_digest: candidate.lock_digest, candidate_digest: candidate.digest,
      run_id: verification.run_id, actor: verification.actor, status: 'PASS', checks: [{ blocking: true, status: 'PASS', command: 'gitlab:1:' + kind,
        executed_count: gate.checks.reduce((sum, c) => sum + c.executed_count, 0), skipped_count: 0, exit_code: null, cwd: null, execution,
        raw_evidence: refs, evidence_digest: digest(refs), rule_evidence: gate.checks.map(c => ({ rule_id: c.rule_id, evidence_refs: [detail_ref.path] })) }] });
  }
  return { candidate, verification, store, options: { approved_commands: ['gitlab:1:architecture', 'gitlab:1:quality', 'check-quality'], raw_files, remote_evidence, approved_remote } };
}
test('independent Verify accepts full approved CI Gate sources without fabricated local exit codes', () => {
  const f = fixture(); assert.equal(validateVerification(f.verification, f.candidate, f.options), true);
  assert.ok(f.verification.gates.every(g => g.checks[0].exit_code === null));
});
test('hybrid verification combines approved remote architecture evidence and actual local quality execution', () => {
  const f = fixture(), quality = f.verification.gates.find(g => g.kind === 'quality').checks[0];
  delete quality.execution; quality.command = 'check-quality'; quality.exit_code = 0;
  assert.equal(validateVerification(f.verification, f.candidate, f.options), true);
  const custom = fixture(), proof = custom.options.remote_evidence[1], raw = JSON.parse(custom.options.raw_files[proof.report_ref.path]);
  const moved = { metadata: { sha: raw.source_commit, rules: raw.rule_sha256 }, results: raw.checks.map(r => ({ id: r.rule_id, verdict: r.status, ran: r.executed_count, skipped: r.skipped_count })) };
  custom.options.approved_remote.quality.report_mapping = { candidate_commit: 'metadata.sha', rule_digest: 'metadata.rules', checks: 'results',
    'checks.rule_id': 'id', 'checks.status': 'verdict', 'checks.executed_count': 'ran', 'checks.skipped_count': 'skipped' };
  proof.report_ref = custom.store(proof.report_ref.path, moved); custom.verification.gates[1].checks[0].raw_evidence[2] = proof.report_ref;
  assert.equal(validateVerification(custom.verification, custom.candidate, custom.options), true);
});
test('normalized remote PASS cannot cover absent proofs, altered source status, rule identity or raw bytes', () => {
  for (const mutate of [
    f => { f.options.remote_evidence = []; },
    f => { f.options.approved_remote.architecture.configuration_digest = '0'.repeat(64); },
    f => { f.verification.gates[0].checks[0].execution.job_id = 999; },
    f => { f.verification.gates[0].checks[0].exit_code = 0; },
    f => { f.verification.gates[0].checks[0].executed_count = 0; },
    f => { f.verification.gates[0].checks[0].rule_evidence = [{ rule_id: 'unrelated', evidence_refs: ['raw/architecture-detail.txt'] }]; },
    f => { delete f.options.raw_files['raw/architecture-report.json']; },
    f => { f.options.raw_files['raw/architecture-detail.txt'] = Buffer.from('PASS'); },
    f => { const proof = f.options.remote_evidence[0]; const job = JSON.parse(f.options.raw_files[proof.job_ref.path]); job.status = 'failed';
      proof.job_ref = f.store(proof.job_ref.path, job); f.verification.gates[0].checks[0].raw_evidence[1] = proof.job_ref; },
    f => { const proof = f.options.remote_evidence[0]; const report = JSON.parse(f.options.raw_files[proof.report_ref.path]); report.checks[0].executed_count = 0;
      proof.report_ref = f.store(proof.report_ref.path, report); f.verification.gates[0].checks[0].raw_evidence[2] = proof.report_ref; },
  ]) { const f = fixture(); mutate(f); assert.throws(() => validateVerification(f.verification, f.candidate, f.options)); }
});
test('waiting continuation preserves a genuine prior Gate producer and requires unchanged inputs/rules and original bytes', () => {
  const f = fixture(), gate = f.verification.gates[0]; gate.run_id = 'verify-1'; gate.actor = 'verifier-1';
  const gate_ref = f.store('prior/architecture-gate.json', gate);
  const origin = { ...f.verification, actor: gate.actor, run_id: gate.run_id, gate_ref, gate_digest: digest(gate) }; delete origin.gates;
  f.options.execution_refs = [origin];
  assert.equal(validateVerification(f.verification, f.candidate, f.options), true);
  assert.equal(gate.run_id, 'verify-1'); assert.equal(gate.actor, 'verifier-1');
  for (const field of ['revision', 'input_digest', 'baseline_digest', 'candidate_digest', 'step_id', 'actor']) {
    const options = copy(f.options); options.execution_refs[0][field] = 'drifted';
    assert.throws(() => validateVerification(f.verification, f.candidate, options), /lineage/);
  }
  f.options.raw_files[gate_ref.path] = Buffer.from('PASS');
  assert.throws(() => validateVerification(f.verification, f.candidate, f.options), /raw evidence bytes/);
});
