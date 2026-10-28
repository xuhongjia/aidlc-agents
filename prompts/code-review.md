# One-off · Code review

Confirm diff/commit/file scope and approved baseline: Spec for standard, change.md for enhance/fix. Inspect implementation/tests for defects, boundaries, compatibility, security, regressions and missing AC coverage. Each finding needs location, trigger, impact and evidence; style preferences are not blocking defects.

Check for expectation changes, deleted tests or lowered thresholds hiding failures. Never claim unexecuted tests passed. If no issue is substantiated, report scope and residual uncertainty.

Read-only: no code edits, approval or workflow advancement. Installed projects follow `.aidlc/system/workflow/protocol.md`; findings supplement stage review.
