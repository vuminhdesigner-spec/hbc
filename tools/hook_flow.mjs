#!/usr/bin/env node
/**
 * PostToolUse hook: sửa flows/*.flow.json|*.tracking.json, tools/runtime|lib/* hoặc ds/angular-map.json thì build + verify
 * flow đó ngay. Hỏng thì exit 2 để lỗi quay lại agent tự sửa; file khác thì im lặng.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

let input = '';
for await (const c of process.stdin) input += c;
const file = JSON.parse(input || '{}').tool_input?.file_path ?? '';
const rel = path.relative(process.cwd(), file).split(path.sep).join('/');
let targets = [];
if (/^flows\/[^/]+\.flow\.json$/.test(rel)) targets = [rel];
else if (/^flows\/[^/]+\.tracking\.json$/.test(rel)) targets = [rel.replace('.tracking.json', '.flow.json')];
else if (/^tools\/(runtime\/|lib\/|build_flow\.mjs)/.test(rel) || rel === 'ds/angular-map.json') targets = fs.readdirSync('flows').filter((f) => f.endsWith('.flow.json')).map((f) => `flows/${f}`);
if (!targets.length) process.exit(0);

for (const t of targets) {
  try {
    const id = JSON.parse(fs.readFileSync(t, 'utf8')).id;
    execFileSync('node', ['tools/build_flow.mjs', t], { stdio: 'pipe' });
    execFileSync('node', ['tools/verify_flow.mjs', `dist/${id}.html`], { stdio: 'pipe' });
  } catch (e) {
    process.stderr.write(`handoff ${t} hỏng:\n${e.stdout ?? ''}${e.stderr ?? ''}${e.message}\n`);
    process.exit(2);
  }
}
