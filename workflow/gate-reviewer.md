# Assigned Gate execution

dispatch.gate_assignment={kind,collector_run_id} fixes ownership; locked context.gate_reviewers fixes role/gate-review Prompt. collector_run_id may be reserved, not yet executed. required_evidence includes assigned Gate only. Write only own architecture-gate.json or quality-gate.json/raw logs. No Agent per command.

Parallel checks require separate reports/temp directories and no shared writable DB/cache/port/environment; otherwise serialize.

Frozen gate-result records candidate/baseline_refs/times/environment/checks/status. Each check retains ID, blocking/advisory, actual command/cwd/exit code/result, executed_count/skipped_count, success criteria/rule assertions/raw_evidence paths/actual digests.

Quality checks every Task's TDD/exceptions/final-candidate regression/per-AC evidence/fix differences/adjacent regressions/real manual observations. Do not load TDD execution Skills or execute TDD.

Follow approved local/ci/hybrid rules. Independently validate CI job/attempt/configuration/rule/commit/source/candidate/assertions; command=approved job, unreported exit_code/cwd=null. Return unready results/dependency gaps to parent; add no bindings/monitors or CD waits.
