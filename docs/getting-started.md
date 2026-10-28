# Getting started with AIDLC

Install before starting work. Code blocks are **prompts for AI**, not terminal commands; replace `<…>` with real values. No manual JSON editing or individual Skill installation is needed.

## Choose your starting point

| Your situation | Start here | Prepare first |
|---|---|---|
| New project; you own requirements, development, and acceptance | Installation below → [solo team](#solo) | Business goal and actual project directory |
| Existing project needing a fix or feature | Install or update → [choose a workflow](#first-work) | Observed behavior/goal and existing code |
| PO only: BRD → PRD → Jira Story | [PO guide](role-delivery.md#po) | BRD/original requirements and Jira project or a target to confirm |
| DEV only: implement a Story | [DEV guide](role-delivery.md#dev) | Business repository, approved Story/AC, and QA-case handoff |
| QA only: design cases or execute UI tests | [QA guide](role-delivery.md#qa) | Approved requirements; execution also needs candidate, environment, and dispatch package |

Solo combines human responsibilities, not Agents or Gates. Each role hands off without approving for other owners.

<a id="install"></a>
## Step 1: prepare the workspace and install

### 1. Open the correct directory

- **Development:** open the product code repository, separate from the downloaded method repository.
- **No project yet:** start with an empty Git repository; no scaffold is required:

```text
Create an empty Git repository in <product directory>, preserving existing files.
Do not generate business code or install stack dependencies.
```

- **PO / QA without source access:** explicitly select a local role workspace; Git is optional. Follow the [role guide](role-delivery.md). DEV implementation still requires the real business repository.

Setup tests directory read/write, fresh isolated child-Agent creation, and result collection. Without these, execution is blocked. See [tool requirements](tool-support.md).

### 2. First installation

In the product-repository session, send:

```text
Read https://raw.githubusercontent.com/xuhongjia/aidlc-agents/main/bootstrap/setup.md
and configure aidlc-agents in this business repository.
Enable GitHub checks and automatic updates before new requests; keep existing requests
on their original version. Initially require only AIDLC; configure external integrations later.
Preserve existing rules and business code. Stop after the child-Agent capability test
and tell me the next step.
```

Preserve mandatory team integrations. Installation configures the method/entry point without starting work or creating features.

Require a report of target, source commit/digests, actual probe, `method_ready` / `project_ready`, gaps, and next instruction. Files alone do not establish readiness.

<a id="local-source"></a>
### 3. Use a pinned version or unpublished local copy

Inspect the selected manifest, Skills, and team pack: local version numbers do not prove availability on online `main`. Explicitly select unpublished sources:

```text
Read <local aidlc-agents copy>/bootstrap/setup.md and install this local method package
in the business repository. Record local-unreleased provenance and actual file digests.
Pin this source without automatically switching to GitHub main. Require only AIDLC,
preserve existing rules, and stop after the independent child-Agent probe.
```

Tags/commits also stay pinned; change sources through Update. For PO/QA, replace “business repository” with “specified PO/QA non-code workspace, for role analysis or frozen QA execution packages only.”

## Step 2: configure only the integrations you need

After installation, ask AI:

| Need | Instruction | Result after readiness |
|---|---|---|
| Local solo development | `setup aidlc. Use solo mode; initially require only AIDLC readiness.` | Built-in standard/fix/enhance without Jira/Confluence/company CI |
| PO / DEV / QA handoffs | `setup role delivery. Configure the current role, Jira/GitLab sources, and approvers.` | Role workflows and shared handoffs; see the [role guide](role-delivery.md) |
| Confluence knowledge base | `setup confluence. The space and parent page are <link>; guide authentication and read-only checks.` | Knowledge targets; publishing needs specific content/target authorization |
| GitLab pipeline validation | `setup gitlab. The project is <link>; configure CI reports and CD checks for <environment>.` | Link actual candidates to CI/CD evidence without triggering company deployment |
| Active readiness check | `setup check` | Check current requirements and report gaps |
| View previous checks | `setup status` | Show prior results/timestamps without a new probe |

`setup role delivery` GitLab access does not require `setup gitlab` pipeline waiting. Confluence is not a second maintenance location for Jira cases.

You perform authentication: [Confluence/TWG](../bootstrap/knowledge.md), [GitLab](../bootstrap/pipelines.md). Keep credentials out of chat/configuration/Git. [Project Setup](project-setup.md) defines required/optional targets.

<a id="solo"></a>
## Step 3: complete a first solo-team request

### 1. Define responsibility and workflow

Defaults: `mode=solo`, automatic selection, human stage approval. One human may own requirements, technical decisions, and acceptance; the engineer, two Gate Reviewers, and collector remain independent. Solo never authorizes signing for another owner.

Use standard for a new product, for example:

```text
Use aidlc standard for a local task-list tool: add, complete, list, and persist tasks.
Exclude accounts, networking, and deployment. I own requirement, technical, and acceptance
decisions. Complete Intake: goals, constraints, unknowns, and scope. Propose a stack
for confirmation before coding. At each stage, return summary, links, and the exact
approval instruction; wait for my approval and continuation.
```

Adapt this example to actual project standards, owners, and team workflows.

<a id="first-work"></a>
### 2. Choose subsequent workflows by the change

| Workflow | Use for | Stages |
|---|---|---|
| `standard` | New capabilities, cross-system changes, or high-risk changes | Intake → Spec → Architecture → Quality → Plan → Implement → Verify |
| `enhance` | Small enhancements within existing architecture boundaries | Scope → Implement → Verify |
| `fix` | Local defects restoring clearly established behavior | Diagnose → Implement → Verify |

```text
Use aidlc enhance: add status filtering to the existing task list, preserving original
sorting and unfiltered behavior. Check risk and AC first; show change.md before implementation.
```

```text
Use aidlc fix: when search returns zero results, the list incorrectly displays a total of 1.
Reproduce the issue and identify the root cause first. Confirm scope and verification
before modifying code.
```

If unsure: “Use aidlc; recommend a workflow and explain why.” **Automatic selection is not automatic approval.** Permissions, payments, sensitive data, migrations, or new-service risks need human-confirmed safeguards, not a forced short route.

### 3. Review, approve, and continue

Review decisions, checks, unknowns, and next steps through each stage's summary/links. Approve the card's actual ID/revision:

```text
Approve <stage/node> <revision> for <work-id>, and continue to the next stage.
```

Request revisions to problematic AC/design/scope before approving frozen content. “Approve” records and stops; “approve and continue” authorizes the next dispatch.

What to inspect most often:

| Timing | Review |
|---|---|
| Before coding | Scope/AC, Oracle, architecture constraints, test design, and plan |
| After implementation | Actual changes, applicable TDD failure→pass evidence, affected regression, frozen candidate |
| Final Verify | Both independent Gates, required AC results, gaps, and complete evidence links |

fix/enhance use `change.md` / `verification.md`; controls/logs are attachments. Without CI, run local dual Gates. Design missing checks before building them in Implement. TDD is Implement-only; self-tests cannot replace independent verification.

### 4. What completion means

**Implementation Verified Handoff** requires complete evidence, dual Gates / AC passing on one candidate, and required approvals. It never automatically commits/pushes, marks Jira Done, deploys, or proves business benefit. [Release/Learn](../examples/team-packs/release-team/README.md) is optional.

For Jira collaboration, explicitly assign PO/QA/technical/final roles, including to yourself if applicable. [Role workflows](role-delivery.md) still need each role approval and run formal dual Gates after required QA evidence.

## Daily continuation

Start new requests in new sessions; resume with the work reference. Cross-role continuation also needs a frozen package, not full chat or a Jira link alone.

| Goal | Prompt |
|---|---|
| Continue existing work | `Continue aidlc <work reference>; first check its original version, current node, and approvals.` |
| View status | `Show status, blockers, and next steps for <work reference> without starting execution.` |
| Request revision | `Do not approve <review reference>: <specific issue>. Prepare a revision under the original workflow.` |
| Stop pipeline waiting | `Stop waiting for <work-id>.` Retains the request without canceling the company pipeline |
| End this request | `Close the current work for <work-id>.` Stop after approver confirmation and retain actual unfinished items |

Low-risk built-in fix/enhance may use two human reviews or automatic approvals:

```text
Prepare an auto approval authorization card for this low-risk enhance, with scope,
paths, commands, expiry, and stop conditions. Wait for my confirmation of the card,
then automatically approve and continue within that scope.
```

The example requests a card, not approved delegation. standard/role-team stay manual; knowledge/Jira publishing and implementation feedback require their own scope. See [approval policy](../workflow/approval.md).

<a id="update"></a>
## Update an existing installation

Open AI in the original workspace and send:

```text
Read https://raw.githubusercontent.com/xuhongjia/aidlc-agents/main/bootstrap/update.md
and prepare an aidlc-agents update for this project. Preserve project rules, requests,
approvals, and evidence. Show the pinned target, differences, conflicts, and active work;
wait for my confirmation before applying. Enable GitHub main checks and automatic updates
before new requests while keeping existing requests on their original version.
```

For a local method copy, use:

```text
Read <local aidlc-agents copy>/bootstrap/update.md and prepare an update for this project.
Record local-unreleased provenance and actual file digests; stay pinned without switching
to GitHub main. Preserve project rules, requests, approvals, and evidence.
Show differences, conflicts, and active work; wait for confirmation before applying.
```

Unfinished work, active children, or pending handoffs defer updates. List old/new category paths; preserve old locks/approvals. Never delete `.aidlc/`, overwrite the directory, or rerun Setup to upgrade. [Update](../bootstrap/update.md) defines recovery.

## Resolve blockers

| Message / situation | Next step |
|---|---|
| Unknown or unsupported child-Agent capability | Inspect missing probe evidence and revalidate on a capable host; the main session cannot substitute |
| `method_ready=true`, `project_ready=false` | Complete the missing setup/login, then run `setup check` |
| Missing role Skill / `team.role-delivery` | Check whether the installed source contains the role pack, then use Update and `setup role delivery` |
| Jira has only the current description, with no approved version | Ask PO / QA for real approvals and a frozen handoff; do not infer consent |
| Candidate changes, updated cases, or failed tests | Return to the original work's change process, retaining evidence; do not reuse stale green results |
| `waiting_external` | Wait for the authorized monitor or say “Continue <work reference>”; waiting is not passing |

See [validation records](validation.md), [DAG customization](dag-usage.md), and the [Skills index](../skills/README.md); reading every protocol first is unnecessary.
