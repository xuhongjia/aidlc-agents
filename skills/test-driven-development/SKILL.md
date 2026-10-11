---
name: test-driven-development
description: Execute behavior-first RED, GREEN and REFACTOR only inside an authorized AIDLC implementation dispatch; not Spec, Architecture, Quality, Plan or Gate review.
---

# Test-driven development · Implement only

Adapted from addyosmani/agent-skills (MIT); see [source and adaptation](../../docs/engineering-skills.md). This is the single packaged TDD Skill, not a separate TDD Agent.

Require a valid implementation dispatch, approved task/AC/Oracle and product-write authority. Use the frozen [TDD contract](../../workflow/tdd.md); no authority means blocked. Discover the repository's real focused-test and regression commands first.

Work in small behavior slices, testing public interfaces with expected values from the approved Oracle, not the implementation. For each slice:

1. RED: write the behavior test, run it, inspect the actual failure and save raw evidence before changing production behavior. The failure must demonstrate the missing/incorrect expected behavior. Environment, dependency, permission, syntax/import or test-runner failures are not RED.
2. GREEN: implement the minimum authorized change, rerun the focused tests and necessary affected regressions. Do not weaken approved AC, Oracle, assertions, rules or thresholds.
3. REFACTOR: improve structure without changing behavior, then rerun related tests. If no useful refactor is needed, record `no_change` with a reason and passing evidence. Repeat by task slice, not by writing every test then all code.

Retain real commands, test IDs/counts, time/environment, intermediate code/test snapshots and full outputs. Never relabel a GREEN run as historical RED. New/changed logic and bug fixes default to TDD; genuinely behavior-free documentation/static configuration may have a reasoned exception and suitable validation, never a blanket exception for risky configuration.

Final regression must cover the final candidate. Submit evidence for independent review; TDD does not grant Gate PASS, human approval, commit/push or deployment.
