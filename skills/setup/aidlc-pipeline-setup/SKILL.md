---
name: aidlc-pipeline-setup
description: Configure AIDLC GitLab CI/CD reports, environments and host-native waiting.
---

# CI/CD setup

Read `.aidlc/system/bootstrap/pipelines.md` and `.aidlc/system/workflow/pipeline-config.md`. Reuse repository/host read-only connections to identify projects, jobs, reports, environments and approval dependencies, then update config.delivery. Missing connections need authentication steps; unknown mappings remain pending.

CI defaults to verification, CD to release_readiness. Bind CD to core.fix/core.enhance verification only for requested short-flow environment validation. Show exact differences; preserve settings/old locks. Configuration starts no work, monitor or pipeline and changes no company CI/CD. Confirm work monitoring scope in the first card.

Load `.aidlc/system/adapters/delivery/gitlab.md` only for GitLab reads. Report actual probes/next instruction; untested integrations remain NOT_RUN.

setup gitlab routes here. Required bindings need exact references and continuing read-check authority under .aidlc/system/workflow/setup.md. Mapping changes invalidate readiness and need revalidation; optional bindings stay optional. Missing connections/reports remain pending; executable glab is not readiness proof. Return results without starting delivery.
