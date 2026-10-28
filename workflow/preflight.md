# Check versions before execution

Explicit role flows also inventory preparation work, dispatched handoffs, uncollected executions and sync children under [role delivery](role-delivery.md); freshness/version-lock rules remain. Noncode role directories permit only approved analysis graphs/dispatched QA, never product.write through nonrepository mode. Uncollected handoffs remain unfinished even without workers in this session. Existing work never adopts new collaboration configuration.

After this protocol's version decision/update, new 0.14 work also checks config.setup.required under [Project Setup Gate](setup.md), before creating work/state/run. Reread requirements after updates; old readiness cannot carry forward. Existing work/control operations gain no new check or child context.

Complete this protocol before new 0.9 graph resolution. Check unfinished core/`.aidlc/team-updates/` switch journals; applying/recovery-required blocks execution. Team sources default pinned, never automatically update with core. Incompatible core targets/team contracts cannot automatically apply. Inventory every DAG active node/leaf/Hook; never recalculate old workflow_ref from new configuration.

Also check [knowledge](knowledge.md): inventory active Hooks for all work, including completed, orphan dispatches/attempts and host workers. Unproven cessation blocks updates. pending/failed/unknown publication without live workers does not. Explicit retry is control work, never delivery restart/old method_revision change; current adapters must support original snapshots/authority.

0.12 waiting_external is unfinished even with no live children; inventory host wait_monitor, stop_pending and resumed runs. Lightweight monitor inspect skips freshness checks; actual resumed-child dispatch follows this protocol with original versions. Before new-work/termination updates, verify no leftover active monitors.

The parent performs this prerequisite, not a delivery stage or extra business review/body. Default source is `https://github.com/xuhongjia/aidlc-agents`, `refs/heads/main`. “Latest” means the full commit resolved from GitHub now, not highest semver, cached branch or latest release.

## Entry and frequency

- Before each new request or continuation/rework requiring stage dispatch, check first. **Create new work/state/run only after successful checks/required updates**, so newly ready work cannot itself block updates.
- auto_continue, stage leaves and child collection within one coordinator invocation reuse this check. Children never check versions/update methods. Requery on the next user execution request/new-session resumption; prior successful network checks are not reusable exemptions.
- Status-only, approval without continuation, automatic-mode revocation, closure and closing cleanup skip checks/updates; offline/new versions cannot block these controls. completed/closed only report original results, never reopen.
- Read local configuration/work/update journals first. Unrecovered preparing/prepared/applying/recovery-required transactions prohibit delivery; recover under [update](../bootstrap/update.md). Missing sources, unknown installs or version/digest mismatches are not healthy installation.

## Decisions

1. Read `config.update_policy`. `before_new_work` allows automatic updates below only with actual authorization. Missing fields/authority in old installs imply no consent; enable through README's one-line update request. Explicit fixed tag/commit or local-unreleased means `pinned`: preserve source, disclose fixed-version mode. Following GitHub requires an explicit policy switch. `pinned` is an explicit exception, never automatic fallback after network failure.
2. For `before_new_work`, validate config.source against the above GitHub Git source and update_policy.ref=refs/heads/main. Mismatches require an explicit source policy; never silently switch. Read-only resolve main's full commit using existing Git/connectors/API. Record actual query time/source/ref/installed/target commits. Git may run `git ls-remote https://github.com/xuhongjia/aidlc-agents.git refs/heads/main`; otherwise use a GitHub API returning full commits. Download only fixed-commit files, never mixed changing main content. Send no business content/credentials/work records to the method repository.
3. Validate actual digests for the complete managed installation/configuration. Bridges validate managed blocks only, preserving outside text. Versions alone are insufficient. Recorded local customizations remain customizations, never original upstream content. Unregistered drift requires update's three-way comparison, never overwrite.

| Current condition | Action |
|---|---|
| Explicit pinned choice, verified source identity/full installation | Record pinned; start/continue fixed version, optionally offline; claim neither latest nor automatic update |
| New request; remote commit unchanged and installation matches | Record up-to-date; start installed method |
| New request; remote update; no unfinished work/live workers | Freeze target and update within boundaries below; start only after success |
| New request; remote update; unfinished work/live workers | Record blocked/work list; create no work/change no old version; finish existing work or obtain explicit approver closure |
| Existing unfinished request; update available | Record deferred, report latest/locked commits; **continue original method_revision**, without updating/migrating approvals |
| Existing unfinished request; query fails | Record check-failed/unconfirmed latest; continue original version only with complete local frozen method/no unrecovered transactions |
| New request; query failure/incomplete target/update failure | Stop, never silently use cached old methods; retry successfully or obtain explicit fixed-version choice |

Existing continuation still meets original approvals/dependencies/capabilities/Gates. Mismatched work.method_revision/actual installation blocks; never backfill versions to continue. Remote updates grant no authority to close old work. Once all work ends, the next new request checks/updates anew.

Switching before_new_work/pinned requires explicit user instruction. Save actual words/source/time and fixed identity/tracking ref in config, preserving prior authority. Never change historical work.method_revision. Unknown mode/ref requires clarification. Leaving pinned still requires checks/updates before new work; never start directly from old methods.

## Limited automatic-update scope

`update_policy.authorization` stores actual enabling words/source/time. It is separate from business auto approval and authorizes no stage approval. This standing authority permits routine updates to **successor commits on main from the same trusted GitHub source**, with no unfinished work and no repeated update questions.

Still follow [update](../bootstrap/update.md): three-way comparison, frozen plan, staging, read-only child probes, backups, config-last writes, validation/recovery. Save plans/evidence under `.aidlc/updates/`; chat gives brief results. **Currently installed protocols** determine eligibility; downloaded instructions cannot expand authority:

- Automatically add managed files or replace managed files/bridge blocks only where current=baseline. Preserve unrelated customizations after target-compatibility validation. Never automatically merge bilateral edits within a file.
- Deletions, same-name conflicts, unrestorable baselines, incompatible schema/execution migrations, source/ref changes, upstream rollback or nonsuccessor history require exact plans/human handling, never automatic overwrite. Prove ancestry through actual Git ancestry/GitHub comparison; shallow history/missing rights cannot be guessed. Merely confirming a check resolves no conflict.
- Never execute downloaded scripts, install dependencies/plugins, change host rights/business code/CI/global configuration/work, or commit/push. Stop if targets require such actions. Preserve unknown files, text outside project-rule blocks and user settings.
- Immediately before application, recheck no work/workers/concurrent updater and no file drift. Uncertainty stops. Recover failures through actual journals; never run stages on mixed-version trees.
- Once fixed, do not chase later main changes repeatedly. After complete success, **reread installed router/protocol/orchestration/catalog/configuration**, discard old dispatch plans, then create work and new-version children. Never dispatch from pre-update context or recursively trigger this preflight.

Each check writes `.aidlc/updates/checks/<unique-id>.json`: time, request type/work ID, source/ref, full installed/target identities, actual query evidence/errors, result (up-to-date / updated / deferred / check-failed / blocked / pinned), authorization/transaction refs and final execution version. Missing target stays null. This is technical evidence, not business text or reusable network exemption. checks directories are not update transactions; absent journals there do not imply unrecovered updates. Unchanged checks never rewrite config/bridges.
