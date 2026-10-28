# AI-native team pack setup, customization, and updates

Explicit setup role delivery may copy verified examples/team-packs/role-team with original source hash. Existing packs need ID merge/conflict resolution. [PO/QE non-code setup](setup.md) permits analysis/assigned QA only, never product.write or automatic business execution.

Initial role setup may derive actual browser schemas/targets, retaining template provenance and complete local-derived hashes with null authority. This cannot permissively override a registered Stage. Later operations require namespaced stages/workflows and confirmed diffs; preserve old locks. See [role protocol](../workflow/role-delivery.md).

Parent reads [extension Interface](../workflow/extensions.md) before configuration. Use existing file/Git/hash tools only; no downloaded execution, dependencies, or global changes. Supplied sources grant reads, not enterprise writes.

## Setup or local customization

1. Inventory package/root/Git changes, work/stages/leaves/Hooks, and journals. Unfinished work/live workers/unconfirmed stops block switching; allow read-only diffs only.
2. Local sources: record all files/hashes as local-unreleased. Git: pin supplied repository/subdirectory/full commit and record identity. Never execute floating main/source programs. Draft missing packs only on customization requests, not ordinary requirements.
3. Validate core compatibility, paths/files, IDs/overrides, input/output semantics, every branch, write order, bindings/permissions, responsibility/artifact/auto-eligibility/target changes. Tool authorization_ref must be null; no imported authority. Expanded permissions/removed Gates conflict even with valid JSON.
4. Show source, paths, workflows/replaced stages, permissions/conflicts, backup/recovery. Exact conflict-free install requests suffice; changes to existing definitions, conflicts, or permissions need exact-diff confirmation. Configuration grants no business delegation.
5. Save verified team content unchanged in `.aidlc/team/`; project customization uses complete explicit replacement/addition definitions in `.aidlc/overrides/`. Preserve unknown same-name files/unregistered directories. Set config.team manifest path/source/actual installation confirmation; set config.project_overrides to a manifest path only for actual overrides. Preserve other fields. Set config.workflow to the user's explicit ID/auto without changing compatible profile preferences.
6. Reread/hash, resolve definitions/both override layers, verify entries/assets. Report installed/blocked, source, gaps; stop without work/stages/auto/connectors/knowledge_publish.

Save installation ledgers/backups under `.aidlc/team-updates/<unique-id>/`; journal plan/current/target hashes and each before/after state, updating config last. Unfinished applying/recovery-required transactions block new delivery. On failure, restore only exact recorded items unchanged by the user; refer conflicts to the user. Never replace whole directories or recursively delete; preserve user content and project knowledge. Recovery/rollback requires an explicit request. Rerunning identical source/content only verifies, without rewriting authorizations/history.

## Keep team updates separate from core updates

- Team Git defaults pinned; read a remote version only on an explicit check/update request. Pin the commit and compare original baseline/current/target. Preserve project overrides; never record customization as the upstream baseline.
- Team update first stops at a diff card; after confirmation, switch using the journal above. Active work/workers block applying. Do not “migrate” active workflow.lock.json, snapshots, or approvals.
- Core preflight retains its GitHub policy; it does not automatically update team/project or incompatible definitions. Core-contract incompatibility with configured teams also blocks core update; preserve installation pending team adaptation/user decision.
- Missing team/project/workflow config fields receive safe defaults only; old installations do not enable examples automatically. Example directories are method resources; actual `.aidlc/team/`, overrides, and knowledge remain outside core managed_files.

Commit/push/PR/tag publication or remote pack edits need separate user instruction.
