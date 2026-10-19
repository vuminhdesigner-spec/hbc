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
import { ALLOC, MONTH_POINTS, SHIFT_LANES, SHIFT_POINTS, TOU, UNMETERED_MWH, expected, type MonthPoint, type ShiftPoint } from './data'

const AXIS = '[&_.recharts-cartesian-axis-tick_text]:fill-chart-axis [&_.recharts-cartesian-axis-tick_text]:text-3xs'
const CARD = 'glass-card glass-bg flex min-h-0 min-w-0 flex-col gap-1.5 px-4.5 pt-3.5 pb-3'

/* ---------- Điện theo khu vực / công đoạn, so cùng kỳ ---------- */

export function AllocBars({ group, mode, onMode }: { group: 'area' | 'stage'; mode: Mode; onMode: (m: Mode) => void }) {
  const per = mode === 'per'
  const conv = (v: number) => (per ? v / FINISHED_ML : v)
  const top = Math.max(...ALLOC[group].map(([, cur]) => cur))
  const unit = per ? 'kWh/1.000 L' : 'MWh'
  const dec = per ? 1 : 0
  return (
    <figure className={CARD}>
      <figcaption className="flex flex-col gap-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-body font-semibold">Điện theo {group === 'area' ? 'khu vực' : 'công đoạn'} · tháng 9/2026</span>
          <ModeToggle mode={mode} onMode={onMode} />
        </span>
        <span className="flex gap-3.5 text-2xs text-muted-foreground">
          <span>{unit} · xếp từ lớn nhất · so cùng kỳ 2025</span>
        </span>
      </figcaption>
      <RankList>
        {ALLOC[group].map(([name, cur, prior, warn]) => (
          <AllocRow key={name} metric="dien" name={name} value={fmt(conv(cur), dec)} share={cur / top} delta={(cur / prior - 1) * 100} warn={warn} />
        ))}
      </RankList>
      <span className="text-2xs text-muted-foreground">Trên 1.000 L: chia thành phẩm chung, các khu cộng lại bằng toàn nhà máy. Chưa có đồng hồ: {UNMETERED_MWH} MWh.</span>
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
  if (payload.kind === 'current')
    return (
      <g>
        <circle cx={cx} cy={cy} r={6.5} fill="var(--chart-1)" stroke="var(--foreground)" strokeWidth={2} />
        <text x={cx - 12} y={cy + 18} textAnchor="end" className="chart-label fill-foreground">
          T9/2026: 83,0 · kỳ vọng {fmt(expected(8.1), 1)} (+3,7%)
        </text>
      </g>
    )
  if (payload.kind === 'prior')
    return (
      <g>
        <circle cx={cx} cy={cy} r={5} fill="var(--card)" stroke="var(--chart-4)" strokeWidth={2.5} />
        <text x={cx - 10} y={cy - 10} textAnchor="end" className="chart-label fill-muted-foreground">
          Cùng kỳ T9/2025: 84,0
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
          <YAxis domain={[55, 135]} ticks={[60, 80, 100, 120]} tickLine={false} axisLine={false} width={42} />
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
                  <ChartTipRow label="Điện" value={`${fmt(p.v, 1)} kWh/1.000 L`} />
                  <ChartTipRow label="Sản lượng" value={`${fmt(p.vol, 1)} triệu L`} />
                  <ChartTipRow label="Kỳ vọng" value={`${fmt(e, 1)} (${pct((p.v / e - 1) * 100)})`} />
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
          <i className="size-3 rounded-full border-2 border-foreground bg-chart-1" />
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
        {String(payload.day).padStart(2, '0')}/09 · {fmt(payload.v, 0)} ({payload.v > ln.cmp ? '+' : '−'}
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
          <YAxis dataKey="v" domain={[300, 800]} ticks={[400, 500, 600, 700]} tickLine={false} axisLine={false} width={42} tickFormatter={(v: number) => fmt(v, 0)} />
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
                  <ChartTipRow label="Điện" value={`${fmt(p.v, 0)} kWh/ca`} />
                  <ChartTipRow label="Trung bình cùng ca, cùng kỳ" value={`${fmt(ln.cmp, 0)} kWh/ca`} />
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
          <span className="text-body font-semibold">{shift ? 'Điện theo ca · khu xử lý nước · kWh/ca' : 'Điện / 1.000 L theo sản lượng · toàn nhà máy'}</span>
          <span className="flex items-center gap-1 text-2xs text-muted-foreground">
            {shift ? 'Mỗi điểm 1 ca, tháng 9/2026 · so cùng ca kỳ so sánh' : 'kWh/1.000 L · mỗi điểm 1 tháng, 2024–2026'}
            {shift && (
              <HintTooltip>
                <TooltipTrigger render={<button type="button" aria-label="Giải thích đồ thị theo ca" className="grid size-4 place-items-center rounded-full text-muted-foreground hover:text-foreground" />}>
                  <Info className="size-3" />
                </TooltipTrigger>
                <TooltipContent className="max-w-72 flex-col items-start gap-1 text-left">
                  <span>Chỉ khu có nhật ký ca: xử lý nước cấp và xử lý nước thải.</span>
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

/* ---------- Khung giờ theo tháng ---------- */

// Một chuỗi điện chia 3 khung giờ: cùng sắc vàng, đậm dần theo giá (cao điểm đậm nhất).
const TOU_COLORS = { c: 'var(--tou-peak)', b: 'var(--tou-normal)', t: 'var(--tou-low)' }
const TOU_OPACITY = { c: 1, b: 1, t: 1 }

export function TouCard() {
  const anim = useChartAnimation()
  const [focus, setFocus] = useState<string | null>(null)
  const rows = TOU.map(([m, c, b, t, mwh]) => ({ name: `T${m} · ${fmt(mwh, 0)} MWh`, c, b, t }))
  return (
    <figure className={cn(CARD, 'bg-muted/40')}>
      <figcaption className="flex flex-col gap-1">
        <span className="flex items-baseline justify-between">
          <span className="text-body font-semibold">Khung giờ theo tháng · Σ 4 MBA</span>
          <span className="text-2xs text-muted-foreground">Thông tin phụ</span>
        </span>
        <span className="flex gap-3.5 text-2xs text-muted-foreground">
          {(
            [
              ['c', 'Cao điểm'],
              ['b', 'Bình thường'],
              ['t', 'Thấp điểm'],
            ] as const
          ).map(([k, l]) => (
            <FocusItem key={k} id={k} onFocus={setFocus}>
              <span className="inline-flex items-center gap-1.25">
                <i className="size-2 rounded-xs" style={{ background: TOU_COLORS[k], opacity: TOU_OPACITY[k] }} />
                {l}
              </span>
            </FocusItem>
          ))}
          <span className="ml-auto">% cao điểm</span>
        </span>
      </figcaption>
      <ChartContainer config={{}} className={cn('aspect-auto min-h-0 w-full flex-1', AXIS)}>
        <BarChart data={rows} layout="vertical" stackOffset="expand" margin={{ top: 0, right: 44, bottom: 0, left: 0 }} barCategoryGap="28%" accessibilityLayer>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={104} tickLine={false} axisLine={false} interval={0} className="[&_text]:fill-foreground!" />
          <Bar {...anim} className={seriesClass(focus, 'c')} dataKey="c" stackId="a" fill={TOU_COLORS.c} fillOpacity={TOU_OPACITY.c} radius={[3, 0, 0, 3]} />
          <Bar {...anim} className={seriesClass(focus, 'b')} dataKey="b" stackId="a" fill={TOU_COLORS.b} fillOpacity={TOU_OPACITY.b} />
          <Bar {...anim} className={seriesClass(focus, 't')} dataKey="t" stackId="a" fill={TOU_COLORS.t} fillOpacity={TOU_OPACITY.t} radius={[0, 3, 3, 0]}>
            <LabelList
              dataKey="c"
              content={(p) => {
                const { x = 0, y = 0, width = 0, height = 0, value } = p as { x?: number; y?: number; width?: number; height?: number; value?: number }
                return (
                  <text x={+x + +width + 8} y={+y + +height / 2 + 4} className="fill-foreground text-2xs font-semibold tabular-nums">
                    {fmt(value ?? 0, 1)}%
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
                <ChartTip title={r.name}>
                  <ChartTipRow label="Cao điểm" value={`${fmt(r.c, 1)}%`} />
                  <ChartTipRow label="Bình thường" value={`${fmt(r.b, 1)}%`} />
                  <ChartTipRow label="Thấp điểm" value={`${fmt(r.t, 1)}%`} />
                </ChartTip>
              )
            }}
          />
        </BarChart>
      </ChartContainer>
      <span className="text-2xs leading-relaxed text-muted-foreground">
        Đồng hồ khu vực chỉ ghi tổng; so theo khu cần đồng hồ 3 giá (Lạnh 2, Lạnh 1, Nhà nấu, Máy nén khí 2). Không quy ra tiền; chỉ dời giờ chạy được vào quý 4, quý 1.
      </span>
    </figure>
  )
}
