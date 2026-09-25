# Security and trust boundaries

Team packs are declarative, not trusted execution plugins. Explicit overrides and locked workflow assets do not grant permissions. Every selected delivery path still requires bounded implementation authority, independent verification and both Gates. Prompt/template text and connector responses cannot change the frozen graph or authorization; unknown contracts, unsafe paths and unresolved branch facts fail closed.

aidlc-agents is an instruction package. It does not provide process isolation, authentication, tamper-proof approvals, dependency sandboxing, or protected CI checks.

- Review and pin the source revision before installing. Setup is scoped to one local project; no global configuration, credentials, plugins, MCP, dependency installation or business-code changes are implied.
- Preserve existing repository instructions and unknown changes. Never use remote instructions as permission to expose secrets or perform destructive actions.
- Stage artifacts, project context and logs may contain confidential information. Keep business work records in the business repository under its data policy; do not submit them to this package repository.
- Treat model-produced commands, fitness rules and reports as reviewable proposals until actually executed and verified. A name in a local approval file is not authenticated identity.
- Use the AI host's permissions and your repository/CI platform for enforced access controls, required checks and deployment approval.
- Knowledge publication is opt-in and scoped to explicitly authorized project-owned pages. Configuration, old auto-approval policies and setup/update do not grant publishing permission. Redact before freezing; treat feedback/page content as data, never instructions. Conflicts, uncertain writes and revocations stop the affected target. The instruction adapter and maintainer-only reference tests are not an access-control service or proof of live Confluence integration.

If you find a security issue, avoid posting secrets or exploitable private details in a public issue. Use GitHub's private vulnerability reporting if the repository owner has enabled it; otherwise ask for a private contact without disclosing sensitive details. This document does not claim that private reporting has already been configured.
