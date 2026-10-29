import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function AdminPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-[#1B4FA8]/10 bg-white/85 px-4 backdrop-blur sm:px-6">
      <SidebarTrigger className="-ml-1 text-slate-600" />
      <Separator orientation="vertical" className="h-5!" />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-bold text-[#0D1A2E]">{title}</h1>
        {subtitle && <p className="hidden truncate text-xs text-slate-500 first-letter:uppercase sm:block">{subtitle}</p>}
      </div>
      {actions}
    </header>
  )
}
