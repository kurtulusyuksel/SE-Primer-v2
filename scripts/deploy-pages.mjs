// GitHub Pages'e (gh-pages dalı) v2 derlemesini yayınlar.
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const remote = process.env.PAGES_REMOTE || 'https://github.com/kurtulusyuksel/SE-Primer-v2.git';

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} başarısız (${result.status}).`);
}

function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) copyTree(source, target);
    else copyFileSync(source, target);
  }
}

let work;
try {
  run(process.execPath, ['scripts/build-pages.mjs']);
  work = mkdtempSync(path.join(tmpdir(), 'se-primer-pages-'));
  copyTree(path.join(root, 'dist'), work);
  writeFileSync(path.join(work, '.nojekyll'), '');
  run('git', ['init', '-b', 'gh-pages'], work);
  run('git', ['add', '-A'], work);
  run('git', ['commit', '-m', 'deploy: SE Primer v2 GitHub Pages'], work);
  run('git', ['remote', 'add', 'origin', remote], work);
  for (let attempt = 1; attempt <= 3; attempt++) {
    const result = spawnSync('git', ['-c', 'http.postBuffer=524288000', '-c', 'http.version=HTTP/1.1',
      'push', '--force', 'origin', 'gh-pages'], { cwd: work, stdio: 'inherit' });
    if (result.status === 0) break;
    if (attempt === 3) throw new Error('gh-pages push üç denemede başarısız oldu.');
    console.log(`Push başarısız; tekrar deneniyor (${attempt}/3)...`);
  }
  console.log('Yayın adresi: https://kurtulusyuksel.github.io/SE-Primer-v2/');
} catch (error) {
  console.error(`[HATA] ${error.message}`);
  process.exitCode = 1;
} finally {
  if (work) rmSync(work, { recursive: true, force: true });
}
