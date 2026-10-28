---
name: incremental-implementation
description: Implement approved AIDLC tasks in small testable slices without expanding scope or authority.
---

# Incremental implementation

Adapted from addyosmani/agent-skills (MIT); see [provenance](../../../docs/engineering-skills.md).

Require a valid implementation dispatch and approved dependencies, Requirement/AC mappings, Oracle, paths and commands. Use frozen TDD for one vertical behavior slice at a time; integrate serially unless the parent assigns proven exclusive writers/resources.

Keep changes reviewable, rollback clear and unrelated user changes intact. Requirement, contract, architecture, security, Oracle or permission discoveries stop implementation and return to the appropriate authority. Planned RED/refactor grants no arbitrary repair authority.

Record task outcomes/final regression in the existing implementation document and evidence. Return a candidate, not verified completion. No automatic commit, push, Agent dispatch or workflow advancement.
