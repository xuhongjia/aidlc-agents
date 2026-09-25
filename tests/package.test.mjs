// Maintainer-only content tests. No installer, orchestration or approval runtime.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, lstatSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = relative => readFileSync(path.join(root, relative), 'utf8');
const json = relative => JSON.parse(read(relative));
const manifest = json('manifest.json');
const catalog = json('workflow/stages.json');
const stages = catalog.stages;
const profiles = catalog.profiles;
const ids = ['intake', 'spec', 'architecture', 'quality', 'plan', 'implement', 'verify', 'release', 'learn'];
function files(directory = root) {
  return readdirSync(directory, { withFileTypes: true })
    .filter(item => !['.git', 'node_modules', '.DS_Store'].includes(item.name))
    .flatMap(item => {
      const name = path.join(directory, item.name);
      assert.ok(!lstatSync(name).isSymbolicLink(), `Package contains a symlink: ${name}`);
      return item.isDirectory() ? files(name) : [name];
    });
}
const all = files();

test('manifest describes an instruction-only payload and all declared entrypoints exist', () => {
  assert.equal(manifest.name, 'aidlc-agents');
  assert.equal(manifest.runtime, 'none');
  assert.equal(manifest.repository, 'https://github.com/xuhongjia/aidlc-agents');
  for (const name of [...manifest.payload_directories, ...manifest.payload_files,
    manifest.bootstrap, manifest.update, manifest.preflight, manifest.entrypoint, manifest.protocol, manifest.orchestration, manifest.stage_catalog]) {
    assert.ok(!path.isAbsolute(name) && !name.split('/').includes('..'));
    assert.ok(existsSync(path.join(root, name)), `Missing payload: ${name}`);
  }
  assert.ok(!all.some(file => /\.(py|pyc|pyo|exe|sh|ps1)$/.test(file)), 'No executable installer/runtime');
});

test('each profile has its own ordered approval chain and implementation authority', () => {
  assert.equal(catalog.schema_version, 3);
  assert.equal(catalog.default_profile, 'auto');
  assert.deepEqual(Object.keys(profiles).sort(), ['enhance', 'fix', 'standard']);
  assert.deepEqual(profiles.standard.stages, ids);
  assert.deepEqual(profiles.enhance.stages, ['scope', 'implement', 'verify']);
  assert.deepEqual(profiles.fix.stages, ['diagnose', 'implement', 'verify']);
  for (const profile of Object.values(profiles)) {
    assert.equal(new Set(profile.stages).size, profile.stages.length, 'No cycles or duplicate stages');
    assert.ok(profile.stages.every(id => stages.some(stage => stage.id === id)));
    assert.equal(profile.stages.at(-1), profile.terminal_stage);
    assert.equal(profile.stages[profile.stages.indexOf('implement') - 1], profile.implementation_authority);
  }
  for (const stage of stages) {
    assert.ok(!Object.hasOwn(stage, 'requires_approved'), 'No global dependency contradicting short profiles');
    assert.equal(new Set(stage.parallel_lanes).size, stage.parallel_lanes.length);
    assert.ok(stage.parallel_lanes.length > 0);
  }
  assert.deepEqual(stages.find(s => s.id === 'verify').parallel_lanes, ['architecture-gate', 'quality-gate']);
});

test('execution contract requires fresh children and agrees with install configuration', () => {
  const execution = json('workflow/stages.json').execution;
  const config = json('templates/setup/config.json');
  assert.equal(config.schema_version, 2);
  assert.equal(config.profile, 'auto');
  assert.equal(execution.mode, 'isolated-subagents');
  assert.equal(execution.context_policy, 'fresh-minimal');
  assert.equal(execution.coordinator, 'parent');
  assert.equal(execution.inline_fallback, false);
  assert.equal(execution.new_agent_per_stage, true);
  for (const key of ['mode', 'context_policy', 'max_parallel_workers']) {
    assert.equal(execution[key], config.execution[key]);
  }
  assert.equal(execution.max_parallel_workers, 2);
  assert.deepEqual(config.execution.capabilities, {spawn: null, isolated_context: null, collect_results: null});
  assert.equal(config.execution.probe, null, 'Never preclaim host support');
  for (const key of ['dispatch_template', 'result_template']) {
    assert.ok(existsSync(path.join(root, execution[key])));
  }
});

