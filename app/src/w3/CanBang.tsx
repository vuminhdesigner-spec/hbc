import { useState } from 'react'
import { Layer, Rectangle, Sankey, Tooltip } from 'recharts'
import { Check, Container, TriangleAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ChartContainer } from '@/components/ui/chart'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { StatusBadge } from '../w1/Alerts'
import { SegToggle } from '../w1/Allocation'
import { ChartTip, ChartTipRow } from '../w1/chart-bits'
import { fmt } from '../w1/data'
import { CARD } from './Charts'
import { BALANCE, BALANCE_KPI, FLOW_LINKS, FLOW_NODES } from './data'
import { Kpi, Unit } from './Nuoc'

const COLS = ['Giếng', 'Nước thô', 'Trung gian', 'Nước sạch', 'Nơi dùng (cấp 2)']
/** Mẫu số % của nhánh thất thoát theo cột: nước giếng, nước thô, nước trung gian. */
const LOSS_BASE: Record<number, number> = { 1: 30300, 2: 29800, 3: 29300 }

type NodeProps = {
  x: number
  y: number
  width: number
  height: number
  index: number
  payload: { name: string; value: number; depth: number }
}

function FlowNode({ x, y, width, height, index, payload }: NodeProps) {
  const loss = FLOW_NODES[index]?.loss
  const base = LOSS_BASE[payload.depth]
  const label = `${payload.name} · ${fmt(payload.value, 0)}${loss && base ? ` (${fmt((payload.value / base) * 100, 1)}%)` : ''}`
  return (
    <Layer>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={Math.max(height, 2)}
        radius={2}
        fill={loss ? 'var(--card)' : 'color-mix(in oklab, var(--chart-2) 70%, var(--foreground))'}
        stroke={loss ? 'var(--foreground)' : 'none'}
        strokeDasharray={loss ? '3 2' : undefined}
      />
      <text x={x + width + 6} y={y + Math.min(Math.max(height, 12), 22) / 2 + 4} className={cn('fill-foreground text-2xs tabular-nums', loss && 'font-semibold')}>
        {label}
      </text>
    </Layer>
  )
}

type LinkProps = {
  sourceX: number
  targetX: number
  sourceY: number
  targetY: number
  sourceControlX: number
  targetControlX: number
  linkWidth: number
  index: number
}

function FlowLink({ sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index }: LinkProps) {
  const loss = FLOW_NODES[FLOW_LINKS[index][1]]?.loss
  return (
    <path
      d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
      fill="none"
      stroke={loss ? 'var(--chart-ext-axis)' : 'var(--chart-2)'}
      strokeOpacity={loss ? 0.45 : 0.22}
      strokeWidth={Math.max(linkWidth, 1)}
    />
  )
}

function FlowCard() {
  const data = {
    nodes: FLOW_NODES.map((n) => ({ name: n.name })),
    links: FLOW_LINKS.map(([source, target, value]) => ({
      source,
      target,
      value,
    })),
  }
  return (
    <figure className={cn(CARD, 'gap-2')}>
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-body font-semibold">Dòng nước từ giếng đến nơi dùng · tháng 9/2026</span>
        <span className="flex items-center gap-3.5 text-2xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.25">
            <i className="size-2.5 rounded-xs bg-chart-2" />
            Đồng hồ
          </span>
          <span className="inline-flex items-center gap-1.25">
            <i className="size-2.5 rounded-xs border border-dashed border-foreground" />
            Thất thoát / chưa đo
          </span>
          <span>Độ dày dòng = m³</span>
        </span>
      </figcaption>
      {/* Tên cột canh theo vị trí nút: vùng nút = chiều rộng − lề phải 220 − bề rộng nút 12, chia 4 khoảng. */}
      <div className="relative h-4 text-2xs font-semibold text-muted-foreground">
        {COLS.map((c, i) => (
          <span key={c} className="absolute top-0 whitespace-nowrap" style={{ left: `calc((100% - 232px) * ${i / 4})` }}>
            {c}
          </span>
        ))}
      </div>
      <ChartContainer config={{}} className="aspect-auto min-h-0 w-full flex-1">
        <Sankey data={data} node={FlowNode} link={FlowLink} nodeWidth={12} nodePadding={6} iterations={0} align="left" margin={{ top: 4, right: 220, bottom: 4, left: 0 }}>
          <Tooltip
            isAnimationActive={false}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as
                | {
                    payload?: {
                      name?: string
                      value?: number
                      source?: { name: string }
                      target?: { name: string }
                    }
                  }
                | undefined
              const v = p?.payload
              if (!active || !v) return null
              const title = v.source && v.target ? `${v.source.name} → ${v.target.name}` : (v.name ?? '')
              return (
                <ChartTip title={title}>
                  <ChartTipRow label="Lượng nước" value={`${fmt(v.value ?? 0, 0)} m³`} />
                </ChartTip>
              )
            }}
          />
        </Sankey>
      </ChartContainer>
    </figure>
  )
}

