import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ChevronDown, ChevronRight, Clock, FileDown, Info, MapPin, Wallet } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageBanner from "@/components/page-banner"
import HelpBanner from "@/components/demarches/help-banner"
import { DEMARCHE_ICONS } from "@/components/demarches/demarche-icons"
import { DEMARCHES, getDemarche } from "@/lib/demarches"
import { absoluteUrl, pageMetadata } from "@/lib/site"
import ShareButtons from "@/components/share-buttons"
import JsonLd from "@/components/json-ld"
import { breadcrumbSchema, faqSchema, governmentServiceSchema } from "@/lib/structured-data"

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return DEMARCHES.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const demarche = getDemarche((await params).slug)
  if (!demarche) return {}
  return pageMetadata({
    title: `${demarche.title} à Bafoussam : pièces à fournir et délais`,
    description: demarche.summary,
    path: `/demarches/${demarche.slug}`,
    image: {
      url: `/demarches/${demarche.slug}/opengraph-image`,
      width: 1200,
      height: 630,
      alt: `${demarche.title} — démarche à la Communauté Urbaine de Bafoussam`,
    },
  })
}

function SectionTitle({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <div className="mb-5">
      <h2 id={id} className="text-lg font-black" style={{ color: "#0D1A2E" }}>
        {children}
      </h2>
      <div className="flex items-center gap-1 mt-1.5" aria-hidden="true">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#F5C200" }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#1B4FA8" }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#F5C200" }} />
      </div>
    </div>
  )
}

