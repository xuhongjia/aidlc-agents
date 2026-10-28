---
name: aidlc-test-generation
description: Design AIDLC Oracles, acceptance cases and coverage; executable business tests belong only to Implement.
---

# Requirements-driven tests

Main-session requests route through `.aidlc/system/skills/orchestration/aidlc/SKILL.md`; valid children follow `.aidlc/system/prompts/common.md` without redispatch. Only Implement with the profile's approved baseline and explicit file ownership may write project tests; others write run artifacts. Return findings in the stage result, never state/approvals/review.

- Use approved AC, API/data rules, Architecture and test conventions to select layers, entrypoints, fixtures and isolation; add no arbitrary frameworks.
- Map tests to AC IDs, inputs/preconditions, expected results and falsifiable assertions. Requirements define expectations, not implementation.
- Cover positive, negative, boundary and applicable regressions. State mock/dependency limits; all-mock tests do not prove integration.
- Nonautomatable AC needs observation steps, evidence and confirming role. Zero/skipped tests are not verified.
- Generated source needs discovery/entrypoint checks. Report results only after execution; label unexecuted work.

Spec/Architecture/Quality/Plan design specifications, assertions, data or pseudocode. Implement may write tests; only test-driven-development owns RED/GREEN/REFACTOR, with no duplicate TDD Skill/Agent.

Return traceable designs/source and coverage gaps. Unclear/incorrect Oracles require clarification or return to the prior stage, never unilateral changes.
