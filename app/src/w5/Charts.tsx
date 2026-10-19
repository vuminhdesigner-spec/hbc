import { useState } from 'react'
import { Area, Bar, BarChart, CartesianGrid, ComposedChart, LabelList, Line, ReferenceArea, ReferenceLine, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Info } from 'lucide-react'
import { ChartContainer } from '@/components/ui/chart'
import { Tooltip as HintTooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { AllocRow, ModeToggle, RankList, SegToggle, type Mode } from '../w1/Allocation'
import { ChartTip, ChartTipRow, FocusItem, LegendLine, seriesClass } from '../w1/chart-bits'
import { FINISHED_ML, fmt, pct } from '../w1/data'
import { useChartAnimation } from '../w1/motion'
import { ALLOC, BIOMASS_T, MONTH_POINTS, SHIFT_LANES, SHIFT_POINTS, STEAM_T, expected, type MonthPoint, type ShiftPoint } from './data'

const AXIS = '[&_.recharts-cartesian-axis-tick_text]:fill-chart-axis [&_.recharts-cartesian-axis-tick_text]:text-3xs'
const CARD = 'glass-card glass-bg flex min-h-0 min-w-0 flex-col gap-1.5 px-4.5 pt-3.5 pb-3'
// Hơi là chart-3; bản đậm trộn với màu chữ vì token chưa có chart-3-deep.
const DEEP = 'color-mix(in oklab, var(--chart-3) 70%, var(--foreground))'

/* ---------- Hơi theo công đoạn, so cùng kỳ ---------- */

export function AllocBars({ mode, onMode }: { mode: Mode; onMode: (m: Mode) => void }) {
  const per = mode === 'per'
  // tấn ÷ triệu L thành phẩm = kg/1.000 L
  const conv = (v: number) => (per ? v / FINISHED_ML : v)
  const top = Math.max(...ALLOC.map(([, cur]) => cur))
  const unit = per ? 'kg/1.000 L' : 'tấn'
  return (
    <figure className={CARD}>
      <figcaption className="flex flex-col gap-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-body font-semibold">Hơi theo công đoạn · tháng 9/2026</span>
          <ModeToggle mode={mode} onMode={onMode} />
        </span>
        <span className="flex gap-3.5 text-2xs text-muted-foreground">
          <span>{unit} · xếp từ lớn nhất · so cùng kỳ 2025</span>
        </span>
      </figcaption>
      <RankList>
        {ALLOC.map(([name, cur, prior, base, loss]) => (
          <AllocRow
            key={name}
            metric="hoi"
            name={name}
            sub={base}
            value={fmt(conv(cur), 0)}
            share={cur / top}
            noHistory={prior == null}
            delta={prior == null ? null : (cur / prior - 1) * 100}
            loss={loss}
          />
        ))}
      </RankList>
      <span className="text-2xs text-muted-foreground">Trên 1.000 L: chia thành phẩm chung. Số dưới tên chia theo sản lượng riêng từng công đoạn, không dùng để xếp hạng.</span>
    </figure>
  )
}

/* ---------- Đồ thị điểm: tháng (theo sản lượng) / ca ---------- */

const CURVE = Array.from({ length: 21 }, (_, i) => {
  const vol = 3.4 + i * 0.4
  const e = expected(vol)
  return { vol, exp: e, band: [e * 0.85, e * 1.15] as [number, number] }
})

function MonthDot(p: { cx?: number; cy?: number; payload?: MonthPoint }) {
  const { cx = 0, cy = 0, payload } = p
  if (!payload) return <g />
  if (payload.kind === 'current') {
    const e = expected(payload.vol)
    return (
      <g>
        <circle cx={cx} cy={cy} r={6.5} fill="var(--chart-3)" stroke="var(--foreground)" strokeWidth={2} />
        <text x={cx - 12} y={cy + 18} textAnchor="end" className="chart-label fill-foreground">
          T9/2026: {fmt(payload.v, 0)} · kỳ vọng {fmt(e, 0)} ({pct((payload.v / e - 1) * 100)})
        </text>
      </g>
    )
  }
  if (payload.kind === 'prior')
    return (
      <g>
        <circle cx={cx} cy={cy} r={5} fill="var(--card)" stroke="var(--chart-4)" strokeWidth={2.5} />
        <text x={cx - 10} y={cy - 10} textAnchor="end" className="chart-label fill-muted-foreground">
          Cùng kỳ T9/2025: {fmt(payload.v, 0)}
        </text>
      </g>
    )
  return <circle cx={cx} cy={cy} r={3} fill="var(--chart-4)" fillOpacity={0.6} />
}

function MonthScatter() {
  const anim = useChartAnimation()
  const [focus, setFocus] = useState<string | null>(null)
  return (
    <>
      <ChartContainer config={{}} className={cn('aspect-auto min-h-0 w-full flex-1', AXIS)}>
        <ComposedChart data={CURVE} margin={{ top: 10, right: 12, bottom: 4, left: -6 }} accessibilityLayer>
          <CartesianGrid stroke="var(--border)" />
          <XAxis
            dataKey="vol"
            type="number"
            domain={[3, 11.5]}
            ticks={[4, 6, 8, 10]}
            tickLine={false}
            axisLine={{ stroke: 'var(--input)' }}
            label={{ value: 'Sản lượng thành phẩm tháng, triệu L', position: 'insideBottomRight', offset: -2, className: 'fill-muted-foreground text-3xs' }}
            height={30}
          />
          <YAxis domain={[260, 520]} ticks={[300, 350, 400, 450, 500]} tickLine={false} axisLine={false} width={42} />
          <Area {...anim} className={seriesClass(focus, 'band')} dataKey="band" type="monotone" stroke="var(--chart-ext-axis)" strokeDasharray="3 3" strokeWidth={1} fill="var(--chart-4)" fillOpacity={0.18} activeDot={false} tooltipType="none" />
          <Line {...anim} className={seriesClass(focus, 'exp')} dataKey="exp" type="monotone" stroke="var(--foreground)" strokeWidth={2} dot={false} activeDot={false} tooltipType="none" />
          <Scatter {...anim} className={seriesClass(focus, 'pts')} data={MONTH_POINTS} dataKey="v" shape={MonthDot} />
          <Tooltip
            isAnimationActive={false}
            cursor={{ stroke: 'var(--chart-ext-axis)', strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              const p = payload?.find((x) => (x.payload as MonthPoint).label)?.payload as MonthPoint | undefined
              if (!active || !p) return null
              const e = expected(p.vol)
              return (
                <ChartTip title={p.label}>
                  <ChartTipRow label="Hơi" value={`${fmt(p.v, 0)} kg/1.000 L`} />
                  <ChartTipRow label="Sản lượng" value={`${fmt(p.vol, 1)} triệu L`} />
                  <ChartTipRow label="Kỳ vọng" value={`${fmt(e, 0)} (${pct((p.v / e - 1) * 100)})`} />
                </ChartTip>
              )
            }}
          />
        </ComposedChart>
      </ChartContainer>
      <span className="flex flex-wrap gap-x-3.5 gap-y-0.5 text-2xs text-muted-foreground">
        <FocusItem id="pts" onFocus={setFocus}>
          <span className="inline-flex items-center gap-1.25">
            <i className="size-1.75 rounded-full bg-chart-4/60" />
            Tháng trước đó
          </span>
        </FocusItem>
        <span className="inline-flex items-center gap-1.25">
          <i className="size-2.5 rounded-full border-[2.5px] border-chart-4" />
          Cùng kỳ
        </span>
        <span className="inline-flex items-center gap-1.25">
          <i className="size-3 rounded-full border-2 border-foreground bg-chart-3" />
          Tháng 9/2026
        </span>
        <FocusItem id="exp" onFocus={setFocus}>
          <LegendLine color="var(--foreground)">Kỳ vọng</LegendLine>
        </FocusItem>
        <FocusItem id="band" onFocus={setFocus}>
          <span className="inline-flex items-center gap-1.25">
            <i className="h-2 w-3.5 border-y border-dashed border-chart-axis bg-chart-4/20" />
            Dải ±15%
          </span>
        </FocusItem>
      </span>
    </>
  )
}

function ShiftDot(p: { cx?: number; cy?: number; payload?: ShiftPoint }) {
  const { cx = 0, cy = 0, payload } = p
  if (!payload?.out) return <circle cx={cx} cy={cy} r={2.6} fill="var(--chart-4)" fillOpacity={0.6} />
  const ln = SHIFT_LANES[payload.lane]
  const d = Math.round(Math.abs(payload.v / ln.cmp - 1) * 100)
  const right = payload.day > 20
  return (
    <g>
      <circle cx={cx} cy={cy} r={4.5} fill="var(--warning)" stroke="var(--card)" strokeWidth={1.5} />
      <text x={right ? cx - 7 : cx + 7} y={cy - 9} textAnchor={right ? 'end' : 'start'} className="chart-label fill-warning-foreground">
        {String(payload.day).padStart(2, '0')}/09 · {fmt(payload.v, 1)} ({payload.v > ln.cmp ? '+' : '−'}
        {d}% so cùng kỳ)
      </text>
    </g>
  )
}

function ShiftScatter() {
  const anim = useChartAnimation()
  return (
    <>
      <ChartContainer config={{}} className={cn('aspect-auto min-h-0 w-full flex-1', AXIS)}>
        <ScatterChart margin={{ top: 10, right: 12, bottom: 4, left: -6 }} accessibilityLayer>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, 102]}
            ticks={[17, 51, 85]}
            tickFormatter={(v: number) => {
              const ln = SHIFT_LANES[Math.round((v - 17) / 34)]
              return `Ca ${ln.name} · cùng kỳ ${fmt(ln.cmp, 0)}`
            }}
            tickLine={false}
            axisLine={{ stroke: 'var(--input)' }}
            height={30}
            label={{ value: 'Ngày 1 → 30 trong từng ca', position: 'insideBottomRight', offset: -2, className: 'fill-muted-foreground text-3xs' }}
          />
          <YAxis dataKey="v" domain={[15, 55]} ticks={[20, 30, 40, 50]} tickLine={false} axisLine={false} width={42} tickFormatter={(v: number) => fmt(v, 0)} />
          {SHIFT_LANES.map((ln, k) => (
            <ReferenceArea key={`a${k}`} x1={k * 34 + 1} x2={k * 34 + 33} y1={ln.cmp * 0.85} y2={ln.cmp * 1.15} fill="var(--chart-4)" fillOpacity={0.16} stroke="var(--chart-ext-axis)" strokeDasharray="3 3" />
          ))}
          {SHIFT_LANES.map((ln, k) => (
            <ReferenceLine
              key={`m${k}`}
              segment={[
                { x: k * 34 + 1, y: ln.cmp },
                { x: k * 34 + 33, y: ln.cmp },
              ]}
              stroke="var(--foreground)"
              strokeWidth={2}
            />
          ))}
          {[34, 68].map((x) => (
            <ReferenceLine key={x} x={x} stroke="var(--input)" />
          ))}
          <Scatter {...anim} data={SHIFT_POINTS} shape={ShiftDot} />
          <Tooltip
            isAnimationActive={false}
            cursor={false}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as ShiftPoint | undefined
              if (!active || !p) return null
              const ln = SHIFT_LANES[p.lane]
              return (
                <ChartTip title={`Ca ${ln.name} · ${String(p.day).padStart(2, '0')}/09/2026`}>
                  <ChartTipRow label="Hơi" value={`${fmt(p.v, 1)} tấn/ca`} />
                  <ChartTipRow label="Trung bình cùng ca, cùng kỳ" value={`${fmt(ln.cmp, 1)} tấn/ca`} />
                  <ChartTipRow label="Chênh" value={`${pct((p.v / ln.cmp - 1) * 100)}${p.out ? ' · ngoài vùng bình thường' : ''}`} />
                </ChartTip>
              )
            }}
          />
        </ScatterChart>
      </ChartContainer>
      <span className="flex flex-wrap gap-x-3.5 gap-y-0.5 text-2xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.25">
          <i className="size-1.75 rounded-full bg-chart-4/60" />
          Ca trong vùng bình thường
        </span>
        <span className="inline-flex items-center gap-1.25">
          <i className="size-2.5 rounded-full bg-warning" />
          Ca ngoài vùng bình thường
        </span>
        <LegendLine color="var(--foreground)">Trung bình cùng ca, kỳ so sánh</LegendLine>
        <span className="inline-flex items-center gap-1.25">
          <i className="h-2 w-3.5 border border-dashed border-chart-axis bg-chart-4/20" />
          Vùng bình thường (kỳ so sánh ±15%)
        </span>
      </span>
    </>
  )
}

