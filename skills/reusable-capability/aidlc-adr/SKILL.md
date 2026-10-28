---
name: aidlc-adr
description: Draft delivery-relevant AIDLC architecture decisions, alternatives, consequences and Fitness.
---

# Decision records

Draft only; no architecture approval. Main-session AIDLC requests route through `.aidlc/system/skills/orchestration/aidlc/SKILL.md`; valid children follow `.aidlc/system/prompts/common.md`, never redispatch. Write only run artifacts, not approved ADRs/state/approvals/review; include findings in the stage result to the parent.

- Read relevant Spec/AC and ADRs; record material decisions, referencing existing ones instead of duplicating them.
- Use project format, otherwise title/ID, status, context/constraints, alternatives/tradeoffs, proposal, consequences/risks, verification and sources.
- Explain fit and reassessment conditions. Separate facts, preferences and assumptions; invent no decision-maker or consent.
- Link verifiable properties to proposed Fitness IDs; identify necessary human/experimental validation for others.
- Submit as proposed. Supersession preserves the original ADR, explains impact and requests new approval; never rewrite history.
