import { X } from 'lucide-react'
import { Area, Bar, CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceLine, Tooltip, XAxis, YAxis, type DotItemDotProps } from 'recharts'
import { Button } from '@/components/ui/button'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useState } from 'react'
import { ChartTip, ChartTipRow, FocusItem, LegendLine, LegendBox, seriesClass } from './chart-bits'
import { useChartAnimation } from './motion'
import { FACTORY_TOTAL, METRICS, SERIES_COLOR, VOLUME, fmt, type Metric, type Unit } from './data'

// Cột sản lượng chiếm tối đa ~70% chiều cao vùng vẽ (15 triệu L ở 76/110 px như bản 38).
const VOL_MAX = (15 * 110) / 76

// Thang tự tính khi không có miền cố định (nước, hơi, hoặc đang xem một khu).
function scale(values: number[], ref: number | null) {
  let lo = Math.min(...values)
  let hi = Math.max(...values)
  if (ref != null) hi = Math.max(hi, ref)
  const sp = hi - lo || 1
  lo -= sp * 0.15
  hi += sp * 0.15
  const raw = (hi - lo) / 4
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const n = raw / mag
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag
  return { lo, hi, step }
}

type Props = {
  metric: Metric
  onMetric: (m: Metric) => void
  selected: Unit | null
  onClear: () => void
}

export function MonthlyChart(props: Props) {
  // Đổi chỉ số = đồ thị mới: remount để vẽ dần lại. Đổi khu (cùng đơn vị): biến hình 300 ms.
  return <MonthlyChartInner key={props.metric} {...props} />
}

