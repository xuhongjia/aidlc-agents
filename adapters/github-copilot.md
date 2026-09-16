<!-- AIDLC-AGENTS:START -->
## AIDLC Agents

For AIDLC requirements, implementation, review, or continuation requests, explicitly read or request the contents of these repository-root files:

1. `.aidlc/system/skills/aidlc/SKILL.md`
2. `.aidlc/system/workflow/protocol.md`
3. `.aidlc/system/workflow/orchestration.md`

Do not assume a linked file is already in context. The parent conversation is orchestration-only: read the work record, validate dependencies, dispatch, collect results, and handle approval using the project's approval policy. For EVERY stage execution or rework, start a NEW child agent with fresh context using the current client's actual supported tools. Pass only the dispatch contract and required approved artifact references, not the parent conversation history. Do not execute stages inline or reuse a previous stage's child. A custom agent profile, skill invocation, or manually selected chat is not proof of parent-child delegation.

Require the setup capability probe to demonstrate child creation, fresh context, and result collection on this exact Copilot surface. If any capability is unavailable or unverified, block stage execution and request a supported client; never fall back to inline execution. Follow orchestration.md for safe parallelism and result validation. By default the parent presents the exact revision for human approval. For explicitly delegated low-risk auto approval, read `.aidlc/system/workflow/approval.md`, validate the work-scoped policy, and record the decision as automatic, never as a user's sign-off. Children never approve or advance stages.

If you are already the child named in a valid dispatch, execute only that bounded assignment and return its result; do not re-route yourself as the parent or recursively delegate the whole stage.

Keep existing repository instructions and permissions. Missing file access, required checks, canonical files, or conflicting instructions must be resolved before proceeding. Do not describe suggested edits as applied, or unexecuted children/checks as successful. This bridge does not install a separate runtime or change global settings.
<!-- AIDLC-AGENTS:END -->
