---
name: aidlc-story
description: Turn PRDs/Jira requirements into source-mapped Stories, stable AC and behavior slices for PO review.
---

# Standardize Jira requirements

Parent: select `team.story` under the [role protocol](../../../workflow/role-delivery.md), freeze the chosen language/output templates, and dispatch an isolated child. English is default; consult [language selection](../../../docs/jira-story-templates.md) only when configuring an override.

Child: read the frozen [role worker contract](../../../workflow/role-worker.md), PO role, Story prompt, selected output templates and approved source snapshots. Use `core:skills/reusable-capability/aidlc-spec-generation/SKILL.md` when refining acceptance; do not load other locales or full delivery rules.

Return `story.md` + `acceptance.json`; the Stage prompt owns their schema and readiness checks. After actual PO approval, hand off `requirements_ready`. Jira publication needs explicit target/content authority; reuse existing issue identity. Test design and implementation follow separately.
