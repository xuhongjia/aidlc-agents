# Models, budgets and efficient verification

0.16 keeps the same stages, approval duties and compact-flow documents. Models stay in your AI host; helpers run locally with built-in Node modules when Node already exists. No new service, Agent CLI, credentials or dependency installation. Existing work retains its frozen policy and method.

## Configure once

> Configure AIDLC execution for this project. Discover the host's actual per-Agent model-selection support, map light/medium/heavy to models I can use, show the role defaults and budget changes, and save a project override. Preserve existing settings and permissions. If selection is unsupported, retain host inheritance and say so. Do not call models or start delivery.

The existing setup entry handles this configuration. Copy workflow/execution-policy.json to `.aidlc/overrides/execution-policy.json`; select `execution.policy_ref=project:execution-policy.json` through the existing project pack/source resolver (preserve an existing pack; use its empty definition template when creating one). New work freezes the actual JSON. Configure real primary/fallback model identifiers, supported reasoning and team-qualified tier capabilities; never use invented example model names. Enable selection only when configured. Default enabled=false changes no host model; budget limits default null.

| Role | Default tier |
|---|---|
| Fixed-content helper | light; use deterministic tools directly where possible |
| Coordinator, BA/PO, PM, Engineer, Software Engineer, QE/QA | medium |
| Architecture/Quality Gate Reviewer and collector | at least medium |
| Architect: design and tradeoffs | heavy |

Task requirements are separate: light for mechanical low-risk work; medium for bounded changes with clear AC; heavy for complex reasoning/cross-system constraints. Final tier takes the maximum of role/task/risk. Authorization/security, migrations, concurrency and cross-system changes default heavy. A one-line security fix can be heavy; a standard workflow need not use heavy everywhere. Pure extraction is explicitly assigned to a helper, not a demoted formal Reviewer. Team roles require explicit mappings.

> For this requirement, explain the role/task/risk tier and selected review cards, then follow the existing approval process. Record actual model and usage; pause at configured limits without lowering review quality.

Budget keys are max_calls, max_agents, max_retries, max_input_tokens, max_output_tokens and max_tool_output_bytes. Limits apply to the whole work including failed attempts, parent and Hooks. unknown_usage=pause is the default for enabled limits. Missing tokens are unavailable, not zero; host inheritance does not prove a tier was satisfied. Model selection and reasoning never expand authority. Fallback is same-tier and only for configured transient failures, within the existing retry allowance.

## What changes during Verify

With approved rules, unchanged candidate, all required QA/CI/CD evidence and a current host readiness check, the parent runs the read-only preflight, then dispatches Architecture Reviewer + Quality Reviewer -> one independent collector -> required approval. It can skip the initial collector, not a Gate. Resource constraints serialize Reviewers; there are still two distinct executions.

If preparation needs investigation, retain the original collector -> Reviewers -> fresh collector path. Missing approvals block and pending pipelines wait. Without the helper's existing Node capability, use original host checks/path. No gate or approval is inferred from helper status.

## Inspect a work

> Show this work's requested and actual models, tier reasons, selected cards, actual Agent count, cached/noncached input and output tokens, tool-output bytes, retries, remaining budgets and unavailable measurements. Include failures and pending reservations; do not start or retry anything.

Technical JSON receipts and complete evidence stay under the work; chat shows a short summary. No new compact-flow body documents. The parent keeps execution_receipts and execution_reservations in state. Counters are exclusive per attempt; cumulative native traces must be converted correctly and child usage must not be counted twice. source_ref identifies an exclusive native event/span, not an entire trace shared across runs; every Agent reservation includes at least one call.

For structural diagnostics, the host prepares a [helper request](../templates/work/helper-request.json) with operation=validate and a hashed parameter file containing `{request: <validation request>}`. Use the frozen entry and project root:

```text
node <frozen-helper-path>/check.mjs <project-root> <project-relative-helper-request.json>
```

Default output is bounded JSON; a blocked result exits nonzero. For decisions, save `--full` output first and summarize the saved result without rerunning the check. Read the [helper guide](helper-usage.md) for all operations, omitted details and historical-summary limits. The existing validate-work.mjs entry remains supported. Helpers never execute evidence commands, modify files, call models or grant permissions. See [execution contract](../workflow/execution.md) and [risk review](risk-review.md).

## Validate improvement

Compare the same fix/enhance task, initial repository and approved checks in fresh sessions. Record actual native Agent IDs and all calls, including retries and collection; distinguish static file bytes from tokens. Check that missing approval, wrong candidate, missing QA, zero/truncated evidence, unsupported models and exhausted budgets still stop progress. Local helper tests are not a live host/GitLab/browser delivery or a measured token saving. See [validation](validation.md).
