# Case, script and result synchronization: on-demand protocol

Explicit “sync cases/results” or current DEV continuation triggers this role-flow-only protocol, never background listeners. Approved Jira Story/AC/QA cases are sources; repository snapshots are versioned implementation inputs, not editable masters. Parent validates/dispatches independent sync children to publish fixed content, never rewritten conclusions; share worker/stop management.

## Cases to code

1. Read bound Story/design-Task IDs/current content/update times once. Compare Case ID/revision/AC/steps/data/expectations/required/method against approved snapshots, then script mappings. No whole-library scans/title matching/per-case Story refetch.
2. Wording-only changes retain real unchanged-semantics review/both digests. Added/removed cases/data/steps/expectations/coverage need new Test Design, never backfilled approval. Business rules/AC need PO then QA; QA edits cannot expand requirements.
3. Mark affected scripts pending sync. Preserve historical versions/candidates/results; they cannot pass new baselines. Drafts/conflicts/revocation allow differences only, no code writes.
4. Parent applies DAG invalidation/new Implement revision/required authority. Only implementation/product.write Software Engineer changes scripts/fixtures/code. Preserve manual content/minimal reviewable changes; unmapped manual cases remain, never always-true scripts. Sync increases no nonzero correction budget.
5. Run affected tests/required regressions, freeze new candidate/repeat required QA; never retarget old QA/Gate hashes. Graph/permission/target changes need new graph/authority. No automatic push/MR/merge/deploy/CI trigger. QA without source rights requests DEV sync.

## Publish to Jira

Use [Jira adapter](../adapters/collaboration/jira.md)/[sync-receipt](../templates/collaboration/sync-receipt.json). Ordinary Tasks follow AIDLC, never claimed Xray/Zephyr capabilities. Business cases stay readable; unit details remain repository-only. Result Task/round records Case ID/version/candidate commit-artifact/environment-data version/executor/time/results/evidence. Repeated executions retain history, never overwrite PASS/FAIL.

Work [authorization](../templates/collaboration/authorization.json) needs actual decisions/exact project-Story or approved create intent/allowed create-update_owned-link-attach/targets/frozen content. Without it prepare reviewable changes/await decision; valid scope needs no repeated questions. Role approvals/knowledge grants imply no Jira writes. New Stories use approved PRD/Story draft IDs/digests then read-back ID mappings; empty story_ids never permits project-wide access.

Before writes persist input/target/authority/idempotency key/attempt. Key=project/source work-Story/artifact ID/content version/target; same-content retry preserves it. Update owned objects/managed fields only, proven by creation receipts/explicit imported ownership, never similar titles/labels. Compare current content/version to baseline. Human edits/target-scope change/revocation stop target. Nonatomic APIs cannot lock others: avoid whole-object overwrite/read back/record races as conflict or unknown.

Reread actual control_locator/current authority before every effect; frozen grants prove no live validity. Redact data/screenshots before freezing. Sync children never rewrite ad hoc; sensitive discoveries stop for new reviewable version. Default synthetic test data; never publish authentication/production data.

One write attempt/target/call; no loops. Create/link/attach are separate recorded actions; never resend success. Timeouts/unknowns first verify read-only using saved IDs/original markers/digests. Without unique confirmation stay unknown, never create again immediately. Missing stable IDs/reliable dedup means drafts only/required human confirmation. Proven identical key/content success=no-op; changes need new version/applicable approval.

Receipts retain remote ID/source_version/expected_remote_hash/readback_ref/result/time/errors. Digests stay separate from full evidence. Jira is not guaranteed immutable; retain frozen approval/test snapshots in traceable attachments/engineering evidence. Set suitable GitLab retention; expired/missing links cannot support Gates. JUnit display proves no job success; validate exit status/original reports under pipelines.

## Recovery

failed/conflict/unknown preserves pending/stops target without changing delivery/Gates. Explicit retry verifies original method/workflow/snapshot/authority/live revocation. Upgrades never alter content/scope; lost connections never justify replacement tickets. Revocation/closure/reassignment stops actions. Preserve prior writes, never automatically delete/roll back others' content. Done/transitions/production publication/permission changes are excluded.
