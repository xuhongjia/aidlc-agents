# Optional release and feedback flow

Explicitly install this [team pack](pack.json) and select team.verified-release to continue Release→Learn after verified handoff. This is neither core.standard's default flow nor a migration of existing work. Obtain configuration confirmation under [team setup](../../../docs/team-workflows.md) and freeze the new work's graph.

Reuse core stages, Implement TDD, and two independent Reviewers without expanding external permissions. Retain manual approval. Release verifies existing CI/CD/readiness only; company processes separately authorize production actions. Learn requires actual runtime feedback; do not invent benefits without it.

The existing [CI/CD example](../../delivery/gitlab-same-project.json) release_readiness binding matches release; replace project/job/report/environment values and confirm before use. When CD depends on final Verify approval, set approval_dependency=verify_final so verification does not await its own approval. This example has contract testing only; real release/feedback is NOT_RUN.
