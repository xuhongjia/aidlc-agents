---
name: debugging-and-error-recovery
description: Diagnose observed implementation failures using real evidence within an existing AIDLC dispatch; grants no retry, correction or rollback authority.
---

# Debugging and error recovery · on demand

Adapted from addyosmani/agent-skills (MIT); see [provenance](../../docs/engineering-skills.md). Load only the frozen optional resource after an actual unexpected failure; record its trigger evidence in `result.skill_uses`.

Reproduce with the existing authorized commands, localize the failure, reduce the case and identify whether it is behavior, environment, an existing baseline issue or a violated approved contract. Preserve all failed runs. An environment failure cannot count as TDD RED.

Unexpected failures stop the run. Return evidence and a bounded repair proposal; only the parent's already-authorized feedback path or a new explicit repair approval can permit another implementation run. Do not silently retry, roll back user changes, edit Oracle/thresholds, or use this Skill to repair a formal Gate failure. A fix is followed by the approved regression and a new candidate for affected verification.
