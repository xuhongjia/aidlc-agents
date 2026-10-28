# FIX-001 · manual-approval rehearsal input

Fix “search returns no results but shows total=1” in the isolated task-list CLI repository. Use fix and enter Diagnose only; wait for my approval of the exact review before implementing. Do not approve for me, enable automatic mode, commit, or push.

- FR-1: Searching for an absent term returns items=[] and total=0.
- FR-2: With matches, total equals returned item count; search is case-insensitive.
- NFR-1: Preserve existing behavior/order without search; empty data has total=0.
- NFR-2: domain depends on neither CLI, filesystem/network, nor adapters. If Architecture Gate is missing, an Architect leaf designs it; after approval, Implement installs it and proves a violating negative case fails. Quality Gate must test actual business behavior.

Use only supplied synthetic examples, without company systems. Reproduce with `node src/cli.mjs --file data/tasks.json --search missing`. Keep reproduction failure, pre-fix test failure, post-fix success, and independent Verify evidence separate.
