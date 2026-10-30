import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { measureCompactWorkflow, measureInstructions } from './support/context-budget.mjs';

const baseline = JSON.parse(readFileSync(new URL('./fixtures/context-v013-baseline.json', import.meta.url)));
// Historical fixture bytes and hashes remain pinned. Normalize only exact known old
// Skill identities when comparing required resources with the current package layout.
const skillCatalog = JSON.parse(readFileSync(new URL('../skills/catalog.json', import.meta.url)));
const historicalSkillRefs = new Map(skillCatalog.skills.map(skill => [
  'core:skills/' + skill.name + '/SKILL.md', 'core:' + skill.path,
]));
const currentRefForBaseline = ref => historicalSkillRefs.get(ref) ?? ref;
// Explicit responsibility split only: keep the original shared Gate identity and
// add its recipient's fragment. This does not permit missing historical rules.
const currentRefsForBaseline = (ref, run) => {
  const current = currentRefForBaseline(ref);
  if (current !== 'core:workflow/gate-execution.md') return [current];
  if (run.kind === 'gate-execution') return [current, 'core:workflow/gate-reviewer.md'];
  if (run.id === 'verify') return [current, 'core:workflow/gate-collector.md'];
  return [current];
};
const coordinatorResources = new Set(['extensions', 'dag', 'protocol', 'orchestration', 'approval', 'knowledge', 'gates', 'implementation-feedback']
  .map(name => 'core:workflow/' + name + '.md'));

test('static accounting uses UTF-8 bytes and rejects duplicate instructions instead of hiding them', () => {
  const plan = [{ ref: 'core:prompts/example.md' }, { ref: 'core:templates/example.md' }];
  const result = measureInstructions(plan, relative => relative.startsWith('templates/') ? 'x' : '\u4e2d\u6587');
  assert.equal(result.method_bytes, 6);
  assert.equal(result.template_bytes, 1);
  assert.equal(result.total_bytes, 7);
  assert.throws(() => measureInstructions([...plan, plan[0]], () => ''), /unique/);
});

test('baseline comparison maps only exact historical core Skill names in the catalog', () => {
  for (const skill of skillCatalog.skills) {
    assert.equal(currentRefForBaseline('core:skills/' + skill.name + '/SKILL.md'), 'core:' + skill.path);
    assert.equal(currentRefForBaseline('core:' + skill.path), 'core:' + skill.path);
  }
  for (const ref of ['core:skills/unknown/SKILL.md', 'team:skills/test-driven-development/SKILL.md',
    'core:skills/other/test-driven-development/SKILL.md', 'core:workflow/tdd.md']) {
    assert.equal(currentRefForBaseline(ref), ref, 'Do not normalize an unrelated resource');
  }
});

test('current compact runs preserve every baseline mandatory resource while reducing method bytes', () => {
  for (const profile of ['fix', 'enhance']) {
    const actual = measureCompactWorkflow(profile), before = baseline.profiles[profile];
    assert.equal(actual.runs.length, 5, 'Three stages plus two independent Reviewer runs');
    for (const run of actual.runs) {
      const previous = before.runs.find(item => item.id === run.id);
      assert.ok(previous, 'Unknown default run: ' + run.id);
      assert.deepEqual(run.files.map(file => file.ref).sort(), previous.refs.flatMap(ref => currentRefsForBaseline(ref, run)).sort(), 'Mandatory resources changed for ' + run.id);
      assert.ok(run.files.every(file => !coordinatorResources.has(file.ref)), 'Worker loaded a parent coordination protocol');
      assert.equal(run.total_bytes, run.method_bytes + run.template_bytes);
    }
    assert.ok(actual.totals.method_bytes <= Math.floor(before.totals.method_bytes * 0.8),
      profile + ': method bytes must remain at least 20% below the pinned v0.13 baseline');
    assert.ok(actual.totals.total_bytes <= before.totals.total_bytes,
      profile + ': counting templates must not hide an overall increase');
  }
});

test('feedback and additional collectors are charged to their actual runs, with templates separate', () => {
  for (const profile of ['fix', 'enhance']) {
    const base = measureCompactWorkflow(profile), feedback = measureCompactWorkflow(profile, { feedback: 2 });
    const repeat = measureCompactWorkflow(profile, { extraVerifyRuns: 2 });
    const verify = base.runs.find(run => run.id === 'verify');
    const feedbackFile = feedback.runs.find(run => run.id === 'implement').files
      .find(file => file.ref === 'core:workflow/feedback-request.md');
    assert.ok(feedbackFile);
    assert.equal(feedback.totals.method_bytes - base.totals.method_bytes, feedbackFile.bytes);
    assert.equal(feedback.totals.template_bytes, base.totals.template_bytes);
    assert.equal(repeat.runs.length, base.runs.length + 2);
    for (const unit of ['method_bytes', 'template_bytes', 'total_bytes']) {
      assert.equal(repeat.totals[unit] - base.totals[unit], verify[unit] * 2);
    }
  }
  assert.throws(() => measureCompactWorkflow('fix', { extraVerifyRuns: -1 }), /run count/);
});