test('workflow preflight is reachable from every tool without pre-authorizing updates or business approvals', () => {
  const config = json('templates/setup/config.json');
  assert.equal(config.update_policy.authorization, null, 'Setup must record real authorization');
  assert.equal(config.update_policy.mode, 'before_new_work');
  assert.equal(config.update_policy.ref, 'refs/heads/main');
  assert.ok(read(manifest.entrypoint).includes(`.aidlc/system/${manifest.preflight}`));
  for (const adapter of ['codex.md', 'claude-code.md', 'cursor.mdc', 'github-copilot.md']) {
    assert.ok(read(`adapters/${adapter}`).includes(`.aidlc/system/${manifest.preflight}`));
  }
  assert.equal(json('templates/work/state.json').approval_mode, 'manual');
  assert.equal(json('templates/work/approval.json').decision, null);
});

test('run and review templates preserve identity, constrained writes and non-approval returns', () => {
  const dispatch = json('templates/work/dispatch.json');
  const result = json('templates/work/stage-result.json');
  const state = json('templates/work/state.json');
  for (const key of ['work_id', 'profile', 'stage', 'run_id']) {
    assert.equal(dispatch[key], null);
    assert.equal(result[key], null);
  }
  assert.equal(dispatch.kind, 'stage');
  assert.equal(dispatch.context_policy, 'fresh-minimal');
  for (const key of ['input_refs', 'read_scope', 'write_scope', 'expected_outputs', 'approved_commands']) {
    assert.deepEqual(dispatch[key], [], `No implicit scope or authority: ${key}`);
  }
  assert.equal(dispatch.result_path, null);
  assert.equal(result.dispatch_digest, null);
  assert.equal(result.status, 'blocked');
  assert.ok(result.blockers.length > 0);
  for (const key of ['artifacts', 'evidence', 'checks', 'parallel_requests']) assert.deepEqual(result[key], []);
  assert.ok(!Object.hasOwn(result, 'approval'));
  assert.equal(state.execution_mode, 'isolated-subagents');
  assert.equal(state.profile, null, 'No fabricated route assessment');
  assert.deepEqual(state.route_history, []);
  assert.equal(json('templates/work/review.json').profile, null);
  assert.equal(json('templates/work/approval.json').profile, null);
  assert.deepEqual(state.active_runs, []);
  assert.deepEqual(state.run_history, []);
  assert.deepEqual(json('templates/work/review.json').execution, []);
});

test('stage catalog resolves roles, prompts, skills and every required template', () => {
  assert.deepEqual(stages.map(stage => stage.id), [...ids, 'scope', 'diagnose']);
  assert.deepEqual(stages.filter(stage => stage.product_write).map(stage => stage.id), ['implement']);
  for (const stage of stages) {
    assert.ok(existsSync(path.join(root, `agents/${stage.agent}.md`)));
    assert.ok(existsSync(path.join(root, stage.prompt)));
    assert.ok(existsSync(path.join(root, stage.skill ?? `skills/aidlc-${stage.id}/SKILL.md`)));
    assert.ok(stage.outputs.length > 0);
    for (const output of stage.outputs) {
      assert.equal(path.basename(output), output);
      assert.ok(existsSync(path.join(root, stage.template_directory ?? `templates/${stage.id}`, output)), `Missing ${stage.id}/${output}`);
    }
  }
});

test('compact profiles resolve to two human document types with no mandatory legacy packs', () => {
  for (const name of ['enhance', 'fix']) {
    const profile = profiles[name];
    const outputs = profile.stages.flatMap(id => {
      const stage = stages.find(s => s.id === id);
      return profile.output_overrides[id] ?? stage.outputs.map(name => ({name, template: `${stage.template_directory ?? `templates/${id}`}/${name}`}));
    });
    assert.deepEqual([...new Set(outputs.map(o => o.name))].sort(), ['change.md', 'verification.md']);
    assert.equal(outputs.length, 3, 'Only one human-facing output per stage');
    for (const output of outputs) {
      assert.equal(path.basename(output.name), output.name);
      assert.ok(existsSync(path.join(root, output.template)));
      assert.ok(!path.isAbsolute(output.template) && !output.template.split('/').includes('..'));
    }
    assert.equal(profile.terminal_stage, 'verify');
    assert.equal(profile.artifact_mode, 'compact');
  }
  assert.deepEqual(profiles.standard.output_overrides, {}, 'Preserve full-flow artifact compatibility');
});

