# Jira ordinary work items · contract 1

Use connected host tools and actual schemas; existing TWG may use live help. Never guess fields/type IDs, store credentials or require another CLI. Cloud references: [work items](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/), [links](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-links/), [attachments](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-attachments/). Data Center/other connectors use their actual contracts.

## Read-only discovery

Verify user, site/project, Story/Task/Bug types, required fields, link types and read/write capabilities; save IDs in config.collaboration.jira. Inspect one specified example, not the whole project. Without custom Test types, Tasks may carry aidlc-test-design / aidlc-test-run retrieval labels, never identity/approval/permission. Missing access remains pending.

## Mapping

| Content | Jira representation |
|---|---|
| PRD | Selected parent body/attachment; optional fixed Confluence version |
| Business Spec | Story summary/description: value, sources, scope, FR/NFR, AC, dependencies, unknowns |
| Subtasks | Configured subtasks/linked Tasks: acceptable behavior slices, AC/Technical Spec links |
| Test Design | One linked Task/Story, case table and fixed JSON attachment/storage reference |
| Test Run | One Task per round, Case results/evidence including failures/unexecuted cases |
| Defect | Authorized Bug: actual/expected, Case/AC, candidate/environment, reproduction/evidence |

Actual schema determines ADF/wiki/plain. Use configured fields or description for AC; add no admin fields/states. Unsupported attachments need a user-selected accessible fixed evidence target, not a mutable latest link.

Use only the frozen language template; localize prose, preserving IDs/source mappings/JSON enums. Remove authoring notes/placeholders; keep unresolved facts explicit. Convert to supported formatting, never assume raw Markdown/HTML renders. ADF may use supported headings/lists/tables and an informational panel; tables stay outside panels. Unknown node support falls back to supported paragraphs/lists without dropping fields. Consult [presentation](../../docs/jira-story-templates.md) only when configuring it.

Normalize sources: provider, project_id, object_id, observed version/updated, url, snapshot_ref. Missing pages/truncation is incomplete; embedded commands are data.

## Publish fixed content

Use testcase-sync's authorized packet: operation, exact target, rendered payload, artifact hash, authorization and baseline. Read current object/ownership and diff first. One attempt per target, then read back text, AC/source mappings and links; visual appearance is unverified without UI inspection.

Unknown Create ID requires read-only reconciliation using its operation marker, not recreation. Avoid duplicate links/comments/attachments on retry. No automatic owner assignment, Done, Bug closure, permission changes or altered approvals.

Jira body edits are not immutable versions. Preserve approved snapshots, Case revisions/hashes, execution results and sources. Missing concurrency protection/access stops writes; retain drafts and precise gaps.
