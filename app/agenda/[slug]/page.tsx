import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cache } from "react"
import type { Metadata } from "next"
import { CalendarDays, ChevronRight, Clock, History, MapPin, Tag } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import JsonLd from "@/components/json-ld"
import ShareButtons from "@/components/share-buttons"
import { BandeBamileke, RangeePerles, SectionLabel } from "@/components/bamileke-pattern"
import { getPublishedEventBySlug, getUpcomingEvents } from "@/lib/events-db"
import {
  dateBadge,
  eventDescription,
  formatEventDate,
  formatEventTime,
  isPastEvent,
  todayInBafoussam,
} from "@/lib/event-format"
import { sanitizeArticleHtml } from "@/lib/sanitize-article-html"
import { absoluteUrl, SITE } from "@/lib/site"
import { breadcrumbSchema, eventSchema } from "@/lib/structured-data"

export const dynamic = "force-dynamic"

const loadEvent = cache((slug: string) => getPublishedEventBySlug(slug).catch(() => null))

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const event = await loadEvent(slug)
  if (!event) return { title: "Événement introuvable", robots: { index: false } }
  const description = eventDescription(event) || `${formatEventDate(event)} — ${event.location || SITE.address.locality}`
  const path = `/agenda/${event.slug}`
  return {
    title: event.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title: event.title,
      description,
      siteName: SITE.name,
      locale: SITE.locale,
    },
    twitter: { card: "summary_large_image", title: event.title, description },
  }
}

