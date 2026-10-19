import { Area, CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceLine, Tooltip, XAxis, YAxis, type DotItemDotProps } from 'recharts'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { useState } from 'react'
import { ChartTip, ChartTipRow, FocusItem, LegendLine, seriesClass } from './chart-bits'
import { useChartAnimation } from './motion'
import { SEC, VOLUME, VOLUME_PRIOR, fmt } from './data'

// Luỹ kế năm = bình quân gia quyền theo sản lượng tháng.
function cumulative(values: number[], vol: number[]) {
  let sw = 0
  let sv = 0
  return values.map((v, i) => {
    sw += v * vol[i]
    sv += vol[i]
    return sw / sv
  })
}

const cur = cumulative(SEC.cur, VOLUME)
const prior = cumulative(SEC.prior, VOLUME_PRIOR)
const lastIdx = cur.length - 1
const lastCum = cur[lastIdx]

const rows = Array.from({ length: 12 }, (_, i) => {
  const k = i - lastIdx
  return {
    month: `T${i + 1}`,
    cur: i <= lastIdx ? cur[i] : null,
    prior: i <= lastIdx ? prior[i] : null,
    forecast: k >= 0 ? lastCum + ((SEC.forecast - lastCum) * k) / 3 : null,
  }
})

const SHOWN = new Set(['T1', 'T4', 'T7', `T${lastIdx + 1}`, 'T12'])

const config = {
  cur: { label: '2026', color: 'var(--chart-5)' },
  prior: { label: 'Cùng kỳ', color: 'var(--chart-4)' },
  forecast: { label: 'Dự báo', color: 'var(--chart-5)' },
} satisfies ChartConfig

export function SecChart() {
  const anim = useChartAnimation()
  const [focus, setFocus] = useState<string | null>(null)
  const curDot = (p: DotItemDotProps) =>
    p.index === lastIdx ? (
      <g key="last">
        <circle cx={p.cx} cy={p.cy} r={4.5} fill="var(--chart-5)" stroke="var(--card)" strokeWidth={2} />
        <text x={(p.cx ?? 0) - 7} y={(p.cy ?? 0) - 9} textAnchor="end" className="chart-label fill-foreground">
          {fmt(lastCum, 0)}
        </text>
      </g>
    ) : (
      <g key={p.index} />
    )

  return (
    <figure className="glass-card glass-bg flex min-h-0 min-w-0 flex-col gap-1.5 px-4.5 pt-3.5 pb-3">
      <figcaption className="flex flex-col gap-1.5">
        <span className="truncate text-body font-semibold">SEC luỹ kế năm · MJ/1.000 L</span>
        <div className="flex flex-wrap gap-x-3.5 gap-y-0.5 text-2xs whitespace-nowrap text-muted-foreground">
          <FocusItem id="cur" onFocus={setFocus}>
            <LegendLine color="var(--chart-5)">2026</LegendLine>
          </FocusItem>
          <FocusItem id="prior" onFocus={setFocus}>
            <LegendLine color="var(--chart-4)" faint>
              Cùng kỳ
            </LegendLine>
          </FocusItem>
          <FocusItem id="forecast" onFocus={setFocus}>
            <LegendLine color="var(--chart-5)" dotted>
              Dự báo ≈ {fmt(SEC.forecast, 0)}
            </LegendLine>
          </FocusItem>
          <LegendLine color="var(--foreground)" dashed>
            Trần {fmt(SEC.ceiling, 0)}
          </LegendLine>
          <LegendLine color="var(--warning)" dotted>
            90% · {fmt(SEC.warnAt, 0)}
          </LegendLine>
        </div>
      </figcaption>
      <ChartContainer config={config} className="aspect-auto min-h-0 w-full flex-1 [&_.recharts-cartesian-axis-tick_text]:fill-chart-axis [&_.recharts-cartesian-axis-tick_text]:text-3xs">
        <ComposedChart data={rows} margin={{ top: 18, right: 12, bottom: 0, left: 6 }} accessibilityLayer>
          <defs>
            <linearGradient id="gSec" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--chart-5)" stopOpacity={0.5} />
              <stop offset="1" stopColor="var(--chart-5)" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="month"
            interval={0}
            tickLine={false}
            axisLine={{ stroke: 'var(--input)' }}
            tick={(p) =>
              SHOWN.has(p.payload.value) ? (
                <text x={p.x} y={p.y} dy={10} textAnchor="middle" className={p.payload.value === `T${lastIdx + 1}` ? 'fill-foreground text-3xs font-semibold' : 'fill-chart-axis text-3xs'}>
                  {p.payload.value}
                </text>
              ) : (
                <g />
              )
            }
          />
          <YAxis domain={[1150, 1600]} ticks={[1200, 1300, 1400, 1500, 1600]} tickLine={false} axisLine={false} width={38} tickFormatter={(v: number) => fmt(v, 0)} />
          <ReferenceArea y1={SEC.warnAt} y2={SEC.ceiling} fill="var(--warning)" fillOpacity={0.12} />
          <ReferenceLine
            y={SEC.ceiling}
            stroke="var(--foreground)"
            strokeWidth={1.2}
            strokeDasharray="5 4"
          />
          <ReferenceLine
            y={SEC.warnAt}
            stroke="var(--warning)"
            strokeDasharray="2 3"
          />
          <Area {...anim} className={seriesClass(focus, 'cur')} dataKey="cur" type="linear" stroke="none" fill="url(#gSec)" activeDot={false} tooltipType="none" connectNulls={false} />
          <Line {...anim} className={seriesClass(focus, 'prior')} dataKey="prior" type="linear" stroke="var(--chart-4)" strokeOpacity={0.55} strokeWidth={1.75} dot={false} activeDot={false} />
          <Line {...anim} className={seriesClass(focus, 'cur')} dataKey="cur" type="linear" stroke="var(--chart-5)" strokeWidth={2.5} dot={curDot} activeDot={{ r: 4.5, fill: 'var(--chart-5)', stroke: 'var(--card)', strokeWidth: 2 }} />
          <Line {...anim} className={seriesClass(focus, 'forecast')} dataKey="forecast" type="linear" stroke="var(--chart-5)" strokeWidth={2} strokeDasharray="2 3" dot={false} activeDot={false} />
          <Tooltip
            isAnimationActive={false}
            cursor={{ stroke: 'var(--chart-ext-axis)', strokeDasharray: '3 3' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const r = payload[0].payload as (typeof rows)[number]
              return (
                <ChartTip title={`Luỹ kế đến ${label}`}>
                  {r.cur != null ? (
                    <>
                      <ChartTipRow label="2026" value={`${fmt(r.cur, 0)} MJ/1.000 L`} />
                      <ChartTipRow label="Cùng kỳ" value={`${fmt(r.prior as number, 0)} MJ/1.000 L`} />
                    </>
                  ) : (
                    <ChartTipRow label="Dự báo" value={`≈ ${fmt(r.forecast as number, 0)} MJ/1.000 L`} />
                  )}
                  <ChartTipRow label="Trần" value={`${fmt(SEC.ceiling, 0)} MJ/1.000 L`} />
                </ChartTip>
              )
            }}
          />
        </ComposedChart>
      </ChartContainer>
    </figure>
  )
}
