import { Bar, CartesianGrid, Cell, ComposedChart, LabelList, Line, ReferenceDot, ReferenceLine, Tooltip, XAxis, YAxis, type DotItemDotProps } from 'recharts'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { ChartTip, ChartTipRow, LegendLine } from '../w1/chart-bits'
import { useChartAnimation } from '../w1/motion'
import { checkStatus, fmt, specText, type Check, type Spec } from './data'

const AXIS = 'aspect-auto w-full [&_.recharts-cartesian-axis-tick_text]:fill-chart-axis [&_.recharts-cartesian-axis-tick_text]:text-3xs'

/** Thang trục: bước tròn 1/2/5 và các vạch. */
function scale(lo: number, hi: number) {
  const sp = hi - lo || Math.abs(hi) || 1
  lo -= sp * 0.12
  hi += sp * 0.12
  const raw = (hi - lo) / 5
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const n = raw / mag
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag
  const a = Math.floor(lo / step) * step
  const b = Math.ceil(hi / step) * step
  const ticks: number[] = []
  for (let g = a; g <= b + step / 2; g += step) ticks.push(+g.toFixed(6))
  return { lo: a, hi: b, ticks, dec: step < 1 ? Math.min(3, -Math.floor(Math.log10(step))) : 0 }
}

export type SpcPoint = { x: string; v: number | null; sub?: string }

export type SpcStats = { n: number; mean: number; s: number; ucl: number; lcl: number; cpk: number | null; outSpec: number; outCtl: number }

const outOfSpec = (v: number, s: Spec | null) => !!s && ((s.lo != null && (v < s.lo || (s.loStrict && v === s.lo))) || (s.hi != null && (v > s.hi || (s.hiStrict && v === s.hi))))

/** X̄ ± 3S trên chuỗi điểm (độ lệch chuẩn mẫu, N − 1) và Cpk theo cận TC có được. */
export function spcStats(points: SpcPoint[], spec: Spec | null): SpcStats {
  const vs = points.map((p) => p.v).filter((v): v is number => v != null)
  const n = vs.length
  const mean = vs.reduce((a, b) => a + b, 0) / (n || 1)
  const s = n > 1 ? Math.sqrt(vs.reduce((a, v) => a + (v - mean) ** 2, 0) / (n - 1)) : 0
  const sides = [spec?.hi != null ? (spec.hi - mean) / (3 * s) : null, spec?.lo != null ? (mean - spec.lo) / (3 * s) : null].filter((v): v is number => v != null && isFinite(v))
  return {
    n,
    mean,
    s,
    ucl: mean + 3 * s,
    lcl: mean - 3 * s,
    cpk: sides.length && s > 0 ? Math.min(...sides) : null,
    outSpec: vs.filter((v) => outOfSpec(v, spec)).length,
    outCtl: vs.filter((v) => s > 0 && (v > mean + 3 * s || v < mean - 3 * s)).length,
  }
}

/**
 * Đồ thị kiểm soát (SPC): chuỗi đo, đường TB (X̄), giới hạn kiểm soát X̄ ± 3S (cam, nét đứt) và cận tiêu chuẩn
 * USL / LSL (đỏ, nét đứt). Điểm ngoài TC chấm đỏ to; ngoài ±3S chấm cam.
 */
