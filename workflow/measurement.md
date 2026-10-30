# Evidence and measurement: parent only

The existing parent records source-backed work evidence at existing lifecycle transitions. Measurement adds no stage, Agent, background loop, service, database, dependency or approval. Original [approval](approval.md), independent dual Gates and required delivery evidence remain authoritative. Children return their existing artifacts/receipts; they do not write the measurement ledger or read this protocol by default.

## Freeze and ownership

For new work, resolve and freeze the measurement policy, event/record templates, reporting Skill and helper with the original method assets. The parent creates `work/measurement.json` relative to the selected work directory and binds its policy version, business root, scope, cohort, baseline and collection coverage. The actual location is `.aidlc/work/WORK/measurement.json`; `work/` below means that same selected directory, never a shared global ledger.

Preserve each immutable record revision under `work/evidence/measurement/rN.json` before advancing the current `measurement.json` projection. Retain its raw-byte reference in parent state and the report input manifest; do not introduce a circular hash between that record and its bound ledger head. A change retains its predecessor, reason, source and effective time in a separate parent revision receipt; it cannot silently change a baseline, cohort, denominator or earlier report. Freeze baseline and comparison design before outcome observation where possible. Later definitions are retrospective and explicitly labeled. A new policy version does not migrate old work or rewrite approvals. Old work receives no invented intake times, effort, baseline or events; source-backed retrospective reports remain retrospective.

The host parent is the sole writer of `work/evidence/events.jsonl`, record revisions and local reports. Helpers only read and calculate; they never authenticate, write, dispatch, change authority or grant PASS. Optional human effort capture may accompany an existing review/approval card; unanswered effort fields stay missing and create no new approval gate. Reports are generated only on request and are not automatically published.

## Capture at existing edges

Capture the observation once its source is available. Reuse existing dispatch, run history, execution receipts, raw checks, review/approval snapshots, feedback, waits, closure and source indexes rather than creating a parallel delivery truth.

| Existing edge | Evidence to retain |
| --- | --- |
| Work intake / scope freeze | Bound original request, root business unit, method/policy revision, intake time and comparison scope |
| Dispatch / actual attempt / collection | Run/attempt/worker linkage, actual host start/outcome, usage receipt, failures, interrupted or unknown outcomes |
| Check / Gate / review / approval | Original raw result, candidate digest, Gate identity, review digest and genuine decision source; a generated conclusion is not authority |
| Correction / retry / rework | Original failure and attempt, authorized lineage, changed candidate and subsequent result; never replace FAIL with PASS |
| Wait begin / end / resumption | Actual interval endpoints, reason, source and matching wait identity; a resumed chat is not proof of work or cessation |
| Human effort / baseline / cost | Original time record, human statement, comparison evidence or actual billing receipt with basis and availability |
| Cancellation / failure / closure | Actual decision, remaining unknown attempts, all spent effort/cost and final status; preserve unsuccessful work in reporting |
| Evidence correction / expiry | Superseded event or reference, reason and replacement/expiry evidence; preserve history |

Each observation binds work, business root and applicable step/run/attempt, source identity, observed time and original source time separately. Candidate/review/approval links are required when the claim depends on them; do not invent these links for events before a candidate exists. Unknown source time remains null. Observing an old receipt today does not make today its execution time. Every attempt, including failed starts, cancelled runs, retries and late results, remains visible.

## Append, deduplicate and recover

Use stable `event_id` as the idempotency key, derived from the source event identity, work, event kind and actual attempt. Re-reading the same source on retry/resume yields the same observation, not another unit of effort, usage or throughput. Repeated sources with conflicting payloads are conflicts to resolve, not last-write-wins updates. A real second attempt has a new attempt identity even if it reuses commands or candidate bytes.

The parent serializes writes and validates complete JSONL records before appending. On interruption, read the ledger and reconcile source IDs against existing control records before adding anything. Preserve and diagnose an incomplete trailing record; do not silently drop it and claim complete coverage. Corrections append a new sourced event referencing the superseded event; earlier bytes, raw snapshots and report manifests remain intact. Reports use the declared correction chain and retain correction counts. No duplicate success or cancellation may be created by resumption.

Recording failures or ledger gaps block affected measurement claims and remain visible on the next existing status/card. Reconstruct only from retained sources, recording the later observation time and retrospective provenance. A recording failure does not independently revoke a valid delivery approval or grant a missing one. Missing mandatory delivery evidence remains an existing Gate blocker; recording its absence is never a substitute.

## Evidence, retention and authority

Reuse [external evidence](external-evidence.md) source-index entries and raw snapshots. Every metric input must resolve to a source ID or a hashed project-relative evidence reference, with original provider/object identity and retrieval coverage where applicable. Validate complete bytes, source-to-work/run/candidate joins and known conflicts. Hashes prove byte identity, not truthful content, authenticated approval, native execution or AI causality. Parent-generated summaries and AI-generated metrics cannot attest to themselves.

