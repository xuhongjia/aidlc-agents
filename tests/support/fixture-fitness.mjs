// Maintainer reference gate for the fixture's restricted, static .mjs module graph.
// NOT the Architect leaf's delivered gate, and NOT a general JavaScript parser.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
export function sourceFiles(root, prefix = '') {
  return readdirSync(path.join(root,prefix), {withFileTypes:true}).flatMap(entry => {
    const name = path.join(prefix,entry.name);
    if (entry.isSymbolicLink()) throw new Error('symlink');
    return entry.isDirectory() ? sourceFiles(root,name) : [name];
  }).sort();
}
export function candidate(root) {
  return sourceFiles(root).map(file => ({path:file,sha256:createHash('sha256').update(readFileSync(path.join(root,file))).digest('hex')}));
}
export function architectureGate(root) {
  const edges=[], violations=[];
  const files=sourceFiles(path.join(root,'src')).map(f=>`src/${f}`);
  for (const file of files) {
    const code=readFileSync(path.join(root,file),'utf8');
    // Fail closed on unsupported loading syntax in this intentionally small fixture.
    if (/\b(?:require|eval|Function)\s*\(|\bimport\s*\(/.test(code)) violations.push(`${file}: non-static loading`);
    const matches=[...code.matchAll(/\b(?:import|export)\s+(?:[^;]*?\s+from\s+)?['"]([^'"]+)['"]/g)];
    for (const match of matches) {
      const specifier=match[1];
      const to=specifier.startsWith('.') ? path.posix.normalize(path.posix.join(path.posix.dirname(file),specifier)) : specifier;
      edges.push({from:file,to});
      if (specifier.startsWith('.') && !files.includes(to)) violations.push(`${file}: unresolved ${to}`);
      if (file.startsWith('src/domain/') && !to.startsWith('src/domain/')) violations.push(`${file}: forbidden dependency ${to}`);
    }
  }
  return {kind:'architecture',candidate:candidate(root),checks:files.length,edges,violations,status:violations.length?'FAIL':'PASS'};
}
export function assertGatePair(architecture,quality,frozen) {
  for (const [report,kind] of [[architecture,'architecture'],[quality,'quality']]) {
    if (report.kind !== kind || report.status !== 'PASS' || report.checks < 1 || !report.rawEvidence || JSON.stringify(report.candidate)!==JSON.stringify(frozen)) throw new Error(`invalid ${kind} gate`);
    if (report.skipped || report.exitCode !== 0 || !report.relevantChecks?.length) throw new Error(`ineffective ${kind} gate`);
  }
}
