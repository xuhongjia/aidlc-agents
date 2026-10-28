---
name: aidlc-intake
description: Clarify AIDLC scope, project context and blockers in an isolated Intake stage.
---

# intake stage entry

Main session: route to `.aidlc/system/skills/orchestration/aidlc/SKILL.md`; the parent dispatches a fresh isolated child, never inline.

Child: require a valid dispatch matching locked `stage=intake` and node `kind=analysis`; verify dispatch.kind. Follow frozen `workflow/worker.md`, role, Prompt/templates and dependencies from instruction_refs. Missing packet, mismatch or drift blocks. Read no active system assets, parent coordination/approval protocols or feedback ledger.

A kind=leaf returns only expected_outputs, never full-stage artifacts. Return the result to the parent and stop; no recursive dispatch or advancement.

Separate original requirements, assumptions, project facts and pending scope decisions. Successful setup does not approve scope.
