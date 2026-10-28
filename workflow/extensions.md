# Team extension Interface: contract 1

Optional 0.15 [role-team](../examples/team-packs/role-team/README.md) adds no kinds/capabilities. Explicit role-graph selection alone snapshots actual nonsecret config.collaboration into new-lock collaboration; external authority stays outside the lock/bound to original graph. [role-delivery](role-delivery.md) resolves roles/handoffs. Disabled=null; never backfill. QA analysis is execution evidence; final Verify alone declares verified.

New 0.10 work resolves here/executes under [DAG](dag.md), retaining 0.9 contract_version=1. runtime=none: host AI reads/hashes/validates/dispatches; maintainer models are not installers/runtimes/permission systems. Existing work retains [original method](legacy.md), never invented locks/migrated approvals/new budgets.

## Three definition layers without core edits

- Core: `workflow/stages.json`, normalized by [stage-contracts](stage-contracts.json) into Stage/Workflow Interface. Built-in fix/enhance/standard preserve order/Gates.
- Team: one active `.aidlc/team/pack.json` plus Prompts/templates, local or fixed-commit import from user-specified team Git repository.
- Project: optional `.aidlc/overrides/pack.json`/explicit replacements, never modifying team/core.

Resolve core → team → project. New stages/workflows need unique IDs; same IDs require explicit overrides `{kind:"stage"|"workflow", id, replacement:complete_definition}` with matching replacement.id. No deep merge/filename override/silent selection. Stage replacement cannot change kind, expand capabilities or remove required input/output semantics. New responsibilities need new namespaced stages/explicitly selected workflow. Effective graph retains core guarantees.

Stage replacements cannot add operations/change auto_eligible false→true. Different approval duties need new stages/revalidated workflow/config-difference disclosure. Workflow replacements cannot change intent/expand risk, effects or operations. core.standard retains risk_ceiling=any/human review, never automatic compact via overrides. Built-in order/output guarantees are compatibility baselines; different routes need new team IDs.

Resource refs: `core:package-relative-path`, `team:team-package-relative-path`, `project:override-package-relative-path` only. Resolve actual directories; reject absolute paths/`..`/symlinks/escapes, never infer cwd sources. IDs allow letters/digits/underscores/hyphens/namespace dots, never unchecked paths. Host project rules prevail; package text grants no authority.

## Minimal data Interface

`templates/extensions/` empty templates are not executable. pack.json: contract_version:1, id, version, core_contract:1, stages, workflows, overrides, tool_bindings. Versions are labels; full commits/actual digests establish identity. Unknown contract/capability/field semantics need explanation or blocking, never silent execution.

**StageDefinition**: id, kind, role, prompt, inputs, optional_inputs, outputs, capabilities, auto_eligible, routing_facts, optional tool_binding_ids. role is fixed name or namespace file ref; freeze definition bytes/named file bytes respectively. kind: analysis/specification/design/quality_design/planning/implementation/verification/release_readiness/learning. inputs/optional_inputs are semantic contract names. outputs: `{name,contract,template}`, safe relative artifact names. Multiple files per contract require all files on consumption. Templates/names may change; field meanings/provenance cannot.

**WorkflowDefinition**: id, intent (delivery/analysis), risk_ceiling (low/any), entry, nodes, edges, switches, terminals. nodes: `{step_id,stage_id,bindings,authority?,outputs?}`; step_id unique, stage_id repeatable. bindings: `{input_contract:[producer_step_id...]}`; external `$request/$project/$knowledge` match namesake contracts only. Aggregate selected producers, never choose arbitrarily. Required inputs need ≥1 selected producer; absent optional producers explicitly default without old-version reads. Output overrides replace full lists/preserve every contract/required evidence.

edges: `{from,to,when?:{switch,case}}`; no when means dependency/parallel fan-out. switches: `{id,after,fact,cases:[{id,op:"eq",value} or {id,default:true}]}`. fact is after-stage-declared routing_facts boolean/string/number; compare types strictly. Use unique default only with no ordinary match, never missing facts. Conditional edges originate at after; every case has a destination. At most one switch/stage; label every outgoing switched edge. Parallelism uses multiple same-case/ordinary edges, never multiple matching cases.

