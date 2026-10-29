import Image from "next/image"
import Link from "next/link"
import { MapPin, ArrowRight, Clock, CalendarDays } from "lucide-react"
import { dateBadge, formatEventTime } from "@/lib/event-format"
import type { EventRecord } from "@/lib/events-db"

const CATEGORY_STYLE = { backgroundColor: "rgba(255,255,255,0.18)", color: "#ffffff" }

function ChevronRight({ className, color = "#ffffff" }: { className?: string; color?: string }) {
  return (
    <svg className={className} fill="none" stroke={color} strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  )
}

function FeaturedEvent({ event }: { event: EventRecord }) {
  const badge = dateBadge(event.startDate)
  return (
    <Link
      href={`/agenda/${event.slug}`}
      className="group block relative rounded-2xl overflow-hidden h-full"
      style={{ minHeight: 420, backgroundColor: "#1B4FA8" }}
    >
      {event.imageUrl ? (
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          sizes="(min-width: 1024px) 400px, 100vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24 2L46 24L24 46L2 24Z' fill='none' stroke='%23F5C200' stroke-opacity='0.25' stroke-width='1'/%3E%3Cpath d='M24 16L32 24L24 32L16 24Z' fill='white' fill-opacity='0.06'/%3E%3C/svg%3E")`,
            backgroundSize: "48px 48px",
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(11,43,107,0.97) 0%, rgba(11,43,107,0.40) 55%, transparent 100%)" }}
      />

      {/* Badge date — fond sombre, texte jaune */}
      <div
        className="absolute top-4 left-4 rounded-xl px-4 py-2.5 text-center shadow-xl"
        style={{ backgroundColor: "#0B2B6B", border: "2px solid #F5C200" }}
      >
        <p className="text-2xl font-black leading-none" style={{ color: "#ffffff" }}>{badge.day}</p>
        <p className="text-[10px] font-black uppercase tracking-wider mt-0.5" style={{ color: "#ffffff" }}>
          {badge.month}
        </p>
      </div>

      {/* Motif losange décoratif coin supérieur droit */}
      <div className="absolute top-3 right-3 opacity-30" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path d="M20 2L38 20L20 38L2 20Z" fill="none" stroke="white" strokeWidth="1" />
          <path d="M20 10L30 20L20 30L10 20Z" fill="white" fillOpacity="0.3" />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5">
        {/* Bande Bamileke décorative */}
        <div className="flex h-1.5 mb-3 rounded-full overflow-hidden" aria-hidden="true">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex-1" style={{ backgroundColor: i % 3 === 0 ? "#F5C200" : i % 3 === 1 ? "#ffffff" : "#1B4FA8" }} />
          ))}
        </div>

        {event.category && (
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded" style={CATEGORY_STYLE}>
            {event.category}
          </span>
        )}

        <h3 className="font-black text-lg mt-2 leading-snug text-balance transition-colors group-hover:text-yellow-200" style={{ color: "#ffffff" }}>
          {event.title}
        </h3>
        <div className="flex flex-col gap-1.5 mt-3">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: "#F5C200" }}>
            <Clock className="w-3 h-3" style={{ color: "#F5C200" }} />
            {formatEventTime(event)}
          </span>
          {event.location && (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: "#F5C200" }}>
              <MapPin className="w-3 h-3" style={{ color: "#F5C200" }} />
              {event.location}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function EventRow({ event }: { event: EventRecord }) {
  const badge = dateBadge(event.startDate)
  return (
    <Link
      href={`/agenda/${event.slug}`}
      className="group flex gap-5 rounded-xl border p-5 transition-all hover:bg-yellow-500/10 hover:border-yellow-400/40"
      style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.10)" }}
    >
      {/* Bloc date avec losange Bamileke en fond */}
      <div className="shrink-0 w-14 text-center relative">
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <svg width="44" height="44" viewBox="0 0 44 44">
            <path d="M22 2L42 22L22 42L2 22Z" fill="none" stroke="#F5C200" strokeWidth="1" strokeOpacity="0.22" />
            <path d="M22 10L34 22L22 34L10 22Z" fill="#F5C200" fillOpacity="0.07" />
          </svg>
        </div>
        <p className="text-2xl font-black leading-none relative" style={{ color: "#ffffff" }}>{badge.day}</p>
        <p className="text-xs font-bold uppercase tracking-wide relative" style={{ color: "#ffffff" }}>{badge.month}</p>
        <p className="text-[10px] relative" style={{ color: "rgba(255,255,255,0.7)" }}>{badge.year}</p>
      </div>

      {/* Séparateur perles or / blanc */}
      <div className="flex flex-col justify-center gap-1.5 shrink-0" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: i === 2 ? 5 : 4,
              height: i === 2 ? 5 : 4,
              backgroundColor: i === 2 ? "#F5C200" : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        {event.category && (
          <div className="mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded" style={CATEGORY_STYLE}>
              {event.category}
            </span>
          </div>
        )}
        <h3 className="font-bold text-sm text-balance leading-snug transition-colors group-hover:text-yellow-200" style={{ color: "#ffffff" }}>
          {event.title}
        </h3>
        <div className="flex flex-wrap items-center gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: "#F5C200" }}>
            <Clock className="w-3 h-3" style={{ color: "#F5C200" }} />
            {formatEventTime(event)}
          </span>
          {event.location && (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: "#F5C200" }}>
              <MapPin className="w-3 h-3" style={{ color: "#F5C200" }} />
              {event.location}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="shrink-0 w-4 h-4 self-center transition-transform group-hover:translate-x-1" color="#ffffff" />
    </Link>
  )
}

export default function AgendaSection({ featured, rest }: { featured: EventRecord | null; rest: EventRecord[] }) {
  return (
    <section id="agenda" className="py-0 relative overflow-hidden" style={{ backgroundColor: "#0B2B6B" }}>

      {/* Motif de fond : grille de losanges pointillés inspirée du tissu Bamileke */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="bamileke-grid" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
              <path d="M32 6L58 32L32 58L6 32Z" fill="none" stroke="#F5C200" strokeWidth="0.6" strokeOpacity="0.12" />
              <circle cx="32" cy="6"  r="1.5" fill="#F5C200" fillOpacity="0.10" />
              <circle cx="58" cy="32" r="1.5" fill="#F5C200" fillOpacity="0.10" />
              <circle cx="32" cy="58" r="1.5" fill="#F5C200" fillOpacity="0.10" />
              <circle cx="6"  cy="32" r="1.5" fill="#F5C200" fillOpacity="0.10" />
              <path d="M32 26L38 32L32 38L26 32Z" fill="#ffffff" fillOpacity="0.04" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bamileke-grid)" />
        </svg>
      </div>

      {/* Séparateur haut — bande tricolore horizontale */}
      <div className="relative flex w-full" style={{ height: 6 }} aria-hidden="true">
        <div className="flex-1" style={{ backgroundColor: "#F5C200" }} />
        <div style={{ width: "30%", backgroundColor: "#ffffff" }} />
        <div style={{ width: "20%", backgroundColor: "#1B4FA8" }} />
      </div>

      <div className="relative py-20">
        <div className="max-w-7xl mx-auto px-6">

          {/* Header */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4" aria-hidden="true">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full shrink-0"
                    style={{
                      width: i % 2 === 0 ? 8 : 5,
                      height: i % 2 === 0 ? 8 : 5,
                      backgroundColor: i % 2 === 0 ? "#F5C200" : "rgba(255,255,255,0.4)",
                    }}
                  />
                ))}
                <div className="h-px flex-1" style={{ backgroundColor: "rgba(245,194,0,0.25)" }} />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.22em] mb-2" style={{ color: "#ffffff" }}>
                Planning municipal
              </p>
              <h2 className="text-3xl font-black text-balance" style={{ color: "#F5C200" }}>
                Agenda de la Ville
              </h2>
            </div>
            <Link
              href="/agenda"
              className="hidden sm:flex items-center gap-2 text-sm font-bold border rounded-lg px-4 py-2 transition-all hover:gap-3"
              style={{ color: "#ffffff", borderColor: "rgba(255,255,255,0.5)" }}
            >
              Voir tout l&apos;agenda
              <ArrowRight className="w-4 h-4" style={{ color: "#ffffff" }} />
            </Link>
          </div>

          {featured ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <FeaturedEvent event={featured} />
              </div>
              <div className="lg:col-span-2 flex flex-col gap-3">
                {rest.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
                {rest.length === 0 && (
                  <p className="rounded-xl border p-5 text-sm" style={{ color: "rgba(255,255,255,0.75)", borderColor: "rgba(255,255,255,0.10)" }}>
                    D&apos;autres rendez-vous seront bientôt annoncés.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center gap-4 rounded-2xl border px-6 py-14 text-center"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.10)" }}
            >
              <CalendarDays className="w-8 h-8" style={{ color: "#F5C200" }} />
              <p className="font-bold" style={{ color: "#ffffff" }}>Aucun événement programmé pour le moment.</p>
              <Link href="/agenda" className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: "#F5C200" }}>
                Consulter l&apos;agenda
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          <div className="flex justify-center mt-8 sm:hidden">
            <Link href="/agenda" className="flex items-center gap-2 text-sm font-bold" style={{ color: "#ffffff" }}>
              Voir tout l&apos;agenda
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Séparateur bas — bande tricolore inversée */}
      <div className="relative flex w-full" style={{ height: 6 }} aria-hidden="true">
        <div style={{ width: "20%", backgroundColor: "#1B4FA8" }} />
        <div style={{ width: "30%", backgroundColor: "#ffffff" }} />
        <div className="flex-1" style={{ backgroundColor: "#F5C200" }} />
      </div>
    </section>
  )
}
