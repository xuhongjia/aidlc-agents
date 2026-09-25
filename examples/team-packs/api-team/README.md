# API team example

This illustrative pack adds `team.api-enhancement` for a bounded, local API enhancement. It is not enterprise policy or evidence of approval. No product workflow, check, deployment or connector operation has been run: **NOT_RUN**.

Install the pack using the team-pack setup in [`docs/team-workflows.md`](../../../docs/team-workflows.md), placing this directory's contents in the project's `.aidlc/team/` so `team:` references resolve from that root. Select `team.api-enhancement` through the workflow configuration described there, then validate and resolve the selected workflow before execution. Do not copy it over an existing team pack without reviewing and merging its definitions. The four files in `templates/extensions/` are intentionally incomplete authoring skeletons, not installed approvals.

Scope produces the semantic `change` contract in `api-change-brief.md`. Its approved boolean `needs_review` chooses one path:

- `true`: compatibility and tests reviews run independently, each produces `analysis`, then implementation joins both approved results.
- `false`: implementation proceeds from approved scope; both review steps are skipped and the optional analysis binding is absent.

The selected branch's unfinished or blocked review is never silently optional. Implementation always uses scope as its explicit authority. `core.verify` performs independent verification and requires both Architecture and Quality Gate evidence. Implementation and verification use `api-delivery-note.md` with different semantic contracts, showing that a basename does not determine what an artifact means.

`risk_ceiling: low` and `auto_eligible: true` describe eligibility only. Automatic approval also needs a real, current project delegation and every core condition. Authentication, sensitive data, breaking behavior, production access, migrations, external writes and other mandatory escalation flags stop this workflow regardless of `needs_review`. The pack includes no overrides, tool bindings or preauthorization.
