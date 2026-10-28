---
name: aidlc-qa
description: Execute approved cases on a frozen candidate through browser and human checks; return QA evidence for independent Gates.
---

# QA execution

Parent resumes `team.role-delivery` QA handoff under the [role protocol](../../../workflow/role-delivery.md), dispatching a fresh child. Outside the repo use a fixed packet for the same lock/candidate; return evidence to the business-repository coordinator. Load only [role worker contract](../../../workflow/role-worker.md), `core:agents/qe.md`, [result template](../../../templates/collaboration/test-run.json), approved cases, candidate/environment mapping and browser grants.

Verify running artifact matches frozen candidate and case/data versions. Follow approved steps: prepare isolated data, run browser checks, save observations/evidence and clean up run-created data. Use only authorized environments/accounts/actions. Missing permissions, unknown environment or cleanup failure requires explicit gaps, never scope expansion.

Human items retain actual executor/observation sources; AI cannot sign. Record per-Case/step results, errors, `NOT_RUN`/blockers and evidence. Page opening, script exit or uploaded reports alone do not pass AC.

Return results/defects for DEV to the parent; case errors follow the [sync protocol](../../../workflow/testcase-sync.md). No source/Oracle edits. Only complete required QA evidence permits formal independent Gates/final approval. QA neither executes/approves Gates nor sets Jira Done or releases production.
