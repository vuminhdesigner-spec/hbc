#!/usr/bin/env node
/**
 * registry_index.mjs — sinh registry/index.md: bản GỌN của design system cho agent.
 *
 *   node tools/registry_index.mjs
 *
 * Agent đọc file này (~vài KB) thay vì 37 contract .md (~960 KB). Chỉ khi cần
 * chi tiết một component nó mới mở contract của component đó.
 * Nguồn: ds/{components,patterns}/*.json và
 * token semantic. Không sửa tay — chạy lại lệnh.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'handoff.config.json'), 'utf8'));
const DEV = path.resolve(ROOT, cfg.devDs);
const DS = path.join(ROOT, 'ds');

const readJson = (dir) => fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
  .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
const strip = (block, list) => (list ?? []).map((x) => x.replace(block, '').replace(/^\./, '')).join(' ');
// Parts/modifiers that are not `${block}__x` / `${block}--x` are sibling blocks (e.g. `.page-header-block`): listed whole, never as `__x`.
const own = (block, sep, list) => (list ?? []).filter((x) => x.startsWith(block + sep));
const extra = (block, lists) => lists.flatMap((l) => l ?? []).filter((x) => !x.startsWith(block + '__') && !x.startsWith(block + '--'));

function selectorOf(spec) {
  if (!spec) return '';
  const [folder, pick] = spec.split('/');
  const dir = path.join(DEV, 'components', folder);
  if (!fs.existsSync(dir)) return '';
  const file = pick ?? fs.readdirSync(dir).find((f) => f === `ds-${folder}.component.ts`) ?? fs.readdirSync(dir).find((f) => f.endsWith('.component.ts'));
  const src = file ? fs.readFileSync(path.join(dir, file), 'utf8') : '';
  return [...src.matchAll(/selector:\s*'(ds-[^']+)'/g)].map((m) => m[1])[0] ?? '';
}

const comps = readJson(path.join(DS, 'components')).filter((c) => c.block);
const pats = readJson(path.join(DS, 'patterns'));
const semantic = fs.readFileSync(path.join(DS, 'tokens/untitled-ui-semantic.css'), 'utf8');
const semNames = [...new Set([...semantic.matchAll(/(--utui-[a-z0-9-]+)\s*:/g)].map((m) => m[1]))];
const groups = {};
for (const n of semNames) {
  const g = n.replace('--utui-', '').split('-').slice(0, 2).join('-');
  (groups[g] = groups[g] || []).push(n.replace(`--utui-${g}-`, ''));
}

const lines = [];
lines.push('# Registry index (máy sinh — đừng sửa tay)', '');
lines.push(`Nguồn: \`${path.relative(ROOT, DS)}\`. Chạy lại: \`node tools/registry_index.mjs\`.`);
lines.push('Đọc file này trước. Chỉ mở `ds/components/<tên>.md` của component thật sự cần dùng.', '');
lines.push('## Component', '', 'Dạng: `tên` · block · `--`modifier · `__`part · `+`class khác (block phụ, viết đủ) · Angular', '');
for (const c of comps) {
  const mods = strip(c.block, own(c.block, '--', c.api?.modifiers)).replace(/(^| )--/g, '$1');
  const parts = strip(c.block, own(c.block, '__', c.api?.parts)).replace(/(^| )__/g, '$1');
  const more = extra(c.block, [c.api?.modifiers, c.api?.parts]);
  const ng = selectorOf(cfg.angularMap[c.name]);
  lines.push(`- \`${c.name}\` · \`${c.block}\`` + (mods ? ` · --{${mods.split(' ').join(',')}}` : '') +
    (parts ? ` · __{${parts.split(' ').join(',')}}` : '') + (more.length ? ` · +{${more.join(',')}}` : '') + (ng ? ` · <${ng}>` : ''));
}
lines.push('', '## Pattern (bố cục trang)', '');
for (const p of pats) lines.push(`- \`${p.name}\` = ${p.composes.join(' + ')}` + (p.implementedIn?.length ? ` · mẫu: screens/${p.implementedIn[0]}.html` : ''));
lines.push('', '## Token semantic (tên, bỏ tiền tố)', '');
for (const [g, names] of Object.entries(groups)) lines.push(`- \`--utui-${g}-*\`: ${names.join(' ')}`);
lines.push('', 'Primitive (spacing/radius/shadow/font) và component token: xem `ds/tokens/`. Không dùng giá trị viết cứng.');

const out = path.join(ROOT, 'registry/index.md');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, lines.join('\n') + '\n');
const bytes = Buffer.byteLength(lines.join('\n'));
const contractBytes = fs.readdirSync(path.join(DS, 'components')).filter((f) => f.endsWith('.md'))
  .reduce((s, f) => s + fs.statSync(path.join(DS, 'components', f)).size, 0);
console.log(`→ registry/index.md  ${(bytes / 1024).toFixed(1)} KB  (${comps.length} component, ${pats.length} pattern, ${semNames.length} token semantic)`);
console.log(`  so với đọc hết contract: ${(contractBytes / 1024).toFixed(0)} KB`);
