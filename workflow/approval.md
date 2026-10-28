# Work-level approval: manual / checkpoint_low_risk / auto_low_risk

[dag](dag.md) governs dependencies/continuation; this is the sole decision rule. New work defaults manual. workflow=auto, setup, package config, identity resolution and child results grant no authority. Existing work/policies keep their [original version](legacy.md), without new modes/correction budgets.

| Mode | Scope | Before implementation | Implement candidate | Final Verify |
|---|---|---|---|---|
| manual | Any valid graph | Human | Human | Human |
| checkpoint_low_risk | Unoverridden built-in core.fix/core.enhance, actually low risk | Human confirms exact delegation | Delegated after coordinator validation | Human required |
| auto_low_risk | Original low-risk compact flows/equivalent team delivery graphs; every activatable stage auto-eligible | Automatic after initial work delegation | Automatic after validation | Automatic after dual Gates/AC pass |

No automatic approval for standard, high-risk, analysis-only or Release/Learn. checkpoint requires the frozen core version's built-in graph, stage definitions, Prompts/templates and execution assets; renamed team IDs or execution-changing overrides disqualify it. Real project rule/knowledge references are not core-definition changes.

## One authorization card, three separate records

After read-only Scope/Diagnose, checkpoint may be recommended. One card lists work/graph/entry review, risk evidence, implementation files/commands/cwd/entry digests/resources/side effects/timeouts, candidate-to-Verify scope, mandatory final human review, optional correction budget and stops. Explicit “approve this scope and continue under this card” may jointly:
1. Record real human entry approval;
2. Save immutable policy bound to that review/complete card;
3. Authorize Implement and independent Verify after a qualifying candidate.

Policy/entry approval separately cite card/review, never hash each other. No future candidate digest or human signature for nonexistent candidates. Output approval without confirmed delegation stays manual. auto_continue=false stops at each approval; never implies next-step execution. checkpoint entry approval.authorized_steps contains only implement; later Verify continuation requires the card's explicit conditional delegation.

Use the [policy template](../templates/work/approval-policy.json): mode, work/request/method/workflow_ref, allowed_steps, command/path/tool scope, actual authorizer/words/time/source, card_ref. Save policies/POLICY-card.md and real SHA-256 before confirmation, which must bind exactly. Generic “auto-approve” permits card preparation only. Save/hash policies/POLICY.json, record state ref/actual activation event and preserve history. checkpoint.allowed_steps contains only implement; entry_approval_ref identifies valid human entry-stage approval. The entry card may approve the graph, never automatically Verify.

Separate authorization/by from accountable owner; refresh [identity](identity.md) before cards/decisions. Changed/unconfirmed identity, revocation or authorization mismatch stops work/clears delegation. Paths exclude entire repositories, wildcard roots, parents, symlinks and control directories. Bind commands to actual entries/config/resources/effects; unchanged names do not authorize changed scripts. Validate approved pending-check draft installation digests under [gates](gates.md).

## Validate every delegated decision

After establishing a real review, parent checks:
- Valid, real, unrevoked authorization; matching card/policy/work/request/method/graph/step/entry baseline; authorized paths/commands.
- Actual low risk; resolved scope/AC/Oracle/rules/manual evidence. Fix cause/reproduction must be credible; child risk assessment alone is insufficient.
- Actual worker/dispatch/result, complete outputs/candidate/history agree; no overreach, drift, missing results/placeholders.
- Implement final DEV/dual-Gate self-tests actually pass. Preserve correction FAIL, resolving only through compliant [feedback](implementation-feedback.md) and final pass under unchanged rules. Future independent QE may be NOT_RUN, never accepted.
- New independent Verify child, same-candidate dual Gates/all AC evidence; never copied DEV PASS. checkpoint remains awaiting_approval here; candidate policy cannot complete it.
- Delivery card freezes targets/mappings/deadlines and explicitly authorizes background read-only waiting/new-child same-node resumption. state.wait_authorization_ref retains actual confirmation; config/old authority imply none. Complete review needs all mandatory CI/CD evidence. waiting_external grants no approval; delegation supports only bounded same-node resumption, never real failures/missing reports. Host wakeups grant no next-node continuation.
- No cross-stage rework. Only qualifying internal implementation failures with explicit budget enter feedback validation. Other FAIL, required NOT_RUN/UNKNOWN or scope/risk/authority changes immediately revoke delegation, stop workers and return to humans.

## Decision, continuation and revocation

Human decisions: approval_mode=manual, actual responder as by, real user_statement/decision_source/proxy basis, policy_ref=null. Delegated candidate decisions: approval_mode=checkpoint_low_risk or auto_low_risk, by=parent-coordinator, user_statement=null, original policy_ref, itemized actual decision_checks bound to exact review_digest. Never invent human signatures or conflate decision sources.

state.approval_mode is active policy; approval.approval_mode is that decision's mode. checkpoint entry/final records remain manual even with checkpoint state before final approval. approved implies neither deployment nor business acceptance. policy.allowed_steps limits delegated approvals, not dispatch eligibility; continuation separately requires auto_continue, explicit entry-card scope, frozen dependencies and approval.authorized_steps.

checkpoint allowed_steps=[implement]. Qualifying Implement with auto_continue=true sets candidate approval.authorized_steps=[verify]: dispatch independent Verify, never approve it automatically. auto_continue=false sets authorized_steps=[] and waits for user continuation. Final human review grants no automatic return to Implement. Other manual/auto modes continue only card/policy-authorized next batches.

manual may hold [implementation feedback](implementation-feedback.md)-only policy, approving no stages automatically. All modes default feedback to zero; checkpoint/auto never imply two rounds.

“Return to manual/stop” revokes all delegation, including correction/publication. Preserve history; actually recall workers under orchestration and stop monitors under pipeline-wait. Disqualifying failure, persistent failure with exhausted budget, escalation, graph/responsibility changes, formal rework, completion or revocation clears active policy. Only feedback-validated qualifying internal failure with remaining budget retains reserved continuation. Stop dispatch until eligibility is verified. Preapproved expected negative evidence is not work failure. New sessions require user continuation/actual-state validation; only explicitly scoped/deadlined pipeline wakeups resume the same authorized node. Old auto flags never self-start. Reauthorization cannot reset the same implementation revision's spent budget.

knowledge_publish defaults null and needs separate explicit authority. checkpoint final human review may approve fixed knowledge/exact targets on the same card. Candidate approval grants no publication; automatic capture grants no corporate-standard editing. Publication/revocation follow [knowledge](knowledge.md). No mode automatically authorizes push/merge/deploy, dependency installation, production data, paid actions, permission changes, business acceptance or direct closure.
