# Required project Setup

Since 0.14, projects declare required integrations: always AIDLC, Confluence/GitLab only for listed targets. This host-AI protocol replaces neither permissions nor enforced CI Gates.

## Prompts for AI

See [installation](getting-started.md#install) and [role handoffs](role-delivery.md). Send these prompts to AI after installation; they are not terminal commands:

| Instruction | Action |
|---|---|
| setup aidlc | Install/verify the method and child-agent capability; configure project requirements without starting work |
| setup confluence | Reuse TWG; install/guide login under existing permissions; confirm site, space, and parent page |
| setup gitlab | Reuse the host connection or authenticated glab; configure exact projects, CI/CD bindings, and report mappings |
| setup role delivery | Configure the optional role team pack, Jira/GitLab sources, PO/QA/technical/final responsibility, and handoffs; does not automatically enable CI/CD validation |
| setup check | Actively check all project requirements and report gaps |
| setup status | Show the previous check and timestamp only; no network access or treating stale ready as a fresh check |

Solo/local delivery may require AIDLC alone. Check role read/publication separately under the [role protocol](../workflow/role-delivery.md): Jira is outside this Setup list; readable GitLab material proves no CI/CD readiness. Lower existing requirements only by explicit decision.

Example:

> setup aidlc. This project requires Confluence engineering-kb and GitLab app-ci; other integrations are optional. Verify the real targets and record their scope. Allow read-only checks of these two targets before each future new request. Do not start work, publish pages, or trigger pipelines.

Reuse real configured IDs; unresolved links/bindings remain pending. Follow [Confluence](../bootstrap/knowledge.md) / [GitLab authentication](../bootstrap/pipelines.md); keep credentials out of chat/Git.

## Minimal configuration

Merge this into .aidlc/config.json, using IDs from the project's existing configuration:

```json
{
  "setup": {
    "required": [
      {"id": "aidlc", "capability": "aidlc", "target_id": null},
      {"id": "project-kb", "capability": "confluence", "target_id": "engineering-kb"},
      {"id": "build-ci", "capability": "gitlab", "target_id": "app-ci"}
    ],
    "read_check_authorization": null
  }
}
```

Use configured knowledge.targets[].id / delivery.bindings[].id; no duplicate target source. Unlisted integrations are optional: neither proactively probe nor block on them. Separate targets/projects need separate entries.

null authority is pending, not permission. Record genuine user_statement/source/at and resolved-target scope_digest. Probes stay scoped; target/connection/mapping changes or revocation invalidate records. External target_id=null remains required/unselected.

## When to block or continue

Before new work, run version/update preflight, then requirement checks bound to this invocation/configuration with evidence. Create work only when all pass. Failures report a repair entry point without install/login loops. Setup starts no work.

- AIDLC: complete files/bridge and a valid isolated child-agent probe. Reuse complete probe evidence while the host is unchanged; do not spawn a new probe at every stage.
- Confluence: actual authenticated reads of the specified target succeed. An installed CLI alone is not ready; readable does not guarantee writable.
- GitLab: the connection, exact project, and required reports/mappings are actually available. A historical red pipeline does not automatically fail Setup. Readiness checks are separate from this candidate's dual Gates/deployment validation.

Report method_ready/project_ready separately: installed method plus missing Confluence authentication still blocks new work. Store evidence in .aidlc/setup/checks/; new locks reference digests rather than load the full Setup document per stage.

Existing work keeps version/lock/authority, without new requirements; operations still verify permissions. Status/approval/revocation/closure remain available. Missing legacy setup means AIDLC-only; invalid explicit config cannot use that fallback.

Required grants no page write, CI trigger/retry, monitor, publication, or approval authority. Failed knowledge sync stays pending without rewriting valid delivery results. Lower/remove requirements only by explicit configuration decision.
