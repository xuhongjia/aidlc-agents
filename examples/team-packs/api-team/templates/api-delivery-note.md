# API delivery note

AIDLC_DRAFT — used for the `implementation` or `verification` contract according to the current stage's declared output. All execution is NOT_RUN until backed by actual evidence.

## Approved baseline and exact candidate

Reference the approved change, applicable review artifacts, stage approval and candidate files with computed digests. Record authorized paths, commands and side effects. The Implement record and Verify record remain separate stage artifacts even when their basenames match.

## Implementation and developer checks

| AC ID | Actual change / file | Authorized check, environment and raw evidence | Exit code / count / result |
|---|---|---|---|

Distinguish existing user edits, this stage's changes, original failures and unexecuted checks. Developer checks do not establish independent verification.

## Independent verification

Status: NOT_RUN. Verify records the frozen candidate identity, actual executor, environment and time; Implement leaves this section pending.

| AC / Architecture or Quality Gate / Check ID | Approved rule and digest | Command / cwd / threshold | Exit code / executed count | Result | Raw evidence |
|---|---|---|---|---|---|

Only actual current-candidate evidence may replace NOT_RUN. Missing rules, empty checks, all skipped tests, drift, failed checks or unavailable tools cannot become PASS. Retain both gate evidence records required by the core protocol.

## Limitations, rollback and next decision

Record unresolved defects, blocked checks, rollback procedure and the exact next action. Changes to scope, Oracle, rules or candidate invalidate affected approvals and results. This artifact does not assert deployment, business acceptance or external publication.
