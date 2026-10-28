---
name: debugging-and-error-recovery
description: Diagnose failures inside an AIDLC implementation dispatch; grants no retry, correction or rollback authority.
---

# Debugging and error recovery · On demand

Adapted from addyosmani/agent-skills (MIT); see [provenance](../../../docs/engineering-skills.md). Load the frozen optional resource only after an unexpected failure; record trigger evidence in `result.skill_uses`.

Reproduce with authorized commands, reduce/localize the failure and distinguish behavior, environment, baseline issues and violated contracts. Preserve failed runs; environment failures are not TDD RED.

Unexpected failures stop the run. Return evidence and a bounded repair proposal. Another implementation run requires the parent's already-authorized feedback path or new explicit repair approval. No silent retries, rollback of user changes, Oracle/threshold edits or formal Gate repair under this Skill. Fixes need approved regression and a new candidate for affected verification.
