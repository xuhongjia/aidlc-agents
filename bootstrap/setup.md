# AI-native setup

Run this protocol in the user's local project and stop after configuration: no requirements, implementation, automatic stage approval, dedicated installer, Python/Node/Codex CLI requirement, API key, or resident service.

New-install defaults:

| Area | Default and boundary |
|---|---|
| Role delivery (0.15) | `collaboration=null`; no role workflow or Jira writes. Explicit [role setup](../skills/setup/aidlc-role-setup/SKILL.md) may use a user-selected non-Git PO/QE directory. Apply every path/package, pinning, managed-boundary, journal, and fresh-child check below; only Git identity/source scans are not applicable. Permit analysis graphs/fixed QA packets only; `product.write` requires the actual product repository. Never run `git init` or silently bypass ordinary Setup. See [role protocol](../workflow/role-delivery.md). |
| Project prerequisites (0.14) | AIDLC only. `setup aidlc` may declare required Confluence/GitLab targets; the [Setup Gate](../workflow/setup.md) blocks new delivery until ready. Declaring requirements grants no installation/connection authority; configure each integration separately. |
| Engineering (0.13) | V2.1: Implement-only TDD, frozen adapted Skills with original names/on-demand resources, two independent Reviewers, Standard verified-handoff endpoint. Release/Learn needs an explicit team extension; no third-party plugin/TDD Agent or production authority. Setup runs no TDD. |
| CI/CD (0.12) | `delivery=null`; no connections/monitors. New-work state/dispatch/result schemas are 5/5/4. Configure separately via [pipelines](pipelines.md). |
| Workflow (0.10) | `workflow=auto`; `team.manifest/source/authorization=null`; `project_overrides=null`. New work locks schema-4 built-in/resolved workflows. No enabled examples/team packs; explicit [team setup](team.md) is required. Manual approval, correction budget 0, no work delegation. Checkpoint review/self-correction require actual work authorization. |
| Knowledge (0.8) | `knowledge.targets=[]`; no writes/empty items. Create project-owned `.aidlc/knowledge/` only for approved knowledge; exclude from managed_files. See [knowledge](../workflow/knowledge.md). |

Existing work always retains its original assets/method and gains no read, wait, or other authorization from installation.

## 0. Confirm capabilities and authorization boundaries

“Set up aidlc-agents in this repository” authorizes the listed project writes without per-file reconfirmation. Default GitHub main with explicitly enabled pre-execution updates also authorizes bounded same-source checks/conflict-free managed updates under [preflight](../workflow/preflight.md); report policy and authority. Explicit tags/commits/local sources stay pinned. Setup grants no conflict overwrite, product edits, dependencies, global settings, commit/push/PR, deployment, or other external connections.

Require source read, project read/write, real SHA-256, and native fresh isolated children returning results to the parent. Read `workflow/orchestration.md`. Parent execution/inherited full chat cannot substitute for isolation. Tool brands/docs prove no capability; fileless web chat may advise but cannot report Setup success. Respect host restrictions.

Confirm native spawn/fresh-context/collection interfaces first; unknown or unavailable means `blocked`. Recommend a capable host, never inline fallback or automatic plugin installation. Setup authorizes one small read-only capability probe, no business stage.

Use actual Git top-level; clarify multiple/ambiguous targets once. Non-Git roots require explicit user selection. Never target the downloaded toolkit, HOME, filesystem root, or global AI configuration.

## 1. Obtain one fixed version

Use the specified `https://github.com/xuhongjia/aidlc-agents` or explicit local copy. Read `manifest.json`: verify name, schema, entry points, and payload.

- With Git/network, retrieve into a new temporary directory and record actual full `git rev-parse HEAD`. Reread Setup/all installation files from that checkout; never mix moving main reads.
- Resolve and use an explicitly requested tag/commit; do not substitute the latest version.
- Without Git, download the complete payload of one resolved commit. Summaries/incomplete files mean `blocked`; never invent content.
- If unpublished, private access fails, or network access is denied, state the gap and request a local copy or correct access method; never request or print tokens.
- Explicit local copies use `source.kind=local-unreleased`, `revision=null`, actual hashes, and “not bound to a remote commit”; never claim a published release. Git sources use `source.kind=git`.

