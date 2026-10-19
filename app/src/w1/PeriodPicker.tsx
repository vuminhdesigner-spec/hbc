import { useState } from 'react'
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { vi } from 'react-day-picker/locale'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { SegToggle } from './Allocation'

export type Period = 'month' | 'year' | 'custom'
export type Range = { from: Date; to: Date }
export type Compare = { kind: 'yoy' } | { kind: 'custom'; range: Range }

// Số có đến hết tháng 9/2026 (fixture); không cho chọn kỳ tương lai.
export const LAST_DAY = new Date(2026, 8, 30)
const FIRST_YEAR = 2025

const pad = (n: number) => String(n).padStart(2, '0')
const dmy = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
const isFullMonth = (r: Range) => r.from.getDate() === 1 && r.from.getMonth() === r.to.getMonth() && r.from.getFullYear() === r.to.getFullYear() && (r.to.getDate() === new Date(r.to.getFullYear(), r.to.getMonth() + 1, 0).getDate() || r.to.getTime() === LAST_DAY.getTime())
const isFullYear = (r: Range) => r.from.getMonth() === 0 && r.from.getDate() === 1 && r.from.getFullYear() === r.to.getFullYear() && ((r.to.getMonth() === 11 && r.to.getDate() === 31) || r.to.getTime() === LAST_DAY.getTime())
/** Nhãn ngắn trên nút: "Tháng 9/2026", "Năm 2026", còn lại là khoảng ngày. */
export const shortRange = (r: Range) =>
  isFullYear(r) ? `Năm ${r.from.getFullYear()}${r.to.getTime() === LAST_DAY.getTime() ? ' (đến 30/09)' : ''}` : isFullMonth(r) ? `Tháng ${r.from.getMonth() + 1}/${r.from.getFullYear()}` : fmtRange(r)

export const fmtRange = (r: Range) =>
  r.from.getFullYear() === r.to.getFullYear() ? `${pad(r.from.getDate())}/${pad(r.from.getMonth() + 1)} – ${dmy(r.to)}` : `${dmy(r.from)} – ${dmy(r.to)}`

const monthRange = (y: number, m: number): Range => ({ from: new Date(y, m, 1), to: new Date(y, m + 1, 0) })
const yearRange = (y: number): Range => ({ from: new Date(y, 0, 1), to: y === LAST_DAY.getFullYear() ? LAST_DAY : new Date(y, 11, 31) })
const minusYear = (r: Range): Range => ({
  from: new Date(r.from.getFullYear() - 1, r.from.getMonth(), r.from.getDate()),
  to: new Date(r.to.getFullYear() - 1, r.to.getMonth(), r.to.getDate()),
})
export const compareRange = (c: Compare, r: Range) => (c.kind === 'yoy' ? minusYear(r) : c.range)

const PILL = 'glass-pill h-8.5 rounded-full px-3.5 text-body font-normal hover:bg-popover aria-expanded:bg-popover'
const CELL = 'h-8 rounded-lg text-xs font-normal'

