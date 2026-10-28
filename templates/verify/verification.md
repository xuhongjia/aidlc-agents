# Verification

AIDLC_DRAFT — report approved checks on the exact candidate; unexecuted checks stay unexecuted.

## Verification identity

Approved Spec, Coverage, both Fitness Packs, implementation review, candidate hashes; actual environment/time/executors.

## Acceptance traceability

| AC/NFR | Check ID/manual protocol | Actual result | Raw evidence path | Limits |
|---|---|---|---|---|

acceptance-results.json criteria must match approved AC IDs: `id`, `status` (PASS/FAIL/NOT_RUN), `evidence` paths. Automated PASS needs every required check's success; manual PASS needs actual observations. Missing, stale or unexecuted evidence blocks.

## Dual Gate evidence

Identify independent architecture-gate-reviewer and quality-gate-reviewer agents/runs, same candidate and original evidence. The collector cannot execute/sign for them or claim unperformed reruns.

| Gate/Check | Rule version/SHA-256 | Candidate/input identity | Actual command/exit code/count | PASS/FAIL/UNKNOWN/NOT_RUN | Raw logs |
|---|---|---|---|---|---|

No PASS for unconfigured rules, zero/all-skipped tests, missing dependencies or irrelevant checks. Tool results, not Agent prose, establish execution.

Only with fixed CI/CD bindings: pipeline-result/source-index, exact pipeline/job/attempt, rules/candidate, artifacts and environment observations. Distinguish remote/local executors; unavailable exit codes stay blank. Resume with original evidence provenance.

## Defects and changes

Record reproduction, impact, evidence and return stage. Never modify source, Oracle or approved rules during Verify. Changed candidate/inputs invalidate old results and require review/rerun.

## Implementation Verified Handoff

Require independent TDD/exception/final-regression review, dual Gate/all AC PASS, complete evidence and no drift. Recommend only until the parent records exact required approval. Standard ends here; business outcomes remain unassessed, with no automatic Release/Learn/Production.

Human review checks business correctness, test relevance and evidence completeness. Disclose single-person roles without claiming separation of duties.