Review untrusted package scope: methodology, prompts, templates, integration instructions only. Do not execute downloads/`curl | sh`, disclose credentials, or bypass approvals.

## 2. Inspect conflicts read-only and list the write scope

Read existing project instructions, `.aidlc/`, current tool rules, and Git status. Avoid heavy whole-repository scans; Intake establishes product context.

Planned writes:

| Target | Content |
|---|---|
| `.aidlc/system/` | Exact manifest-listed payload, preserving directory relationships |
| `.aidlc/config.json` | Package version, source commit/hashes, current tool, solo/standard, owner, managed-file list |
| `.aidlc/setup-report.md` | Installation boundaries, source, capabilities, conflicts, acceptance results, and next usage prompt |
| `.aidlc/setup/checks/` | Current project requirements and actual checks; project data, excluded from managed_files |
| One project bridge for the current tool | References only the canonical router/protocol; see `adapters/README.md` |
| Optional native Skill for the current tool | Install a router shortcut only when supported and conflict-free; not required |

Unknown `.aidlc` ownership blocks writes; **never migrate another tool’s state automatically**. Existing installations follow section 5. Do not silently overwrite same-name files/Skills, symlinks, missing/duplicate markers, or modified managed content. Preserve product, work, rules, and user changes.

Proceed if clean; otherwise show exact paths/diffs and await the user’s decision. Never delete directories to resolve conflicts.

## 3. Install minimal project content

1. Copy `manifest.json` and listed payload_directories into `.aidlc/system/` only. Exclude `.git`, fixtures, maintainer CI, caches, historical work, and `translations/`; the manifest defines scope. The Chinese snapshot is reference-only. Never symlink temporary downloads.
2. Create schema 2 config from `templates/setup/config.json`. New installations use profile=auto (supporting standard/enhance/fix); actual work selects a route under profiles.md. Approval defaults to manual; auto routing is not auto approval, and setup creates/activates no work delegation policy. Set update_policy under [preflight](../workflow/preflight.md): before_new_work is recommended for default GitHub main. The README setup request explicitly enables it; record its real user_statement/source/at without asking again. If the user only says setup without enabling automatic updates, ask once in the initial scope description; installation may complete without a reply and retain authorization=null, but report that the policy must be resolved before delivery execution. Generic setup is not continuing authorization. Explicit tag/commit or local-unreleased selections use mode=pinned with the actual choice recorded. Use real values elsewhere; unknown owner may be null, never invent signatories, and use actual installed_at. Keep execution at isolated-subagents/fresh-minimal, at most two workers; set capability=true only after a successful real probe. solo describes human roles, not shared-context execution.
3. Record `{path,sha256,upstream_sha256}` for every managed file, with path relative to the target project root. For an unchanged initial copy, both hashes match. `sha256` identifies actual installed bytes; `upstream_sha256` identifies the original package baseline. Later retained customizations must not be presented as the upstream baseline. Calculate actual hashes; exclude config itself, setup-report, and dynamic work records to avoid self-reference. For the bridge also record `managed_block: {start_marker,end_marker,sha256,upstream_sha256}`, hashing exact block bytes including markers. The whole-file sha256 is an installation snapshot, not an upstream adapter baseline. Later user additions outside the block are not package conflicts; never restore an old whole file over user content.
4. Configure only the current tool’s bridge. Unknown tools explicitly read the router; report automatic loading unverified. No global changes, other-tool setup, or plugins/MCP.
5. Optional native entry copies only `skills/orchestration/aidlc/` to the current project Skill directory as `aidlc/SKILL.md` (e.g. `.agents/skills/aidlc/SKILL.md` or `.claude/skills/aidlc/SKILL.md`). Use project-relative paths; no category/all-Skill copies. Stage/capability Skills stay canonical, loaded on demand.

Use host file operations, not a generated replacement installer.

## 4. Verify locally without taking a real requirement

