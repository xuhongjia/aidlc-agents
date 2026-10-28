# Configure knowledge publishing

Use `.aidlc/system/skills/setup/aidlc-knowledge-setup/SKILL.md`. Confluence uses TWG: install a missing CLI only during explicit configuration with the user-provided command; user performs login. Verify site/space/parent read-only before merging config. Ordinary setup/update/Hooks neither install nor authenticate. Keep credentials out of the repository. See [authentication](../bootstrap/knowledge.md).

Copyable prompt:

> Use aidlc-knowledge-setup for <site/space/parent>, all four types. Check/install missing twg using the prescribed command and guide login. Verify read-only, merge target preserving settings, and stop without publishing.

site, space ID, and parent page ID must be real; never publish to example values:

```json
{
  "knowledge": {
    "targets": [{
      "id": "project-wiki",
      "provider": "confluence_cloud",
      "transport": "twg_cli",
      "site": "https://example.atlassian.net",
      "space_id": "REPLACE_SPACE_ID",
      "parent_page_id": "REPLACE_PARENT_ID",
      "types": ["architecture", "quality", "anti_pattern", "lesson"]
    }]
  }
}
```

New targets use transport=twg_cli without granting shell/network/write permissions. Existing snapshots retain adapters/approvals; no backfill.

Require unique IDs, complete locations, and a nonempty enumerated types subset. Targets subscribe independently. Production supports confluence_cloud only; simulations are maintainer-only. Invalid types/IDs/locations/providers grant no authority.

Next, you may ask:

> Prepare ENH-001’s authorization card: implementation paths/commands/stop conditions, plus approved knowledge of all four types to project-wiki’s space/parent. Limit create/update to proven project-owned pages. Show the frozen card for confirmation.

The parent writes the card to a frozen file using [publish-scope](../templates/knowledge/publish-scope.json) with real work/project values. targets stores complete locations/types, not dynamic ID references. operations is an explicitly authorized subset of `create` and `update_owned`. policy.knowledge_publish stores the file's path/sha256; manual-stage approval.knowledge_publish similarly references the authorization actually confirmed for this review. Automatic mode derives authority from the genuinely confirmed work card; auto decisions cannot invent human statements.

Confirm the card before publishing approved snapshots within scope. Hooks cannot approve standard stages. targets=[] disables enterprise sync while preserving local reuse.

## File-contract reference

All refs are `{path, sha256}`; destinations/targets use the complete target above. Each index.items entry is `{id, type, latest_ref, approval_ref}`. Read snapshots to determine applicability rather than relying on latest alone. knowledge/runs.json is `{schema_version:1, active_runs:[], history:[]}`. Run entries include run_id/work_id/actual worker_id/dispatch_ref/state/stop-evidence references; missing worker identity prevents a claim of execution.

Hook result: `{run_id, dispatch_digest, status, receipts, blockers}`, status completed/blocked/failed. completed means ended; receipts carry target outcomes, not approval authority. Parent retains result/actual stop evidence; clearing active_runs is insufficient.

Snapshot source.review_refs points to existing upstream approvals. External approvals credentials link the current Verify/Learn approval to avoid self-reference. Each design_refs item also records approval_ref. implementation_verification contains candidate_ref, both gate_refs, AC/check mappings, and coverage limits. Mark unexecuted checks NOT_RUN; design approval is not verification. A new Learn version retains supersedes and adds real source evidence without automatically upgrading claim_status.

Schema 1 snapshot origin is approved_document/derived/observed_revision; source.stage is verify or learn; source.method_revision preserves the source method identity. Versions are positive integers; applicability, invalid_when, and evidence_refs are nonempty. IDs allow only letters, digits, hyphens, and underscores, rejecting path traversal. Freeze the identity block in created titles/content. See [preparation](../workflow/knowledge-prepare.md) for full content versus redacted projections.

Redact then obtain new review. Permission gaps, human edits, version conflicts, or unknown writes stop affected targets. Never recreate under another title to bypass conflict. Retries widen no authority or permit plugin installs/token storage.
