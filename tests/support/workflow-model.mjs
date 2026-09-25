// Maintainer-only, synthetic reference model. This is not installed, an Agent
// runtime, an authorization service, or evidence that a host obeys instructions.
import { createHash } from 'node:crypto';

export const CAPABILITIES = Object.freeze(['product.write', 'knowledge.read', 'knowledge.prepare', 'evidence.read']);
export const GATE_KINDS = Object.freeze(['architecture', 'quality']);
const KINDS = new Set(['analysis', 'specification', 'design', 'quality_design', 'planning', 'implementation', 'verification', 'release_readiness', 'learning']);
const KIND_OUTPUT = Object.freeze({ specification: 'spec', design: 'architecture', quality_design: 'quality', planning: 'plan', implementation: 'implementation', verification: 'verification', release_readiness: 'release', learning: 'outcome' });
const CONTRACTS = new Set(['request', 'project', 'knowledge', 'intake', 'change', 'spec', 'architecture', 'quality', 'plan', 'implementation', 'verification', 'release', 'outcome', 'analysis']);
const EXTERNAL = new Set(['request', 'project', 'knowledge']);
const TYPES = new Set(['boolean', 'string', 'number']);
const fail = message => { throw new Error(message); };
const requireThat = (condition, message) => { if (!condition) fail(message); };
const sameSet = (a, b) => a.size === b.size && [...a].every(value => b.has(value));
const subset = (a, b) => a.every(value => b.includes(value));
const clone = value => structuredClone(value);
const indexBy = (values, field, label) => {
  const result = new Map();
  for (const value of values) {
    requireThat(typeof value[field] === 'string' && value[field], `missing ${label} identity`);
    requireThat(!result.has(value[field]), `duplicate ${label}: ${value[field]}`);
    result.set(value[field], value);
  }
  return result;
};

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}

export function digest(value) {
  return createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
}

export function createWorkLock(resolved) {
  return { digest: digest(resolved), resolved: clone(resolved) };
}

export function assertWorkLock(lock, current) {
  requireThat(lock?.digest === digest(lock?.resolved) && lock.digest === digest(current), 'work lock changed; explicit re-resolution and approval required');
}

function validateOutputs(outputs) {
  requireThat(Array.isArray(outputs) && outputs.length > 0, 'outputs required');
  indexBy(outputs, 'name', 'output');
  for (const output of outputs) {
    requireThat(CONTRACTS.has(output.contract), `unknown output contract: ${output.contract}`);
    requireThat(typeof output.name === 'string' && output.name && !output.name.startsWith('/') && !output.name.includes('\\') && !output.name.split('/').some(part => ['', '.', '..'].includes(part)), 'output name must be a safe relative path');
    requireThat(typeof output.template === 'string' && output.template && !output.template.startsWith('/') && !output.template.split('/').includes('..'), 'invalid template reference');
  }
}

export function validateStage(stage) {
  requireThat(KINDS.has(stage.kind), `unknown stage kind: ${stage.kind}`);
  requireThat(typeof stage.id === 'string' && stage.id && typeof stage.role === 'string' && stage.role && typeof stage.prompt === 'string' && stage.prompt, 'stage identity, role and prompt required');
  requireThat(typeof stage.auto_eligible === 'boolean', 'auto_eligible must be explicit');
  requireThat(Array.isArray(stage.inputs) && Array.isArray(stage.optional_inputs), 'input lists required');
  requireThat(new Set([...stage.inputs, ...stage.optional_inputs]).size === stage.inputs.length + stage.optional_inputs.length, 'duplicate input contract');
  for (const contract of [...stage.inputs, ...stage.optional_inputs]) requireThat(CONTRACTS.has(contract), `unknown input contract: ${contract}`);
  requireThat(Array.isArray(stage.capabilities), 'capabilities must be explicit');
  for (const capability of stage.capabilities) requireThat(CAPABILITIES.includes(capability), `unknown capability/effect: ${capability}`);
  requireThat(stage.tool_binding_ids === undefined || (Array.isArray(stage.tool_binding_ids) && stage.tool_binding_ids.every(id => typeof id === 'string') && new Set(stage.tool_binding_ids).size === stage.tool_binding_ids.length), 'invalid tool binding ids');
  requireThat(!stage.capabilities.includes('product.write') || stage.kind === 'implementation', 'product.write requires implementation kind');
  requireThat(stage.kind !== 'implementation' || stage.capabilities.includes('product.write'), 'implementation must declare product.write');
  requireThat(!['release_readiness', 'learning'].includes(stage.kind) || stage.capabilities.includes('evidence.read'), 'release/learning requires external evidence capability');
  requireThat(stage.routing_facts && typeof stage.routing_facts === 'object' && !Array.isArray(stage.routing_facts), 'routing_facts must be declared');
  for (const type of Object.values(stage.routing_facts)) requireThat(TYPES.has(type), 'unknown routing fact type');
  validateOutputs(stage.outputs);
  requireThat(!KIND_OUTPUT[stage.kind] || stage.outputs.some(output => output.contract === KIND_OUTPUT[stage.kind]), `stage kind requires fixed semantic output: ${stage.kind} -> ${KIND_OUTPUT[stage.kind]}`);
  return stage;
}

