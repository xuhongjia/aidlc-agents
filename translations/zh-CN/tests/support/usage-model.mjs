// Maintainer-only Codex trace accounting. Never estimates tokens from text size.
export function summarizeUsage(events, { after = null, before = null } = {}) {
  let baseline = null, last = null, text_bytes = 0, image_count = 0;
  const counters = usage => ['input_tokens', 'cached_input_tokens', 'output_tokens'].every(key => Number.isInteger(usage?.[key]) && usage[key] >= 0);
  for (const event of events) {
    if (before && event.timestamp >= before) continue;
    const usage = event.type === 'event_msg' && event.payload?.type === 'token_count'
      ? event.payload.info?.total_token_usage : null;
    if (after && event.timestamp < after) {
      if (usage) baseline = usage;
      continue;
    }
    if (usage) last = usage; // cumulative counters also deduplicate repeated notifications
    if (event.type !== 'response_item' || !['function_call_output', 'custom_tool_call_output'].includes(event.payload?.type)) continue;
    const output = event.payload.output;
    if (typeof output === 'string') text_bytes += Buffer.byteLength(output);
    else if (Array.isArray(output)) for (const item of output) {
      if (['text', 'input_text'].includes(item.type)) text_bytes += Buffer.byteLength(item.text ?? '');
      if (['image', 'input_image'].includes(item.type)) image_count++;
    }
  }
  // A time-scoped sample needs a captured pre-run counter, not an invented zero.
  if (!counters(last) || (after && !counters(baseline))) return { status: 'unavailable', text_bytes, image_count };
  baseline ??= { input_tokens: 0, cached_input_tokens: 0, output_tokens: 0 };
  const delta = Object.fromEntries(['input_tokens', 'cached_input_tokens', 'output_tokens']
    .map(key => [key, last[key] - baseline[key]]));
  if (Object.values(delta).some(value => value < 0) || delta.cached_input_tokens > delta.input_tokens) return { status: 'unavailable', text_bytes, image_count };
  return { status: 'measured', ...delta, noncached_input_tokens: delta.input_tokens - delta.cached_input_tokens,
    text_bytes, image_count };
}
export function compareUsage(baseline, candidate) {
  if (baseline.status !== 'measured' || candidate.status !== 'measured') return { status: 'NOT_RUN_OR_UNAVAILABLE' };
  return { status: 'measured', baseline, candidate, differences: Object.fromEntries(
    ['input_tokens', 'cached_input_tokens', 'noncached_input_tokens', 'output_tokens', 'text_bytes', 'image_count']
      .map(key => [key, candidate[key] - baseline[key]])) };
}
