import { CircleCheck, CircleDashed, CircleX, TriangleAlert, type LucideIcon } from 'lucide-react'
import { Fragment } from 'react'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { SpecBarChart } from './charts'
import { checkStatus, fmt, specText, type Check, type Status } from './data'

/* Trạng thái: đạt viền + chữ xanh lá; cảnh báo cam đặc; vượt đỏ đặc; chưa có số xám viền. Luôn kèm icon + nhãn. */

export const LABEL: Record<Status, string> = {
  ok: 'Đạt',
  warn: 'Chạm ngưỡng',
  over: 'Vượt TC',
  none: 'Chưa có số',
}
export const ICON: Record<Status, LucideIcon> = {
  ok: CircleCheck,
  warn: TriangleAlert,
  over: CircleX,
  none: CircleDashed,
}

export function QcBadge({ status, label, className }: { status: Status; label?: string; className?: string }) {
  const Icon = ICON[status]
  const text = label ?? LABEL[status]
  if (status === 'ok')
    return (
      <Badge variant="outline" className={cn('border-success/40 bg-success/10 font-medium text-success', className)}>
        <Icon strokeWidth={2.2} />
        {text}
      </Badge>
    )
  if (status === 'none')
    return (
      <Badge variant="outline" className={cn('border-dashed font-medium text-muted-foreground', className)}>
        <Icon strokeWidth={2.2} />
        {text}
      </Badge>
    )
  return (
    <Badge
      className={cn(
        'font-semibold',
        status === 'over' ? 'bg-destructive-solid text-destructive-solid-foreground shadow-sm shadow-destructive-solid/60' : 'bg-warning-solid text-warning-solid-foreground shadow-sm shadow-warning-solid/60',
        className,
      )}
    >
      <Icon strokeWidth={2.6} />
      {text}
    </Badge>
  )
}

/** Icon trạng thái nhỏ trong bảng (đạt thì để trống). */
export function StatusIcon({ status }: { status: Status }) {
  if (status === 'ok') return null
  const I = ICON[status]
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        <I aria-label={LABEL[status]} className={cn('size-3.5', status === 'over' ? 'text-destructive' : status === 'warn' ? 'text-warning' : 'text-muted-foreground')} strokeWidth={2.4} />
      </TooltipTrigger>
      <TooltipContent>{LABEL[status]}</TooltipContent>
    </Tooltip>
  )
}

/** Giá trị lệch của một chỉ tiêu, nói theo đầu nào lệch (Min hay Max). */
export function breach(c: Check) {
  const s = c.spec
  if (!s) return ''
  const f = (v: number) => `${fmt(v, c.dec)}${c.unit ? ' ' + c.unit : ''}`
  if (s.hi != null && c.max != null && c.max >= s.hi && (c.max > s.hi || s.hiStrict)) return `Max ${f(c.max)}`
  if (s.lo != null && c.min != null && c.min <= s.lo && (c.min < s.lo || s.loStrict)) return `Min ${f(c.min)}`
  if (c.avg != null) return `TB ${f(c.avg)}`
  return ''
}

