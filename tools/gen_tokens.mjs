// Sinh tokens/*.json (DTCG) cho Figma Variables từ app/src/index.css — nguồn duy nhất.
// 3 layer: primitive (giá trị gốc) → semantic (light/dark, trỏ primitive) → component (trỏ semantic).
// Chạy: node tools/gen_tokens.mjs   (từ thư mục gốc repo)
import { readFileSync, writeFileSync } from 'node:fs'

const css = readFileSync(new URL('../app/src/index.css', import.meta.url), 'utf8')
const out = (name, obj) =>
  writeFileSync(new URL(`../tokens/${name}`, import.meta.url), JSON.stringify(obj, null, 2) + '\n')

const decls = (body) => Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((x) => [x[1].slice(2), x[2].trim()]))
const section = (title) => {
  const i = css.indexOf(`Layer ${title}`)
  if (i < 0) throw new Error(`thiếu Layer ${title}`)
  return css.slice(i)
}
const firstBlock = (src, sel) => decls(src.match(new RegExp(`^${sel.replace('.', '\\.')} \\{([^}]*)\\}`, 'm'))[1])
const primitive = firstBlock(section('1 · primitive'), ':root')
const semLight = firstBlock(section('2 · semantic'), ':root')
const semDark = firstBlock(section('2 · semantic'), '.dark')
const component = firstBlock(section('3 · component'), ':root')
const typoTheme = decls(css.match(/^@theme \{([^}]*)\}/m)[1])
const fontSans = css.match(/--font-sans:\s*var\((--[\w-]+)\)/)[1].slice(2)

const set = (obj, path, val) => {
  const keys = path.split('.')
  let o = obj
  for (const k of keys.slice(0, -1)) o = o[k] ??= {}
  o[keys.at(-1)] = val
}
const ref = (path) => `{${path}}`
// Tên biến CSS đi kèm mỗi token (code syntax trong Figma)
const cssName = (code) => ({ $extensions: { 'com.habeco.css': code } })
const varOf = (v) => v.match(/^var\(--([\w-]+)\)$/)?.[1]

