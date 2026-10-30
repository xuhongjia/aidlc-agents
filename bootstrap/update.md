# AI-native update

English-primary applies to new method content only. `language=en` grants no rewriting of business artifacts, locked assets, or approvals. `translations/zh-CN/` stays immutable and outside installed payload.

0.15 -> 0.16: install helpers/ from the manifest; add missing execution.policy_ref/review_catalog_ref with core defaults, preserving custom refs/settings. Model selection remains disabled and budgets unset until configured. New work freezes execution contract 1/requirements/cards and records native receipts. Existing dispatch/state/result schema numbers remain; optional new fields grant no authority and must not be backfilled into old work. No retroactive model switch, budget reset, candidate approval or history migration. Pending/live work still defers method updates. Helpers need an existing Node only; never install dependencies or change host models during update.

Compacted 0.16 sources add check.mjs/helper-request and split Gate invariants/Reviewer/collector instructions. Freeze their exact hashes for new work; retain old work's original read lists and approvals. Even at the same semver, changed source hashes require the normal update transaction. No host settings change.

The current bridge also routes ordinary feature/change/fix requests without an AIDLC keyword. Update its managed block and any installed router shortcut together; preserve custom rules and explicit workflow/profile preferences. Existing work keeps its original graph and approvals. Automatic selection grants no automatic approval; report host loading separately.

0.15 moves Skills to `skills/<category>/<name>/SKILL.md`, preserving names/responsibilities. Resolve target `skills/catalog.json`; update manifest, bridge, registered router, and current references. Native entry stays `aidlc/SKILL.md`. Change new work only; preserve old locks/dispatches/assets/approvals. Three-way compare team references; never guess cross-version replacements.

List old/new paths. Moves still require baseline/current verification and exact deletion confirmation; never recursively delete directories/unknown content. Compare destinations and preserve conflicts. Update managed_files after references/hashes pass. Historical backups/fixed-version test baselines keep old paths. Install manifest payload only; exclude reference-only `translations/`.

0.14 → 0.15: optional roles/Jira case-result sync. Add missing collaboration=null; preserve roles/connections/targets/authority/team customizations. Never enable role-team or migrate old approvals/graphs automatically. Inventory non-code analysis work, outstanding QA packets, and sync children too. Preserve unfinished work’s method and original transfer/sync snapshots. Exclude project `.aidlc/collaboration/` and fixed handoff/approval/delivery records from managed_files; upgrades widen no permissions.

0.13 → 0.14: optional config.setup/Setup Gate. Missing setup means AIDLC-only, not mandatory existing integrations or continuing probe authority. Preserve setup lists/authority and .aidlc/setup/ evidence. New locks use setup_check_ref; old work/approvals/locks stay unchanged. Check new-work requirements; update success proves no external readiness.

0.14 includes unreleased local 0.13.1: shorter new-work Prompts/routing, agile slicing, terminology, retrospectives. No graph/schema/permission/approval changes or new external Skills/trackers/host settings. Preserve old methods; three-way merge team Prompts/templates, never replace rules merely for brevity.

0.12 → 0.13: new-work V2.1 adds Implement-only TDD, named adapted Skills/on-demand resources, independent dual Reviewers, and verified handoff. Show Standard’s nine→seven stages: Release/Learn inactive unless a team extension ID is selected. Preserve delivery config; bind selected nodes without adding CD. State/dispatch/result schemas stay unchanged; empty optional refs/skill_uses/handoff are new-work-only. Preserve old locks/approvals/TDD/Gate identities; install no external plugins. Incompatible team definitions/templates require three-way conflict resolution.

0.11 → 0.12: optional new-work CI/CD/waiting_external; state/dispatch/result/review/source-index/gate schemas 5/5/4/3/2/2. Add missing config.delivery=null; preserve settings/assets/approvals and grant old work no bindings/monitors/authority. Waiting work/live monitors block updates. Separate integration setup configures existing pipelines; ordinary setup/update neither authenticates, monitors, nor changes CI/CD.

