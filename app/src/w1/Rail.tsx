import { useState } from 'react'
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Droplet,
  FileText,
  Gauge,
  LayoutGrid,
  MapPin,
  Repeat,
  ShieldCheck,
  TrendingUp,
  Upload,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import hopMark from '@/assets/hop-mark.svg'

type Item = { label: string; icon: LucideIcon; current?: boolean }

// 13 mục menu theo Main.dc.html, chia nhóm bằng divider (không nhãn nhóm).
const GROUPS: Item[][] = [
  [{ label: 'Bảng điều khiển', icon: BarChart3 }],
  [
    { label: 'Kết quả báo cáo', icon: ClipboardCheck },
    { label: 'Báo cáo Định mức', icon: LayoutGrid },
    { label: 'Báo cáo BTP-TP', icon: FileText },
    { label: 'Báo cáo SL TP', icon: TrendingUp },
    { label: 'Báo cáo Nhập – Xuất – Tồn', icon: Repeat },
    { label: 'Báo cáo Chất lượng', icon: ShieldCheck },
    { label: 'Báo cáo Năng lượng (mới)', icon: Zap, current: true },
    { label: 'Báo cáo Khai thác nước & Xả thải', icon: Droplet },
  ],
  [
    { label: 'Upload', icon: Upload },
    { label: 'Số liệu điện', icon: Zap },
    { label: 'Đồng hồ điện/nước', icon: Gauge },
    { label: 'Khu vực', icon: MapPin },
  ],
]

function NavItem({ item, wide }: { item: Item; wide: boolean }) {
  const Icon = item.icon
  const btn = (
    <Button
      variant="ghost"
      aria-current={item.current ? 'page' : undefined}
      aria-label={wide ? undefined : item.label}
      className={cn(
        'h-9.5 rounded-glass-inner text-sidebar-foreground hover:bg-sidebar-accent',
        wide ? 'w-full justify-start gap-3.5 px-3' : 'w-11',
        item.current && 'glass-cta font-semibold text-cta-foreground hover:bg-transparent hover:text-cta-foreground',
      )}
    >
      <Icon />
      {wide && <span className="truncate">{item.label}</span>}
    </Button>
  )
  if (wide) return btn
  return (
    <Tooltip>
      <TooltipTrigger render={btn} />
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  )
}

function Brand({ wide }: { wide: boolean }) {
  return (
    <div className={cn('mb-3.5 flex items-center gap-2.5', wide && 'px-1.5')}>
      <img src={hopMark} alt="HABECO" className="size-9.5 shrink-0" />
      {wide && (
        <span className="flex min-w-0 flex-col">
          <b className="text-lg leading-tight font-bold tracking-wider">HABECO</b>
          <small className="text-xs whitespace-nowrap text-muted-foreground">Nhà máy bia Hoàng Hoa Thám</small>
        </span>
      )}
    </div>
  )
}

function Items({ wide }: { wide: boolean }) {
  return GROUPS.map((g, i) => (
    <div key={i} className={cn('flex flex-col gap-0.5', wide ? 'items-stretch' : 'items-center')}>
      {i > 0 && <Separator className={cn('my-2 bg-sidebar-border', wide ? 'mx-2 w-auto!' : 'w-7!')} />}
      {g.map((it) => (
        <NavItem key={it.label} item={it} wide={wide} />
      ))}
    </div>
  ))
}

export function Rail() {
  const [open, setOpen] = useState(false)
  return (
    <>
      {/* Thu gọn 64 px là mặc định; mở rộng là lớp nổi đè lên nội dung (bản 22). */}
      <nav
        aria-label="Menu chính"
        className="fixed inset-y-0 left-0 z-30 flex w-16 flex-col items-center gap-0.5 border-r border-glass-edge bg-sidebar pt-4 pb-3.5 backdrop-blur-glass-rail"
      >
        <Brand wide={false} />
        <Items wide={false} />
        <span className="flex-1" />
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" className="h-9.5 w-11 text-sidebar-foreground" aria-label="Mở rộng menu" aria-expanded={open} onClick={() => setOpen(true)} />
            }
          >
            <ChevronRight />
          </TooltipTrigger>
          <TooltipContent side="right">Mở rộng menu</TooltipContent>
        </Tooltip>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-66! max-w-none! gap-0.5 overflow-hidden border-glass-edge bg-sidebar-open px-3 pt-4.5 pb-3.5"
        >
          <img src={hopMark} alt="" aria-hidden className="pointer-events-none absolute -right-34 -bottom-14 size-95 rotate-20 opacity-5" />
          <SheetTitle className="sr-only">Menu chính</SheetTitle>
          <div className="relative flex flex-1 flex-col gap-0.5">
            <Brand wide />
            <Items wide />
            <span className="flex-1" />
            <Button variant="ghost" className="h-9.5 w-full justify-start gap-3.5 px-3 text-sidebar-foreground" onClick={() => setOpen(false)}>
              <ChevronLeft />
              Thu gọn menu
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
