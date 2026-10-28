# Project knowledge: parent coordinator

Frozen capability/kind routes [read](knowledge-read.md) → [prepare](knowledge-prepare.md) → post-approval [publish/recover](knowledge-publish.md). These are existing-stage Hooks, not stages. Children never load this parent protocol. Frozen assets include required protocols/snapshot templates. Experience changes no mandatory standards/approved Oracles/Gate thresholds/Skills.

## Project storage

`.aidlc/knowledge/` survives method updates/uninstallation outside managed package:

- index.json: [index template](../templates/knowledge/index.json), stable project_id/item IDs/types/current-version refs. Parent generates project_id once/preserves it, never infers directory identity.
- items/ID/vN.json: immutable approved [snapshots](../templates/knowledge/snapshot.json); source/supersedes track revisions, never rewrite approvals.
- approvals/ID-vN.json: parent records snapshot path/digest/stage approval/publication authority separately; never circular refs in snapshots.
- sync/RUN/: dispatch/result/per-target receipts/redacted responses/parent completion. runs.json tracks actual active workers/history; move only after proven stop. Orphans/unknowns block updates.
- authorizations/: append grants/revocations; policy clearing never erases history.

Serialize promotion per ID; no concurrent same-version allocation. Verify all refs. Preparation/worker define source mappings; never backfill approvals.

## Approval, local promotion and delivery

1. Parent validates candidate/dual Gates/source mappings/actual stage approval. Shared knowledge/stage card lists local items/remote targets/operations. Without remote authority approve local only. Standard keeps human review; approved implies no deployment/acceptance.
2. Copy snapshots/attach separate approval receipts/update index. Identical ID/version/digest is idempotent; differing digest conflicts, never overwrite. Failed promotion=pending_local, never success/delivery rerun.
3. Valid knowledge_publish authority permits [Hook dispatch](../templates/knowledge/dispatch.json)/new isolated knowledge-sync child. Supply frozen snapshots/approval-authority-revocation/targets/receipts/adapters only, never chat. Share capacity; no concurrent same-item/target writers.
4. Child returns target results under [sync Skill](../skills/sync-publication/aidlc-knowledge-sync/SKILL.md). Parent verifies receipts/appends completion. Child changes no index/approvals/config/delivery state. Sync differs from delivery_status/business_outcome; failure neither revokes nor proves delivery.

Read publication scope/revocation/idempotency/recovery only for publication/retry. Active Hooks block updates/closure; pending items cannot block forever. Initial knowledge integration uses setup Skill; stages/Hooks never install/login.
