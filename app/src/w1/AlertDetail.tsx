import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableFooter, TableRow } from '@/components/ui/table'
import { StatusBadge } from './Alerts'
import { SecChart } from './SecChart'
import { ALERTS, FACTORY_TOTAL, UNITS, fmt, pct, type AlertId, type Metric } from './data'

export type Focus = { metric: Metric; unit: string }

type Detail = {
  rows: [string, string][]
  note?: string
  /** Đặt bộ lọc trên Tổng quan để xem khu liên quan */
  focus?: Focus
}

const area = (id: string) => UNITS.area.find((u) => u.id === id)!
const steamMeters = UNITS.area.filter((u) => u.hoi != null && u.id !== 'cpb')
const steamSum = steamMeters.reduce((s, u) => s + (u.hoi as number), 0)
const steamGap = FACTORY_TOTAL.hoi - steamSum

// Chỉ dùng số đã có trong fixture W1; phần chưa có thì ghi rõ là chưa có.
const DETAIL: Record<AlertId, Detail> = {
  sec: {
    rows: [
      ['SEC khu sản xuất luỹ kế năm', '1.358 MJ/1.000 L'],
      ['Ngưỡng cảnh báo (90% trần)', '1.337'],
      ['Trần năm (TT 28/2024)', '1.486'],
      ['Đã dùng', '91,4% trần'],
      ['Dự báo cuối năm', '≈ 1.371'],
      ['Cùng kỳ năm trước', '1.373'],
    ],
  },
  khinen: {
    rows: [
      ['Điện khí nén tháng 9', `${fmt(area('khinen').dien as number, 0)} MWh`],
      ['So cùng kỳ', pct(area('khinen').dd as number)],
      ['So kỳ vọng theo sản lượng', '+18,2%'],
      ['Ngưỡng cảnh báo', '15%'],
      ['Mẫu số sản lượng', 'Thành phẩm 8,1 triệu L'],
    ],
    focus: { metric: 'dien', unit: 'khinen' },
  },
  hoi: {
    rows: [
      ['Đồng hồ tổng lò hơi', `${fmt(FACTORY_TOTAL.hoi, 0)} tấn`],
      ...steamMeters.map((u): [string, string] => [`  ${u.name}`, `${fmt(u.hoi as number, 0)} tấn`]),
      ['Σ 3 đồng hồ con', `${fmt(steamSum, 0)} tấn`],
    ],
    note: `Chênh ${fmt(steamGap, 0)} tấn = ${fmt((steamGap / FACTORY_TOTAL.hoi) * 100, 1)}% đồng hồ tổng, trên ngưỡng 10%. Phần này đang hiện là "Chưa phân bổ (hơi)" ở Phân bổ.`,
    focus: { metric: 'hoi', unit: 'cpb' },
  },
  nuoc: {
    rows: [
      ['Ca', 'Ca chiều 28/09/2026'],
      ['So trung bình ca', '+32%'],
    ],
    note: 'Số theo ca chưa có trong số mẫu của Tổng quan. Màn chi tiết nằm ở tab Nước.',
  },
  ghiso: {
    rows: [
      ['Số đồng hồ chưa ghi', '2 đồng hồ điện'],
      ['Hạn ghi số', '30/09/2026'],
    ],
    note: 'Tên đồng hồ chưa có trong số mẫu. Màn chi tiết nằm ở tab Điện, mục đồng hồ.',
  },
}

type Props = { id: AlertId | null; onClose: () => void; onFocus: (f: Focus) => void }

export function AlertDetail({ id, onClose, onFocus }: Props) {
  const a = ALERTS.find((x) => x.id === id)
  const d = id ? DETAIL[id] : null
  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="glass-card inset-y-2.5! right-2.5! h-auto! w-120! max-w-none! gap-0 overflow-hidden bg-background">
        {a && d && (
          <>
            <SheetHeader className="gap-2 border-b border-border px-5 py-4 pr-14">
              <span className="flex items-center gap-2">
                <StatusBadge kind={a.kind}>{a.label}</StatusBadge>
                <b className="text-sm tabular-nums">{a.value}</b>
              </span>
              <SheetTitle className="text-base font-semibold">{a.text}</SheetTitle>
              <SheetDescription className="text-2xs">Cảnh báo tháng 9/2026</SheetDescription>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
              <Table className="text-xs">
                <TableBody>
                  {d.rows.map(([k, v]) => (
                    <TableRow key={k}>
                      <TableCell className={k.startsWith('  ') ? 'pl-6 text-muted-foreground' : 'text-muted-foreground'}>{k.trim()}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{v}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {id === 'hoi' && (
                  <TableFooter className="bg-warning-subtle">
                    <TableRow>
                      <TableCell className="font-semibold text-warning-foreground">Chênh lệch</TableCell>
                      <TableCell className="text-right font-semibold text-warning-foreground tabular-nums">
                        {fmt(steamGap, 0)} tấn · {fmt((steamGap / FACTORY_TOTAL.hoi) * 100, 1)}%
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
              {d.note && <p className="text-xs text-muted-foreground">{d.note}</p>}
              {id === 'sec' && (
                <div className="flex h-64 flex-col">
                  <SecChart />
                </div>
              )}
            </div>
            {d.focus && (
              <SheetFooter className="border-t border-border px-5 py-3">
                <Button className="glass-cta self-end rounded-full" onClick={() => onFocus(d.focus!)}>
                  Xem {area(d.focus.unit).name} trên Tổng quan
                  <ArrowRight />
                </Button>
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
