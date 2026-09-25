# Review compatibility without changing the product

Follow `core:prompts/common.md`. Read only the approved `change` input and bound project evidence. Examine the affected route, schema, status codes, defaults and local consumers. Compare the proposed behavior against actual call sites or contract tests and identify the evidence for compatibility.

This stage is independent of the tests-review stage. Do not read its unfinished output, share writable files with it, change product code or tests, or run commands with unapproved side effects. Write only the assigned `analysis` artifact, `consumer-compatibility.md`.

List findings, uncertainties and any required correction to scope. A breaking contract, security-sensitive impact, unclear consumer behavior or expanded change returns blocked for a revised scope and renewed approval. Do not amend the approved change or authorize implementation. Static review is not an executed test, a gate pass or approval.
