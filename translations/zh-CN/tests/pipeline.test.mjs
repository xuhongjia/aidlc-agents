import test from 'node:test';
import assert from 'node:assert/strict';
import { digest } from './support/workflow-model.mjs';
import { validateDelivery, freezeDelivery, pipelineRequests, resolvePipeline, inspectPipeline, collectPipeline } from './support/pipeline-model.mjs';
import { pipelineFixture, collectCI, collectCD, editReport, builtins, sourceCommit, deployerCommit } from './support/pipeline-fixtures.mjs';
const copy = value => structuredClone(value);

test('delivery defaults disabled; configured examples freeze without changing compact stage/body contracts', () => {
  assert.equal(validateDelivery(null), null);
  for (const cross of [false, true]) for (const workflowId of ['core.fix', 'core.enhance', 'core.standard', 'team.verified-release']) {
    const f = pipelineFixture({ cross, workflowId });
    assert.equal(validateDelivery(f.config), f.config);
    assert.equal(f.delivery.steps.find(s => s.step_id === 'verify').binding_ids.length, ['core.standard', 'team.verified-release'].includes(workflowId) ? 1 : 2);
    if (workflowId === 'team.verified-release') assert.equal(f.delivery.steps.find(s => s.step_id === 'release').binding_ids.length, 1);
    else if (workflowId === 'core.standard') {
      assert.equal(f.delivery.steps.some(s => s.step_id === 'release'), false);
      assert.equal(f.delivery.bindings.some(b => b.phase === 'cd'), false);
    }
    else {
      assert.equal(f.workflow.nodes.length, 3);
      const names = f.workflow.nodes.flatMap(n => (n.outputs ?? f.stages.find(s => s.id === n.stage_id).outputs).map(o => o.name));
      assert.deepEqual([...new Set(names)].sort(), ['change.md', 'verification.md']);
    }
  }
});
test('configuration rejects approval cycles, unsafe mappings, unknown provider, empty and invalid budgets', () => {
  for (const mutate of [
    c => { c.bindings[1].approval_dependency = 'verify_final'; },
    c => { c.bindings[0].reports[0].artifact_path = '../escape'; },
    c => { c.bindings[0].reports[0].mapping.checks = '__proto__.checks'; },
    c => { c.bindings[0].reports[0].mapping.checks = 'run()'; },
    c => { c.bindings[0].reports[0].mapping = JSON.parse('{"__proto__":"metadata"}'); },
    c => { c.bindings[0].provider = 'unknown'; },
    c => { c.bindings[0].project = -1; },
    c => { c.bindings[0].reports[0].type = 'deployment'; },
    c => { c.bindings[0].required_jobs = []; },
    c => { c.wait.timeout_seconds = Infinity; },
    c => { c.wait.interval_seconds = 0; },
    c => { c.bindings.push(copy(c.bindings[0])); },
    c => { c.bindings[1].selector.upstream_binding = 'missing-ci'; },
  ]) {
    const config = copy(pipelineFixture().config); mutate(config); assert.throws(() => validateDelivery(config));
  }
});
test('team DAG selectors are exact and require evidence.read; CI-only Gates need both report mappings', () => {
  const f = pipelineFixture();
  const workflow = copy(f.workflow); workflow.id = 'team.hotfix'; workflow.nodes.find(n => n.step_id === 'verify').step_id = 'team-check';
  const config = copy(f.config);
  config.bindings.forEach(b => { b.apply_to = [{ kind: 'verification', workflow_ids: ['team.hotfix'], step_ids: ['team-check'] }]; });
  const frozen = freezeDelivery(config, workflow, f.stages, ['team.hotfix']);
  assert.equal(frozen.steps.find(s => s.step_id === 'team-check').binding_ids.length, 2);
  assert.equal(freezeDelivery(config, f.workflow, f.stages), null);
  assert.throws(() => freezeDelivery(config, workflow, f.stages, ['team.other']), /unknown pipeline workflow/);
  config.bindings[0].apply_to[0].step_ids = ['typo'];
  assert.throws(() => freezeDelivery(config, workflow, f.stages), /incompatible pipeline step/);
  const stages = copy(f.stages); stages.find(s => s.kind === 'verification').capabilities = [];
  assert.throws(() => freezeDelivery(f.config, f.workflow, stages), /evidence.read/);
  const ciMode = copy(f.config); ciMode.gate_mode = 'ci';
  assert.ok(freezeDelivery(ciMode, f.workflow, f.stages));
  ciMode.bindings[0].reports = ciMode.bindings[0].reports.filter(r => r.gate_kind !== 'architecture');
  assert.throws(() => freezeDelivery(ciMode, f.workflow, f.stages), /both Gate/);
});
test('same Verify freezes producer dependency before CI exists; CD resolves actual artifact without dispatch mutation', () => {
  const f = pipelineFixture(), before = digest(f.requests), cdRequest = f.requests.find(r => r.phase === 'cd');
  assert.equal(cdRequest.upstream_binding, f.ci.id); assert.deepEqual(cdRequest.expected_artifacts, []);
  assert.equal(collectCI(f).status, 'PASS'); assert.equal(collectCD(f).status, 'PASS');
  assert.equal(digest(f.requests), before);
  assert.equal(resolvePipeline(f.cd, cdRequest, [f.cdPipeline], { projectId: 1, upstream: f.upstream }).id, f.ciPipeline.id);
  const standard = pipelineFixture({ workflowId: 'core.standard' });
  assert.deepEqual(pipelineRequests(standard.delivery, 'release', standard.candidate), []);
  const extended = pipelineFixture({ workflowId: 'team.verified-release' });
  assert.throws(() => pipelineRequests(extended.delivery, 'release', extended.candidate), /outside this step/);
  const release = pipelineRequests(extended.delivery, 'release', extended.candidate, [extended.ciResult]);
  assert.equal(release[0].upstream_result_refs.length, 1); assert.deepEqual(release[0].expected_artifacts, extended.ciResult.artifacts);
  assert.throws(() => pipelineRequests(extended.delivery, 'release', extended.candidate, [{ ...extended.ciResult, status: 'FAIL' }]), /upstream artifact/);
});
test('pipeline selection uses exact candidate/ref/source and newest matching run, not old green or branch artifacts', () => {
  const f = pipelineFixture(), req = f.requests[0];
  const newest = { ...f.ciPipeline, id: 11, status: 'failed' }, unrelated = { ...f.ciPipeline, id: 12, sha: deployerCommit };
  const selected = resolvePipeline(f.ci, req, [f.ciPipeline, newest, unrelated], { projectId: 1 });
  assert.equal(selected.id, 11); assert.equal(inspectPipeline(f.ci, selected, []).status, 'FAIL');
  assert.equal(resolvePipeline(f.ci, req, [unrelated], { projectId: 1 }), null);
  for (const patch of [{ project_id: 2 }, { ref: 'other' }, { source: 'web' }]) assert.equal(resolvePipeline(f.ci, req, [{ ...f.ciPipeline, ...patch }], { projectId: 1 }), null);
  const explicit = copy(f.ci); explicit.selector.pipeline_id = 10;
  assert.throws(() => resolvePipeline(explicit, { ...req, binding_digest: digest(explicit) }, [f.ciPipeline, newest], { projectId: 1 }), /old pipeline/);
  assert.throws(() => resolvePipeline(f.ci, req, [f.ciPipeline, f.ciPipeline], { projectId: 1 }), /ambiguous/);
});
test('parent-child and cross-project CD resolution proves upstream lineage, not deployer SHA equality', () => {
  const f = pipelineFixture({ cross: true }), req = f.requests.find(r => r.phase === 'cd');
  const links = [{ project_id: 2, pipeline_id: 20, upstream: f.ciResult.producer }];
  assert.equal(resolvePipeline(f.cd, req, [f.cdPipeline], { projectId: 2, upstream: f.upstream, links }).sha, deployerCommit);
  assert.equal(resolvePipeline(f.cd, req, [f.cdPipeline], { projectId: 2, upstream: f.upstream, links: [] }), null);
  const child = copy(f.cd); child.selector.sources = ['parent_pipeline'];
  const childPipeline = { ...f.cdPipeline, project_id: 1, source: 'parent_pipeline' };
  assert.equal(resolvePipeline(child, { ...req, binding_digest: digest(child) }, [childPipeline], {
    projectId: 1, upstream: f.upstream, links: [{ ...links[0], project_id: 1 }],
  }).id, 20);
  assert.throws(() => resolvePipeline(f.cd, req, [f.cdPipeline], { projectId: 2, upstream: { ...f.upstream, source_commit: deployerCommit }, links }), /candidate mismatch/);
  assert.equal(collectCD(f).status, 'PASS');
});
test('required jobs keep retry history and do not accept a previous success, allow_failure, skips or ambiguous matrix jobs', () => {
  const f = pipelineFixture();
  const previous = copy(f.ciData.jobs[0]); previous.retried = true;
  const retry = { ...previous, id: 150, retried: false, status: 'failed', allow_failure: true };
  const failed = inspectPipeline(f.ci, f.ciPipeline, [previous, retry, ...f.ciData.jobs.slice(1)]);
  assert.equal(failed.status, 'FAIL'); assert.equal(failed.jobs[0].id, 150);
  retry.status = 'success';
  const success = inspectPipeline(f.ci, f.ciPipeline, [previous, retry, ...f.ciData.jobs.slice(1)]);
  assert.equal(success.status, 'READY'); assert.equal(success.attempts.length, f.ciData.jobs.length + 1);
  for (const status of ['failed', 'canceled', 'skipped']) {
    const jobs = copy(f.ciData.jobs); jobs[0].status = status; jobs[0].allow_failure = true;
    assert.equal(inspectPipeline(f.ci, f.ciPipeline, jobs).status, 'FAIL');
  }
  assert.throws(() => inspectPipeline(f.ci, f.ciPipeline, f.ciData.jobs, { complete: false }), /pagination/);
  assert.throws(() => inspectPipeline(f.ci, f.ciPipeline, f.ciData.jobs.slice(1)), /missing/);
  assert.throws(() => inspectPipeline(f.ci, f.ciPipeline, [...f.ciData.jobs, { ...f.ciData.jobs[0], id: 160 }]), /ambiguous/);
});
test('pending, running and manual jobs return wait, never textual PASS', () => {
  for (const status of ['created', 'pending', 'running', 'manual', 'waiting_for_resource', 'scheduled']) {
    const f = pipelineFixture(); f.ciData.jobs[0].status = status;
    assert.equal(collectCI(f).status, 'WAITING');
  }
  const f = pipelineFixture(); f.ciPipeline.status = 'running'; f.ciData.jobs[0].status = 'pending'; f.ciData.jobs[1].status = 'failed';
  assert.equal(collectCI(f).status, 'FAIL', 'a pending earlier job cannot hide another required failure');
  f.ciData.jobs[1].status = 'manual';
  assert.equal(inspectPipeline(f.ci, f.ciPipeline, f.ciData.jobs).reason, 'manual');
});
test('completed CI jobs can be collected while the same pipeline waits on downstream CD approval', () => {
  const f = pipelineFixture(); f.ciPipeline.status = f.cdPipeline.status = 'manual';
  f.ciData.jobs.find(j => j.name === 'deploy').status = 'manual';
  assert.equal(collectCI(f).status, 'PASS'); assert.equal(collectCD(f).status, 'WAITING');
  assert.equal(f.ciPipeline.id, f.cdPipeline.id);
});
test('collected reports bind latest successful attempt while retaining older attempt evidence', () => {
  const f = pipelineFixture(), old = f.ciData.jobs[0]; old.retried = true;
  const retry = { ...copy(old), id: 150, retried: false };
  f.ciData.jobs.push(retry); f.ciData.reports[0].job_id = 150; f.ciData.attachments[0].job_id = 150;
  const result = collectCI(f);
  assert.equal(result.status, 'PASS'); assert.equal(result.gate_evidence[0].execution.job_id, 150);
  assert.deepEqual(result.jobs.filter(j => j.name === 'architecture').map(j => j.id), [101, 150]);
});
test('CI Gate evidence requires actual rule/config/candidate identities and nonzero mapped complete raw evidence', () => {
  for (const mutate of [
    f => { f.ciPipeline.sha = deployerCommit; },
    f => { f.ciData.jobs[0].commit.id = deployerCommit; },
    f => { f.ciData.jobs[0].configuration_ref.sha256 = '0'.repeat(64); },
    f => editReport(f, 'architecture', r => { r.source_commit = deployerCommit; }),
    f => editReport(f, 'architecture', r => { r.rule_sha256 = '0'.repeat(64); }),
    f => editReport(f, 'architecture', r => { r.checks = []; }),
    f => editReport(f, 'architecture', r => { r.checks[0].executed_count = 0; }),
    f => editReport(f, 'architecture', r => { r.checks[0].skipped_count = 1; }),
    f => editReport(f, 'architecture', r => { r.checks[0].rule_id = 'unrelated'; }),
    f => { f.ciData.reports[0].truncated = true; },
    f => { f.ciData.reports[0].complete = false; },
    f => { f.ciData.reports[0].job_id = 999; },
    f => { f.ciData.reports[0].expired = true; },
    f => { f.ciData.attachments = []; },
    f => { f.ciData.attachments[0].body = 'PASS'; },
    f => { f.ciData.attachments[0].truncated = true; },
  ]) { const f = pipelineFixture(); mutate(f); assert.throws(() => collectCI(f)); }
  const failure = pipelineFixture(); editReport(failure, 'architecture', r => { r.checks[0].status = 'FAIL'; });
  assert.equal(collectCI(failure).status, 'FAIL');
});
test('configured nested/member report mapping is data, not code or an assumed standard schema', () => {
  const f = pipelineFixture(), report = f.ci.reports[0];
  const raw = JSON.parse(f.ciData.reports[0].body), row = raw.checks[0];
  f.ciData.reports[0].body = JSON.stringify({ build: { sha: raw.source_commit }, rules: { hash: raw.rule_sha256 }, rows: [{ identity: row.rule_id, verdict: row.status, counts: { executed: row.executed_count, skipped: 0 }, raw: row.evidence }] });
  report.mapping = { candidate_commit: 'build.sha', rule_digest: 'rules.hash', checks: 'rows', 'checks.rule_id': 'identity', 'checks.status': 'verdict',
    'checks.executed_count': 'counts.executed', 'checks.skipped_count': 'counts.skipped', 'checks.evidence': 'raw' };
  f.requests.find(r => r.phase === 'ci').binding_digest = digest(f.ci);
  assert.equal(collectCI(f).gate_evidence[0].checks[0].rule_id, 'architecture-rule');
});
test('artifact metadata member mappings normalize actual nested fields without interpreting arbitrary logical keys', () => {
  const f = pipelineFixture(), report = f.ci.reports.find(r => r.type === 'artifact');
  const raw = JSON.parse(f.ciData.reports.find(r => r.path === report.artifact_path).body);
  editReport(f, 'build', r => { r.artifacts = r.artifacts.map(a => ({ ...a, image: { repository: a.repository, hash: a.digest } }));
    r.artifacts.forEach(a => { delete a.repository; delete a.digest; }); });
  report.mapping['artifacts.repository'] = 'image.repository'; report.mapping['artifacts.digest'] = 'image.hash';
  f.requests.find(r => r.phase === 'ci').binding_digest = digest(f.ci);
  assert.deepEqual(collectCI(f).artifacts.map(a => a.digest), raw.artifacts.map(a => a.digest));
  report.mapping['artifacts.__proto__'] = 'image'; assert.throws(() => validateDelivery(f.delivery), /logical mapping/);
});
test('post-deploy PASS needs actual current environment, immutable runtime digest and required nonzero health/smoke', () => {
  assert.equal(collectCD(pipelineFixture()).status, 'PASS');
  for (const mutate of [
    f => { f.cdData.current_deployment_id = 51; },
    f => { f.cdData.deployments[0].environment.name = 'prod'; },
    f => { f.cdData.deployments[0].status = 'failed'; },
    f => { f.cdData.deployments[0].deployable.pipeline.project_id = 9; },
    f => { f.cdData.deployments[0].deployable.id = 999; },
    f => editReport(f, 'deployment', r => { r.upstream.pipeline_id = 9; }, 'cd'),
    f => editReport(f, 'environment', r => { r.observed_artifacts[0].digest = 'sha256:' + '0'.repeat(64); }, 'cd'),
    f => editReport(f, 'environment', r => { r.observed_artifacts[0].digest_type = 'index'; }, 'cd'),
    f => editReport(f, 'environment', r => { r.observed_artifacts[0].source = 'deploy_parameter'; }, 'cd'),
    f => editReport(f, 'environment', r => { r.observed_artifacts[0].observed_at = '2026-09-30T00:00:00Z'; }, 'cd'),
    f => editReport(f, 'environment', r => { r.environment_checks.pop(); }, 'cd'),
    f => editReport(f, 'environment', r => { r.environment_checks[0].executed_count = 0; }, 'cd'),
    f => editReport(f, 'environment', r => { r.environment_checks[0].skipped_count = 1; }, 'cd'),
    f => editReport(f, 'environment', r => { r.environment_checks[0].deployment_id = 51; }, 'cd'),
    f => { f.cdData.reports[1].truncated = true; },
  ]) { const f = pipelineFixture(); mutate(f); assert.throws(() => collectCD(f)); }
  const f = pipelineFixture(); editReport(f, 'environment', r => { r.environment_checks[0].status = 'FAIL'; }, 'cd');
  assert.equal(collectCD(f).status, 'FAIL');
});
test('pushed images without runtime observations or matching approved producer cannot pass CD', () => {
  const f = pipelineFixture(); editReport(f, 'environment', r => { r.observed_artifacts = []; }, 'cd');
  assert.throws(() => collectCD(f), /artifact set mismatch/);
  const g = pipelineFixture(); g.upstream.status = 'FAIL'; assert.throws(() => collectCD(g), /lineage/);
  const h = pipelineFixture(); editReport(h, 'build', r => { r.producer.source_commit = deployerCommit; }); assert.throws(() => collectCI(h), /producer mismatch/);
});
test('configured stage read operations can supply runtime observations without changing the company pipeline', () => {
  const f = pipelineFixture(), tool = { id: 'team.runtime-read', connector: 'runtime', operation: 'observe', effect: 'read', target: 'test/app',
    input_contract: 'team.runtime-input', output_contract: 'team.runtime-output', authorization_ref: null };
  const original = JSON.parse(f.cdData.reports[1].body);
  const config = copy(f.config), cd = config.bindings.find(b => b.phase === 'cd');
  cd.reports = cd.reports.filter(r => r.type !== 'environment'); cd.environment.observation_tool_binding_ids = [tool.id];
  const stages = copy(f.stages); stages.find(s => s.kind === 'verification').tool_binding_ids = [tool.id];
  const delivery = freezeDelivery(config, f.workflow, stages, null, [tool]);
  const request = pipelineRequests(delivery, 'verify', f.candidate, [], [tool]).find(r => r.phase === 'cd');
  const data = copy(f.cdData); data.reports = data.reports.slice(0, 1);
  data.observations = [{ binding_id: tool.id, tool_binding_digest: digest(tool), complete: true,
    input: { environment: 'test', deployment_id: 50, candidate_commit: sourceCommit },
    body: JSON.stringify({ environment: 'test', source_commit: sourceCommit, observed_artifacts: original.observed_artifacts, environment_checks: original.environment_checks }) }];
  const result = collectPipeline(cd, request, f.cdPipeline, data, {}, f.upstream);
  assert.equal(result.status, 'PASS'); assert.ok(result.sources.some(s => s.id === 'observation:' + tool.id));
  assert.throws(() => freezeDelivery(config, f.workflow, f.stages, null, [tool]), /registered stage read/);
  assert.throws(() => freezeDelivery(config, f.workflow, stages, null, [{ ...tool, effect: 'write' }]), /registered stage read/);
  for (const patch of [{ tool_binding_digest: 'wrong' }, { complete: false }, { truncated: true }, { input: { environment: 'prod' } }]) {
    const changed = copy(data); Object.assign(changed.observations[0], patch);
    assert.throws(() => collectPipeline(cd, request, f.cdPipeline, changed, {}, f.upstream), /observation scope/);
  }
});
