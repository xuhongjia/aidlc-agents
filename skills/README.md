# Skills by category and stage

31 Skills, each in one category; stages below are navigation, not required execution order. Browse this page or [catalog.json](catalog.json) on demand. Children load only current dispatch resources under the locked workflow and grants, never all Skill bodies.

| Category | Skill | Stage / purpose |
|---|---|---|
| orchestration (2) | [aidlc](orchestration/aidlc/SKILL.md) | Parent routing, dispatch, status and approval |
| | [aidlc-workflow](orchestration/aidlc-workflow/SKILL.md) | Configure team DAGs, stages and templates; no delivery |
| setup (4) | [aidlc-setup](setup/aidlc-setup/SKILL.md) | Install/check AIDLC and required integrations |
| | [aidlc-knowledge-setup](setup/aidlc-knowledge-setup/SKILL.md) | Confluence / TWG configuration |
| | [aidlc-pipeline-setup](setup/aidlc-pipeline-setup/SKILL.md) | GitLab CI/CD bindings and waiting |
| | [aidlc-role-setup](setup/aidlc-role-setup/SKILL.md) | Jira/GitLab sources, role approvals and browser handoffs |
| stage-entry (11) | [aidlc-intake](stage-entry/aidlc-intake/SKILL.md) | Intake: sources, goals, scope and risk |
| | [aidlc-spec](stage-entry/aidlc-spec/SKILL.md) | Spec: FR/NFR, behavior and AC |
| | [aidlc-enhance](stage-entry/aidlc-enhance/SKILL.md) | Enhance route: Scope → Implement → Verify |
| | [aidlc-fix](stage-entry/aidlc-fix/SKILL.md) | Fix route: Diagnose → Implement → Verify |
| | [aidlc-architecture](stage-entry/aidlc-architecture/SKILL.md) | Architecture: constraints, contracts and Fitness |
| | [aidlc-quality](stage-entry/aidlc-quality/SKILL.md) | Quality: Oracle, coverage and Fitness design |
| | [aidlc-plan](stage-entry/aidlc-plan/SKILL.md) | Plan: verifiable slices, dependencies and implementation authority |
| | [aidlc-implement](stage-entry/aidlc-implement/SKILL.md) | Implement: TDD, self-tests and candidate handoff |
| | [aidlc-verify](stage-entry/aidlc-verify/SKILL.md) | Verify: independent dual Gate / AC evidence collector |
| | [aidlc-release](stage-entry/aidlc-release/SKILL.md) | Explicit extension: release readiness, no automatic release |
| | [aidlc-learn](stage-entry/aidlc-learn/SKILL.md) | Explicit extension: actual feedback and revised lessons |
| role-collaboration (4) | [aidlc-prd](role-collaboration/aidlc-prd/SKILL.md) | PO preparation: BRD → PRD, independent analysis |
| | [aidlc-story](role-collaboration/aidlc-story/SKILL.md) | PO preparation: PRD/requirements → Jira Story and AC |
| | [aidlc-test-design](role-collaboration/aidlc-test-design/SKILL.md) | QA before development: confirm shared business cases |
| | [aidlc-qa](role-collaboration/aidlc-qa/SKILL.md) | QA execution: browser/human evidence on a frozen candidate |
| reusable-capability (8) | [aidlc-spec-generation](reusable-capability/aidlc-spec-generation/SKILL.md) | PO preparation, Spec, Scope/Diagnose: source-mapped AC |
| | [aidlc-adr](reusable-capability/aidlc-adr/SKILL.md) | Architecture: draft decisions and tradeoffs |
| | [aidlc-test-generation](reusable-capability/aidlc-test-generation/SKILL.md) | Scope/Diagnose, Quality, Test Design: Oracles/scenarios; executable tests only in approved Implement |
| | [aidlc-fitness-check](reusable-capability/aidlc-fitness-check/SKILL.md) | Implement self-tests or assigned Verify Reviewer checks |
| | [test-driven-development](reusable-capability/test-driven-development/SKILL.md) | Implement only: RED → GREEN → REFACTOR |
| | [incremental-implementation](reusable-capability/incremental-implementation/SKILL.md) | Implement only: independently testable behavior slices |
| | [debugging-and-error-recovery](reusable-capability/debugging-and-error-recovery/SKILL.md) | Implement failures, on demand; no additional repair authority |
| | [code-review-and-quality](reusable-capability/code-review-and-quality/SKILL.md) | Implement self-review, on demand; no independent Gate authority |
| sync-publication (2) | [aidlc-knowledge-sync](sync-publication/aidlc-knowledge-sync/SKILL.md) | Approved Verify/Learn publication Hook or explicit retry |
| | [aidlc-test-sync](sync-publication/aidlc-test-sync/SKILL.md) | Explicit case/result sync or DEV continuation check |

## Execution boundaries

- Spec/Architecture/Quality/Plan may design tests; product-test writing and TDD occur only in Implement. Test Design grants neither product writes nor TDD.
- Implement self-tests/review cannot replace independent Architecture/Quality Reviewers; Verify collects their evidence. In [role delivery](../docs/role-delivery.md), complete required QA evidence precedes the parent's two formal Gate dispatches. DEV readiness, QA completion and sync success alone are not verified delivery.
- Setup/configuration/sync adds no delivery stage, remote-write, production or auto-approval authority. Release/Learn require explicit extensions.

`enhance`/`fix` begin at `core.scope`/`core.diagnose`. Optional role-team `team.role-design` combines architecture, quality design and planning. Use [built-in stages](../workflow/stages.json), the [role team pack](../examples/team-packs/role-team/pack.json) and catalog for full stage mappings.

## Paths and maintenance

Package paths are `skills/<category>/<name>/SKILL.md`; names and natural-language invocations are unchanged. [Setup](../bootstrap/setup.md) may copy the router to native host entry `aidlc/SKILL.md`. Existing installs use [Update](../bootstrap/update.md); old work/frozen assets retain original paths.

When adding a Skill, update its category directory, catalog name/path/category/stages/scope and this index. Catalog paths are package-relative; use empty stages for non-stage Skills and explain timing in scope. Team packs define custom stages. Navigation never changes locks or permissions.
