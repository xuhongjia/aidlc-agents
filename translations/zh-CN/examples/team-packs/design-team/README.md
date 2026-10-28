# Design team example

This illustrative pack adds `team.design-analysis`: an approved decision brief fans out into independent options and security studies, then joins both in a proposed design. The study concerns existing evidence; no stage can write product files. No example study, test, implementation or deployment has been executed: **NOT_RUN**.

Install the pack using [`docs/team-workflows.md`](../../../docs/team-workflows.md), placing this directory's contents in the project's `.aidlc/team/` so `team:` references resolve there. Select `team.design-analysis` using the documented workflow configuration, then validate and resolve before execution. Review and merge definitions if a team pack already exists; do not overwrite it. This pack is a separate alternative to the API example, not a second pack to copy onto the same files.

The two study stages consume only the approved brief and project baseline, making their independence explicit. Synthesis binds all three upstream producers under the semantic `analysis` contract. Its output is `proposed-design.md` with the `architecture` contract; neither the basename nor the terminal implies product delivery.

All stages have `auto_eligible: false` and none has `product.write`. The workflow may analyze higher-risk questions through manual approvals, but `risk_ceiling: any` grants no operational access, risk acceptance or permission to act on a design. The terminal is `analysis_complete`, never `verified` or `learned`. A later implementation requires a delivery workflow with its own scope, approvals and verification. Overrides and tool bindings are empty; no enterprise policy or real approval is supplied.
