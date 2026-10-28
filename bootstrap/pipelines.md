# Configure existing GitLab CI/CD

Send this in an integrated product repository:

> Configure existing GitLab CI/CD, environments, reports/mappings, and automatic waiting. Explicit short-route release validation belongs in Verify, retaining three stages/two main documents.

Use the [pipeline setup Skill](../skills/setup/aidlc-pipeline-setup/SKILL.md) after reading the [configuration contract](../workflow/pipeline-config.md). Ordinary method setup/update keeps delivery=null and does not install tools, authenticate, or start monitors.

1. Resolve actual product GitLab host/project from remotes/connections. Bind extra projects/central deployer separately; never use method-package CI.
2. Prefer existing read-only host connection; otherwise guide its authorization. With installed glab, user authenticates in their terminal using `glab auth login --hostname <actual GitLab host>` and live `glab auth login --help` / `glab auth status --help`. Never request credentials in chat, store in Git, or replace accounts. Without usable CLI/connection, present choices and pending status; no automatic installation.
3. Read project, relevant pipelines, complete jobs, allowed artifacts, environments. Identify readable Architecture/Quality rules, build metadata, smoke/health, runtime identity reports. Verify access to every CI/CD project; report cross-project gaps.
4. Adapt [same-project](../examples/delivery/gitlab-same-project.json) / [cross-project](../examples/delivery/gitlab-cross-project.json) config.delivery with actual project/job/path/mappings. Document deterministic custom-field semantics; never infer from titles. Missing reports/rules remain proposed additions/gaps, not runnable configuration.
5. Reject CD→Verify approval cycles; use [team release_readiness](../docs/team-workflows.md) after approved Verify. Select local/ci/hybrid, environment, required checks, actual wakeup capability. Short-route CD is explicit; default CD belongs to Release.
6. Request authority covers config.delivery changes, preserving other fields/old locks. Show binding diffs, real read probes/unverified items, 5-minute/2-hour defaults, and recovery without host support; then stop.

New-work first approval freezes bindings/wait scope before stage execution/monitoring. Configuration proves no CI/CD PASS, deployment, or tested wakeup.