function stageMap(stages) {
  const values = stages instanceof Map ? [...stages.values()] : stages;
  values.forEach(validateStage);
  return indexBy(values, 'id', 'stage');
}

function outputContracts(node, stage) {
  return new Set((node.outputs ?? stage.outputs).map(output => output.contract));
}

function graph(workflow, stages) {
  const definitions = stageMap(stages);
  const nodes = indexBy(workflow.nodes, 'step_id', 'step');
  const incoming = new Map([...nodes.keys()].map(id => [id, []]));
  const outgoing = new Map([...nodes.keys()].map(id => [id, []]));
  requireThat(nodes.has(workflow.entry), 'entry step missing');
  for (const node of nodes.values()) requireThat(definitions.has(node.stage_id), `missing stage: ${node.stage_id}`);
  const edgeIds = new Set();
  for (const edge of workflow.edges) {
    requireThat(nodes.has(edge.from) && nodes.has(edge.to), 'missing dependency endpoint');
    const key = JSON.stringify(edge);
    requireThat(!edgeIds.has(key), 'duplicate edge');
    edgeIds.add(key);
    outgoing.get(edge.from).push(edge);
    incoming.get(edge.to).push(edge);
  }
  requireThat(incoming.get(workflow.entry).length === 0, 'entry has predecessor');
  const degrees = new Map([...incoming].map(([id, edges]) => [id, edges.length]));
  const queue = [...degrees].filter(([, n]) => n === 0).map(([id]) => id);
  const order = [];
  while (queue.length) {
    const id = queue.shift();
    order.push(id);
    for (const edge of outgoing.get(id)) {
      degrees.set(edge.to, degrees.get(edge.to) - 1);
      if (degrees.get(edge.to) === 0) queue.push(edge.to);
    }
  }
  requireThat(order.length === nodes.size, 'cycle in workflow');
  return { definitions, nodes, incoming, outgoing, order };
}

function reach(entry, outgoing, include) {
  const result = new Set();
  const pending = [entry];
  while (pending.length) {
    const id = pending.pop();
    if (result.has(id)) continue;
    result.add(id);
    for (const edge of outgoing.get(id)) if (include(edge)) pending.push(edge.to);
  }
  return result;
}

function pathExists(from, to, edges) {
  if (from === to) return false;
  const seen = new Set([from]);
  const queue = [from];
  while (queue.length) {
    const id = queue.pop();
    for (const edge of edges.filter(edge => edge.from === id)) {
      if (edge.to === to) return true;
      if (!seen.has(edge.to)) { seen.add(edge.to); queue.push(edge.to); }
    }
  }
  return false;
}

export function selectedGraph(workflow, stages, choices = {}) {
  const base = graph(workflow, stages);
  const switches = indexBy(workflow.switches ?? [], 'id', 'switch');
  for (const [id, selected] of Object.entries(choices)) requireThat(switches.get(id)?.cases.some(item => item.id === selected), 'unknown selected branch');
  const enabled = edge => !edge.when || choices[edge.when.switch] === edge.when.case;
  const possible = edge => !edge.when || choices[edge.when.switch] === undefined || enabled(edge);
  const active = reach(workflow.entry, base.outgoing, enabled);
  const reachable = reach(workflow.entry, base.outgoing, possible);
  return {
    ...base, active,
    edges: workflow.edges.filter(edge => active.has(edge.from) && active.has(edge.to) && enabled(edge)),
    possible_edges: workflow.edges.filter(edge => reachable.has(edge.from) && reachable.has(edge.to) && possible(edge)),
    pruned: [...base.nodes.keys()].filter(id => !reachable.has(id)),
    pending: [...reachable].filter(id => !active.has(id)),
  };
}

