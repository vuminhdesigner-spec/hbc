import { useEffect, useState } from 'react'
import { CalendarDays, Download, Moon, Printer, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Rail } from '../w1/Rail'
import { useTheme } from '../w1/W1'
import { RECORDS, fmt } from './data'
import { PeriodPicker, shortRange, type Period, type Range } from '../w1/PeriodPicker'
import { Overview } from './Overview'
import { GroupToggle, Tech, type GroupId } from './Tech'

const PILL = 'glass-pill h-8.5 rounded-full px-3.5 text-body font-normal hover:bg-popover'
const TAB = 'h-7.5 rounded-full px-4 text-body font-normal text-muted-foreground data-active:glass-cta data-active:font-semibold data-active:text-cta-foreground data-active:hover:text-cta-foreground dark:data-active:text-cta-foreground'

type Tab = 'overview' | 'tech'


/** Kỳ có số liệu QC trong bản mẫu (t08.json). */
const DATA_RANGE: Range = { from: new Date(2026, 7, 1), to: new Date(2026, 7, 31) }

export function Qc() {
  const [dark, toggleTheme] = useTheme()
  const [tab, setTab] = useState<Tab>('overview')
  const [group, setGroup] = useState<GroupId>('all')
  // Mũi tên ở Tổng quan: sang tab Kỹ thuật, nhóm Tất cả, cuộn tới đúng mục.
  const [target, setTarget] = useState<number | null>(null)
  const goTech = (no: number) => {
    setGroup('all')
    setTab('tech')
    setTarget(no)
  }
  useEffect(() => {
    if (tab !== 'tech' || target == null) return
    const id = requestAnimationFrame(() => {
      document.getElementById(`muc-${target}`)?.scrollIntoView({ block: 'start' })
      setTarget(null)
    })
    return () => cancelAnimationFrame(id)
  }, [tab, target])
  // Kỳ xem (BB họp 02/10 mục 2.1: chọn kỳ bất kỳ). Bản mẫu chỉ có số tháng 8/2026; kỳ khác hiện trạng thái chưa có số.
  const [period, setPeriod] = useState<Period>('month')
  const [range, setRange] = useState<Range>(DATA_RANGE)
  const hasData = range.from.getTime() === DATA_RANGE.from.getTime() && range.to.getTime() === DATA_RANGE.to.getTime()
  const themeLabel = dark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'

  return (
    <div className="relative isolate flex min-h-svh bg-linear-135 from-canvas-from to-canvas-to text-body text-foreground">
      <Rail current="Báo cáo Chất lượng" />
      <div className="ml-16 flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-4 px-6">
          <h1 className="text-base font-semibold">Báo cáo chất lượng</h1>
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
            <TabsList aria-label="Màn chất lượng" className="glass-card glass-bg h-auto! gap-1 rounded-full p-1">
              <TabsTrigger value="overview" className={TAB}>
                Tổng quan
              </TabsTrigger>
              <TabsTrigger value="tech" className={TAB}>
                Kỹ thuật
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <span className="flex-1" />
          <Button variant="ghost" className={PILL}>
            <Printer />
            In / PDF
          </Button>
          <Button className="glass-cta h-8.5 rounded-full px-3.5 text-body font-semibold hover:opacity-90">
            <Download />
            Xuất Excel
          </Button>
          <Separator orientation="vertical" className="h-5.5! data-vertical:self-center" />
          <Tooltip>
            <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label={themeLabel} onClick={toggleTheme} className="glass-pill size-8.5 rounded-full text-muted-foreground" />}>{dark ? <Sun /> : <Moon />}</TooltipTrigger>
            <TooltipContent>{themeLabel}</TooltipContent>
          </Tooltip>
          <Button variant="ghost" aria-label="Tài khoản" className={`${PILL} gap-2 pr-2.5 pl-1`}>
            <span className="grid size-6.5 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">A</span>
            Admin
          </Button>
        </header>

        <div role="toolbar" aria-label="Bộ lọc" className="flex h-13 shrink-0 items-center gap-2 px-6">
          {tab === 'tech' && (
            <>
              <GroupToggle value={group} onChange={setGroup} />
              <Separator orientation="vertical" className="h-5.5! data-vertical:self-center" />
            </>
          )}
          <PeriodPicker period={period} onPeriod={setPeriod} range={range} onRange={setRange} />
          {hasData && <span className="text-2xs text-muted-foreground tabular-nums">{fmt(RECORDS, 0)} bản ghi QC · 01/08 – 31/08/2026</span>}
        </div>

        {!hasData ? (
          <main className="px-6 pt-0.5 pb-6">
            <div className="glass-card glass-bg flex flex-col items-center gap-3 px-6 py-16 text-center">
              <CalendarDays className="size-6 text-muted-foreground" />
              <p className="text-body font-semibold">Chưa có số liệu cho {shortRange(range)}</p>
              <p className="max-w-md text-xs text-muted-foreground">Bản mẫu mới có số liệu tháng 8/2026. Kỳ khác sẽ hiện khi hệ thống nhận đủ dữ liệu QC của kỳ đó.</p>
              <Button className="glass-cta h-8.5 rounded-full px-3.5 text-body font-semibold" onClick={() => (setPeriod('month'), setRange(DATA_RANGE))}>
                Xem tháng 8/2026
              </Button>
            </div>
          </main>
        ) : tab === 'overview' ? (
          <Overview onGo={goTech} />
        ) : (
          <Tech group={group} />
        )}
      </div>
    </div>
  )
}