const STATE_BADGE = {
  warn: <StatusBadge kind="warn">Cảnh báo · quá 10%</StatusBadge>,
  tank: (
    <Badge variant="outline" className="font-semibold">
      <Container />
      Qua bể chứa · chỉ hiện chênh
    </Badge>
  ),
  ok: (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <Check className="size-3" />
      Trong ngưỡng
    </span>
  ),
}

function BalanceTable() {
  const [upTo, setUpTo] = useState<'1' | '2' | '3'>('2')
  const rows = BALANCE.filter((r) => r.level <= +upTo)
  const NUM = 'text-right tabular-nums'
  return (
    <section aria-label="Đối chiếu cha – con" className="glass-card glass-bg flex min-h-0 min-w-0 flex-col">
      <div className="flex items-center justify-between gap-3 px-4.5 pt-3.5 pb-2">
        <span className="flex flex-col gap-0.5">
          <span className="text-body font-semibold">Đối chiếu cha – con · 3 cấp đồng hồ</span>
          <span className="text-2xs text-muted-foreground">Chênh = đồng hồ cha − tổng đồng hồ con trực tiếp · quá 10% thì cảnh báo · qua bể chứa chỉ hiện chênh</span>
        </span>
        <SegToggle
          label="Hiện tới cấp"
          value={upTo}
          onChange={setUpTo}
          items={[
            ['1', 'Cấp 1'],
            ['2', 'Cấp 2'],
            ['3', 'Cấp 3'],
          ]}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Table className="text-xs">
          <TableHeader className="sticky top-0 z-1 bg-muted text-2xs">
            <TableRow>
              <TableHead>Đồng hồ</TableHead>
              <TableHead>Cấp</TableHead>
              <TableHead className={NUM}>m³</TableHead>
              <TableHead className={NUM}>Tổng con</TableHead>
              <TableHead className={NUM}>Chênh, m³</TableHead>
              <TableHead className={NUM}>Chênh</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const dm = r.sum == null ? null : r.v - r.sum
              return (
                <TableRow key={r.name} className={cn(r.state === 'warn' && 'bg-warning-subtle/50')}>
                  <TableCell
                    className={cn('max-w-80 truncate', r.level < 2 && 'font-semibold')}
                    style={{
                      paddingLeft: `calc(var(--spacing) * ${2 + r.depth * 4})`,
                    }}
                  >
                    {r.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.level === 0 ? 'Nguồn' : `Cấp ${r.level}`}</TableCell>
                  <TableCell className={NUM}>{fmt(r.v, 0)}</TableCell>
                  <TableCell className={NUM}>{r.sum == null ? '' : fmt(r.sum, 0)}</TableCell>
                  <TableCell className={NUM}>{dm == null ? '' : fmt(dm, 0)}</TableCell>
                  <TableCell className={cn(NUM, 'font-semibold')}>{dm == null ? '' : `${fmt((dm / r.v) * 100, 1)}%`}</TableCell>
                  <TableCell className="whitespace-nowrap">{r.state ? STATE_BADGE[r.state] : null}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

/** Tab Nước (W3), màn Cân bằng nước — theo wireframe v0.3 đã review 19/10. */
export function CanBang() {
  // Cao cố định bằng phần màn còn lại (trừ đầu trang h-14, thanh lọc h-13, vạch tải h-0.5) để bảng cuộn bên trong; màn thấp hơn 700 px thì cuộn cả trang.
  return (
    <div className="grid h-[calc(100svh-var(--spacing)*27.5)] min-h-175 grid-rows-[auto_minmax(--spacing(72),1.1fr)_minmax(--spacing(56),1fr)] gap-3 px-6 pt-0.5 pb-4">
      <section aria-label="Chỉ số cân bằng nước" className="grid grid-cols-4 gap-3">
        {BALANCE_KPI.map((k) => (
          <Kpi key={k.title} title={k.title} note={k.note}>
            {fmt(k.value, 0)} <Unit>{k.unit}</Unit>
          </Kpi>
        ))}
        <Kpi title="Thất thoát giếng → nước sạch" note="▲ 1,4 điểm so cùng kỳ">
          2.760 <Unit>m³ · 9,1%</Unit>
        </Kpi>
        <div className="glass-card glass-bg flex min-w-0 flex-col gap-1 px-4 py-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold">
            <TriangleAlert className="size-3.5 text-warning-foreground" strokeWidth={2.2} />
            Đồng hồ con lệch đồng hồ cha quá 10%
          </span>
          <span className="text-kpi font-bold tracking-tight tabular-nums">
            1 <Unit>nhánh</Unit>
          </span>
          <span className="truncate text-2xs text-muted-foreground">Nấu: 7.100 − các con 6.300 = 800 m³ (11,3%)</span>
        </div>
      </section>
      <FlowCard />
      <BalanceTable />
    </div>
  )
}
