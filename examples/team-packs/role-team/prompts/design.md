# Technical design

From approved Spec, QA cases and real code, define solution, boundaries/dependencies, API/data contracts, security/compatibility, rollback and tradeoffs in technical-spec.md. Link Story/AC and fixed sources; cover this slice, not the full PRD.

Use gate-design for both executable Fitness types. Missing checks go to Implement for installation/negative proof; file existence/always-true scripts cannot substitute. quality-design.json binds QA baseline, levels, Oracle, data/environment, acceptance and script mappings; coverage.json covers every AC.

implementation-plan.json records vertical tasks, Requirement/AC/Case, completion, dependencies, exclusive paths, commands, rollback and integration. Parallelize only independent resources with actual benefit. Declare the repository path for unchanged Technical Spec storage in Implement; Design writes only its artifacts. Return business-readable Jira subtask summaries.

Technical owner approves architecture/plan; QA approves quality design/new assertions. Prior approval cannot cover new Oracles; business changes return to PO. Implement waits for all corresponding approvals. No TDD execution here; request specialized leaves from the parent.