test('approver resolution preserves precedence, unknown identity and separate actual decisions', () => {
  const rule = catalog.approver_resolution;
  assert.deepEqual(rule.precedence, ['jira_assignee', 'git_config', 'system_login']);
  assert.equal(rule.refresh_before_approval, true);
  assert.equal(rule.missing_email, null);
  const identity = json(rule.template);
  assert.equal(identity.status, 'pending');
  for (const key of ['source', 'source_ref', 'account_id', 'display_name', 'email', 'resolved_at']) {
    assert.equal(identity[key], null, `No fabricated identity: ${key}`);
  }
  assert.deepEqual(identity.resolution_notes, []);
  for (const name of ['state', 'review', 'approval', 'approval-policy']) {
    assert.equal(json(`templates/work/${name}.json`).approver, null);
  }
  const approval = json('templates/work/approval.json');
  for (const key of ['by', 'decision', 'user_statement', 'decision_source', 'delegation_ref']) {
    assert.equal(approval[key], null, `Resolving a name cannot preapprove: ${key}`);
  }
  assert.equal(json('templates/work/state.json').jira_issue, null, 'No guessed Jira issue');
});

test('every built-in delivery route requires both executable Gates independently of compact document overrides', () => {
  const gates = catalog.gates;
  assert.deepEqual([...gates.required_profiles].sort(), Object.keys(profiles).sort());
  assert.equal(gates.required_stage, 'verify');
  assert.equal(gates.minimum_blocking_checks_per_kind, 1);
  assert.equal(gates.on_missing, 'define_then_implement');
  assert.equal(gates.allow_manual_substitute, false);
  assert.ok(existsSync(path.join(root, gates.design_prompt)));
  assert.deepEqual(gates.required_evidence.map(item => item.kind).sort(), ['architecture', 'quality']);
  assert.equal(new Set(gates.required_evidence.map(item => item.name)).size, 2);
  for (const item of gates.required_evidence) {
    assert.equal(path.basename(item.name), item.name);
    const report = json(item.template);
    assert.equal(report.kind, null);
    assert.equal(report.status, 'NOT_RUN');
    assert.deepEqual(report.checks, []);
    assert.deepEqual(report.baseline_refs, []);
    assert.deepEqual(report.candidate, {scope: [], files: []});
    assert.ok(report.blockers.length > 0, 'Empty report must not claim PASS');
  }
  for (const profile of Object.values(profiles)) {
    assert.ok(profile.stages.includes(gates.required_stage));
    assert.ok(!Object.hasOwn(profile, 'gates'), 'No profile-specific Gate opt-out');
  }
  assert.deepEqual(json('templates/work/dispatch.json').required_evidence, []);
});

test('built-in automatic approval is opt-in, work-scoped, attributable and limited to compact routes', () => {
  const state = json('templates/work/state.json');
  const approval = json('templates/work/approval.json');
  const options = catalog.approval;
  const policy = json(options.auto_low_risk.policy_template);
  assert.equal(options.default_mode, 'manual');
  assert.equal(state.approval_mode, 'manual');
  assert.equal(state.approval_policy_ref, null);
  assert.deepEqual(state.approval_policy_history, []);
  assert.equal(approval.approval_mode, 'manual');
  assert.equal(approval.policy_ref, null);
  assert.deepEqual(approval.decision_checks, []);
  assert.equal(approval.user_statement, null);
  assert.equal(approval.next_stage_authorized, false);
  assert.deepEqual(options.auto_low_risk.profiles.sort(), ['enhance', 'fix']);
  const actualStages = new Set(options.auto_low_risk.profiles.flatMap(name => profiles[name].stages));
  assert.deepEqual(new Set(options.auto_low_risk.stages), actualStages);
  assert.ok(!options.auto_low_risk.stages.includes('release'));
  assert.ok(!options.auto_low_risk.stages.includes('learn'));
  for (const key of ['policy_id', 'work_id', 'profile', 'method_revision', 'request_sha256']) {
    assert.equal(policy[key], null, `No pre-authorized ${key}`);
  }
  assert.equal(policy.mode, 'auto_low_risk');
  assert.equal(policy.auto_continue, false);
  assert.deepEqual(policy.allowed_write_paths, []);
  assert.deepEqual(policy.allowed_commands, []);
  assert.deepEqual(policy.additional_stop_conditions, []);
  assert.deepEqual(policy.authorization, {by: null, at: null, source: null, user_statement: null, card_ref: null});
});

