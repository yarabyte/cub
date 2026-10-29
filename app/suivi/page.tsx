import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { RangeePerles, LoSange } from "@/components/bamileke-pattern"
import TrackingLookup from "@/components/suivi/tracking-lookup"
import { pageMetadata } from "@/lib/site"
import JsonLd from "@/components/json-ld"
import { breadcrumbSchema } from "@/lib/structured-data"
import { ChevronRight, FileText, KeyRound, Lock, Mail, PackageSearch, QrCode, type LucideIcon } from "lucide-react"

export const metadata = pageMetadata({
  title: "Suivre mon courrier",
  description:
    "Suivez en ligne l'avancement d'un courrier déposé à la Communauté Urbaine de Bafoussam grâce au numéro de dossier et au code de suivi de votre accusé de réception.",
  path: "/suivi",
})

const HELP: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: FileText,
    title: "Numéro de dossier",
    text: "Imprimé sur votre accusé de réception, sous la forme ARR-2026-00042.",
  },
  {
    icon: KeyRound,
    title: "Code de suivi",
    text: "8 caractères (ex. K7MP-Q3XA) dans l’encadré de l’accusé, ou dans le message WhatsApp ou email reçu.",
  },
  {
    icon: QrCode,
    title: "QR code",
    text: "Scannez-le avec votre téléphone : le suivi s’ouvre directement, sans rien saisir.",
  },
  {
    icon: Lock,
    title: "Courriers confidentiels",
    text: "Ils ne sont pas consultables en ligne et n’ont pas de code de suivi.",
  },
]

export default function SuiviPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <JsonLd data={breadcrumbSchema([{ name: "Suivre mon courrier" }])} />

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
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            <span style={{ color: "#F5C200" }} aria-current="page">
              Suivre mon courrier
            </span>
          </nav>

          <RangeePerles count={7} color="#F5C200" size={6} gap={8} opacity={0.6} />

          <div className="mt-4 flex items-start gap-5">
            <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
              <PackageSearch className="w-7 h-7 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white text-balance leading-tight">Suivre mon courrier</h1>
              <p className="mt-2 text-sm text-pretty" style={{ color: "rgba(255,255,255,0.7)" }}>
                Étape de traitement, service en charge et historique de votre courrier déposé à la C.U.B.
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 min-w-0">
              <div className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: "rgba(27,79,168,0.12)" }}>
                <div className="flex h-1.5" aria-hidden="true">
                  <div className="flex-1 bg-[#1B4FA8]" />
                  <div className="w-16 bg-[#F5C200]" />
                </div>
                <div className="p-6 sm:p-8">
                  <TrackingLookup readFromUrl />
                </div>
              </div>
            </div>

            <aside className="flex flex-col gap-6">
              <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "#E5ECFF" }}>
                <div className="px-5 py-4" style={{ backgroundColor: "#1B4FA8" }}>
                  <div className="mb-1 flex items-center gap-2">
                    <RangeePerles count={3} color="#F5C200" size={5} gap={5} opacity={0.8} />
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-widest text-white">Où trouver mes informations ?</h2>
                </div>
                <ul className="divide-y" style={{ borderColor: "#F0F4FF" }}>
                  {HELP.map(({ icon: Icon, title, text }) => (
                    <li key={title} className="flex gap-3 px-5 py-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(27,79,168,0.08)" }}>
                        <Icon className="h-4.5 w-4.5" style={{ color: "#1B4FA8" }} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#0D1A2E" }}>
                          {title}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "#64748b" }}>
                          {text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border p-5" style={{ backgroundColor: "#EFF4FF", borderColor: "#C7D7F5" }}>
                <p className="mb-2 text-xs font-black uppercase tracking-widest" style={{ color: "#1B4FA8" }}>
                  Code perdu ?
                </p>
                <p className="mb-4 text-sm leading-relaxed" style={{ color: "#4B5563" }}>
                  Le service courrier peut générer un nouveau code et vous remettre un nouvel accusé de réception.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-sm font-bold transition-all hover:gap-3"
                  style={{ color: "#1B4FA8" }}
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Contacter la mairie
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
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
