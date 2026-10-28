# V2.1: Implement-only TDD

TDD requires implementation-kind ∩ valid product-write authority ∩ dispatch. Spec/Architecture/Quality/Plan define inputs; Quality may draft acceptance specifications. Software Engineer alone writes/installs tests/runs RED/GREEN/REFACTOR. Scope/Diagnose read-only reproduction supplies failures, never TDD. Verify/Reviewers check independently, never add tests/implementation loops.

Locked context defaults Implement to test-driven-development/incremental-implementation. Freeze optional debugging/code-review; read on actual triggers/record result.skill_uses. Team Prompts/templates cannot move boundaries. Skills expand no paths/commands/rework/commit/push/deploy rights.

## Task slices/evidence

Approved Plan/change supplies Task ID/Requirement-AC/Oracle refs/completion criteria. New logic/behavior/bug fixes default to small repeated slices:

- RED: write tests against approved Oracle, execute/prove missing or wrong behavior. Keep failing assertions/test IDs/nonzero execution/output/exit code. Dependency/environment/permission/syntax/import/runner errors are invalid RED.
- GREEN: implement minimally; tests/affected regressions pass without expectation changes/test deletion/lower thresholds.
- REFACTOR: same-Implement structure improvements preserve behavior; rerun relevant tests. If unnecessary, record no_change/reason/passing evidence, never invented work.

[tdd-evidence](../templates/work/tdd-evidence.json) attaches to run evidence, no extra body. Slices: slice_id/task_id/requirements/ac_ids/oracle_ref/test_refs/test_ids. RED/GREEN retain execution identity/command/cwd/time/environment/code-test snapshots/hashes/counts/status/exit code/raw_evidence. RED adds failure class/Oracle-matching expected-actual assertions; REFACTOR action/reason/passing evidence. Full reports/stdout/stderr are required, never summaries as raw execution.

Intermediate snapshots stay separate from final candidate; never backfill history. final_regression_refs must execute on complete final candidate_ref/required tests/affected regressions. Verify versions/hashes/identities/raw bytes. Every task needs valid slice/explicit exception; gaps mean incomplete.

Parallel Implement leaves return own evidence; integration preserves ledger run/agent attribution. Quality Reviewer checks all tasks/independent sources. Final regressions cover integrated behavior; leaf checks alone cannot complete delivery.

Historical RED reuse requires authentic complete matching tests/Oracle/inputs/approved pre-fix provenance/original run-agent-time. Never infer/rewrite logs/roll back user trees to manufacture RED. Compare current/historical tests/approved Oracle; unrelated failures never substitute.

Documentation-only/behavior-neutral static config may use exceptions[{task_id,reason,validation_refs}] documenting inapplicability/actual alternative checks; regression/approval still apply. Routing/permissions/security/build/deploy/behavioral config is not exempt merely as config. Unautomatable work submits limits/alternatives to approvers; behavioral exemptions need specific decisions.

Expected RED/approved negatives consume no failure/feedback budget. Unexpected GREEN/regression failures follow stop/feedback/explicit repair authority; TDD grants no formal rework.

## Candidate, Gates, handoff

Implement ready_for_review submits candidate/TDD/self-tests only; independent Gates/completion stay NOT_RUN. After candidate review freeze all source/tests/config/dependencies. Parent dispatches distinct architecture-gate-reviewer/quality-gate-reviewer Agents/runs on same complete candidate, never Implement self-approval. Verify remains existing collector node, not extra stage/prematurely completed Implement loop.

Handoff needs PASS for TDD applicability/evidence/tests/both Gates/all AC, complete evidence, no drift and required human approvals (compact only within real delegation). Parent validates exact workflow/step/revision/candidate/review, sets implementation_verified_handoff candidate_ref/implement_review_ref/verify_review_ref/approval_ref/tdd_refs/gate_refs/ac_refs, reports Implementation Verified Handoff in existing verification.md.

Gate FAIL: parent stops/records defects-impact/obtains controlled-repair permission under existing authority/dispatches new Implement. New candidates default both Gates rerun; at least affected Gates actually rerun. Never retarget hashes/reuse pre-change Gates without complete unchanged-dependency proof. Incomplete verification/approval cannot complete.

Standard ends here, business_outcome=not_evaluated; no automatic Release/Learn/Production. Team/old-lock release chains retain frozen DAG/approval, never migrate history.
