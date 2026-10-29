import Link from "next/link"
import { ChevronRight, ClipboardList, Clock, MapPin } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageBanner from "@/components/page-banner"
import HelpBanner from "@/components/demarches/help-banner"
import { DEMARCHE_ICONS } from "@/components/demarches/demarche-icons"
import { DEMARCHES } from "@/lib/demarches"
import { pageMetadata } from "@/lib/site"
import JsonLd from "@/components/json-ld"
import { breadcrumbSchema } from "@/lib/structured-data"

export const metadata = pageMetadata({
  title: "Démarches administratives et état civil",
  description:
    "Pièces à fournir, lieux de dépôt et délais pour les actes de naissance, de mariage et de décès à la Communauté Urbaine de Bafoussam.",
  path: "/demarches",
})

export default function DemarchesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <JsonLd data={breadcrumbSchema([{ name: "Démarches administratives" }])} />

      <PageBanner
        icon={ClipboardList}
        title="Démarches pratiques et administratives"
        subtitle="Pièces à fournir, lieu de dépôt et délais pour vos démarches d'état civil à la Communauté Urbaine de Bafoussam."
        crumbs={[{ label: "Démarches" }]}
      />

      <main className="flex-1 py-14" style={{ backgroundColor: "#F2F4F8" }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col gap-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEMARCHES.map((d) => {
              const Icon = DEMARCHE_ICONS[d.slug]
              const piecesCount = d.pieces.reduce((n, g) => Math.max(n, g.items.length), 0)
              return (
                <Link
                  key={d.slug}
                  href={`/demarches/${d.slug}`}
                  className="group bg-white rounded-2xl border overflow-hidden flex flex-col transition-all hover:shadow-lg hover:-translate-y-1"
                  style={{ borderColor: "#E5ECFF" }}
                >
                  <div className="flex h-1.5" aria-hidden="true">
                    <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ width: 10, backgroundColor: i % 2 === 0 ? "#F5C200" : "white" }} />
                    ))}
                    <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
                  </div>

                  <div className="p-7 flex flex-col flex-1">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: "#EFF4FF", border: "1px solid rgba(27,79,168,0.2)" }}
                    >
                      <Icon className="w-6 h-6" style={{ color: "#1B4FA8" }} />
                    </div>
                    <h2 className="text-lg font-black mb-2" style={{ color: "#0D1A2E" }}>
                      {d.title}
                    </h2>
                    <p className="text-sm leading-relaxed mb-5 line-clamp-3" style={{ color: "#4B5563" }}>
                      {d.summary}
                    </p>

                    <ul className="flex flex-col gap-2.5 text-xs mb-6" style={{ color: "#374151" }}>
                      <li className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 shrink-0" style={{ color: "#1B4FA8" }} />
                        {d.depot.lieu}
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock className="w-4 h-4 shrink-0" style={{ color: "#1B4FA8" }} />
                        {d.depot.delai}
                      </li>
                      <li className="flex items-start gap-2">
                        <ClipboardList className="w-4 h-4 shrink-0" style={{ color: "#1B4FA8" }} />
                        {piecesCount} pièces à fournir
                      </li>
                    </ul>

                    <span
                      className="mt-auto flex items-center gap-1 pt-4 text-sm font-bold transition-all group-hover:gap-2"
                      style={{ borderTop: "1px solid #EEF2FF", color: "#1B4FA8" }}
                    >
                      Voir la démarche
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>

          <HelpBanner />
        </div>
      </main>

      <Footer />
    </div>
  )
}
