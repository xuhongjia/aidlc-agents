# Plan · Verifiable vertical slices

Read approved Spec, Architecture and Quality. Start with the smallest end-to-end behavior validating key interfaces, then extend; avoid layer-by-layer batches. Resolve blocking decisions first. Resume from task/approval records, not chat memory.

Each Task links Requirement/AC, Oracle, completion criteria, files/modules, predecessor IDs, verification entrypoint and rollback. Include approved Fitness installation, source revision and target paths. Missing behavior or unresolved decisions block executable tickets.

Parallel ready tasks require completed dependencies and conflict-free writes, interfaces and resources. Assign one writer per resource and final integration validation; serialize shared lockfiles/DB/cache or unstable interfaces. The parent dispatches; sequential slices are default, not one Agent per ticket.

Use plan.md's table; flag dependencies, network, permissions and external writes needing authorization. Check omissions/scope; invent no owners, dates or estimates. Local Task IDs suffice; Plan does not authorize tracker sync.
