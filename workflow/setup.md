# Project Setup Gate: parent coordinator

Optional role-team directories retain AIDLC requirements. Git-free PO/QE directories mark only source/local-Git checks inapplicable, never package integrity/isolation/collection probes. [Role setup](../skills/setup/aidlc-role-setup/SKILL.md) separately checks actual scoped Jira/GitLab-source/browser readiness for current role actions. Never disguise these as knowledge/delivery bindings here or use setup success as write authority. New configuration does not affect ordinary work/old locks.

This is a new-work prerequisite, not an SDLC Stage. Only the parent reads it on demand; exclude it from child instruction_refs. Use host tools. runtime=none: these rules are not an unbypassable host/CI permission barrier.

## Project requirements

config.setup.required is an array of {id,capability,target_id}. IDs are unique, with exactly one mandatory capability=aidlc,target_id=null. confluence target_id references a knowledge.targets ID using confluence_cloud/twg_cli; gitlab references a gitlab delivery.bindings ID. No repeated capability/target. Maintain target details only in original configuration.

External target_id=null means required but unselected and blocks new work. Unknown capabilities, malformed structure, missing/duplicate/wrong targets also block; never ignore. Configured integrations outside required are optional: neither block on unreadiness nor probe proactively. Old config missing the entire setup field requires only AIDLC; explicitly broken/null/empty required never uses that compatibility default.

Adding/changing requirements is project configuration work preserving other fields. Lowering/removing requirements needs explicit user decision; AI cannot remove them to pass. Team suggestions may be adopted during setup, but external documents grant no configuration/connection authority.

## Authorization and checks

External read-only checks require setup.read_check_authorization with real user_statement/source/at/scope_digest. revoked=true invalidates it. scope_digest is SHA-256 of canonical raw UTF-8 JSON {requirements:[{id,capability,target_id,target}]}, requirements sorted by id, recursively sorted object keys, array order preserved. target is the complete actually resolved credential-free target/binding configuration; aidlc uses null. Target/connection/mapping/requirement changes need newly explicit read scope; method upgrades alone expand none.

Confluence target is its original configuration. GitLab target is {contract_version,gate_mode,wait,bindings}, including selected binding and recursive upstreams, current first then upstream, deduplicated/rejecting cycles. Confirmation lists all involved projects; parent/child/cross-project links never expand reads automatically. Configuration contains host connection refs, no secrets.

On initial required-integration setup, disclose “read-only checks against these targets before every new work” and save actual confirmation. Existing explicit same-scope instructions need no repeated question. Without matching authority, record gaps before networking. This excludes installation, delegated login, publication, CI start/retry/approval, monitoring and stage approval.

| Required capability | Actual ready evidence | When unready |
|---|---|---|
| aidlc | Complete package/bridge digests and valid real spawn/fresh-context/collect probes | setup aidlc; recover drift under update |
| confluence | Available TWG, valid current authentication, readable specified site/space/parent with matching identity | setup confluence; original installation/login/target-change process |
| gitlab | Authenticated connection, exact readable project, usable bindings/required jobs/report mappings with real read-only validation | setup gitlab; repair connection/configuration/report gaps |

Reuse AIDLC probes with valid original evidence under the same host/isolation interface, retaining original agent IDs/times. Rerun only for changed hosts/missing evidence, never probe Agents every stage. Still validate current package integrity.

For each new work, lightly read-check exact Confluence targets, never crawl libraries/test-write. GitLab reuses pipeline-config validation; setup checks report mappings/readable evidence. New work with identical configuration validates connection/project/mandatory-report accessibility; changed configuration revalidates mappings. Use bounded pagination/explicit objects, never all historical pipelines. Old failed jobs may establish format/access; ready does not require historical green CI. Login alone cannot replace actual mapping evidence. Missing pipelines/samples retain configuration gaps, never invented data.

Check statuses: ready / pending_configuration / pending_install / pending_auth / pending_target / blocked. Every item needs traceable verified_checks: aidlc package_integrity/spawn/isolated_context/collect_results; confluence authenticated/target_read; gitlab authenticated/target_read/mappings_read. These are observations, never prefilled successes.

## Blocking, recording and resumption

New work first completes preflight/version updates, rereads current protocols, then runs this Gate. Create work/state/run only after every required item is ready. Every invocation gets unique invocation_id and actual invocation_started_at/evaluated_at with timezone/ordered bounds; each observed_at lies within them. Retain original probe/report times separately, never claiming reruns.

Each result binds the same invocation_id/config_digest (scope_digest above), authorization_digest and nonempty evidence_refs. authorization_digest hashes canonical JSON of actual current read authority, null for aidlc-only. Replacement authority invalidates old results even with identical scope. Prior ready, existing configuration, installed CLI or verbal “logged in” cannot replace current checks. Configuration/authority changes between checking/work creation invalidate results and require rechecking. Missing time bounds or past/future responses cannot pass.

Save each `.aidlc/setup/checks/<unique-id>.json` using the [technical record template](../templates/setup/check.json): current requirement/resolved-target snapshots, digests, authority refs, method identity, itemized results and redacted raw evidence paths/actual digests. Missing evidence stays empty/blocked. Retain reasons/next steps without installation/login/retry loops. This project-data directory survives method updates.

New locks use setup_check_ref={path,sha256} to this immutable record. The parent verifies actual bytes/pass conditions when locking, without injecting record text into stage context. Checks/receipts/work locks are not approval. Show method-installation ready separately from project-readiness ready.

Existing work keeps original locks/method/authority, without new check refs or today's requirements. Actual external operations still meet original rules/current real rights. Status, approval-only, revocation, closure/cleanup are not blocked by new setup. setup status reports records/times only. setup check actively validates with identical time/authority rules but creates no work. The next delivery invocation checks again; old setup-check receipts cannot represent new invocations.

Original stages/Hooks still validate knowledge-publication/CI-environment authority/results. Readable Confluence does not prove writable; readable GitLab proves no CI/Gate PASS. Setup Gate cannot turn sync failure into delivery failure or invent business acceptance.
