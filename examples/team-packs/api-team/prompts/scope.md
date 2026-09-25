# Scope a local API enhancement

Follow `core:prompts/common.md` and the core approval, gates, risk and knowledge protocols. Resolve input artifacts by their declared semantic contracts. This team stage owns only its declared work-record output; do not edit product code, tests or configuration.

Use the bound request and current project evidence to define a small, local enhancement. Record the stable acceptance criteria and observable Oracle, affected paths, exact commands and side effects, implementation steps and rollback. Map every requested FR/NFR to an AC or an explicitly approved exclusion. Include both Architecture and Quality Gate definitions with real blocking checks, versions, commands, thresholds and evidence locations. If missing, request the core Architect/QE gate-design leaves and incorporate their reviewed plans before claiming readiness. A review branch cannot replace either gate.

Set the typed routing fact `needs_review` to true when a compatible change touches multiple local consumers or the existing test coverage needs independent examination. Set it to false only when repository evidence supports a single, well-understood local impact and sufficient existing checks. Record the evidence and return the boolean fact with the stage result; the coordinator evaluates it only after this exact scope result has valid approval. Unknown facts are blocking, not false.

This fact chooses review depth only. A breaking contract, authentication/authorization change, sensitive data, external writes, migration, production access, deployment, an unclear Oracle or another core escalation trigger stops this low-risk workflow. Do not encode such risk as `needs_review=false`, silently downgrade it or treat true as permission to proceed. Request the appropriate manual decision or workflow upgrade.

Deliver `change` using the declared `api-change-brief.md` template. A proposed scope or routing fact is not approval. Auto eligibility requires the current project's explicit low-risk delegation and all core checks; this example grants none.