function validateSwitches(workflow, base) {
  const switches = indexBy(workflow.switches ?? [], 'id', 'switch');
  const owners = new Set();
  for (const item of switches.values()) {
    requireThat(base.nodes.has(item.after), 'switch producer missing');
    requireThat(!owners.has(item.after), 'one switch per producer');
    owners.add(item.after);
    const type = base.definitions.get(base.nodes.get(item.after).stage_id).routing_facts[item.fact];
    requireThat(TYPES.has(type), 'switch fact must be declared by producer');
    requireThat(Array.isArray(item.cases) && item.cases.length > 1, 'switch needs multiple cases');
    indexBy(item.cases, 'id', 'case');
    requireThat(item.cases.filter(c => c.default === true).length <= 1, 'multiple default cases');
    for (const branch of item.cases) {
      requireThat(branch.default === true || (branch.op === 'eq' && typeof branch.value === type && (type !== 'number' || Number.isFinite(branch.value))), 'invalid typed switch case');
      requireThat(workflow.edges.some(edge => edge.from === item.after && edge.when?.switch === item.id && edge.when.case === branch.id), 'switch case has no edge');
    }
  }
  for (const edge of workflow.edges) {
    if (edge.when) {
      const item = switches.get(edge.when.switch);
      requireThat(item?.after === edge.from && item.cases.some(c => c.id === edge.when.case), 'dangling switch edge');
    } else requireThat(!owners.has(edge.from), 'switch cannot also take unconditional outgoing edges');
  }
  return switches;
}

function validateBindings(node, stage, state) {
  requireThat(node.bindings && typeof node.bindings === 'object', 'bindings required');
  const allowed = [...stage.inputs, ...stage.optional_inputs];
  for (const contract of Object.keys(node.bindings)) requireThat(allowed.includes(contract), `undeclared input binding: ${contract}`);
  for (const contract of stage.inputs) requireThat(node.bindings[contract]?.length, `missing required input binding: ${contract}`);
  for (const [contract, producers] of Object.entries(node.bindings)) {
    requireThat(Array.isArray(producers) && producers.length > 0 && new Set(producers).size === producers.length, 'invalid producer list');
    let activeProducer = false;
    for (const producer of producers) {
      if (producer.startsWith('$')) {
        requireThat(EXTERNAL.has(contract) && producer === `$${contract}`, `invalid external input: ${contract}`);
        activeProducer = true;
      } else {
        requireThat(state.nodes.has(producer), `dangling input producer: ${producer}`);
        requireThat(outputContracts(state.nodes.get(producer), state.definitions.get(state.nodes.get(producer).stage_id)).has(contract), `producer lacks contract: ${contract}`);
        if (state.active.has(producer)) {
          requireThat(pathExists(producer, node.step_id, state.edges), `input producer is not a dependency: ${producer}`);
          activeProducer = true;
        }
      }
    }
    requireThat(activeProducer || !stage.inputs.includes(contract), `required input pruned: ${contract}`);
  }
}

