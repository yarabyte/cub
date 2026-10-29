import Link from "next/link"
import { ArrowUpRight, type LucideIcon } from "lucide-react"

export type StatItem = {
  label: string
  value: string
  hint: string
  href: string
  icon: LucideIcon
  /** Main colour of the card: icon background, top bar and hover border. */
  color: string
  /** Highlights the card, e.g. when unread messages are waiting. */
  alert?: boolean
}

export default function StatsCards({ items }: { items: StatItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((s) => (
        <Link
          key={s.label}
          href={s.href}
          className="group relative overflow-hidden rounded-2xl border border-[#1B4FA8]/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ ["--accent" as string]: s.color }}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-[var(--accent)] opacity-80" aria-hidden="true" />
          <div className="flex items-start justify-between gap-3">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-xl text-[var(--accent)]"
              style={{ backgroundColor: `color-mix(in srgb, ${s.color} 12%, transparent)` }}
            >
              <s.icon className="size-5" />
            </div>
            {s.alert ? (
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-[var(--accent)]" />
              </span>
            ) : (
              <ArrowUpRight className="size-4 text-slate-300 transition-colors group-hover:text-[var(--accent)]" />
            )}
          </div>
          <p className="mt-4 text-3xl font-black leading-none tracking-tight text-[#0D1A2E]">{s.value}</p>
          <p className="mt-1.5 text-sm font-semibold text-slate-600">{s.label}</p>
          <p className="mt-0.5 truncate text-xs text-slate-400">{s.hint}</p>
        </Link>
      ))}
    </div>
  )
}
