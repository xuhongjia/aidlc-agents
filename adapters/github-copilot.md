<!-- AIDLC-AGENTS:START -->
## AIDLC Agents

For AIDLC requests, first read only `.aidlc/system/skills/aidlc/SKILL.md`. Route the intent before loading `.aidlc/system/workflow/protocol.md` or orchestration.md; valid children use their frozen instruction_refs instead of re-routing.

Before parent delivery execution, follow `.aidlc/system/workflow/preflight.md`: check GitHub, update before creating new work, and keep existing work pinned. After an update, reload the installed router and contracts before dispatch. Status-only, approval-only, and closure controls do not require this check. Dispatched children never check for updates or install method files.

Do not assume a linked file is already in context. The parent conversation is orchestration-only: read the work record, validate dependencies, dispatch, collect results, and handle approval using the project's approval policy. For EVERY stage execution or rework, start a NEW child agent with fresh context using the current client's actual supported tools. Pass only the dispatch contract and required approved artifact references, not the parent conversation history. Do not execute stages inline or reuse a previous stage's child. A custom agent profile, skill invocation, or manually selected chat is not proof of parent-child delegation.

Require the setup capability probe to demonstrate child creation, fresh context, and result collection on this exact Copilot surface. If any capability is unavailable or unverified, block stage execution and request a supported client; never fall back to inline execution. Follow orchestration.md for safe parallelism and result validation. By default the parent presents the exact revision for human approval. For a work-scoped checkpoint_low_risk or auto_low_risk delegation, use `.aidlc/system/workflow/approval.md`; delegated decisions are never user sign-offs. Checkpoint keeps the entry and final Verify human-approved. Internal Implement correction needs its own explicit budget; approval mode alone never enables it. Children never approve or advance stages.

If you are already the child named in a valid dispatch, execute only that bounded assignment and return its result; do not re-route yourself as the parent or recursively delegate the whole stage.

Keep existing repository instructions and permissions. Missing file access, required checks, canonical files, or conflicting instructions must be resolved before proceeding. Do not describe suggested edits as applied, or unexecuted children/checks as successful. This bridge does not install a separate runtime or change global settings.
<!-- AIDLC-AGENTS:END -->