function validateActivePath(workflow, state) {
  const kind = id => state.definitions.get(state.nodes.get(id).stage_id).kind;
  const writers = [...state.active].filter(id => state.definitions.get(state.nodes.get(id).stage_id).capabilities.includes('product.write'));
  const implementations = [...state.active].filter(id => kind(id) === 'implementation');
  for (const id of state.active) {
    const node = state.nodes.get(id);
    const stage = state.definitions.get(node.stage_id);
    validateBindings(node, stage, state);
    if (stage.kind === 'implementation') {
      requireThat(node.authority && state.active.has(node.authority) && pathExists(node.authority, id, state.edges), 'implementation requires active upstream authority');
      const authority = state.nodes.get(node.authority);
      const contracts = outputContracts(authority, state.definitions.get(authority.stage_id));
      requireThat(['plan', 'change'].some(contract => contracts.has(contract) && node.bindings[contract]?.includes(node.authority)), 'implementation authority must supply bound plan/change');
    }
  }
  for (let i = 0; i < writers.length; i++) for (const other of writers.slice(i + 1)) {
    requireThat(pathExists(writers[i], other, state.edges) || pathExists(other, writers[i], state.edges), 'product writers must be explicitly ordered');
  }
  const terminals = workflow.terminals.filter(t => state.active.has(t.step_id));
  const sinks = [...state.active].filter(id => !state.edges.some(edge => edge.from === id));
  for (const sink of sinks) requireThat(terminals.some(t => t.step_id === sink), 'active path has no terminal');
  for (const terminal of terminals) {
    requireThat(sinks.includes(terminal.step_id), 'terminal has active successors');
    const prior = implementations.filter(id => pathExists(id, terminal.step_id, state.edges));
    if (workflow.intent === 'analysis') requireThat(terminal.outcome === 'analysis_complete', 'analysis cannot claim verified/learned');
    if (terminal.outcome === 'verified') requireThat(kind(terminal.step_id) === 'verification', 'verified terminal requires verification kind');
    if (terminal.outcome === 'learned') requireThat(kind(terminal.step_id) === 'learning', 'learned terminal requires learning kind');
    if (workflow.intent === 'delivery') requireThat(terminal.outcome !== 'analysis_complete' && prior.length > 0, 'delivery terminal requires implementation and verified/learned outcome');
    if (prior.length) {
      requireThat(terminal.outcome !== 'analysis_complete', 'implementation path cannot end as analysis');
      const verifiers = [...state.active].filter(id => kind(id) === 'verification' && (id === terminal.step_id || pathExists(id, terminal.step_id, state.edges)));
      requireThat(verifiers.some(id => prior.every(writer => pathExists(writer, id, state.edges))), 'every implementation needs downstream final verification');
    } else requireThat(terminal.outcome === 'analysis_complete', 'delivery terminal has no implementation');
  }
}

export function validateWorkflow(workflow, stages) {
  requireThat(['delivery', 'analysis'].includes(workflow.intent) && ['low', 'any'].includes(workflow.risk_ceiling), 'invalid workflow intent/risk ceiling');
  requireThat(Array.isArray(workflow.terminals) && workflow.terminals.length > 0, 'terminal required');
  const base = graph(workflow, stages);
  const entryStage = base.definitions.get(base.nodes.get(workflow.entry).stage_id);
  requireThat(['analysis', 'specification', 'design', 'planning'].includes(entryStage.kind) && !entryStage.capabilities.includes('product.write'), 'entry must be a permitted readonly investigation stage');
  indexBy(workflow.terminals, 'step_id', 'terminal');
  for (const terminal of workflow.terminals) requireThat(base.nodes.has(terminal.step_id) && ['verified', 'analysis_complete', 'learned'].includes(terminal.outcome), 'invalid terminal');
  for (const node of base.nodes.values()) {
    const stage = base.definitions.get(node.stage_id);
    if (node.outputs) {
      validateOutputs(node.outputs);
      requireThat(sameSet(outputContracts(node, stage), new Set(stage.outputs.map(o => o.contract))), 'output override must preserve semantic contracts');
    }
    if (workflow.intent === 'analysis') requireThat(stage.kind !== 'implementation' && !stage.capabilities.includes('product.write'), 'analysis workflow cannot write product');
  }
  const reachable = reach(workflow.entry, base.outgoing, () => true);
  requireThat(reachable.size === base.nodes.size, 'unreachable workflow node');
  const switches = validateSwitches(workflow, base);
  let scenarios = [{}];
  for (const item of switches.values()) {
    scenarios = scenarios.flatMap(choices => item.cases.map(branch => ({ ...choices, [item.id]: branch.id })));
    requireThat(scenarios.length <= 128, 'reference model scenario limit exceeded');
  }
  for (const choices of scenarios) validateActivePath(workflow, selectedGraph(workflow, stages, choices));
  return { order: base.order, scenarios: scenarios.length, required_gate_kinds: GATE_KINDS.slice() };
}

