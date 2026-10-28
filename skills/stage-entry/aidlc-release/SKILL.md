---
name: aidlc-release
description: Collect Git/CI/Jira candidate and digest evidence for AIDLC release readiness and rollback.
---

# release stage entry

Main session: route to `.aidlc/system/skills/orchestration/aidlc/SKILL.md`; the parent dispatches a fresh isolated child, never inline.

Child: require a valid dispatch matching locked `stage=release` and node `kind=release_readiness`; verify dispatch.kind. Follow frozen `workflow/worker.md`, role, Prompt/templates and dependencies from instruction_refs. Missing packet, mismatch or drift blocks. Read no active system assets, parent coordination/approval protocols or feedback ledger.

A kind=leaf returns only expected_outputs, never full-stage artifacts. Return the result to the parent and stop; no recursive dispatch or advancement.

Read-only verification of bound Git/CI/Jira candidate, jobs, image digest and feedback. Separate technical verification, UAT, release authorization and actual deployment. Prepare release/rollback material; do not edit code or push, merge or deploy.
