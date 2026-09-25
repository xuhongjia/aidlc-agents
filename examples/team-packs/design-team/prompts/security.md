# Examine security constraints

Follow `core:prompts/common.md`. Independently inspect the approved brief bound as `analysis` and the authorized project baseline. Identify trust boundaries, authentication and authorization assumptions, data sensitivity, exposure paths, failure handling and controls that future designs must satisfy. Tie each concern to concrete evidence or an explicit unanswered question.

Do not consume unfinished options analysis, access secrets, probe live services, execute exploits, alter security controls or change product files. Write only `security-study.md` under the `analysis` contract. Record restricted or unavailable evidence as a limitation and request the appropriate decision instead of broadening access.

This study is a design input, not security certification, policy approval or a production risk acceptance. Do not assert a control works unless supporting evidence was actually inspected.
