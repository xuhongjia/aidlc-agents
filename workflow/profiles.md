# Risk-based recipes

Selection/body rules only. Parent normalizes/schedules/approves/recovers original versions; children verify risk, never load parent protocols/change graphs.

| Recipe | Use | Stages | Approved implementation baseline |
|---|---|---|---|
| fix | Local reproducible defect; restore clear behavior | diagnose → implement → verify | Cause/scope/Oracle/plan |
| enhance | Small independently acceptable/reversible change within existing boundaries | scope → implement → verify | Scope/AC/Oracle/plan |
| standard | New capability/high risk | intake → spec → architecture → quality → plan → implement → verify | Plan/design |

config.workflow/profile is preference, never authority. auto starts here; user choice prevails unless risk needs confirmation. Ask route-changing questions only; parent never diagnoses. Compose registered stages only. First read-only child verifies risk; entry card confirms graph/scope.

## Required escalation

Identity/permissions/trust boundaries; payments/sensitive data/compliance; schema/data migrations; breaking API/event/data contracts; new services/dependencies/infrastructure/IAM/deployment policy; cross-system/broad refactoring; unbounded impact/rollback.

Any trigger blocks with evidence/standard-equivalent human-reviewed graph proposal. Bug labels/small diffs exempt nothing. Parent stops runs/preserves old graph/confirms replacement/redispatches without old approvals. Unknown causes permit authorized investigation, not repair approval.

## Compact outputs

fix/enhance bodies: change.md/verification.md only, plus attachments/history. change covers scope, FR/NFR→AC/approved exclusions, Oracle/architecture impact/both Gates/implementation boundaries/slices/rollback; fix adds real reproduction/cause. verification separates DEV/independent results; never overwrite approvals.

Link background; write differences/decisions/risks. Omit irrelevant sections, never risks to fit pages. standard retains seven-stage AC/coverage/results contracts. Every delivery needs real dual Gates: missing rules follow gate-design; Verify gate-execution, never waivers/weakened rules. fix needs same-Oracle pre-failure/post-pass/adjacent regressions. Drafts stay in runs; approved Implement installs.

Human stage approval defaults. Parent checkpoint/auto requires delegation; children never self-approve. Endpoint defaults verified/business not_evaluated, no Release/Learn. Team release chains/old work retain locks.
