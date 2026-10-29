import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { LoSange, SectionLabel } from "./bamileke-pattern"
import { MAYOR_EXCERPT_PARAGRAPHS, mayorFullName, type MayorMessage } from "@/lib/mayor-message-schema"

export default function MaireSection({ message }: { message: MayorMessage }) {
  const fullName = mayorFullName(message)
  return (
    <section id="maire" className="py-20 overflow-hidden" style={{ backgroundColor: "white" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Photo avec cadre Bamileke ── */}
          <div className="relative lg:order-2 max-w-sm w-full mx-auto lg:mr-0">
            {/* Décalage de fond bleu */}
            <div
              className="absolute -top-4 -left-4 lg:left-auto lg:-right-4 w-full h-full rounded-2xl z-0"
              style={{ backgroundColor: "#1B4FA8", opacity: 0.10 }}
              aria-hidden="true"
            />
            {/* Colonne de perles verticale droite */}
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 flex-col gap-1.5 hidden lg:flex" aria-hidden="true">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full shrink-0"
                  style={{ width: 7, height: 7, backgroundColor: i % 2 === 0 ? "#F5C200" : "#1B4FA8" }}
                />
              ))}
            </div>

            {/* Photo */}
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl w-full" style={{ aspectRatio: "3/4" }}>
              <Image src={message.photo} alt={`${fullName} — ${message.role}`} fill sizes="(min-width: 1024px) 384px, 100vw" className="object-cover" />
              {/* Overlay bas — bleu nuit */}
              <div
                className="absolute bottom-0 left-0 right-0 p-5"
                style={{ background: "linear-gradient(to top, rgba(13,26,46,0.95) 0%, rgba(13,26,46,0.5) 60%, transparent 100%)" }}
              >
                {/* Perles décoratives */}
                <div className="flex items-center gap-1.5 mb-2" aria-hidden="true">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-full" style={{ width: 6, height: 6, backgroundColor: i % 2 === 0 ? "#F5C200" : "rgba(255,255,255,0.5)" }} />
                  ))}
                </div>
                <p className="text-white font-black text-xl leading-tight">{message.name}</p>
                <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: "#F5C200" }}>
                  {message.role}
                </p>
              </div>
            </div>

            {/* Bande Bamileke bas photo */}
            <div className="relative z-10 flex h-2 w-full overflow-hidden rounded-b" aria-hidden="true">
              <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
              {[0,1,2,3,4,5,6].map((i) => (
                <div key={i} style={{ width: 9, backgroundColor: i % 2 === 0 ? "#F5C200" : "white" }} />
              ))}
              <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
            </div>
          </div>

          {/* ── Texte ── */}
          <div>
            <SectionLabel>Mot du Maire</SectionLabel>
            <h2 className="text-3xl font-black mb-6 text-balance" style={{ color: "#0D1A2E" }}>
              {message.title}
              {message.titleHighlight && (
                <>
                  {" "}
                  <span style={{ color: "#1B4FA8" }}>{message.titleHighlight}</span>
                </>
              )}
            </h2>

            {/* Citation avec accent or */}
            <div className="relative pl-6 mb-6 py-1" style={{ borderLeft: "4px solid #F5C200" }}>
              {/* Grand guillemet décoratif */}
              <div
                className="absolute -top-2 -left-1 text-6xl font-black leading-none select-none"
                style={{ color: "#F5C200", opacity: 0.3 }}
                aria-hidden="true"
              >
                &ldquo;
              </div>
              <p className="text-lg font-bold italic leading-relaxed" style={{ color: "#0D1A2E" }}>
                {message.quote}
              </p>
            </div>

            <div className="space-y-4 mb-7">
              {message.paragraphs.slice(0, MAYOR_EXCERPT_PARAGRAPHS).map((p, i) => (
                <p key={i} className="leading-relaxed text-pretty whitespace-pre-line" style={{ color: "#475569" }}>
                  {p}
                </p>
              ))}
            </div>

            {/* Losanges décoratifs */}
            <div className="flex items-center gap-2 mb-8" aria-hidden="true">
              {[12, 9, 16, 9, 12].map((size, i) => (
                <LoSange key={i} size={size} fill={i % 2 === 0 ? "#1B4FA8" : "#F5C200"} opacity={i === 2 ? 1 : 0.55} />
              ))}
            </div>

            {/* Signature */}
            <div className="flex items-center gap-4 pt-5 mb-6" style={{ borderTop: "1px solid rgba(27,79,168,0.12)" }}>
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 ring-2 ring-[#F5C200]">
                <Image src={message.photo} alt={message.name} width={48} height={48} className="object-cover w-full h-full" />
              </div>
              <div>
                <p className="font-black" style={{ color: "#0D1A2E" }}>{message.name}</p>
                <p className="text-sm" style={{ color: "#1B4FA8" }}>
                  Maire{message.mandate && <> · Mandat {message.mandate}</>}
                </p>
              </div>
            </div>

            <Link
              href="/mot-du-maire"
              className="inline-flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-lg transition-all hover:gap-3 hover:opacity-90"
              style={{ backgroundColor: "#1B4FA8", color: "white" }}
            >
              Lire le message complet
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
