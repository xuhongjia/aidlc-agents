# Quality Design & Fitness

AIDLC_DRAFT — derive tests/Oracles from approved acceptance, not implementation outputs.

## Baseline and risk

Approved Spec/Architecture, test baseline and failure risks.

## Test model

| Test ID | AC/NFR | Scenario/level | Inputs/preconditions | Exact expectation/invariant | Detectable errors |
|---|---|---|---|---|---|

## Complete acceptance coverage

coverage.json criteria must equal approved acceptance.json AC IDs: `id`, `checks` (Quality check IDs), `manual_protocol` (steps/expectations/evidence or null). Every automated AC needs a real blocking check; every manual AC an executable protocol. Architecture/advisory checks cannot substitute.

## Quality Fitness review preview

| Check ID | AC/NFR | Full command/scan scope | Success criteria/expected count | Timeout | Effects | Blocking/Advisory |
|---|---|---|---|---|---|---|

Populate quality-fitness.json id/checks with `id,type,mode,description`. Commands need full argv, prerequisites and success criteria; patterns need paths/pattern/expectations. Empty rules/tests, all-skipped checks or missing outputs cannot pass; exit 0 alone is insufficient.

## Attachments and review

Planned test paths/assertions, data sources and installation/run prerequisites. No project-test changes before implementation approval. Human checks name actual executor, environment, candidate and evidence; never prefill success.

Humans approve Oracles, coverage, commands, thresholds and residual risk. Commands cannot hide installation, push, deployment or external writes.