test('all JSON artifacts parse, templates start without fabricated approvals or PASS results', () => {
  for (const file of all.filter(file => file.endsWith('.json'))) JSON.parse(readFileSync(file, 'utf8'));
  assert.equal(json('templates/work/state.json').current_stage, null, 'First stage must be resolved from selected profile');
  assert.equal(json('templates/work/state.json').status, 'ready');
  assert.equal(json('templates/work/approval.json').decision, null);
  assert.equal(json('templates/work/approval.json').review_digest, null);
  assert.equal(json('templates/work/handoff.json').status, 'blocked');
  assert.deepEqual(json('templates/spec/acceptance.json').criteria, []);
  assert.deepEqual(json('templates/quality/coverage.json').criteria, []);
  assert.deepEqual(json('templates/verify/acceptance-results.json').criteria, []);
  assert.deepEqual(json('templates/architecture/architecture-fitness.json').checks, []);
  assert.deepEqual(json('templates/quality/quality-fitness.json').checks, []);
  assert.equal(json('templates/learn/outcome.json').result, 'inconclusive');
  assert.equal(Object.hasOwn(json('templates/work/review.json'), 'digest'), false, 'No self-referential manifest hash');
});

test('eighteen unique skills have valid discovery metadata', () => {
  const skillFiles = all.filter(file => path.basename(file) === 'SKILL.md');
  assert.equal(skillFiles.length, 18);
  const names = new Set();
  for (const file of skillFiles) {
    const text = readFileSync(file, 'utf8');
    const header = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
    assert.ok(header, `Missing frontmatter ${file}`);
    const name = header.match(/^name:\s*(.+)$/m)?.[1].trim();
    assert.match(name, /^[a-z0-9][a-z0-9-]{0,63}$/);
    assert.equal(name, path.basename(path.dirname(file)));
    assert.ok(!names.has(name));
    names.add(name);
    assert.ok(header.match(/^description:\s*\S.+$/m), `Missing description ${file}`);
  }
});

