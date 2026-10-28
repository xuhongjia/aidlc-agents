# Confluence Cloud · one-way project knowledge publication

New 0.11 integrations use transport=twg_cli. Discover schemas, body formats and space rules through live help; never guess parameters or pass REST fields directly. Missing CLI/authentication routes to knowledge setup as pending; Hooks never install/login/upgrade. Old work retains its adapter. New work inheriting no transport needs explicit configuration; do not backfill old snapshots/authority or change transport/scope on retry. Missing reliable body/version reads, parent scoping, concurrency or readback means pending, not blind writes.

Official [Page API](https://developer.atlassian.com/cloud/confluence/rest/v2/api-group-page/) reference (checked 2026-09-25): creation uses space/parent/title/body; reads/updates carry versions. Actual calls use configured TWG authority, not new tokens/connections.

Render fixed snapshot sections in order: identity/source, applicability/invalidation, content.body, nonempty design_body, implementation_verification, anti_pattern, redactions. Omit absent sections; never summarize away design or promote verification. Preserve source references. Record projection/converter version and payload hash in receipts; the Hook converts format, not conclusions.

## Location, ownership and publication

Compare all receipts and knowledge versions (not page versions). Newer approved published knowledge supersedes old retries with zero writes. Before each write reread dispatch.authorization_ledger_path; frozen revocation_refs are not current authority.

1. Freeze target id/provider/site/space_id/parent_page_id/types. Verify parent-space membership/access under existing authority. Search only this parent's complete children, never the whole knowledge base. Site URL alone grants no permission.
2. Approved body includes visible `AIDLC knowledge: project_id / item_id`, version and snapshot content references. Receipt stores snapshot SHA-256, avoiding self-reference. Titles do not prove ownership. Without an owned receipt, create only after excluding uncertain attempts and fully verifying children/pagination; transient empty search is insufficient.
3. Update requires this project's receipt mapping, matching identity/target and last verified body/title/version. Human edits, moves, renames, unknown versions or multiple matches conflict. No overwrite/delete/permission changes. Reconcile unknown writes using persisted attempt + identity + exact content + target, never another same-title page.
4. Before freezing, stage reads format capabilities and prepares publishable content. Hook may losslessly convert Markdown to storage/ADF, retaining original bytes and actual converter/payload hashes. Meaning, link targets and redactions stay fixed; lossy rendering requires new review.
5. Discover confluence content create/get/update via live help. Create explicit page type, space/parent/title and deterministic HTML body file, not guessed live_doc defaults. Update reads full/html, metadata/current snapshotToken and validates receipt; send exact page ID with --snapshot-token and --body-file/--format html. Use --ack-body-formats only after the guide. No concurrency support means pending. Token conflict never permits automatic merge/retry with a newer token. Recheck revocation before writing; GET afterward verifies page ID, parent/space, title/body/version/identity.
6. Service normalization must be documented, deterministic and lossless; LLM semantic similarity is insufficient. Uncertain readback is unknown. 409/human changes conflict; timeout/disconnection requires lookup before retry, never blind recreate. 401/403 does not authorize requesting higher privileges.

One create/update per target/invocation; readback is not another write. Do not evade idempotency with a new title/parent/replacement page. Real integration without an authorized test parent is NOT_RUN.

## TWG discovery and output

Use twg help describe for "confluence content create", "confluence content update", "confluence content get". Before writing bodies read twg confluence content body-formats html; before resolving/editing spaces read their instructions via live help. Conflicting frozen content needs new review, not Hook rewriting. --yes suppresses CLI confirmation, never knowledge_publish authorization; valid fixed scope/current authority permits execution without per-call questions.

Prefer compact/stdout_inline; persist redacted full bodies/raw responses and inspect output_files when previews are insufficient. Summaries cannot prove ownership/body equality. All reads/readback specify the approved site, not the login default. [Knowledge setup](../../bootstrap/knowledge.md) installation/login requires a user-initiated configuration request.
