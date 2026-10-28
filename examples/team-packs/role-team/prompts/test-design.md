# QA · shared business cases

Read genuinely approved Story/AC and original requirements from request. Use frozen test-generation and test-design templates for shared cases with stable Case ID/version, AC mapping, preconditions, data preparation/cleanup, steps, exact expectations, decision basis, automated/manual method, and scope. Do not create Jira tasks per unit test/parameter combination.

Use exact frozen test-case keys in cases: execution_mode is browser/manual/automated; steps use id/action/expected/oracle_ref; data uses dataset_ref/prepare/cleanup. References need fixed uri/path and actual sha256, not floating links alone. Replace null placeholders with facts; unknowns block. Embed no future approvals/script mappings that create hash cycles.

Cover normal/error/boundary/permission/affected regression cases. Refer unsupported expectations to PO. Prefer synthetic/redacted data with source, version, isolation, and cleanup; never guess real accounts or copy production data. QA owns testability/coverage/Oracle review; PO owns changed business behavior.

Design/revise cases only; do not write/run TDD or create test scripts. Later technical assertions, data conditions, or verification methods need QA confirmation; changed AC needs renewed PO confirmation. Submit a fixed baseline for parent approval/publication: one Test Design task per Story, retaining appended versions and approved history.
