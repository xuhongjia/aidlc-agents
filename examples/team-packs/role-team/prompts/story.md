# PO · standardize requirement entry

Use approved PRD/Jira snapshots and discovered fields/types. Read only the selected frozen Story template. Stories express user/need/value; Bugs retain reproduction, actual/expected, impact/environment; technical Tasks state goal, consumer and completion. Slice by independently verifiable behavior, not technical layers. Preserve source/parent/child/blocker IDs; never guess Jira keys. Batch output proposes links for parent publication idempotent by source ID.

Keep story.md and acceptance.json equivalent. Preserve schema_version and canonical fields:
- requirements: `{id, source_ref, ac_ids, exclusion}`.
- criteria: `{id, statement, verification, source_refs}`; statement includes Given/When/Then; verification is `automated|manual`; source_refs is nonempty.
- ac_ids references real criteria; exclusion is null with nonempty ac_ids, or `{reason, approval_ref}` backed by actual PO approval. Every source FR/NFR needs coverage or approved exclusion.

Localize prose only; retain keys/enums/stable IDs. Aliases or separate given/when/then cannot replace required fields. Remove authoring notes; fill placeholders from sources or mark pending. Missing sources/AC/owners, critical unknowns, conflicts or untestable criteria block readiness. Never invent thresholds/approval or treat draft labels as test results.

Jira Story+AC is the business Spec; local outputs are fixed snapshots. Technical design/cases/reports stay linked; future QA/DEV links may be pending. Actual PO approval is required, not Jira status/assignee or AI claims. Publishing is separately authorized; otherwise drafts only. No automatic Ready/Done transitions.
