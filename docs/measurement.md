# AIDLC evidence and measurement

New 0.17 work records evidence through the existing parent and can produce an explicitly requested local report. There is no reporting Agent, extra lifecycle stage or automatic publication. [Measurement protocol](../workflow/measurement.md) defines source authority, capture/recovery, retention and interpretation. Standard work still ends at Implementation Verified Handoff; measurement does not establish production delivery or AI causality.

## What is frozen and retained

`lock.measurement = {"contract_version":1,"protocol_ref":"core:workflow/measurement.md"}` resolves through the same frozen asset table as the original method. The event/record templates, helper and reporting Skill are frozen assets, not ordinary child reads. Older locks keep their original contracts and are not backfilled.

| Business-project path | Purpose |
| --- | --- |
| `.aidlc/work/WORK/evidence/events.jsonl` | Parent-only append-only source observations and corrections |
| `.aidlc/work/WORK/measurement.json` | Current measurement record, including ledger head and explicit coverage |
| `.aidlc/work/WORK/evidence/measurement/rN.json` | Immutable measurement revisions; retain previous versions |
| Existing run evidence/source indexes, reviews and approvals | Original facts and authority, referenced rather than duplicated |
| `.aidlc/work/WORK/evidence/measurement/reports/REPORT/` | Requested report inputs, complete helper result, exit status and human-readable report |

`state.measurement` is initially null; once recorded it contains `status`, `ledger_ref` and `measurement_ref`. References are project-relative `{path,sha256}` pairs hashing complete raw bytes. State is navigation, not independent evidence or approval. This method repository contains only synthetic examples/templates; live business records stay in their business project.

## Event contract

Use [evidence-event.json](../templates/work/evidence-event.json). Each JSONL line has `schema_version`, stable `event_id`, `work_id`, consecutive `sequence`, `occurred_at`, `recorded_at`, `actor`, `type`, applicable `step_id`/`run_id`/`attempt`, `candidate_ref`, `source_refs`, `corrects_event_id`, `prev_hash` and `event_hash`.

`occurred_at` is the original source time; `recorded_at` is when the parent observed it. Null means unknown, not now. `actor` identifies the sourced actor, not whoever authored a summary. Available event types are `intake`, `dispatch`, `result`, `candidate`, `review`, `approval`, `human_effort`, `overhead`, `usage`, `cost`, `waiting`, `quality`, `closed`, `cancelled` and `correction`. Failures and retries are `result`/`dispatch` observations linked to original outcome receipts and attempts; the source supplies the result, rather than a new ledger status overriding it.

Sequence starts at 1 with null `prev_hash`. `event_hash` is SHA-256 of recursively key-sorted JSON without the `event_hash` field; array order is preserved. Use the packaged `canonicalEventHash` implementation when preparing records, not a new hash convention. The next event's `prev_hash` is the preceding hash. `measurement.expected_head` binds the last sequence/hash, so reading a shorter prefix cannot silently claim complete coverage. This detects inconsistencies; it is not tamper protection or authentication.

Derive stable IDs from source identity, work, type and attempt. Before appending, check whether that source event already exists; duplicate IDs are rejected, not counted twice. Identical resumed reads require no append; a changed observation needs a sourced `correction` referencing the earlier ID. Keep the original record and immutable source bytes. Corrected cycle endpoints are unavailable until a replacement source/event is explicitly bound in a later measurement revision.

## Measurement inputs

Use [measurement.json](../templates/work/measurement.json). Empty templates are unmeasured, not zero-valued demonstrations.

- Identity and provenance: `measurement_id`, `work_id`, `business_root_id`, `observed_at`, frozen `policy_ref` and `expected_head`. The caller verifies the policy belongs to the work's original lock. Retention/sensitivity/redaction metadata belongs with existing source-index/raw evidence references.
- `baseline`: `kind` is `none`, `historical`, `paired` or `estimated`; retain hours, scope IDs, provenance and original sources. Comparability rows name the required dimensions and confirm each with source refs. Frozen scope, complexity, quality, risk, team and observation window must be compatible before claiming a difference.
- `actual`: complete all-role scope and coverage, whether review/rework is included, source refs, effort entries and an explicit `zero_attested` only for sourced zero. Missing effort is null/unavailable, never zero.
- `overhead`: separately captured incremental effort only. `excluded_from_actual_confirmed` prevents counting overhead twice. If overhead is already in actual effort, retain sourced zero separate overhead rather than recopying its hours.
- `cycle`: intake and final Verify event IDs plus exact workflow/review/approval/candidate refs. `waiting` contains `{id,start_event_id,end_event_id}` pairs, explicit coverage and `waiting_source_refs`; an empty complete wait list also needs sourced `waiting_zero_attested: true`. Intake to final Verify is separate from production lead time.
- `cost`: actual source entries, currency, full-input coverage and accepted work units. One record represents one business root; an accepted unit is at most one and requires the valid final Verify endpoint. Failed/cancelled investment remains in cost entries even when output count is zero/unavailable.
- `quality`: status, observation window, maturity, artifact IDs and sources. `verified` requires a retained JSON source with matching `work_id`, `status: "verified"`, `artifact_ids`, `window_start`, `window_end` and `candidate_ref`, linked by an active quality event for the final Verify candidate. Additional source fields may retain original provenance. This checks joins, not truth or authenticated authority. Matured status without evidence does not establish quality; before the window matures, report limited follow-up rather than no defects.

