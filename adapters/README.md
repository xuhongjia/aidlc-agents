# AI tool bridges

Install only the selected bridge. It routes to .aidlc/system/ without embedding all Prompts. Since v0.3, stages/rework require fresh isolated children; bridge files cannot supply that host capability.

| Tool | Template | Project target |
|---|---|---|
| Codex | [codex.md](codex.md) | AGENTS.md managed block; check AGENTS.override.md first |
| Claude Code | [claude-code.md](claude-code.md) | CLAUDE.md managed block |
| Cursor | [cursor.mdc](cursor.mdc) | .cursor/rules/aidlc.mdc, preserving frontmatter |
| Copilot | [github-copilot.md](github-copilot.md) | .github/copilot-instructions.md managed block |

## Merge rules

Read target and applicable ancestor/subdirectory instructions; modify only this project. Preserve unrelated rules/imports/configuration.

- Missing Markdown entry: create it. Existing entry without a block: append once between `<!-- AIDLC-AGENTS:START -->` and `<!-- AIDLC-AGENTS:END -->`.
- Identical complete block: no write. Changed block: show diff and obtain confirmation; preserve outside text. Incomplete/multiple/nested markers require user conflict resolution.
- Existing Cursor file: skip if identical; otherwise ask whether to retain/update, never overwrite automatically. Preserve other rules/.cursorrules.
- Codex overrides, including nested ones, may shadow AGENTS.md: report effective file and confirm merge location before editing override or claiming integration.
- Preserve .claude/CLAUDE.md, .claude/rules/, Copilot path instructions and other tool settings; expose conflicts.

Authorized routine [preflight](../workflow/preflight.md) updates may replace exact locally unchanged managed files/blocks after three-way comparison, preserving outside content. Conflicts remain user decisions. Follow [update](../bootstrap/update.md); never overwrite work records directly.

## Verify integration

Read installed router/protocol/[orchestration](../workflow/orchestration.md), then execute [setup](../bootstrap/setup.md)'s read-only fresh-child probe. Record real calls/IDs, isolation semantics/inputs and collected results; no parent history, requirements, approvals or product changes.

Report files, explicit reading, automatic discovery and child capability separately. Missing creation/isolation/collection blocks stages even if files load. Probe success does not prove real delivery, approvals or CI Gates; rehearsals require a separate request.

If automatic loading fails, reload/start a session and explicitly read .aidlc/system/skills/orchestration/aidlc/SKILL.md plus the routed protocols. This supplies loading, not child capability; use a supported client if delegation is unavailable. Never invent a spawn API, execute stages inline or change global settings. See [tool support](../docs/tool-support.md).