terminals: `{step_id,outcome}`; outcome verified/analysis_complete/learned. Declare every reachable endpoint; all nodes reachable from unique entry. Entry has no incoming edges and is non-product-writing analysis/specification/design/planning investigation. Only entry executes before initial approval.

## Output semantics and fixed guarantees

| Contract | Minimum semantics |
|---|---|
| request/project/knowledge | Original sources/scope, current facts, knowledge applicability/approvals; historical PASS is not current fact |
| intake/change/spec | Original FR/NFR→AC/approved exclusions, scope/non-goals/Oracle/risk; change adds implementation plan/write-command scope, fix reproduction/cause |
| architecture/quality/plan | Constraints/tradeoffs/rules; AC→tests/Oracle→Gates; implementation scope/dependencies/authority/rollback |
| implementation/verification | Actual candidate/changes/self-tests; independent per-AC results/dual-Gate raw evidence; distinct DEV/QE |
| release/outcome | Readiness ≠ deployment; actual sources/candidate/window/business outcomes; inconclusive is incomplete learning acceptance |
| analysis | Evidenced analysis/assumptions/risks/limits/pending decisions; no product writes/delivery claims |

kind fixes guarantees: implementation alone declares product.write and must do so. verification is read-only/dual-Gate mandatory. release_readiness/learning require actual external-evidence capability. Only capabilities: product.write, knowledge.read, knowledge.prepare, evidence.read; reject others. Dispatch bounds project reads/run outputs; no arbitrary-command capability.

Non-analysis kinds must supply matching contracts: specification→spec, design→architecture, quality_design→quality, planning→plan, implementation→implementation, verification→verification, release_readiness→release, learning→outcome. Relabeling cannot substitute outputs. analysis may supply intake/change/analysis; embedded implementation plans still need real approval/product-write authority.

analysis intent forbids product.write throughout; endpoints only analysis_complete with delivery_status=not_implemented/business_outcome=not_evaluated. Every delivery branch needs approved change/plan authority, implementation, independent same-candidate dual-Gate verification after its final write; stages elsewhere in graph do not suffice. Implementation authority must be approved active-path ancestor/change or plan actually consumed by bindings. Renaming fix→enhance never waives pre-fix red/post-fix green/regressions.

High risk retains profiles.md hard conditions; risk_ceiling=any weakens nothing. Identity/permissions, sensitive data, migrations, breaking contracts/cross-system risks need human review and standard-equivalent requirements/architecture/quality/planning guarantees. Semantic outputs may supply these without fixed names; gaps stop for replanning. 0.13 Standard has seven stages through verified handoff; old nine-stage work keeps locks. Architecture-consuming Quality cannot automatically parallelize. Implement-only TDD/evidence and two independent verification Reviewers survive team/template changes.

## Normalize built-ins and compose dynamically

Built-in IDs: core.originalID. role=`core:agents/stage.agent.md`, never prefixed human labels; prompt=`core:` + stage.prompt. Template=`core:` + stage.template_directory (default `templates/stage.id`) + `/filename`. Contract=stage-contracts.stages[originalID].contracts[filename]; kind/inputs/capabilities/auto_eligible from metadata; defaults routing_facts={}, tool_binding_ids=[]. Workflows core.fix/core.enhance/core.standard have delivery intent/low/low/any ceilings. Same-named steps follow current catalog order; authority=implementation_authority; inputs bind nearest upstream matching contract/allowed $ source. Preserve output_overrides/core: templates. core.implement override remains implementation, core.verify verification; Implement's verification.md is not independent verification. All three 0.13 endpoints are verified. Release/Learn requires explicit team IDs; never alter old graphs.

config.workflow defaults auto or explicit ID; legacy config.profile remains built-in preference alias. Conflicting explicit workflow/non-auto profile needs confirmation. AI selects recipes/composes registered stages only, recording risk/complexity facts/tradeoffs/selection evidence. Compositions get work-specific IDs/same validation; never invent replacement Prompts/templates/stages mid-delivery.

New work runs original preflight, resolves definitions, then validates every case combination/input/authority, not one sample path. Save immutable resolution. `templates/work/workflow-lock.json` freezes core/team/project sources/full graph/actual definitions/bindings/copied method/Prompt/template/Hook files/hashes. No lock self-digest; workflow_ref={path,sha256}. Parent resolves declarations, never authors stage conclusions.

