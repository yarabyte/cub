import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Clock, MapPin } from "lucide-react"
import { dateBadge, formatEventDate, formatEventTime } from "@/lib/event-format"
import type { EventRecord } from "@/lib/events-db"

/** Event row of the /agenda page. */
export default function EventCard({ event, past = false }: { event: EventRecord; past?: boolean }) {
  const badge = dateBadge(event.startDate)
  const multiDay = event.endDate && event.endDate !== event.startDate
  return (
    <Link
      href={`/agenda/${event.slug}`}
      className="group flex gap-4 sm:gap-5 rounded-2xl border bg-white p-4 sm:p-5 transition-all hover:border-[#1B4FA8]/40 hover:shadow-lg hover:shadow-blue-950/5"
      style={{ borderColor: "rgba(27,79,168,0.12)", opacity: past ? 0.85 : 1 }}
    >
      <div
        className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl py-2 text-center"
        style={{ backgroundColor: past ? "#F1F5F9" : "#0B2B6B", border: past ? "1px solid #E2E8F0" : "2px solid #F5C200" }}
      >
        <span className="text-2xl font-black leading-none" style={{ color: past ? "#475569" : "#ffffff" }}>{badge.day}</span>
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: past ? "#64748B" : "#F5C200" }}>
          {badge.month}
        </span>
        <span className="text-[10px]" style={{ color: past ? "#94A3B8" : "rgba(255,255,255,0.7)" }}>{badge.year}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          {event.category && (
            <span className="rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-widest" style={{ backgroundColor: "#EFF4FF", color: "#1B4FA8" }}>
              {event.category}
            </span>
          )}
          {multiDay && (
            <span className="text-[11px] font-semibold" style={{ color: "#64748B" }}>
              {formatEventDate(event)}
            </span>
          )}
        </div>
        <h3 className="font-bold leading-snug text-balance transition-colors group-hover:text-[#1B4FA8]" style={{ color: "#0D1A2E" }}>
          {event.title}
        </h3>
        {event.summary && (
          <p className="mt-1 line-clamp-2 text-sm" style={{ color: "#64748B" }}>
            {event.summary}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: "#1B4FA8" }}>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {formatEventTime(event)}
          </span>
          {event.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              {event.location}
            </span>
          )}
        </div>
      </div>

      {event.imageUrl && (
        <div className="relative hidden h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:block">
          <Image src={event.imageUrl} alt="" fill sizes="112px" className="object-cover" />
        </div>
      )}
      <ChevronRight className="h-4 w-4 shrink-0 self-center transition-transform group-hover:translate-x-1" style={{ color: "#1B4FA8" }} />
    </Link>
  )
}