export function SpcChart({ points, spec, unit, dec, height = 240 }: { points: SpcPoint[]; spec: Spec | null; unit: string; dec: number; height?: number }) {
  const anim = useChartAnimation()
  const st = spcStats(points, spec)
  const vs = points.map((p) => p.v).filter((v): v is number => v != null)
  const lim = [...vs, st.ucl, st.lcl, ...(spec?.lo != null ? [spec.lo] : []), ...(spec?.hi != null ? [spec.hi] : [])]
  const sc = scale(Math.min(...lim), Math.max(...lim))
  const config = { v: { label: 'Giá trị', color: 'var(--chart-5)' } } satisfies ChartConfig
  const u = unit ? ` ${unit}` : ''

  const dot = (p: DotItemDotProps) => {
    const { cx, cy, index, value } = p as DotItemDotProps & { value: number | null }
    if (value == null || cx == null || cy == null) return <g key={`d${index}`} />
    const bad = outOfSpec(value, spec)
    const ctl = st.s > 0 && (value > st.ucl || value < st.lcl)
    return (
      <circle
        key={`d${index}`}
        cx={cx}
        cy={cy}
        r={bad ? 5 : ctl ? 4.5 : 2.75}
        fill={bad ? 'var(--destructive)' : ctl ? 'var(--warning)' : 'var(--card)'}
        stroke={bad ? 'var(--destructive)' : ctl ? 'var(--warning)' : 'var(--chart-5)'}
        strokeWidth={2}
      />
    )
  }

  const refLabel = (text: string, color: string) => ({ value: text, position: 'insideTopRight' as const, fill: color, fontSize: 10, fontWeight: 600 })

  return (
    <ChartContainer config={config} className={AXIS} style={{ height }}>
      <ComposedChart data={points} margin={{ top: 12, right: 8, bottom: 0, left: 0 }} accessibilityLayer>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="x" tickLine={false} axisLine={{ stroke: 'var(--input)' }} tickMargin={6} interval="preserveStartEnd" minTickGap={14} />
        <YAxis domain={[sc.lo, sc.hi]} ticks={sc.ticks} tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => fmt(v, sc.dec)} />
        {spec?.hi != null && <ReferenceLine y={spec.hi} stroke="var(--destructive)" strokeDasharray="5 4" strokeWidth={1.25} label={refLabel(`USL ${fmt(spec.hi, dec)}`, 'var(--destructive)')} />}
        {spec?.lo != null && <ReferenceLine y={spec.lo} stroke="var(--destructive)" strokeDasharray="5 4" strokeWidth={1.25} label={refLabel(`LSL ${fmt(spec.lo, dec)}`, 'var(--destructive)')} />}
        {st.s > 0 && <ReferenceLine y={st.ucl} stroke="var(--warning)" strokeDasharray="3 3" strokeWidth={1.25} />}
        {st.s > 0 && <ReferenceLine y={st.lcl} stroke="var(--warning)" strokeDasharray="3 3" strokeWidth={1.25} />}
        <ReferenceLine y={st.mean} stroke="var(--foreground)" strokeOpacity={0.6} strokeWidth={1.25} />
        <Line {...anim} dataKey="v" type="linear" stroke="var(--chart-5)" strokeWidth={2} connectNulls dot={dot} activeDot={{ r: 5, fill: 'var(--chart-5)', stroke: 'var(--card)', strokeWidth: 2 }} />
        <Tooltip
          isAnimationActive={false}
          cursor={{ stroke: 'var(--chart-ext-axis)', strokeDasharray: '3 3' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const p = payload[0].payload as SpcPoint
            if (p.v == null) return null
            const bad = outOfSpec(p.v, spec)
            const ctl = st.s > 0 && (p.v > st.ucl || p.v < st.lcl)
            const d = p.v - st.mean
            return (
              <ChartTip title={p.x}>
                {p.sub && <div className="mb-1 text-muted-foreground">{p.sub}</div>}
                <ChartTipRow swatch={<LegendLine color="var(--chart-5)" />} label="Giá trị đo" value={`${fmt(p.v, dec)}${u}`} />
                <ChartTipRow label="So với TB" value={`${d >= 0 ? '+' : '−'}${fmt(Math.abs(d), dec + 1)}`} />
                <ChartTipRow label="Đánh giá" value={bad ? 'Ngoài TC' : ctl ? 'Ngoài ±3S' : 'Trong kiểm soát'} />
              </ChartTip>
            )
          }}
        />
      </ComposedChart>
    </ChartContainer>
  )
}

