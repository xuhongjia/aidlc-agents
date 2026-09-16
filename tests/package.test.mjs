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
const stages = json('workflow/stages.json').stages;
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
    manifest.bootstrap, manifest.update, manifest.entrypoint, manifest.protocol, manifest.orchestration, manifest.stage_catalog]) {
    assert.ok(!path.isAbsolute(name) && !name.split('/').includes('..'));
    assert.ok(existsSync(path.join(root, name)), `Missing payload: ${name}`);
  }
  assert.ok(!all.some(file => /\.(py|pyc|pyo|exe|sh|ps1)$/.test(file)), 'No executable installer/runtime');
});

test('formal stages form an approval-ordered DAG without concurrent stage shortcuts', () => {
  const completed = new Set();
  for (const [index, stage] of stages.entries()) {
    assert.deepEqual(stage.requires_approved, index === 0 ? [] : [stages[index - 1].id]);
    for (const dependency of stage.requires_approved) assert.ok(completed.has(dependency));
    assert.equal(new Set(stage.parallel_lanes).size, stage.parallel_lanes.length);
    assert.ok(stage.parallel_lanes.length > 0);
    completed.add(stage.id);
  }
  assert.deepEqual(stages.find(s => s.id === 'verify').parallel_lanes, ['architecture-gate', 'quality-gate']);
});

test('execution contract requires fresh children and agrees with install configuration', () => {
  const execution = json('workflow/stages.json').execution;
  const config = json('templates/setup/config.json');
  assert.equal(config.schema_version, 2);
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

test('run and review templates preserve identity, constrained writes and non-approval returns', () => {
  const dispatch = json('templates/work/dispatch.json');
  const result = json('templates/work/stage-result.json');
  const state = json('templates/work/state.json');
  for (const key of ['work_id', 'stage', 'run_id']) {
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
  assert.deepEqual(state.active_runs, []);
  assert.deepEqual(state.run_history, []);
  assert.deepEqual(json('templates/work/review.json').execution, []);
});

test('stage catalog resolves roles, prompts, skills and every required template', () => {
  assert.deepEqual(stages.map(stage => stage.id), ids);
  assert.deepEqual(stages.filter(stage => stage.product_write).map(stage => stage.id), ['implement']);
  for (const stage of stages) {
    assert.ok(existsSync(path.join(root, `agents/${stage.agent}.md`)));
    assert.ok(existsSync(path.join(root, stage.prompt)));
    assert.ok(existsSync(path.join(root, `skills/aidlc-${stage.id}/SKILL.md`)));
    assert.ok(stage.outputs.length > 0);
    for (const output of stage.outputs) {
      assert.equal(path.basename(output), output);
      assert.ok(existsSync(path.join(root, `templates/${stage.id}/${output}`)), `Missing ${stage.id}/${output}`);
    }
  }
});

test('all JSON artifacts parse, templates start without fabricated approvals or PASS results', () => {
  for (const file of all.filter(file => file.endsWith('.json'))) JSON.parse(readFileSync(file, 'utf8'));
  assert.equal(json('templates/work/state.json').current_stage, 'intake');
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

test('fourteen unique skills have valid discovery metadata', () => {
  const skillFiles = all.filter(file => path.basename(file) === 'SKILL.md');
  assert.equal(skillFiles.length, 14);
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
