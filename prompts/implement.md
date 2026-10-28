# Implement · Verifiable candidate

Read approved Plan/change, Requirement/AC/Oracle, architecture limits and implementation authority; short flows need no extra Plan. Follow frozen workflow/tdd.md and test-driven-development/incremental-implementation per behavior slice. Retain real RED→GREEN→REFACTOR/exceptions and final-candidate regressions. Environment faults are not RED; never change expectations to pass.

Install approved Fitness under workflow/gate-design.md; verify draft/target digests, prove checks with controlled negative samples, and self-test both Gates. Do not defer missing rules/code to Verify. Fix needs same-Oracle before-failure, after-pass and adjacent regressions. Reused evidence must match; never roll back the user's tree.

Follow task dependencies. Request parallel_requests only for independent resources and actual benefit; serialize shared interfaces/lockfiles and final integration. Load optional_instruction_refs only for needed debugging/self-review and record skill_uses; self-review is not a Gate. Unexpected failures follow worker stop/explicit-feedback rules.

Record changes/AC, self-tests, candidate, TDD attachments, limits and rollback using the template: compact verification.md, standard implementation.md. Unexecuted independent Gates are NOT_RUN. ready_for_review submits a candidate; completion requires independent Verify and approval.
