import test from 'node:test';
import assert from 'node:assert/strict';
import { listTasks } from '../src/domain/tasks.mjs';

test('existing search preserves order and finds matching tasks', () => {
  const tasks = [{id:'3', title:'CLI'}, {id:'1', title:'CLI test'}, {id:'2', title:'Other'}];
  assert.deepEqual(listTasks(tasks, {search:'cli'}), {items:tasks.slice(0, 2), total:2});
});
