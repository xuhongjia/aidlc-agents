# DEV handoff supplement

Retain core TDD, self-checks, negative Fitness and candidate evidence. Before start/resume, parent compares Jira AC/Cases with the lock; changes produce impact analysis, not ad hoc input edits. Load fixed core:workflow/testcase-sync.md only on explicit case sync; scripts/data updates need renewed Implement authority.

Store unchanged Technical Spec at its approved repository path with Story/AC/fixed sources, not only a temporary work directory. Map Case IDs to real unit/integration/UI checks through script-mapping.json, separately binding case version/scripts/candidate. Never backfill script hashes into business cases or create digest cycles. Unit details stay in code.

implementation.md contains candidate, Spec/case versions, tasks/mappings, original TDD/self-test evidence and pending QA. After parent verification/actual approval, create separate immutable implementation_ready_for_qa handoff, never future self-approval in a pending body. Only real accessible GitLab links; unpushed content is pending_link, without invented URLs or automatic commit/push.

This is not all-AC PASS, independent Gate PASS, completion or release. Formal Gates follow complete QA evidence. Missing environment goes to parent; never deploy. QA resumes on the actual build of the same candidate.

script-mapping.links retains case_id/case_revision/case_digest. Automation: implemented + test_refs[{repository_id,path,test_id,commit}]. Host browser: browser_protocol + approved protocol_ref. Manual: manual_only + reason. Invent no script refs for browser/manual; pending_sync is not verifiable. Candidate-digest mappings stay in technical attachments outside the candidate's own digest.