function MonthlyChartInner({ metric, onMetric, selected, onClear }: Props) {
  const anim = useChartAnimation()
  const [focus, setFocus] = useState<string | null>(null)
  const m = METRICS[metric]
  const color = SERIES_COLOR[metric]
  const selVal = selected?.[metric] ?? null
  const share = selected && selVal != null ? selVal / FACTORY_TOTAL[metric] : 1
  const subject = selected
    ? selVal != null
      ? ` — ${selected.name} (chia thành phẩm)`
      : ` — ${selected.name} không có số ${m.name.toLowerCase()}, đang hiện toàn nhà máy`
    : ''

  const rows = m.cur.map((v, i) => ({ month: `T${i + 1}`, cur: v * share, prior: m.prior[i] * share, vol: VOLUME[i] }))
  const showRef = m.ref != null && share === 1
  const s =
    share === 1 && m.dom && m.step
      ? { lo: m.dom[0], hi: m.dom[1], step: m.step }
      : scale([...rows.map((r) => r.cur), ...rows.map((r) => r.prior)], showRef ? m.ref : null)
  const ticks: number[] = []
  for (let g = Math.ceil(s.lo / s.step) * s.step; g <= s.hi + 1e-9; g += s.step) ticks.push(+g.toFixed(4))
  const tickDec = s.step < 1 ? (s.step < 0.1 ? 2 : 1) : 0
  const last = rows.length - 1

  const config = {
    cur: { label: '2026', color },
    prior: { label: 'Cùng kỳ 2025', color: 'var(--chart-4)' },
    vol: { label: 'Sản lượng', color: 'var(--chart-ext-volume)' },
  } satisfies ChartConfig

  const curDot = (p: DotItemDotProps) => {
    const { cx, cy, index, value } = p as DotItemDotProps & { value: number }
    const over = showRef && value > (m.ref as number)
    const isLast = index === last
    return (
      <g key={`d${index}`}>
        <circle
          cx={cx}
          cy={cy}
          r={over || isLast ? 4.5 : 3}
          fill={over ? 'var(--destructive)' : isLast ? color : 'var(--card)'}
          stroke={over ? 'var(--destructive)' : color}
          strokeWidth={2}
        />
        {(over || isLast) && (
          <text x={cx} y={(cy ?? 0) - 10} textAnchor="middle" className={over ? 'chart-label fill-destructive-foreground' : 'chart-label fill-foreground'}>
            {over ? `▲ Vượt ${fmt(value, m.dec)}` : fmt(value, m.dec)}
          </text>
        )}
      </g>
    )
  }

  return (
    <figure className="glass-card glass-bg col-span-3 flex min-h-0 min-w-0 flex-col gap-1.5 px-4.5 pt-3.5 pb-3">
      <figcaption className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <span className="truncate text-body font-semibold">
            {m.title}
            {subject}
          </span>
          {selected && (
            <Button size="xs" variant="outline" onClick={onClear} className="rounded-full border-ring bg-accent font-semibold text-accent-foreground">
              Về toàn nhà máy <X />
            </Button>
          )}
          <span className="flex-1" />
          <ToggleGroup
            aria-label="Chỉ số đồ thị"
            value={[metric]}
            onValueChange={(v) => v[0] && onMetric(v[0] as Metric)}
            spacing={0.5}
            size="sm"
            className="rounded-full! bg-muted p-0.75"
          >
            {(['dien', 'nuoc', 'hoi'] as Metric[]).map((k) => (
              <ToggleGroupItem
                key={k}
                value={k}
                className="h-6 gap-1.5 rounded-full! px-3 text-xs font-normal text-muted-foreground aria-pressed:bg-popover aria-pressed:font-semibold aria-pressed:text-foreground aria-pressed:shadow-glass-pill"
              >
                <i className="size-1.75 rounded-full" style={{ background: SERIES_COLOR[k] }} />
                {METRICS[k].name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex gap-3.5 text-2xs whitespace-nowrap text-muted-foreground">
          <FocusItem id="cur" onFocus={setFocus}>
            <LegendLine color={color}>2026</LegendLine>
          </FocusItem>
          <FocusItem id="prior" onFocus={setFocus}>
            <LegendLine color="var(--chart-4)" faint>
              Cùng kỳ 2025
            </LegendLine>
          </FocusItem>
          {showRef && (
            <LegendLine color="var(--foreground)" dashed>
              {m.refLabel}
            </LegendLine>
          )}
          <FocusItem id="vol" onFocus={setFocus}>
            <LegendBox>Sản lượng thành phẩm, triệu L (trục phải)</LegendBox>
          </FocusItem>
          <span className="ml-auto truncate">{m.unit} · bấm một khu ở Phân bổ để xem các tháng của khu đó</span>
        </div>
      </figcaption>

      <ChartContainer config={config} className="aspect-auto min-h-0 w-full flex-1 [&_.recharts-cartesian-axis-tick_text]:fill-chart-axis [&_.recharts-cartesian-axis-tick_text]:text-3xs">
        <ComposedChart data={rows} margin={{ top: 22, right: 0, bottom: 0, left: 0 }} accessibilityLayer>
          <defs>
            <linearGradient id="gCur" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity={0.55} />
              <stop offset="1" stopColor={color} stopOpacity={0.04} />
            </linearGradient>
            <linearGradient id="gVol" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--chart-ext-volume)" stopOpacity={0.55} />
              <stop offset="1" stopColor="var(--chart-ext-volume)" stopOpacity={0.15} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={{ stroke: 'var(--input)' }}
            tickMargin={6}
            tick={(p) => (
              <text x={p.x} y={p.y} dy={10} textAnchor="middle" className={p.index === last ? 'fill-foreground text-3xs font-semibold' : 'fill-chart-axis text-3xs'}>
                {p.payload.value}
              </text>
            )}
          />
          <YAxis yAxisId="l" domain={[s.lo, s.hi]} ticks={ticks} tickLine={false} axisLine={false} width={40} tickFormatter={(v: number) => fmt(v, tickDec)} />
          <YAxis yAxisId="r" orientation="right" domain={[0, VOL_MAX]} ticks={[5, 10, 15]} tickLine={false} axisLine={false} width={40} />
          {showRef && <ReferenceArea yAxisId="l" y1={m.ref as number} y2={s.hi} fill="var(--destructive)" fillOpacity={0.1} ifOverflow="hidden" />}
          <Bar {...anim} className={seriesClass(focus, 'vol')} yAxisId="r" dataKey="vol" barSize={32} radius={[4, 4, 0, 0]} fill="url(#gVol)" />
          <Area {...anim} className={seriesClass(focus, 'cur')} yAxisId="l" dataKey="cur" type="linear" stroke="none" fill="url(#gCur)" activeDot={false} tooltipType="none" />
          <Line {...anim} className={seriesClass(focus, 'prior')} yAxisId="l" dataKey="prior" type="linear" stroke="var(--chart-4)" strokeOpacity={0.55} strokeWidth={1.75} dot={false} activeDot={false} />
          <Line {...anim} className={seriesClass(focus, 'cur')} yAxisId="l" dataKey="cur" type="linear" stroke={color} strokeWidth={3} dot={curDot} activeDot={{ r: 5, fill: color, stroke: 'var(--card)', strokeWidth: 2 }} />
          {showRef && (
            <ReferenceLine
              yAxisId="l"
              y={m.ref as number}
              stroke="var(--foreground)"
              strokeWidth={1.2}
              strokeDasharray="5 4"
            />
          )}
          <Tooltip
            isAnimationActive={false}
            cursor={{ stroke: 'var(--chart-ext-axis)', strokeDasharray: '3 3' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const r = payload[0].payload as (typeof rows)[number]
              const over = showRef && r.cur > (m.ref as number)
              return (
                <ChartTip title={`Tháng ${String(label).slice(1)}`}>
                  <ChartTipRow swatch={<LegendLine color={color} />} label="2026" value={`${fmt(r.cur, m.dec)} ${m.unit}${over ? ' · Vượt' : ''}`} />
                  <ChartTipRow swatch={<LegendLine color="var(--chart-4)" faint />} label="Cùng kỳ 2025" value={`${fmt(r.prior, m.dec)} ${m.unit}`} />
                  <ChartTipRow swatch={<LegendBox />} label="Sản lượng" value={`${fmt(r.vol, 1)} triệu L`} />
                </ChartTip>
              )
            }}
          />
        </ComposedChart>
      </ChartContainer>
    </figure>
  )
}
