---
name: aidlc-fitness-check
description: Execute approved Fitness for DEV self-tests or independent Gates, preserving candidate/raw evidence; no approval authority.
---

# Fitness execution

Main-session requests route to .aidlc/system/skills/orchestration/aidlc/SKILL.md; children follow frozen instruction_refs and workflow/gate-execution.md. Leaves execute assigned Gates; collectors only collect. Implement self-tests cannot assume Reviewer identity.

Check approved rule entry/digest, scope, command/cwd, permissions/effects/timeout, threshold and success criteria. Use authorized local tools. CI evidence needs actual job/attempt and complete assertions; invent neither execution/exit codes nor equivalent rules.

Save counts, blocking/advisory results and raw evidence in gate-result. Distinguish business failures from tool faults; neither passes required checks. Retain advisory failures. gate-execution defines candidate before/after checks, PASS and identities; missing evidence/drift blocks. CI enforcement uses project exit codes, thresholds and permissions.