0.9 → 0.10: new-work DAG flow, optional checkpoint_low_risk, separate Implement correction budget (default 0). Config/state/extension versions stay; new policy/dispatch/result/approval schema is 3. Preserve old work/cards/delegation/modes/authority/budget; finish under [legacy](../workflow/legacy.md) before switching. Missing original methods block work; never reconstruct them from new rules.

0.8 → 0.9: new-work [extensions](../workflow/extensions.md)/DAG/schema 4; preserve old work/approvals. Add missing workflow=auto, empty team, project_overrides=null; preserve profile/extensions. Target core_contract incompatibility blocks update without rewriting team definitions. Exclude `.aidlc/team/`, overrides, team ledgers, frozen work assets, and knowledge from managed files. Unfinished work/live parallel/Hook workers block core/team updates; use [team.md](team.md).

0.7 → 0.8: new-work knowledge/source mappings. Add absent config.knowledge as `{targets:[]}`; preserve existing/unknown fields, flag incompatible types. Never migrate old work/approvals or grant old policies authority. Never manage `.aidlc/knowledge/`, credentials, revocations, receipts. Inventory knowledge/runs.json, sync records, and host tasks: active Hooks block even completed work; pending deliveries without live tasks do not. Retry compatible original snapshots/authority only under [knowledge.md](../workflow/knowledge.md).

The parent updates installed product repositories without delivery stages, Python, or a dedicated installer. User prompt:

> Read https://raw.githubusercontent.com/xuhongjia/aidlc-agents/main/bootstrap/update.md, inspect the aidlc-agents installation in this repository, pin the target version, and show the upgrade diff and migration plan. Preserve rules, requirements, approvals, and evidence. Block if any work is unfinished or child agent is active, and wait for my confirmation before updating.

Network source reads grant no other service connection, dependencies, product edits, commit/push, or deployment. Bind plan/confirmation to a full commit or explicit local-unreleased complete hashes, never semver alone.

Installed [preflight](../workflow/preflight.md) may authorize routine updates; conflicts/deletions/incompatible migrations still require human decisions. Preserve existing work’s version; return actual installed version without running delivery.

## 1. Inventory read-only and pin the target

1. Read host rules/changes; verify product root and `.aidlc/config.json`. Unknown installations, missing config, foreign `.aidlc`, symlinks, or out-of-root paths block writes; never treat them as first installation.
2. Follow [setup](setup.md) source rules: obtain one complete fixed payload, reread its Update/manifest/schema, and record old/target identities. Never mix main revisions. local-unreleased needs all files/actual SHA-256.
3. Check unfinished work/live workers using all `.aidlc/work/*/state.json`, handoff/worker records, and host task state. Only work actually terminated under its original protocol counts as finished. Awaiting stage approval, blocked, paused, failed pending repair, and canceling are unfinished. Conflicting completion/worker state, missing state, or uncertainty also blocks. List each work ID, stage, status, method version, and live worker ID/status; never assume an empty list.
For versions supporting closure, closed requires a real closure record and all worker/subprocess stop evidence. closing/status edits/missing evidence block. Never backfill unsupported closure or close work for approvers.

4. **Do not apply updates while any work is unfinished or worker is live**. List blockers; preserve usable system/config/bridge/work. Read-only diffs are allowed. Finish under the old protocol and verify worker stops before rechecking. Never auto-approve/cancel, change `method_revision`, or open another work item to bypass this. No side-by-side method resolver exists.

## 2. Compare three ways and present the plan

Compare old baseline (original upstream package bytes/hashes), current (actual project content), and target (fixed upstream version). config.managed_files is an index, not authority over all existing files; retrieve baseline bytes from the old commit or a verifiable snapshot. Distinguish installed `sha256` from upstream `upstream_sha256`; never treat previously retained/merged customizations as upstream, which could erase them on the next upgrade. For schema 1 without upstream_sha256, reconstruct from a verifiable old source and check old records; unexplained differences need human resolution. If an old local-unreleased baseline cannot be recovered, hashes are absent, or verification fails, mark unprovably safe merges conflict and wait for a supplied baseline/item-level decision; do not guess.