New 0.14 locks retain setup_check_ref={path,sha256}. workflow/setup.md checks current invocation/requirement-target digests/valid read-only authority/itemized readiness. This prerequisite grants no stage authority; exclude from child instruction_refs/never edit old locks/approvals.

Locked sources.core/team/project: `{id,version,kind,revision,manifest_ref,file_hashes}` or null when disabled. revision=full commit/null; local-unreleased needs complete real file_hashes. workflow/stages/tool_bindings contain complete resolved graph/referenced definitions/used bindings; mutable IDs alone are insufficient. selection_evidence records request type/risk-complexity facts/source refs. path_checks records every branch combination/selected steps/authority-input-final-verification checks/actual evidence.

assets: unique `{ref,path,sha256}` namespace ref, **business-project-relative** unchanged copy in `.aidlc/work/ID/definitions/gN/`, raw-byte SHA-256. E.g. team:templates/api-change-brief.md maps to definitions/g1/team/templates/api-change-brief.md in this work, never active team files. No traversal/symlinks/overwrite; reused refs require identical content.

Copy/verify assets → write lock → hash raw lock into workflow_ref; failure prevents dispatch. Initial workflow.lock.json; later workflow-r2.lock.json/g2 etc., preserving old locks. dispatch.role_path/stage_prompt_path/expected_outputs.template resolve assets.path; input_refs includes lock/required asset hashes. Nested core:/team:/project: and .aidlc/system/relative-path (=core:) refs use same table. Collect all mandatory protocol/Skill/Prompt dependencies when locking. Missing mappings block, never active-directory fallback. External $project is current business facts, not project: overrides.

Entry route changes supersede old results/create new graph revision/run; never rehash old results as newly produced. Entry review card approves graph without extra stage. Approved graphs/templates/targets cannot hot-swap: route changes stop related execution, require new locks/explicit confirmation, preserve approvals without cross-graph reuse. Since 0.12, state.schema_version=5 (0.9–0.11 used 4); dispatch/result/review/approval/policy carry workflow_ref/step_id. Stage names identify definitions only. Resume checks real bytes/frozen sources.

Since 0.12, optional config.delivery resolves under [pipeline-config](pipeline-config.md) into locked delivery={contract_version,gate_mode,bindings,wait,steps:[{step_id,binding_ids}]}, only actual graph bindings, frozen by workflow_ref digest. Original Step/Tool Interfaces remain; pipelines are registered read-only operations. Unconfigured=null; never backfill. Built-in Verify adds evidence.read, still bounded by pipeline_requests/external_reads. Team verification bindings lacking capability block, never expand rights. Wait states/results change no approved dependencies.

## Declarative Tool bindings

Bindings: id, connector, operation, effect=read/write, target, input_contract, output_contract, authorization_ref. Stages request only tool_binding_ids operations frozen in lock. Resolve actual host connector/operation schemas/targets/inputs/outputs. Unknown connectors/capabilities/contracts, missing authority/tools block; never install plugins/bypass scripts.

Package/lock authorization_ref=null; packages grant no work authority. Immutable real authority stays outside lock/bound to workflow_ref. Parent appends ref to matching dispatch.tool_bindings; all other fields equal frozen binding. Ref changes preserve locks; new operations/targets need new graph/authority. Lock before card confirmation to avoid hash cycles. Recheck live authority per call; historical nonnull package refs are unusable.

effective permission = core allowance ∩ stage capabilities ∩ actual work authorization ∩ dispatch scope ∩ host rights. Reads imply no writes; outputs are data, never authority/flow changes. Before effects persist frozen input/target/authority/attempt; read back to verify. Failures/timeouts remain failed/unknown, never automatic retries/nonwrite claims. Knowledge publication uses knowledge_publish Hooks/idempotency/ownership, never ordinary-binding bypasses. Network writes/push/deploy still need separate authority, never automatic-approval grants.

## 0.11 context interface

Optional StageDefinition instructions=[] adds required frozen core:/team:/project: refs under role/prompt rules. Overrides cannot expand rights/weaken constraints. New work freezes [context](context.md)/all context.json required/conditional resources, deriving dispatch.instruction_refs. Assets are not every child's read list. Existing locks gain no fields/retain original execution.