function noWidening(previous, replacement, kind, stages) {
  if (kind === 'stage') {
    validateStage(replacement);
    requireThat(previous.kind === replacement.kind && subset(replacement.capabilities, previous.capabilities), 'override widens stage permissions');
    requireThat(subset(replacement.tool_binding_ids ?? [], previous.tool_binding_ids ?? []), 'override widens tool operations');
    requireThat(subset(previous.inputs, replacement.inputs) && subset(previous.outputs.map(o => o.contract), replacement.outputs.map(o => o.contract)), 'override removes required semantic contracts');
    requireThat(!replacement.auto_eligible || previous.auto_eligible, 'override widens automatic eligibility');
  } else {
    requireThat(previous.id !== 'core.standard' || replacement.risk_ceiling === previous.risk_ceiling, 'core.standard risk ceiling cannot be overridden');
    requireThat(previous.intent === replacement.intent && !(previous.risk_ceiling === 'low' && replacement.risk_ceiling === 'any'), 'override widens workflow intent/risk');
    const effects = workflow => [...new Set(workflow.nodes.flatMap(node => stages.get(node.stage_id)?.capabilities ?? []))];
    requireThat(subset(effects(replacement), effects(previous)), 'override widens workflow permissions');
    const tools = workflow => workflow.nodes.flatMap(node => stages.get(node.stage_id)?.tool_binding_ids ?? []);
    requireThat(subset(tools(replacement), tools(previous)), 'override widens workflow tool operations');
  }
}

export function resolveDefinitions(builtin, team, project) {
  const stages = new Map();
  const workflows = new Map();
  const toolBindings = new Map();
  for (const pack of [builtin, team, project].filter(Boolean)) {
    requireThat(pack.contract_version === 1 && pack.core_contract === 1 && pack.id && pack.version, 'unsupported pack contract/identity');
    for (const [kind, definitions, target] of [['stage', pack.stages, stages], ['workflow', pack.workflows, workflows]]) {
      requireThat(Array.isArray(definitions), 'definition list required');
      for (const definition of definitions) {
        requireThat(!target.has(definition.id), `implicit ${kind} merge forbidden: ${definition.id}`);
        if (kind === 'stage') validateStage(definition);
        target.set(definition.id, clone(definition));
      }
    }
    requireThat(Array.isArray(pack.overrides) && Array.isArray(pack.tool_bindings), 'explicit override/tool binding lists required');
    const overridden = new Set();
    for (const override of pack.overrides) {
      requireThat(['stage', 'workflow'].includes(override.kind), 'unknown override kind');
      const key = `${override.kind}:${override.id}`;
      requireThat(!overridden.has(key), 'duplicate override');
      overridden.add(key);
      const target = override.kind === 'stage' ? stages : workflows;
      requireThat(target.has(override.id) && override.replacement?.id === override.id, 'override requires existing id and full replacement');
      noWidening(target.get(override.id), override.replacement, override.kind, stages);
      target.set(override.id, clone(override.replacement));
    }
    for (const binding of pack.tool_bindings) {
      requireThat(binding.id && !toolBindings.has(binding.id), 'duplicate/missing tool binding identity');
      for (const effect of binding.capabilities ?? []) requireThat(CAPABILITIES.includes(effect), `unknown tool effect: ${effect}`);
      requireThat(['read', 'write'].includes(binding.effect), `unknown tool effect: ${binding.effect}`);
      for (const key of ['connector', 'operation', 'target']) requireThat(typeof binding[key] === 'string' && binding[key], `tool binding ${key} missing`);
      requireThat(CONTRACTS.has(binding.input_contract) && CONTRACTS.has(binding.output_contract), 'unknown tool binding contract');
      requireThat(binding.authorization_ref === null, 'tool definition cannot contain work authorization');
      toolBindings.set(binding.id, clone(binding));
    }
  }
  for (const stage of stages.values()) for (const id of stage.tool_binding_ids ?? []) requireThat(toolBindings.has(id), `unknown tool binding id: ${id}`);
  for (const workflow of workflows.values()) validateWorkflow(workflow, stages);
  return { stages: [...stages.values()], workflows: [...workflows.values()], tool_bindings: [...toolBindings.values()] };
}

