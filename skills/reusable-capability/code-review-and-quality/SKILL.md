---
name: code-review-and-quality
description: Review an AIDLC implementation against approved constraints; self-review cannot replace independent Gates.
---

# Code review and quality · On demand

Adapted from addyosmani/agent-skills (MIT); see [provenance](../../../docs/engineering-skills.md). Load the frozen optional resource only for needed self-review; record why in `result.skill_uses`.

Inspect actual diff/evidence against AC/Oracle, architecture/security boundaries, maintainability and test relevance. Separate blocking defects from suggestions; identify paths and affected requirements.

Only approved in-scope structural changes belong in Implement's REFACTOR; rerun relevant tests. Propose changes outside authority. Self-review grants no Gate/approval; frozen-candidate changes require a new candidate and affected revalidation. No implicit commit, merge or production action.
