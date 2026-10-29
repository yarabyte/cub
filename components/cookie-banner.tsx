"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { X, Cookie, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react"
import { LoSange } from "./bamileke-pattern"
import { CONSENT_STORAGE_KEY, saveConsent, type ConsentPreferences as Preferences } from "@/lib/consent"

export default function CookieBanner() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [prefs, setPrefs] = useState<Preferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!stored) {
      // Petit délai pour laisser la page se charger
      const t = setTimeout(() => setVisible(true), 900)
      return () => clearTimeout(t)
    }
  }, [])

  const save = (p: Preferences) => {
    saveConsent(p)
    setVisible(false)
  }

  const acceptAll = () => save({ necessary: true, analytics: true, marketing: true })
  const rejectAll = () => save({ necessary: true, analytics: false, marketing: false })
  const saveCustom = () => save(prefs)

  if (!visible || pathname?.startsWith("/admin")) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Gestion des cookies"
      style={{ filter: "drop-shadow(0 -8px 32px rgba(13,26,46,0.18))" }}
    >
      {/* Bande Bamileke tricolore tout en haut */}
      <div className="flex w-full" style={{ height: 4 }} aria-hidden="true">
        <div className="flex-1" style={{ backgroundColor: "#F5C200" }} />
        <div style={{ width: "18%", backgroundColor: "#ffffff" }} />
        <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
      </div>

      <div className="bg-white">
        {/* Zone principale */}
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center">

            {/* Icône + texte */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Icône cookie encadrée */}
              <div
                className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#EFF4FF" }}
              >
                <Cookie className="w-5 h-5" style={{ color: "#1B4FA8" }} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-black text-sm" style={{ color: "#0D1A2E" }}>
                    Ce site utilise des cookies
                  </h2>
                  {/* Perles décoratives mini */}
                  <div className="hidden sm:flex items-center gap-1" aria-hidden="true">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="rounded-full"
                        style={{
                          width: 5, height: 5,
                          backgroundColor: i === 1 ? "#F5C200" : "rgba(27,79,168,0.25)",
                        }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-pretty" style={{ color: "#4B5563" }}>
                  Le portail de la Communauté Urbaine de Bafoussam utilise des cookies pour améliorer votre expérience,
                  analyser le trafic et personnaliser le contenu.{" "}
                  <Link
                    href="/cookies"
                    className="font-semibold underline underline-offset-2 transition-colors hover:no-underline"
                    style={{ color: "#1B4FA8" }}
                  >
                    En savoir plus
                  </Link>
                </p>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border transition-all"
                style={{ color: "#1B4FA8", borderColor: "#D1DCEF", backgroundColor: "#F8FAFF" }}
                aria-expanded={expanded}
              >
                Paramétrer
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={rejectAll}
                className="text-xs font-semibold px-4 py-2 rounded-lg border transition-all hover:border-gray-400"
                style={{ color: "#6B7280", borderColor: "#E5E7EB", backgroundColor: "transparent" }}
              >
                Refuser
              </button>

              <button
                onClick={acceptAll}
                className="flex items-center gap-1.5 text-xs font-black px-5 py-2 rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: "#1B4FA8", color: "white" }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Tout accepter
              </button>

              <button
                onClick={() => setVisible(false)}
                className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center transition-all hover:bg-gray-200"
                style={{ color: "#9CA3AF", backgroundColor: "#F3F4F6" }}
                aria-label="Fermer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Panneau paramétrage expandable */}
          {expanded && (
            <div
              className="mt-5 rounded-xl border p-5 grid grid-cols-1 sm:grid-cols-3 gap-4"
              style={{ borderColor: "#E5ECFF", backgroundColor: "#F8FAFF" }}
            >
              {/* Cookies nécessaires */}
              <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: "white", border: "1px solid #E5E7EB" }}>
                {/* Losange décoratif */}
                <div className="shrink-0 mt-0.5" aria-hidden="true">
                  <LoSange size={20} fill="#1B4FA8" opacity={0.15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-black" style={{ color: "#0D1A2E" }}>Nécessaires</span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#EFF4FF", color: "#1B4FA8" }}
                    >
                      Toujours actif
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: "#6B7280" }}>
                    Indispensables au fonctionnement du site (session, sécurité, préférences).
                  </p>
                </div>
              </div>

              {/* Cookies analytics */}
              <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: "white", border: "1px solid #E5E7EB" }}>
                <div className="shrink-0 mt-0.5" aria-hidden="true">
                  <LoSange size={20} fill="#F5C200" opacity={0.25} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-black" style={{ color: "#0D1A2E" }}>Analytiques</span>
                    {/* Toggle */}
                    <button
                      role="switch"
                      aria-checked={prefs.analytics}
                      onClick={() => setPrefs((p) => ({ ...p, analytics: !p.analytics }))}
                      className="relative w-9 h-5 rounded-full transition-all shrink-0"
                      style={{ backgroundColor: prefs.analytics ? "#1B4FA8" : "#D1D5DB" }}
                    >
                      <span
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all"
                        style={{ left: prefs.analytics ? "calc(100% - 18px)" : "2px" }}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: "#6B7280" }}>
                    Mesure d'audience anonymisée pour améliorer le site (Google Analytics).
                  </p>
                </div>
              </div>

              {/* Cookies marketing */}
              <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: "white", border: "1px solid #E5E7EB" }}>
                <div className="shrink-0 mt-0.5" aria-hidden="true">
                  <LoSange size={20} fill="#F5C200" opacity={0.25} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-black" style={{ color: "#0D1A2E" }}>Marketing</span>
                    <button
                      role="switch"
                      aria-checked={prefs.marketing}
                      onClick={() => setPrefs((p) => ({ ...p, marketing: !p.marketing }))}
                      className="relative w-9 h-5 rounded-full transition-all shrink-0"
                      style={{ backgroundColor: prefs.marketing ? "#1B4FA8" : "#D1D5DB" }}
                    >
                      <span
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all"
                        style={{ left: prefs.marketing ? "calc(100% - 18px)" : "2px" }}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: "#6B7280" }}>
                    Publicités et contenus personnalisés sur les réseaux partenaires.
                  </p>
                </div>
              </div>

              <div className="sm:col-span-3 flex justify-end pt-1">
                <button
                  onClick={saveCustom}
                  className="text-xs font-black px-5 py-2 rounded-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: "#F5C200", color: "#0D1A2E" }}
                >
                  Enregistrer mes préférences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
