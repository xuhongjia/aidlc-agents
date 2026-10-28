# PO / DEV / QA handoff: parent coordinator

Read only with explicitly enabled config.collaboration/[role-team](../examples/team-packs/role-team/pack.json). Built-in standard/fix/enhance/old locks/authority remain unchanged. This is coordination only; extensions/dag/orchestration dispatch independent children, whose Prompts perform business work.

## Setup and storage

Use [configuration template](../templates/collaboration/config.json)/existing Jira/GitLab connections/projects/fields/work types/roles. Verify schemas; never infer IDs/change Jira administration. Default ordinary Story/Task: one test-design Task/Story with stable Case IDs, one result Task/execution round, never tickets/unit test. PRDs may use Confluence or Jira-linked documents/attachments; no duplicate editable Confluence cases.

Resolve approvers.po/qa/technical/final uniquely to stable accounts or explicit configured field/object rules. They approve requirements/cases/technical design and implementation candidate/final test conclusions respectively. Changed test Oracles also need QA; changed business expectations PO. Missing/conflicting identities, revocation/unverifiable decisions stay pending. **Never substitute Story assignee → Git → login for missing roles.** One person may hold multiple roles; record actual identities/roles without claiming independent humans. Role approval grants no external-write authority; old auto/knowledge_publish grants no Jira writes.

PO/QE may install the frozen method in designated noncode directories with .aidlc/config.json/team/work/read-only snapshots, without Git initialization/checkout. Only team.prd/team.story/team.test-design analysis/dispatched remote QA qualifies, never product.write. Still verify source/package integrity/fresh-child/collect probes/scoped role reads. DEV/main delivery needs actual business repository. Missing local frozen files/children blocks; no inline substitutes.

Empty templates are unready. Setup ends before business work. Obtain operation-specific source-read/Jira-create-update/optional-PRD-publication/test-environment authority. [authorization](../templates/collaboration/authorization.json) records targets/operations/deadlines/actual sources, no credentials. Missing rights yield gaps, never plugin installation/delegated login. Confluence uses TWG setup; knowledge authority never grants PRD publication.

Browser execution needs declarative bindings. Setup resolves real host read/navigation/interaction operations/schemas; installed derived team pack and QA stage.tool_binding_ids declare required operations/targets/effects/authorization_ref=null. Show exact differences/install within authority; record local-derived origin/template commit/digests, never unchanged-upstream claims. Overrides cannot add existing-stage operations: create namespaced QA stages/workflows selected by config.collaboration.workflow_id, reconfirm/freeze. Empty bindings permit template/static graph checks only; QA stays unready. No ad hoc browser operations. Real runtime authority refs belong only in dispatch, never packages.

## Independent entry and admission

New analysis/delivery work completes version preflight/applicable Setup. Existing work/continuation handoffs keep original method/graph/approval; missing definitions require exact-version recovery, never handoff upgrades. Noncode project facts describe role/business scope/connections, never fabricated source inspection.

Same-Story continuation from requirements_ready/test_design_ready pins selected method; a new session is not a new request. Another PRD-derived Story may check versions independently, citing original PRD approval/sources without rewriting its method. Conflicting method sources need explicit resolution, never current-installation preference.

| Entry | Graph / endpoint meaning | Responsibility |
|---|---|---|
| BRD to PRD | team.prd / analysis_complete, PRD ready | PO clarifies scope/decisions; no invented facts |
| Normalize PRD/original requirements | team.story / analysis_complete, requirements_ready | Story/AC business Spec maps every FR/NFR; Bugs use reproduction/expectations |
| Generate/review cases | team.test-design / analysis_complete, test_design_ready | QA approves exact cases; design executes no TDD |
| DEV implements Story | team.role-delivery | Approved sources→technical design→Implement→QA→Verify |
| QA executes/returns results | Dispatched qa node, same graph | qa_execution_complete means complete records; FAIL/NOT_RUN blocks |

Frozen pack supplies actual IDs/bindings. Preparation is analysis only, never delivery/verification/business-work bypass. Admit Story/slice separately; no need to write all PRD Stories first. DEV investigates source-answerable questions; PO resolves business questions. Missing AC/QA case approval, behavioral ambiguity/unprovable sources prohibit Implement.

Parent validates incoming semantics/fields. acceptance.json retains original requirements[{id,source_ref,ac_ids,exclusion}] and criteria[{id,statement,verification,source_refs}], unique IDs/complete sources/traceable AC-exclusions. Reject aliases-only, empty statements/missing mappings despite claimed PASS. Drafts also require valid format; approval cannot repair outputs.

## Frozen handoffs and a single writer

Resumable [handoffs](../templates/collaboration/handoff.json) preserve method/workflow identity, stable Story/project IDs, state revision/controller/dispatch, original requirement/approval sources, frozen assets/candidate. Remote resources need readable frozen snapshots/SHA-256. Mutable URLs/titles/status locate content, never replace approvals. Record Jira updated/version/snapshot digests; ordinary Tasks do not ensure immutable cases. Approval cites frozen bodies separately, never hash cycles.

