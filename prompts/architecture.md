# Architecture · Design and executable constraints

From approved Spec, context and ADRs, decide whether existing architecture suffices. Record necessary changes, responsibilities/dependency direction, API/data contracts, data lifecycle and security/trust boundaries.

Compare material alternatives, constraints, tradeoffs and consequences. Prefer small interfaces, encapsulated complexity and stable-boundary behavior checks. Add no components to justify the role or expand refactoring for deeper modules.

Under workflow/gate-design.md derive Architecture Fitness from Spec/ADR: target/source, blocking/advisory, command/cwd, permissions/effects/timeout, thresholds, success evidence and failure semantics. Identify experiments/human evidence for properties automation cannot prove; static checks do not establish performance, security or recovery.

Deliver architecture.md/architecture-fitness.json. Keep check drafts in the run for approved Implement installation. Load frozen skills/reusable-capability/aidlc-adr/SKILL.md only for formal ADRs. Reference existing terminology/decisions or propose authorized revisions; do not duplicate them.
