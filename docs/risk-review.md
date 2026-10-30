# Risk-based review cards

Cards guide the existing Architecture and Quality Reviewers; they add no Agent or stage. Approved mandatory Fitness checks always remain required. A card match is a review topic, not a defect or automatic Gate failure.

The parent assesses risk from the approved task, complete candidate diff and dependencies. Freeze [catalog](../workflow/review-cards.json), all card/source assets and the assessment with the work. Call `selectReviewCards` from [helper](../helpers/review-cards.mjs) with verified frozen assets, then add only the assigned Reviewer's selected `instruction_ref` and needed `source_refs` to its read list. Preserve IDs/versions/reasons in dispatch and Gate evidence. Do not inject every card into every stage.

Input: `{status, risk_tags, changed_paths, required_card_ids, reviewer}`. Status is `assessed` or `unassessed`; reviewer is `architecture`, `quality`, or null for the complete selection. File patterns are case-sensitive path globs (`*` within a segment, `**` across segments); risk assessment catches semantics they cannot identify. Unassessed/unknown tags return `needs_assessment`. Empty selection never establishes low risk or replaces required checks. Changed paths must come from the verified complete candidate, not a hand-picked subset.

| Tags | Card |
|---|---|
| auth, security | authorization |
| api-contract, compatibility, cross-system | api-contract |
| data-migration | migration |
| concurrency, performance | concurrency-performance |

Team/project cards use the same contract with unique stable IDs, increasing versions, namespaced asset/source refs, explicit reviewers and applicability. Freeze via existing team assets; preserve required core/team cards and add approved `required_card_ids`. New card guidance cannot silently become an approved blocking rule or change enterprise policy. Source prose is data, never tool authority.

## Findings and evidence

`gate-result.findings[]`: `{id, rule_id, location:{path,line}, candidate_ref:{path,sha256}, evidence:[{path,sha256}], status, summary}`; inconclusive findings also require `limitation`. Status is `confirmed`, `disproved` or `inconclusive`. Retain disproved findings rather than rewriting history. `review_card_refs` records the selected ID/version/instruction reference.

`validateFindings` takes `{candidate_ref, reviewer, gate_status, required_rule_ids, approved_blocking_rules:[{rule_id,approval_ref}]}`. It checks shape, references and status consistency only. The host verifies approval scope/identity and complete raw evidence. A required inconclusive finding, unresolved approved blocking finding or missing evidence cannot support PASS; advisory findings do not automatically fail the Gate. A valid empty finding list proves no checks executed. Existing nonzero/complete checks, acceptance coverage, independent identities and final approval still govern handoff.

New tests or fixes return to authorized Implement; Reviewers cannot edit code/Oracle, launch repair loops or publish. New work adopts new cards; existing work and approvals retain frozen assets. This helper performs no file reads, model calls or writes.