/** Thanh dải Min–Max đặt trên khoảng tiêu chuẩn (bullet), mỗi dòng một thang riêng. */
export function RangeBar({ c, className, lg }: { c: Check; className?: string; lg?: boolean }) {
  const s = c.spec
  const vals = [c.min, c.avg, c.max].filter((v): v is number => v != null)
  if (!s || !vals.length) return <span className="text-2xs text-muted-foreground">—</span>
  const pts = [...vals, ...(s.lo != null ? [s.lo] : []), ...(s.hi != null ? [s.hi] : [])]
  let lo = Math.min(...pts)
  let hi = Math.max(...pts)
  const pad = (hi - lo || Math.abs(hi) || 1) * 0.25
  lo -= pad
  hi += pad
  const x = (v: number) => `${((v - lo) / (hi - lo)) * 100}%`
  const st = checkStatus(c)
  const tone = st === 'over' ? 'bg-destructive-solid' : st === 'warn' ? 'bg-warning-solid' : 'bg-foreground/70'
  const a = c.min ?? c.avg!
  const b = c.max ?? c.avg!
  return (
    <span role="img" aria-label={`Min đến Max so với tiêu chuẩn ${specText(s, c.dec)}`} className={cn('relative block', lg ? 'h-5 w-full' : 'h-3.5 w-24', className)}>
      <i className={cn('absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-full bg-chart-track', lg ? 'h-1.5' : 'h-1')} />
      <i
        className={cn('absolute top-1/2 -translate-y-1/2 rounded-xs bg-chart-5/18 ring-1 ring-chart-5/40', lg ? 'h-4' : 'h-2.5')}
        style={{
          left: s.lo != null ? x(s.lo) : 0,
          right: s.hi != null ? `calc(100% - ${x(s.hi)})` : 0,
        }}
      />
      <i className={cn('absolute top-1/2 -translate-y-1/2 rounded-full', lg ? 'h-1.5' : 'h-1', tone)} style={{ left: x(a), width: `max(3px, calc(${x(b)} - ${x(a)}))` }} />
      {c.avg != null && <i className={cn('absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-popover', lg ? 'size-3' : 'size-2', tone)} style={{ left: x(c.avg) }} />}
    </span>
  )
}

type TableProps = {
  checks: Check[]
  /** Dòng đang chọn (để đồng bộ với đồ thị phía trên) */
  selected?: string
  onSelect?: (c: Check) => void
  canSelect?: (c: Check) => boolean
  barClass?: string
  /** Hiện cột số mẫu */
  showN?: boolean
  /** Gộp các chỉ tiêu không có số đo vào một dòng chú thích dưới bảng */
  hideEmpty?: boolean
}

const rowId = (c: Check) => `${c.group ?? ''}|${c.key}`

/** Bảng chỉ tiêu: TC, bullet Min–Max, Min / TB / Max. Có nhóm (dòng nước, sản phẩm) thì chèn dòng tiêu đề nhóm. */
const isEmpty = (c: Check) => c.min == null && c.avg == null && c.max == null

