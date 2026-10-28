# AI tool support and validation boundaries

The host executes this protocol; no extra runner, Python setup, or model key is required. **Since v0.3, every stage/rework requires a fresh independent child; the parent only orchestrates, collects results, and obtains approvals.** Role-play is not delegation. Existing IDE, permissions, and CI/CD remain authoritative.

## Support matrix

“Documentation-aligned” means vendor support is documented, not end-to-end tested here. Actual client version, policies, permissions, and exposed interfaces determine support; every client must pass the [Setup probe](../bootstrap/setup.md).

| Tool | Default entry point | Documentation basis for independent children | Execution condition |
|---|---|---|---|
| Codex | `AGENTS.md` | Official documentation describes creating, waiting for, and collecting child Agents | The host must prove it can create children without parent conversation history; multi-agent support alone does not prove isolation |
| Claude Code | `CLAUDE.md` | Ordinary children start with independent context; fork inherits parent history | Create fresh non-fork children; never resume a previous stage |
| Cursor | `.cursor/rules/aidlc.mdc` | Official documentation describes clean-context children returning to a parent | The current client must expose callable delegation and result-return capabilities |
| GitHub Copilot | `.github/copilot-instructions.md` | Repository instructions/custom Agents do not establish independent children on every product surface | Run only after the current client passes actual fresh-creation, isolation, and return checks; otherwise block |
| Other AI tools | Explicitly read router + protocol + orchestration | No assumed universal API | Pass the same probe; file reading or advice generation alone cannot execute stages |

Write only the current bridge. Optional Codex `.agents/skills` / Claude `.claude/skills` entries do not create children. Never gain capability through automatic runner installs, global changes, or elevation; revalidate in a supported client.

## Tool notes and official sources

**Codex.** Check `AGENTS.override.md` precedence and nested instructions. Context inheritance depends on the actual tool schema: `fork_turns: "none"` is an example only where exposed, not a universal API/config field. Sources: [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [Skills](https://learn.chatgpt.com/docs/build-skills), [Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents).

**Claude Code.** Use fresh ordinary children, never forked parent history or resumed stage children. Preserve `CLAUDE.md`, imports, and `.claude/rules`; the bridge needs no custom child definitions or extra team features. Sources: [project memory](https://code.claude.com/docs/en/memory), [Skills](https://code.claude.com/docs/en/skills), [Subagents](https://code.claude.com/docs/en/sub-agents).

**Cursor.** `.mdc` uses YAML frontmatter; `alwaysApply: true` routes AIDLC requests only. Probe actual independent-context delegation/return; rule files do not prove capability or permit parent fallback. Sources: [Rules](https://cursor.com/docs/rules), [Subagents](https://cursor.com/docs/subagents).

**GitHub Copilot.** Product surfaces differ; instructions/profiles/file editing prove no delegation. Block without a verifiable child/return interface. Preserve path instructions; never automatically trigger cloud tasks or upload to extra services. Sources: [repository instructions](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions), [custom Agents](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents).

## Establish stage-execution readiness

1. **Files:** readable router/protocol/orchestration, unique bridge markers, preserved existing rules.
2. **Loading:** actually read all three. Report explicit reading separately from automatic discovery; session reload cannot create missing delegation capability.
3. **Setup/update capability:** create a real read-only probe child; record invocation/ID, isolation mode, and structured result. It reads specified package files only, with no business stage. Parent verifies return/creation/isolation evidence. Missing evidence blocks; simulation, ordinary chats, and role-play cannot substitute.
4. **Behavior:** separately authorized rehearsal tests independent stages/rework, returns, approval stops, and joins. A probe proves no full lifecycle.
5. **Project:** fit standards, commands, AC, and Fitness to the project. Child availability proves no correct requirements, Gate PASS, or acceptance.

Revalidate host/client/capability changes; probes are not transferable. Serial-only hosts still create fresh children. Concurrency requires [orchestration](../workflow/orchestration.md) dependency, authorization, ownership, and join conditions; never bypass approvals.

## What the protocol can and cannot enforce

Independent context provides no filesystem isolation, separate identity, or enforced permission boundary. Limit shared-workspace inputs/writers; never copy full chat. Parent retains dispatches, summaries, evidence links, and decisions; analysis stays in child/artifacts. Agent agreement is not human approval; chat approval is not CI execution.

Enforce real project tests/static checks through required CI, branch protection, and human review. Architecture/QE propose and explain Fitness; only execution produces results. Explicitly report unexecuted/incomplete/invalid evidence.

Installation grants no sandbox bypass, credential reads, extra uploads, or deployment. The host may send context to its model service; team data policy still applies.
