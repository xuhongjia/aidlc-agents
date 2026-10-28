# Fitness and CI: engineering Gates without an installer

The host orchestrates; **existing project tools** execute language-appropriate architecture/build/test/static checks. No universal Python Gate service exists; LLM judgment is not an exit code.

## Rule contract

Every profile follows [dual Gates](../workflow/gates.md). Standard Architect/QE produce fitness JSON/explanations; enhance/fix define both in change.md, reusing rules or having role leaves design checks for Implement to build. Human inspection cannot replace Gates. Each check needs:

| Field | Meaning |
|---|---|
| id / kind / version | Stable rule ID, architecture/quality, version |
| source | Source Spec, ADR, AC/NFR constraint |
| mode | blocking or explicitly advisory; mandatory checks cannot all become advisory |
| argv or native project job | Complete reviewable invocation, cwd, prerequisites, side effects |
| expected | Evaluation method, test counts/skip policy, thresholds, success/failure signals |
| scope | Files, services, contracts, and environments; an empty scope cannot pass |
| timeout / evidence | Time limit, raw result files, candidate and rule identity |

Empty checks mean **unconfigured**. JSON transfers data; native tools execute/evaluate it. This package has no generic JSON execution engine.

## Local procedure

1. Approve standard Spec/Pack or short-route change.md acceptance/check baseline. Declare commands without hidden installs/deletion/deployment. Build missing checks: at least one relevant executable blocking check per Gate.
2. Freeze the candidate file set and digests after implementation; independently compare the test Oracle with the approved design.
3. Parent separately dispatches Reviewers for approved commands/real CI. Retain stdout/stderr, exit codes, reports, counts/skips/time. Collector checks provenance/AC/TDD; parent authenticates evidence. Unexecuted stays NOT_RUN/UNKNOWN.
4. Compare the candidate before and after execution; changes invalidate results. Check real evidence for every AC, not just overall process exit 0.
5. Save architecture-gate.json / quality-gate.json and raw evidence, then process the review card under the approval policy. Unavailable integration/performance/manual acceptance stays blocked or unverified; never invent production results.

Parallel Reviewers require the same frozen candidate/rules and isolated writable reports/files/databases/ports; otherwise serialize. After required checks, collector assembles AC results and parent verifies before human review. No development writes during Gates. See [orchestration](../workflow/orchestration.md).

## Enforce Gates in business-repository CI

[Configure/authenticate](../bootstrap/pipelines.md) read-only GitLab to reuse valid checks. local/ci/hybrid requires independent verification of candidate, rules/effective config, latest job attempt, nonzero checks, and full reports. Missing reports/Gates or remote failure cannot become local PASS. CD also needs runtime identity/smoke/health; see [usage](ci-cd-validation.md). Waiting releases slots; recovery preserves executor provenance without fabricated local exit codes.

Platform/project owners must separately approve and configure the following; package setup does not change them:

- Run Architecture and Quality checks using protected rule versions and pipeline definitions. PRs cannot remove required checks or weaken rules.
- Run real checks for each commit, bound to the candidate commit/artifact and Spec/Pack versions. An AI-written `PASS` file in a workspace cannot authorize merging.
- Block on failure, no execution, zero tests, all skipped, empty scope, timeout, or missing reports. Define report evaluation for each tool.
- Platform required status checks / branch protection enforce Gates; MR/PR approvals and protected environments enforce identity and authorization. Agent-written approval JSON is a record, not a platform approval.
- Apply least privilege and isolated execution; never expose production secrets to untrusted PRs. Store full output as controlled artifacts to avoid leaking source code, customer data, or credentials.
- Deployment is a separate job and approval action, bound to immutable artifacts, rollback, and observations. A Release document does not authorize deployment.

Validation under repository-root `.github/workflows/` serves **the aidlc-agents package itself**. It is not a business-project quality Gate ready to copy unchanged.

## Limits of automation

Humans still assess check relevance, Oracle correctness, uncovered boundaries, and real manual observations. Waivers need owner, expiry, candidate scope, and platform enforcement. Deleting/downgrading rules is not approval.
