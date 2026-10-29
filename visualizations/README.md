# Visual guides

Reference diagrams in Simplified Chinese, based on source revision `1015e2b9a0369d70b5c0c52116721626b120624e`. They are outside the installed method payload and the immutable Chinese archive. The English method remains authoritative; these diagrams do not prove external integrations or completed delivery.

| Guide | Interactive HTML | Source and validation |
|---|---|---|
| Delivery architecture | [Open or download](zh-CN/architecture/index.html) | [Definition](zh-CN/architecture/spec.json) · [Receipt](zh-CN/architecture/validation.json) |
| PO / DEV / QA workflow | [Open or download](zh-CN/po-dev-qa/index.html) | [Definition](zh-CN/po-dev-qa/spec.json) · [Receipt](zh-CN/po-dev-qa/validation.json) |

GitHub displays HTML source. Download the file or clone the repository, then open `index.html` in a browser. Each HTML is self-contained; no server or setup is required.

## Delivery architecture

Shows the coordinator, independent stage agents, pinned evidence, two Gate Reviewers and Collector, plus optional Jira, GitLab and Confluence connections. Candidate and report paths use straight lines; rule input and dispatch use distinct ports.

![Delivery architecture](zh-CN/architecture/preview.png)

## PO / DEV / QA workflow

Shows input-to-output handoffs, approved shared cases, technical design, Implement-scoped TDD, QA execution, formal dual Gates and final approval. Case changes return to authorized Implement work. Preparation workflows precede the five-node role delivery DAG; Reviewer/Collector runs belong to Verify. Verified Handoff does not automatically mark Done or publish to production.

![PO / DEV / QA workflow](zh-CN/po-dev-qa/preview.png)

## Validation and updates

Both diagrams passed 9/9 showcase checks. Containment passed at 1440×900, 1600×1000, 1920×1080 and 2048×1320; light/dark screenshots at the smallest and largest sizes were inspected. Receipts bind the included source, HTML and preview hashes. Full capture sets are not included.

The source uses Archify 2.16. The workflow uses a [layout patch](zh-CN/po-dev-qa/renderer-layout.patch) in a private copy of that renderer to enlarge the fixed grid/fonts and expose approval tags in the default view; validation rules are unchanged. Apply it with `git apply --unidiff-zero <patch-path>` from the private Archify copy before reproducing the workflow. The architecture uses the unmodified renderer. Neither renderer is an installation dependency of aidlc-agents.

When updating a diagram, check current method sources, validate/deliver the revised specification, inspect its actual light/dark rendering, then refresh the HTML, preview and receipt together. Keep local paths, credentials, temporary files and superseded candidates out of this directory.
