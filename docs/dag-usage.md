# DAG usage: let AI select stages, then execute the approved graph

Describe your goal/constraints; AI recommends registered stages and confirms the workflow after first-stage investigation. Team maintainers customize recipes; users need not write DAGs.

A DAG has dependencies, branches, and parallelism, without cycles. **The host follows this protocol; no separate engine or score-based stage trimmer exists.** Content/model tests prove no host execution.

## 1. Start as a user

Require composed-workflow support (0.9+) and a passing child-Agent probe; [update](../bootstrap/update.md) older installs. Built-in fix/enhance/standard resolve to DAGs without packs. Pack configuration and delivery are separate.

Let AI select a workflow:

```text
Use aidlc to add task-list status filtering, preserving search/sort/unfiltered behavior.
Recommend registered stages from project facts; explain risk, omissions, and parallelism.
Investigate with an independent entry child; submit workflow/results for approval
before implementation.
```

Specify an existing team workflow after installing its pack:

```text
Use team.api-enhancement for <request>, preserving the project default.
Check applicability; stop on high risk or missing responsibilities.
```

For analysis only:

```text
Use installed team.design-analysis for options only, with human stage approvals.
Return conclusions/risks/open decisions; no implementation or verified-delivery claim.
```

`config.workflow=auto` selects, never approves. Assess manual choices too; confirm preference conflicts. Per-request selection does not change defaults without explicit configuration authority.

## 2. Use a team DAG for the first time

Start with the packaged [API example](../examples/team-packs/api-team/pack.json). In the business repository, ask AI:

```text
Follow .aidlc/system/bootstrap/team.md to install .aidlc/system/examples/team-packs/api-team/.
Show source/stages/templates/permissions/diffs for confirmation. Preserve preferences;
keep auto approval off and execute no request. Return available workflow IDs.
```

Then use `team.api-enhancement`. One active pack is supported; existing packs need confirmed merge/replacement diffs, never blind copying. See [team setup](team-workflows.md) for private/local sources and updates.

### Read a DAG

| Field | Meaning | API example |
|---|---|---|
| `stage_id` | Reusable stage definition specifying responsibility, Prompt, and inputs/outputs | `team.scope` |
| `step_id` | This stage's instance in the current graph; approval binds a specific instance and revision | `scope` |
| `edges` | Predecessor approvals required to execute; multiple outgoing edges may create parallelism | scope to two review steps |
| `bindings` | Which step's artifact is consumed; a dependency edge alone does not bind input | implement consumes change from scope |
| `switches` | Select predefined branches using approved typed facts | boolean `needs_review` |
| `terminals` | Which node may finish and what completion means | verify → verified |

Actual API paths; every step uses a fresh child Agent:

| Approved Scope fact | Activated path |
|---|---|
| `needs_review=true` | scope → compatibility and tests-review in parallel → implement → verify |
| `needs_review=false` | scope → implement → verify; both reviews record not_selected |
| Unknown, unevidenced, or unapproved | Stop at the current review/blocker; never default to the short path |

Reviews independently inspect compatibility/coverage from approved change, not each other’s output. Implement waits for **both approvals**; optional analysis bindings cannot bypass selected unfinished nodes.

Both paths retain independent Architecture / Quality Gates. `needs_review=false` clears no identity/permission, sensitive-data, or migration risks.

## 3. How AI selects stages dynamically

Dynamic selection means **new-work graph choice/composition, then approved-fact branch selection**. Chat or tool output cannot arbitrarily alter an approved graph.

### New work: recommend, then investigate in the first stage

1. **Preflight:** check core updates and registered core/team/project stages, workflows, rules. Preserve old locks; core updates do not update team Git.
2. **Assess:** fix/enhancement/new capability/analysis; modules/consumers, contracts, acceptance/rollback, knowledge. Clarify gaps; line counts do not measure complexity.
3. **Select:** existing recipe or registered-stage graph; explain inclusions/omissions. Missing responsibility needs team customization, not an invented delivery Prompt.
4. **Validate:** sources, implementation authority, every endpoint, independent Verify/dual Gates after final implementation, and parallelism. High risk needs human-reviewed standard-equivalent requirement/architecture/quality/planning safeguards.
5. **Freeze:** graph/sources/Prompt-template copies/hashes, then one read-only entry child; no parent diagnosis. Its review validates the proposed route and includes graph/rationale/scope/artifacts. Choice is not approval.
6. **Schedule:** require applicable node approvals. Route changes stop old execution, append graph revision/entry run, supersede old results, and reconfirm; never reattach old approvals.

Illustrative choices, subject to investigation:

| Task facts | Reasonable choice | Required coverage |
|---|---|---|
| Local reproducible count bug with clear expected behavior | core.fix: diagnose → implement → verify | Root cause, failure before/pass after, adjacent regression, both Gates |
| Filter added within existing boundaries, independently acceptable and reversible | core.enhance or a suitable low-risk team recipe | Scope/AC/Oracle, implementation authority, independent verification |
| Same low-risk enhancement affects several local consumers or complex coverage | API example's review branch | Both selected reviews approved before implementation |
| Permissions/payments/sensitive data, migration, breaking contracts, or unbounded impact | core.standard or a human-reviewed team flow with equivalent safeguards | One extra review node cannot reclassify high risk as low risk |
| Options research without business-code changes | Read-only analysis workflow | Evidenced conclusions and human approval; no verified claim |

Omit a stage only if another approved semantic artifact covers its responsibility. fix change.md still covers architecture impact and quality checks.

