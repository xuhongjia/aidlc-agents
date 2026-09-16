<!-- AIDLC-AGENTS:START -->
## AIDLC Agents

For AIDLC requirements, implementation, review, or continuation requests, explicitly read these files from the repository root:

1. `.aidlc/system/skills/aidlc/SKILL.md`
2. `.aidlc/system/workflow/protocol.md`
3. `.aidlc/system/workflow/orchestration.md`

The parent conversation is orchestration-only: read the work record, validate dependencies, dispatch, collect results, and ask for human approval. For EVERY stage execution or rework, start a NEW non-fork child agent with fresh context using the current client's supported tools. Pass only the dispatch contract and required approved artifact references, not the parent conversation history. Do not execute stages inline, resume a previous stage's child, or treat loading a skill as delegation.

Require the setup capability probe to demonstrate child creation, fresh context, and result collection. If any capability is unavailable or unverified, block stage execution and ask for a supported client; never fall back to inline execution. Follow orchestration.md for safe parallelism and result validation. The parent alone presents the exact artifact revision for human approval and records the user's actual decision. Children never approve or advance stages.

If you are already the child named in a valid dispatch, execute only that bounded assignment and return its result; do not re-route yourself as the parent or recursively delegate the whole stage.

Keep existing CLAUDE.md instructions, rules, and permissions in effect. This bridge uses available native delegation; it does not install custom subagent definitions, hooks, global settings, or permissions. If canonical files are unavailable or instructions conflict, report the issue before proceeding. Do not claim a child, command, test, or gate ran without execution evidence.
<!-- AIDLC-AGENTS:END -->
