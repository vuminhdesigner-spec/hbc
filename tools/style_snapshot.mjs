#!/usr/bin/env node
/**
 * style_snapshot.mjs — chụp computed style + hộp của MỌI phần tử trên các màn,
 * để chứng minh một refactor (bỏ CSS, bỏ comment, dời file) không đổi giao diện.
 *
 *   node tools/style_snapshot.mjs --root . --out a.json [--flow flows/doi-tac.flow.json]
 *   node tools/style_snapshot.mjs --compare a.json b.json
 *
 * --root: thư mục có screens/ (mặc định repo này). Mặc định chụp mọi step của
 * mọi flow, gồm cả query (?state=empty). Chỉ chụp trạng thái lúc tải trang.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
const HERE = path.dirname(fileURLToPath(import.meta.url));

if (argv.includes('--compare')) {
  const [a, b] = argv.slice(argv.indexOf('--compare') + 1).map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
  let diff = 0;
  for (const s of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[s], y = b[s];
    if (!x || !y) { console.log(`KHÁC  ${s}: chỉ có ở ${x ? 'bản trước' : 'bản sau'}`); diff++; continue; }
    const out = [];
    if (x.length !== y.length) out.push(`số phần tử ${x.length} → ${y.length}`);
    for (let i = 0; i < Math.min(x.length, y.length) && out.length < 5; i++) {
      if (x[i].join('|') !== y[i].join('|')) out.push(`${x[i][0]}  ${x[i][1] !== y[i][1] ? `hộp ${x[i][1]} → ${y[i][1]}` : `style khác (${x[i][3] ?? ''})`}`);
    }
    if (out.length) { diff++; console.log(`KHÁC  ${s}\n        ${out.join('\n        ')}`); }
    else console.log(` giống ${s} (${x.length} phần tử)`);
  }
  console.log(diff ? `\n${diff} màn khác.` : '\nMọi màn giống hệt.');
  process.exit(diff ? 1 : 0);
}

const ROOT = path.resolve(opt('--root', path.resolve(HERE, '..')));
const OUT = opt('--out', 'style-snapshot.json');
const flowFiles = argv.includes('--flow') ? [opt('--flow')] : fs.readdirSync(path.join(HERE, '../flows')).filter((f) => f.endsWith('.flow.json')).map((f) => path.join(HERE, '../flows', f));
const pages = [...new Set(flowFiles.flatMap((f) => JSON.parse(fs.readFileSync(f, 'utf8')).steps.map((s) => `/screens/${s.screen}.html${s.query || ''}`)))];

const harness = `<!doctype html><meta charset="utf-8"><body style="margin:0">
<iframe id="f" style="width:1440px;height:900px;border:0"></iframe><script>
const pages = ${JSON.stringify(pages)};
const RAW = ${argv.includes('--raw')};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function fnv(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
(async () => {
  const f = document.getElementById('f'), out = {};
  for (const p of pages) {
    try { sessionStorage.clear(); localStorage.clear(); } catch (_) {}
    await new Promise((r) => { f.onload = r; f.src = p; });
    await sleep(900);
    const W = f.contentWindow, doc = W.document, rows = [];
    for (const el of doc.body.querySelectorAll('*')) {
      if (/^(SCRIPT|STYLE|TEMPLATE)$/.test(el.tagName)) continue;
      let key = el.tagName.toLowerCase(), n = el;
      while (n.parentElement && n.parentElement !== doc.body) { const i = [...n.parentElement.children].filter((c) => !/^(SCRIPT|STYLE|TEMPLATE)$/.test(c.tagName)).indexOf(n); key = n.parentElement.tagName.toLowerCase() + ':' + i + '>' + key; n = n.parentElement; }
      const r = el.getBoundingClientRect(), cs = W.getComputedStyle(el);
      const props = []; for (let i = 0; i < cs.length; i++) props.push(cs[i] + ':' + cs.getPropertyValue(cs[i]));
      let all = props.sort().join(';');   // Chrome liệt kê custom property theo thứ tự không cố định
      all = all.split(W.location.origin).join('');   // url() tuyệt đối mang port ngẫu nhiên của server
      rows.push([key.slice(-120), [r.x, r.y, r.width, r.height].map((v) => Math.round(v)).join(','), RAW ? all : fnv(all), (el.className && el.className.baseVal === undefined ? el.className : '').slice(0, 60)]);
    }
    out[p] = rows;
  }
  await fetch('/__result__', { method: 'POST', body: JSON.stringify(out) });
})();
</script>`;

const CHROME = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => fs.existsSync(p));
if (!CHROME) { console.error('Không tìm thấy Chrome.'); process.exit(2); }
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
let deliver; const got = new Promise((r) => (deliver = r));
const server = createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/__result__') { const b = []; for await (const c of req) b.push(c); res.writeHead(204).end(); deliver(Buffer.concat(b).toString()); return; }
  if (u.pathname === '/__harness__') { res.writeHead(200, { 'content-type': MIME['.html'] }).end(harness); return; }
  const abs = path.join(ROOT, decodeURIComponent(u.pathname));
  if (abs.startsWith(ROOT) && fs.existsSync(abs) && fs.statSync(abs).isFile()) res.writeHead(200, { 'content-type': MIME[path.extname(abs)] ?? 'application/octet-stream' }).end(fs.readFileSync(abs));
  else res.writeHead(404).end();
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const child = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--disable-extensions', '--hide-scrollbars',
  `--user-data-dir=${fs.mkdtempSync(path.join(os.tmpdir(), 'mdm-snap-'))}`, '--window-size=1500,1000',
  `http://127.0.0.1:${server.address().port}/__harness__`], { stdio: 'ignore' });
const t = setTimeout(() => deliver(null), 120_000);
const json = await got;
clearTimeout(t); child.kill('SIGKILL'); server.close();
if (!json) { console.error('Hết giờ.'); process.exit(1); }
fs.writeFileSync(OUT, json);
const data = JSON.parse(json);
console.log(`→ ${OUT}: ${Object.keys(data).length} màn, ${Object.values(data).reduce((s, r) => s + r.length, 0)} phần tử (${ROOT})`);
