# Internal Implement feedback: at most two rounds, not stage rework

Only new 0.10 low-risk delivery implementation before that revision's first candidate review qualifies. Exclude standard/high-risk/analysis/Verify/leaves/publication Hooks. manual/checkpoint/auto each needs explicit work-card budget authority; absent authority, stop on failure.

## Fixed budget and protected baseline

policy.schema_version=3 implementation_feedback freezes {step_id,revision,max_correction_rounds}. Valid maxima: 0 or 2; null/missing/old schema=0. Budget is independent of mode; manual never automatically approves stages. dispatch.implementation_feedback includes policy_ref/max_correction_rounds/round/attempt_refs; initial round=0.

Upstream approval remains write authority. Policy binds graph/request/method/exact implementation revision/paths/commands; budget grants no authority. Protect tests/Oracle/Gates/thresholds/command entries/dependency config. Freeze actual digests after first approved-draft check installation. Correct original authorized implementation only; no new features/expectations/hidden or skipped failures/dependency upgrades.

## Failure → request → ledger → new continuation run

1. Execute implementation/self-tests. Only evidenced actual test/check FAIL caused by this change, repairable within scope, lets full Implement return feedback_request: failure_kind=introduced_regression, status=FAIL, failure_refs (run raw logs/digests), candidate (complete current candidate), cause_evidence_refs, proposed_write_paths/commands. Return blocked/preserve FAIL/stop; never repair before authorization. Parent adds failure_result_ref after collecting raw result, avoiding self-reference.
2. Parent checks failure/causality/candidate/protected baseline/authority/remaining budget/latest revocation. No dispatch during validation; retain delegation only if qualified with budget. Environment failures/unknown causes/timeouts/missing rights or evidence/risk changes/disqualifying failure immediately revoke/return to humans, never retry. Expected approved pre-fix RED/controlled Gate negatives are baseline/rule evidence, not work failure/revocation/budget use. Preserve FAIL/exit codes; candidate still must pass normal checks.
3. Prove prior worker/writers stopped; enumerate every feedback record/run_history for step/revision. Before each round parent writes immutable feedback/STEP-rN/round-K.json via [attempt template](../templates/work/feedback-attempt.json), binding work/graph/method/step/revision/policy/failed result-logs/input candidate/next run_id. K=consecutive 1,2; never reserve a failure twice. Reservation consumes budget even if startup fails/interruption occurs; no automatic refunds.
4. Dispatch new independent isolated same-step/revision continuation, never DAG nodes/back edges/stage approval. round=K carries all attempt_refs/current candidate/original authority/unchanged checks-permissions; input_refs includes actual digests. Child validates complete ledger/reserved run, repairs authorized implementation/retests. Never reuse reservations for another run.
5. Further failure may request next round identically. Persistent FAIL after two rounds revokes/returns to humans. First candidate review requires all final checks passing. execution keeps initial/all continuation runs; body only correction count/fixes/residual risk. Failed logs remain FAIL.

Round result.checks retains round/check_id/command/status/exit_code/raw_evidence/actual candidate; feedback_request defaults null. Retest original approved local commands only, side_effects=[local-check], no external writes/new paths/authority/effects. Self-test PASS waives neither independent Verify nor checkpoint final human review.

## Resume and stop

Budget accumulates by work/workflow_ref/step/revision, never session/run/policy ID. state.nodes[step].feedback_refs is an index only; inspect immutable ledgers/dispatch/results/history, not used_count alone. Missing records/hash mismatch/duplicate or skipped rounds/active workers/uncertain use block; never assume budget remains.

Resumption requires explicit user continuation/prior-worker-subprocess checks. Unknown reserved execution stays consumed/blocked, never replayed; humans decide. New policy cannot reset same-revision budget. Formal rework needs new revision/human implementation authority. Verify FAIL always means formal rework, never automatic feedback_request.

No network/publication retries/host-permission expansion. This instruction contract is auditable; reference-model tests prove no actual host budget enforcement.
