#!/usr/bin/env node
/**
 * handoff.mjs — build + verify một flow (hoặc tất cả) trong một lệnh.
 *   npm run handoff -- doi-tac        npm run handoff   (mọi flow)
 *   npm run handoff -- doi-tac --release --note "…" --ticket MDM-…   (phát hành vN)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const want = process.argv[2]?.startsWith('--') ? null : process.argv[2];
const extra = process.argv.slice(want ? 3 : 2);
if (extra.includes('--release') && !want) { console.error('--release cần tên một flow.'); process.exit(2); }
const flows = fs.readdirSync('flows').filter((f) => f.endsWith('.flow.json'))
  .filter((f) => !want || f === `${want}.flow.json`);
if (!flows.length) { console.error(`Không có flows/${want}.flow.json`); process.exit(2); }
let failed = 0;
for (const f of flows) {
  const id = JSON.parse(fs.readFileSync(`flows/${f}`, 'utf8')).id;
  try {
    execFileSync('node', ['tools/build_flow.mjs', `flows/${f}`, ...extra], { stdio: 'inherit' });
    execFileSync('node', ['tools/verify_flow.mjs', `dist/${id}.html`], { stdio: 'inherit' });
  } catch { failed++; }
}
process.exit(failed ? 1 : 0);
