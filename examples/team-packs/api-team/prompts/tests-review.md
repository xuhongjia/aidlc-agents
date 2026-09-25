# Review test coverage without changing tests

Follow `core:prompts/common.md`. Read only the approved `change` input and bound project evidence. Map each AC and Oracle to existing checks or the approved test additions; inspect positive, negative and compatibility cases plus the Architecture and Quality Gate definitions.

This stage is independent of compatibility review. Do not consume its unfinished output. Do not edit tests, scripts, product code, approved rules or thresholds. Write only the assigned `analysis` artifact, `test-coverage-review.md`; the stage does not execute tests or establish test results.

Identify coverage gaps and missing executable gate designs with exact references. If a gap requires a changed Oracle, new command, additional file ownership or larger implementation scope, return blocked for a revised scope and renewed approval. Review findings cannot expand the developer's authority. Keep every unexecuted check as NOT_RUN.
