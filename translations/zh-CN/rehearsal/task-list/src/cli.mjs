import { readFileSync } from 'node:fs';
import { listTasks } from './domain/tasks.mjs';

try {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--file', '--search'].includes(args[i]) || args[i + 1] === undefined) {
      throw new Error('usage: --file PATH [--search TEXT]');
    }
    if (Object.hasOwn(options, args[i].slice(2))) throw new Error('duplicate option');
    options[args[i].slice(2)] = args[i + 1];
  }
  if (!options.file) throw new Error('--file is required');
  const tasks = JSON.parse(readFileSync(options.file, 'utf8'));
  if (!Array.isArray(tasks) || tasks.some(t => typeof t.title !== 'string')) throw new Error('invalid tasks');
  process.stdout.write(`${JSON.stringify(listTasks(tasks, options))}\n`);
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 2;
}
