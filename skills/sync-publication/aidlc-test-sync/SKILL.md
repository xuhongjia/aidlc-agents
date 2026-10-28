---
name: aidlc-test-sync
description: On explicit sync or DEV continuation, compare approved cases/scripts and arrange controlled updates or result publication.
---

# Synchronize cases, scripts and results

Parent reads [sync protocol](../../../workflow/testcase-sync.md), selects case/result sync, and loads only target, fixed inputs and [receipt](../../../templates/collaboration/sync-receipt.json). Dispatch an isolated executor under [role protocol](../../../workflow/role-delivery.md); child uses frozen [role worker contract](../../../workflow/role-worker.md).

- Case sync: compare last synchronized baseline/current approved version for affected Case IDs, scripts and data. Unapproved edits yield differences only; changed expectations need PO confirmation. Script changes require authorized Implement file scope, existing TDD/test capabilities and execution. Without repo access, send DEV a sync request; do not claim updated code.
- Result sync: bind actual run, Case version, candidate, environment and evidence. Publish summary only to authorized Jira execution record; full reports stay in GitLab. Separate case definitions/executions and preserve failures/history. Sync cannot pass tests/delivery.

Ownership conflicts, revocation, drift or unknown outcomes stop affected deliveries. Reconcile objects before retry; invent no initial baseline. Explicit calls/continuation checks only, never daemon, webhook, CI job or automatic monitor.