export function assertApproval(approval, expected) {
  requireThat(approval?.decision === 'approved', 'approval missing');
  for (const key of ['step_id', 'work_id', 'lock_digest', 'artifact_digest', 'request_digest']) {
    requireThat(typeof expected[key] === 'string' && expected[key] && approval[key] === expected[key], `stale/mismatched approval: ${key}`);
  }
  requireThat(typeof approval.actor === 'string' && approval.actor && approval.source, 'approval attribution missing');
}

function approvedCase(item, stage, record, context) {
  assertApproval(record?.approval, { ...context, step_id: item.after, artifact_digest: context.artifact_digests[item.after] });
  requireThat(record.artifact_digest === context.artifact_digests[item.after], 'stale routing facts');
  requireThat(record.artifact && digest(record.artifact) === record.artifact_digest && digest(record.facts) === digest(record.artifact.routing_facts), 'routing facts differ from approved artifact');
  const declarations = stage.routing_facts;
  requireThat(record.facts && Object.keys(record.facts).every(key => Object.hasOwn(declarations, key)), 'undeclared routing facts');
  const value = record.facts[item.fact];
  requireThat(typeof value === declarations[item.fact] && (typeof value !== 'number' || Number.isFinite(value)), 'missing or mistyped routing fact');
  const matches = item.cases.filter(branch => branch.op === 'eq' && branch.value === value);
  requireThat(matches.length <= 1, 'multiple switch cases match');
  const selected = matches[0] ?? item.cases.find(branch => branch.default === true);
  requireThat(selected, 'no switch case matches');
  return selected.id;
}

export function selectBranches(workflow, stages, records, context) {
  validateWorkflow(workflow, stages);
  const definitions = stageMap(stages);
  const nodes = new Map(workflow.nodes.map(node => [node.step_id, node]));
  const choices = {};
  const pending = new Map((workflow.switches ?? []).map(item => [item.id, item]));
  let progress = true;
  while (progress) {
    progress = false;
    const state = selectedGraph(workflow, stages, choices);
    for (const [id, item] of pending) {
      if (!state.active.has(item.after)) continue;
      const record = records[item.after];
      choices[id] = approvedCase(item, definitions.get(nodes.get(item.after).stage_id), record, context);
      pending.delete(id);
      progress = true;
    }
  }
  return { choices, ...selectedGraph(workflow, stages, choices) };
}

export function readyNodes(workflow, stages, { choices = {}, approved = [], running = [] } = {}) {
  const state = selectedGraph(workflow, stages, choices);
  const approvedIds = new Set(approved);
  const runningIds = new Set(running);
  requireThat(approved.every(id => state.active.has(id)), 'pruned/pending node cannot count as approved');
  const ready = state.order.filter(id => {
    if (!state.active.has(id) || approvedIds.has(id) || runningIds.has(id)) return false;
    if (state.possible_edges.some(edge => edge.to === id && (!state.active.has(edge.from) || (edge.when && choices[edge.when.switch] === undefined)))) return false;
    const predecessors = state.edges.filter(edge => edge.to === id).map(edge => edge.from);
    const declared = Object.values(state.nodes.get(id).bindings).flat().filter(producer => !producer.startsWith('$'));
    if (declared.some(producer => state.pending.includes(producer))) return false;
    const producers = declared.filter(producer => state.active.has(producer));
    return [...predecessors, ...producers].every(producer => approvedIds.has(producer));
  });
  return { ready, pruned: state.pruned, pending: state.pending };
}

export function assertDispatch(workflow, stages, stepId, { choices = {}, branch_records = {}, approvals = {}, context, running = [], product_access = 'read' }) {
  validateWorkflow(workflow, stages);
  const state = selectedGraph(workflow, stages, choices);
  for (const [id, choice] of Object.entries(choices)) {
    const item = workflow.switches.find(item => item.id === id);
    requireThat(state.active.has(item.after), 'choice belongs to pruned switch');
    requireThat(approvedCase(item, state.definitions.get(state.nodes.get(item.after).stage_id), branch_records[item.after], context) === choice, 'choice differs from approved routing fact');
  }
  const approved = Object.entries(approvals).filter(([id]) => state.active.has(id)).map(([id, approval]) => {
    assertApproval(approval, { ...context, step_id: id, artifact_digest: context.artifact_digests[id] });
    return id;
  });
  requireThat(readyNodes(workflow, stages, { choices, approved, running: running.map(run => run.step_id) }).ready.includes(stepId), 'step is not ready');
  const node = state.nodes.get(stepId);
  const stage = state.definitions.get(node.stage_id);
  const writes = stage.capabilities.includes('product.write');
  requireThat(!running.some(run => (writes && run.product_access !== 'none') || (product_access !== 'none' && run.product_access === 'write')), 'product writer/readers exclusion');
  if (stage.kind === 'implementation') requireThat(approved.includes(node.authority), 'implementation authority not approved');
  return { step_id: stepId, capabilities: stage.capabilities.slice(), required_gate_kinds: stage.kind === 'verification' ? GATE_KINDS.slice() : [] };
}

