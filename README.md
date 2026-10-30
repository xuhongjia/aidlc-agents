# aidlc-agents

**AI selects a workflow; independent child agents execute each stage. You own key decisions and approvals.**

AI-assisted, Spec-driven, Human-governed. No Python installer, extra Agent CLI, or background service. Source version: **0.16.0** · [GitHub](https://github.com/xuhongjia/aidlc-agents). Installation identity comes from the selected manifest and full commit/file digests; local features do not prove an online release.

English primary · [Original Chinese snapshot](translations/zh-CN/README.md) · [Archive notes](translations/README.md). The pre-English archive is neither installed automatically nor kept in sync.

[Visual guides](visualizations/README.md): delivery architecture and PO / DEV / QA workflow, with interactive HTML and image previews (Simplified Chinese).

## Where to start

| Your situation | Guide | First action |
|---|---|---|
| New project | [Getting started](docs/getting-started.md#install) | Open the product directory; install and check capabilities |
| One person owns delivery | [Solo team](docs/getting-started.md#solo) | Start locally with standard/fix/enhance |
| PO | [PO guide](docs/role-delivery.md#po) | BRD → PRD → approved Story + AC → QA / DEV |
| DEV | [DEV guide](docs/role-delivery.md#dev) | Approved requirements/cases → technical Spec → implementation |
| QA | [QA guide](docs/role-delivery.md#qa) | Approve cases before development; test the candidate |
| Already installed | [Update and recovery](docs/getting-started.md#update) | Inspect source, active work, and differences; preserve Setup |

Send the following instructions to AI; **they are not terminal commands**. Replace `<…>` with real paths, links, and work IDs.

## Install with one prompt

Open the **product code repository** in an AI tool with local file access and independent child agents, then send:

```text
Read https://raw.githubusercontent.com/xuhongjia/aidlc-agents/main/bootstrap/setup.md
and configure aidlc-agents in this repository. Enable GitHub checks and automatic
updates before new requests; keep existing requests on their original version.
Preserve existing rules and business code. Stop after testing child-agent capabilities.
```

AI pins the source, configures `.aidlc/` and the current tool entry point, and tests isolated child-agent startup/return. Start work only after Setup passes; unavailable independent contexts block execution. See [capability requirements](docs/tool-support.md).

Create an empty product repository if needed; PO/QA may explicitly choose a non-code workspace. Keep it separate from the method repository. Unpublished/offline use needs a [pinned local source](docs/getting-started.md#local-source). Do not install every Skill manually.

## Choose your workflow

### Solo teams and general engineering work

```text
Use aidlc in solo mode for <goal, scope, behavior, constraints>, initially without
external systems. Recommend standard/enhance/fix, complete the first stage,
then show its summary/links and wait for my approval and continuation.
```

| Workflow | Use for | Stages |
|---|---|---|
| standard | New capabilities, cross-system changes, or high-risk changes | Intake → Spec → Architecture → Quality → Plan → Implement → Verify |
| enhance | Small enhancements within existing architecture boundaries | Scope → Implement → Verify |
| fix | Local defects restoring clearly established behavior | Diagnose → Implement → Verify |

fix/enhance use `change.md` and `verification.md`, with logs/control records attached. High-risk changes cannot use a short route merely to reduce stages. Solo allows several human responsibility roles; independent agents, real tests, both Gates, and approvals remain required. [Examples and daily use](docs/getting-started.md#solo)

### PO / DEV / QA handoffs

Send `setup role delivery` after installation to configure roles, sources, and actual approvers:

```text
PO: BRD → PRD → standard Jira Story + AC
QA: approve shared business Test Cases, data, steps, expected results
DEV: technical Spec / tasks → Implement-scoped TDD → frozen candidate
QA: UI / manual observations → results
Parent coordinator: independent Gate Reviewers → evidence collection → final approval
```

Jira holds requirements, shared cases, and result summaries; GitLab holds technical Specs, scripts, and full reports. Confluence is optional. Separate sessions resume pinned handoffs; each role waits for other owners' approvals. Formal dual Gates follow required QA evidence; a DEV test handoff is not verified delivery. [Role instructions and prompts](docs/role-delivery.md)

## Approve, continue, and finish

```text
Approve <stage/node> <revision> for <work-id>, and continue to the next stage.
Continue aidlc <work reference>; first check its original version, current node, and approvals.
Show status and blockers for <work reference> without starting execution.
Close the current work for <work-id>.
```

Human stage review is the default. Approval without continuation records the decision and stops. General workflows resolve responsibility through Jira assignee → Git identity → system login; role workflows configure PO/QA/technical/final separately. One person may hold several roles but cannot sign for others. Identity resolution is not approval.

Low-risk built-in short workflows may use two human reviews or genuine work-level delegation for automatic approvals. Automatic selection is not automatic approval. standard and the role team pack remain manual; knowledge publishing, Jira writes, and implementation corrections need explicit scope. [Approval policy](workflow/approval.md)

TDD runs only in Implement; test design may precede it. Every implementation workflow requires independent Architecture / Quality Gates on one frozen candidate, mandatory AC evidence, and approvals. **Implementation Verified Handoff** does not commit/push, mark Jira Done, or deploy automatically. Release/Learn is an [optional team extension](examples/team-packs/release-team/README.md).

## Optional integrations and extensions

| Goal | Entry point / documentation |
|---|---|
| Declare project requirements and check readiness | `setup aidlc` / `setup check` / `setup status` · [Setup guide](docs/project-setup.md) |
| Sync Confluence knowledge | `setup confluence` · [Authentication](bootstrap/knowledge.md) · [Knowledge and automatic publishing](docs/knowledge-publishing.md) |
| Validate and wait for company GitLab CI/CD | `setup gitlab` · [Usage and recovery](docs/ci-cd-validation.md) · [Authentication](bootstrap/pipelines.md) |
| Configure PO/DEV/QA sources, roles, and shared handoffs | `setup role delivery` · [Role guide](docs/role-delivery.md) |
| Customize stages, templates, parallelism, and conditional branches | [DAG usage and AI stage selection](docs/dag-usage.md) · [Team configuration](docs/team-workflows.md) |
| Find the Skill for a stage | [Stage / Category index of 31 Skills](skills/README.md) |
| Understand TDD, independent Gates, and agile slicing | [Engineering Skills](docs/engineering-skills.md) · [Fitness and CI](docs/fitness-and-ci.md) · [Reference mapping](docs/agile-skills.md) |
| Update an installation, resolve conflicts, and recover | [Update steps](docs/getting-started.md#update) · [Full Update protocol](bootstrap/update.md) |
| Reduce context loading | [On-demand loading and sessions](docs/context-efficiency.md) · [Fixed helper summaries](docs/helper-usage.md) |
| Configure role/task model tiers, budgets and efficient Verify | [Execution setup and usage](docs/execution-policy.md) · [Risk review cards](docs/risk-review.md) |

Service configuration grants no write, deployment, or approval authority. Preserve mandatory team requirements. New requests follow the update policy; existing requests retain their method/approvals. Unfinished work or live workers defer updates.

## Engineering boundaries and maintenance

Children read pinned inputs and canonical shared rules. Skills use `skills/<category>/<name>/SKILL.md`; `prompts/`, `workflow/`, `templates/`, `bootstrap/`, and `examples/team-packs/` hold tasks, protocols, outputs, onboarding, and sample packs respectively.

`helpers/` supplies optional read-only Node checks and pure execution decisions. The host still dispatches Agents and enforces real permissions; helpers do not run models, approve stages or install dependencies.

Use a new session per request; resume with its work reference. Chat carries summaries/evidence links, not full history. Static loaded bytes are not measured token or cost savings. The host executes this method; CI, branch protection, real permissions, and human approval remain necessary.

Maintainer check: `node --test tests/*.test.mjs` (not a Setup dependency). See [validation records](docs/validation.md), [delivery rehearsal](docs/delivery-rehearsal.md), and [SECURITY.md](SECURITY.md). There is no overall open-source license; GitHub visibility grants no unrestricted redistribution rights. The four adapted engineering Skills retain upstream MIT notices/license.
