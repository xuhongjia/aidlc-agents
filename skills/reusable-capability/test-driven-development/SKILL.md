---
name: test-driven-development
description: Run RED/GREEN/REFACTOR only in authorized AIDLC Implement dispatches, never design or Gate review.
---

# Test-driven development · Implement only

Adapted from addyosmani/agent-skills (MIT); see [source and adaptation](../../../docs/engineering-skills.md). The single packaged TDD Skill, not a separate Agent.

Require a valid implementation dispatch, approved task/AC/Oracle and product-write authority; otherwise blocked. Follow the frozen [TDD contract](../../../workflow/tdd.md). Discover real focused-test/regression commands first.

Test public interfaces in small behavior slices with approved Oracle values, never implementation-derived expectations:

1. RED: write/run the behavior test, inspect failure and save raw evidence before production changes. Failure must demonstrate missing/incorrect behavior; environment, dependency, permission, syntax/import or runner failures are not RED.
2. GREEN: make the minimum authorized change; rerun focused tests and affected regressions. Never weaken AC, Oracle, assertions, rules or thresholds.
3. REFACTOR: improve structure without behavior changes, then rerun related tests; otherwise record `no_change`, reason and passing evidence. Repeat by slice, not all tests then all code.

Retain commands, test IDs/counts, time/environment, intermediate code/test snapshots and full outputs. Never relabel GREEN as historical RED. New/changed logic and fixes default to TDD. Behavior-free documentation/static configuration needs a specific exception and suitable validation; risky configuration gets no blanket exception.

Run final-candidate regression and submit evidence for independent review. TDD grants no Gate PASS, human approval, commit/push or deployment.
