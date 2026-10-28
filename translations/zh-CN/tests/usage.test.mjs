import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeUsage, compareUsage } from './support/usage-model.mjs';
const usage = (timestamp, input, cached, output) => ({ timestamp, type: 'event_msg',
  payload: { type: 'token_count', info: { total_token_usage: {
    input_tokens: input, cached_input_tokens: cached, output_tokens: output, reasoning_output_tokens: output,
  } } } });
test('trace counters distinguish cached/uncached input without summing duplicate events or reasoning twice', () => {
  const events = [usage('01', 100, 60, 10), usage('03', 300, 210, 30), usage('03', 300, 210, 30)];
  const result = summarizeUsage(events, { after: '02' });
  assert.deepEqual(result, { status: 'measured', input_tokens: 200, cached_input_tokens: 150,
    output_tokens: 20, noncached_input_tokens: 50, text_bytes: 0, image_count: 0 });
  assert.equal(compareUsage(result, result).differences.input_tokens, 0);
});
test('trace tool text and images remain different measures; missing usage is not zero or bytes/4', () => {
  const result = summarizeUsage([{ type: 'response_item', payload: { type: 'custom_tool_call_output',
    output: [{ type: 'input_text', text: '中文' }, { type: 'input_image', image_url: 'data:huge-not-text' }] } }]);
  assert.deepEqual(result, { status: 'unavailable', text_bytes: 6, image_count: 1 });
  assert.equal(compareUsage(result, result).status, 'NOT_RUN_OR_UNAVAILABLE');
  assert.equal(summarizeUsage([usage('03', 100, 20, 10)], { after: '02' }).status, 'unavailable');
});
