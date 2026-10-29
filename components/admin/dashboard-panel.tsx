import Link from "next/link"
import { ArrowRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  subtitle?: string
  icon: LucideIcon
  link?: { href: string; label: string }
  className?: string
  children: React.ReactNode
}

export default function DashboardPanel({ title, subtitle, icon: Icon, link, className, children }: Props) {
  return (
    <section className={cn("flex flex-col overflow-hidden rounded-2xl border border-[#1B4FA8]/10 bg-white shadow-sm", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-[#1B4FA8]/8 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#1B4FA8]/8 text-[#1B4FA8]">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-[#0D1A2E]">{title}</h2>
            {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {link && (
          <Link
            href={link.href}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#1B4FA8] transition-colors hover:bg-[#1B4FA8]/5"
          >
            {link.label} <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </section>
  )
}
