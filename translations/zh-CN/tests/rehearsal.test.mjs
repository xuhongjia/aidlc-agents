// These are maintainer contracts on ephemeral copies, never human-approved deliveries.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { architectureGate, candidate, assertGatePair } from './support/fixture-fitness.mjs';
const fixture=fileURLToPath(new URL('../rehearsal/task-list/',import.meta.url));
const childEnv={...process.env};
delete childEnv.NODE_TEST_CONTEXT; // Nested Node test runners must start their own harness.
function copy() { const root=mkdtempSync(path.join(tmpdir(),'aidlc-task-test-')); cpSync(fixture,root,{recursive:true}); return root; }
function cli(root,...args) { return spawnSync(process.execPath,['src/cli.mjs','--file','data/tasks.json',...args],{cwd:root,encoding:'utf8'}); }

test('fixture: real CLI reproduces zero-match bug; initial project has no Architecture Gate', () => {
  const root=copy(), result=cli(root,'--search','missing');
  assert.equal(result.status,0); assert.deepEqual(JSON.parse(result.stdout),{items:[],total:1});
  assert.equal(existsSync(path.join(root,'architecture-gate.mjs')),false);
  const baseline=spawnSync(process.execPath,['--test','test/baseline.test.mjs'],{cwd:root,encoding:'utf8',env:childEnv});
  assert.equal(baseline.status,0,baseline.stdout+baseline.stderr);
});
test('fixture contract: empty-search regression is red before a controlled patch, green after, preserving neighboring behavior', () => {
  const root=copy();
  const regression=`import test from 'node:test'; import assert from 'node:assert/strict'; import {listTasks} from '../src/domain/tasks.mjs';
test('empty-match',()=>assert.deepEqual(listTasks([{title:'CLI'}],{search:'missing'}),{items:[],total:0}));
test('empty-data',()=>assert.deepEqual(listTasks([]),{items:[],total:0}));`;
  writeFileSync(path.join(root,'test/regression.test.mjs'),regression);
  const run=()=>spawnSync(process.execPath,['--test','test/baseline.test.mjs','test/regression.test.mjs'],{cwd:root,encoding:'utf8',env:childEnv});
  const red=run(); assert.notEqual(red.status,0); assert.match(red.stdout,/empty-match/);
  const source=path.join(root,'src/domain/tasks.mjs');
  writeFileSync(source,readFileSync(source,'utf8').replace('items.length || 1','items.length'));
  const green=run(); assert.equal(green.status,0,green.stdout+green.stderr);
  assert.deepEqual(JSON.parse(cli(root,'--search','missing').stdout),{items:[],total:0});
  assert.deepEqual(JSON.parse(cli(root).stdout).items.map(t=>t.id),['t3','t1','t2']);
  assert.equal(JSON.parse(cli(root,'--search','CLI').stdout).total,2);
});
test('reference Architecture Gate sees real dependency edges and rejects boundary violations', () => {
  const root=copy(), good=architectureGate(root);
  assert.equal(good.status,'PASS'); assert.ok(good.edges.some(e=>e.from==='src/cli.mjs' && e.to==='src/domain/tasks.mjs'));
  const source=path.join(root,'src/domain/tasks.mjs'), original=readFileSync(source,'utf8');
  for (const violation of ["import {readFileSync} from 'node:fs';\n", "import '../cli.mjs';\n", "const x = import('node:net');\n"]) {
    writeFileSync(source,violation+original);
    assert.equal(architectureGate(root).status,'FAIL');
  }
});
test('contract: fabricated summary, zero/unrelated/skipped checks and candidate drift cannot stand for a Gate pair', () => {
  const root=copy(), frozen=candidate(root);
  // Explicit synthetic records exercise the schema; not independent QE execution evidence.
  const arch={kind:'architecture',status:'PASS',checks:2,rawEvidence:'SYNTHETIC model',candidate:frozen,exitCode:0,relevantChecks:['dependency-boundary']};
  const quality={...arch,kind:'quality',relevantChecks:['empty-match']};
  assertGatePair(arch,quality,frozen);
  for (const patch of [{checks:0},{rawEvidence:null},{relevantChecks:[]},{skipped:1},{candidate:[]},{exitCode:1},{status:'NOT_RUN'}]) {
    assert.throws(()=>assertGatePair(arch,{...quality,...patch},frozen));
  }
});
