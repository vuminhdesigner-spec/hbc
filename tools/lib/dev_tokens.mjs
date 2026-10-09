#!/usr/bin/env node
/**
 * Phần dùng chung để đối chiếu token với DS của dev.
 *
 * Tách ra module riêng vì hai chỗ cần nó — bản báo cáo và cổng kiểm — và hai bản
 * sao của cùng một bảng ánh xạ là đúng thứ cả phiên làm việc này đi sửa.
 *
 * Nếu không tìm thấy repo của dev thì `readDevTokens()` trả về null, để cổng bỏ
 * qua thay vì đỏ: không phải máy nào cũng có checkout đó.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const DEV = path.join(os.homedir(), 'Documents/design-system-of-dev/tokens');
export const devAvailable = () => fs.existsSync(path.join(DEV, 'colors.ts'));

export function readDevTokens() {
  if (!devAvailable()) return null;
  const read = (f) => fs.readFileSync(path.join(DEV, f), 'utf8');
  const dev = new Map();

// colors.ts: DS_PALETTE
{
  const src = read('colors.ts');
  const body = src.slice(src.indexOf('DS_PALETTE'));
  let family = null;
  for (const line of body.split('\n')) {
    const f = line.match(/^\s{2}(?:'([a-z]+)'|([a-z]+)):\s*\{/);
    if (f) { family = f[1] ?? f[2]; continue; }
    const s = line.match(/^\s{4}(?:'?([a-z0-9]+)'?):\s*'(#[0-9A-Fa-f]{6})'/);
    if (s && family) {
      const name = family === 'base' ? `--ds-${s[1]}` : `--ds-${family}-${s[1]}`;
      dev.set(name, { value: s[2].toLowerCase(), family: family === 'base' ? 'base' : 'color' });
    }
  }
}
// dimensions.ts: DS_SPACE, DS_RADIUS, DS_TYPE_SCALE
{
  const src = read('dimensions.ts');
  const sp = src.match(/DS_SPACE\s*=\s*\[([^\]]+)\]/);
  if (sp) for (const n of sp[1].split(',').map((x) => x.trim()).filter(Boolean)) dev.set(`--ds-space-${n}`, { value: `${n}px`, family: 'space' });
  const rad = src.slice(src.indexOf('DS_RADIUS'));
  for (const m of rad.matchAll(/^\s{2}'?([a-z0-9]+)'?:\s*(\d+),/gm)) dev.set(`--ds-radius-${m[1]}`, { value: `${m[2]}px`, family: 'radius' });
  const ty = src.slice(src.indexOf('DS_TYPE_SCALE'));
  for (const m of ty.matchAll(/'([a-z-]+)':\s*\{\s*size:\s*(\d+),\s*line:\s*(\d+)\s*\}/g)) {
    dev.set(`--ds-${m[1]}-size`, { value: `${m[2]}px`, family: 'type' });
    dev.set(`--ds-${m[1]}-line`, { value: `${m[3]}px`, family: 'type' });
  }
}
// effects.ts: DS_SHADOWS
for (const m of read('effects.ts').matchAll(/^\s{2}'?([a-z0-9]+)'?:\s*'([^']+)'/gm)) dev.set(`--ds-shadow-${m[1]}`, { value: m[2], family: 'shadow' });
// semantic.ts: DS_SEMANTIC -> tham chiếu ramp
for (const m of read('semantic.ts').matchAll(/^\s{2}'?([a-z-]+)'?:\s*\['([a-z]+)',\s*'?([a-z0-9]+)'?\]/gm)) {
  const target = m[2] === 'base' ? `--ds-${m[3]}` : `--ds-${m[2]}-${m[3]}`;
  dev.set(`--ds-${m[1]}`, { value: dev.get(target)?.value ?? '?', family: 'semantic', ref: target });
}

  return dev;
}

/**
 * Tên bên này TƯƠNG ỨNG tên nào bên dev. Bảng này chính là bản ghi các chỗ hai
 * bên đặt tên khác nhau — đọc nó là thấy toàn bộ công việc đổi tên.
 */
export function devNameFor(utui, dev, value) {
  const n = utui.replace('--utui-', '');
  let m;
  if ((m = n.match(/^(white|black)$/))) return `--ds-${m[1]}`;
  if ((m = n.match(/^color-([a-z]+)-(\d+)$/))) return `--ds-${m[1]}-${m[2]}`;          // bỏ đoạn `color-`
  if ((m = n.match(/^shadow-([a-z0-9]+)$/))) return `--ds-shadow-${m[1]}`;
  // Radius KHÔNG khớp theo nhãn. Dev chèn thêm một bậc 10px (`--ds-radius-lg`)
  // mà bên này không có, nên mọi nhãn phía trên bị đẩy lên một nấc: 12px ở đây
  // là `radius-lg`, bên dev là `radius-xl`; 16px ở đây là `radius-xl`, bên dev là
  // `radius-2xl`. Khớp theo nhãn sẽ báo hai "xung đột giá trị" không có thật.
  // Giá trị hai thang trùng khít ở mọi bậc chung, nên khớp theo giá trị.
  if ((m = n.match(/^radius-[a-z0-9]+$/)) && dev) {
    const px = value && String(value);
    for (const [name, info] of dev) if (info.family === 'radius' && info.value === px) return name;
    return null;
  }
  if ((m = n.match(/^spacing-(\d+)$/))) return `--ds-space-${Number(m[1]) * 4}`;        // chỉ số ×4 -> px
  if ((m = n.match(/^font-size-(text|display)-([a-z0-9]+)$/))) return `--ds-${m[1]}-${m[2]}-size`;
  if ((m = n.match(/^line-height-(text|display)-([a-z0-9]+)$/))) return `--ds-${m[1]}-${m[2]}-line`;
  return null;
}

