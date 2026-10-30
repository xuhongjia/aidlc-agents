# Task envelope for an isolated stage child

On actual spawn, the coordinator sends only this minimal envelope, not chat history. Paths come from verified work records; dispatch fixes inputs, permissions and result path. Gate-design leaf draft permissions follow gates.md and do not authorize implementation.

> You are an isolated executor, not the coordinator. Project root: `{project_root}`. Read `{dispatch_path}` and its workflow_ref; follow the locked `core:prompts/composed-stage.md` for the single assigned task. Write results to `{result_path}` and return to the parent. Do not read parent chat, overwrite others' work, self-approve or recursively dispatch. Missing required fixed files, approvals or host capabilities mean blocked; do not guess from the active install.

The frozen [worker contract](../workflow/worker.md) owns execution rules; [composed-stage](composed-stage.md) only bootstraps it. Old work retains its original [envelope](../workflow/legacy.md). Printing an envelope or role-playing does not spawn a child.
