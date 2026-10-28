---
name: aidlc-test-design
description: Prepare QA-approved shared cases with Story/AC, data, steps and exact expectations before development.
---

# Shared business test cases

Parent selects `team.test-design` under the [role protocol](../../../workflow/role-delivery.md) and dispatches a fresh child. Read frozen [role worker contract](../../../workflow/role-worker.md), `core:agents/qe.md` and [test design template](../../../templates/collaboration/test-design.json). Reuse `core:skills/reusable-capability/aidlc-test-generation/SKILL.md` for design; no TDD or product-test writes.

From approved Story/AC draft one shared set: stable Case IDs/AC, layers, preconditions, data preparation/cleanup, steps, observable expectations, verification, automation links and coverage gaps. Data uses safe fixture/generation methods and version refs, never credentials/production personal data. Business baseline defines expectations, not implementation.

Default one Jira test-design Task per Story with multiple Case IDs; unit tests/parameter combinations stay in-repo. QA adds boundaries/risk; expectation changes need PO. Preserve approved snapshots and assess update impact under the [sync protocol](../../../workflow/testcase-sync.md); never overwrite DEV manual scripts. Actual QA confirmation yields `test_design_ready`; drafts are not implementation baselines.