### During execution: select branches from facts, without reinventing the graph

`team.scope.routing_facts` declares `needs_review: boolean`. Scope returns value/`evidence_refs` from actual consumers/coverage. Parent verifies document consistency, freezes review, then after approval strictly selects true/false and records `state.branch_decisions`.

Missing/wrong-type facts or non-unique selection block. `default` handles valid unmatched values, not unknown facts. FAIL, missing permission, and timeout cannot skip checks.

Dispatch ready nodes only: approved dependencies, complete inputs, continuation authority; default 2 active children. Independent reads may parallelize. Business writers need graph ordering; shared conflicts queue. Only selected branches execute.

## 4. Review and continue

First card: workflow/graph version, stage rationale, conditions/evidence, parallelism, implementation scope, outputs, endpoint, blockers. Inspect with:

```text
Show REQ-001 workflow_ref, step responsibilities/status/rationale, approved branch
evidence, ready nodes, and missing approvals without starting execution.
```

Replace `REQ-001`, revisions, and step names with real review-card objects. If scope r1 confirms `needs_review=true`, explicitly authorize the next batch:

```text
Approve the scope r1 review card for REQ-001's current graph, including its workflow
and branch facts. Continue the listed compatibility and tests-review nodes,
then wait for my approval.
```

Approve both exact review revisions and authorize Implement; approve its candidate before independent Verify. Name each object when several await review. Approval without continuation stops.

Since 0.10, unchanged low-risk built-in fix/enhance may use two human reviews:

```text
Prepare REQ-001 checkpoint_low_risk: I approve initial scope/plan and final results;
coordinator may verify/approve an eligible Implement candidate and continue to independent
Verify. Feedback budget 0; no knowledge publishing or external writes.
```

Retain three stages and independent candidate-approval record. Real first-card approval is required. Changed team graphs/stages/Prompts/templates are excluded, even with core IDs.

For fully automatic low-risk progression, request “Prepare this work's auto approval authorization card first.” Confirm the frozen graph, every potentially active step, path/command/tool scope, and stop conditions. Every potentially active stage needs `auto_eligible=true`, but eligibility alone grants nothing without genuine initial delegation. standard, high-risk, and pure-analysis workflows retain human review; read-only analysis nodes inside a delivery workflow do not thereby lose automatic eligibility. See [approval rules](../workflow/approval.md).

Any approval mode may separately request “Before the first Implement candidate review, allow up to two local self-correction rounds within the original scope, without changing tests/Oracle/Gates.” The default budget is 0, limited to low-risk non-standard implementation. Record each round before creating a new child for the same step/revision. The budget accumulates across sessions; this is not a new stage or DAG back edge. Verify failure, environmental/unknown faults, and scope changes still stop for human action without automatic rework. See [implementation feedback](../workflow/implementation-feedback.md).

## 5. Customize stages, templates, and graphs

Ask AI for a configuration change; no core fork is needed:

```text
Follow .aidlc/system/bootstrap/team.md: after scope approval, conditionally review
compatibility for multiple consumers alongside test review; require both approvals
before Implement. Adjust scope Prompt/template while preserving change semantics,
FR/NFR→AC, Oracle, and both Gates. Show stage/graph/template/permission diffs;
after confirmation edit team/project extensions only, without executing work.
```

Maintainer edit locations:

| Change | Location | Validation focus |
|---|---|---|
| Stage responsibility and Prompt | Pack StageDefinition + referenced prompts files | kind/capability matches responsibility; register new stages first |
| Document structure and filename | outputs template/name + template file | Preserve contract semantics and required evidence |
| Stage composition/order/branches | WorkflowDefinition nodes/edges/bindings/switches | Acyclic, complete branches, explicit input/approval sources |
| One project's difference | Explicit full replacement in `.aidlc/overrides/pack.json` | No deep merge, lost guarantees, or broadened permissions |
| External operations | tool_bindings and stage tool_binding_ids | Declaration is not authority; real host capability and separate work-level authorization required |

See complete [API](../examples/team-packs/api-team/pack.json) and [design](../examples/team-packs/design-team/pack.json) packs. The [extension template](../templates/extensions/pack.json) is an incomplete skeleton, not an installed configuration. Fields are defined in the [Interface](../workflow/extensions.md), with scheduling in the [DAG protocol](../workflow/dag.md).

Unfinished work/live workers permit diffs, not configuration switching. Existing work uses frozen assets. Stage/template/condition changes require stopping old execution, a new lock, and reconfirmation; never edit workflow.lock.json in place or reuse old auto authority.

## 6. Common blockers

- **Missing team.api-enhancement:** examples ship with the package but are not enabled by default. Install the team pack, or use built-in enhance for a short workflow.
- **Node is not_selected:** its conditional branch was not selected; this is not a passing result. Inspect branch facts and approval sources.
- **Join does not start:** check all selected predecessors' approvals, bound artifacts, and continuation authority. A waiting branch still blocks the join.
- **Architecture and Quality should run in parallel:** only when no artifact dependency exists. Built-in standard Quality consumes Architecture and cannot run directly in parallel with it.
- **New risk or work discovered midway:** pause, replan, and reconfirm instead of expanding scope through automatic approvals.
- **Rework needs a back edge:** DAGs cannot cycle. Create affected node revisions along the dependency-invalidation chain, retain old evidence, and obtain rework approval.

These are usage contracts, not observed delivery. See [validation](validation.md) for executed/unexecuted checks.