An effort entry is `{id,person_id,role,category,hours,provenance,span,source_refs}`. Actual categories are `delivery`, `review`, `rework`; overhead categories are `coordination`, `setup`, `training`, `other`. `provenance` separates `native` from `self_reported`. `span` is null or `{start,end}` in UTC and cannot end after the observation cutoff. The helper rejects reused effort IDs/sources and overlapping intervals for the same person. Shared allocation requires separate sourced exclusive entries; a shared invoice/time record needs precise retained line/span evidence, not the same whole-file reference counted repeatedly. Coverage returns `aggregate_basis` (`native`, `self_reported`, `mixed`, `unavailable`), `observed_subtotals_by_provenance` and `unknown_entry_count`; unknown values keep the affected subtotal null. A mixed total is not a native-only observation.

A cost entry is `{id,amount,currency,kind,basis,outcome,source_refs}`. Use actual bills/allocations, retain failed and cancelled outcomes and do not substitute list prices. The initial helper evaluates one currency per work record. Mixed currencies remain unavailable for combined actual cost; keep original amounts and explain any separately sourced conversion outside that total. Source refs in the measurement must be present in the ledger and match complete file bytes. A human confirmation is a sourced self-report, not a native time measurement.

## Run a requested report

Use the frozen [JSON helper entry](helper-usage.md). The parent retains a parameter file:

```json
{
  "request": {
    "work_id": "WORK",
    "ledger_ref": {"path": ".aidlc/work/WORK/evidence/events.jsonl", "sha256": "<complete-file SHA-256>"},
    "measurement_ref": {"path": ".aidlc/work/WORK/measurement.json", "sha256": "<complete-file SHA-256>"}
  }
}
```

The helper request uses `operation: "metrics"` and the parameter-file `args_ref`. The entry calls `measureWork(root, args.request)`; run the original locked version, not a newer active copy.

```text
node <frozen>/helpers/check.mjs PROJECT_ROOT REQUEST_RELATIVE_PATH --full
```

The host saves complete output and exit status, then may use the existing `summary` operation against that saved result. The helper does not save reports or repair records. `measured`, `partial`, `unavailable` and `blocked` describe measurement availability/structure; none grants approval or Gate PASS. Inspect full issues and coverage before writing conclusions. Without Node, keep source evidence and report helper execution as unavailable; install nothing and claim no calculation.

The [synthetic unavailable example](../examples/measurement/unavailable/metrics-request.json) contains one intake source and no baseline, effort or approval. Use the canonical absolute path of `examples/measurement/unavailable` as `PROJECT_ROOT` and `metrics-request.json` as the request. Expected result: `unavailable`, one event, all metric values null and all authority flags false. This demonstrates missing data, not an AI-efficiency result.

The current helper validates one work/root record. A multi-work report must first deduplicate root IDs and partition compatible cohorts, preserve each per-work result and show eligible, missing and excluded records. Do not pool incompatible baseline kinds, average percentages across roots or invent a portfolio percentage. Retain failed/cancelled investment alongside the per-work rows. The helper does not implement portfolio aggregation or causal estimation.

## Read results without inflating claims

Human effort difference is baseline minus actual all-role effort minus separately recorded incremental overhead for equivalent accepted output. The helper labels historical/paired comparisons `comparison_estimate`; an estimated baseline produces `scenario_estimate`. Neither is causal proof. Keep native/self-reported coverage visible. Without a comparable positive baseline, complete effort/overhead and valid accepted outcome, the savings percentage is unavailable. Failed/cancelled work retains its investment without counting undelivered output as savings. A negative difference is increased effort. Tokens, task/SP growth, elapsed Agent time and generated artifacts do not convert into saved human hours.

Cycle calculations require the actual final Verify approval linked to the same workflow, review and candidate. Later cancellation or changed-candidate delivery evidence invalidates the current accepted endpoint, savings and accepted-unit cost; any retained earlier cycle is historical only. Routine closure after valid completion does not erase that completion. Wait durations use interval union, so overlapping waits are counted once. The helper reports total union only; reason-level partitions need separately sourced boundaries and a declared overlap rule. `active_cycle_hours` is residual elapsed time, not active human time. The quality section reports evidence availability, not an invented defect rate or Gate verdict; any additional rate must disclose its numerator, eligible denominator, observation window and source limitations.

A useful report states the selected roots/cohorts and cutoff, source/role coverage, observed outcomes, comparable effort difference, cycle/waits, quality/rework, actual usage/cost and exclusions. Include formulas, policy/input digests and unknowns in the evidence appendix. Keep observed results, self-reports and scenarios separate; disclose alternative explanations before attributing change to AI. Local reporting grants no external publication, new company-data access, business acceptance or production authorization.
