---
name: incremental-implementation
description: Implement approved AIDLC tasks as small independently testable slices inside implementation dispatches without expanding scope or delivery authority.
---

# Incremental implementation

Adapted from addyosmani/agent-skills (MIT); see [provenance](../../docs/engineering-skills.md).

Only a valid implementation dispatch can execute this Skill. Read its approved task dependencies, Requirement/AC mappings, Oracle, paths and commands. Complete one vertical behavior slice at a time using the frozen TDD contract; integrate independent slices serially unless the parent assigns proven exclusive writers/resources.

Keep changes reviewable and rollback clear. Preserve unrelated user changes. Discoveries affecting requirements, contracts, architecture, security, Oracle or permissions stop implementation and return to the appropriate authority. Planned RED/refactor steps are ordinary implementation, not permission to repair arbitrary failures.

Record task outcomes and final regression in the existing implementation document and technical evidence. Return a candidate, not a verified completion. Do not automatically commit, push, start another Agent, or advance the workflow.