function InfoRow({ icon: Icon, label, children }: { icon: typeof Clock; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "#EFF4FF" }}>
        <Icon className="h-4 w-4" style={{ color: "#1B4FA8" }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>{label}</p>
        <p className="text-sm font-semibold" style={{ color: "#0D1A2E" }}>{children}</p>
      </div>
    </div>
  )
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await loadEvent(slug)
  if (!event) notFound()

  const today = todayInBafoussam()
  const past = isPastEvent(event, today)
  const badge = dateBadge(event.startDate)
  const description = eventDescription(event)
  const others = (await getUpcomingEvents(6)).filter((e) => e.id !== event.id).slice(0, 4)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FAFF" }}>
      <Navbar />
      <JsonLd
        data={[
          eventSchema(event, description),
          breadcrumbSchema([{ name: "Agenda", path: "/agenda" }, { name: event.title }]),
        ]}
      />

      <div style={{ backgroundColor: "white", borderBottom: "1px solid rgba(27,79,168,0.10)" }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
          <Link href="/" className="hover:underline font-medium" style={{ color: "#1B4FA8" }}>Accueil</Link>
          <span>/</span>
          <Link href="/agenda" className="hover:underline">Agenda</Link>
          <span>/</span>
          <span className="line-clamp-1" style={{ color: "#0D1A2E" }}>{event.title}</span>
        </div>
      </div>

      <div
        className={`relative w-full overflow-hidden ${event.imageUrl ? "h-[420px] md:h-[520px]" : "h-[320px] md:h-[360px]"}`}
        style={{ backgroundColor: "#0B2B6B" }}
      >
        {event.imageUrl && (
          <Image src={event.imageUrl} alt={event.title} fill className="object-cover" priority sizes="100vw" />
        )}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(13,26,46,0.95) 0%, rgba(13,26,46,0.50) 50%, rgba(13,26,46,0.20) 100%)" }}
        />
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="event-losange" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M32 6L58 32L32 58L6 32Z" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.08" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#event-losange)" />
          </svg>
        </div>
        <div className="absolute top-0 left-0 right-0 flex h-2" aria-hidden="true">
          <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ width: 10, backgroundColor: i % 2 === 0 ? "#F5C200" : "white" }} />
          ))}
          <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 max-w-5xl mx-auto px-6 pb-10 flex items-end gap-5">
          <div
            className="hidden sm:flex w-20 shrink-0 flex-col items-center justify-center rounded-2xl py-3 text-center"
            style={{ backgroundColor: "#0B2B6B", border: "2px solid #F5C200" }}
          >
            <span className="text-3xl font-black leading-none text-white">{badge.day}</span>
            <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#F5C200" }}>{badge.month}</span>
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>{badge.year}</span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2 mb-3">
              {event.category && (
                <span className="rounded px-2.5 py-1 text-[10px] font-black uppercase tracking-widest" style={{ backgroundColor: "#F5C200", color: "#0B2B6B" }}>
                  {event.category}
                </span>
              )}
              {past && (
                <span className="flex items-center gap-1 rounded px-2.5 py-1 text-[10px] font-black uppercase tracking-widest" style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white" }}>
                  <History className="h-3 w-3" />
                  Événement passé
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white text-balance leading-tight">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-5 mt-4 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" style={{ color: "#F5C200" }} />
                <time dateTime={event.startDate}>{formatEventDate(event)}</time>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" style={{ color: "#F5C200" }} />
                {formatEventTime(event)}
              </span>
              {event.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" style={{ color: "#F5C200" }} />
                  {event.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <article className="lg:col-span-2 min-w-0">
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 px-5 py-3 rounded-xl border"
                style={{ backgroundColor: "white", borderColor: "rgba(27,79,168,0.12)" }}
              >
                <div className="flex items-center gap-2 shrink-0">
                  <RangeePerles count={4} color="#F5C200" size={5} gap={6} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Partager</span>
                </div>
                <ShareButtons url={absoluteUrl(`/agenda/${event.slug}`)} title={event.title} />
              </div>

              <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(27,79,168,0.12)" }}>
                <BandeBamileke className="h-1.5" />
                <div className="p-6 sm:p-8">
                  {event.summary && (
                    <p
                      className="text-base leading-relaxed font-semibold mb-6"
                      style={{ color: "#0D1A2E", borderLeft: "3px solid #1B4FA8", paddingLeft: "1rem" }}
                    >
                      {event.summary}
                    </p>
                  )}
                  {event.content ? (
                    <div
                      className="article-content text-base leading-relaxed break-words"
                      style={{ color: "#374151" }}
                      dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(event.content) }}
                    />
                  ) : (
                    !event.summary && (
                      <p className="text-sm" style={{ color: "#64748b" }}>
                        Plus d&apos;informations seront communiquées prochainement.
                      </p>
                    )
                  )}
                </div>
                <div className="flex h-1.5" aria-hidden="true">
                  <div style={{ width: "20%", backgroundColor: "#F5C200" }} />
                  <div style={{ width: "10%", backgroundColor: "white" }} />
                  <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
                </div>
              </div>
            </article>

            <aside className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: "rgba(27,79,168,0.12)" }}>
                <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: "#1B4FA8" }}>Informations pratiques</h2>
                <InfoRow icon={CalendarDays} label="Date">{formatEventDate(event)}</InfoRow>
                <InfoRow icon={Clock} label="Horaire">{formatEventTime(event)}</InfoRow>
                <InfoRow icon={MapPin} label="Lieu">{event.location || SITE.address.locality}</InfoRow>
                {event.category && <InfoRow icon={Tag} label="Catégorie">{event.category}</InfoRow>}
              </div>

              {others.length > 0 && (
                <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(27,79,168,0.12)" }}>
                  <div className="px-5 py-3.5" style={{ backgroundColor: "#1B4FA8" }}>
                    <h2 className="text-xs font-black uppercase tracking-widest text-white">Prochains rendez-vous</h2>
                  </div>
                  <ul className="p-2">
                    {others.map((e) => {
                      const b = dateBadge(e.startDate)
                      return (
                        <li key={e.id}>
                          <Link href={`/agenda/${e.slug}`} className="group flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-blue-50">
                            <div className="flex w-11 shrink-0 flex-col items-center rounded-lg py-1.5" style={{ backgroundColor: "#0B2B6B" }}>
                              <span className="text-base font-black leading-none text-white">{b.day}</span>
                              <span className="text-[9px] font-black uppercase" style={{ color: "#F5C200" }}>{b.month}</span>
                            </div>
                            <p className="flex-1 text-xs font-semibold leading-snug line-clamp-2 group-hover:text-[#1B4FA8]" style={{ color: "#0D1A2E" }}>
                              {e.title}
                            </p>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                  <BandeBamileke className="h-1.5" />
                </div>
              )}

              <div className="rounded-2xl border overflow-hidden p-5" style={{ backgroundColor: "#0B2B6B", borderColor: "rgba(245,194,0,0.20)" }}>
                <SectionLabel><span style={{ color: "#F5C200" }}>Agenda de la Ville</span></SectionLabel>
                <p className="text-xs leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.70)" }}>
                  Retrouvez tous les rendez-vous de la Communauté Urbaine de Bafoussam.
                </p>
                <Link
                  href="/agenda"
                  className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-3 rounded-xl transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#F5C200", color: "#0B2B6B" }}
                >
                  Voir tout l&apos;agenda
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