export function SpcLegend() {
  return (
    <span className="flex flex-wrap gap-3.5 text-2xs whitespace-nowrap text-muted-foreground">
      <LegendLine color="var(--chart-5)">Giá trị đo</LegendLine>
      <LegendLine color="var(--foreground)" faint>
        TB (X̄)
      </LegendLine>
      <LegendLine color="var(--warning)" dashed>
        Giới hạn kiểm soát X̄ ± 3S
      </LegendLine>
      <LegendLine color="var(--destructive)" dashed>
        Cận tiêu chuẩn USL / LSL
      </LegendLine>
    </span>
  )
}

/** Ô số liệu SPC phía trên đồ thị. */
export function SpcStrip({ stats, spec, dec, unit }: { stats: SpcStats; spec: Spec | null; dec: number; unit: string }) {
  const cell = 'flex min-w-0 flex-col gap-0.5 rounded-glass-inner border border-border bg-popover/40 px-3 py-2'
  return (
    <div className="grid grid-cols-5 gap-2 text-2xs text-muted-foreground tabular-nums">
      <div className={cell}>
        Trung bình (X̄)
        <b className="text-sm font-semibold text-foreground">
          {fmt(stats.mean, dec + 1)} <small className="text-2xs font-normal text-muted-foreground">{unit}</small>
        </b>
      </div>
      <div className={cell}>
        Tiêu chuẩn
        <b className="text-sm font-semibold text-foreground">{specText(spec, dec)}</b>
      </div>
      <div className={cell}>
        Giới hạn ± 3S
        <b className="text-sm font-semibold text-foreground">
          {fmt(stats.lcl, dec + 1)} – {fmt(stats.ucl, dec + 1)}
        </b>
      </div>
      <div className={cell}>
        Năng lực Cpk
        <b className="text-sm font-semibold text-foreground">{stats.cpk == null ? '—' : fmt(stats.cpk, 2)}</b>
      </div>
      <div className={cell}>
        Điểm bất thường
        <b className="text-sm font-semibold text-foreground">
          {stats.outSpec} ngoài TC · {stats.outCtl} ngoài ±3S
        </b>
      </div>
    </div>
  )
}

/** Vòng đời sinh khối men: 4 thời điểm, mỗi thời điểm khoảng TC (khối nhạt), dải Min–Max (thanh mảnh) và TB (đường). */
export function BiomassChart({ stages }: { stages: { name: string; c: Check }[] }) {
  const anim = useChartAnimation()
  const rows = stages.map(({ name, c }) => ({
    name,
    tc: [c.spec?.lo ?? 0, c.spec?.hi ?? c.max ?? 0] as [number, number],
    mm: [c.min ?? c.avg ?? 0, c.max ?? c.avg ?? 0] as [number, number],
    avg: c.avg ?? null,
    c,
    st: checkStatus(c),
  }))
  const hi = Math.max(...rows.flatMap((r) => [r.tc[1], r.mm[1]]))
  const sc = scale(0, hi)
  const config = { avg: { label: 'Trung bình', color: 'var(--chart-5)' } } satisfies ChartConfig
  return (
    <ChartContainer config={config} className={AXIS} style={{ height: 220 }}>
      <ComposedChart data={rows} margin={{ top: 12, right: 8, bottom: 0, left: 0 }} accessibilityLayer>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: 'var(--input)' }} tickMargin={6} />
        {/* Trục ẩn thứ hai để thanh Min–Max nằm giữa khối TC thay vì xếp cạnh nhau */}
        <XAxis xAxisId="mm" dataKey="name" hide />
        <YAxis domain={[0, sc.hi]} ticks={sc.ticks} tickLine={false} axisLine={false} width={36} />
        <Bar {...anim} dataKey="tc" barSize={52} fill="var(--chart-5)" fillOpacity={0.14} stroke="var(--chart-5)" strokeOpacity={0.4} radius={4} />
        <Bar {...anim} xAxisId="mm" dataKey="mm" barSize={8} radius={4}>
          {rows.map((r) => (
            <Cell key={r.name} fill={r.st === 'over' ? 'var(--destructive)' : 'var(--foreground)'} fillOpacity={r.st === 'over' ? 1 : 0.6} />
          ))}
        </Bar>
        <Line {...anim} dataKey="avg" type="linear" stroke="var(--chart-5)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--chart-5)', stroke: 'var(--card)', strokeWidth: 2 }} activeDot={false} />
        <Tooltip
          isAnimationActive={false}
          cursor={{ fill: 'var(--muted)', fillOpacity: 0.5 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const r = payload[0].payload as (typeof rows)[number]
            return (
              <ChartTip title={r.name}>
                <ChartTipRow label="Tiêu chuẩn" value={`${specText(r.c.spec, 1)} tr/ml`} />
                <ChartTipRow label="Min – Max" value={`${fmt(r.mm[0], 1)} – ${fmt(r.mm[1], 1)}`} />
                <ChartTipRow swatch={<LegendLine color="var(--chart-5)" />} label="Trung bình" value={r.avg == null ? '—' : fmt(r.avg, 2)} />
                <ChartTipRow label="Số mẫu" value={String(r.c.n ?? '—')} />
              </ChartTip>
            )
          }}
        />
      </ComposedChart>
    </ChartContainer>
  )
}

