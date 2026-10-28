# PO / DEV / QA handoff team pack

Optional for new 0.15 work; preserves core.standard/fix/enhance. Under [team setup](../../../bootstrap/team.md), verify source and configure collaboration. Merge existing packs explicitly, resolving ID conflicts; never replace their whole directory or infer external permissions.

## Configure browser access before use

**QA tool_binding_ids=[] means this template is not browser-ready.** Before initial registration, discover actual host read/navigation/interaction operations and contracts. Bind connector, operation, exact test target, effect and authorization_ref=null; assign IDs to QA. Record local-derived provenance, original commit/hash and derived hashes; show the authorized installation diff.

Registered Stage overrides cannot add operations: create/select a new namespaced QA Stage/workflow through config.collaboration.workflow_id. Actual call authority belongs only in dispatch. Missing connection, mappings, target match or test-scope authority blocks. Check live controller/revocation before effects.

## Entry points

| Workflow | Purpose / endpoint |
|---|---|
| team.prd | PO BRD→PRD; analysis_complete |
| team.story | PO Story/AC slice; analysis_complete, then requirements_ready |
| team.test-design | QA business cases before development; analysis_complete, then test_design_ready |
| team.role-delivery | intake → design → implement → qa → verify; verified only with evidence/approvals |

Preparation may use non-source PO/QA workspaces but still needs isolated children, pinned inputs/method, actual approvals and controlled publication. Work one Story at a time; unresolved PRD portions need not block independent slices.

Delivery imports approved Story/AC and QA cases. Design produces technical-spec.md and plan/quality JSON. Implement requires technical and QA design approvals, executes TDD, freezes candidate and returns implementation_ready_for_qa; delivery remains in_progress. QA tests its actual running build. Only after required QA evidence, dispatch formal independent Architecture/Quality Reviewers and collector; do not duplicate formal Gates in DEV/QA. Missing environment/authority blocks without automatic deployment.

## Handoff across sessions

Use the [role guide](../../../docs/role-delivery.md) for PO/DEV/QA prompts and case sync. Supply Story, work/lock, approved source/case versions and candidate/handoff references, not full chat histories. Verify the unfinished node and role approvals. Original workspace/coordinator remains sole delivery-state writer; remote QA returns a bounded result packet for import. New sessions create no duplicate work, approvals or authority.

## Output contracts

- Plan tasks: stable task_id, readable behavior, requirement_ids/ac_ids/case_ids, approved Oracle, paths, dependencies, exclusive writes/shared resources, completion checks and rollback. Empty tasks are not executable.
- source_approval_refs contains only existing upstream approvals. Current technical/QA approvals live in separate records; future self-approval would create hash cycles.
- Quality strategy covers unit/contract/integration/UI/manual. Map Case ID/version→AC→real checks/protocols; preserve Oracle sources, reproducible data/environment and complete required_evidence. No invented thresholds.
- Only Implement has product.write. QA interactions require explicit tool/work authority; code/scripts stay read-only. Human review is default; resolve configured role owners, not one Story assignee for all.
- Jira owns requirements/cases; local copies are immutable snapshots. GitLab owns Technical Spec/scripts/fixtures/reports; Jira gets summaries/links. No credentials or unauthorized production test data.
- Explicit case sync or DEV continuation detects changes; authorized Implement updates scripts, never QA. Preserve history and revalidate affected candidates/results. No background listeners.

This declarative example and its contract tests do not prove Jira/browser execution or human approval. Unexecuted stays NOT_RUN; verified does not set Jira Done or trigger production.
