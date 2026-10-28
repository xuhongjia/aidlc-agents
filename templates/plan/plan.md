# Delivery Plan

AIDLC_DRAFT — executable slices from approved Spec, architecture and quality design.

## Approved inputs

Review versions/hashes, decisions, permissions and dependencies. Block nonexecutable scope.

## Implementation tasks and verification

| Task ID | Requirement/AC | Approved Oracle | Source/test paths and scope | Dependencies | Completion criteria/checks | Rollback |
|---|---|---|---|---|---|---|

Use independently acceptable behavior slices: smallest end-to-end path first, not technical-layer batches. Preserve user edits; unsupported dates/resources are assumptions. Blocking decisions stay pending. Plan designs tests; only Implement executes TDD.

## Dependencies and parallel ownership

| Task ID | Prerequisite IDs | Exclusive writes | Read paths | Shared resources/locks | Parallel group | Integration checks |
|---|---|---|---|---|---|---|

Require an acyclic graph, completed prerequisites and no read/write/shared-resource conflicts. Name sole writers for interfaces/config/lockfiles and integration checks. Parent dispatches; child consolidates. Default maximum two live workers; run sequentially without slots/benefit, not one Agent per Task automatically.

## Implementation authority

Allowed/prohibited paths, commands and separately authorized actions. Approval covers agreed local implementation, not dependency installation, migration, external writes, push or deployment.

## Candidate and check scope

Inventory delivery source, tests, config, manifests and required build inputs; do not exclude relevant files to distort checks.

## Risk and acceptance route

Executable checks, human verification, risks and failure return stages.
