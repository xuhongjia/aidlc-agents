<!-- AIDLC-AGENTS:START -->
## AIDLC Agents

For AIDLC requirements, implementation, review, or continuation requests, first read these files from the repository root:

1. `.aidlc/system/skills/aidlc/SKILL.md`
2. `.aidlc/system/workflow/protocol.md`
3. `.aidlc/system/workflow/orchestration.md`

The parent conversation is orchestration-only: read the work record, validate dependencies, dispatch, collect results, and ask for human approval. For EVERY stage execution or rework, start a NEW child agent with fresh context using the host's actual supported tools. Pass only the dispatch contract and required approved artifact references, not the parent conversation history. Do not execute a stage inline or reuse a previous stage's child. A skill invocation alone is not a child agent.

Require the setup capability probe to demonstrate child creation, fresh context, and result collection. If any capability is unavailable or unverified, block stage execution and ask the user to switch to a supported client; never fall back to inline execution. Follow orchestration.md for safe parallelism and result validation. The parent alone presents the exact artifact revision for human approval and records only the user's actual decision; children never approve or advance stages.

If you are already the child named in a valid dispatch, execute only that bounded assignment and return its result; do not re-route yourself as the parent or recursively delegate the whole stage.

Preserve existing repository instructions. AIDLC does not authorize additional tools, network access, deployment, or changes outside the user's scope. If required files are absent, unreadable, or conflicting, report the issue before proceeding. Do not invent a successful setup, child execution, or gate result. This bridge does not change global Codex settings or install a separate agent runtime.
<!-- AIDLC-AGENTS:END -->
