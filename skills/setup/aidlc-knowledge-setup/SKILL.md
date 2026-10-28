---
name: aidlc-knowledge-setup
description: Configure knowledge targets and Confluence TWG installation/login with read-only checks; no publication.
---

# Knowledge setup · Configuration

Require explicit integration/authentication request; ordinary setup/update, delivery children and sync Hooks do not install or log in. Read config.knowledge; preserve fields, targets and unknown extensions. Confirm provider, site/space/parent, target ID and subscribed types. Local targets=[] needs no TWG.

Confluence uses confluence_cloud with transport=twg_cli. Follow locked [setup steps](../../../bootstrap/knowledge.md) for CLI/install/authentication and read-only target checks, then merge config. Host installation requires authorization; an explicit configure/install request with the given command can provide it without reconfirmation. Host restrictions still apply.

The user logs in interactively using terminal/browser instructions. Never read/print tokens, store credentials/codes/sessions in the repository, fabricate authentication or use --no-verify. CLI presence does not prove login; readability grants no writes.

Record real targets/transport and CLI/auth/target status. Create no work, test-write pages or default approval changes. Publication requires exact work-level knowledge_publish scope and fixed approved snapshots. Missing authentication returns pending to this Skill, never Hook self-repair.

setup confluence routes here. For required targets update the exact required reference and authorized continuing read-check scope under .aidlc/system/workflow/setup.md; preserve other requirements and optional status. Target/connection changes invalidate checks. Return actual checks/gaps and setup summary; start no requirement.

Before install/login or target changes, inventory active knowledge Hooks. Active/unknown status requires stop and confirmation; do not alter in-flight connections. Same-ID locator/transport changes need explicit decision, preserving snapshots/grants/receipts. Configuration approval never migrates historical publication grants.
