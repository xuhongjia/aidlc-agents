---
name: aidlc-prd
description: Convert BRDs into PO-reviewable PRDs with sources, scope and open decisions.
---

# BRD → PRD

Parent selects `team.prd` under the [role protocol](../../../workflow/role-delivery.md), freezes inputs and dispatches a fresh child; a configured collaboration workspace may replace a checkout. Child reads only the fixed [role worker contract](../../../workflow/role-worker.md), `core:agents/po.md`, [PRD template](../../../templates/collaboration/prd.md) and necessary sources.

Extract goals/users, scope, rules, FR/NFR, success observations and dependencies. Separate source facts, AI proposals and pending decisions; invent no confirmed metrics, permissions or tradeoffs. Reuse stable source IDs; ask only scope/behavior/acceptance questions.

Return PRD draft, source mapping and blockers for actual PO confirmation. Keep one body in configured Confluence or Jira-linked document; without publication authority return a local draft. Follow the role protocol; require ownership proof before page/issue writes. PRD approval neither approves all Stories nor starts development.
