#!/usr/bin/env node
/**
 * build_flow.mjs — gộp một flow nhiều màn (screens/ + ds/) thành MỘT file HTML.
 *
 *   node tools/build_flow.mjs flows/doi-tac.flow.json      -> dist/doi-tac.html
 *
 * Nguyên tắc:
 * - Không sinh markup, không sửa màn. Màn là screens/<path>.html của repo này,
 *   nguyên văn; token --utui-* đi vào nguyên xi, var() không bị resolve.
 * - CSS/JS/ảnh dùng chung được lưu MỘT lần trong file và ghép vào từng màn lúc
 *   mở (iframe srcdoc), nên 8 màn không phải 8 bản sao app.css.
 * - Thay đổi duy nhất lên code gốc: tham chiếu `location` trong JS được viết lại
 *   thành `__mdm.location` (xem runtime/shim.js). Build in ra số chỗ đã viết lại.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { stripCss, stripJs, stripHtml, KEEP } from './lib/strip_comments.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'handoff.config.json'), 'utf8'));
const SRC = ROOT;   // nguồn là chính repo này: ds/ + screens/
const DEV = path.resolve(ROOT, cfg.devDs);

const flowFile = process.argv[2];
if (!flowFile) { console.error('Dùng: node tools/build_flow.mjs flows/<ten>.flow.json [--release --note "…" --ticket MDM-…]'); process.exit(2); }
const argv = process.argv.slice(3);
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const RELEASE = argv.includes('--release');
const flow = JSON.parse(fs.readFileSync(path.resolve(flowFile), 'utf8'));

const rel = (abs) => path.relative(SRC, abs).split(path.sep).join('/');
const isRemote = (u) => /^(https?:|\/\/|data:|#|%23|mailto:|tel:|javascript:)/i.test(u);
const MIME = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff' };

const problems = [];          // lỗi: build hỏng
const warnings = [];          // cảnh báo: build xong nhưng cần người xem
const css = {}, js = {}, assets = {};
let locationRewrites = 0;

/* ----------------------------------------------------------------- assets */
function dataUri(abs) {
  const mime = MIME[path.extname(abs).toLowerCase()];
  if (!mime) return null;
  const buf = fs.readFileSync(abs);
  return mime === 'image/svg+xml'
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buf.toString('utf8'))}`
    : `data:${mime};base64,${buf.toString('base64')}`;
}
function addAsset(abs) {
  const key = rel(abs);
  if (!assets[key]) { const d = dataUri(abs); if (d) assets[key] = d; }
  return assets[key] ? key : null;
}
/* JS dựng đường dẫn ảnh lúc chạy ("…/assets/file-type-icons/file-" + ext): lấy
   cả thư mục mà một chuỗi trong JS trỏ vào, vì không đoán được file nào. */
function harvestJsAssets(code, fromDir) {
  for (const m of code.matchAll(/["'`]((?:\.\.\/)+(?:ds\/)?assets\/[A-Za-z0-9_./-]*)/g)) {
    const abs = path.resolve(fromDir, m[1]);
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) { addAsset(abs); continue; }
    const dir = fs.existsSync(abs) && fs.statSync(abs).isDirectory() ? abs : path.dirname(abs);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isFile()) addAsset(p);
    }
  }
}

/* -------------------------------------------------------------------- CSS */
/* Trả về danh sách khoá theo đúng thứ tự cascade: import trước, thân file sau. */
function cssChunks(abs, seen) {
  if (seen.has(abs)) return [];
  seen.add(abs);
  if (!fs.existsSync(abs)) { problems.push(`CSS không tồn tại: ${rel(abs)}`); return []; }
  const src = fs.readFileSync(abs, 'utf8');
  const dir = path.dirname(abs);
  const out = [];
  const body = src.replace(/@import\s+(?:url\()?["']([^"']+)["']\)?\s*;/g, (_m, href) => {
    if (isRemote(href)) { warnings.push(`@import từ xa giữ nguyên: ${href}`); return _m; }
    out.push(...cssChunks(path.resolve(dir, href), seen));
    return '';
  }).replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/g, (m, _q, u) => {
    if (isRemote(u)) return m;
    const a = path.resolve(dir, u);
    if (!fs.existsSync(a)) { problems.push(`url() không tồn tại trong ${rel(abs)}: ${u}`); return m; }
    const key = addAsset(a);
    return key ? `url("${assets[key]}")` : m;
  });
  const key = rel(abs);
  css[key] = stripCss(body, { keep: key.startsWith('screens/') ? KEEP : null });
  out.push(key);
  return out;
}

