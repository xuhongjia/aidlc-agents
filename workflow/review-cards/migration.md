# Migration and recovery · v1

Applies to schema/data migrations. Architecture: check approved transition order, old/new compatibility, transaction boundaries, irreversible steps and recovery design. Quality: inspect repeatability, preservation of non-target data, representative-volume checks and rollback/restore evidence required by the approved plan.

Do not run a migration or rollback merely to review it. Read-only review authority does not permit database writes. Missing recovery evidence or untested assumptions remain explicit; approved exceptions retain their original scope. Source: [Gate contract](../gate-execution.md).
