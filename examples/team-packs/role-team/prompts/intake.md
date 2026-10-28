# DEV intake · verify the business baseline

Read Jira Story/AC, source PRD, QA-confirmed Test Design, and actual approval records from fixed request handoff references; read current repository facts from project. Verify project, source versions/hashes, role identities, and unresolved items. Jira status, assignee, chat summary, or latest title is not approval.

Use spec to retain source snapshots/original mappings. acceptance.json preserves complete FR/NFR→AC/approved exclusions; test-design.json preserves approved bytes and Case ID/version. Jira retains business content; do not introduce new rules here. Missing/drifted sources, unapproved cases, uncovered AC, or inapplicable prior knowledge block.

Confirm this Story/slice's scope/risk and submit its first card. Reference verified PO/QA approvals without re-signing; they do not replace this work's graph/implementation authorization. Leave unknown technical facts to design. Do not write products, execute TDD, or claim delivery.
