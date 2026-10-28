# Configure AIDLC for your team

Core owns approval/candidate/Gate rules; team packs own stage content/workflows/templates; project overrides hold local differences. Packs grant no external authority or new runtime.

For execution prompts/branches/approval, see [DAG usage](dag-usage.md). This page covers configuration/version maintenance.

## Setup prompts

For a local team directory:

> Read `.aidlc/system/bootstrap/team.md` in this repository and inspect my specified team-pack directory. Show stage, template, workflow, and permission differences. Preserve existing content and approvals. After confirmation, complete setup and static checks, then stop without taking a real request.

For a team Git repository:

> Follow `.aidlc/system/bootstrap/team.md` to connect my supplied team Git repository and package subdirectory. Resolve a pinned commit first and show the differences for confirmation. Pin the version by default; do not enable automatic approvals or external writes.

Supply real source URL/subdirectory. Explicitly select local unpublished core changes; `main` may not contain them.

After setup:

> Use aidlc for this request: …. Recommend a composed workflow from registered stages and request risk. First validate it with an independent entry child, then show stage choices, conditional branches, and the approval card. Wait for my confirmation before continuing.

To change team definitions:

> Add a read-only compatibility review stage, replace the architecture template, and add a conditional branch to the API workflow. Write team/project extensions without changing core. Show exact differences first; existing requests retain their pinned versions.

## Complete examples

| Example | Workflow and purpose |
|---|---|
| [API team](../examples/team-packs/api-team/README.md) | Scope → approved needs_review branch → two independent parallel reviews or direct implementation → Implement → Verify; renamed main documents retain their semantics |
| [Design team](../examples/team-packs/design-team/README.md) | Brief → parallel Options and Security → design synthesis; read-only analysis ends at analysis_complete without claiming verified delivery |
| [Release team](../examples/team-packs/release-team/README.md) | Explicit Release/Learn after verified handoff; manual approvals and separate production authority; outside default Standard |

`.aidlc/system/examples/team-packs/` examples need team-setup authorization; they are neither defaults, enterprise mandates, nor tested real deliveries.

## Customization scope

- Add stages or explicitly replace Prompts/roles/templates; renamed/restructured artifacts must preserve input/output contracts.
- Compose reusable stage instances with unique step_id, conditions, parallelism, joins, endpoints, and tools.
- Set config.workflow=auto/ID; profiles remain built-in aliases. Confirm preference conflicts.
- Project overrides replace complete explicit-ID definitions. One active pack is supported, without multi-pack dependencies/dynamic scripts.

Renaming/trimming cannot remove approval, AC/Oracle, independent verification, or Gates. Analysis-only needs no product Gates but cannot write product source/configuration. See [Interface](../workflow/extensions.md) and [DAG](../workflow/dag.md).

Custom implementation nodes inherit [V2.1](engineering-skills.md) TDD/exceptions/evidence. Never move RED/GREEN/REFACTOR into Quality/Plan or let implementers sign Gates. Freeze optional Skill metadata without default text loading. Standard ends at verified handoff; release/feedback needs a new explicit team Workflow ID.

## Work-level pinning and maintenance

Since 0.12, config.delivery can bind company CI/CD to team nodes through kind/workflow_ids/step_ids. Nodes require evidence.read. Actual bindings, report mappings, and wait policies freeze with the work. Unbound stages do not load pipeline protocols. CD depending on final Verify approval must use a subsequent release_readiness node, so Verify never waits for its own approval. See [CI/CD validation](ci-cd-validation.md) for usage/examples. This adds neither a stage nor external-write authority.

Freeze graph, team source, Prompt/template copies, and hashes per work. First approval binds graph/scope; branches use approved facts. No hot-loading: graph changes require a new revision/confirmation, without carrying old authority.

A lock’s `assets` maps each resource ref to its frozen path and real SHA-256, e.g. `team:templates/api-change-brief.md` → `.aidlc/work/REQ-001/definitions/g1/team/templates/api-change-brief.md`. Dispatch identifies the lock via `workflow_ref {path, sha256}`, plus `step_id=scope`, `stage_id=team.scope`, `stage_kind=analysis`, and `expected_outputs` binding `api-change-brief.md` to contract `change` and that frozen template. Calculate actual digests; this example is not an executable snapshot.

Freeze complete sources/workflow/stages/tool_bindings, validation records, Prompts/roles/core protocols, and transitive asset mappings. Dispatch `instruction_refs` declares mandatory method resources; `input_refs` holds business inputs and pinned digests. References such as `core:prompts/common.md` resolve within the same graph, never to a later installation. Runtime loads only current-node resources. Declare mandatory team rules in `StageDefinition.instructions`, budgeting them separately under the [context contract](../workflow/context.md). Missing mappings block; budgets cannot remove rules.

Approve stages independently. One card may confirm several explicit objects, with each record bound separately. Low-risk custom delivery graphs preserving original fix/enhance safeguards may explicitly authorize auto. standard, high-risk work, and pure research retain human review. `checkpoint_low_risk` accepts only unchanged built-in fix/enhance, excluding team overrides of graphs, stages, Prompts, or templates. Low-risk non-standard implementation may separately request bounded internal feedback, defaulting to zero rounds; it cannot change the graph or automatically start formal rework. Tool permissions and knowledge publishing still need their own authorization.

Team updates follow bootstrap/team.md: pin target, three-way diff, confirmed switch. Core preserves team/overrides; incompatibility blocks automatic rewriting. Finish old work/active Hooks before switching.

Report content, reference-model, real-host DAG, and connector checks separately. Model tests prove no real approval workflow.
