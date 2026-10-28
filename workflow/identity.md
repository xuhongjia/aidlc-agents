# Resolve approver identity automatically

Explicit role graphs first resolve PO/QA/technical/final under frozen collaboration.approvers/[role protocol](role-delivery.md). Missing roles stay pending, never assignee fallback. Other flows/old work keep original rules. Account discovery grants no approval; source/proxy/revocation rules remain.

Before work/cards/decisions, parent resolves read-only: **bound requirement's current Jira assignee → business-repository effective Git user.name/user.email → system login**. Never ask users to repeat available identity; names grant no approval.

## Sources and fallback

1. **Jira**: one explicitly bound issue/authorized connection; retain key/stable account ID/display name/returned email. Hidden email=null, never guessed/combined with others' Git email. Installed plugin is not binding. Multiple issues/assignees require identifying approval issue, never arbitrary selection. No issue/genuinely unassigned allows documented Git fallback; bound-issue access failure stays pending, never local-user substitution.
2. **Git**: separately run read-only `git config --get user.name` and `git config --get user.email` at business root. Record effective config/source/time; never last author or config edits. Preserve nonempty fields/null missing. System fallback only if both absent/outside Git; distinguish failed commands from missing fields.
3. **System**: host/native read-only login identity. Unix may use logname; macOS may verify console user without terminal login; Windows actual session account. Never infer people from folders/machines/history. id/whoami proves process identity only; root/service/sudo is not interactive identity. Confirm if only such account exists. Missing email=null.

Save state.approver via [identity template](../templates/work/approver.json); reviews/approvals/policies retain contemporaneous approver snapshots. Record source/source_ref/resolved_at and resolution_notes for missing/fallback/pending facts. No full directories/tokens/unrelated Jira fields. Ask once only when all sources unavailable; stay pending, never fabricate.

## Attribution and changes

Cards show resolved approver/source. Git/system provide local default attribution. With no displayed-identity conflict and explicit current-version approval, manual by uses resolved value (Name <email> if both), without asking again. Retain actual words/time/source; config alone grants no approval.

status=resolved means obtained; pending needs confirmation. Compare source/source_ref/account_id/display_name/email, not refresh timestamps. Missing names display actual email/account. decision_source preserves traceable response; delegation_ref cites evidence path/digest only for real proxy authority.

Assignee does not identify chatter. Differing/unlinked responder preserves expected assignee and awaits real approval/current user's explicit declaration or traceable proxy authority. Record actual responder/basis; never sign local “agree” as another Jira user. Never automatically change assignee/comments/status/platform approvals.

Automatic decisions use by=parent-coordinator/user_statement=null. approver is accountable owner; policy.authorization.by is actual card-bound authorizer. Only owner's real delegation/authorized proxy activates policy; identity reads never delegate.

Refresh before pending approval/auto continuation. Reassignment/Git-login change/unconfirmable source pauses decisions/continuation, revokes policy under approval.md and shows differences before confirmation/new snapshot. Never rewrite/back-sign history. Changed pending-card identity needs new review revision; completed decisions retain then-current identities, never retroactive signatures. Local records are not authentication; platforms enforce identity/separation of duties.
