import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import JsonLd from "@/components/json-ld"
import EventCard from "@/components/agenda/event-card"
import { RangeePerles, LoSange } from "@/components/bamileke-pattern"
import { getPastEvents, getUpcomingEvents, type EventRecord } from "@/lib/events-db"
import { monthLabel } from "@/lib/event-format"
import { pageMetadata } from "@/lib/site"
import { breadcrumbSchema, eventListSchema } from "@/lib/structured-data"
import { CalendarDays, ChevronRight, History } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = pageMetadata({
  title: "Agenda de la Ville",
  description:
    "Agenda officiel de la Ville de Bafoussam : conseils municipaux, événements culturels, journées citoyennes et rendez-vous organisés par la Communauté Urbaine.",
  path: "/agenda",
})

function groupByMonth(events: EventRecord[]): { label: string; events: EventRecord[] }[] {
  const groups: { label: string; events: EventRecord[] }[] = []
  for (const e of events) {
    const label = monthLabel(e.startDate)
    const last = groups[groups.length - 1]
    if (last?.label === label) last.events.push(e)
    else groups.push({ label, events: [e] })
  }
  return groups
}

function SectionHeading({ icon: Icon, children }: { icon: typeof CalendarDays; children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: "#1B4FA8" }}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <h2 className="text-xl font-black" style={{ color: "#0D1A2E" }}>{children}</h2>
      <div className="h-px flex-1" style={{ backgroundColor: "rgba(27,79,168,0.15)" }} />
    </div>
  )
}

export default async function AgendaPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents(30)])
  const months = groupByMonth(upcoming)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <JsonLd data={[breadcrumbSchema([{ name: "Agenda" }]), ...(upcoming.length > 0 ? [eventListSchema(upcoming)] : [])]} />

      {/* Hero */}
      <div className="relative overflow-hidden py-14" style={{ backgroundColor: "#1B4FA8" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24 2L46 24L24 46L2 24Z' fill='none' stroke='white' stroke-opacity='0.08' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: "48px 48px",
          }}
          aria-hidden="true"
        />
        <div className="absolute top-6 right-20 hidden lg:block opacity-15" aria-hidden="true">
          <LoSange size={90} fill="white" />
        </div>
        <div className="absolute bottom-2 left-16 hidden lg:block opacity-10" aria-hidden="true">
          <LoSange size={55} fill="#F5C200" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <nav
            className="flex items-center gap-2 text-xs mb-6 font-medium flex-wrap"
            aria-label="Fil d'ariane"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <Link href="/" className="hover:text-white transition-colors underline-offset-2 hover:underline">
              Accueil
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span className="font-semibold" style={{ color: "#F5C200" }}>Agenda</span>
          </nav>

          <RangeePerles count={7} color="#F5C200" size={6} gap={8} opacity={0.6} />

          <div className="mt-5 flex items-start gap-5">
            <div
              className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ring-2 ring-white/20"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <CalendarDays className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white text-balance leading-tight tracking-tight">
                Agenda de la Ville
              </h1>
              <p className="mt-2 text-sm md:text-base text-pretty max-w-xl" style={{ color: "rgba(255,255,255,0.82)" }}>
                {upcoming.length > 0
                  ? `${upcoming.length} rendez-vous à venir de la Communauté Urbaine de Bafoussam.`
                  : "Les rendez-vous de la Communauté Urbaine de Bafoussam."}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex" style={{ height: 4 }} aria-hidden="true">
          <div className="flex-1" style={{ backgroundColor: "#F5C200" }} />
          <div style={{ width: "20%", backgroundColor: "white" }} />
          <div className="flex-1" style={{ backgroundColor: "#0D2F6E" }} />
        </div>
      </div>

      <main className="flex-1 py-14" style={{ backgroundColor: "#F0F4FA" }}>
        <div className="max-w-5xl mx-auto px-6 space-y-14">
          <section>
            <SectionHeading icon={CalendarDays}>À venir</SectionHeading>
            {months.length === 0 ? (
              <p className="rounded-2xl border bg-white px-6 py-12 text-center text-sm" style={{ color: "#64748B", borderColor: "rgba(27,79,168,0.12)" }}>
                Aucun événement programmé pour le moment. Revenez bientôt !
              </p>
            ) : (
              <div className="space-y-8">
                {months.map((m) => (
                  <div key={m.label}>
                    <h3 className="mb-3 text-xs font-black uppercase tracking-[0.2em]" style={{ color: "#1B4FA8" }}>
                      {m.label}
                    </h3>
                    <div className="space-y-3">
                      {m.events.map((e) => (
                        <EventCard key={e.id} event={e} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section>
              <SectionHeading icon={History}>Événements passés</SectionHeading>
              <div className="space-y-3">
                {past.map((e) => (
                  <EventCard key={e.id} event={e} past />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