export function assertToolRequest(stage, binding, { locked_binding, available_operations, authorization, work_id, lock_digest }) {
  requireThat(stage.tool_binding_ids?.includes(binding.id), 'stage did not request registered tool operation');
  requireThat(locked_binding?.authorization_ref === null && digest({ ...binding, authorization_ref: null }) === digest(locked_binding), 'runtime tool binding differs from locked definition');
  requireThat(['read', 'write'].includes(binding.effect), 'unknown tool effect');
  requireThat(available_operations?.some(operation => ['connector', 'operation', 'effect', 'input_contract', 'output_contract'].every(key => operation[key] === binding[key])), 'tool operation/schema unavailable');
  requireThat(binding.authorization_ref && authorization?.ref === binding.authorization_ref && authorization.source === 'user' && authorization.actor, 'tool authorization missing');
  requireThat(authorization.revoked !== true && authorization.status !== 'revoked' && !authorization.revoked_at, 'tool authorization revoked');
  for (const key of ['connector', 'operation', 'effect', 'target']) requireThat(authorization[key] === binding[key], `tool authorization scope mismatch: ${key}`);
  requireThat(authorization.work_id === work_id && authorization.lock_digest === lock_digest, 'stale tool authorization');
  return true;
}

export function canAutoApprove(workflow, stage, { risk, step_id, work_id, lock_digest, policy, paths = [], commands = [] }) {
  return Boolean(workflow.intent === 'delivery' && workflow.id !== 'core.standard'
    && workflow.nodes.some(node => node.step_id === step_id && node.stage_id === stage.id)
    && workflow.risk_ceiling === 'low' && stage.auto_eligible && risk === 'low'
    && !['release_readiness', 'learning'].includes(stage.kind)
    && policy?.mode === 'auto_low_risk' && policy.authorization?.source === 'user'
    && policy.revoked !== true && !policy.revoked_at && policy.status !== 'revoked'
    && policy.authorization?.actor && policy.authorization?.statement
    && policy.work_id === work_id && policy.lock_digest === lock_digest
    && policy.steps?.includes(step_id)
    && paths.every(path => policy.allowed_write_paths?.includes(path))
    && commands.every(command => policy.allowed_commands?.includes(command)));
}

export function validateVerification(verification, candidate, { approved_commands = [] } = {}) {
  requireThat(candidate?.digest && candidate.implementation_runs?.length, 'frozen implementation candidate required');
  for (const key of ['work_id', 'lock_digest']) requireThat(verification[key] === candidate[key] && candidate[key], `candidate mismatch: ${key}`);
  requireThat(verification.candidate_digest === candidate.digest && verification.run_id, 'stale verification candidate');
  const implementers = candidate.implementation_runs.map(run => run.actor);
  requireThat(verification.actor && !implementers.includes(verification.actor), 'final verifier must be independent');
  requireThat(Array.isArray(verification.gates) && verification.gates.length === GATE_KINDS.length, 'both Gate contracts required');
  indexBy(verification.gates, 'kind', 'Gate kind');
  for (const kind of GATE_KINDS) {
    const gate = verification.gates.find(item => item.kind === kind);
    requireThat(gate?.status === 'PASS', `required ${kind} Gate did not pass`);
    requireThat(gate.candidate_digest === candidate.digest && gate.lock_digest === candidate.lock_digest && gate.work_id === candidate.work_id && gate.run_id === verification.run_id, 'stale Gate evidence');
    requireThat(gate.actor && !implementers.includes(gate.actor), 'Gate reviewer must be independent');
    requireThat(gate.checks?.some(check => check.blocking), 'executable blocking Gate check required');
    for (const check of gate.checks) {
      requireThat(check.command && approved_commands.includes(check.command) && check.evidence_digest, 'Gate command/evidence not approved');
      requireThat(!check.blocking || check.status === 'PASS', 'blocking Gate check failed');
      if (check.blocking) {
        requireThat(Number.isInteger(check.executed_count) && check.executed_count > 0 && check.skipped_count === 0 && check.exit_code === 0, 'blocking Gate must execute nonzero checks without skips or errors');
        requireThat(Array.isArray(check.raw_evidence) && check.raw_evidence.length > 0 && check.raw_evidence.every(ref => typeof ref.path === 'string' && ref.path && /^[a-f0-9]{64}$/.test(ref.sha256)), 'blocking Gate requires raw evidence references and digests');
        const evidencePaths = check.raw_evidence.map(ref => ref.path);
        requireThat(Array.isArray(check.rule_evidence) && check.rule_evidence.length > 0 && check.rule_evidence.every(rule => typeof rule.rule_id === 'string' && rule.rule_id && Array.isArray(rule.evidence_refs) && rule.evidence_refs.length > 0 && rule.evidence_refs.every(ref => evidencePaths.includes(ref))), 'blocking Gate requires nonzero rule evidence bound to raw outputs');
      }
    }
  }
  return true;
}

