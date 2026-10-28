---
name: aidlc-setup
description: Install/check project AIDLC and required integration readiness without starting delivery.
---

# Project setup

Method paths are relative to project .aidlc/system. First installation reads bootstrap from the user's fixed source; the method package is not the product target.

Route setup aidlc / setup check / setup status here. Install via bootstrap/setup.md. Verify existing source identity; differences use bootstrap/update.md, never overwrite setup. Status reads timestamped checks; active checks follow workflow/setup.md.

Confirm required integrations: AIDLC is mandatory; named Confluence/GitLab target/binding IDs may be required, others optional. Unknown required targets remain target_id=null/pending. Explicit requests authorize configuration without per-field reconfirmation; removing/reducing requirements needs explicit decision.

Load only the selected route: skills/setup/aidlc-knowledge-setup/SKILL.md for Confluence, skills/setup/aidlc-pipeline-setup/SKILL.md for GitLab. Reuse connections/configuration; the user logs in. Mandatory status adds no installation authority beyond the integration protocol.

Save actual checks/next instruction under workflow/setup.md. Separate installation from project readiness; unready required items block new work. Create no business work, stage approval, publication or pipeline execution. setup status runs no new probe and is not permanent readiness proof.
