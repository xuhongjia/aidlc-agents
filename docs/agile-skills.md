# Agile usage and Skills references

0.13.1 adapted selected Matt Pocock practices within existing stages. fix/enhance remain three stages/two main documents; Standard ends at verified handoff. No design/ticket/retro stages were added.

## Usage

For workflow advice only:

> Recommend fix/enhance/team for <request>, with reasons, without starting work.

To start delivery:

> Use aidlc for <request>. Inspect existing code/terms; clarify behavior-affecting gaps. Use small verifiable slices, serializing dependency/file conflicts under the approval policy.

For an existing large request:

> Continue aidlc WORK-ID from pinned inputs/dependencies. Expand executable slices only; explain blockers/integration checks without rereading full chat.

Scope/Diagnose combine behavior/design/Oracle/slices in change; Standard uses Spec→Architecture→Quality→Plan. Task IDs/dependencies express ticket relationships. Trackers are optional; external sync needs explicit configuration/authority.

Verify may propose knowledge from evidenced friction; real operating feedback needs explicit Learn. Engineering advice is not business acceptance; one incident warrants no automatic global rule.

## Reference mapping

Checked 2026-10-26 at [5beb35b](https://github.com/mattpocock/skills/tree/5beb35b040e3de97e54fa9e386d7e42d15c295c2/skills/engineering). These design adaptations are neither installed/verbatim ports nor full upstream-command support.

| Upstream Skill | AIDLC application | Adaptation boundary |
|---|---|---|
| ask-matt | aidlc routes advice/configuration/delivery/approval first | Advice recommends a route without creating work or loading the full Skill catalog |
| grill-with-docs | Key clarification and business terminology in Intake/Spec/Scope | Inspect code first; ask only decision-relevant questions; use existing documents without creating GLOSSARY by default |
| to-spec | Spec or short-workflow change | Reuse confirmed inputs and preserve source→AC traceability; no automatic issue publishing |
| improve-codebase-architecture | Boundary and interface choices in Architecture | Encapsulate complexity; analyze only the request, without default repository-wide scans, HTML reports, or broad refactors |
| to-tickets | Vertical slices and prerequisite Task IDs in Plan/change | Each slice is independently verifiable; avoid batches by technical layer and extra ticket reports |
| implement / implement-spec | Task dependencies, exclusive writers, and final integration in Implement | Propose parallelism only when conflict-free and useful; the parent dispatches, without one Agent per ticket or automatic commit/merge |
| wayfinder | Blocking decisions and existing task index for large requests | Keep detailed decisions in one place; resolve current blockers without adding multi-session decision processes to small work |
| triage | Classify issues, facts, and current state in Intake/Diagnose | Inspect current implementation/reproduction; no new tracker-label state machine or automatic issue closure |
| setup-matt-pocock-skills | Existing bootstrap/team and minimal host entry point | Reuse project conventions; do not install the full upstream toolset or add setup dependencies |
| retro | Engineering lessons in Verify and feedback revisions in Learn | Fact→impact→minimal proposal→validation; proposals do not automatically change Skills, Oracle, Gates, or enterprise standards |

Upstream [writing-for-agents](https://github.com/mattpocock/skills/blob/5beb35b040e3de97e54fa9e386d7e42d15c295c2/skills/productivity/writing-for-agents/SKILL.md) also supports a single rule source and conditional loading. AIDLC applies these principles through its own concise guidance. Upstream is [MIT / Copyright (c) 2026 Matt Pocock](https://github.com/mattpocock/skills/blob/5beb35b040e3de97e54fa9e386d7e42d15c295c2/LICENSE); any future substantial text import must include the license. The package's existing TDD adaptation remains based on [Addy Osmani](engineering-skills.md); no second TDD Skill is installed.

## Control context loading

- Skill wrappers only route entry points. Children read the pinned worker, role differences, current Prompt/template, and capability contracts.
- Shared approval, lock, write-permission, and evidence rules live in worker; dual-Gate details live in gate-execution. Stages do not repeat the full rules.
- Main documents summarize decisions/diffs; logs/candidates remain evidence. Read approved AC/Oracle, mandatory team rules, and necessary inputs fully.
- Entry length excludes dependencies. Measure stages/both Reviewers; count repeated collectors/leaves/feedback/CI-knowledge Hooks separately. See [measurement scope](context-efficiency.md).

New-work-only upgrades preserve old locks and team conflict rules; never automatically change host model/reasoning/plugins/tool settings.