function MonthGrid({ value, onPick }: { value: Range; onPick: (r: Range) => void }) {
  const [year, setYear] = useState(value.from.getFullYear())
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon-sm" aria-label="Năm trước" disabled={year <= FIRST_YEAR} onClick={() => setYear(year - 1)}>
          <ChevronLeft />
        </Button>
        <b className="text-sm font-semibold tabular-nums">{year}</b>
        <Button variant="ghost" size="icon-sm" aria-label="Năm sau" disabled={year >= LAST_DAY.getFullYear()} onClick={() => setYear(year + 1)}>
          <ChevronRight />
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 12 }, (_, m) => {
          const r = monthRange(year, m)
          const on = value.from.getFullYear() === year && value.from.getMonth() === m && value.to.getTime() === r.to.getTime()
          const future = r.from > LAST_DAY
          return (
            <Button key={m} variant={on ? 'default' : 'ghost'} disabled={future} aria-pressed={on} className={cn(CELL, on && 'glass-cta font-semibold')} onClick={() => onPick(r)}>
              Tháng {m + 1}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

function YearList({ value, onPick }: { value: Range; onPick: (r: Range) => void }) {
  const years = Array.from({ length: LAST_DAY.getFullYear() - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i)
  return (
    <div className="flex flex-col gap-1">
      {years.map((y) => {
        const r = yearRange(y)
        const on = value.from.getTime() === r.from.getTime() && value.to.getTime() === r.to.getTime()
        return (
          <Button key={y} variant="ghost" aria-pressed={on} className={cn(CELL, 'justify-start', on && 'bg-accent font-semibold text-accent-foreground')} onClick={() => onPick(r)}>
            {y}
            <span className="ml-auto text-2xs text-muted-foreground">{fmtRange(r)}</span>
            {on && <Check className="text-ring" />}
          </Button>
        )
      })}
    </div>
  )
}

function RangeCalendar({ value, onApply, onCancel }: { value: Range; onApply: (r: Range) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<DateRange | undefined>({ from: value.from, to: value.to })
  const ok = draft?.from && draft?.to
  return (
    <div className="flex flex-col gap-2">
      <Calendar
        mode="range"
        locale={vi}
        numberOfMonths={2}
        defaultMonth={new Date(value.to.getFullYear(), value.to.getMonth() - 1, 1)}
        selected={draft}
        onSelect={setDraft}
        disabled={{ after: LAST_DAY }}
        className="p-0"
      />
      <div className="flex items-center gap-2 border-t border-border pt-2">
        <span className="text-2xs text-muted-foreground tabular-nums">{ok ? fmtRange({ from: draft.from!, to: draft.to! }) : 'Chọn ngày bắt đầu và ngày kết thúc'}</span>
        <span className="flex-1" />
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Huỷ
        </Button>
        <Button size="sm" disabled={!ok} className="glass-cta" onClick={() => ok && onApply({ from: draft.from!, to: draft.to! })}>
          Áp dụng
        </Button>
      </div>
    </div>
  )
}

type Props = {
  period: Period
  onPeriod: (p: Period) => void
  range: Range
  onRange: (r: Range) => void
  compare: Compare
  onCompare: (c: Compare) => void
}

export function PeriodPicker({ period, onPeriod, range, onRange, compare, onCompare }: Props) {
  const [open, setOpen] = useState(false)
  const [cmpOpen, setCmpOpen] = useState(false)
  const [cmpCustom, setCmpCustom] = useState(compare.kind === 'custom')
  const pick = (r: Range) => {
    onRange(r)
    setOpen(false)
  }
  const changePeriod = (p: Period) => {
    onPeriod(p)
    // Đổi kiểu kỳ thì chọn sẵn kỳ gần nhất có số, rồi mở bảng chọn.
    if (p === 'month') onRange(monthRange(LAST_DAY.getFullYear(), LAST_DAY.getMonth()))
    if (p === 'year') onRange(yearRange(LAST_DAY.getFullYear()))
    setOpen(true)
  }
  const cmp = compareRange(compare, range)

  return (
    <>
      <SegToggle
        label="Kỳ xem"
        value={period}
        onChange={changePeriod}
        items={[
          ['month', 'Tháng'],
          ['year', 'Năm'],
          ['custom', 'Tuỳ chọn'],
        ]}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button variant="ghost" className={PILL} />}>
          <CalendarDays />
          <span className="tabular-nums" title={fmtRange(range)}>
            {shortRange(range)}
          </span>
          <ChevronDown />
        </PopoverTrigger>
        <PopoverContent align="start" className={cn('glass-pill rounded-glass-inner', period === 'custom' ? 'w-auto' : period === 'year' ? 'w-64' : 'w-80')}>
          {period === 'month' && <MonthGrid value={range} onPick={pick} />}
          {period === 'year' && <YearList value={range} onPick={pick} />}
          {period === 'custom' && <RangeCalendar value={range} onApply={pick} onCancel={() => setOpen(false)} />}
        </PopoverContent>
      </Popover>

      <Popover
        open={cmpOpen}
        onOpenChange={(o) => {
          setCmpOpen(o)
          if (o) setCmpCustom(compare.kind === 'custom')
        }}
      >
        <PopoverTrigger render={<Button variant="ghost" className={cn(PILL, 'border-ring')} />}>
          <span className="text-muted-foreground">So với</span>
          <span className="tabular-nums" title={fmtRange(cmp)}>
            {compare.kind === 'yoy' ? `Cùng kỳ · ${shortRange(cmp)}` : shortRange(cmp)}
          </span>
          <ChevronDown />
        </PopoverTrigger>
        <PopoverContent align="start" className={cn('glass-pill rounded-glass-inner', cmpCustom ? 'w-auto' : 'w-80')}>
          <div role="radiogroup" aria-label="Kỳ so sánh" className="flex flex-col gap-1">
            <Button
              variant="ghost"
              role="radio"
              aria-checked={compare.kind === 'yoy' && !cmpCustom}
              className={cn(CELL, 'h-auto justify-start py-1.5 text-left')}
              onClick={() => {
                onCompare({ kind: 'yoy' })
                setCmpOpen(false)
              }}
            >
              <span className="flex flex-col">
                <span className="font-semibold">Cùng kỳ năm trước</span>
                <span className="text-2xs text-muted-foreground tabular-nums">{fmtRange(minusYear(range))}</span>
              </span>
              {compare.kind === 'yoy' && !cmpCustom && <Check className="ml-auto text-ring" />}
            </Button>
            <Button variant="ghost" role="radio" aria-checked={cmpCustom} className={cn(CELL, 'h-auto justify-start py-1.5 text-left')} onClick={() => setCmpCustom(true)}>
              <span className="flex flex-col">
                <span className="font-semibold">Chọn kỳ so sánh khác</span>
                <span className="text-2xs text-muted-foreground">Khoảng ngày bất kỳ có số</span>
              </span>
              {cmpCustom && <Check className="ml-auto text-ring" />}
            </Button>
          </div>
          {cmpCustom && (
            <RangeCalendar
              value={cmp}
              onApply={(r) => {
                onCompare({ kind: 'custom', range: r })
                setCmpOpen(false)
              }}
              onCancel={() => setCmpOpen(false)}
            />
          )}
        </PopoverContent>
      </Popover>
    </>
  )
}
