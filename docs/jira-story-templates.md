# Jira Story language and presentation

[English](../templates/collaboration/story.md) is the default; [Simplified Chinese](../templates/collaboration/story.zh-CN.md) has the same fields. Do not source new work from the `translations/zh-CN/` archive.

## Select a language

Ask AI in the PO workspace:

```text
Use aidlc-story for <approved source and scope>, in <English or Simplified Chinese>.
Existing Story/work: <reference or none>. For new work, bind the selected template
before freezing. Keep source FR/NFR and stable AC IDs; return story.md and
acceptance.json for PO review before Jira publication.
```

Localize narrative only; keep filenames, JSON keys/enums, stable IDs and approval semantics. Do not duplicate editable Specs or Jira Stories for translation. Existing work keeps its frozen templates and sources; later language/content changes require a new graph revision and approval.

## Configure new work

Use the existing [extension interface](../workflow/extensions.md); add no language property to `config.collaboration`.

- Project default: prepare a complete `team.story` Stage replacement in `.aidlc/overrides/pack.json`. The [complete Chinese override example](../examples/team-packs/role-team/overrides/story-zh-CN.json) can be used as-is only for an unchanged bundled role-team Stage with no project override. Otherwise derive it from the effective Stage, change only the Story template binding, and reconcile its existing ID. Preserve customizations and other overrides; never add a duplicate entry.
- One work: use a complete `node.outputs` list in the new resolved graph. Bind `story.md` to `core:templates/collaboration/story.zh-CN.md` (Chinese) or `core:templates/collaboration/story.md` (English). Keep `acceptance.json` bound to `core:templates/spec/acceptance.json`; both retain contract `spec`.

Validate the resolved workflow and show the selection. The parent freezes selection and bytes; the child loads only the selected Story template and canonical acceptance schema, not both languages or this guide. Do not migrate existing work.

## Publish to Jira

Follow the [Jira adapter](../adapters/collaboration/jira.md) for actual connector/renderer support, payload review, authorized writes and readback. Markdown authoring does not guarantee rich rendering. Verify text, AC/source mappings and links after writing; visual rendering stays unverified without Jira UI inspection. Draft labels change only with actual PO approval and never transition Jira status.
