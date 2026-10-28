---
name: code-review-and-quality
description: Perform an optional implementation self-review against approved requirements and constraints; does not replace independent AIDLC Architecture or Quality Gate reviewers.
---

# Code review and quality · on demand

Adapted from addyosmani/agent-skills (MIT); see [provenance](../../../docs/engineering-skills.md). Load only the frozen optional resource when a task/risk requires self-review, and record the reason in `result.skill_uses`.

Review correctness against AC/Oracle, architecture/security boundaries, maintainability and test relevance. Inspect the actual diff and evidence, not just the implementer's summary. Separate blocking defects from optional suggestions and point to paths and affected requirements.

Make only approved in-scope structural improvements during Implement's REFACTOR and rerun relevant tests. Anything outside authority returns a proposal. Self-review cannot sign a Gate or approval; frozen-candidate changes require a new candidate and affected revalidation. No implicit commit, merge or production action.
