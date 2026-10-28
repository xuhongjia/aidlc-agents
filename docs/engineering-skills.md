# AIDLC V2.1 · Implement-scoped TDD

V2.1 is the behavior contract introduced in package 0.13.0; these version schemes are separate.

## Usage and stage boundaries

```text
Use aidlc standard to implement this request: …. Follow V2.1: execute
RED→GREEN→REFACTOR by task slice within Implement. Freeze the candidate,
then have two independent Gate Reviewers verify it. After required approvals,
produce an Implementation Verified Handoff without entering Production.
```

fix/enhance default to applicable TDD while retaining three stages and change.md/verification.md. TDD evidence is an attachment. Custom implementation-kind nodes inherit this boundary.

| Stage | Responsibility | Outside its scope |
|---|---|---|
| Spec | FR/NFR, AC, expected behavior, business invariants, boundaries, and validation criteria | TDD execution |
| Architecture | Architecture constraints, API/data contracts, security/dependency boundaries, Architecture Fitness | TDD execution |
| Quality (QE) | Test strategy, Oracle, acceptance-validation rules, Quality Gate, and evidence requirements; may design/approve acceptance test specifications | RED/GREEN/REFACTOR or installing product tests |
| Plan | Split Requirement/AC into independently implementable and verifiable tasks; define completion criteria | TDD execution |
| Implement (Software Engineer) | Write/run real tests, minimal implementation, refactoring, and regression; deliver a frozen candidate and evidence | Approving its own Gates or stage approvals |
| Verify | Parent dispatches two independent Reviewers; a new collector child checks the same candidate, AC, and raw TDD/dual-Gate evidence | Changing code or Oracle, replacing human approval |

Standard ends at **Implementation Verified Handoff** after human Verify approval. Implement ready_for_review/approved means candidate review only. Set state.implementation_verified_handoff after TDD/tests/both Gates/all AC, stable candidate, complete evidence, and approvals pass. Record it in verification.md; no extra document.

Release/Learn are inactive reusable nodes. Select a separate team Workflow ID binding verification→release_readiness→learning, CI/CD, and approvals. Production needs separate authority. Existing requests keep original locks/methods and nine-stage endpoint.

## Reuse decision

[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills/tree/1be8e34187e34647bb83adc3a1323b26ae6f6abe) was evaluated first through read-only access at pinned commit `1be8e34187e34647bb83adc3a1323b26ae6f6abe` on 2026-10-11 under the MIT license. This does not install the whole third-party plugin or read a changing main branch during every work item.

Each adaptation retains its original Skill name; no extra aidlc-tdd/TDD Agent:

| Packaged Skill | Upstream path at the pinned commit | Loading rule |
|---|---|---|
| [test-driven-development](../skills/reusable-capability/test-driven-development/SKILL.md) | skills/test-driven-development/SKILL.md | Default in Implement |
| [incremental-implementation](../skills/reusable-capability/incremental-implementation/SKILL.md) | skills/incremental-implementation/SKILL.md | Default in Implement |
| [debugging-and-error-recovery](../skills/reusable-capability/debugging-and-error-recovery/SKILL.md) | skills/debugging-and-error-recovery/SKILL.md | On demand when a real failure occurs |
| [code-review-and-quality](../skills/reusable-capability/code-review-and-quality/SKILL.md) | skills/code-review-and-quality/SKILL.md | On demand when task/risk requires self-review |

Adaptations preserve test-first, minimal changes, behavior-preserving refactoring, and thin slices, adding explicit AIDLC scope/real RED/candidate/evidence/approvals. Upstream test ratios, browser tools, and auto-commit habits are not mandates. Retain notices/[MIT license](../skills/UPSTREAM-LICENSE.txt).

Load defaults through instruction_refs. Freeze optional paths/digests without text loading; record trigger/evidence in skill_uses when used. Prefer the locked adaptation over same-name external Skills. Reevaluate upstream upgrades for new method/work only; no hot-swaps.

See the [TDD contract](../workflow/tdd.md) for execution details and [independent Gate execution](../workflow/gate-execution.md) for dual Gates. This remains an instruction package, not an authentication, sandbox, or tamper-proof approval service.