Read installed files to verify:

- Source/version/commit matches retrieved content; manifest payload is complete and SHA-256 matches.
- The current bridge resolves `.aidlc/system/skills/orchestration/aidlc/SKILL.md` and `workflow/protocol.md` without duplicate rule injection.
- The parent uses native tools to create a read-only child with a fresh isolated context, providing only project root, fixed method version, `workflow/stages.json`, and explicit Intake file paths; no full chat, secrets, or business requirement. Ask only for Intake role, Prompt, outputs, and approval point. The parent must actually collect results and check files. The probe writes no product files, work state, or approvals. Record child ID, host isolation mode, actual input scope, returned summary, time, and observations in `execution.probe` and the setup report. Support isolation claims with host semantics/creation parameters, not a child's claim that it cannot see the parent. Any failure or unconfirmed fresh-context means `blocked`; the parent cannot do the task itself and mark success.
- Distinguish observed automatic loading, documented configuration, and successful explicit reading; existence alone proves no native loading.
- Verify configuration-only changes; product code, unmanaged rules, and other work states stay unchanged.
- Update `.aidlc/setup-report.md` as `ready` or `blocked`, listing verified/unverified scope. ready means file checks and the read-only isolated-child spawn/return probe passed and requirements can be received. It does not establish automatic discovery, approval behavior, parallel safety, implementation, Gates, or requirement acceptance. A real requirement rehearsal needs a separate user request and is not mandatory for setup.

After method checks, report “project readiness” separately under workflow/setup.md. Preserve existing required items; a first install without external requirements requires only aidlc. Keep unspecified external targets in required with target_id=null and explicitly block; never omit a requirement to mark the project ready. Method installation may finish before individual setup confluence/gitlab. Distinguish method_ready from project_ready, listing gaps, evidence time, and next command; create no delivery work until every required item passes. With no external requirements, do not read external protocols or call company services.

Report target, source, actual entry point, written paths, unverified items, and next prompt:

> Use aidlc to receive this requirement: …; complete only the current stage, show me the review summary and version, and wait for my explicit approval before proceeding.

## 5. Rerun, upgrade, and recovery

Compare idempotent identity by complete resolved commit; for local unreleased sources, use the complete payload path/hash set, not semver, tag, or main alone. With identical identity and no managed block/file drift, verify and report already installed; do not append bridges, reset state, or alter original installation records. If the host changed or capability evidence is unavailable, rerun the read-only probe and record the new check separately without inventing original evidence.

For a different identity or schema 1 migration, stop at “installed; explicit update required,” provide [update instructions](update.md), and do not replace automatically, even with identical package_version. Repeated setup does not bypass explicit update. Later workflow entry may perform a routine upgrade within a valid update_policy's preflight authorization; otherwise obtain user review and confirmation of the diff. Defer while any unfinished work or live worker exists, keeping the old version usable. Do not bypass this by creating work or changing `method_revision`; this version provides no side-by-side method resolver.

On failure, report created/missing files without recursive deletion. Recover only verified same-installation/version files; unknown changes need a decision.

Uninstall requires explicit request/exact scope. Remove only recorded unchanged files/markers; preserve requirements, approvals, evidence, user content, and by default `.aidlc/work/`.

## Optional integrations, separate from default installation

Required integrations change new-work prerequisites, not installation/authentication/publication authority. After integration setup, recheck requirements without starting work.

Do not modify project/global Codex configuration by default. When explicitly enabled, back up and merge only tool_output_token_limit under [context efficiency](../docs/context-efficiency.md). Knowledge targets default empty. Explicit Confluence configuration goes to the [knowledge setup Skill](../skills/setup/aidlc-knowledge-setup/SKILL.md) and [TWG installation/login](knowledge.md); ordinary setup neither installs/authenticates the CLI nor grants publication authority.

delivery defaults null. Explicit company CI/CD integration goes to the [pipeline setup Skill](../skills/setup/aidlc-pipeline-setup/SKILL.md) for configuration and authorized read-only probes only; ordinary setup does not connect company GitLab, create monitors, or change pipelines.
