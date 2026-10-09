#!/usr/bin/env node
/**
 * seshat_upload.mjs — tải dist/<flow>.html lên Seshat (project = handoff.config.json › seshatProject, ghi đè <flow>.html) rồi deploy.
 *   npm run seshat -- <flow> [<flow>…]      bỏ <flow> = mọi dist/*.html
 * Gọi thẳng endpoint MCP omSeshat (URL + Authorization lấy từ ~/.claude.json) vì file quá lớn để qua tool call.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PROJECT = JSON.parse(fs.readFileSync(path.join(root, 'handoff.config.json'), 'utf8')).seshatProject;
if (!PROJECT) { console.error('LỖI: thiếu seshatProject trong handoff.config.json'); process.exit(1); }
const cfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.claude.json'), 'utf8')).mcpServers?.omSeshat;
if (!cfg?.url) { console.error('LỖI: không thấy mcpServers.omSeshat trong ~/.claude.json'); process.exit(1); }

let flows = process.argv.slice(2);
if (!flows.length) flows = fs.readdirSync(path.join(root, 'dist')).filter((f) => f.endsWith('.html')).map((f) => f.slice(0, -5));

let sid = null, id = 0;
async function rpc(method, params, notify = false) {
  const headers = { ...cfg.headers, 'content-type': 'application/json', accept: 'application/json, text/event-stream' };
  if (sid) headers['mcp-session-id'] = sid;
  const body = notify ? { jsonrpc: '2.0', method, params } : { jsonrpc: '2.0', id: ++id, method, params };
  const r = await fetch(cfg.url, { method: 'POST', headers, body: JSON.stringify(body) });
  sid = r.headers.get('mcp-session-id') ?? sid;
  const text = await r.text();
  if (!r.ok) throw new Error(`${method}: HTTP ${r.status} ${text.slice(0, 300)}`);
  if (notify) return;
  /* Phản hồi là JSON hoặc SSE (dòng data:). */
  const j = text.trimStart().startsWith('{') ? JSON.parse(text) : JSON.parse(text.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5)).pop());
  if (j.error) throw new Error(`${method}: ${JSON.stringify(j.error)}`);
  return j.result;
}
async function tool(name, args) {
  const res = await rpc('tools/call', { name, arguments: args });
  const text = res.content?.map((c) => c.text).join('') ?? '';
  if (res.isError) throw new Error(`${name}: ${text}`);
  return JSON.parse(text);
}

await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'mdm-seshat-upload', version: '1' } });
await rpc('notifications/initialized', {}, true);

const files = flows.map((f) => {
  const p = path.join(root, 'dist', `${f}.html`);
  if (!fs.existsSync(p)) { console.error(`LỖI: thiếu dist/${f}.html — chạy npm run handoff -- ${f}`); process.exit(1); }
  console.log(`tải lên: ${f}.html  ${Math.round(fs.statSync(p).size / 1024)} KB`);
  return { path: `${f}.html`, content: fs.readFileSync(p, 'utf8'), encoding: 'utf8' };
});
await tool('seshat_write_project_files', { project: PROJECT, files });

const { jobId } = await tool('seshat_deploy_project', { project: PROJECT });
for (let i = 0; i < 30; i++) {
  const s = await tool('seshat_get_deployment_status', { project: PROJECT, jobId });
  if (s.status === 'DONE') { console.log(`deploy xong → ${s.resultUrl}`); process.exit(0); }
  if (s.status === 'FAILED' || s.error) { console.error(`LỖI deploy: ${s.error ?? s.status}`); process.exit(1); }
  await new Promise((r) => setTimeout(r, 2000));
}
console.error(`deploy chưa xong sau 60 giây — job ${jobId}`);
process.exit(1);
