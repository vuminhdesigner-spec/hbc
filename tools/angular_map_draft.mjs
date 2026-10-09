#!/usr/bin/env node
/**
 * angular_map_draft.mjs — sinh BẢN NHÁP ds/angular-map.json: modifier của mỗi
 * component (ds/components/<tên>.json) -> input của component Angular trong DS
 * của dev (handoff.config.json › devDs, angularMap).
 *
 *   node tools/angular_map_draft.mjs
 *
 * Chỉ ghép khi TÊN modifier trùng một giá trị trong kiểu của input
 * (vd. .button--primary -> type="primary"). Không trùng thì ghi `null` + lý do:
 * đó là chỗ dev phải quyết, không phải chỗ để đoán. Mục nào dev đã sửa tay và
 * đặt "confirmed": true thì lần chạy sau giữ nguyên.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'handoff.config.json'), 'utf8'));
const DEV = path.resolve(ROOT, cfg.devDs);
const OUT = path.join(ROOT, 'ds/angular-map.json');
const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};

/* Kiểu khai trong file: type X = 'a' | 'b' | Y;  -> tập giá trị (null nếu có phần không phân giải được). */
function typeAliases(src) {
  const raw = {};
  for (const m of src.matchAll(/(?:export\s+)?type\s+(\w+)\s*=\s*([^;]+);/g)) raw[m[1]] = m[2];
  const cache = {};
  const resolve = (expr, depth = 0) => {
    const values = new Set();
    let open = false;
    for (let part of expr.split('|').map((p) => p.trim()).filter(Boolean)) {
      const lit = part.match(/^'([^']*)'$/);
      if (lit) { values.add(lit[1]); continue; }
      if (/^\(string & \{\}\)$/.test(part) || part === 'string') { open = true; continue; }
      if (raw[part] && depth < 5) {
        const r = cache[part] ?? (cache[part] = resolve(raw[part], depth + 1));
        r.values.forEach((v) => values.add(v)); open = open || r.open; continue;
      }
      open = true;   // kiểu import từ file khác hoặc kiểu phức tạp
    }
    return { values: [...values], open };
  };
  return (t) => resolve(t);
}

function readComponent(spec) {
  const [folder, pick] = spec.split('/');
  const dir = path.join(DEV, 'components', folder);
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.component.ts'));
  const file = pick ?? files.find((f) => f === `ds-${folder}.component.ts`) ?? files[0];
  if (!file) return null;
  const src = fs.readFileSync(path.join(dir, file), 'utf8');
  const selector = [...src.matchAll(/selector:\s*'([^']+)'/g)].map((m) => m[1]).find((s) => s.startsWith('ds-'));
  const typeOf = typeAliases(src);
  const inputs = [];
  for (const m of src.matchAll(/readonly\s+(\w+)\s*=\s*input(\.required)?(?:<([^>]+(?:<[^>]*>)?[^>]*)>)?\(([^)]*)\)/g)) {
    const [, name, required, type, args] = m;
    const boolish = /booleanAttribute/.test(args) || /^\s*(true|false)\b/.test(args);
    const t = type ?? (boolish ? 'boolean' : 'unknown');
    const r = t === 'boolean' ? { values: ['true', 'false'], open: false } : typeOf(t);
    const def = (args.split(',')[0] || '').trim();
    inputs.push({ name, type: t.replace(/\s+/g, ' '), values: r.values, openType: r.open, default: required ? '(bắt buộc)' : def || null });
  }
  return { selector, file: `components/${folder}/${file}`, inputs };
}

const out = {
  $comment: 'BẢN NHÁP do tools/angular_map_draft.mjs sinh. Mỗi modifier: {input, value} khi TÊN trùng giá trị của input; null + note khi không trùng — dev quyết. Dev sửa tay rồi đặt "confirmed": true để lần chạy sau giữ nguyên.',
};
let exact = 0, open = 0;
for (const [name, spec] of Object.entries(cfg.angularMap)) {
  const ng = readComponent(spec);
  if (!ng) continue;
  const regFile = path.join(ROOT, 'ds/components', `${name}.json`);
  const reg = fs.existsSync(regFile) ? JSON.parse(fs.readFileSync(regFile, 'utf8')) : null;
  const block = reg?.block?.slice(1) ?? name;
  const mods = (reg?.api?.modifiers ?? []).map((m) => m.replace(`.${block}--`, '')).filter((m) => !m.includes('__'));
  const modifiers = {};
  for (const mod of mods) {
    const keep = prev[name]?.modifiers?.[mod];
    if (keep?.confirmed) { modifiers[mod] = keep; continue; }
    const hits = ng.inputs.filter((i) => i.values.includes(mod) && i.type !== 'boolean');
    const boolHit = ng.inputs.find((i) => i.type === 'boolean' && (i.name === mod || `no-${i.name}` === mod));
    if (hits.length === 1) { modifiers[mod] = { input: hits[0].name, value: mod, confirmed: false }; exact++; }
    else if (hits.length > 1) { modifiers[mod] = { input: null, candidates: hits.map((h) => `${h.name}="${mod}"`), note: 'nhiều input nhận giá trị này', confirmed: false }; open++; }
    else if (boolHit) { modifiers[mod] = { input: boolHit.name, value: mod.startsWith('no-') ? 'false' : 'true', confirmed: false }; exact++; }
    else { modifiers[mod] = { input: null, note: 'không input nào có giá trị trùng tên — cần dev xác nhận', confirmed: false }; open++; }
  }
  out[name] = {
    selector: ng.selector,
    file: ng.file,
    htmlBlock: `.${block}`,
    note: prev[name]?.note ?? (ng.inputs.some((i) => i.default && i.default !== "''" && i.values.length > 2)
      ? `Input có default khác rỗng (${ng.inputs.filter((i) => i.default && i.default !== "''" && i.values.length > 2).map((i) => `${i.name}=${i.default}`).join(', ')}): khi HTML không có modifier, phải xác nhận class gốc ứng với giá trị nào.`
      : undefined),
    modifiers,
    inputs: ng.inputs.map(({ name: n, type, values, openType, default: d }) => ({ name: n, type, ...(values.length ? { values } : {}), ...(openType ? { openType: true } : {}), default: d })),
  };
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(`→ ds/angular-map.json  ${Object.keys(out).length - 1} component · modifier: ${exact} ghép theo tên, ${open} cần dev xác nhận`);
