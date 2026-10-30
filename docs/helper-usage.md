# Fixed JSON helper entry

Run the frozen `helpers/check.mjs` entry with Node. Do not read helper source into the agent context, generate an inline program, or rebuild an equivalent check on each invocation. The entry imports the existing read-only helpers and accepts data through a hashed JSON file.

```text
node <frozen>/helpers/check.mjs PROJECT_ROOT REQUEST_RELATIVE_PATH
node <frozen>/helpers/check.mjs PROJECT_ROOT REQUEST_RELATIVE_PATH --full
```

`PROJECT_ROOT` must be the canonical project directory, without symlink aliases. All request and reference paths are relative to it: no absolute paths, backslashes, empty segments, `.` or `..`. Symlink files and directories are refused. The entry reads complete bytes and verifies SHA-256 before parsing referenced JSON; it does not write files, spawn processes, run commands, use a network or authenticate identities.

The request has exactly these fields:

```json
{
  "schema_version": 1,
  "operation": "usage",
  "args_ref": {
    "path": "work/helper-args.json",
    "sha256": "<SHA-256 of the complete parameter-file bytes>"
  }
}
```

The host creates the parameter file, computes its digest, and supplies the request. For this example the parameter file is `{"receipts": []}`. Empty receipts yield `unavailable`, with `null` totals and `false` availability flags; they do not claim measured zero.

| Operation | Parameter-file object | Existing helper |
| --- | --- | --- |
| `validate` | `{request}` | `validateWork(root, request)`; request operation is `validate` or `verify-preflight` |
| `prepare` | `{policy, assignment, request, host, catalog, assessment, assets, receipts?, pending?}` | `prepareExecution` |
| `usage` | `{receipts}` | `summarizeUsage` |
| `budget` | `{policy, receipts, pending?}` | `checkBudget` |
| `cards` | `{catalog, assessment, assets}` | `selectReviewCards` |
| `findings` | `{findings, context}` | `validateFindings` |
| `reconcile` | `{plan, receipt, expected}` | `reconcileExecution` |
| `verify-plan` | `{preflight, ids}` | `verificationPlan` |
| `metrics` | `{request: {work_id, ledger_ref, measurement_ref}}` | `measureWork`; both file references use `{path, sha256}`; see [measurement](measurement.md) |
| `summary` | `{result_ref: {path, sha256}}` | Verify and summarize a previously stored full result; no original helper rerun |

Request/reference keys and operation parameter keys are closed: unknown keys, operations, missing fields and wrong container types fail. Nested domain data keeps the existing helpers' validation contracts. A validation request has `schema_version`, `operation`, `dispatch_ref` and optional `invocation_id`/`host_receipt_ref`. Parameters are data, never executable code. A parameter digest binds the supplied data; it does not prove that a policy, receipt, finding or approval came from an authorized source.

## Compact output and complete results

Default stdout is one JSON object, at most **2,048 UTF-8 bytes including the final newline**. It includes status, relevant counts, execution tier/model when available, bounded blocker/warning samples, exact omitted counts, and the full-result digest. Blockers from a preparation decision and its budget remain counted. Long strings are visibly truncated with `…`. Inspect the full result whenever samples are omitted or truncated. `grants_approval` and `gate_pass_evaluated` are always `false`.

`--full` emits the complete helper result in a versioned envelope, retaining result arrays without sampling. The envelope includes `operation`, `args_ref`, `status`, `result`, `result_sha256` and the two authority flags. `result_sha256` hashes the UTF-8 bytes of `JSON.stringify(result)`. The compact `full_result_sha256` hashes the exact full stdout, including its newline. The host may redirect full stdout to a file and retain the exit status; the helper itself never persists it.

To avoid rerunning an expensive validation just to change its display, invoke `--full` once, save its output through the host, and supply a `summary` request whose parameter file contains that saved file's reference and hash. The entry verifies the complete saved bytes, result digest, envelope shape and status consistency. Its compact output sets `from_stored_result: true` and `full_result_sha256` to the saved file's byte digest. `summary --full` returns the original envelope. Malformed requests produce a small blocked diagnostic rather than a result envelope.

**A stored summary is a historical display, not a current preflight.** It does not reread parameters, candidate files, approvals, evidence or host receipts; it does not refresh eligibility or an attestation's age. Fresh host/protocol checks remain required before acting on a plan. Hash verification and structural validity never grant Gate PASS, approval, identity, permission, model provenance or proof of native execution.

Exit code is `0` for a completed nonblocked result, including explicitly unavailable usage; it is `1` for blocked, incomplete assessment, failed or malformed input. Always check the status and exit code before continuing. A failed operation still has a full result when its request and parameters were valid enough to invoke the helper. JSON parse errors never quote the source text.
