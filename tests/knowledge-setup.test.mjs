import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { knowledgeSetup } from './support/knowledge-setup-model.mjs';
const config = () => ({ unknown_team_field: true, model: 'unchanged', knowledge: { targets: [], custom: 'keep' }, knowledge_publish: null });
const target = () => ({ id: 'synthetic-wiki', provider: 'confluence_cloud', transport: 'twg_cli',
  site: 'https://example.atlassian.net', space_id: 'synthetic-space', parent_page_id: 'synthetic-parent', types: ['lesson'] });
const ready = { purpose: 'setup', requested: true, cli: 'present', authenticated: true, read_verified: true };

test('setup contract: ordinary setup/update/delivery/hook never install or log in', () => {
  for (const purpose of ['update', 'delivery', 'hook', 'method-setup']) {
    const original = config(), result = knowledgeSetup(original, target(), { purpose, requested: true, install_authorized: true });
    assert.deepEqual(result.actions, []); assert.deepEqual(result.config, original);
  }
  assert.deepEqual(knowledgeSetup(config(), target(), { purpose: 'setup', requested: false }).actions, []);
});
test('setup contract: install is explicit; executable, authentication and target access are separate', () => {
  assert.deepEqual(knowledgeSetup(config(), target(), { purpose: 'setup', requested: true }).actions, []);
  assert.deepEqual(knowledgeSetup(config(), target(), { purpose: 'setup', requested: true, install_authorized: true }).actions, ['install_twg']);
  assert.equal(knowledgeSetup(config(), target(), { ...ready, authenticated: false }).status, 'pending_auth');
  assert.equal(knowledgeSetup(config(), target(), { ...ready, read_verified: false }).status, 'pending_target');
  assert.deepEqual(knowledgeSetup(config(), target(), { ...ready, cli: 'error', install_authorized: true }).actions, []);
});
test('setup contract: verified target merges idempotently without publication authority or losing extensions', () => {
  const original = config(), result = knowledgeSetup(original, target(), ready);
  assert.equal(result.status, 'configured');
  assert.deepEqual(original.knowledge.targets, []);
  assert.equal(result.config.knowledge.custom, 'keep'); assert.equal(result.config.unknown_team_field, true);
  assert.equal(result.config.knowledge_publish, null); assert.equal(result.config.model, original.model);
  assert.deepEqual(knowledgeSetup(result.config, target(), ready).config, result.config);
  assert.equal(knowledgeSetup(result.config, { ...target(), parent_page_id: 'other' }, ready).status, 'conflict');
  assert.throws(() => knowledgeSetup(config(), { ...target(), site: 'https://user:secret@example.atlassian.net' }, ready), /site/);
});
test('package onboarding and adapter expose bounded TWG setup and OCC instead of ambient writes', () => {
  const read = name => readFileSync(new URL('../' + name, import.meta.url), 'utf8');
  assert.ok(read('bootstrap/knowledge.md').includes('curl -fsSL --retry 2 https://teamwork-graph.atlassian.com/cli/install | bash'));
  assert.ok(read('bootstrap/knowledge.md').includes('pipefail'));
  assert.ok(read('bootstrap/knowledge.md').includes('twg login'));
  assert.ok(read('adapters/knowledge/confluence-cloud.md').includes('--snapshot-token'));
  assert.ok(read('adapters/knowledge/confluence-cloud.md').includes('--body-file'));
  assert.ok(read('skills/aidlc-knowledge-sync/SKILL.md').includes('workflow/knowledge-publish.md'));
});
