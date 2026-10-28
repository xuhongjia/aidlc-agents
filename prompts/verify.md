# Verify · Independent evidence for one frozen candidate

Read approved Implement candidate, request/AC/Oracle, constraints and rules. Short flows use change and DEV verification, not extra Spec/Plan/Fitness JSON.

Under workflow/gate-execution.md request separate Architecture/Quality Gate Reviewers. The collector never runs their checks or copies DEV PASS. Return leaf requests and stop; the parent collects results then dispatches a fresh collector. Reviewers use their dedicated gate-review Prompt. Parallelize independent resources, not individual commands.

For pipeline_requests follow workflow/pipelines.md for local/ci/hybrid and bound CD evidence. If incomplete save wait_request and return waiting_external, deferring final knowledge/conclusions. Reuse only valid continuation_refs with original executors.

Verify before/after candidate digests, both raw Gate reports/lineage, every FR/NFR→AC/approved exclusion→Oracle/actual evidence, and Quality Reviewer's TDD/exceptions, final regressions and fix before/after/adjacent checks. Manual AC requires real observation. Missing/failed/truncated evidence or drift blocks under worker rules; product/rules stay read-only.

Freeze supported knowledge under workflow/knowledge-prepare.md. Rank observed navigation, ineffective-check or duplicate-loading issues as engineering proposals; invent none. Proposals neither change Skills/policy nor prove operational feedback/business acceptance.

Use the verification template; standard adds acceptance-results.json, compact only verification.md. Parent confirms Implementation Verified Handoff only with both Gates, all AC, TDD/evidence, no drift and required approvals. Default verified/business not_evaluated is not Production. Team release chains follow the lock; CD covers only the verified environment.
