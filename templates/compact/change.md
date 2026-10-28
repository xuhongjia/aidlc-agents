# Change

AIDLC_DRAFT — about one page before implementation; retain all risks/blockers.

## Request and route

Original request, profile/suitability, impact, exclusions, and applicable standards.

## Defect basis (fix only)

Expected/actual, reproduction/raw evidence, root cause and causal evidence. Unreproduced defects or unconfirmed causes block. Regression must fail before and pass after the fix.

## Acceptance and checks

| Source / FR or NFR ID | AC ID (or explicit exclusion) | Observable expectation/Oracle | Test/manual verification | Command/evidence or exclusion reason/approval |
|---|---|---|---|---|

Cover every source FR/NFR with nonempty unique AC or explicit exclusion approval. For reused knowledge, record adopted/rejected ID/version, applicability and current-code evidence; history cannot replace Oracle.

Define Architecture and Quality Gates separately: executable blocking rule ID/source/scope/command/cwd/threshold/report/version. Missing rules require Architect/QE leaf proposals, Implement installation paths and controlled negative examples. Manual checks, N/A or empty rules cannot replace Gates. Link script attachments.

## Implementation boundaries

Files/modules, ordered steps, commands/cwd/effects, rollback, risks/blockers; parallel ownership when needed. Implement needs approval of this version; push/deployment need separate authority.