| Condition | Action |
|---|---|
| current equals baseline; target changed | Plan replacement with target |
| current changed; target equals baseline | Preserve and record user changes; conflict if incompatible with the new contract |
| current and target both changed | Show three-way diff; obtain human confirmation of the exact merge, never overwrite with remote automatically |
| target adds a file; current absent | Plan addition; an existing same-name user file is a conflict |
| target deletes; current equals baseline | Add to the exact deletion list; remove only with explicit confirmation |
| target deletes; current changed/owner unknown | Preserve and mark conflict; do not delete |
| Unregistered files or user-created content | Always preserve as user content; absence from the new manifest does not authorize deletion |

Compare bridges by managed marker block, not whole `AGENTS.md` / `CLAUDE.md` files. Whole-file hashes only reveal post-installation changes; preserve every user addition/edit outside the block. Markers must be exact, unique, and paired. If old config lacks block hashes, reconstruct the baseline from a verifiable old adapter and confirm historical consistency; never backfill the current block as the old baseline. Unrecoverable baselines, local block edits, or duplicate markers require explicit resolution. Apply the same three-way comparison to the exact registered optional router Skill file.

The plan shows fixed source; added/replaced/merged/preserved/deleted paths; conflicts and proposed exact resolutions; execution-capability changes; schema migrations; backup/recovery paths; and every pre-write current hash. Show necessary diffs without exposing secrets. Manual update requires explicit confirmation bound to this plan/target; “check upgrades” or repeated “setup” is insufficient. If entry supplies valid continuing preflight authorization and the installed protocol classifies the entire plan as routine, record that authority and this eligibility decision and apply directly. Deletions/conflicts/incompatible migrations still require target-specific confirmation. Stop with any unresolved conflict.

## 3. Explicit boundaries for migration from 0.2.x

- config schema 1 → 2: preserve owner, solo/standard, tool, installed_at, user extensions, and unchanged settings; add `execution` without resetting config from an empty template.
- Default `execution.mode=isolated-subagents`, `context_policy=fresh-minimal`, `max_parallel_workers=2`; new capabilities start null and receive actual values only after probing. Report incompatible types/existing same-name user keys as conflicts; do not discard them.
- This changes execution from the parent to isolated children; it is more than documentation. Tell the user native fresh-context spawn and result collection are required. Unknown/unsupported means blocked; leave the old version usable and never use parent inline fallback.
- Do not migrate/recalculate/automatically approve requirements, Spec, approvals, evidence, work state, or historical `method_revision`. Historical work retains its version identity. All work must end first, so only new work uses the updated method. Reopening old work requires a separately designed migration, never implicit conversion.

## 4. Stage, probe, back up, and switch

0.3 → 0.4: config remains schema 2 but adds profile selection and schema 3 **new-work templates**. Preserve config.profile, including standard; do not silently set auto. Let the user choose auto routing for future requirements in the plan. Automatic approval defaults off; preserve historical approval sources without backfilling auto approval. Auto routing is not delegated approval. Do not migrate old work/profile/approvals. New work no longer creates duplicate drafts/handoff; preserve every historical file. Finish unfinished work under the old version first; changing profile cannot bypass the update block.

0.4 → 0.5: adds approver resolution (Jira assignee > Git > system login) and mandatory dual Gate reports for every route in new work. Do not backfill names/emails or invent Gate evidence for historical approvals. Finish old work first. Short routes missing Gates must add them; manual checks no longer substitute. Show this behavior change and preserve original settings.

0.5 → 0.6: new work supports proactive read-only Release/Learn evidence collection (product Git/CI/Jira) and direct closure explicitly confirmed by the approver. New external_reads/source-index/closure records start empty; do not backfill historical evidence or closure state. Preserve bindings, approvers, and user settings; resolve ambiguous sources within new work.

0.6 → 0.7: adds preflight GitHub checks. Older versions cannot discover updates themselves; first perform one explicit update, with the user explicitly enabling “update before new requirements; keep existing requirements on their version” in the request/plan. Add `update_policy` (mode=before_new_work, ref=refs/heads/main, authorization={user_statement,source,at}) using real authorization only. Explicitly fixed versions use mode=pinned. Preserve policies/extensions without template resets. Missing enabling authorization is not consent: a confirmed manual update may finish, but resolve policy before new requirement entry. Initial activation does not retroactively make this manual update automatic.

