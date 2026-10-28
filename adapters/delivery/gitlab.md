# GitLab · read-only CI/CD adapter

Prefer connected read-only host tools, then authenticated glab API or existing secure HTTPS GET. Resolve host from actual connection/project URL; support GitLab.com/Self-Managed and URL-encode project paths. Map actual schemas, not package Interface names. dispatch.external_reads limits all calls, including downstream projects. Retain TLS/authentication; never bypass certificates or read/print credentials/full CI variables.

| Interface | GitLab REST v4 GET |
|---|---|
| Resolve CI | /projects/:id/pipelines?sha=:candidate_commit with ref/source/pagination; verify /projects/:id/pipelines/:pipeline_id |
| Jobs | /projects/:id/pipelines/:pipeline_id/jobs?include_retried=true, all pages; retain ID/attempt/allow_failure |
| Downstream | /projects/:id/pipelines/:pipeline_id/trigger_jobs or confirmed older bridges; verify downstream_pipeline project/lineage. Trigger success is not downstream PASS |
| Evidence | /projects/:id/jobs/:job_id/artifacts/:artifact_path and needed trace; pipeline test_report/test_report_summary JUnit must match build_ids/exact jobs/original reports |
| Environment | /projects/:id/deployments, /projects/:id/deployments/:deployment_id, /projects/:id/environments/:environment_id; verify exact environment/current relevant deployment |

Select newest matching run by ID/creation order. Explicit IDs still require candidate/source matching. No branch/latest-successful artifact shortcuts. Prefer newest job attempts, retain history; unresolved same-name matrix jobs are ambiguous. Partial pages/truncation cannot prove absence.

Waiting: created/preparing/waiting_for_resource/waiting_for_callback/pending/running/scheduled/manual/blocked. Required failed/canceled/skipped jobs cannot pass, even with allow_failure=true, optional manual jobs or overall pipeline success.

CI commit equals product candidate. Separate CD retains deployer sha and proves upstream project/pipeline/job/source_commit plus actual runtime immutable artifact through approved mappings; deployer sha need not equal product sha. Do not select a deployment by ref/environment success alone. Missing lineage/observations blocks; request structured job evidence.

Deployment API status/commit is not runtime digest/health. Reports must observe artifacts, environment_checks, deployment ID, observed_at and current deployment, not merely repeat expected digest. Match container index/platform digest granularity; use immutable hashes/artifacts for other delivery.

Save redacted raw responses, retrieval times and source-index object ID/link/source_updated_at/sha256. Use authorized artifact downloads without forwarding credentials across domains. 401/403 is a permission gap; distinguish missing objects/reports from unsupported endpoints on 404, confirming capability before bridges fallback. 429/transient failures follow the wait deadline. Notify required manual action; never play/approve/retry/cancel/trigger jobs.

Follow actual instance capabilities: [Pipelines](https://docs.gitlab.com/api/pipelines/) · [Jobs](https://docs.gitlab.com/api/jobs/) · [Artifacts](https://docs.gitlab.com/api/job_artifacts/) · [Deployments](https://docs.gitlab.com/api/deployments/) · [Environments](https://docs.gitlab.com/api/environments/) · [Deployment approvals](https://docs.gitlab.com/ci/environments/deployment_approvals/)
