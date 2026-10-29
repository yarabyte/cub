import Link from "next/link"
import { FileCheck, Home, Briefcase, ChevronRight, Clock, type LucideIcon } from "lucide-react"
import { SectionLabel, RangeePerles } from "./bamileke-pattern"
import HelpBanner from "./demarches/help-banner"
import { DEMARCHE_ICONS } from "./demarches/demarche-icons"
import { DEMARCHES } from "@/lib/demarches"

type Card = {
  icon: LucideIcon
  title: string
  steps: string[]
  href: string | null
  color: string
}

const comingSoon: Card[] = [
  { icon: Home, title: "Permis de Construire", steps: ["Dossier technique complet", "Instruction en 30 jours", "Publication au registre"], href: null, color: "#F5C200" },
  { icon: Briefcase, title: "Autorisation Commerciale", steps: ["Enregistrement de l'activité", "Conformité aux normes", "Patente communale"], href: null, color: "#1B4FA8" },
  { icon: FileCheck, title: "Légalisation de Documents", steps: ["Original + photocopie", "Présence obligatoire", "Service immédiat"], href: null, color: "#F5C200" },
]

const cards: Card[] = [
  ...DEMARCHES.map((d, i) => ({
    icon: DEMARCHE_ICONS[d.slug],
    title: d.title,
    steps: d.steps,
    href: `/demarches/${d.slug}`,
    color: i % 2 === 0 ? "#1B4FA8" : "#F5C200",
  })),
  ...comingSoon,
]

function CardBody({ card }: { card: Card }) {
  const Icon = card.icon
  const isGold = card.color === "#F5C200"
  const active = card.href !== null
  return (
    <>
      <div className="flex h-1.5" aria-hidden="true">
        <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 10, backgroundColor: i % 2 === 0 ? "#F5C200" : "white" }} />
        ))}
        <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
      </div>

      <div className="p-6">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform ${active ? "group-hover:scale-110" : ""}`}
            style={{
              backgroundColor: isGold ? "rgba(245,194,0,0.15)" : "rgba(27,79,168,0.10)",
              border: `1px solid ${isGold ? "rgba(245,194,0,0.3)" : "rgba(27,79,168,0.2)"}`,
            }}
          >
            <Icon className="w-5 h-5" style={{ color: card.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm mb-3" style={{ color: "#0D1A2E" }}>
              {card.title}
            </h3>
            <ol className="flex flex-col gap-1.5">
              {card.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "#64748b" }}>
                  <span
                    className="shrink-0 w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center mt-0.5 text-white"
                    style={{ backgroundColor: "#1B4FA8" }}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {active ? (
          <div
            className="flex items-center gap-1 mt-5 pt-4 text-xs font-bold transition-all group-hover:gap-2"
            style={{ borderTop: "1px solid rgba(27,79,168,0.08)", color: "#1B4FA8" }}
          >
            Voir la démarche
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 mt-5 pt-4 text-xs font-semibold"
            style={{ borderTop: "1px solid rgba(27,79,168,0.08)", color: "#94a3b8" }}
          >
            <Clock className="w-3.5 h-3.5" />
            Informations bientôt disponibles
          </div>
        )}
      </div>
    </>
  )
}

export default function DemarchesSection() {
  return (
    <section id="demarches" className="py-20" style={{ backgroundColor: "#F2F4F8" }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <SectionLabel>Guide des démarches</SectionLabel>
            <h2 className="text-3xl font-black text-balance" style={{ color: "#0D1A2E" }}>
              Démarches Administratives
            </h2>
            <p className="mt-2 max-w-lg text-pretty leading-relaxed" style={{ color: "#475569" }}>
              Retrouvez les pièces à fournir et les délais pour vos démarches d'état civil.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:block" aria-hidden="true">
              <RangeePerles count={8} color="#1B4FA8" size={7} gap={10} opacity={0.25} />
            </div>
            <Link
              href="/demarches"
              className="inline-flex items-center gap-1.5 text-sm font-bold transition-all hover:gap-2.5"
              style={{ color: "#1B4FA8" }}
            >
              Toutes les démarches
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Grille cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card) =>
            card.href ? (
              <Link
                key={card.title}
                href={card.href}
                className="group bg-white rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                style={{ borderColor: "rgba(27,79,168,0.12)" }}
              >
                <CardBody card={card} />
              </Link>
            ) : (
              <div
                key={card.title}
                className="bg-white rounded-xl border overflow-hidden opacity-80"
                style={{ borderColor: "rgba(27,79,168,0.12)" }}
              >
                <CardBody card={card} />
              </div>
            )
          )}
        </div>

        <div className="mt-10">
          <HelpBanner />
        </div>
      </div>
    </section>
  )
}
