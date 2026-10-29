import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { RangeePerles, LoSange } from "@/components/bamileke-pattern"
import { pageMetadata } from "@/lib/site"
import JsonLd from "@/components/json-ld"
import { breadcrumbSchema } from "@/lib/structured-data"
import { ChevronRight, Network, Building2 } from "lucide-react"

export const metadata = pageMetadata({
  title: "Organigramme de la Communauté Urbaine",
  description:
    "Structure organisationnelle de la Communauté Urbaine de Bafoussam (C.U.B.) : Délégué du Gouvernement, Maire, exécutif et services. Mifi, Région de l'Ouest, Cameroun.",
  path: "/organigramme",
})

const structure = [
  {
    level: "Délégation du Gouvernement",
    items: [
      { title: "Délégué du Gouvernement", subtitle: "Représentation de l'État auprès de la C.U.B." },
    ],
  },
  {
    level: "Exécutif municipal",
    items: [
      { title: "Maire de la Ville", subtitle: "Roger TAFAM" },
      { title: "1er Adjoint au Maire", subtitle: "Jean Paul NEGOU" },
      { title: "2e Adjoint au Maire", subtitle: "TEWE NDIE Cédric" },
    ],
  },
  {
    level: "Secrétariat et directions",
    items: [
      { title: "Secrétariat Général", subtitle: "Coordination administrative" },
      { title: "Direction des Affaires Techniques", subtitle: "Voirie, travaux, équipements" },
      { title: "Direction des Finances et du Budget", subtitle: "Comptabilité, recettes, dépenses" },
      { title: "Direction de l'État Civil", subtitle: "Actes, certificats, légalisations" },
      { title: "Direction de l'Urbanisme et de l'Habitat", subtitle: "Permis de construire, planification" },
      { title: "Direction des Affaires Sociales et Culturelles", subtitle: "Action sociale, culture, éducation" },
      { title: "Direction de l'Environnement et de la Propreté", subtitle: "Salubrité, déchets, cadre de vie" },
    ],
  },
]

function OrgCard({ title, subtitle, isHighlight = false }: { title: string; subtitle?: string; isHighlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 text-center transition-all hover:shadow-md ${isHighlight ? "ring-2 ring-[#F5C200]" : ""}`}
      style={{
        backgroundColor: isHighlight ? "#1B4FA8" : "white",
        borderColor: isHighlight ? "#1B4FA8" : "rgba(27,79,168,0.15)",
        color: isHighlight ? "white" : "#0D1A2E",
      }}
    >
      <p className="font-bold text-sm">{title}</p>
      {subtitle && (
        <p className="mt-1 text-xs opacity-90" style={{ color: isHighlight ? "rgba(255,255,255,0.9)" : "#64748b" }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default function OrganigrammePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <JsonLd data={breadcrumbSchema([{ name: "Organigramme" }])} />

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
            <Link href="/presentation" className="hover:text-white transition-colors underline-offset-2 hover:underline">
              La Ville
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span className="font-semibold" style={{ color: "#F5C200" }}>Organigramme</span>
          </nav>

          <RangeePerles count={7} color="#F5C200" size={6} gap={8} opacity={0.6} />

          <div className="mt-5 flex items-start gap-5">
            <div
              className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ring-2 ring-white/20"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <Network className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white text-balance leading-tight tracking-tight">
                Organigramme de la Communauté Urbaine de Bafoussam
              </h1>
              <p className="mt-2 text-sm md:text-base text-pretty max-w-xl" style={{ color: "rgba(255,255,255,0.82)" }}>
                Structure organisationnelle — Délégation du Gouvernement, exécutif municipal et services
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
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div
              className="bg-white rounded-2xl border p-8 md:p-10 shadow-lg shadow-blue-950/5"
              style={{ borderColor: "rgba(27,79,168,0.12)" }}
            >
              <div className="flex items-start gap-4 mb-8 pb-6" style={{ borderBottom: "2px solid rgba(245,194,0,0.25)" }}>
                <div
                  className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#1B4FA8", color: "#F5C200" }}
                >
                  <Network className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-balance tracking-tight" style={{ color: "#0D1A2E" }}>
                    Structure de la C.U.B.
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: "#64748b" }}>
                    Hiérarchie et organisation des services
                  </p>
                </div>
              </div>

              <div className="space-y-10">
                {structure.map((block, blockIndex) => (
                  <div key={blockIndex}>
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="w-4 h-4" style={{ color: "#1B4FA8" }} />
                      <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: "#1B4FA8" }}>
                        {block.level}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {block.items.map((item, i) => (
                        <OrgCard
                          key={i}
                          title={item.title}
                          subtitle={item.subtitle}
                          isHighlight={blockIndex === 1 && i === 0}
                        />
                      ))}
                    </div>
                    {blockIndex < structure.length - 1 && (
                      <div className="flex justify-center py-2" aria-hidden="true">
                        <div className="w-px h-4" style={{ backgroundColor: "rgba(27,79,168,0.25)" }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="mt-8 rounded-2xl border p-6 transition-all hover:shadow-md"
              style={{ backgroundColor: "#fff", borderColor: "rgba(27,79,168,0.15)", boxShadow: "0 1px 3px rgba(27,79,168,0.06)" }}
            >
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#1B4FA8" }}>
                En savoir plus
              </p>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#4B5563" }}>
                L'exécutif en détail, les conseillers et l'historique des maires.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/municipalite/executif"
                  className="inline-flex items-center gap-2 text-sm font-bold transition-all hover:gap-3 rounded-lg py-2 pr-3 -ml-1"
                  style={{ color: "#1B4FA8" }}
                >
                  L'exécutif
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/municipalite/conseillers"
                  className="inline-flex items-center gap-2 text-sm font-bold transition-all hover:gap-3 rounded-lg py-2 pr-3"
                  style={{ color: "#1B4FA8" }}
                >
                  Les conseillers
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/presentation"
                  className="inline-flex items-center gap-2 text-sm font-bold transition-all hover:gap-3 rounded-lg py-2 pr-3"
                  style={{ color: "#1B4FA8" }}
                >
                  Présentation de la ville
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