export function ScatterCard() {
  const [view, setView] = useState<'month' | 'shift'>('month')
  const shift = view === 'shift'
  return (
    <figure className={CARD}>
      <figcaption className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-body font-semibold">{shift ? 'Hơi theo ca · tấn/ca' : 'Hơi / 1.000 L theo sản lượng · toàn nhà máy'}</span>
          <span className="flex items-center gap-1 text-2xs text-muted-foreground">
            {shift ? 'Mỗi điểm 1 ca, tháng 9/2026 · so cùng ca kỳ so sánh' : 'kg/1.000 L · mỗi điểm 1 tháng, 2024–2026'}
            {shift && (
              <HintTooltip>
                <TooltipTrigger render={<button type="button" aria-label="Giải thích đồ thị theo ca" className="grid size-4 place-items-center rounded-full text-muted-foreground hover:text-foreground" />}>
                  <Info className="size-3" />
                </TooltipTrigger>
                <TooltipContent className="max-w-72 flex-col items-start gap-1 text-left">
                  <span>Kỳ so sánh theo bộ lọc "So với" (đang là cùng kỳ 09/2025).</span>
                  <span>Chưa chia sản lượng vì chưa có sản lượng theo ca.</span>
                </TooltipContent>
              </HintTooltip>
            )}
          </span>
        </span>
        <SegToggle
          label="Đơn vị thời gian"
          value={view}
          onChange={setView}
          items={[
            ['month', 'Tháng'],
            ['shift', 'Ca'],
          ]}
        />
      </figcaption>
      {shift ? <ShiftScatter key="shift" /> : <MonthScatter key="month" />}
    </figure>
  )
}

