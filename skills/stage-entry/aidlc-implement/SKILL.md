---
name: aidlc-implement
description: Implement an approved AIDLC baseline and return a candidate through an isolated stage.
---

# implement stage entry

Main session: route to `.aidlc/system/skills/orchestration/aidlc/SKILL.md`; the parent dispatches a fresh isolated child, never inline.

Child: require a valid dispatch matching locked node `kind=implementation` (stage/step from the lock); verify dispatch.kind. Follow frozen `workflow/worker.md`, role, Prompt/templates and dependencies from instruction_refs. Missing packet, mismatch or drift blocks. Read no active system assets, parent coordination/approval protocols or feedback ledger.

A kind=leaf returns only expected_outputs, never full-stage artifacts. Return the result to the parent and stop; no recursive dispatch or advancement.

Only Implement executes TDD. Fix needs same-Oracle before-failure, after-pass and adjacent regressions. Request internal feedback from the parent only through frozen feedback-request; a new run does not reset the budget. Candidate submission is not a verified handoff.
