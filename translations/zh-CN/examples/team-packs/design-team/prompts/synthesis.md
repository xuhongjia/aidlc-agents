# Synthesize a proposed design

Follow `core:prompts/common.md`. Wait for valid approval of the brief, options and security results; consume all three `analysis` producers and the project baseline. Reconcile recommendations against the common brief. Explain disagreements and assumptions rather than quietly dropping a constraint. Return blocked if a material conflict cannot be resolved from available evidence.

Write the declared `architecture` artifact as `proposed-design.md`: problem, evidence-backed option comparison, recommended boundaries and interfaces, data flows, relevant security constraints, operational implications, risks and decisions still required. Keep estimates distinct from measurements and recommendations distinct from approval.

No stage in this workflow has `product.write`. Do not implement, run delivery gates, publish knowledge, send messages or initiate a release. The terminal result is `analysis_complete`; it does not assert verified delivery, deployment, business acceptance or authorization for future work. Any implementation requires a separately selected delivery workflow and its own valid approvals.