Use host file operations; no extra installer or claim of tamper-proof/atomic transactions.

1. After confirmation, create `.aidlc/updates/<unique-id>/` with plan, journal, stage, backup, and `update-report.md` **outside system**. Mark journal preparing; record target identity, exact user confirmation (or valid continuing authorization and eligibility decision), exact managed writes/deletions, and original hashes. Store no credentials. Stage the complete target payload and exact planned merges; verify hashes, references, and schemas file by file without mixing versions.
2. Run the read-only isolated-child probe from `workflow/orchestration.md` / [setup](setup.md), using explicit staged-version file paths, and actually collect results. Create no work or approvals. Record evidence in the transaction report. Any unknown/failed capability stops at blocked with installation unchanged; parent analysis cannot replace the probe.
3. Before switching, recheck unfinished work/live workers and compare current hashes with the confirmed plan. Any drift requires replanning and fresh confirmation. Stop concurrent setup/update operations; pause if a single updater cannot be established.
4. Back up affected managed files, old config, the original managed bridge block, and hashes of outside-block content. An entire bridge may be retained as reference, **never for whole-file rollback**. Verify each backup against current hashes before marking prepared. Deletions must be on the confirmed exact list and still equal baseline. Never recursively clean unknown files/directories.
5. Mark applying and install staged results item by item; journal expected before/after hashes and applied state. Reread the bridge before writing; replace only its exact unique block and preserve latest outside-block bytes. Do not overwrite/replace the whole system directory; preserve unknown files. Write or perform confirmed exact deletions only for items with verified backups.
6. Verify actual hashes, references, stage catalog, bridge, and candidate config across the complete installed managed scope. Check product files, work, and unmanaged user content are unchanged. **Write config last, only after everything passes**: update source, package_version, schema, managed_files/block hashes, and measured execution. Record installed sha256 and target upstream_sha256 separately per item, preserving customization facts. Keep user settings and original installed_at; an actual updated_at may be added. config does not hash itself.
7. Verify final config against installation, mark journal complete, write the actual report, and return it. After failure or unfinished preparing/prepared/applying records, a new session must recover/roll back before any delivery stage. Old config does not make a mixed directory safe; report unavailable-until-recovered, not ready.

## 5. Recovery, rollback, and idempotency

For recovery, read journal, verified backups, and current hashes; check confirmation and target identity. Continue the original plan with user confirmation only if every current item equals its recorded before/after state and no unfinished product work/live worker exists. Uncertainty is a conflict; never guess the last completed operation.

For rollback, show exact scope and obtain confirmation first. Restore only files changed by this transaction whose current bytes still match recorded after, using verified backups. Remove only exact files newly added by this transaction and still unchanged. Replace a changed bridge's known new block with the backed-up old block, retaining current outside-block content; never copy back an entire old AGENTS file. Preserve user-edited items, unknown files, and all work/approvals/evidence; these block automatic rollback. Restore old config last and reverify. Mark rolled-back/old version usable only after reaching a fully verifiable consistent old installation; otherwise retain recovery-required and list unresolved items. Preserve backups by default without automatic cleanup.

Same commit/local path-hash set, identical managed content, and no unfinished transaction means up-to-date: no bridge append, config/date rewrite, or work creation. Different hashes require a full plan even at the same semver. Old reports/backups prove no new transaction.

## 0.10 → 0.11

Only new work uses on-demand instruction_refs/worker/knowledge/Gate protocols; dispatch templates advance to schema 4. Existing work, locks, dispatches, and approvals retain original versions without backfilled/replaced references. Freeze context.json and required/conditional resources with other assets. Apply only after unfinished work and live stage/leaf/Hook workers end.

Preserve team Prompts/templates/required instructions, knowledge targets, and unknown fields. Do not automatically move old snapshots to TWG or grant writes to old authorizations. New Confluence integration uses the knowledge setup Skill; installation/login is explicit configuration, not implicit update. Do not register existing .codex/config.toml as method-managed or rewrite tool budgets/models/plugins; merge optional efficiency keys only when explicitly enabled.
