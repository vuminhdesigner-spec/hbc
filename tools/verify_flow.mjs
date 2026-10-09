#!/usr/bin/env node
/**
 * verify_flow.mjs — chạy self-test của viewer (`#__selftest`) trong Chrome headless,
 * HAI lượt:
 *   same     iframe thường — như mở file trên máy
 *   sandbox  iframe sandbox không allow-same-origin — như công cụ deploy nhúng trang
 * Mỗi step: mở được, không lỗi JS, có component, không ảnh vỡ, không tràn ngang ở
 * 1024/1440/1920, viewport đúng W×H, link chuyển step. Step đầu: Inspect, thu gọn 2 bên,
 * selector của flows/<id>.tracking.json (nếu có) có trong màn; selector ghim của changes có trong màn của step.
 *
 *   node tools/verify_flow.mjs dist/doi-tac.html
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const file = process.argv[2];
if (!file || !fs.existsSync(file)) { console.error('Dùng: node tools/verify_flow.mjs dist/<flow>.html'); process.exit(2); }
const CHROME = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/usr/bin/google-chrome', '/usr/bin/chromium']
  .find((p) => fs.existsSync(p));
if (!CHROME) { console.error('Không tìm thấy Chrome.'); process.exit(2); }

const harness = `<!doctype html><meta charset="utf-8"><body style="margin:0"><script>
const modes = [['same', null], ['sandbox', 'allow-scripts allow-popups allow-forms allow-modals']];
(async () => {
  const out = {};
  for (const [mode, sandbox] of modes) {
    const f = document.createElement('iframe');
    f.style.cssText = 'width:1440px;height:900px;border:0';
    if (sandbox) f.setAttribute('sandbox', sandbox);
    const done = new Promise((r) => {
      const on = (e) => { if (e.source === f.contentWindow && e.data && e.data.mdmSelftest) { removeEventListener('message', on); r(e.data.mdmSelftest); } };
      addEventListener('message', on);
      setTimeout(() => r(null), 600000);
    });
    f.src = '/flow.html#__selftest';
    document.body.appendChild(f);
    out[mode] = await done;
    f.remove();
  }
  await fetch('/__result__', { method: 'POST', body: JSON.stringify(out) });
})();
</script>`;

let deliver;
const got = new Promise((r) => (deliver = r));
const server = createServer(async (req, res) => {
  if (req.url === '/__result__') {
    const b = []; for await (const c of req) b.push(c);
    res.writeHead(204).end(); deliver(JSON.parse(Buffer.concat(b).toString()));
  } else if (req.url.startsWith('/flow.html')) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(fs.readFileSync(file));
  } else if (req.url === '/') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(harness);
  } else res.writeHead(404).end();
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const child = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--disable-extensions',
  `--user-data-dir=${fs.mkdtempSync(path.join(os.tmpdir(), 'mdm-verify-'))}`, '--window-size=1500,1000',
  `http://127.0.0.1:${server.address().port}/`], { stdio: 'ignore' });
const timer = setTimeout(() => deliver({ fatal: 'hết giờ (1220s)' }), 1_220_000);
const out = await got;
clearTimeout(timer); child.kill('SIGKILL'); server.close();
if (out.fatal) { console.error('LỖI:', out.fatal); process.exit(1); }

let bad = 0;
for (const [mode, results] of Object.entries(out)) {
  console.log(`— ${mode === 'same' ? 'cùng origin (mở file trên máy)' : 'iframe sandbox (như công cụ deploy)'}`);
  if (!results) { console.log('FAIL  self-test không trả kết quả'); bad++; continue; }
  for (const r of results) {
    const over = Object.entries(r.overflow ?? {}).filter(([, v]) => v !== 0);
    const fail = !r.ready || r.errors?.length || !r.components || r.broken?.length || over.length || (r.link && !r.link.to);
    if (fail) bad++;
    console.log(`${fail ? 'FAIL' : ' ok '}  ${r.step.padEnd(22)} component ${String(r.components).padStart(2)}  ảnh vỡ ${r.broken?.length ?? '-'}  tràn ${over.length ? over.map(([w, v]) => `${w}:${v}`).join(' ') : '0 @1024/1440/1920'}` +
      (r.link ? `  link ${r.link.href} → ${r.link.to ?? 'KHÔNG CHUYỂN'}` : ''));
    for (const b of r.broken ?? []) console.log(`        ảnh vỡ: ${b}`);
    for (const e of r.errors ?? []) console.log(`        lỗi JS: ${e}`);
    if (r.inspect !== undefined) {
      const ok = r.inspect && r.inspect.heading === 'button' && r.inspect.tokens > 0;
      if (!ok) bad++;
      console.log(`${ok ? ' ok ' : 'FAIL'}  inspect .button: ${r.inspect ? `"${r.inspect.heading}", ${r.inspect.tokens} token` : 'không phản hồi'}`);
    }
    if (r.fit?.length && r.inspect !== undefined) {
      const ok = r.fit.every((f) => f.width === f.w && f.height === f.h && f.stageOverflow <= 0);
      if (!ok) bad++;
      console.log(`${ok ? ' ok ' : 'FAIL'}  scale vừa khung: ${r.fit.map((f) => f.label + (f.width !== f.w || f.height !== f.h ? ` (viewport ${f.width}×${f.height}!)` : '')).join(' | ')}`);
    }
    if (r.tracking) {
      const miss = r.tracking.filter((t) => !t.found);
      if (miss.length) bad++;
      console.log(`${miss.length ? 'FAIL' : ' ok '}  tracking: ${r.tracking.length - miss.length}/${r.tracking.length} selector có trong màn`);
      for (const t of miss) console.log(`        thiếu: ${t.event}@${t.screen} ${t.selector}`);
    }
    if (r.pins) {
      const miss = r.pins.filter((x) => !x.found);
      if (miss.length) bad++;
      console.log(`${miss.length ? 'FAIL' : ' ok '}  ghim thay đổi: ${r.pins.length - miss.length}/${r.pins.length} selector có trong màn`);
      for (const x of miss) console.log(`        thiếu: ${r.step} ${x.sel}`);
    }
    if (r.collapse) {
      const ok = r.collapse.closed && r.collapse.reopened && r.collapse.grew > 0;
      if (!ok) bad++;
      console.log(`${ok ? ' ok ' : 'FAIL'}  thu gọn 2 bên: khung màn rộng thêm ${r.collapse.grew}px`);
    }
  }
}
process.exit(bad ? 1 : 0);
