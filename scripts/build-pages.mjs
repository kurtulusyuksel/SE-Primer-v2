// GitHub Pages için alt yol tabanlı üretim derlemesi.
import { spawnSync } from 'node:child_process';

function run(args, env = {}) {
  const result = spawnSync(process.execPath, args, {
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(['scripts/sync-model.mjs']);
run(['node_modules/vite/bin/vite.js', 'build'], { GITHUB_PAGES: 'true' });
