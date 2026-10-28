# On-demand context: parent coordinator

New 0.13 work uses dispatch.schema_version=5. Existing work keeps original method/dispatch contracts; never backfill instruction_refs/pipeline_requests/optional_instruction_refs. Freeze fully under extensions; read lists change no graph approval/authority/candidate scope.

## Derivation and dispatch

Lock [context.json](context.json), common/kind/capability/output resources, roles/current Prompt/effective output templates/team instructions and all conditional resources. Include Architect/QE gate-design roles/Prompt, feedback protocols and publication Hook/adapters; never fetch newer runtime versions. Resolve paths through the same frozen asset table, never active system/team files. Freezing all assets does not require reading all.

dispatch.instruction_refs=[{ref,path,sha256,purpose}]: ref is core:/team:/project: identity; path is frozen project-relative asset copy; sha256 hashes raw bytes; purpose identifies common/role/stage/template/capability/kind/team/feedback use. Derive from fully verified locked context contract/StageDefinition; no arbitrary omissions:

- Require common, role, current Prompt and effective node.outputs or stage.outputs templates. Read fixed role names directly from locked definition bytes, role_path=null. Only namespace file refs enter instruction_refs; never guess same-named files.
- Merge by_kind/by_capability/by_output_contract; deduplicate multiple-purpose files. Fully read approved business inputs under bindings.
- implementation defaults to TDD and exactly one test-driven-development/incremental-implementation Skill. Upstream/Verify never read these execution Skills. context.implementation_optional derives optional_instruction_refs=[{id,ref,path,sha256,purpose:"optional-skill"}]; fully freeze/verify without default injection. Read on actual triggers; record result.skill_uses. Other kinds carry no optional execution Skills; team instructions cannot bypass roles.
- Include StageDefinition.instructions extra required core/team/project refs and full mandatory dependency closure of original roles/Prompts. Optional resources require triggers and already-frozen digests.
- Only full implementation with nonzero feedback budget loads feedback-request. Zero budget loads no ledger/correction instructions. Parent reads implementation-feedback only for ledgers.
- Gate design/execution leaves use specific leaf lists/role/Prompt, not full-stage knowledge. Ordinary leaves inherit assigned tasks' semantic capabilities without dropping constraints.
- Gate execution uses context.gate_reviewers[gate_assignment.kind] frozen role/gate-review Prompt, without whole-stage templates/optional execution Skills. Freeze both Reviewer resources/Prompts; collectors keep Verify role/templates. Freeze provenance/licenses without mandatory child reads.
- Derive this step's binding_ids from locked delivery. Add pipeline_execution/corresponding pipeline_adapters only for nonempty IDs with evidence.read. dispatch.pipeline_requests exactly covers that set, including configured CD without extra bindings. Unconfigured CI/CD stays unloaded. Resumption continuation_refs identify actual same-node sources, never replace approved inputs.

Host tools verify complete workflow_ref before returning this node/definition/relevant dependencies/authority/assets. Children independently verify source, read-list completeness, paths/hashes and dispatch/input identity. Parent summaries cannot replace approved baselines. Create no drifting authoritative lock copy; never truncate approved AC/Oracle/team rules.

Unknown kinds/capabilities, missing reads, illegal/symlink paths, changed frozen bytes or mismatched producers/approvals/authority block. After collection parent still checks complete candidates/required checks/raw evidence/failure lineage. Valid read lists grant no stage/Gate pass.

## Output and measurement

Body/chat: differences, conclusions, check counts, failure locations/evidence links. Files: full candidates, stdout/stderr, source-index/receipts. Tool-hash complete bytes; summaries never replace candidate enumeration. Read originals selectively when truncated/insufficient; never infer PASS.

Built-in compact-flow budgets count deduplicated method body bytes/run only. Count templates, business inputs, locks/evidence/host context separately. List extra team rules without omission. Bytes are neither tokens nor billing. Compare identical model/request/initial state; separately record cached/uncached input, output, tool text, images/Agent counts. Long-session totals are not new-flow cost.
