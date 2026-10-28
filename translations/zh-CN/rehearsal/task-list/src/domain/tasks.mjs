// Rehearsal baseline: intentionally contains the reported empty-search count bug.
export function listTasks(tasks, { search = '' } = {}) {
  const items = tasks.filter(task => task.title.toLowerCase().includes(search.toLowerCase()));
  return { items, total: items.length || 1 };
}