export default async function DemarchePage({ params }: Props) {
  const demarche = getDemarche((await params).slug)
  if (!demarche) notFound()

  const Icon = DEMARCHE_ICONS[demarche.slug]
  const others = DEMARCHES.filter((d) => d.slug !== demarche.slug)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <JsonLd
        data={[
          governmentServiceSchema(demarche),
          faqSchema(demarche.faq, `/demarches/${demarche.slug}`),
          breadcrumbSchema([{ name: "Démarches", path: "/demarches" }, { name: demarche.title }]),
        ]}
      />

      <PageBanner
        icon={Icon}
        title={demarche.title}
        subtitle={demarche.summary}
        crumbs={[{ label: "Démarches", href: "/demarches" }, { label: demarche.title }]}
      />

      <main className="flex-1 py-14" style={{ backgroundColor: "#F2F4F8" }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: MapPin, label: "Où déposer", value: demarche.depot.lieu },
                { icon: Clock, label: "Délai", value: demarche.depot.delai },
              ].map(({ icon: ItemIcon, label, value }) => (
                <div key={label} className="bg-white rounded-2xl border p-5 flex items-start gap-4" style={{ borderColor: "#E5ECFF" }}>
                  <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EFF4FF" }}>
                    <ItemIcon className="w-5 h-5" style={{ color: "#1B4FA8" }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#1B4FA8" }}>
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-snug" style={{ color: "#0D1A2E" }}>
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <section className="bg-white rounded-2xl border p-8" style={{ borderColor: "#E5ECFF" }}>
              <SectionTitle>Pièces à fournir</SectionTitle>
              <div className="flex flex-col gap-7">
                {demarche.pieces.map((group, gi) => (
                  <div key={gi}>
                    {group.heading && (
                      <h3 className="text-sm font-bold mb-3" style={{ color: "#0D2F6E" }}>
                        {group.heading}
                      </h3>
                    )}
                    <ol className="flex flex-col gap-3">
                      {group.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: "#374151" }}>
                          <span
                            className="shrink-0 w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center text-white"
                            style={{ backgroundColor: "#1B4FA8" }}
                          >
                            {i + 1}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </section>

            {demarche.notes && (
              <section
                className="rounded-2xl border p-6 flex items-start gap-4"
                style={{ backgroundColor: "rgba(245,194,0,0.12)", borderColor: "rgba(245,194,0,0.45)" }}
              >
                <Info className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#7A5900" }} />
                <div className="flex flex-col gap-2 text-sm leading-relaxed" style={{ color: "#4A3B00" }}>
                  <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#7A5900" }}>
                    À noter
                  </p>
                  {demarche.notes.map((n, i) => (
                    <p key={i}>{n}</p>
                  ))}
                </div>
              </section>
            )}

            {demarche.frais && (
              <section className="bg-white rounded-2xl border p-6 flex items-start gap-4" style={{ borderColor: "#E5ECFF" }}>
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(245,194,0,0.18)" }}>
                  <Wallet className="w-5 h-5" style={{ color: "#7A5900" }} />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#1B4FA8" }}>
                    Frais
                  </p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: "#0D1A2E" }}>
                    {demarche.frais}
                  </p>
                </div>
              </section>
            )}

            <section className="bg-white rounded-2xl border p-8" style={{ borderColor: "#E5ECFF" }} aria-labelledby="faq-title">
              <SectionTitle id="faq-title">Questions fréquentes</SectionTitle>
              <div className="flex flex-col divide-y divide-[#E5ECFF]">
                {demarche.faq.map(({ q, a }, i) => (
                  <details key={q} className="group py-4 first:pt-0 last:pb-0" open={i === 0}>
                    <summary className="flex items-start justify-between gap-4 cursor-pointer list-none text-sm font-bold leading-snug [&::-webkit-details-marker]:hidden" style={{ color: "#0D2F6E" }}>
                      <span>{q}</span>
                      <ChevronDown className="w-4 h-4 shrink-0 mt-0.5 transition-transform group-open:rotate-180" style={{ color: "#1B4FA8" }} />
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: "#374151" }}>
                      {a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-6">
            <section className="bg-white rounded-2xl border p-5" style={{ borderColor: "#E5ECFF" }}>
              <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: "#1B4FA8" }}>
                Partager cette démarche
              </p>
              <ShareButtons url={absoluteUrl(`/demarches/${demarche.slug}`)} title={`${demarche.title} à Bafoussam : pièces à fournir et délais`} />
            </section>

            {demarche.documents && (
              <section className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#E5ECFF" }}>
                <div className="px-5 py-4" style={{ backgroundColor: "#1B4FA8" }}>
                  <p className="text-xs font-black uppercase tracking-widest text-white">Documents à télécharger</p>
                </div>
                <ul className="divide-y" style={{ borderColor: "#F0F4FF" }}>
                  {demarche.documents.map((doc) => (
                    <li key={doc.href}>
                      <a
                        href={doc.href}
                        download
                        className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-[#F8FAFF] group"
                      >
                        <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(245,194,0,0.18)" }}>
                          <FileDown className="w-5 h-5" style={{ color: "#7A5900" }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold group-hover:underline" style={{ color: "#0D1A2E" }}>
                            {doc.label}
                          </p>
                          <p className="text-xs" style={{ color: "#64748b" }}>
                            {doc.size}
                          </p>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#E5ECFF" }}>
              <div className="px-5 py-4" style={{ backgroundColor: "#0D2F6E" }}>
                <p className="text-xs font-black uppercase tracking-widest text-white">Autres démarches</p>
              </div>
              <ul className="divide-y" style={{ borderColor: "#F0F4FF" }}>
                {others.map((d) => {
                  const OtherIcon = DEMARCHE_ICONS[d.slug]
                  return (
                    <li key={d.slug}>
                      <Link
                        href={`/demarches/${d.slug}`}
                        className="flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors hover:bg-[#F8FAFF]"
                        style={{ color: "#374151" }}
                      >
                        <OtherIcon className="w-4 h-4 shrink-0" style={{ color: "#1B4FA8" }} />
                        <span className="flex-1">{d.title}</span>
                        <ChevronRight className="w-4 h-4" style={{ color: "#94a3b8" }} />
                      </Link>
                    </li>
                  )
                })}
                <li>
                  <Link
                    href="/demarches"
                    className="flex items-center gap-2 px-5 py-3.5 text-sm font-bold transition-colors hover:bg-[#F8FAFF]"
                    style={{ color: "#1B4FA8" }}
                  >
                    Toutes les démarches
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </li>
              </ul>
            </section>

            <HelpBanner stacked />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}
