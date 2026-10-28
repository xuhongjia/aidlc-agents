# Verification

AIDLC_DRAFT — DEV submits implementation evidence; a fresh QE child submits verification. Preserve old snapshots.

## Change and candidate

Approved change.md review, actual changes, file/test→AC mapping, candidate hashes, unfinished items. Verify retains DEV's summary without repeating requirements.

## Evidence

Implement records Task/AC RED→GREEN→REFACTOR (or no_change retest), tdd-evidence and specific exceptions/alternative verification. Verify reviews original sources and final-candidate regression; it does not execute TDD or add body types.

Identify independent Architecture/Quality Reviewer agents/runs; link original reports/logs bound to the same candidate and approved rules. Both Gates are mandatory. DEV records installation/self-tests/negative cases, not independent PASS.

| AC / Architecture or Quality check | DEV self-test or QE verification | Actual result | Command/environment/exit/count or human observation | Raw evidence path |
|---|---|---|---|---|

Use PASS / FAIL / NOT_RUN. DEV may leave QE checks NOT_RUN; Verify needs success evidence for every required check/AC. Fix needs pre-fix failure, post-fix success and adjacent regression.

Only with CI/CD bindings: link pipeline-result/source-index and candidate→pipeline/job/attempt→immutable artifact→environment/deployment→smoke/health. Distinguish local/CI/hybrid sources and original executors; waiting/missing evidence cannot pass.

## Delivery conclusion

Implementation Verified Handoff requires TDD/exception review, required tests, both Gates and all AC PASS, complete evidence, no drift and required approvals. Recommend approval first; the parent records it before completion. DEV submits only a candidate; approved Verify establishes verification, not automatic Production or business acceptance/benefit.

Record risk, rollback and observation/deployment notes. For CD, name verified environment/version/time; others remain unknown. Results do not constitute human approval.
