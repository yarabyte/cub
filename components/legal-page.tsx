import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ChevronRight } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import JsonLd from "@/components/json-ld"
import { LoSange, RangeePerles } from "@/components/bamileke-pattern"
import { breadcrumbSchema } from "@/lib/structured-data"

export type LegalSection = { id: string; icon: LucideIcon; title: string; content: string }

type LegalPageProps = {
  title: string
  icon: LucideIcon
  updated: string
  intro: React.ReactNode
  sections: LegalSection[]
  /** Extra block at the bottom of the summary sidebar. */
  asideFooter?: React.ReactNode
  /** Extra content after the sections. */
  children?: React.ReactNode
}

export default function LegalPage({ title, icon: TitleIcon, updated, intro, sections, asideFooter, children }: LegalPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <JsonLd data={breadcrumbSchema([{ name: title }])} />

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
          <nav className="flex items-center gap-2 text-xs mb-6 font-medium" aria-label="Fil d'ariane" style={{ color: "rgba(255,255,255,0.55)" }}>
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span style={{ color: "#F5C200" }}>{title}</span>
          </nav>

          <RangeePerles count={7} color="#F5C200" size={6} gap={8} opacity={0.6} />

          <div className="mt-4 flex items-start gap-5">
            <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
              <TitleIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white text-balance leading-tight">{title}</h1>
              <p className="mt-2 text-sm text-pretty" style={{ color: "rgba(255,255,255,0.7)" }}>
                Portail officiel de la Communauté Urbaine de Bafoussam — Dernière mise à jour : {updated}
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

      <main className="flex-1 py-14" style={{ backgroundColor: "#F2F4F8" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <div className="sticky top-28 bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#E5ECFF" }}>
                <div className="px-5 py-4" style={{ backgroundColor: "#1B4FA8" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <RangeePerles count={3} color="#F5C200" size={5} gap={5} opacity={0.8} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-white">Sommaire</p>
                </div>
                <nav aria-label="Sommaire de la page">
                  <ul className="divide-y divide-[#F0F4FF]">
                    {sections.map(({ id, icon: Icon, title: sectionTitle }) => (
                      <li key={id}>
                        <a
                          href={`#${id}`}
                          className="flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors group"
                          style={{ color: "#374151" }}
                        >
                          <Icon className="w-4 h-4 shrink-0 transition-colors group-hover:text-blue-700" style={{ color: "#1B4FA8" }} />
                          <span className="leading-tight">{sectionTitle}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
                {asideFooter && (
                  <div className="p-5 border-t" style={{ borderColor: "#E5ECFF", backgroundColor: "#F8FAFF" }}>
                    {asideFooter}
                  </div>
                )}
              </div>
            </aside>

            <div className="lg:col-span-3 flex flex-col gap-6">
              <div className="bg-white rounded-2xl border p-8" style={{ borderColor: "#E5ECFF" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-1 w-12 rounded-full overflow-hidden shrink-0" aria-hidden="true">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex-1" style={{ backgroundColor: i % 2 === 0 ? "#F5C200" : "#1B4FA8" }} />
                    ))}
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#1B4FA8" }}>
                    Introduction
                  </p>
                </div>
                <div className="flex flex-col gap-3 text-sm leading-relaxed text-pretty" style={{ color: "#374151" }}>
                  {intro}
                </div>
              </div>

              {sections.map(({ id, icon: Icon, title: sectionTitle, content }) => (
                <section key={id} id={id} className="bg-white rounded-2xl border p-8 scroll-mt-32" style={{ borderColor: "#E5ECFF" }}>
                  <div className="flex items-start gap-4 mb-5 pb-5" style={{ borderBottom: "1px solid #EEF2FF" }}>
                    <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EFF4FF" }}>
                      <Icon className="w-5 h-5" style={{ color: "#1B4FA8" }} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-balance" style={{ color: "#0D1A2E" }}>
                        {sectionTitle}
                      </h2>
                      <div className="flex items-center gap-1 mt-1.5" aria-hidden="true">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#F5C200" }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#1B4FA8" }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#F5C200" }} />
                        <div className="h-px w-10" style={{ backgroundColor: "#E5ECFF" }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#4B5563" }}>
                    {content}
                  </div>
                </section>
              ))}

              {children}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

/** Highlighted contact block shown at the bottom of legal pages. */
export function LegalContact({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-8" style={{ backgroundColor: "#EFF4FF", borderColor: "#C7D7F5" }}>
      <h2 className="text-base font-black mb-2" style={{ color: "#0D1A2E" }}>
        {title}
      </h2>
      <div className="text-sm leading-relaxed text-pretty" style={{ color: "#4B5563" }}>
        {children}
      </div>
    </div>
  )
}
