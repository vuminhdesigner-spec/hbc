import { useEffect, useRef, useState } from 'react'
import { Download, Moon, Sun, Table2 } from 'lucide-react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MS } from './motion'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Alerts } from './Alerts'
import { Allocation, SegToggle, type Mode } from './Allocation'
import { DataSheet } from './DataSheet'
import { Kpis } from './Kpis'
import { MonthlyChart } from './MonthlyChart'
import { Rail } from './Rail'
import { SecChart } from './SecChart'
import { AlertDetail, type Focus } from './AlertDetail'
import { PeriodPicker, LAST_DAY, type Compare, type Period, type Range } from './PeriodPicker'
import { SERIES_COLOR, UNITS, type AlertId, type Group, type Metric } from './data'
import { Dien, MeterSheet } from '../w2/Dien'
import { TREE, type TreeNode } from '../w2/data'
import { Hoi, SteamMeterSheet } from '../w5/Hoi'
import { STEAM_TREE, type SteamNode } from '../w5/data'
import { Nuoc } from '../w3/Nuoc'
import { CanBang } from '../w3/CanBang'
import { X } from 'lucide-react'

// Nhóm sản phẩm theo file SEC 2026 (Bia hơi, Bia chai, Bia chai PET) và review 2 (lọc theo toàn bộ bia / nước tinh lọc / một loại bia).
const PRODUCTS = [
  { value: 'bia', label: 'Toàn bộ bia', group: 'bia' },
  { value: 'bia-hoi', label: 'Bia hơi', group: 'bia' },
  { value: 'bia-chai', label: 'Bia chai', group: 'bia' },
  { value: 'bia-pet', label: 'Bia chai PET', group: 'bia' },
  { value: 'nuoc', label: 'Nước tinh lọc', group: 'nuoc' },
]

type Tab = 'overview' | 'dien' | 'nuoc' | 'hoi'

const PILL = 'glass-pill h-8.5 rounded-full px-3.5 text-body font-normal hover:bg-popover'

function useTheme() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('w1-theme')
      if (saved) return saved === 'dark'
    } catch {
      /* bộ nhớ trình duyệt bị chặn */
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])
  const toggle = () =>
    setDark((d) => {
      try {
        localStorage.setItem('w1-theme', d ? 'light' : 'dark')
      } catch {
        /* bỏ qua */
      }
      return !d
    })
  return [dark, toggle] as const
}

