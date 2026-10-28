# Shared current-work contract

New 0.13 work has one parent chain: router → [extensions](extensions.md) frozen graph → [dag](dag.md) dependencies/branches → [orchestration](orchestration.md) dispatch → [approval](approval.md) decisions. Children use [context](context.md) required reads, not this protocol. Existing work uses [original-version rules](legacy.md), never migration. Host executes; package provides no runner/authentication/tamper protection. Project [CI/permissions](../docs/fitness-and-ci.md) enforce hard gates.

Parent owns control records; every stage/run gets a new isolated child. Product writes require approved implementation scope. Project-rule conflicts, missing inputs, overreach/drift stop work; extra roles cannot override constraints.

## Records and authorities

Paths resolve from business project root. Retain request/questions/state, runs/RUN dispatch/result/artifacts/evidence, immutable reviews/STEP/rN artifacts/review.json, approvals/policies. Add feedback/STEP-rN ledgers only for authorized correction. Never invent sources/user statements/times/worker identities.

state.schema_version=5 nodes/branch_decisions are DAG authority; profile/stages/current_stage are compatibility only. active_runs/run_history include leaves/collectors/correction lineage. Retain waits/wait_monitor under [pipeline-wait](pipeline-wait.md); awaiting external results releases slots. Freeze full method commit or local-unreleased digest and workflow_ref. New requests check [preflight](preflight.md); existing work never hot-updates.

Authority per fact: bound request/Jira version → requirements; work review → approved scope; full candidate → code; raw tool evidence → execution. Jira/Confluence links, working copies/knowledge projections cannot change approvals. Source changes need explicit differences/new review, never silent bidirectional merging. Preserve [knowledge](knowledge.md) approved snapshots.

IDs allow letters/digits/underscores/hyphens only; reject traversal/symlinks/out-of-package refs. Multiple active works require an ID. One product-writing flow/worktree; preserve user changes. Never independently create branches/copy production data.

## Review is the sole review snapshot

Validate actual dispatch/result, independent worker, all outputs/evidence, scope/upstream approvals; promote run directly to review without drafts/handoff layers. Body: current differences/decisions/risks; link logs. Placeholders/blocking questions prevent ready status.

Use [review template](../templates/work/review.json):

- files: every artifact-relative output/actual SHA-256. Inputs/external evidence use project-relative paths surviving promotion, never broken ../evidence links.
- inputs: request/upstream review digests. Freeze adopted answers/actual attribution in this body, not the entire append-only questions log. Changed approved decisions invalidate dependents.
- candidate: from Implement, full delivered source/test/config/lockfile/required-resource set with actual generated-output exclusions. Re-enumerate before/after approval/checks, including additions/deletions, never only diff/HEAD. .aidlc controls are not products; place no product source there.
- gate_evidence: complete Verify needs same-candidate/approved-rule Architecture/Quality reports and raw execution under [gates](gates.md). PASS needs nonzero relevant checks.
- tdd_evidence: Implement slices/exceptions, real RED/GREEN/REFACTOR/final-candidate regressions. Verify checks independently only. Missing applicability/raw evidence blocks engineering delivery; see [TDD](tdd.md).
- external_evidence: actual Release/Learn source-index/snapshots/times/candidate links under [external-evidence](external-evidence.md).
- pipeline_evidence: every bound Verify/Release/Learn pipeline-result path/digest/source-index. [pipelines](pipelines.md) checks latest required jobs/rules/artifacts/target environment/actual observations. Incomplete/WAITING cannot form complete review.
- execution: actual agent_id/dispatch/result paths/digests for all stage/leaf/collector/correction runs, including failures.

Write the review, then tool-hash its raw bytes and store the digest in state/approval; review has no self-digest. Never reformat/mutate snapshots: changes need new revision. Parent cannot rewrite child conclusions to erase conflicts.

## Approval and invalidation

[identity](identity.md) resolves Jira assignee → Git name/email → system login; refresh before recording. Prefills are not signatures. approval validates exact step/revision/workflow_ref/review_digest. Manual retains real words; delegated decisions retain policy/itemized evidence signed parent-coordinator. Clarification, “keep improving,” silence/old approvals never authorize this revision.

Cards show new decisions/risks/failures, body/evidence links, requested scope/next action without hiding effects. Approval without continuation means stop. checkpoint entry may explicitly delegate Implement→Verify continuation, never replace final human review.

Rejection or candidate/input/Oracle/scope changes preserve decisions, supersede affected downstream work/Gates and require newly approved revisions; never roll back user code. Graph/template/responsibility changes need new lock/authority. Only narrow [internal feedback](implementation-feedback.md) permits same-Implement continuation before first candidate review, never formal Verify failures/historical PASS changes.

## Verification and completion

Map every original FR/NFR to AC/real approved exclusion. AC: nonempty, unique, automated/manual. Standard acceptance/coverage/results sets match exactly; compact uses existing change/verification tables without extra reports. Manual AC need specific protocols/real observations, never AI signatures. Automated AC map to relevant Quality blocking checks/actual executions. Zero/all-skipped/irrelevant checks, empty scope, unknowns/timeouts/drift cannot PASS. DEV self-tests never replace independent QE; dual Gates never replace requirement completeness.

Completion requires all selected DAG nodes approved, terminal node, no active stages/valid waits/monitors. Compact: verified/business not_evaluated; list enabled-CD environment validation separately. analysis_complete: not_implemented/not_evaluated. Unbound Release means readiness; bound CD also needs actual deployment validation without granting deployment rights. Learn needs human-reviewed real accepted/rejected observations; inconclusive blocks, rejected is not success. Knowledge sync is separate; active Hooks block updates/closure.

[Direct closure](closure.md) ends unfinished work only after stopping every worker/preserving true status, never inventing Gates/deployment/acceptance. Dependency installation, production data, paid actions, push/merge/deploy/network writes need authorization; knowledge_publish is only its scoped publication exception.

0.13 Standard/compact end at Implementation Verified Handoff; Release/Learn/Production default inactive. Implement candidate approval supplies Verify input only. Set state.implementation_verified_handoff only after TDD, required tests, same-candidate Gates from two independent Reviewers, all AC, no drift and required approvals. Explicit team release extensions/old work keep frozen graphs.
