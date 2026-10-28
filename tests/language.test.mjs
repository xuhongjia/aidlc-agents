import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const json = p => JSON.parse(readFileSync(path.join(root, p), 'utf8'));
const manifest = json('manifest.json');
// Individually reviewed active templates, separate from the immutable archive.
const localizedTemplates = new Set(['templates/collaboration/story.zh-CN.md']);
function files(base, relative = '') {
  return readdirSync(path.join(base, relative), { withFileTypes: true }).flatMap(entry => {
    const name = path.join(relative, entry.name);
    assert.ok(!lstatSync(path.join(base, name)).isSymbolicLink(), name);
    return entry.isDirectory() ? files(base, name) : [name];
  });
}

test('English is primary and archived Skills are outside the installed payload', () => {
  assert.equal(manifest.language, 'en');
  const payload = [...manifest.payload_directories, ...manifest.payload_files];
  assert.ok(payload.every(p => p !== '.' && !p.split('/').includes('translations')));
  for (const p of [manifest.entrypoint, ...json(manifest.skill_catalog).skills.map(s => s.path)]) {
    assert.ok(!p.split('/').includes('translations'), p);
  }
  const primary = ['README.md', 'SECURITY.md', ...manifest.payload_files,
    ...manifest.payload_directories.flatMap(p => files(path.join(root, p)).map(f => path.join(p, f))),
    ...files(path.join(root, 'rehearsal')).map(f => path.join('rehearsal', f))];
  for (const p of new Set(primary)) {
    if (localizedTemplates.has(p.split(path.sep).join('/'))) continue;
    assert.doesNotMatch(readFileSync(path.join(root, p), 'utf8'), /\p{Script=Han}/u,
      `Untranslated primary content: ${p}`);
  }
});

test('the active Chinese Story template is an explicit installed-payload exception', () => {
  for (const p of localizedTemplates) {
    assert.ok(manifest.payload_directories.some(directory => p.startsWith(directory + '/'))
      || manifest.payload_files.includes(p), 'localized template must be installed');
    assert.ok(!lstatSync(path.join(root, p)).isSymbolicLink(), p);
    assert.match(readFileSync(path.join(root, p), 'utf8'), /\p{Script=Han}/u,
      'localized Story template must contain Chinese text');
  }
});

test('Chinese snapshot preserves the original complete file set and exact bytes', () => {
  const snapshot = json('translations/zh-CN.snapshot.json');
  assert.equal(snapshot.kind, 'pre-english-working-tree-snapshot');
  assert.equal(snapshot.language, 'zh-CN');
  const names = snapshot.files.map(f => f.path);
  assert.equal(new Set(names).size, names.length);
  const base = path.join(root, 'translations/zh-CN');
  assert.deepEqual(files(base).map(p => p.split(path.sep).join('/')).sort(), names.toSorted());
  for (const entry of snapshot.files) {
    assert.ok(!path.isAbsolute(entry.path) && !entry.path.split('/').some(p => ['', '.', '..', '.git'].includes(p)));
    const bytes = readFileSync(path.join(base, entry.path));
    assert.equal(bytes.length, entry.bytes, entry.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, entry.path);
  }
  assert.equal(json('translations/zh-CN/manifest.json').version, snapshot.method_version);
  // Historical byte-accounting evidence is not translated or rebaselined.
  for (const p of ['tests/fixtures/context-baseline.json', 'tests/fixtures/context-v013-baseline.json']) {
    assert.deepEqual(readFileSync(path.join(root, p)), readFileSync(path.join(base, p)));
  }
});
