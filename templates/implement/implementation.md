# Implementation

AIDLC_DRAFT — implement only within an explicitly approved plan; report actual changes/runs.

## Authorization and changes

Reference approved plan, Spec, both Fitness Packs and scope.

| Changed path/task | AC/NFR | Actual change/reason | Checks/raw evidence |
|---|---|---|---|

Separate your edits from prior user changes; claim only implemented behavior.

## Actual verification

Commands, environment/time, exit codes, executed counts and logs; retain skipped/unexecuted checks and existing failures. DEV self-tests are not QE acceptance.

| Task / Requirement / AC | Oracle reference | RED behavior failure | GREEN / affected regressions | REFACTOR / no_change and retest | Exception/alternative verification |
|---|---|---|---|---|---|

Link this run's tdd-evidence and final-candidate regression. Intermediate snapshots are not final evidence; runner/environment errors are not RED. Never weaken approved expectations.

## Candidate inventory

Inventory required source, tests, config and dependency manifests; compute actual file SHA-256 and bind the review candidate.

## Deviations and handoff

Requirement/architecture/Oracle defects return upstream for approval. Record incomplete work, risks and next steps; submit exact candidate/raw evidence to QE.

Submission is not verified completion, release readiness, deployment or business acceptance. Implementation Verified Handoff still requires independent Architecture/Quality Reviewers, all AC and required approvals.
