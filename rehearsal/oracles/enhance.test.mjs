// Install into the isolated business repo only after approving the test draft.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const run=(...args)=>spawnSync(process.execPath,['src/cli.mjs','--file','data/tasks.json',...args],{cwd:process.cwd(),encoding:'utf8'});
function result(...args) { const r=run(...args); assert.equal(r.status,0,r.stderr); return JSON.parse(r.stdout); }
test('status intersects case-insensitive search',()=>assert.deepEqual(result('--search','CLI','--status','done'),{items:[{id:'t1',title:'Review CLI',status:'done'}],total:1}));
test('status alone retains original order',()=>assert.deepEqual(result('--status','open').items.map(t=>t.id),['t3','t2']));
test('omitted status preserves all existing results and order',()=>assert.deepEqual(result().items.map(t=>t.id),['t3','t1','t2']));
test('empty intersection reports zero',()=>assert.deepEqual(result('--search','tests','--status','done'),{items:[],total:0}));
test('unknown or empty status is rejected, never treated as no filter',()=>{
  for(const status of ['invalid','']) { const r=run('--status',status); assert.notEqual(r.status,0); assert.match(r.stderr,/open.*done|done.*open/); }
});
