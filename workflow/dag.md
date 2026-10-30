# DAG scheduling: frozen workflow

Resolve/validate full graph under [extensions](extensions.md), then load work.workflow_ref; never schedule from active team config. This replaces schema 4's linear “single current_stage/all predecessors” rules. Identity, real approval, candidate, independent-child, stop/evidence rules remain.

## State, branches and readiness

state.nodes[step_id]: stage_id/revision/status/review/approval/input/candidate refs. Status: pending/ready/working/waiting_external/awaiting_approval/approved/blocked/failed/not_selected/superseded. [pipeline-wait](pipeline-wait.md) releases waiting_external slots/resumes original node only. Consumers await approved; independent siblings may continue. state.branch_decisions retains switch/chosen case/approval source/fact field/value/evidence digest/time/workflow_ref, never chat judgments. Global status summarizes: awaiting_approval cannot block authorized independent siblings. closing/closed/work stops/revocation freeze all dispatch.

1. Entry investigates first. Review freezes result.routing_facts as `{field:{value,evidence_refs}}` with all evidence. Parent checks body consistency/obtains actual approval; unsupported facts cannot be approved.
2. Switch after must be validly approved. Use exact-review/current-graph facts, never mutable results/drafts/live tool results. Missing types, unknown values/multiple matches block. Gate FAIL/timeouts/missing authority cannot branch around checks.
3. Activate selected-case edges; mark others not_selected with evidence. Pruned sources prune outgoing edges; undecided edges stay pending.
4. Ready requires every incoming edge decided, active predecessors approved, inactive edges legally pruned and ≥1 active edge. All legally inactive means not_selected, never approved/PASS. Only entry has no incoming edges.
5. Each selected binding producer must be an approved ancestor with all contract files/hashes. Record/exclude unselected producers; required inputs cannot empty. Joins satisfy dependencies, never merge conclusions; synthesis needs actual collector stage.

Parallel nodes use separate run/review paths. Cards may list exact step/revision pairs; record approvals individually. Multiple pending reviews require a target for ambiguous “approve current.” Human “continue” authorizes only card's next ready batch, never whole graph; automatic continuation stays policy-bound. Never start consumers before approved dependencies to save rounds.

## Dispatch, concurrency and candidates

Parent alone spawns; each stage/run gets fresh isolated [composed-stage](../prompts/composed-stage.md) context with frozen role/Prompt/templates/minimal inputs. No inline parent execution/child spawning. Results carry workflow_ref/step_id/stage_id/definition identity/dispatch_digest/actual evidence. Archive old-graph/wrong-instance/late results only.

Default max_parallel_workers=2 counts stages/waiting stages/leaves/collectors/knowledge Hooks. Queue when full. Under orchestration: stage returns splits/releases slot → leaves → fresh collector; execution.md permits verified-ready direct Gate dispatch before the sole collector. Reserving a future run ID consumes no live-worker slot; budget reservations apply before actual dispatch. Never occupy both slots with stages waiting for leaves.

Multiple worktree product writers must be graph-comparable (one ancestor of another), otherwise reject resolution. Writers exclude formal readers of their candidate. Without writers, independent read-only stages may parallelize. Even disjoint files need port/database/cache/external-target conflict checks; queue without proven isolation. Exclusive-path leaves within one Implement remain valid, not unordered stages.

First writer uses verified product baseline/approved authority; later writers use approved current candidate/full lineage. Only authorized internal correction before first candidate review uses failed candidate/original authority through reservations without invented approval. verification is a new independent child on frozen final candidate; Gate leaves report that same candidate. Changes after first candidate review/beyond correction need new implementation approval/downstream reverification; never retarget Gate digests.

0.13 requires separate independent Gate Reviewer leaves; collectors only aggregate. Parallelism permits no merged identities. Approved implementation means candidate approved, not verified. Completion follows tdd/gate; Standard defaults to verified handoff after human Verify approval.

## Approval and automatic continuation

[approval](approval.md): manual defaults human review/node; checkpoint_low_risk delegates only unchanged built-in fix/enhance Implement candidate approval with human entry/final Verify; auto_low_risk requires actual low-risk delivery/every activatable stage auto_eligible. Modes change no dependencies/candidates/Gates. Policies bind exact graph/steps/scope; eligibility grants no authority. Graph/permission changes need confirmation.

implementation needs passing DEV self-tests; verification independent dual-Gate/all-AC passes. Only unexpected internal implementation FAIL before first candidate review with explicit budget may continue under [implementation-feedback](implementation-feedback.md), without back edges/stage approval. Other unexpected/disqualifying failures, required NOT_RUN/UNKNOWN, high risk, ambiguous Oracle, drift/authority changes stop/revoke/recall/return to humans. Approved expected negatives remain actual FAIL, not work failure. Formal Verify failure grants no automatic rework. Renaming/auto eligibility cannot replace human observations with AI signatures.

approval.authorized_steps identifies explicit continuation instances. next_stage_authorized is legacy-only, never DAG authority. Approvals bind exact step/revision/workflow_ref/review_digest, never reusable stage names. Parent alone maintains state/approvals.

## Rework, completion and knowledge

Unchanged graph: revise affected dependency chains; invalidate candidate/fact-dependent branch decisions/downstream approvals/Gates. Changed stages/templates/conditions: stop workers, preserve old lock, create graph revision/explicitly confirm new card. Never reuse old policies/reviews across graphs.

Completion requires all selected nodes approved, terminal/required semantics/evidence satisfied, no active stages/leaves/valid waits/unstopped monitors. analysis_complete never sets verified; verified needs final-candidate Gates/all selected nodes' CI/CD evidence. not_selected requests no pipelines/waits and retains branch sources. learned also needs approved real accepted/rejected observations; rejected is not success. Direct closure follows closure, never invents Gate/business results.

Knowledge follows capabilities, never names: knowledge.read checks historical applicability; knowledge.prepare freezes verification/learning evidence snapshots. Other kinds submit explicit design proposals, never verified outcomes. Approved architecture/quality outputs sync design bodies; change/verification-only marks derived. Never infer full/compact from workflow names. Sources add workflow_ref/step_id; kind/evidence capability still mandates Gate/external evidence.

Publication is separate post-approval Hook under original knowledge_publish scope/live revocation/idempotency. Keep delivery/sync completion separate. Active Hooks block update/closure; inactive pending work cannot block updates forever.
