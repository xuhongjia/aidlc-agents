---
name: aidlc
description: Route feature, change and bug-fix requests into AIDLC; coordinate workflows, approvals and recovery.
---

# AIDLC · Parent coordinator

Route, schedule, verify and process approvals; formal stages need real fresh-context children, never inline execution/role switching. Unprefixed paths are relative to .aidlc/system; prefixed paths to project root. Existing work uses its original method copy, not the active install.

Software delivery action requests enter by default, without an AIDLC keyword or workflow choice. Infer intent from the request, not keywords alone: explanations, reviews, proposals and explicit analysis-only requests start no delivery. Preserve explicit scope and role handoffs; continuing existing work resumes its frozen route.

## Load one entry by intent

| Request | Load and action |
|---|---|
| Browse Skills by stage/category | skills/README.md or skills/catalog.json; selected group only, no bulk bodies or dispatch |
| setup aidlc / setup check / setup status / required integrations | skills/setup/aidlc-setup/SKILL.md; install/check/configure then stop, no work |
| Configure model tiers / execution budgets | skills/setup/aidlc-setup/SKILL.md; selected execution setup only, no model calls or delivery |
| Choose a workflow / getting started | workflow/profiles.md; give reasons/next step, ask only route-changing questions. Advice starts no work, update check or dispatch |
| Configure a team workflow | skills/orchestration/aidlc-workflow/SKILL.md and bootstrap/team.md |
| setup confluence / knowledge integration | skills/setup/aidlc-knowledge-setup/SKILL.md |
| setup gitlab / company CI/CD | skills/setup/aidlc-pipeline-setup/SKILL.md |
| setup role delivery / PO DEV QA handoffs | skills/setup/aidlc-role-setup/SKILL.md |
| BRD to PRD / standardize requirements / design-review cases | Respectively skills/role-collaboration/aidlc-prd/SKILL.md, skills/role-collaboration/aidlc-story/SKILL.md, skills/role-collaboration/aidlc-test-design/SKILL.md; chosen entry only |
| QA testing / sync cases or results | Respectively skills/role-collaboration/aidlc-qa/SKILL.md, skills/sync-publication/aidlc-test-sync/SKILL.md; verify the original handoff, no duplicate delivery |
| Status | Specified work state/evidence; clarify ambiguous work identity, no worker |
| Approval only | Original review/approval/candidate, workflow/approval.md and workflow/identity.md; stop without continuation authority |
| Close / closing / closed | workflow/closure.md; do not mark closed before workers stop |
| Retry knowledge publication | workflow/knowledge-publish.md; verify original snapshot/grant, do not restart delivery |
| Pipeline wakeup / stop waiting | Original workflow/pipeline-wait.md for existing waits; legacy/unregistered waits get status only, no new fields/monitor |
| New feature / behavior change / bug fix / continue implementation | First .aidlc/system/workflow/preflight.md; update before new work, pin old method/graph/grants. Before 0.12 use workflow/legacy.md |

Configuration stops without delivery, monitoring or publication. Reference/discussion grants no work creation, tickets or external writes.

Only explicit role workflows load workflow/role-delivery.md for setup, approvals, handoffs and post-QA Gates. Missing configuration routes to setup; never automatically convert existing Jira issues.

## Delivery chain

1. Read config/state and .aidlc/system/workflow/protocol.md. For new work under auto, assess intended behavior, scope, risk and unknowns; select the smallest suitable registered graph under profiles + extensions. State the workflow and brief reasons before its first dispatch; do not ask the user to pick when facts suffice. Respect explicit preferences subject to risk rules. Existing work verifies workflow_ref instead of reselecting.
2. workflow/dag.md selects ready nodes; workflow/orchestration.md governs spawn/collect, candidates and stops. Derive complete instruction_refs via workflow/context.md; runs use prompts/composed-stage.md and fixed packets, never parent history/all Skills.
3. The selected route's first read-only child verifies risk; no extra routing Agent/stage. Record reasons/unknowns in state.routing_reason and review.routing_facts; first card confirms graph/scope/outputs. Ask only unresolved questions that change the route or authorized scope. workflow/approval.md governs manual/checkpoint_low_risk/auto_low_risk. Route auto is not approval; checkpoint final Verify stays human-reviewed.
4. Verify worker, inputs, full candidate and required checks/evidence; create immutable review. Cards show differences, decisions, risk and links. Results are not approvals; no continuation authority means stop.

Load workflow/implementation-feedback.md only for feedback_request with nonzero budget; record attempts before new runs. Other failures stop and revoke delegation/escalate under the original protocol. waiting_external follows pipeline-wait without PASS/approval; new work freezes configured delivery under pipeline-config.

Load only when triggered: Verify parent checks → workflow/gates.md; identity refresh → identity; knowledge approval/promotion → .aidlc/system/workflow/knowledge.md; publication → separate Hook; Release/Learn evidence → external-evidence. Stages/leaves/Hooks all count toward capacity and update blocking.

Graph/responsibility/grant changes preserve snapshots and require reconfirmation. Never redispatch completed work or revive closed grants. This host cooperation protocol is not an unbypassable permission system.