export function W1() {
  const [dark, toggleTheme] = useTheme()
  const [period, setPeriod] = useState<Period>('month')
  const [range, setRange] = useState<Range>({
    from: new Date(2026, 8, 1),
    to: LAST_DAY,
  })
  const [compare, setCompare] = useState<Compare>({ kind: 'yoy' })
  const [alert, setAlert] = useState<AlertId | null>(null)
  const [group, setGroup] = useState<Group>('area')
  const [metric, setMetric] = useState<Metric>('dien')
  const [mode, setMode] = useState<Mode>('per')
  const [sel, setSel] = useState<string | null>(null)
  const [table, setTable] = useState(false)
  const [tab, setTab] = useState<Tab>('overview')
  const [nuocView, setNuocView] = useState<'use' | 'balance'>('use')
  const [node, setNode] = useState<TreeNode>(TREE)
  const [steamNode, setSteamNode] = useState<SteamNode>(STEAM_TREE)
  // Đặt tab lên <html> để bóng đổ (kể cả popover, drawer trong portal) theo màu của tab.
  useEffect(() => {
    document.documentElement.dataset.tab = tab
  }, [tab])
  const [product, setProduct] = useState('bia')
  // Đổi bộ lọc toàn màn: giả lập máy chủ trả số sau 0,7 s; giữ số cũ, làm mờ, rồi tô nền cảnh báo một lần.
  const [busy, setBusy] = useState(false)
  const [alertsKey, setAlertsKey] = useState(0)
  const timer = useRef(0)
  const load = (apply: () => void) => {
    apply()
    setBusy(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setBusy(false)
      setAlertsKey((k) => k + 1)
    }, MS.load)
  }
  const selected = UNITS[group].find((u) => u.id === sel) ?? null
  // Từ chi tiết cảnh báo: nhóm theo khu vực, chọn chỉ số và khu liên quan
  const goTo = (f: Focus) => {
    setGroup('area')
    setMetric(f.metric)
    setSel(f.unit)
    setAlert(null)
  }
  const themeLabel = dark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'

  return (
    <div className="relative isolate flex min-h-svh bg-linear-135 from-canvas-from to-canvas-to text-body text-foreground">
      {/* Nhuộm nền theo tab: Tổng quan giữ nền trung tính; Điện vàng, Nước xanh dương, Hơi xanh lá. Mờ chéo khi đổi tab. */}
      {(['dien', 'nuoc', 'hoi'] as const).map((t) => (
        <div
          key={t}
          aria-hidden
          className="canvas-tint pointer-events-none fixed inset-0 -z-10 transition-opacity duration-(--motion-base) ease-(--ease-standard)"
          style={
            {
              '--tint': SERIES_COLOR[t],
              opacity: tab === t ? 1 : 0,
            } as React.CSSProperties
          }
        />
      ))}
      <Rail />
      <div className="ml-16 flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-4 px-6">
          <h1 className="text-base font-semibold">Báo cáo năng lượng</h1>
          <Tabs value={tab} onValueChange={(v) => load(() => setTab(v as Tab))}>
            <TabsList aria-label="Màn năng lượng" className="glass-card glass-bg h-auto! gap-1 rounded-full p-1">
              {[
                ['overview', 'Tổng quan'],
                ['dien', 'Điện'],
                ['nuoc', 'Nước'],
                ['hoi', 'Hơi'],
              ].map(([v, l]) => (
                <TabsTrigger
                  key={v}
                  value={v}
                  className="h-7.5 rounded-full px-4 text-body font-normal text-muted-foreground data-active:glass-cta data-active:font-semibold data-active:text-cta-foreground dark:data-active:text-cta-foreground"
                >
                  {l}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <span className="flex-1" />
          {/* Tab Nước chưa có bảng số liệu (wireframe v0.3 còn tồn) */}
          {tab !== 'nuoc' && (
            <Button variant="ghost" className={PILL} aria-expanded={table} onClick={() => setTable(true)}>
              <Table2 />
              Bảng số liệu
            </Button>
          )}
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
          {tab === 'nuoc' && (
            <>
              <SegToggle
                label="Màn trong tab Nước"
                value={nuocView}
                onChange={(v) => load(() => setNuocView(v))}
                items={[
                  ['use', 'Tiêu thụ'],
                  ['balance', 'Cân bằng nước'],
                ]}
              />
              <Separator orientation="vertical" className="h-5.5! data-vertical:self-center" />
            </>
          )}
          <PeriodPicker period={period} onPeriod={setPeriod} range={range} onRange={(r) => load(() => setRange(r))} compare={compare} onCompare={(c) => load(() => setCompare(c))} />
          <Separator orientation="vertical" className="h-5.5! data-vertical:self-center" />
          {/* Tab Nước chưa có bộ lọc Sản phẩm (wireframe v0.3 còn tồn) */}
          {tab !== 'nuoc' && (
            <>
              <Select items={PRODUCTS} value={product} onValueChange={(v) => v && load(() => setProduct(v as string))}>
                <SelectTrigger aria-label="Sản phẩm" className={`${PILL} border-glass-edge data-[size=default]:h-8.5 dark:bg-popover`}>
                  <span className="text-muted-foreground">Sản phẩm</span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} align="start" className="glass-pill w-auto min-w-56 rounded-glass-inner">
                  <SelectGroup>
                    <SelectLabel>Bia</SelectLabel>
                    {PRODUCTS.filter((p) => p.group === 'bia').map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Nước</SelectLabel>
                    {PRODUCTS.filter((p) => p.group === 'nuoc').map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Separator orientation="vertical" className="h-5.5! data-vertical:self-center" />
            </>
          )}
          {/* Hơi chỉ có đồng hồ theo công đoạn nên tab Hơi không có công tắc nhóm; Cân bằng nước là cây đồng hồ, cũng không nhóm */}
          {tab !== 'hoi' && !(tab === 'nuoc' && nuocView === 'balance') && (
            <SegToggle
              label="Nhóm theo"
              value={group}
              onChange={(g) =>
                load(() => {
                  setGroup(g)
                  setSel(null)
                })
              }
              items={[
                ['area', 'Khu vực'],
                ['stage', 'Công đoạn'],
              ]}
            />
          )}
          {tab === 'hoi' && steamNode.id !== STEAM_TREE.id && (
            <Button size="sm" variant="outline" onClick={() => load(() => setSteamNode(STEAM_TREE))} className="ml-auto rounded-full border-ring bg-accent font-semibold text-accent-foreground">
              Nút cây: {steamNode.name} <X />
            </Button>
          )}
          {tab === 'dien' && node.id !== TREE.id && (
            <Button size="sm" variant="outline" onClick={() => load(() => setNode(TREE))} className="ml-auto rounded-full border-ring bg-accent font-semibold text-accent-foreground">
              Nút cây: {node.name} <X />
            </Button>
          )}
        </div>

        {/* Cảnh báo, KPI cao cố định; Phân bổ luôn hiện đủ hàng; đồ thị nhận phần còn lại, tối thiểu 240 px.
            Màn đủ cao (từ khoảng 1440×900) thì vừa một màn; màn thấp hơn thì cuộn cả trang (người dùng chọn 19/10). */}
        <div aria-hidden className="relative mx-6 h-0.5 shrink-0 overflow-hidden rounded-full">
          {busy && <i className="progress-slide absolute inset-y-0 w-2/5 rounded-full bg-ring" />}
        </div>
        {tab !== 'overview' ? (
          <div
            aria-busy={busy}
            className="flex min-h-0 flex-1 flex-col transition-opacity duration-(--motion-fast) ease-(--ease-standard)"
            style={{
              opacity: busy ? 0.5 : 1,
              transitionDelay: busy ? 'var(--motion-fast)' : '0ms',
            }}
          >
            {tab === 'nuoc' ? (
              nuocView === 'use' ? (
                <Nuoc group={group} mode={mode} onMode={setMode} />
              ) : (
                <CanBang />
              )
            ) : tab === 'dien' ? (
              <Dien group={group} mode={mode} onMode={setMode} node={node.id} onNode={(n) => load(() => setNode(n))} />
            ) : (
              <Hoi mode={mode} onMode={setMode} node={steamNode.id} onNode={(n) => load(() => setSteamNode(n))} />
            )}
          </div>
        ) : (
          <main
            aria-busy={busy}
            className="grid min-h-0 flex-1 grid-rows-[--spacing(14.5)_--spacing(32.5)_minmax(--spacing(60),1fr)_auto] gap-3 px-6 pt-0.5 pb-4 transition-opacity duration-(--motion-fast) ease-(--ease-standard)"
            style={{
              opacity: busy ? 0.5 : 1,
              transitionDelay: busy ? 'var(--motion-fast)' : '0ms',
            }}
          >
            <Alerts key={alertsKey} onOpen={setAlert} />
            <Kpis onOpen={(t) => load(() => setTab(t))} />
            <section aria-label="Đồ thị" className="grid min-h-0 grid-cols-4 gap-3">
              <MonthlyChart metric={metric} onMetric={setMetric} selected={selected} onClear={() => setSel(null)} />
              <SecChart />
            </section>
            <Allocation group={group} mode={mode} onMode={setMode} selected={sel} onSelect={setSel} />
          </main>
        )}
      </div>
      <DataSheet open={table && tab === 'overview'} onOpenChange={setTable} group={group} />
      <MeterSheet open={table && tab === 'dien'} onOpenChange={setTable} />
      <SteamMeterSheet open={table && tab === 'hoi'} onOpenChange={setTable} />
      <AlertDetail id={alert} onClose={() => setAlert(null)} onFocus={goTo} />
    </div>
  )
}
