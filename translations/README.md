# Language versions

The [primary repository](../README.md) is English. Installation copies only the primary payload declared in the root manifest.

The [Chinese version](zh-CN/README.md) is an exact snapshot of the working tree immediately before the English conversion, including the existing onboarding guides, categorized Skills, templates, protocols and maintainer tests. Original English files within that tree are preserved too. It is a historical reference, not a second active installation or a continuously synchronized translation.

- Browse the Chinese snapshot in `zh-CN/`; its relative links retain the original layout.
- `zh-CN.snapshot.json` records each saved file's path, byte count and SHA-256. Do not edit or regenerate this snapshot to match later English changes.
- The archive is outside `manifest.payload_directories` and `payload_files`. Do not load its Skills alongside the active English Skills or include it in stage instruction references.
- Existing business work keeps its original locked method and approvals. This source translation does not migrate those records or switch an installed project automatically.
- Future Chinese updates should be separately versioned and reviewed; preserve this original snapshot.

The archive contains no Git history or Git metadata, dependency cache, or operating-system metadata files. Its source is a local working tree, not a claim that the changes were already published to GitHub.