export function normalizeBuiltins(catalog, metadata, manifestVersion) {
  requireThat(metadata.contract_version === 1, 'unsupported builtin metadata');
  const stages = catalog.stages.map(core => {
    const semantic = metadata.stages[core.id];
    requireThat(semantic, `builtin semantic metadata missing: ${core.id}`);
    return {
      id: `core.${core.id}`, kind: semantic.kind, role: `core:agents/${core.agent}.md`, prompt: `core:${core.prompt}`,
      inputs: clone(semantic.inputs), optional_inputs: clone(semantic.optional_inputs),
      outputs: core.outputs.map(name => ({ name, contract: semantic.contracts[name], template: `core:${core.template_directory ?? `templates/${core.id}`}/${name}` })),
      capabilities: clone(semantic.capabilities), tool_binding_ids: [], auto_eligible: semantic.auto_eligible, routing_facts: clone(semantic.routing_facts ?? {}),
    };
  });
  const definitions = stageMap(stages);
  const workflows = Object.entries(catalog.profiles).map(([id, profile]) => {
    const nodes = [];
    for (const stageId of profile.stages) {
      const stage = definitions.get(`core.${stageId}`);
      const node = { step_id: stageId, stage_id: stage.id, bindings: {} };
      for (const contract of [...stage.inputs, ...stage.optional_inputs]) {
        const producer = [...nodes].reverse().find(prior => outputContracts(prior, definitions.get(prior.stage_id)).has(contract));
        if (producer) node.bindings[contract] = [producer.step_id];
        else if (EXTERNAL.has(contract)) node.bindings[contract] = [`$${contract}`];
      }
      if (stage.kind === 'implementation') node.authority = profile.implementation_authority;
      if (profile.output_overrides[stageId]) {
        const contracts = new Set(stage.outputs.map(output => output.contract));
        requireThat(contracts.size === 1, 'builtin override needs an unambiguous contract');
        node.outputs = profile.output_overrides[stageId].map(output => ({ ...output, contract: [...contracts][0], template: `core:${output.template}` }));
      }
      nodes.push(node);
    }
    return {
      id: `core.${id}`, intent: 'delivery', risk_ceiling: id === 'standard' ? 'any' : 'low', entry: nodes[0].step_id, nodes,
      edges: nodes.slice(1).map((node, i) => ({ from: nodes[i].step_id, to: node.step_id })), switches: [],
      terminals: [{ step_id: profile.terminal_stage, outcome: profile.terminal_stage === 'learn' ? 'learned' : 'verified' }],
    };
  });
  requireThat(manifestVersion === undefined || (typeof manifestVersion === 'string' && manifestVersion), 'manifest version must be a nonempty string');
  const pack = { contract_version: 1, core_contract: 1, id: 'core', version: manifestVersion ?? 'synthetic-unversioned', stages, workflows, overrides: [], tool_bindings: [] };
  resolveDefinitions(pack);
  return pack;
}
