# Release Readiness

AIDLC_DRAFT — advice from approved Verify/current candidate.

## Candidate and evidence

Exact candidate, acceptance, dual Gate raw evidence and approved versions; confirm no drift.

Collect source-index.json: repository/commit, PR/MR, pipeline/job/attempt/status, Jira feedback/blockers. Containers: repository@digest, digest type/source and CI-reported versus registry-verified identity; other deliveries name actual artifacts. Trace candidate→artifact and deployed environment/version/time, or unknown/not_deployed.

With CD bindings, link pipeline-result, target environment/deployment ID, running artifact, required smoke/health and observation time. Actual success is required; pending deployment is not verified. Pre-deployment readiness criteria apply only without CD.

## Readiness checks

| Item | Verified fact/gap | Source/responsible role |
|---|---|---|

Artifacts, config/secrets, migration, rollback, monitoring, runbooks/support. Justify inapplicability; never prefill PASS.

## Release and observation advice

Environment, prerequisites, rollback triggers, window and separately approved actions. No invented environments, staffing, dates or business metrics.

## Decision boundaries

Recommend ready/blocked for human review. Readiness approval is not authority to push/merge/publish/migrate/deploy. Without actual release/business observations, subsequent Outcome stays unknown.