/* ---------- Theo dõi biomass theo tháng ---------- */

export function BiomassCard() {
  const anim = useChartAnimation()
  const rows = STEAM_T.map((s, i) => {
    const b = BIOMASS_T[i]
    return { name: `T${i + 1} · ${fmt(s, 0)} t hơi`, steam: s, b, bv: b ?? 0, none: b == null ? 1 : null, k: b == null ? null : b / s }
  })
  return (
    <figure className={CARD}>
      <figcaption className="flex flex-col gap-1">
        <span className="text-body font-semibold">Theo dõi biomass theo tháng · 2026</span>
        <span className="flex gap-3.5 text-2xs text-muted-foreground">
          <LegendLine color={DEEP}>Biomass, tấn</LegendLine>
          <span className="ml-auto">tấn · tấn biomass / tấn hơi</span>
        </span>
      </figcaption>
      <ChartContainer config={{}} className={cn('aspect-auto min-h-0 w-full flex-1', AXIS)}>
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 92, bottom: 0, left: 0 }} barCategoryGap="28%" accessibilityLayer>
          <XAxis type="number" hide domain={[0, 1350]} />
          <YAxis type="category" dataKey="name" width={112} tickLine={false} axisLine={false} interval={0} className="[&_text]:fill-foreground!" />
          <Bar {...anim} dataKey="bv" stackId="b" fill={DEEP} fillOpacity={0.85} radius={[0, 3, 3, 0]}>
            <LabelList
              dataKey="bv"
              content={(p) => {
                const { x = 0, y = 0, width = 0, height = 0, index = 0 } = p as { x?: number; y?: number; width?: number; height?: number; index?: number }
                const r = rows[index]
                if (r.b == null) return null
                return (
                  <text x={+x + +width + 8} y={+y + +height / 2 + 4} className="fill-foreground text-2xs tabular-nums">
                    <tspan className="font-semibold">{fmt(r.b, 0)}</tspan>
                    <tspan className="fill-muted-foreground"> · {fmt(r.k!, 2)}</tspan>
                  </text>
                )
              }}
            />
          </Bar>
          {/* Tháng chưa có số: thanh trong suốt chỉ để ghi chữ "Chưa có số", không vẽ thanh 0 */}
          <Bar dataKey="none" stackId="b" fill="transparent" isAnimationActive={false}>
            <LabelList
              dataKey="none"
              content={(p) => {
                const { x = 0, y = 0, height = 0 } = p as { x?: number; y?: number; height?: number }
                return (
                  <text x={+x + 2} y={+y + +height / 2 + 4} className="fill-muted-foreground text-2xs">
                    Chưa có số
                  </text>
                )
              }}
            />
          </Bar>
          <Tooltip
            isAnimationActive={false}
            cursor={{ fill: 'var(--muted)', fillOpacity: 0.6 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const r = payload[0].payload as (typeof rows)[number]
              return (
                <ChartTip title={r.name.split(' · ')[0] + '/2026'}>
                  <ChartTipRow label="Hơi" value={`${fmt(r.steam, 0)} tấn`} />
                  <ChartTipRow swatch={<LegendLine color={DEEP} />} label="Biomass" value={r.b == null ? 'Chưa có số' : `${fmt(r.b, 0)} tấn`} />
                  {r.k != null && <ChartTipRow label="Biomass / tấn hơi" value={`${fmt(r.k, 2)} tấn`} />}
                </ChartTip>
              )
            }}
          />
        </BarChart>
      </ChartContainer>
      <span className="text-2xs leading-relaxed text-muted-foreground">Tấn hơi và tấn biomass theo số liệu hơi 2026 của nhà máy. Tỷ lệ biomass / hơi tăng là lò đốt kém hiệu quả hơn. Thiếu số không vẽ thành 0.</span>
    </figure>
  )
}
