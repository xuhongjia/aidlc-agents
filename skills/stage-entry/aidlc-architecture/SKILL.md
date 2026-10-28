---
name: aidlc-architecture
description: Design AIDLC architecture changes and executable Architecture Fitness.
---

# architecture stage entry

Main session: route to `.aidlc/system/skills/orchestration/aidlc/SKILL.md`; the parent dispatches a fresh isolated child, never inline.

Child: require a valid dispatch matching locked `stage=architecture` and node `kind=design`; verify dispatch.kind. Follow frozen `workflow/worker.md`, role, Prompt/templates and dependencies from instruction_refs. Missing packet, mismatch or drift blocks. Read no active system assets, parent coordination/approval protocols or feedback ledger.

A kind=leaf returns only expected_outputs, never full-stage artifacts. Return the result to the parent and stop; no recursive dispatch or advancement.

Preserve sufficient existing architecture and link actual constraints to executable evidence. New checks remain drafts for approved Implement to install.
