/**
 * Bỏ comment khỏi CSS / JS / HTML cho bản gửi dev (dist/). Nguồn không đổi.
 * JS dùng bộ quét hiểu chuỗi, template literal và regex — không cắt nhầm "//"
 * trong "https://…". build_flow.mjs biên dịch thử mọi đoạn JS sau khi bỏ.
 */

/* Comment nói về gap / câu hỏi mở / TODO / dữ liệu mẫu: AI của dev cần biết, nên giữ khi gọi với { keep: KEEP }. */
export const KEEP = /\bGAP\b|[Oo]pen [Qq]uestion|OPEN QUESTION|\bTODO\b|[Ff]ixture|FIXTURE|[Ii]nvented|INVENTED|[Ff]abricat|FABRICAT|not a real/;   // GAP viết hoa: "gap" thường là thuộc tính CSS

const tidy = (s) => s.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n');

export function stripCss(src, { keep } = {}) {
  return tidy(src.replace(/\/\*[\s\S]*?\*\//g, (c) => (keep && keep.test(c) ? c : '')));
}

export function stripJs(src, { keep } = {}) {
  let out = '', i = 0, prev = '';
  const tpl = [];   // độ sâu { } bên trong mỗi ${ } của template literal đang mở
  const regexOk = () => /^$|[(,=:[!&|?{};+\-*%<>~^]$/.test(prev) || /\b(return|typeof|case|in|of|new|delete|void|throw|yield|await)$/.test(prev);
  const copyString = (q) => {
    let j = i + 1;
    while (j < src.length && src[j] !== q) { if (src[j] === '\\') j++; j++; }
    out += src.slice(i, j + 1); i = j + 1; prev = 'x';
  };
  const copyTemplate = () => {        // từ ` hoặc } (đóng ${) tới ` hoặc ${
    let j = i + 1;
    while (j < src.length) {
      if (src[j] === '\\') { j += 2; continue; }
      if (src[j] === '`') { j++; break; }
      if (src[j] === '$' && src[j + 1] === '{') { j += 2; tpl.push(0); out += src.slice(i, j); i = j; prev = '{'; return; }
      j++;
    }
    out += src.slice(i, j); i = j; prev = 'x';
  };
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (c === '/' && n === '*') { const e = src.indexOf('*/', i + 2), j = e === -1 ? src.length : e + 2; out += keep && keep.test(src.slice(i, j)) ? src.slice(i, j) : ' '; i = j; continue; }
    if (c === '/' && n === '/') { const e = src.indexOf('\n', i), j = e === -1 ? src.length : e; if (keep && keep.test(src.slice(i, j))) out += src.slice(i, j); i = j; continue; }
    if (c === '"' || c === "'") { copyString(c); continue; }
    if (c === '`') { copyTemplate(); continue; }
    if (tpl.length) {
      if (c === '{') tpl[tpl.length - 1]++;
      if (c === '}') {
        if (tpl[tpl.length - 1] === 0) { tpl.pop(); copyTemplate(); continue; }
        tpl[tpl.length - 1]--;
      }
    }
    if (c === '/' && regexOk()) {
      let j = i + 1, cls = false;
      while (j < src.length && (src[j] !== '/' || cls)) {
        if (src[j] === '\\') j++;
        else if (src[j] === '[') cls = true;
        else if (src[j] === ']') cls = false;
        j++;
      }
      j++;
      while (/[a-z]/i.test(src[j] || '')) j++;
      out += src.slice(i, j); i = j; prev = 'x'; continue;
    }
    if (!/\s/.test(c)) prev = /[\w$]/.test(c) ? (/[\w$]$/.test(prev) ? prev + c : c) : c;
    out += c; i++;
  }
  return tidy(out);
}

/* HTML: bỏ <!-- --> ngoài <script>/<style>, và comment CSS trong <style> inline. Script inline do build xử lý riêng. */
export function stripHtml(src, { keep } = {}) {
  return tidy(src.split(/(<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>)/i)
    .map((part, k) => (k % 2
      ? (/^<style/i.test(part) ? part.replace(/\/\*[\s\S]*?\*\//g, (c) => (keep && keep.test(c) ? c : '')) : part)
      : part.replace(/<!--[\s\S]*?-->/g, (c) => (keep && keep.test(c) ? c : ''))))
    .join(''));
}
