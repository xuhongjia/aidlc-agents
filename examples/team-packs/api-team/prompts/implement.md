# Implement the approved API change

Follow `core:prompts/common.md` and the core implementation, gates and approval protocols. Consume the approved `change` through its binding; this is the authority named by the workflow node. Verify its approval, artifact digest and exact authorized paths, commands and side effects before product writes. Preserve existing user changes.

If review-depth selected `review`, consume both approved `analysis` inputs before implementation. They are independent advisory evidence; neither may expand the approved scope. If review-depth selected `direct`, both review steps are skipped and no analysis input is required. Never treat a selected but unfinished or blocked review as an absent optional input.

Implement the smallest complete change within the approved scope. Install only already-reviewed gate or test additions, retain their source and digest, and prove new checks can detect their intended controlled negative cases. Run the authorized local checks and capture actual environment, commands, exit codes, counts and raw evidence. Missing authority, a changed Oracle, a security-sensitive flag, new risk or expanded scope returns blocked for renewed review.

Deliver the declared `implementation` artifact as `api-delivery-note.md`. Record the exact candidate and computed file digests, AC-to-change map, actual self-check results, limitations and rollback. Leave independent QE verification and unexecuted checks as NOT_RUN. Candidate delivery is not independent verification, business acceptance, push or deployment authorization.
