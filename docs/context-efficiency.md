# Efficient context use

- Use a new session for new work; resume existing work with its ID/path and pinned handoff. Restore method, graph, approvals/revocations, candidate and evidence from files, not chat summaries. AIDLC does not create sessions automatically.
- Parent loads protocols by intent. Children load frozen instruction_refs, current role/Stage/templates and required approved inputs. Freeze/verify complete assets but read only assigned content. Required team rules stay mandatory and are measured separately.
- PO/DEV/QA transfer fixed artifacts, not combined chat histories. Role and sync protocols load only on their routes. Read guides/examples only when configuring or explaining them; links alone are not instructions to preload everything.
- Persist full logs; return outcome, check counts, failure locations and evidence references. Read targeted raw sections as needed. Truncation or missing evidence never means PASS.
- New work may use the [execution policy](execution-policy.md): deterministic checks in tools, selected risk cards only on Gate leaves, and one final collector when Verify is fully prepared. Record actual exclusive attempt usage, including failures/parent/Hooks; structural savings are not measured tokens. Model selection is opt-in and never weakens review or approval.
- Common execution rules live in worker.md; composed-stage only bootstraps verified inputs. Gate leaves read shared invariants plus Reviewer duties; Verify reads shared invariants plus collector duties. Two distinct Reviewers and required approvals remain.
- Use the fixed [JSON helper entry](helper-usage.md), not helper source or newly written check scripts. Save full results once, then return the bounded summary. This changes display volume; complete evidence, omitted blockers and fresh preflight checks remain required.

See the [context contract](../workflow/context.md) and [measured validation](validation.md). Existing work keeps its original definitions; no approval or frozen asset migration.

## Static measurement

Maintainers run `node --test tests/context-budget.test.mjs tests/compact-optimization.test.mjs`. Pinned v0.13 and pre-compaction v0.16 fixtures retain hashes, mandatory refs and bytes. measureCompactWorkflow(profile) in tests/support/context-budget.mjs counts first stage, Implement, Verify collector and two independent Reviewers. Deduplicate within a run, never across Agents. Extra initial/resumed collectors add a full Verify load; these five declared loads are not an end-to-end Agent count.

Report method bytes and template bytes separately. Declared refs do not recursively include every Markdown link; audit required transitive/conditional resources too. Team rules, business inputs, locks/evidence, host catalogs and actual runs need separate accounting. Preserve mandatory inputs and historical baselines; source bytes are not tokens or cost. Agile [reference mappings](agile-skills.md) are reader guidance, not default child context.

## Optional Codex project setting

Setup/update does not alter host configuration. In a trusted project, ask AI:

> Enable aidlc's compact setting in this project's .codex/config.toml: back up the file, show the existing value/impact, and set only top-level tool_output_token_limit=3000. Preserve model, reasoning, plugins, Skills, native compaction and every other setting; no global changes.

Invalid TOML/duplicate keys require resolution; never append inside another table. A missing file contains only:

```toml
tool_output_token_limit = 3000
```

This budgets tool output in history, not evidence retention. Reopen the project and verify effectiveness; managed/trust restrictions may ignore the file. [Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)

## Actual token comparison

Use paired fresh runs with identical model/reasoning, request and initial repository state, each pinned to its method. Obtain genuine approvals and execute the same Oracle/Gates; retain real agent IDs and usage. No method swap under old approvals or fabricated confirmation/publication.

Include parent, stages, leaves and Hooks. Report input, cached input, noncached input, output, tool-text bytes, images and Agent counts separately. Reasoning output is already part of output. Deduplicate cumulative usage notifications/deltas; absent measurements stay unavailable, never bytes/4 estimates.

Maintainer helpers summarizeUsage(events,{after,before}) and compareUsage in tests/support/usage-model.mjs parse explicitly paired raw Codex traces. Use actual run times with a preceding cumulative counter; otherwise usage is unavailable. Process actual child traces as well as the parent. These helpers make no model requests and add no installation dependency. Without paired runs, report token/cost comparison NOT_RUN.
