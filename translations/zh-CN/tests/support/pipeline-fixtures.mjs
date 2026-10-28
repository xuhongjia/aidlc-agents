// Synthetic raw GitLab responses for maintainer tests; never company evidence.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { normalizeBuiltins, resolveDefinitions } from './workflow-model.mjs';
import { freezeDelivery, pipelineRequests, collectPipeline } from './pipeline-model.mjs';
const read = name => JSON.parse(readFileSync(new URL('../../' + name, import.meta.url)));
export const hashBytes = value => createHash('sha256').update(value).digest('hex');
export const sourceCommit = 'a'.repeat(40);
export const deployerCommit = 'b'.repeat(40);
export const reference = (path, body = path) => ({ path, sha256: hashBytes(body) });
export const builtins = normalizeBuiltins(read('workflow/stages.json'), read('workflow/stage-contracts.json'), read('manifest.json').version);
const releaseDefinitions = resolveDefinitions(builtins, read('examples/team-packs/release-team/pack.json'));
export function editReport(fixture, id, mutate, phase = 'ci') {
  const binding = fixture[phase], data = fixture[phase + 'Data'];
  const mapping = binding.reports.find(r => r.id === id || r.id === id + '-report'), job = data.jobs.find(j => j.name === mapping.job);
  const report = data.reports.find(r => r.job_id === job.id && r.path === mapping.artifact_path);
  const body = JSON.parse(report.body); mutate(body); report.body = JSON.stringify(body);
}
export function pipelineFixture({ cross = false, workflowId = 'core.enhance' } = {}) {
  const config = read('examples/delivery/gitlab-' + (cross ? 'cross-project' : 'same-project') + '.json').delivery;
  const workflow = releaseDefinitions.workflows.find(w => w.id === workflowId), stages = releaseDefinitions.stages;
  const delivery = freezeDelivery(config, workflow, stages, releaseDefinitions.workflows.map(w => w.id));
  const candidate = { commit: sourceCommit, ref: reference('candidate.json'), scope: ['src'], files: [] };
  const requests = pipelineRequests(delivery, 'verify', candidate);
  const ci = delivery.bindings.find(b => b.phase === 'ci'), cd = delivery.bindings.find(b => b.phase === 'cd');
  const ciPipeline = { id: 10, project_id: 1, sha: sourceCommit, ref: 'main', source: 'push', status: 'success' };
  const configurationBodies = { architecture: 'stages: [test]\narchitecture: {script: check-boundaries}\n', quality: 'stages: [test]\nquality: {script: node --test}\n' };
  const baselines = Object.fromEntries(['architecture', 'quality'].map(kind => [kind, {
    rule_digest: hashBytes('approved-' + kind), configuration_digest: hashBytes(configurationBodies[kind]), rule_ids: [kind + '-rule'],
  }]));
  const job = (name, id, pipe) => ({ id, name, status: 'success', retried: false, allow_failure: false, pipeline: { id: pipe.id, project_id: pipe.project_id },
    commit: { id: pipe.sha }, started_at: '2026-09-30T01:00:00Z', finished_at: '2026-09-30T01:01:00Z' });
  const ciJobs = ci.required_jobs.map((name, i) => job(name, 101 + i, ciPipeline));
  for (const kind of ['architecture', 'quality']) ciJobs.find(j => j.name === kind).configuration_ref = reference('config-' + kind + '.yml', configurationBodies[kind]);
  const artifacts = [{ id: 'app', type: 'image', repository: 'registry.example/app', digest: 'sha256:' + hashBytes('app-build'), digest_type: 'manifest' }];
  const producer = { project_id: 1, pipeline_id: 10, job_id: ciJobs.find(j => j.name === 'build').id, source_commit: sourceCommit };
  const attachments = ['architecture', 'quality'].map(kind => ({ job_id: ciJobs.find(j => j.name === kind).id, path: 'reports/' + kind + '-details.txt',
    body: kind === 'architecture' ? 'Checked src/cli -> src/domain; forbidden imports: 0\n' : 'Executed search-zero and adjacent ordering tests: 2 passed\n', complete: true }));
  const ciData = { complete: true, jobs: ciJobs, attachments, reports: ci.reports.map(report => {
    const body = report.type === 'artifact' ? { producer, artifacts } : { source_commit: sourceCommit, rule_sha256: baselines[report.gate_kind].rule_digest,
      checks: [{ rule_id: report.gate_kind + '-rule', status: 'PASS', executed_count: report.gate_kind === 'quality' ? 2 : 1, skipped_count: 0,
        evidence: [reference(attachments.find(a => a.job_id === ciJobs.find(j => j.name === report.job).id).path, attachments.find(a => a.job_id === ciJobs.find(j => j.name === report.job).id).body)] }] };
    return { job_id: ciJobs.find(j => j.name === report.job).id, path: report.artifact_path, complete: true, body: JSON.stringify(body) };
  }) };
  const fixture = { config, workflow, stages, delivery, candidate, requests, ci, cd, ciPipeline, ciData, baselines, configurationBodies };
  fixture.ciResult = collectPipeline(ci, requests.find(r => r.phase === 'ci'), ciPipeline, ciData, baselines);
  fixture.ciResult.ref = reference('ci-result.json', JSON.stringify(fixture.ciResult));
  fixture.upstream = { ...fixture.ciResult.producer, artifacts: fixture.ciResult.artifacts, status: fixture.ciResult.status, ref: fixture.ciResult.ref };
  if (cd) {
    const cdPipeline = { id: cross ? 20 : 10, project_id: cross ? 2 : 1, sha: cross ? deployerCommit : sourceCommit, ref: 'main', source: cross ? 'pipeline' : 'push', status: 'success' };
    const cdJobs = cd.required_jobs.map((name, i) => job(name, 201 + i, cdPipeline));
    const finishedAt = '2026-09-30T01:05:00Z', observedAt = '2026-09-30T01:06:00Z';
    const deployment = { id: 50, environment: 'test', status: 'success', finished_at: finishedAt, commit: cdPipeline.sha };
    const observed = artifacts.map(a => ({ ...a, deployment_id: 50, environment: 'test', source: 'runtime_observation', observed_at: observedAt }));
    const environmentChecks = ['smoke', 'health'].map(id => ({ id, status: 'PASS', executed_count: 1, skipped_count: 0, deployment_id: 50,
      environment: 'test', observed_at: observedAt, artifact_id: 'app' }));
    fixture.cdPipeline = cdPipeline;
    fixture.cdData = { complete: true, jobs: cross ? cdJobs : [...ciJobs, ...cdJobs], current_deployment_id: 50,
      deployments: [{ id: 50, environment: { name: 'test' }, status: 'success', finished_at: finishedAt, sha: cdPipeline.sha,
        deployable: { id: cdJobs.find(j => j.name === 'deploy').id, pipeline: { id: cdPipeline.id, project_id: cdPipeline.project_id } } }],
      reports: cd.reports.map(report => ({ job_id: cdJobs.find(j => j.name === report.job).id, path: report.artifact_path, complete: true,
        body: JSON.stringify(report.type === 'deployment' ? { upstream: producer, deployments: [deployment] }
          : { upstream: producer, observed_artifacts: observed, environment_checks: environmentChecks }) })) };
    if (!cross) ciData.jobs.push(...cdJobs);
    fixture.ciResult = collectCI(fixture);
    fixture.ciResult.ref = reference('ci-result.json', JSON.stringify(fixture.ciResult));
    fixture.upstream = { ...fixture.ciResult.producer, artifacts: fixture.ciResult.artifacts, status: fixture.ciResult.status, ref: fixture.ciResult.ref };
  }
  return fixture;
}
export const collectCI = f => collectPipeline(f.ci, f.requests.find(r => r.phase === 'ci'), f.ciPipeline, f.ciData, f.baselines);
export const collectCD = f => collectPipeline(f.cd, f.requests.find(r => r.phase === 'cd'), f.cdPipeline, f.cdData, {}, f.upstream);