/** Thanh so với TC bằng Recharts (dùng trong ngăn chi tiết Tổng quan). Vùng TC = ReferenceArea, vạch giới hạn = ReferenceLine,
 *  dải Min–Max = Bar dạng khoảng, phần ngoài TC = Bar khoảng chồng lên (barGap âm), TB = ReferenceDot.
 *  Nhãn tự vẽ theo toạ độ điểm ảnh: Min / Max đúng hai đầu dải (trên), giới hạn TC đúng vạch (dưới); hai số gần nhau thì gộp một nhãn. */
export function SpecBarChart({ c }: { c: Check }) {
  const s = c.spec
  const vals = [c.min, c.avg, c.max].filter((v): v is number => v != null)
  if (!s || !vals.length) return <span className="text-2xs text-muted-foreground">—</span>
  const pts = [...vals, ...(s.lo != null ? [s.lo] : []), ...(s.hi != null ? [s.hi] : [])]
  const span = Math.max(...pts) - Math.min(...pts) || Math.abs(pts[0]) || 1
  const lo = Math.min(...pts) - span * 0.15
  const hi = Math.max(...pts) + span * 0.15
  const a = c.min ?? c.avg!
  const b = c.max ?? c.avg!
  const st = checkStatus(c)
  const bad = st === 'over' ? 'var(--status-destructive-solid)' : 'var(--status-warning-solid)'
  const avgOut = c.avg != null && ((s.lo != null && c.avg < s.lo) || (s.hi != null && c.avg > s.hi))
  const f = (v: number) => fmt(v, c.dec)
  const row = {
    y: 'r',
    all: [a, b] as [number, number],
    below: s.lo != null && a <= s.lo ? ([a, Math.min(b, s.lo)] as [number, number]) : null,
    above: s.hi != null && b >= s.hi ? ([Math.max(a, s.hi), b] as [number, number]) : null,
    tc: [s.lo ?? lo, s.hi ?? hi] as [number, number],
  }
  const tcText = s.lo != null && s.hi != null ? null : s.hi != null ? `${s.hiStrict ? '<' : '≤'} ${f(s.hi)}` : `${s.loStrict ? '>' : '≥'} ${f(s.lo!)}`
  const GAP = 44 // px: hai nhãn gần hơn thì gộp
  const anchor = (x: number, w: number) => (x < 14 ? 'start' : x > w - 14 ? 'end' : 'middle')

  // Nhãn trên: Min / Max ở hai đầu dải đo được.
  const top = (p: { x?: number | string; y?: number | string; width?: number | string; viewBox?: unknown }) => {
    const x = Number(p.x), y = Number(p.y), w = Number(p.width)
    const W = 600
    const t = { fill: 'var(--foreground)', fontSize: 10, fontWeight: 600 }
    if (w < GAP) return <text x={x + w / 2} y={y - 5} textAnchor="middle" {...t}>{a === b ? f(a) : `${f(a)} – ${f(b)}`}</text>
    return (
      <g>
        <text x={x} y={y - 5} textAnchor={anchor(x, W)} {...t}>{f(a)}</text>
        <text x={x + w} y={y - 5} textAnchor="end" {...t}>{f(b)}</text>
      </g>
    )
  }
  // Nhãn dưới: giới hạn TC ở đúng vạch.
  const bottom = (p: { x?: number | string; y?: number | string; width?: number | string; height?: number | string }) => {
    const x = Number(p.x), y = Number(p.y) + Number(p.height) + 12, w = Number(p.width)
    const t = { fill: 'var(--muted-foreground)', fontSize: 10 }
    if (tcText) return <text x={s.hi != null ? x + w : x} y={y} textAnchor={s.hi != null ? 'end' : 'start'} {...t}>{tcText}</text>
    if (w < GAP) return <text x={x + w / 2} y={y} textAnchor="middle" {...t}>{`${f(s.lo!)} – ${f(s.hi!)}`}</text>
    return (
      <g>
        <text x={x} y={y} textAnchor="middle" {...t}>{f(s.lo!)}</text>
        <text x={x + w} y={y} textAnchor="middle" {...t}>{f(s.hi!)}</text>
      </g>
    )
  }
  const config = { all: { label: 'Min – Max', color: 'var(--foreground)' } } satisfies ChartConfig
  return (
    <ChartContainer config={config} className="aspect-auto h-12 w-full">
      <ComposedChart data={[row]} layout="vertical" margin={{ top: 15, right: 6, bottom: 15, left: 6 }} barGap={-12} barCategoryGap={0} accessibilityLayer>
        <XAxis type="number" domain={[lo, hi]} hide allowDataOverflow />
        <YAxis type="category" dataKey="y" hide />
        <Bar dataKey="tc" barSize={12} fill="var(--chart-5)" fillOpacity={0.16} isAnimationActive={false}>
          <LabelList dataKey="tc" content={bottom} />
        </Bar>
        {s.lo != null && <ReferenceLine x={s.lo} stroke="var(--chart-5)" strokeOpacity={0.75} strokeWidth={2} />}
        {s.hi != null && <ReferenceLine x={s.hi} stroke="var(--chart-5)" strokeOpacity={0.75} strokeWidth={2} />}
        <Bar dataKey="all" barSize={12} shape={(p: { x?: number; y?: number; width?: number; height?: number }) => <rect x={p.x} y={(p.y ?? 0) + 3} width={Math.max(4, p.width ?? 0)} height={6} rx={3} fill="var(--foreground)" fillOpacity={0.75} />} isAnimationActive={false}>
          <LabelList dataKey="all" content={top} />
        </Bar>
        {row.below && <Bar dataKey="below" barSize={12} shape={(p: { x?: number; y?: number; width?: number }) => <rect x={p.x} y={(p.y ?? 0) + 3} width={Math.max(4, p.width ?? 0)} height={6} rx={3} fill={bad} />} isAnimationActive={false} />}
        {row.above && <Bar dataKey="above" barSize={12} shape={(p: { x?: number; y?: number; width?: number }) => <rect x={p.x} y={(p.y ?? 0) + 3} width={Math.max(4, p.width ?? 0)} height={6} rx={3} fill={bad} />} isAnimationActive={false} />}
        {c.avg != null && <ReferenceDot x={c.avg} y="r" r={5} fill={avgOut ? bad : 'var(--foreground)'} stroke="var(--popover)" strokeWidth={2} />}
        <Tooltip
          isAnimationActive={false}
          cursor={false}
          content={() => (
            <ChartTip title={c.group ? `${c.group} · ${c.name}` : c.name}>
              <ChartTipRow label="Min / TB / Max" value={`${c.min == null ? '—' : f(c.min)} / ${c.avg == null ? '—' : f(c.avg)} / ${c.max == null ? '—' : f(c.max)}${c.unit ? ' ' + c.unit : ''}`} />
              <ChartTipRow label="Tiêu chuẩn" value={specText(s, c.dec)} />
            </ChartTip>
          )}
        />
      </ComposedChart>
    </ChartContainer>
  )
}