Retain only necessary sanitized source fields and authorized snapshots in the business project, with sensitivity, retention policy, explicit expiry time or documented no-expiry basis, redaction/truncation and retrieval status. Never copy business evidence into this public method repository. Never retain credentials, secrets, private model reasoning or unnecessary personal data. Record access restrictions and human effort using suitable pseudonymous role/person IDs. If safe retention permits only a digest/reference, mark the raw source unavailable; do not treat a link or digest as readable evidence. Expired, inaccessible, redacted-away or truncated required facts make the corresponding metric unavailable. Authorized expiry removes sensitive bytes under the applicable retention rule while retaining a non-sensitive tombstone and correction history; append-only observations do not require perpetual personal-data retention.

## Comparable human effort and outcome

Define the business unit and comparable cohort before aggregating: scope/accepted output, work type and complexity, risk, required quality checks, team/roles, method/AI exposure and observation window. Raw `fix`, `enhance`, Story, task and subtask counts are not interchangeable units. Count each root business unit once; its descendant runs/tasks supply effort and failure evidence without adding output units. Unmapped roots, changed scope and incompatible cohorts are exclusions with reasons, never silently merged samples.

Let `B` be comparable baseline all-role human hours and `H` be current all-role human hours for the same accepted scope. `H = actual effort + incremental overhead not already included in actual effort`, matching the helper's separate buckets. Include intake, design, implementation, QA, independent review, approvals, AI preparation, coordination, rework and attributable tool/process maintenance. Include failed/cancelled attempts in the cost of the root business outcome. Each interval/allocation belongs to one effort ID; shared overhead is allocated once by a declared rule. If overhead is already in `H`, do not subtract it again.

Report `B - H` as an observed or scenario human-effort difference, according to its evidence basis. Only when complete comparable `B > 0` and `H` exist for equivalent accepted output may a matching-basis percentage be `(B - H) / B × 100`. Failed/cancelled or unaccepted work retains its investment but yields no savings claim for undelivered output. Negative values remain negative. Actual records, human self-reports, estimates and missing entries stay separate; estimates support labeled scenarios, not realized savings. No baseline means no savings percentage. Missing roles, unmeasured rework or unallocated overhead mean no complete net-effort claim. Agent elapsed time, tool duration, tokens, output bytes and story points never become human hours. Freed time is not realized cash savings or released capacity without separate evidence of its use.

## Time, quality, usage and cost

- Cycle time is original intake to the final valid Verify approval for the same root/scope, with candidate and approval links. Analysis-only work has no implementation-verified endpoint. Open/cancelled/failed work remains open/cancelled/failed; report observed age separately. If a previous candidate was verified before later cancellation or candidate change, its retained cycle is historical only and supports no current accepted unit or savings. Production lead time needs separate sourced production deployment evidence and endpoint definitions.
- Wait time uses real start/end intervals clipped to the declared window. Union overlapping intervals; partition overlaps by the frozen reason precedence so categorized waits sum to the union without double counting. Open waits contribute only to an explicitly bounded observation-as-of view. Unknown endpoints stay unavailable. Cycle minus known waits is residual elapsed time, never human effort or necessarily active execution.
- Quality/rework metrics bind accepted scope, candidate, Gate identity and observation window. State numerator, eligible denominator, exclusions and missing follow-up; count first-pass success only after the applicable checks and approval. Do not infer defect absence from no observations, collapse DEV self-tests into independent Gates, or interpret fewer checks as better quality. Preserve failed/cancelled investment and disclose survivor-only views.
- Reuse [execution](execution.md) exclusive-attempt receipts for observed models, tokens, calls and usage. Parent totals must not include the same child span twice. Keep model intent separate from actual host observations; missing meters are unavailable, not zero. Usage is not a productivity metric by itself.
- Cost uses actual billing records and explicit currency. Separate currency totals, credits, allocation and unavailable costs; convert only with an identified rate/date and declared method. Estimates or list prices stay scenarios, not actual spend. Missing human-cost rates or bills prevent an actual ROI claim. Do not sum a native usage cost and its billing receipt twice.

Comparisons describe measured association. AI contribution is not established by a before/after percentage alone: retain scope changes, team learning, staffing, tooling and process changes as alternative explanations. A causal claim requires an appropriate comparison design and supporting evidence beyond this helper.

## Requested report

Use [aidlc-metrics](../skills/sync-publication/aidlc-metrics/SKILL.md) for an explicit report request. Freeze report input references/digests, policy/record revisions, observation cutoff, selected population and exclusions. Validate the full ledger, not success-only rows. A deterministic result is reproducible for the same bytes; it is not source authentication. Preserve full helper output and exit status before a compact display. Report missing coverage and blocked/unavailable measures alongside observed values; never fill gaps with model estimates.

Keep report creation distinct from publication, delivery approval, business acceptance and production outcomes. Use existing separately authorized publication paths only when requested; a reporting request grants no external write or new data collection permission.
