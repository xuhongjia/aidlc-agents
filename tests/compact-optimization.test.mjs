import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { measureCompactWorkflow } from './support/context-budget.mjs';

const bytes = readFileSync(new URL('./fixtures/context-v016-pre-compact.json', import.meta.url));
const baseline = JSON.parse(bytes);
const changedBodies = new Set([
  'core:workflow/worker.md', 'core:prompts/composed-stage.md',
  'core:workflow/gate-execution.md', 'core:prompts/gate-review.md', 'core:prompts/verify.md',
]);
const scenarios = {
  direct: {}, fallback: { extraVerifyRuns: 1 }, feedback: { feedback: 2 },
};
const expectedRefs = run => run.files.flatMap(file => {
  if (file.ref !== 'core:workflow/gate-execution.md') return [file.ref];
  if (run.kind === 'gate-execution') return [file.ref, 'core:workflow/gate-reviewer.md'];
  assert.match(run.id, /^verify(?:-extra-\d+)?$/);
  return [file.ref, 'core:workflow/gate-collector.md'];
}).sort();

test('pre-compaction snapshot retains its actual working-tree identity and immutable bytes', () => {
  assert.equal(createHash('sha256').update(bytes).digest('hex'),
    '54b3d92fd7daec669809a7565d0587d3d67799760c41f4cb2ee49fbedbd492a0');
  assert.equal(baseline.kind, 'pre-optimization-working-tree');
  assert.equal(baseline.version, '0.16.0');
  assert.equal(baseline.unit, 'utf8_bytes');
});

test('compact direct, fallback and feedback runs retain actors, templates and required sources', () => {
  for (const profile of ['fix', 'enhance']) {
    for (const [scenario, options] of Object.entries(scenarios)) {
      const before = baseline.profiles[profile][scenario];
      const after = measureCompactWorkflow(profile, options);
      const label = profile + '/' + scenario;
      assert.deepEqual(after.runs.map(({ id, kind }) => ({ id, kind })),
        before.runs.map(({ id, kind }) => ({ id, kind })), label + ': do not remove an execution');
      for (const run of after.runs) {
        const old = before.runs.find(item => item.id === run.id);
        assert.deepEqual(run.files.map(file => file.ref).sort(), expectedRefs(old),
          label + '/' + run.id + ': only the exact Gate responsibility split is allowed');
        for (const file of old.files.filter(file => !changedBodies.has(file.ref))) {
          const actual = run.files.find(item => item.ref === file.ref);
          assert.equal(actual.sha256, file.sha256, label + '/' + file.ref + ': keep unchanged source bytes');
          assert.equal(actual.bytes, file.bytes);
        }
      }
      assert.equal(after.totals.template_bytes, before.totals.template_bytes, label);
      assert.ok(after.totals.total_bytes <= Math.floor(before.totals.total_bytes * 0.95),
        label + ': retain at least 5% reduction including templates');
      assert.ok(after.totals.method_bytes < before.totals.method_bytes, label);
    }
  }
});

test('common contract reduction is counted on every recipient without injecting helper source', () => {
  const bodyBytes = path => readFileSync(new URL('../' + path, import.meta.url)).length;
  const common = bodyBytes('workflow/worker.md') + bodyBytes('prompts/composed-stage.md');
  assert.ok(common < baseline.common_bytes);
  assert.ok(common <= 6000);
  for (const run of measureCompactWorkflow('fix').runs) {
    assert.equal(run.files.filter(file => ['core:workflow/worker.md', 'core:prompts/composed-stage.md']
      .includes(file.ref)).reduce((sum, file) => sum + file.bytes, 0), common);
    assert.ok(run.files.every(file => !file.ref.startsWith('core:helpers/') &&
      !['core:workflow/execution.md', 'core:docs/helper-usage.md'].includes(file.ref)));
  }
});