/* --------------------------------------------------------------------- JS */
function rewriteLocation(code) {
  let n = 0;
  const out = code
    .replace(/\b(?:window|global|self|globalThis)\.location\b(?![\w$])/g, () => { n++; return '__mdm.location'; })
    .replace(/(?<![\w$.'"`-])location\.(?=[a-zA-Z])/g, () => { n++; return '__mdm.location.'; });
  locationRewrites += n;
  return out;
}
/* Bỏ comment xong phải biên dịch được — nếu không là bộ quét cắt nhầm, dừng build. */
function checkJs(code, label) {
  try { new vm.Script(code, { filename: label }); } catch (e) { problems.push(`JS sau khi bỏ comment không hợp lệ: ${label} — ${e.message}`); }
  return code;
}
function addJs(abs) {
  const key = rel(abs);
  if (!js[key]) {
    const code = fs.readFileSync(abs, 'utf8');
    harvestJsAssets(code, path.dirname(abs));
    js[key] = checkJs(stripJs(rewriteLocation(code), { keep: key.startsWith('screens/') ? KEEP : null }), key);
  }
  return key;
}

/* ----------------------------------------------------------------- screen */
const screens = {};
const screenKeys = new Set(flow.steps.map((s) => s.screen));

function buildScreen(key) {
  const abs = path.join(SRC, 'screens', key + '.html');
  if (!fs.existsSync(abs)) { problems.push(`Màn không tồn tại: screens/${key}.html`); return; }
  screens[key] = processScreen(key, fs.readFileSync(abs, 'utf8'));
}
/* HTML màn → bản dùng trong viewer; past = HTML lấy từ git của bản cũ (CSS/JS/ảnh vẫn của hiện tại, không báo cảnh báo link). */
function processScreen(key, html, past) {
  const abs = path.join(SRC, 'screens', key + '.html');
  const dir = path.dirname(abs);
  const title = (html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? key).replace(/^MDM\s*-\s*/, '').trim();

  html = html.replace(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi, (tag) => {
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
    if (!href || isRemote(href)) return tag;
    if (past && !fs.existsSync(path.resolve(dir, href))) return '';
    const keys = cssChunks(path.resolve(dir, href), new Set());
    return `<style data-mdm-css="${keys.join('|')}"></style>`;
  });

  html = html.replace(/<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)>\s*<\/script>/gi, (tag, _a, src) => {
    if (isRemote(src)) return tag;
    const a = path.resolve(dir, src);
    if (!fs.existsSync(a)) { if (!past) problems.push(`Script không tồn tại trong ${key}: ${src}`); return tag; }
    return `<script data-mdm-js="${addJs(a)}"></script>`;
  });

  // script inline của màn
  html = html.replace(/<script\b(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi, (tag, attrs, code) => {
    if (/type=["'](?!text\/javascript|module)/i.test(attrs) || !code.trim()) return tag;
    harvestJsAssets(code, dir);
    return `<script${attrs}>${checkJs(stripJs(rewriteLocation(code), { keep: KEEP }), `${key} (inline)`)}</script>`;
  });

  // ảnh/asset tĩnh trong thuộc tính
  html = html.replace(/\b(src|href|poster)=["']([^"']+)["']/gi, (m, attr, u) => {
    if (isRemote(u) || /\.html(?:[?#].*)?$/i.test(u) || u.startsWith('__MDM')) return m;
    const a = path.resolve(dir, u.split(/[?#]/)[0]);
    if (!fs.existsSync(a) || !fs.statSync(a).isFile()) return m;
    const k = addAsset(a);
    return k ? `${attr}="__MDM_ASSET__/${k}"` : m;
  });

  // link tĩnh tới màn ngoài flow: không hỏng build, nhưng người bàn giao cần biết
  if (!past) for (const m of html.matchAll(/href=["']([^"'#?]+\.html)/gi)) {
    const target = path.relative(path.join(SRC, 'screens'), path.resolve(dir, m[1])).split(path.sep).join('/').replace(/\.html$/, '');
    if (!screenKeys.has(target)) warnings.push(`${key} link tới màn ngoài flow: ${target}`);
  }

  html = html.replace(/<head([^>]*)>/i, (m) => `${m}\n    <script data-mdm-shim></script>`);
  return { title, html: stripHtml(html, { keep: KEEP }) };
}

for (const k of screenKeys) buildScreen(k);
flow.steps.forEach((s) => { s.title = s.title || screens[s.screen]?.title || s.screen; });
flow.screens = Object.fromEntries([...screenKeys].map((k) => [k, screens[k]?.title || k]));

/* --------------------------------------------------------------- registry */
const COMP_DIR = path.join(SRC, 'ds/components');
const registry = fs.readdirSync(COMP_DIR).filter((f) => f.endsWith('.json')).sort().map((f) => {
  const c = JSON.parse(fs.readFileSync(path.join(COMP_DIR, f), 'utf8'));
  // extra: sibling classes listed in parts/modifiers that are not block__x / block--x (e.g. .page-sticky, .page-header-block) — Inspect maps them to this component.
  const extra = [...(c.api?.parts ?? []), ...(c.api?.modifiers ?? [])].filter((x) => !x.startsWith(`${c.block}__`) && !x.startsWith(`${c.block}--`)).map((x) => x.slice(1).split('__')[0].split('--')[0]);
  return { name: c.name, block: c.block, extra: [...new Set(extra)], contract: c.sources?.contract ?? `ds/components/${c.name}.md` };
}).filter((c) => c.block);

/* ------------------------------------------------------------ DS của dev */
/* ds/angular-map.json: bản nháp modifier -> input (tools/angular_map_draft.mjs), dev xác nhận dần. */
const MAP_FILE = path.join(SRC, 'ds/angular-map.json');
if (!fs.existsSync(MAP_FILE)) warnings.push('Chưa có ds/angular-map.json — chạy node tools/angular_map_draft.mjs');
const angularMap = fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, 'utf8')) : {};
const angular = {};
for (const [name, a] of Object.entries(angularMap)) {
  if (name.startsWith('$')) continue;
  angular[name] = { selector: a.selector, file: a.file, inputs: a.inputs.map((i) => i.name), modifiers: a.modifiers, note: a.note };
}

let devTokens = {};
try {
  const lib = await import(pathToFileURL(path.join(HERE, 'lib/dev_tokens.mjs')).href);
  const map = lib.readDevTokens();
  if (map) for (const [n, v] of map) devTokens[n] = v.value;
  else warnings.push('Không đọc được token dev (design-system-of-dev) — bảng token dev sẽ trống.');
} catch (e) { warnings.push(`dev_tokens.mjs lỗi: ${e.message}`); }

/* ------------------------------------------------------------------- meta */
const tokenFiles = ['primitive', 'semantic', 'component'].map((t) => path.join(SRC, `ds/tokens/untitled-ui-${t}.css`));
const tokensHash = crypto.createHash('sha256').update(tokenFiles.map((f) => fs.readFileSync(f)).join('')).digest('hex').slice(0, 10);
const pkg = JSON.parse(fs.readFileSync(path.join(SRC, 'package.json'), 'utf8'));
const git = (...a) => { try { return execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } };
const dirty = git('status', '--porcelain', '--', 'ds', 'screens', 'flows', 'tools', 'handoff.config.json', 'package.json');
const meta = { builtAt: new Date().toLocaleString('sv-SE').slice(0, 16), tokensHash, source: `${pkg.name}@${pkg.version}`, gitSha: git('rev-parse', '--short', 'HEAD'), dirty: !!dirty };

/* ------------------------------------------------------------- phiên bản */
/* Hash step = HTML + file screens/ của màn (đã bỏ comment) + ảnh tĩnh + query; file ds/ hash riêng từng file,
   để sửa CSS dùng chung không đánh "Đổi" lên mọi step. Ảnh JS dựng lúc chạy không tính. */
const loadedFiles = (sc) => [...sc.html.matchAll(/data-mdm-(?:css|js)="([^"]+)"/g)].flatMap((m) => m[1].split('|'));
const hashOf = (t) => crypto.createHash('sha256').update(t).digest('hex').slice(0, 10);
function stepHash(s) {
  const sc = screens[s.screen];
  if (!sc) return null;
  const h = crypto.createHash('sha256').update(sc.html);
  for (const f of loadedFiles(sc).filter((f) => f.startsWith('screens/'))) h.update(`\0${f}\0${css[f] ?? js[f] ?? ''}`);
  for (const m of sc.html.matchAll(/__MDM_ASSET__\/([^"')\s]+)/g)) h.update(assets[m[1]] ?? '');
  return h.update(`\0${s.query || ''}`).digest('hex').slice(0, 10);
}
const REL_FILE = path.join(path.dirname(path.resolve(flowFile)), `${flow.id}.releases.json`);
const releases = fs.existsSync(REL_FILE) ? JSON.parse(fs.readFileSync(REL_FILE, 'utf8')).releases : [];
const hashes = Object.fromEntries(flow.steps.map((s) => [s.id, stepHash(s)]));
const dsUsers = {};   // file ds/ -> step nạp nó
for (const s of flow.steps) if (screens[s.screen]) for (const f of loadedFiles(screens[s.screen])) if (!f.startsWith('screens/')) (dsUsers[f] ??= []).push(s.id);
const dsHashes = Object.fromEntries(Object.keys(dsUsers).sort().map((f) => [f, hashOf(css[f] ?? js[f] ?? '')]));
if (argv.includes('--hashes')) { console.log(JSON.stringify({ stepHashes: hashes, dsHashes })); process.exit(0); }
function diffSteps(prev, cur) {
  if (!prev) return { added: [], changed: [], removed: [] };
  const ids = Object.keys(cur);
  return { added: ids.filter((id) => !(id in prev)), changed: ids.filter((id) => id in prev && prev[id] !== cur[id]), removed: Object.keys(prev).filter((id) => !(id in cur)) };
}
const prev = releases.at(-1);
/* Bản phát hành trước khi tách hash ds/ không so được từng step. */
if (prev && !prev.dsHashes) warnings.push(`v${prev.version} chưa có hash ds/ riêng — mọi step sẽ hiện Đổi`);
const delta = diffSteps(prev?.stepHashes, hashes);
const dsChanged = prev?.dsHashes ? Object.keys(dsHashes).filter((f) => prev.dsHashes[f] !== dsHashes[f]) : [];
const same = prev && JSON.stringify(prev.stepHashes) === JSON.stringify(hashes) && JSON.stringify(prev.dsHashes ?? null) === JSON.stringify(dsHashes);
/* flow.changes["vN"]: ghi chú cho bản sắp phát hành — { step, note, sel? }; sel = vùng ghim trên màn (verify kiểm có trong DOM). */
const nextV = (prev?.version ?? 0) + 1;
const stepIds = new Set(flow.steps.map((s) => s.id));
for (const k of Object.keys(flow.changes ?? {})) if (!/^v\d+$/.test(k)) problems.push(`changes: khoá "${k}" phải dạng vN`);
const notes = (flow.changes?.[`v${nextV}`] ?? []).map((c, i) => {
  const at = `changes.v${nextV}[${i}]`;
  if (!stepIds.has(c.step)) problems.push(`${at}: step "${c.step}" không có trong flow`);
  if (typeof c.note !== 'string' || !c.note.trim()) problems.push(`${at}: thiếu note`);
  if (c.sel != null && (typeof c.sel !== 'string' || !c.sel.trim())) problems.push(`${at}: sel phải là selector CSS`);
  return { step: c.step, note: c.note, ...(c.sel ? { sel: c.sel } : {}) };
});
const dsTouched = new Set(dsChanged.flatMap((f) => dsUsers[f]));
const noted = new Set(notes.map((c) => c.step));
const unnoted = prev ? [...delta.added, ...delta.changed].filter((id) => !noted.has(id)) : [];
for (const c of notes) if (prev && ![...delta.added, ...delta.changed].includes(c.step) && !dsTouched.has(c.step)) warnings.push(`changes.v${nextV}: step "${c.step}" không đổi so với v${prev.version}`);
if (unnoted.length && !RELEASE) warnings.push(`step đổi chưa có ghi chú trong changes.v${nextV}: ${unnoted.join(', ')}`);
let entry = null;
if (RELEASE) {
  if (!opt('--note')) problems.push('--release cần --note "mô tả thay đổi"');
  if (dirty) problems.push(`--release: còn thay đổi chưa commit trong nguồn — commit trước để tag khớp bản gửi:\n${dirty}`);
  if (same) problems.push(`--release: không step nào đổi so với v${prev.version}`);
  if (unnoted.length) problems.push(`--release: step Mới/Đổi chưa có ghi chú trong flow.json › changes.v${nextV}: ${unnoted.join(', ')}`);
  entry = { version: nextV, date: new Date().toLocaleDateString('sv-SE'), ticket: opt('--ticket') || null, note: opt('--note'), gitSha: meta.gitSha, since: prev?.version ?? null, ...delta, dsChanged, changes: notes, stepHashes: hashes, dsHashes };
  releases.push(entry);
}
/* Bản đang build = release mới nhất (vừa release, hoặc không đổi gì từ đó) hoặc nháp của vN+1. */
const shown = entry || (same ? prev : null);
meta.version = shown ? `v${shown.version}` : `v${nextV} nháp`;
const cur = shown ?? { ...delta, dsChanged, changes: notes };
/* Lịch sử theo step kiểu Google: HTML màn của từng bản (git show <gitSha>) để viewer so DOM; "cur" = giống bản đang build. */
const histBlobs = {};
function histScreen(sha, key) {
  if (!sha) return null;
  const rp = path.relative(ROOT, path.join(SRC, 'screens', key + '.html')).split(path.sep).join('/');
  const raw = git('show', `${sha}:${rp}`);
  if (raw == null) return null;
  const h = processScreen(key, raw, true).html;
  if (h === screens[key]?.html) return 'cur';
  const id = hashOf(h);
  histBlobs['hist:' + id] = h;
  return id;
}
const allCur = () => Object.fromEntries([...screenKeys].map((k) => [k, 'cur']));
/* Ghi chú dính: mỗi step lấy lần đổi gần nhất có ghi chú, so với bản ngay trước lần đó (HTML bản trước qua git). */
for (const [k, list] of Object.entries(flow.changes ?? {})) if (/^v\d+$/.test(k) && k !== `v${nextV}`) (list ?? []).forEach((c, i) => {
  if (!stepIds.has(c.step)) problems.push(`changes.${k}[${i}]: step "${c.step}" không có trong flow`);
  if (typeof c.note !== 'string' || !c.note.trim()) problems.push(`changes.${k}[${i}]: thiếu note`);
});
const relNotes = (r) => (r.changes?.length ? r.changes : flow.changes?.[`v${r.version}`] ?? []);
const noteVers = [...(shown ? [] : [{ version: nextV, notes: notes, added: delta.added, base: prev }]),
  ...releases.slice().reverse().filter((r) => r.version <= (shown?.version ?? Infinity))
    .map((r) => ({ version: r.version, notes: relNotes(r), added: r.added ?? [], base: releases.find((x) => x.version === r.since) ?? null }))];
const stepNotes = {};
for (const s of flow.steps) {
  const at = noteVers.find((x) => x.notes.some((c) => c.step === s.id));
  if (!at) continue;
  const isNew = at.added.includes(s.id) || !at.base;
  stepNotes[s.id] = {
    v: at.version, since: at.base?.version ?? null, isNew,
    prev: isNew ? null : histScreen(at.base.gitSha, s.screen),
    items: at.notes.filter((c) => c.step === s.id).map((c, i) => ({ n: i + 1, note: c.note, ...(c.sel ? { sel: c.sel } : {}) })),
  };
}
/* Tạm tắt UI phiên bản trong viewer (2026-10-07, đang nghĩ lại cách dùng); release/releases.json vẫn chạy. */
const VERSION_UI = false;
const hist = !VERSION_UI ? [] : releases.map((r) => ({
  version: r.version, date: r.date, ticket: r.ticket, note: r.note,
  steps: Object.keys(r.stepHashes ?? {}),
  screens: r === shown ? allCur() : Object.fromEntries([...screenKeys].map((k) => [k, histScreen(r.gitSha, k)])),
}));
if (VERSION_UI && !shown) hist.push({ version: nextV, draft: true, steps: flow.steps.map((s) => s.id), screens: allCur() });
hist.reverse();
const versions = (frozen) => ({
  hist, ui: VERSION_UI, notes: stepNotes,
  id: flow.id, current: shown?.version ?? null, next: nextV,
  since: shown ? shown.since : prev?.version ?? null,
  added: cur.added, changed: cur.changed, removed: cur.removed, changes: cur.changes ?? [],
  ds: (cur.dsChanged ?? []).map((f) => ({ file: f, steps: dsUsers[f] ?? [] })),
  frozen: !!frozen, base: frozen ? '../' : '',
  releases: releases.map(({ stepHashes, dsHashes: _d, changes, ...r }) => ({ ...r, notes: changes?.length ?? 0 })).reverse(),
});

/* token --utui-* -> giá trị đã phân giải -> token dev cùng giá trị */
const decl = {};
for (const f of tokenFiles) for (const m of fs.readFileSync(f, 'utf8').matchAll(/(--utui-[a-z0-9-]+)\s*:\s*([^;]+);/g)) if (!(m[1] in decl)) decl[m[1]] = m[2].trim();
const resolveTok = (v, d = 0) => v.replace(/var\((--[a-z0-9-]+)(?:,\s*([^)]+))?\)/g, (x, n, fb) => (d > 8 ? x : decl[n] !== undefined ? resolveTok(decl[n], d + 1) : fb ?? x));
const normV = (v) => String(v).trim().toLowerCase().replace(/\s+/g, ' ');
const devByValue = {};
for (const [n, v] of Object.entries(devTokens)) (devByValue[normV(v)] ??= []).push(n);

/* ------------------------------------------------------- mục lục cho AI */
const hasClass = (text, cls) => new RegExp(`[\\s"'\`]${cls.replace(/[-]/g, '\\-')}(?=[\\s"'\`]|--|__)`).test(text);
// file screens/ mà màn nạp: file cùng tên + file mượn (vd. danh-sach nạp ./tao-moi.js của drawer)
const ownFiles = (k, ext) => [...new Set([...screens[k].html.matchAll(/data-mdm-(?:css|js)="([^"]+)"/g)].flatMap((m) => m[1].split('|')))]
  .filter((f) => f.startsWith('screens/') && f.endsWith('.' + ext));
const screenIndex = [...screenKeys].filter((k) => screens[k]).map((k) => {
  const own = { css: ownFiles(k, 'css').map((f) => css[f] ?? '').join('\n'), js: ownFiles(k, 'js').map((f) => js[f] ?? '').join('\n') };
  const text = screens[k].html + own.js;
  const used = registry.filter((c) => hasClass(text, c.block.slice(1))).map((c) => c.name);
  const links = [...new Set([...screens[k].html.matchAll(/href="\.\/([^"#?]+)\.html/g)].map((m) => path.posix.join(path.posix.dirname(k), m[1])))];
  return {
    screen: k,
    title: screens[k].title,
    steps: flow.steps.filter((s) => s.screen === k).map((s) => ({ id: s.id, ...(s.query ? { query: s.query } : {}) })),
    blocks: ['html', ...(own.css ? ['css'] : []), ...(own.js ? ['js'] : [])].map((part) => `script[data-screen="${k}"][data-part="${part}"]`),
    components: used,
    linksTo: links,
    sizeKB: +((screens[k].html.length + own.css.length + own.js.length) / 1024).toFixed(1),
  };
});
const usedComps = [...new Set(screenIndex.flatMap((s) => s.components))].sort();
const screenTokens = [...new Set(screenIndex.flatMap((s) => ownFiles(s.screen, 'css').map((f) => css[f] ?? '').join('\n').match(/--utui-[a-z0-9-]+/g) ?? []))].sort();
const tokenMap = {};
for (const t of screenTokens) {
  const value = decl[t] !== undefined ? resolveTok(decl[t]) : null;
  tokenMap[t] = { value, dev: value ? devByValue[normV(value)]?.slice(0, 2) ?? [] : [] };
}
/* flows/<id>.tracking.json (tuỳ chọn): allowlist đo lường — kiểm tra tĩnh ở đây, selector do verify kiểm trong DOM. */
const TRACK_FILE = path.join(path.dirname(path.resolve(flowFile)), `${flow.id}.tracking.json`);
const tracking = fs.existsSync(TRACK_FILE) ? JSON.parse(fs.readFileSync(TRACK_FILE, 'utf8')) : null;
if (tracking) {
  const screenIds = new Set([...[...screenKeys].map((k) => k.split('/').pop()), ...flow.steps.map((s) => s.id)]);
  const forbidden = new Set(tracking.forbidden ?? []);
  for (const e of tracking.events) {
    const at = `tracking ${e.event}@${e.screen}`;
    if (!/^[a-z][a-z0-9_]{0,39}$/.test(e.event)) problems.push(`${at}: tên event phải snake_case ≤ 40 ký tự`);
    if (e.screen !== '*' && !screenIds.has(e.screen)) problems.push(`${at}: màn không có trong flow`);
    for (const [p, t] of Object.entries(e.params ?? {})) {
      if (forbidden.has(p)) problems.push(`${at}: param "${p}" nằm trong forbidden`);
      const en = String(t).match(/^enum(?:\[\])?:(.+)$/)?.[1];
      if (en ? !tracking.enums?.[en] : !['boolean', 'integer'].includes(t)) problems.push(`${at}: kiểu param "${p}" không hợp lệ: ${t}`);
      else if (en && !tracking.enums[en].values.length) warnings.push(`${at}: enum "${en}" chưa có giá trị`);
    }
    for (const [p, v] of Object.entries(e.fixed ?? {})) {
      const en = String(e.params?.[p] ?? '').match(/^enum:(.+)$/)?.[1];
      if (!en || !tracking.enums[en]?.values.includes(v)) problems.push(`${at}: fixed "${p}" = "${v}" không thuộc enum của param`);
    }
  }
  flow.tracking = tracking.events;
}

const ai = {
  about: `Prototype HTML của flow "${flow.title}" (${screenIndex.length} màn), dựng bằng design system MDM (token --utui-*). Mục đích: AI của dev convert từng màn sang Angular dùng DS của dev (${path.basename(DEV)}: <ds-*>, token --ds-*).`,
  prompt: 'Đọc <script id="mdm-ai"> trong file này, rồi convert màn <screen> sang Angular: đọc đúng các block trong screens[].blocks của màn đó, theo rules.',
  howToRead: {
    screen: 'Mỗi màn là các <script type="text/plain" data-screen="<screen>" data-part="html|css|js">. Chỉ đọc block của màn đang convert.',
    ignore: '<script id="mdm-pack"> (CSS/JS component ds đã nén, shim, ảnh) và <script id="mdm-data"> là công cụ xem prototype, bỏ qua — Angular đã có <ds-*> tương ứng, KHÔNG port CSS component.',
    escape: 'Trong block, "<\\/script" nghĩa là "</script" và "<\\!--" nghĩa là "<!--".',
  },
  rules: [
    'Class thuộc "components" -> dùng component Angular ở components.<tên>.selector, KHÔNG port CSS của nó.',
    'Modifier -> input theo components.<tên>.modifiers. "input": null hoặc "confirmed": false = CHƯA được dev xác nhận: đừng đoán, để // TODO và nêu trong kết quả.',
    'Đọc components.<tên>.note: input có default (vd. <ds-button> mặc định type="primary") — class không modifier chưa chắc ứng với default.',
    'Component trong "unmapped" chưa có bản Angular: port như markup + CSS của màn hoặc hỏi dev.',
    'Class không thuộc registry là bố cục riêng của màn: port từ block css của màn, đổi var(--utui-*) sang token dev theo "tokens"; token không có bản dev -> giữ giá trị và // TODO.',
    'Dữ liệu hiển thị (bảng, tên, mã…) là DỮ LIỆU MẪU, không phải dữ liệu thật: chuyển thành input/binding.',
    'Block js là hành vi prototype: chuyển thành logic component. __mdm.location là shim của prototype = Router/ActivatedRoute. Link ./<màn>.html = route; steps[].query (vd. ?state=empty) = trạng thái cần hỗ trợ.',
    'Comment còn lại trong block (GAP, open question, TODO, fixture) là ghi chú thiết kế cần giữ trong code hoặc báo lại dev.',
  ],
  screens: screenIndex,
  components: Object.fromEntries(usedComps.filter((n) => angularMap[n]).map((n) => {
    const a = angularMap[n];
    return [n, {
      htmlBlock: a.htmlBlock, selector: a.selector, file: a.file,
      ...(a.note ? { note: a.note } : {}),
      modifiers: Object.fromEntries(Object.entries(a.modifiers).map(([mod, m]) => [mod,
        m.input ? `${m.input}="${m.value}"${m.confirmed ? '' : ' (nháp)'}` : `CHƯA MAP${m.candidates ? ': ' + m.candidates.join(' / ') : ''}`])),
      inputs: a.inputs.map((i) => `${i.name}: ${i.values?.length && i.type !== 'boolean' ? i.values.join('|') + (i.openType ? '|…' : '') : i.type}${i.default ? ' = ' + i.default : ''}`),
    }];
  })),
  unmapped: usedComps.filter((n) => !angularMap[n]).map((n) => ({ name: n, htmlBlock: registry.find((c) => c.name === n).block, contract: registry.find((c) => c.name === n).contract })),
  tokens: tokenMap,
  ...(tracking ? { tracking: (({ status, about, transport, rules, forbidden, enums, events }) => ({ status, about, transport, rules, forbidden, enums, events }))(tracking) } : {}),
  built: meta,
};
if (tracking) ai.rules.push('Đo lường: chỉ gửi đúng event/param trong "tracking" qua TrackingService, theo tracking.rules. "selector" chỉ chỗ gắn trong prototype; on=api-success/api-fail bắn sau khi API trả về. "fixed" = giá trị cố định của param tại chỗ đó.');

/* ------------------------------------------------------------- xuất */
/* Block text/plain: "</script" và "<!--" trong nội dung sẽ phá thẻ, nên đổi thành "<\/script", "<\!--"; viewer đổi lại khi đọc. */
const raw = (s) => s.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const attr = (s) => s.replace(/"/g, '&quot;');
const blocks = [], emitted = new Set();
for (const k of screenKeys) {
  if (!screens[k]) continue;
  blocks.push(`<script type="text/plain" data-screen="${attr(k)}" data-part="html">\n${raw(screens[k].html)}\n</script>`);
  for (const [part, dict, ext] of [['css', css, 'css'], ['js', js, 'js']]) for (const key of ownFiles(k, ext)) {
    if (dict[key] && !emitted.has(key) && emitted.add(key)) blocks.push(`<script type="text/plain" data-screen="${attr(k)}" data-part="${part}" data-file="${key}">\n${raw(dict[key])}\n</script>`);
  }
}
/* ds + shim + ảnh dev không port -> gzip+base64 trong #mdm-pack (giữ file < 1 MiB); code màn giữ plain cho AI của dev. */
const packed = { blocks: {}, assets };
for (const [key, text] of [...Object.entries(css), ...Object.entries(js)]) if (!key.startsWith('screens/')) packed.blocks[key] = text;
Object.assign(packed.blocks, histBlobs);
packed.blocks['runtime/shim.js'] = checkJs(stripJs(fs.readFileSync(path.join(HERE, 'runtime/shim.js'), 'utf8')), 'runtime/shim.js');
const pack = zlib.gzipSync(JSON.stringify(packed), { level: 9 }).toString('base64');

const data = (frozen) => ({ meta, flow, versions: versions(frozen), registry, dev: { tokens: devTokens, angular } });
const tokenCss = stripCss(tokenFiles.slice(0, 2).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
/* Component ds/ dùng ở khung viewer (chỉ tooltip): token tooltip + CSS (url() → data URI) + JS. */
const tooltipTokens = ':root {\n' + (fs.readFileSync(tokenFiles[2], 'utf8').match(/^\s*--utui-tooltip-[\w-]+:[^;]+;/gm) || []).join('\n') + '\n}';
const viewerDsCss = stripCss(tooltipTokens + '\n' + fs.readFileSync(path.join(SRC, 'ds/styles/tooltip.css'), 'utf8')
  .replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/g, (m, _q, u) => { const d = dataUri(path.resolve(SRC, 'ds/styles', u)); return d ? `url("${d}")` : m; }));
const viewerDsJs = checkJs(stripJs(fs.readFileSync(path.join(SRC, 'ds/scripts/tooltip.js'), 'utf8')), 'ds/scripts/tooltip.js (viewer)');
/* Mục lục AI: mỗi khoá cấp 1 và mỗi phần tử cấp 2 một dòng — dễ đọc, không phình vì thụt lề. */
const aiJson = (o) => '{\n' + Object.entries(o).map(([k, v]) => {
  const inner = Array.isArray(v) ? '[\n' + v.map((x) => '  ' + JSON.stringify(x)).join(',\n') + '\n ]'
    : v && typeof v === 'object' ? '{\n' + Object.entries(v).map(([k2, v2]) => '  ' + JSON.stringify(k2) + ': ' + JSON.stringify(v2)).join(',\n') + '\n }'
    : JSON.stringify(v);
  return ' ' + JSON.stringify(k) + ': ' + inner;
}).join(',\n') + '\n}';
const json = (o, pretty) => JSON.stringify(o, null, pretty ? 1 : 0).replace(/</g, '\\u003c');

const out = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="mdm-handoff" content="flow=${flow.id}; version=${meta.version}; tokens=${tokensHash}; source=${meta.source}">
  <title>${flow.title}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@400;500&display=block">
  <script type="application/json" id="mdm-ai">
${aiJson(ai).replace(/</g, '\\u003c')}
  </script>
  <style>
${tokenCss}
${viewerDsCss}
${stripCss(fs.readFileSync(path.join(HERE, 'runtime/viewer.css'), 'utf8'))}
  </style>
</head>
<body>
  <header class="hv-bar">
    <button class="hv-btn hv-btn--icon" type="button" id="hvToggleLeft" aria-controls="hvSide" aria-expanded="true" aria-label="Thu gọn danh sách step" title="Thu gọn danh sách step · phím ["><span class="material-symbols-outlined hv-ico" aria-hidden="true">left_panel_close</span></button>
    <div class="hv-bar__title">
      <h1 class="hv-h1" id="hvCrumb"><span id="hvFlowTitle"></span></h1>
    </div>
    <button class="hv-btn hv-ver" type="button" id="hvVersion" aria-pressed="false" title="Lịch sử phiên bản · phím H"></button>
    <div class="hv-group" role="group" aria-label="Độ rộng khung">
      <!-- Viewport ước tính = màn − Chrome có bookmark (~111/110px) − taskbar/menu bar + Dock. Chưa đo trên máy thật. -->
      <button class="hv-btn" type="button" data-width="1024" data-height="617" title="Màn 1024 × 768, Windows 10 → viewport ~1024 × 617">1024</button>
      <button class="hv-btn" type="button" data-width="1440" data-height="695" title="Màn 1440 × 900, macOS có Dock → viewport ~1440 × 695">1440</button>
      <button class="hv-btn" type="button" data-width="1920" data-height="921" title="Màn 1920 × 1080, Windows 11 → viewport ~1920 × 921">1920</button>
    </div>
    <button class="hv-btn hv-btn--primary" type="button" id="hvInspect" aria-pressed="false" title="Phím I · Esc để tắt">Inspect</button>
    <button class="hv-btn hv-btn--icon" type="button" id="hvToggleRight" aria-controls="hvPanel" aria-expanded="true" aria-label="Thu gọn panel chi tiết" title="Thu gọn panel chi tiết · phím ]"><span class="material-symbols-outlined hv-ico" aria-hidden="true">right_panel_close</span></button>
  </header>
  <main class="hv-main">
    <nav class="hv-side" id="hvSide" aria-label="Các step trong flow">
      <div class="hv-find"><input class="hv-find__input" id="hvFind" type="search" placeholder="Tìm step…" aria-label="Tìm step theo tên, màn hoặc query" autocomplete="off">
        <button class="hv-btn hv-only" type="button" id="hvOnlyChanged" aria-pressed="false" hidden><span class="material-symbols-outlined hv-ico" aria-hidden="true">filter_alt</span>Chỉ step đổi <span class="hv-only__n"></span></button></div>
      <ol class="hv-steps" id="hvSteps"></ol>
    </nav>
    <section class="hv-stage" aria-labelledby="hvStepTitle">
      <h2 class="hv-h2" id="hvStepTitle" hidden></h2>
      <div class="hv-stage__col">
        <div class="hv-hbar" id="hvHistBar" role="region" aria-label="Thay đổi của step ở bản đang xem" hidden></div>
        <div class="hv-stage__top" id="hvStageTop">
          <div class="hv-group hv-variants" role="group" id="hvVariants" aria-label="Biến thể" hidden></div>
          <button class="hv-btn hv-notesw" type="button" role="switch" id="hvNotes" aria-checked="false" title="Ghim chỗ đổi trên màn · phím N" hidden><span class="hv-notesw__knob" aria-hidden="true"></span><span id="hvNotesLabel">Ghi chú thay đổi</span></button>
        </div>
        <div class="hv-frame-box" id="hvFrameBox">
          <iframe class="hv-frame" id="hvFrame" title="Màn hình prototype"></iframe>
        </div>
      </div>
    </section>
    <aside class="hv-panel" id="hvPanel" aria-label="Chi tiết bàn giao">
      <div class="hv-tabs">
        <div class="hv-tabs__list" role="tablist" aria-label="Chi tiết bàn giao">
          <button class="hv-tab" type="button" role="tab" id="hvTabComp" aria-controls="hvPaneComp" aria-selected="true">Component</button>
          <button class="hv-tab" type="button" role="tab" id="hvTabTrack" aria-controls="hvPaneTrack" aria-selected="false" tabindex="-1">Đo lường</button>
          <button class="hv-tab" type="button" role="tab" id="hvTabVer" aria-controls="hvPaneVer" aria-selected="false" tabindex="-1">Phiên bản</button>
          <button class="hv-tab" type="button" role="tab" id="hvTabInspect" aria-controls="hvDetail" aria-selected="false" tabindex="-1">Inspect</button>
        </div>
        <p class="hv-muted hv-tabs__meta" id="hvStepMeta"></p>
      </div>
      <div class="hv-pane" role="tabpanel" id="hvPaneComp" aria-labelledby="hvTabComp" tabindex="0"></div>
      <div class="hv-pane" role="tabpanel" id="hvPaneTrack" aria-labelledby="hvTabTrack" tabindex="0" hidden></div>
      <div class="hv-pane" role="tabpanel" id="hvPaneVer" aria-labelledby="hvTabVer" tabindex="0" hidden></div>
      <div class="hv-pane" role="tabpanel" id="hvDetail" aria-labelledby="hvTabInspect" tabindex="0" hidden></div>
      <div class="hv-pane hv-hp" id="hvPaneHist" role="region" aria-label="Lịch sử phiên bản" hidden></div>
    </aside>
    <div class="hv-resize hv-resize--x" id="hvResizeLeft" role="separator" aria-orientation="vertical" aria-controls="hvSide" aria-label="Đổi độ rộng danh sách step" tabindex="0" title="Kéo để đổi độ rộng · nhấp đúp để về mặc định"></div>
    <div class="hv-resize hv-resize--x hv-resize--right" id="hvResizeRight" role="separator" aria-orientation="vertical" aria-controls="hvPanel" aria-label="Đổi độ rộng panel chi tiết" tabindex="0" title="Kéo để đổi độ rộng · nhấp đúp để về mặc định"></div>
  </main>
  <div class="hv-toast" id="hvToast" role="status" hidden></div>
${blocks.join('\n')}
  <script type="application/octet-stream" id="mdm-pack" data-encoding="gzip+base64">${pack}</script>
  <script type="application/json" id="mdm-data">__MDM_DATA__</script>
  <script>
${viewerDsJs.replace(/<\/(script|style)/gi, '<\\/$1')}
  </script>
  <script>
${checkJs(stripJs(fs.readFileSync(path.join(HERE, 'runtime/viewer.js'), 'utf8')), 'runtime/viewer.js').replace(/<\/(script|style)/gi, '<\\/$1').replace(/<!--/g, '<\\!--')}
  </script>
</body>
</html>
`;

const outFile = path.join(ROOT, 'dist', `${flow.id}.html`);
fs.mkdirSync(path.dirname(outFile), { recursive: true });

console.log(`flow   : ${flow.title} (${flow.steps.length} step, ${screenKeys.size} màn)`);
console.log(`css    : ${Object.keys(css).length} file, ${kb(Object.values(css).join(''))}`);
console.log(`js     : ${Object.keys(js).length} file, ${kb(Object.values(js).join(''))} — viết lại location: ${locationRewrites} chỗ`);
console.log(`ảnh    : ${Object.keys(assets).length} file, ${kb(Object.values(assets).join(''))}`);
console.log(`nén    : ds + shim + ảnh ${kb(JSON.stringify(packed))} → ${kb(pack)} (gzip+base64)`);
console.log(`màn    : ${kb(Object.values(screens).map((s) => s.html).join(''))}`);
console.log(`registry: ${registry.length} component, Angular map ${Object.keys(angular).length}, token dev ${Object.keys(devTokens).length}`);
if (tracking) console.log(`tracking: ${tracking.events.length} event (${new Set(tracking.events.map((e) => e.event)).size} tên), ${tracking.events.filter((e) => e.selector).length} selector cần verify`);
console.log(`mục lục AI: ${kb(aiJson(ai).replace(/</g, '\\u003c'))} · component dùng ${usedComps.length} (chưa map: ${ai.unmapped.map((u) => u.name).join(', ') || 'không'}) · token riêng của màn ${screenTokens.length}`);
for (const w of [...new Set(warnings)]) console.log(`  cảnh báo: ${w}`);
if (problems.length) {
  for (const p of problems) console.error(`  LỖI: ${p}`);
  console.error('Build hỏng — không ghi file.');
  process.exit(1);
}
const page = (frozen) => out.replace('__MDM_DATA__', () => json(data(frozen)));
fs.writeFileSync(outFile, page(false));
console.log(`\n→ ${path.relative(ROOT, outFile)}  ${kb(page(false))}`);
const diffs = ['added', 'changed', 'removed', 'dsChanged'].map((k) => `${k} ${(cur[k] ?? []).length}`).join(', ') + `, ghi chú ${(cur.changes ?? []).length}`;
console.log(`phiên bản: ${meta.version}${(shown?.since ?? prev?.version) ? ` (so với v${shown ? shown.since : prev.version}: ${diffs})` : ''}${meta.dirty ? ' · nguồn có thay đổi chưa commit' : ''}`);
if (entry) {
  fs.writeFileSync(REL_FILE, JSON.stringify({ $comment: 'Máy sinh bởi build_flow --release — không sửa tay.', releases }, null, 2) + '\n');
  console.log(`→ ${path.relative(ROOT, REL_FILE)}`);
  console.log(`Tiếp: git add ${path.relative(ROOT, REL_FILE)} && git commit -m "${entry.ticket || 'MDM-0000'} ${flow.id} v${entry.version}: ${entry.note}" && git tag ${flow.id}/v${entry.version}`);
  console.log(`Seshat: npm run seshat -- ${flow.id} (ghi đè ${flow.id}.html).`);
}

function kb(s) { return `${(Buffer.byteLength(s) / 1024).toFixed(0)} KB`; }
