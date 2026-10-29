import Link from "next/link"
import { ArrowRight, QrCode } from "lucide-react"
import { SectionLabel, RangeePerles } from "./bamileke-pattern"
import TrackingLookup from "@/components/suivi/tracking-lookup"

export default function SuiviCourrierSection() {
  return (
    <section
      id="suivi-courrier"
      className="w-full py-20 scroll-mt-20 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #E8EEF5 0%, #D6E0ED 35%, #F5F0E6 100%)",
        backgroundAttachment: "fixed",
      }}
      aria-labelledby="suivi-courrier-title"
    >
      {/* Motif discret en arrière-plan */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.18]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1.5' fill='%231B4FA8'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="max-w-7xl mx-auto px-6 relative">
        {/* En-tête */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
          <div className="max-w-xl">
            <SectionLabel>Suivi à distance de mon courrier</SectionLabel>
            <h2
              id="suivi-courrier-title"
              className="text-3xl sm:text-4xl font-black text-balance leading-tight"
              style={{ color: "#0D1A2E" }}
            >
              Où en est mon courrier ?
            </h2>
            <p className="mt-3 text-pretty leading-relaxed" style={{ color: "#475569" }}>
              Saisissez le numéro de dossier et le code de suivi imprimés sur votre accusé de réception
              pour connaître l’étape de traitement et le service en charge.
            </p>
          </div>
          <div className="hidden lg:block" aria-hidden="true">
            <RangeePerles count={8} color="#1B4FA8" size={7} gap={10} opacity={0.25} />
          </div>
        </div>

        {/* Carte principale — pleine largeur du conteneur */}
        <div
          className="w-full rounded-2xl overflow-hidden"
          style={{
            boxShadow: "0 4px 24px rgba(13, 26, 46, 0.08), 0 1px 3px rgba(0,0,0,0.04)",
            backgroundColor: "#fff",
            border: "1px solid rgba(27, 79, 168, 0.12)",
          }}
        >
          {/* Bande décorative */}
          <div className="flex h-2" aria-hidden="true">
            <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  width: 14,
                  backgroundColor: i % 2 === 0 ? "#F5C200" : "rgba(255,255,255,0.9)",
                }}
              />
            ))}
            <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
          </div>

          <div className="p-6 sm:p-8">
            <TrackingLookup />
          </div>

          <div
            className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8"
            style={{ borderColor: "rgba(27,79,168,0.1)", backgroundColor: "#F8FAFF" }}
          >
            <p className="flex items-center gap-2 text-sm" style={{ color: "#475569" }}>
              <QrCode className="h-4 w-4 shrink-0" style={{ color: "#1B4FA8" }} aria-hidden="true" />
              Astuce : scannez le QR code de votre accusé pour ouvrir directement le suivi.
            </p>
            <Link
              href="/suivi"
              className="inline-flex items-center gap-1.5 text-sm font-bold transition-all hover:gap-2.5"
              style={{ color: "#1B4FA8" }}
            >
              Page de suivi du courrier
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
