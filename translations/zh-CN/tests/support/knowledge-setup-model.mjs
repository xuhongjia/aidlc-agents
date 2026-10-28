// Synthetic onboarding contract only: no network, installation, login or writes.
export function knowledgeSetup(config, target, { purpose, requested = false, install_authorized = false,
  cli = 'missing', authenticated = false, read_verified = false } = {}) {
  const unchanged = () => structuredClone(config);
  if (purpose !== 'setup' || !requested) return { status: 'pending', actions: [], config: unchanged() };
  if (cli === 'error') return { status: 'blocked', actions: [], config: unchanged() };
  if (cli === 'missing') return { status: 'pending_install', actions: install_authorized ? ['install_twg'] : [],
    config: unchanged() };
  if (cli !== 'present') throw new Error('unknown CLI state');
  if (!authenticated) return { status: 'pending_auth', actions: ['user_login'], config: unchanged() };
  if (!read_verified) return { status: 'pending_target', actions: ['read_target'], config: unchanged() };
  const types = ['architecture', 'quality', 'anti_pattern', 'lesson'];
  if (target.provider !== 'confluence_cloud' || target.transport !== 'twg_cli'
    || !target.id || !target.space_id || !target.parent_page_id || !target.types?.length
    || new Set(target.types).size !== target.types.length || target.types.some(type => !types.includes(type))) throw new Error('invalid target');
  const url = new URL(target.site);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('invalid site');
  const saved = unchanged();
  saved.knowledge ??= { targets: [] };
  const current = saved.knowledge.targets.find(item => item.id === target.id);
  // A changed destination needs a new explicit configuration decision, not silent replacement.
  if (current && JSON.stringify(current) !== JSON.stringify(target)) return { status: 'conflict', actions: [], config: unchanged() };
  if (!current) saved.knowledge.targets.push(structuredClone(target));
  return { status: 'configured', actions: [], config: saved };
}
