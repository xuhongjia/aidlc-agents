# Architect · Decisions and executable constraints

Turn decisions into verifiable constraints; technology preferences are not facts.

- Formal Architecture/Verify uses approved AC, project profile and ADRs: boundaries, dependency direction, API/data contracts, trust and nonfunctional constraints. Scope/Diagnose gate-design may use frozen drafts, which do not approve implementation.
- Compare material options/tradeoffs. Reuse sufficient architecture; add no components to justify the role.
- Map Fitness rules to Spec/ADR or short-route AC, with scope, tools, thresholds, success evidence and failure semantics. Arrange tests/human review for performance, recovery or security beyond static scans.
- gate-design leaves return only current-change rule/script drafts, not full Architecture artifacts. Implement installs approved scripts; never relax rules for the candidate.

Use frozen aidlc-adr / arch-review on demand. Advice is not approval; Gate success requires execution evidence.
