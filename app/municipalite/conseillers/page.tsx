import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { RangeePerles, LoSange } from "@/components/bamileke-pattern"
import { pageMetadata } from "@/lib/site"
import JsonLd from "@/components/json-ld"
import { breadcrumbSchema } from "@/lib/structured-data"
import { ChevronRight, Users2, Users, Landmark } from "lucide-react"

export const metadata = pageMetadata({
  title: "Les conseillers municipaux",
  description:
    "Liste des conseillers municipaux de la Communauté Urbaine de Bafoussam, Département de la Mifi, Région de l'Ouest.",
  path: "/municipalite/conseillers",
})

const conseillers = [
  "M. NGNANG Cyrille",
  "M. KENGNI KOUT Levis Dieudonné",
  "M. NDEFONKOU Daniel",
  "KAMTCHOM DJI Fleur Ville",
  "KOUONANG NJILO Samuel",
  "MAGNE Emilienne",
  "TAGUE Jean",
  "NGOMPE Elie",
  "KUATE TAGNE Antoine",
  "FOBALOU",
  "KUE NDE Didier Rostan",
  "MEFOTIE WEMBE Berthe Françoise",
  "RASSIDATOU",
  "NGANKA Pierre",
  "TIOUMAGNENG TAFAM André",
  "HAMAN MAHAMAN Sani",
  "NEMBOT Richard",
  "TATOUG NGUELEWU Blaise",
  "NDE Patience",
  "KONGNE Noëlle",
  "TAMO Jules Pythagore",
  "MEKUE Marie Odette épse SAHA",
  "TAGOUNG TCHINDA Richard",
  "FOKOU NGNINTEDEM Elie",
  "FOTSING Norbert",
  "NAOUSSI SADEU Jean Calvin",
  "FEUHTU Jean Pierre",
  "SIGHE Jean",
  "DASSI Blaise",
  "MBA Elie",
  "TAVEA Frédéric Marie",
  "NOUSSI Françoise épse MBOGNE",
  "TAMTCHAP Rosalie épse KUINANG",
]

export default function ConseillersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <JsonLd data={breadcrumbSchema([{ name: "Les conseillers municipaux" }])} />

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
            <Link href="/municipalite/executif" className="hover:text-white transition-colors underline-offset-2 hover:underline">
              La Municipalité
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span className="font-semibold" style={{ color: "#F5C200" }}>Les conseillers</span>
          </nav>

          <RangeePerles count={7} color="#F5C200" size={6} gap={8} opacity={0.6} />

          <div className="mt-5 flex items-start gap-5">
            <div
              className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ring-2 ring-white/20"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <Users2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white text-balance leading-tight tracking-tight">
                Les conseillers
              </h1>
              <p className="mt-2 text-sm md:text-base text-pretty max-w-xl" style={{ color: "rgba(255,255,255,0.82)" }}>
                Conseil de la Communauté Urbaine de Bafoussam — Mifi, Région de l'Ouest
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar La Municipalité */}
            <aside className="lg:col-span-1">
              <div
                className="sticky top-28 bg-white rounded-2xl border overflow-hidden"
                style={{ borderColor: "#E5ECFF" }}
              >
                <div className="px-5 py-4" style={{ backgroundColor: "#1B4FA8" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <RangeePerles count={3} color="#F5C200" size={5} gap={5} opacity={0.8} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-white">
                    La Municipalité
                  </p>
                </div>
                <nav aria-label="Navigation La Municipalité">
                  <ul className="divide-y" style={{ borderColor: "#F0F4FF" }}>
                    <li>
                      <Link
                        href="/municipalite/executif"
                        className="flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors hover:bg-[#F8FAFF]"
                        style={{ color: "#374151" }}
                      >
                        <Users className="w-4 h-4 shrink-0" style={{ color: "#1B4FA8" }} />
                        <span>L'exécutif</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/municipalite/conseillers"
                        className="flex items-center gap-3 px-5 py-3 text-sm font-bold transition-colors bg-blue-50"
                        style={{ color: "#1B4FA8" }}
                      >
                        <Users2 className="w-4 h-4 shrink-0" />
                        <span>Les conseillers</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/municipalite/maires-delegues"
                        className="flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors hover:bg-[#F8FAFF]"
                        style={{ color: "#374151" }}
                      >
                        <Landmark className="w-4 h-4 shrink-0" style={{ color: "#1B4FA8" }} />
                        <span>Maires et délégués</span>
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
              <div
                className="mt-6 rounded-xl border p-5"
                style={{ backgroundColor: "#EFF4FF", borderColor: "#C7D7F5" }}
              >
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#1B4FA8" }}>
                  En savoir plus
                </p>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "#4B5563" }}>
                  Présentation de la ville et organigramme de la C.U.B.
                </p>
                <Link
                  href="/presentation"
                  className="inline-flex items-center gap-2 text-sm font-bold transition-colors hover:gap-3"
                  style={{ color: "#1B4FA8" }}
                >
                  Présentation
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </aside>

            {/* Contenu */}
            <div className="lg:col-span-3">
            <div
              className="bg-white rounded-2xl border p-8 md:p-10 shadow-lg shadow-blue-950/5"
              style={{ borderColor: "rgba(27,79,168,0.12)" }}
            >
              <div className="flex items-start gap-4 mb-8 pb-6" style={{ borderBottom: "2px solid rgba(245,194,0,0.25)" }}>
                <div
                  className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#1B4FA8", color: "#F5C200" }}
                >
                  <Users2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-balance tracking-tight" style={{ color: "#0D1A2E" }}>
                    Liste des conseillers municipaux
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: "#64748b" }}>
                    {conseillers.length} conseillers — Communauté Urbaine de Bafoussam
                  </p>
                </div>
              </div>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2.5 text-[15px] leading-relaxed" style={{ color: "#0D1A2E" }}>
                {conseillers.map((name, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 py-2 px-3 -mx-3 rounded-lg transition-colors hover:bg-blue-50/80"
                    style={{ listStyle: "none" }}
                  >
                    <span
                      className="shrink-0 w-2 h-2 rounded-full"
                      style={{ backgroundColor: "#F5C200" }}
                      aria-hidden
                    />
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="mt-8 rounded-2xl border p-6 transition-all hover:shadow-md"
              style={{ backgroundColor: "#fff", borderColor: "rgba(27,79,168,0.15)", boxShadow: "0 1px 3px rgba(27,79,168,0.06)" }}
            >
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#1B4FA8" }}>
                La Municipalité
              </p>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#4B5563" }}>
                L'exécutif municipal : Maire et Adjoints au Maire.
              </p>
              <Link
                href="/municipalite/executif"
                className="inline-flex items-center gap-2 text-sm font-bold transition-all hover:gap-3 rounded-lg py-2 pr-3 -ml-1"
                style={{ color: "#1B4FA8" }}
              >
                Voir l'exécutif
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
