# Validate with company CI/CD

Follow [setup/authentication](../bootstrap/pipelines.md). [Same-project](../examples/delivery/gitlab-same-project.json) and [cross-project](../examples/delivery/gitlab-cross-project.json) examples enable short-workflow CD; for standard release only, remove core.fix/core.enhance from CD.apply_to while retaining CI. Replace all example project/job/path/field values with actual configuration.

## Run validation

```text
Use aidlc fix for this issue: …. Use the configured company CI/CD validation.
In final Verify, check the actual deployment, artifacts, and smoke/health in test.
List the pipeline scope and wait deadline in the first card; use host wakeups after approval.
```

Standard Verify checks CI and ends at verified handoff; CD needs a selected release chain such as [team.verified-release](../examples/team-packs/release-team/README.md). Explicit short-route CD joins Verify, retaining three stages and change.md/verification.md. Bind by kind/workflow/step, not labels; independent Reviewers check each Gate. Old work keeps its release lock.

First card freezes target/jobs/rules/mappings/environment/gate_mode/deadline. Pending CI/CD sets waiting_external and releases the worker; review waits for all required results. Staff handle GitLab manual jobs/approvals; AIDLC reads/waits. If CD needs Verify approval, place release_readiness afterward to avoid a cycle.

## Inputs, outputs, and report mappings

Read [pipeline-config](../workflow/pipeline-config.md) and the [GitLab adapter](../adapters/delivery/gitlab.md). Config selects bindings; execution supplies candidate/expected artifacts. Never substitute latest branch green. Keep deployment-repository and product commits distinct.

report.mapping uses actual dot paths, e.g. candidate_commit→metadata.source_sha, checks→results. Members default to contract names; override checks.rule_id/checks.executed_count, artifacts.digest, producer.source_commit only if different, relative to each member. Retain top-level checks/artifacts/producer mappings/raw output. Only contract keys are valid; no script/arbitrary-key interpretation. Unknown semantics block.

| Content | Required semantics from real reports |
|---|---|
| Gate | source_commit, rule_sha256, checks[{rule_id,status,executed_count,skipped_count,evidence}]; effective job configuration/rule sources match approved Fitness. evidence is real assertion output, not AI self-assessment |
| CI artifacts | producer{project_id,pipeline_id,job_id,source_commit}, artifacts[{id,type,repository,digest,digest_type}]; record real URI/hash for non-containers |
| CD deployment | upstream{project_id,pipeline_id,job_id,source_commit}, deployments[{id,environment,status,finished_at,commit}]; compare with GitLab deployment |
| Environment observations | observed_artifacts[{id,type,deployment_id,environment,repository,digest,digest_type,observed_at,source}], with a genuine runtime_observation source; use URI/hash for non-containers. environment_checks[{id,status,executed_count,skipped_count,deployment_id,environment,observed_at,artifact_id}], checked against the current deployment |

Gate evidence [{path,sha256}] points to same-job assertions: download by exact job ID and verify hashes. Embedded assertions may use a controlled raw-location index. Nonempty text/AI PASS is not evidence; mappings generate no facts.

One pipeline may have distinct CI/CD job sets; manual deployment still waits after CI. Separate pipelines need a real upstream relationship, not an inferred deployment commit. Before CI results, same-Verify CD freezes only upstream binding; later check actual artifacts without prefilling digests or changing dispatch.

Without a runtime report, register an actual authorized read ToolBinding in the team Stage and environment.observation_tool_binding_ids. Bind inputs/raw observations to candidate/environment/deployment. Config grants no reads; lacking report/authorized query leaves deployment unverified.

JUnit may map quality rules; counts/green pipelines prove neither architecture nor all AC. Missing config/rule identity/reports require executable checks/evidence via authorized implementation. This Skill does not edit company pipelines.

gate_mode=local uses the existing local dual Gates plus required CI/CD checks; ci uses CI Gates satisfying all approved rules; hybrid selects valid remote/local evidence per rule. Do not rerun a check already valid for this candidate; local success cannot override a required CI failure.

Store results in evidence/pipelines/BINDING/pipeline-result.json and source-index; main documents link key states/artifacts/environments/sources. Collection completion is not PASS. Distinguish CI digests, registry checks, runtime observations.

## Waiting, recovery, and stopping

Default native_wakeup: 5-minute checks, 2-hour deadline, one monitor per work. config.delivery.wait changes affect new work only. Missing capability/failed registration preserves waits and reports unavailable, never automatic recovery.

```text
Continue aidlc REQ-001. Check waiting results under the original lock and approvals;
keep the original candidate and deadline.
```

```text
Stop waiting for REQ-001. Stop the local host monitor and retain the request and evidence.
```

```text
Extend REQ-001's wait deadline by 1 hour. Retain the original deadline and history;
do not change the candidate, rules, or read scope.
```

Wakeups check lightweight status only. Dispatch a new child for the same stage only when terminal/failure evidence must be collected. Reuse valid Gate/self-test evidence after checking identity and digests. Remain quiet while status is unchanged; notify on the first required human action, failure, permission problem, timeout, or completion. Manual mode still waits for approval after collection; automatic mode remains limited by the original delegation.

“Stop waiting” retains the work, which can resume explicitly later. “Return to manual” revokes automatic continuation and cleans up monitors. “Close the current work for REQ-001” follows [closure](../workflow/closure.md), cleaning up monitors/workers while preserving the real delivery state. None of these operations cancels company CI/CD. Existing requests retain their original method; configuration/upgrades do not append bindings or migrate historical approvals.