export function CheckTable({ checks: all, selected, onSelect, canSelect, barClass, showN, hideEmpty }: TableProps) {
  let prev: string | undefined
  const checks = hideEmpty ? all.filter((c) => !isEmpty(c)) : all
  const empty = hideEmpty ? [...new Set(all.filter(isEmpty).map((c) => c.name))] : []
  return (
    <>
      <Table className="text-xs">
        <TableHeader>
          <TableRow>
            <TableHead className="h-8 text-2xs">Chỉ tiêu</TableHead>
            <TableHead className="h-8 text-2xs">TC</TableHead>
            <TableHead className="h-8 text-2xs">Min – Max so với TC</TableHead>
            <TableHead className="h-8 text-right text-2xs">Min</TableHead>
            <TableHead className="h-8 text-right text-2xs">TB</TableHead>
            <TableHead className="h-8 text-right text-2xs">Max</TableHead>
            {showN && <TableHead className="h-8 text-right text-2xs">Số mẫu</TableHead>}
            <TableHead className="h-8 w-6" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {checks.map((c) => {
            const st = checkStatus(c)
            const v = (n?: number) => (n == null ? '—' : fmt(n, c.dec))
            const head = c.group && c.group !== prev
            prev = c.group
            const selectable = !!onSelect && (canSelect?.(c) ?? true)
            const active = selected != null && selected === rowId(c)
            return (
              <Fragment key={rowId(c)}>
                {head && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={showN ? 8 : 7} className="pt-3 pb-1 text-2xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {c.group}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow
                  data-state={active ? 'selected' : undefined}
                  aria-selected={selectable ? active : undefined}
                  tabIndex={selectable ? 0 : undefined}
                  onClick={selectable ? () => onSelect!(c) : undefined}
                  onKeyDown={selectable ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect!(c)) : undefined}
                  className={cn(
                    selectable && 'cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
                    active && 'bg-accent shadow-[inset_3px_0_0_var(--primary)] hover:bg-accent',
                    isEmpty(c) && 'text-muted-foreground',
                  )}
                >
                  <TableCell className="max-w-44 truncate" title={c.name}>
                    {c.name} {c.unit && <span className="text-muted-foreground">({c.unit})</span>}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">{specText(c.spec, c.dec)}</TableCell>
                  <TableCell>
                    <RangeBar c={c} className={barClass} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{v(c.min)}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{v(c.avg)}</TableCell>
                  <TableCell className="text-right tabular-nums">{v(c.max)}</TableCell>
                  {showN && <TableCell className="text-right text-muted-foreground tabular-nums">{c.n ?? '—'}</TableCell>}
                  <TableCell className="px-1">
                    <StatusIcon status={st} />
                  </TableCell>
                </TableRow>
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
      {empty.length > 0 && (
        <p className="flex items-center gap-2 text-2xs text-muted-foreground">
          <QcBadge status="none" />
          {empty.join(', ')}
        </p>
      )}
    </>
  )
}

/** Thẻ chỉ tiêu cho ngăn chi tiết ở Tổng quan: TB nổi, dải Min–Max trên khoảng TC; chỉ tiêu chưa có số gộp một dòng. */
export function CheckCards({ checks: all }: { checks: Check[] }) {
  const checks = all.filter((c) => !isEmpty(c))
  const empty = [...new Set(all.filter(isEmpty).map((c) => (c.group ? `${c.group} · ${c.name}` : c.name)))]
  const groups: Check[][] = []
  for (const c of checks) {
    const last = groups.at(-1)
    if (last && last[0].group === c.group) last.push(c)
    else groups.push([c])
  }
  return (
    <div className="flex flex-col gap-3">
      {groups.map((g) => (
        <div key={g[0].group ?? '-'} className="flex flex-col gap-1.5">
          {g[0].group && <span className="text-2xs font-semibold tracking-wide text-muted-foreground uppercase">{g[0].group}</span>}
          <ul className="grid grid-cols-2 gap-2">
            {g.map((c) => {
              const st = checkStatus(c)
              const v = (n?: number) => (n == null ? '—' : fmt(n, c.dec))
              return (
                <li
                  key={rowId(c)}
                  className={cn(
                    'flex min-w-0 flex-col gap-1.5 rounded-glass-inner border px-3 pt-2 pb-2.5',
                    st === 'over' ? 'border-destructive/50 bg-destructive/6' : st === 'warn' ? 'border-warning/50 bg-warning-subtle/50' : 'border-border bg-popover/40',
                  )}
                >
                  <span className="flex h-4 items-center gap-1.5">
                    <span className="truncate text-xs font-medium" title={c.name}>
                      {c.name}
                    </span>
                    <span className="ml-auto">
                      <StatusIcon status={st} />
                    </span>
                  </span>
                  <span className="flex items-baseline gap-1">
                    <b className="text-lg leading-none font-semibold tabular-nums">{v(c.avg ?? c.max ?? c.min)}</b>
                    <span className="text-2xs text-muted-foreground">
                      {c.unit} · {c.avg != null ? 'TB' : c.max != null ? 'Max' : 'Min'}
                    </span>
                    <span className="ml-auto text-2xs text-muted-foreground tabular-nums">TC {specText(c.spec, c.dec)}</span>
                  </span>
                  <SpecBarChart c={c} />
                </li>
              )
            })}
          </ul>
        </div>
      ))}
      {empty.length > 0 && (
        <p className="flex flex-wrap items-center gap-1.5 text-2xs text-muted-foreground">
          <StatusIcon status="none" />
          Chưa có số: {empty.join(' · ')}
        </p>
      )}
    </div>
  )
}

export const checkId = rowId

export function Notes({ notes }: { notes: string[] }) {
  if (!notes.length) return null
  return (
    <ul className="flex flex-col gap-1 rounded-lg bg-muted px-3 py-2 text-2xs text-muted-foreground">
      {notes.map((n) => (
        <li key={n}>· {n}</li>
      ))}
    </ul>
  )
}
