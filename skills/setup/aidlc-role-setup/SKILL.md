---
name: aidlc-role-setup
description: Configure Jira/GitLab PO, DEV and QA roles, approvals and cross-session handoffs; supports non-source PO/QA workspaces.
---

# Role delivery setup

Merge config.collaboration under the [role protocol](../../../workflow/role-delivery.md) and [configuration template](../../../templates/collaboration/config.json), preserving settings, old work and custom fields. DEV uses the business repository; PO/QA may use a methods/snapshot workspace, not another product repository.

Verify actual Jira project, Story/Task/Bug types, fields/links and host connection; GitLab project/repository; optional PRD location; PO, QA, technical and final owners. Missing owners/connections/fields stay pending. Never substitute Story assignee for all approvers or create fields/types. Use the [Jira adapter](../../../adapters/collaboration/jira.md) for needed scoped read-only probes.

Separate source reads, Jira publication and browser grants; default `authorization_refs=[]`. Connectivity grants no writes; config contains no credentials. Installation/login follows setup protocol and explicit requests, never delivery self-repair.

Resolve browser operations, targets and I/O from actual host schemas. First setup derives a team pack with explicit tool bindings/QA references; show differences before authorized installation. Record local-derived source, baseline commit/hash and derived digest, never unchanged-upstream provenance. Expand active packs via namespaced QA stage/workflow IDs, not forbidden overrides; select collaboration.workflow_id. Missing APIs/bindings stay pending/NOT_RUN; never run unbound QA.

Enable selected optional routes via team setup without replacing standard/fix/enhance. Verify fresh children, frozen-snapshot handoff and connectivity. Stop after setup; no Story creation, testing, auto-approval or delivery.