Original parent alone writes state/review/approval. Cross-session work retains work/graph; chat summaries are not handoffs. QA packets retain original dispatch bytes/frozen assets/all required inputs/candidate manifests/environment-artifact bindings/explicit authority. Transfer via authorized Jira attachments/frozen GitLab resources. Restore/verify original relative paths in isolated directories without changing workflow_ref. state_locator finds source records. Return {uri,sha256}; parent fetches/verifies into work evidence.

Reservations bind controller/work/step/revision/run/dispatch hash/executor/status/time. [Leases](../templates/collaboration/lease.json): issued_at/expires_at/revoked_at. Issued reservations prohibit concurrent same-node dispatch by original coordinator. Takeover needs proven prior-worker/writer stop/explicit transfer; expiry alone proves no stop. Uncertain unique control blocks; no distributed lock service. Before accepting, verify reservation/original graph/candidate/live authority/latest source changes/valid approval. Duplicate returns check stored digests only; late/old revisions never advance.

Approved completed-preparation outputs survive worker leases if produced within valid execution time, with complete digests/approvals/current applicability. They grant no execution authority. QA starts/writes still require current dispatch/authority/live control. Historical completion overrides no revoked content/approval/changed baseline.

handoff.control_locator identifies controller-maintained live-readable state, bound to controller/original dispatch/work revision/candidate/authorization IDs/closure-revocation. Immutable grants prove no live validity. Remote QA rereads/verifies control before every side effect. Expired/revoked authority, reassignment/closure/unreachable/nonunique control stops execution; no offline-cache clicks. Revocation updates ledger first/stops unfinished workers/preserves snapshots. No shared-readable current control means blocked cross-host execution; hosts sharing controller state may execute with all checks. Issued calls may have effects: retain actual outcomes, never atomic-revocation/remote-transaction claims.

Use [control-state](../templates/collaboration/control-state.json) in existing shared files/authorized storage, no new DB/services. Every read saves [control-observation](../templates/collaboration/control-observation.json)/raw responses bound to action invocation_id/locator/time, with actual read-source/caller identity. “Live/active” text proves no trust. Update ledgers promptly on transfers/revocations; preserve responses.

Remote QA verifies complete candidates under worker. Scoped frozen-commit/file GitLab reads/deployment observations need no manual Git. Inaccessible/unprovable scope, unpublished local changes/unlinked running artifacts block; manifests alone do not verify. QA writes assigned results/evidence only, never central state/source.

## Implementation, QA and one formal dual Gate

Repository technical Spec at team-configured paths covers architecture/API/data constraints/rationale/business-readable slices. Cite frozen Story/AC, never duplicate editable business truth. Plans link AC/task dependencies/test-source scope/authority. Establish architecture/Quality Fitness rules before coding; missing Gates require design/Implement installation regardless of Jira origin.

QA-approved cases are independent Oracles. DEV uses Implement TDD/affected regressions against approved AC/Oracle, without one-unit-test-per-case mapping. [script-mapping](../templates/collaboration/script-mapping.json) separately links Case versions/digests to scripts/checks, allowing one-to-many; generated scripts never embed case bodies into hash cycles. Host-browser execution may register browser_protocol without mandatory UI framework; manual items retain protocols. Mapping proves no execution. Candidates include code/tests/fixtures/config/relevant technical-Spec inputs.

Candidate-digest mapping/execution/approval records stay external technical-evidence attachments, optionally frozen GitLab locations. Exclude self-referential records from candidate digest, never scripts/fixtures. Identical candidate/case baselines may reuse DEV/CI checks' original execution_ref/executor/time/full reports without rerunning/relabeling as QA. Browser/manual steps require current-round observations; no stale/cross-candidate/incomplete reuse.

After technical-owner confirmation, Implement returns implementation_ready_for_qa, never terminal/Gate/all-AC PASS. Execute real browser steps in ui_tests environments within specified accounts/data setup-cleanup/actions/effects. Verify current build then capture observations/screenshots/logs. Unknown environments/production targets/missing login/unfinished human judgments stop with NOT_RUN. QA edits no scripts; defects/case changes return to controlled Implement under [sync](testcase-sync.md).

After QA-owner confirmation, parent dispatches two independent Reviewers then independent collector. Verify same candidate/approved rules/DEV TDD-regressions/QA evidence/every AC. Reviewer/leaf dispatches include QA baselines/test-run/script-mapping/raw refs beyond DEV self-tests. Formal dual Gates default once here; DEV self-tests are not formal Gates. Only no drift, complete evidence and actual final-role approval produce Implementation Verified Handoff. Done/publication/deployment/benefits remain separate, never automatic.

## State and updates

Status/approval/revocation/closure use original work, unblocked by new setup. testcase-sync publication is separate: failure cannot undo verified delivery, success cannot replace Gates. Active prep/QA/sync children/uncollected handoffs count toward capacity/stop/update inventories. Failed publication without workers cannot block upgrades forever; retry original content/authority without regeneration.

config.collaboration/work/sync ledgers survive method updates; only missing config keys get null. Never backfill role authority/sources/fields into old work. Cross-session resume reads current-node inputs only; attach full logs without loading other role Prompts.
