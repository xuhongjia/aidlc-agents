---
name: aidlc-verify
description: Collect independent dual-Gate, TDD and per-AC evidence for the same AIDLC candidate.
---

# verify stage entry

Main session: route to `.aidlc/system/skills/orchestration/aidlc/SKILL.md`; the parent dispatches a fresh isolated child, never inline.

Child: require a valid dispatch matching locked node `kind=verification` (stage/step from the lock); verify dispatch.kind. Follow frozen `workflow/worker.md`, role, Prompt/templates and dependencies from instruction_refs. Missing packet, mismatch or drift blocks. Read no active system assets, parent coordination/approval protocols or feedback ledger.

A kind=leaf returns only expected_outputs, never full-stage artifacts. Return the result to the parent and stop; no recursive dispatch or advancement.

The full node uses a QE collector for same-candidate dual Gate, per-AC and TDD evidence. Gate leaves use dedicated Reviewers. Their actual identities are distinct from each other, implementers and collector. The collector does not execute Gates; product files/rules are read-only, and no TDD is performed.
