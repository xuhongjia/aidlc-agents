<!-- AIDLC-AGENTS:START -->
## AIDLC Agents

For an AIDLC request, first read only `.aidlc/system/skills/aidlc/SKILL.md`; let the router choose the control or delivery instructions. Status and approval controls do not preload delivery protocols. A valid dispatched child reads its frozen instruction_refs instead of re-routing as the parent.

Before parent delivery execution follow `.aidlc/system/workflow/preflight.md`: check GitHub, update before new work, keep existing work pinned. Reload the installed router after updates; children never check or install methods.

The parent is orchestration-only. EVERY stage/run uses a NEW fresh-context child with dispatch and necessary fixed references, never parent history, an inline stage or a reused worker. Verify spawn/isolation/collection through the actual host probe; unavailable or unknown means blocked. Parent delivery and review rules are in `.aidlc/system/workflow/protocol.md` and orchestration.md, loaded only on that route.

Approval is manual unless the work has an exact valid delegation; checkpoint keeps entry/final Verify human-approved. Feedback needs a separate explicit budget. Children never approve or advance. Preserve repository rules and user work; no extra tool, network, deployment or host configuration authority. Missing/conflicting files or evidence block execution, never fabricate setup or PASS.
<!-- AIDLC-AGENTS:END -->
