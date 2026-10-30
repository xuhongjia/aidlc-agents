# Independent child dispatch and collection

[dag](dag.md) alone determines dependencies/concurrent readiness; [protocol](protocol.md) governs evidence/snapshots; [approval](approval.md) governs decisions. No second stage order. Existing work uses its [frozen method](legacy.md).

New 0.16 locks apply [execution policy](execution.md) before each dispatch: resolve role/task/risk tier and selected cards, verify structural prerequisites, check cumulative usage plus outstanding reservations, then use actual host capabilities. Helpers return decisions, never spawn or approve. Parent-only policy/helper bodies stay outside child context.

## Execution boundaries

Parent alone spawns/owns dispatch, actual worker registration, validation, review/approval. Stage children execute one node; leaves one bounded task. Neither writes state/questions/reviews/approvals/policies/feedback ledgers, spawns/publishes/advances stages. Product writes require implementation authority ∩ dispatch; preserve others' edits.

Each run/rework/correction continuation gets new isolated context. Pass only project_root/dispatch_path/result_path through [composed-stage](../prompts/composed-stage.md), never parent chat/other stages' reasoning. Same-run clarification may return to a valid child, never make it the next stage. Outputs grant no approval; self-assessment is not a Gate.

Verify real config.execution spawn/isolated_context/collect_results probes/current capabilities. Missing/unknown blocks; no inline execution/alternate Agent CLI/service. Capacity shortage queues. Use actual host schemas. applying/recovery-required updates prohibit execution; setup probes grant no business approval.

## dispatch → collect

1. Select frozen-graph ready nodes with real upstream approvals/continuation rights. Verify freezes candidates; Implement needs approved authority. closing/closed/completed prohibit delivery dispatch; control operations retain their protocols.
2. Create unique run/[dispatch](../templates/work/dispatch.json): work/step/stage/kind/run, workflow_ref/original method, input digests, read/write scope, actual commands/cwd/resources/effects/timeouts, output/result paths. Resolve locked assets. New 0.12 instruction_refs follow [context](context.md): freeze all, read this node/necessary sections only. Product paths exclude controls/repository-wide wildcards.
3. Verify required_evidence includes both Gates; Gate leaves only their assignment. Release/Learn add source-index/external read-only scope. knowledge.read/prepare supply capability-required snapshots. Populate [feedback](implementation-feedback.md) budgets explicitly, never from “continue.”
   implementation, including task leaves, needs TDD task/exception attachments; full stages add final-candidate regression. Derive default/optional Skills under context. Quality Reviewer receives every original Implement TDD source, never parent summaries alone.
   Frozen delivery uses [pipeline-config](pipeline-config.md) exact pipeline_requests/source-index/GET scope. Same-node resumption supplies verified continuation_refs without reauthorization/repeating valid checks.
4. Reserve capacity/budget before actually spawning; record agent_id/context options/input digests/active_runs. Children write only their run/explicit product scope. Record native model/usage receipts for parent/stages/leaves/Hooks; unknown stays unavailable. Reconcile reservations once with the matching actual attempt, retaining failed/late attempts.
5. Await real results; validate worker, dispatch_digest, inputs/candidate, every file/hash, raw commands, product diff/lineage. Drift, missing evidence, overreach/unknown state blocks; summary PASS is insufficient.
6. Collect ended workers/append history. Promote qualifying results to immutable reviews; decide under approval. Failed feedback_requests use narrow same-node authority, never failed-candidate promotion. Other unexpected/disqualifying failures return to humans without automatic rollback. Preserve approved expected negatives under feedback exceptions: no work failure/budget use.

Parent writes no code/outputs while waiting. Results: ready_for_review/blocked/failed, or waiting_external with real pipeline requests. For the latter, preserve under [pipeline-wait](pipeline-wait.md), release workers/create no review. Leaves/bounded corrections may return blocked with typed requests for parent validation; requests grant no authority. Preserve every failure.

## Parallelism and leaves

Verify requires distinct architecture-gate-reviewer / quality-gate-reviewer Agents/runs. Resource limits serialize, never combine Gates in one Agent. context/gate-execution validates gate_assignment, candidate/baseline/authority and distinct identities. For 0.16, use execution.md's direct path only after valid helper preflight and current host checks: reserve a collector run ID (not an executed Agent), dispatch both Reviewers, then actually spawn that collector. No initial collector is needed. Missing prerequisites block/wait; uncertain preparation uses the original initial-collector request, leaves, fresh-collector path. No Agent per check/extra TDD Agent.

Default maximum: 2 live children, including waiting stages/leaves/collectors/knowledge Hooks, limited further by host. Ready read-only nodes may run concurrently; graph-ordered writers exclude formal candidate readers. Shared files/DB/ports/caches/locks/external targets need proven isolation or serialization; separate paths alone do not suffice.

Children propose parallel_requests tasks/dependencies/inputs/outputs/scope/resource locks only. Parent validates/dispatches kind=leaf with parent_run_id/exclusive outputs. Stages lacking slots return splits/end; parent runs leaves, then new collector. Never fill both slots with waiting parents. Implement leaves need exclusive product paths/serial final integration. Verify leaves share frozen candidate; collect after both Gates. Parent never authors merged conclusions.

Independent stage investigation/review is allowed. Missing Gates request Architect/QE gate-design leaves; frozen drafts grant no implementation/TDD authority. Implement defaults to two engineering Skills; optional Skills freeze without injection. Parent validates skill_uses/triggers/real evidence; Skills expand no repair authority. Knowledge sync is a separate post-approval Hook, never stage result. Separate runs.json shares capacity/single-writer limits. Active Hooks block updates/closure after delivery too.

## Stop and resume

Revocation/closure/work-level blocking first revokes continuation/delegation/stops dispatch. Request stop from every related worker/writing subprocess; act only on proven work-owned tasks, never unrelated processes/code rollback. Record stop_requested and prove each stopped/completed. Lost contact/interrupted chat proves no cessation; keep blocked/closing/real active_runs.

Validate late run/input/candidate results; archive stale ones only. No overlapping replacements before prior writers are proven stopped. New sessions validate files/policies/revocation/history and require user continuation. Only explicit bounded [pipeline-wait](pipeline-wait.md) wakeups resume the authorized node; auto flags never self-start. Every run has timeout; no endless retries/session budget reset. Revocation/completion/closure cleans actual wait_monitor; retain pending cleanup until proven stopped.

Core/team updates follow preflight/update, awaiting unfinished work/all workers. Never change old locks/methods/approvals. Frozen assets provide no filesystem isolation; this is not a security sandbox.