// ── Primitive: tên biến CSS → đường dẫn token
const primPath = {}
const prim = {}
for (const [k, v] of Object.entries(primitive)) {
  let path, t
  let m
  if ((m = k.match(/^size-(\d+)$/))) [path, t] = [`size.${m[1]}`, { $type: 'dimension', $value: v }]
  else if ((m = k.match(/^font-size-(\d+)$/))) [path, t] = [`typography.font-size.${m[1]}`, { $type: 'dimension', $value: `${m[1]}px` }]
  else if ((m = k.match(/^line-height-(\d+)$/))) [path, t] = [`typography.line-height.${m[1]}`, { $type: 'dimension', $value: `${m[1]}px` }]
  else if ((m = k.match(/^font-weight-(\d+)$/))) [path, t] = [`typography.font-weight.${m[1]}`, { $type: 'fontWeight', $value: Number(v) }]
  else if ((m = k.match(/^font-family-(.+)$/))) [path, t] = [`typography.font-family.${m[1]}`, { $type: 'fontFamily', $value: v.replace(/'/g, '') }]
  else if ((m = k.match(/^(.+)-a(\d+)$/))) [path, t] = [`color.${m[1]}-alpha.${m[2]}`, { $type: 'color', $value: v }]
  else if ((m = k.match(/^(.+)-(\d+)$/))) [path, t] = [`color.${m[1]}.${m[2]}`, { $type: 'color', $value: v }]
  else [path, t] = [`color.${k}`, { $type: 'color', $value: v }]
  primPath[k] = path
  set(prim, path, { ...t, ...cssName(`var(--${k})`) })
}
out('primitive.tokens.json', prim)

// ── Semantic
const GROUPS = ['glass', 'cta', 'kpi-hero', 'status', 'risk', 'chart-ext', 'sidebar-ext']
const semPath = {}
const semColorPath = (k) => {
  const g = GROUPS.find((p) => k.startsWith(p + '-'))
  return g ? `color.${g}.${k.slice(g.length + 1)}` : `color.${k}`
}
const sizeOfPrim = (n) => {
  if (!primPath[`size-${n}`]) throw new Error(`thiếu primitive size-${n}`)
  return ref(primPath[`size-${n}`])
}
const semantic = (vars) => {
  const res = {}
  for (const [k, v] of Object.entries(vars)) {
    if (k.startsWith('shadow-')) continue
    const p = varOf(v)
    if (!p || !primPath[p]) throw new Error(`semantic --${k} phải trỏ primitive: ${v}`)
    let path
    if (k === 'radius') path = 'size.radius.base'
    else if (k.startsWith('radius-')) path = `size.radius.${k.slice(7)}`
    else if (k.startsWith('blur-')) path = `size.blur.${k.slice(5)}`
    else if (/^(control|layout|icon)-/.test(k)) path = `size.${k.replace('-', '.')}`
    else path = semColorPath(k)
    semPath[k] = path
    set(res, path, { $type: primPath[p].startsWith('size') ? 'dimension' : 'color', $value: ref(primPath[p]), ...cssName(`var(--${k})`) })
  }
  // Thang bo góc shadcn tính từ --radius (calc trong @theme inline của shadcn) → trỏ primitive cùng giá trị
  const base = parseFloat(primitive[varOf(semLight.radius)])
  for (const [k, f] of Object.entries({ xs: null, sm: 0.6, md: 0.8, lg: 1, xl: 1.4, '2xl': 1.8, '3xl': 2.2, '4xl': 2.6 })) {
    const n = f === null ? 2 : Math.round(base * f)
    set(res, `size.radius.${k}`, { $type: 'dimension', $value: sizeOfPrim(n), $description: `rounded-${k}`, ...cssName(`var(--radius-${k})`) })
    semPath[`radius-${k}`] = `size.radius.${k}`
  }
  // Khoảng cách: Tailwind nhân --spacing (4 px). Tên = bước Tailwind, dấu chấm đổi thành gạch dưới (Figma không cho dấu chấm).
  for (const step of [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 8, 10, 12, 14, 16]) {
    set(res, `size.spacing.${String(step).replace('.', '_')}`, {
      $type: 'dimension', $value: sizeOfPrim(step * 4), $description: `Tailwind ${step} (p-${step}, gap-${step})`, ...cssName(`calc(var(--spacing) * ${step})`),
    })
  }
  // Chữ: @theme (không inline) trong index.css
  for (const [k, v] of Object.entries(typoTheme)) {
    const p = varOf(v)
    let m, path
    if ((m = k.match(/^text-([\w]+)--line-height$/))) path = `typography.${m[1]}.line-height`
    else if ((m = k.match(/^text-([\w]+)$/))) path = `typography.${m[1]}.font-size`
    else if ((m = k.match(/^font-weight-(\w+)$/))) path = `typography.weight.${m[1]}`
    else continue
    semPath[k] = path
    set(res, path, { $type: primPath[p].includes('weight') ? 'fontWeight' : 'dimension', $value: ref(primPath[p]), ...cssName(`var(--${k})`) })
  }
  set(res, 'typography.family.sans', { $type: 'fontFamily', $value: ref(primPath[fontSans]), ...cssName('var(--font-sans)') })
  semPath['font-sans'] = 'typography.family.sans'
  return res
}
out('semantic.light.tokens.json', semantic(semLight))
out('semantic.dark.tokens.json', semantic(semDark))

// ── Component: --<component>-<thuộc tính> trỏ semantic
const COMPONENTS = ['button', 'header', 'tab-bar', 'input', 'card', 'kpi-card', 'badge', 'tabs', 'pill', 'menu', 'table', 'tooltip', 'sheet', 'chart', 'sec-bar']
const comp = {}
for (const [k, v] of Object.entries(component)) {
  const c = COMPONENTS.find((x) => k.startsWith(x + '-'))
  const s = varOf(v)
  if (!c || !semPath[s]) throw new Error(`component --${k} phải trỏ semantic: ${v}`)
  const layer = semPath[s].split('.')[0]
  const $type = layer === 'color' ? 'color' : 'dimension'
  set(comp, `${layer}.${c}.${k.slice(c.length + 1)}`, { $type, $value: ref(semPath[s]), ...cssName(`var(--${k})`) })
}
out('component.tokens.json', comp)

// ── Đổ bóng: không phải Figma Variable — dựng thành Effect style
const toPx = (s) => `${parseFloat(s) || 0}px`
const parseShadow = (v) =>
  v.split(/,(?![^(]*\))/).map((layer) => {
    const color = layer.match(/rgba?\([^)]*\)|#[0-9a-f]+/i)[0]
    const [offsetX, offsetY, blur, spread = '0'] = layer.replace(color, '').trim().split(/\s+/)
    return { color, offsetX: toPx(offsetX), offsetY: toPx(offsetY), blur: toPx(blur), spread: toPx(spread) }
  })
const shadows = (vars) =>
  Object.fromEntries(
    Object.entries(vars)
      .filter(([k]) => k.startsWith('shadow-'))
      .map(([k, v]) => [k.slice(7), { $type: 'shadow', $value: parseShadow(v) }]),
  )
out('effects.tokens.json', { light: shadows(semLight), dark: shadows(semDark) })

const count = (o) => Object.values(o).reduce((n, v) => n + ('$value' in v ? 1 : count(v)), 0)
console.log(`tokens/: primitive ${count(prim)}, semantic ${count(semantic(semLight))}, component ${count(comp)}`)
