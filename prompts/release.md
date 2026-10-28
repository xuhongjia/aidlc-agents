# Release · Readiness and environment evidence

Read approved candidate/valid verification. Under workflow/external-evidence.md query bound Git/CI/Jira read-only for commit, PR/MR, required jobs, artifacts and acceptance/blocking feedback before reporting gaps. Link full repository@digest to job/commit; distinguish CI claims, registry verification and deployment.

With pipeline_requests, follow workflow/pipelines.md to verify target environment, running artifact and smoke/health results. Incomplete means waiting_external; required bound CD evidence cannot be waived as readiness.

Deliver release-readiness.md and source-index/raw snapshots: changes, AC conclusions, limits, config/secret sources (no values), migration impact, operations/rollback triggers, observation metrics and owners/unassigned responsibilities. Identify untested procedures.

Separate technical verification, UAT/business acceptance, release authorization and deployment. Documents cannot override drift/blockers; stage approval authorizes no push/merge/deploy.