test('Markdown links and canonical installed-path references resolve', () => {
  for (const file of all.filter(file => /\.(md|mdc)$/.test(file))) {
    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      let reference = match[1].replace(/^<|>$/g, '');
      if (/^(?:https?:|mailto:|#)/.test(reference)) continue;
      reference = decodeURIComponent(reference.split('#')[0]);
      if (!reference) continue;
      assert.ok(existsSync(path.resolve(path.dirname(file), reference)), `${file} -> ${reference}`);
    }
    for (const match of text.matchAll(/\.aidlc\/system\/([a-z0-9_/-]+\.(?:md|json))/g)) {
      assert.ok(existsSync(path.join(root, match[1])), `${file} -> ${match[1]}`);
    }
  }
});

test('tool bridges have one managed block and Cursor has native frontmatter', () => {
  for (const file of ['codex.md', 'claude-code.md', 'cursor.mdc', 'github-copilot.md']) {
    const content = read(`adapters/${file}`);
    assert.equal(content.split('<!-- AIDLC-AGENTS:START -->').length, 2);
    assert.equal(content.split('<!-- AIDLC-AGENTS:END -->').length, 2);
    assert.ok(content.indexOf('<!-- AIDLC-AGENTS:START -->') < content.indexOf('<!-- AIDLC-AGENTS:END -->'));
    assert.ok(content.includes('.aidlc/system/skills/aidlc/SKILL.md'));
    assert.ok(content.includes('.aidlc/system/workflow/protocol.md'));
  }
  assert.match(read('adapters/cursor.mdc'), /^---\r?\n[\s\S]*?alwaysApply:\s*true[\s\S]*?\r?\n---/);
});

test('publishable payload contains no machine-specific paths, internal hostnames, or legacy CLI commands', () => {
  const payload = all.filter(file => !file.includes(`${path.sep}tests${path.sep}`));
  for (const file of payload) {
    const content = readFileSync(file, 'utf8');
    assert.doesNotMatch(content, /\/Users\/|OneDrive-[^/\s]+|https?:\/\/[^/\s]+\.(?:internal|corp|local)(?=[/:\s]|$)|\.aidlc-kit|aidlc\.py|codex exec/,
      `Unexpected private/legacy content: ${file}`);
  }
});

test('maintainer CI uses read-only permissions and pinned action identities', () => {
  const workflow = read('.github/workflows/validate-content.yml');
  const actions = [...workflow.matchAll(/uses:\s*([^\s@]+)@([^\s]+)/g)];
  assert.equal(actions.length, 2);
  for (const action of actions) assert.match(action[2], /^[a-f0-9]{40}$/);
  assert.match(workflow, /contents:\s*read/);
  assert.match(workflow, /persist-credentials:\s*false/);
  assert.doesNotMatch(workflow, /pull_request_target|write-all|secrets\./);
});

test('knowledge hooks are discoverable without adding a stage, implicit grant or managed project storage', () => {
  const knowledge=catalog.knowledge;
  for (const field of ['protocol','hook_skill','dispatch_template']) assert.ok(existsSync(path.join(root,knowledge[field])));
  assert.deepEqual(knowledge.read_stages,['intake','scope','diagnose']);
  assert.deepEqual(knowledge.prepare_stages,['verify','learn']);
  assert.deepEqual(json('templates/setup/config.json').knowledge,{targets:[]});
  for (const file of ['approval','approval-policy']) assert.equal(json(`templates/work/${file}.json`).knowledge_publish,null);
  assert.deepEqual(json('templates/work/review.json').knowledge_refs,[]);
  const dispatch=json('templates/knowledge/dispatch.json');
  assert.equal(dispatch.kind,'hook'); assert.equal(dispatch.max_write_attempts_per_target,1);
  assert.equal(dispatch.authorization_ledger_path,'.aidlc/knowledge/authorizations');
  assert.deepEqual(dispatch.targets,[]); assert.equal(dispatch.authorization_ref,null);
  assert.deepEqual(json('templates/knowledge/publish-scope.json').snapshot_refs,[]);
  assert.equal(json('templates/knowledge/receipt.json').status,'pending');
  assert.equal(knowledge.default_publish_authorization,null);
  assert.ok(!manifest.payload_directories.includes('rehearsal'));
  for (const id of [...knowledge.read_stages,...knowledge.prepare_stages]) assert.ok(read(`prompts/${id}.md`).includes('workflow/knowledge.md'));
  assert.ok(read(manifest.entrypoint).includes('workflow/knowledge.md'));
});

test('composable workflow entrypoints and blank templates preserve locked identities and default-deny grants', () => {
  const composition=catalog.composition, config=json('templates/setup/config.json');
  for (const key of ['protocol','scheduler','stage_contracts','skill','dispatch_prompt','lock_template']) {
    assert.ok(existsSync(path.join(root,composition[key])));
  }
  assert.equal(composition.contract_version,1);
  assert.equal(config.workflow,'auto');
  assert.deepEqual(config.team,{manifest:null,source:null,authorization:null});
  assert.equal(config.project_overrides,null);
  const state=json('templates/work/state.json');
  assert.equal(state.schema_version,4); assert.deepEqual(state.nodes,{}); assert.deepEqual(state.branch_decisions,[]);
  for (const file of ['state','dispatch','stage-result','review','approval','approval-policy']) {
    assert.equal(json(`templates/work/${file}.json`).workflow_ref,null);
  }
  for (const file of ['dispatch','stage-result','review','approval']) {
    assert.equal(json(`templates/work/${file}.json`).step_id,null);
  }
  assert.deepEqual(json('templates/work/approval.json').authorized_steps,[]);
  assert.deepEqual(json('templates/work/approval-policy.json').allowed_steps,[]);
  assert.deepEqual(json('templates/work/approval-policy.json').allowed_tool_bindings,[]);
  const lock=json(composition.lock_template);
  assert.equal(lock.workflow,null); assert.deepEqual(lock.assets,[]); assert.ok(!Object.hasOwn(lock,'digest'));
  assert.equal(json('templates/extensions/stage.json').auto_eligible,false);
  assert.equal(json('templates/extensions/tool-binding.json').authorization_ref,null);
  assert.ok(manifest.payload_directories.includes('examples'));
  assert.ok(!manifest.payload_directories.includes('tests'));
});

test('builtin semantic metadata and example resource references resolve without escaping their pack', () => {
  const metadata=json(catalog.composition.stage_contracts);
  assert.deepEqual(Object.keys(metadata.stages).sort(),stages.map(s=>s.id).sort());
  for (const stage of stages) {
    assert.deepEqual(Object.keys(metadata.stages[stage.id].contracts).sort(),[...stage.outputs].sort());
  }
  for (const name of ['api-team','design-team']) {
    const packRoot=path.join(root,'examples/team-packs',name), pack=json(`examples/team-packs/${name}/pack.json`);
    const definitions=[...pack.stages,...pack.workflows.flatMap(w=>w.nodes.filter(n=>n.outputs))];
    for (const definition of definitions) {
      const refs=[definition.prompt,...(definition.outputs??[]).map(o=>o.template)].filter(Boolean);
      for (const ref of refs) {
        const [namespace,relative]=ref.split(':');
        assert.ok(['core','team'].includes(namespace));
        assert.ok(relative && !path.isAbsolute(relative) && !relative.split('/').includes('..'));
        const base=namespace==='core'?root:packRoot;
        assert.ok(existsSync(path.join(base,relative)),ref);
      }
    }
  }
});
