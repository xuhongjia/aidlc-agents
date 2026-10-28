# Architecture & Fitness

AIDLC_DRAFT — approved Spec/current evidence informs design; humans approve rules.

## Inputs and constraints

Approved Spec, standards, ADRs and NFRs; distinguish constraints from pending choices.

## Design and alternatives

Component responsibilities, dependencies, interfaces/data flow, state ownership, deployment assumptions and alternatives/tradeoffs. Add ADRs only for durable decisions.

## Impact

Security, privacy, compatibility, migration, observability, resilience and rollback; justify inapplicability.

## Architecture Fitness review preview

| Check ID | Constraint/NFR source | Actual command/scan scope | Success criteria | Blocking/Advisory | Effects/limits |
|---|---|---|---|---|---|

Populate architecture-fitness.json id/checks: each has id/type/mode (blocking/advisory)/description. Commands need full argv, cwd/prerequisites, timeout and success criteria; scans need paths/pattern/expected result. Disclose installation/external writes/candidate effects, never hide them.

Empty rules are unconfigured. Missing dependencies, zero matches or unexecuted/indeterminate checks cannot PASS; prose is not executable Fitness evidence.

## Human decisions and risk

Designs, rules, thresholds and residual risks awaiting approval. Design approval is not code conformity; Gates later verify the actual candidate.
