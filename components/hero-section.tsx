"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MapPin, ChevronDown } from "lucide-react"

export type Announcement = { id: number; slug: string; title: string }

const stats = [
  { value: "537\u00a0000", label: "Habitants (2023)" },
  { value: "413\u00a0km²", label: "Superficie" },
  { value: "3",       label: "Communes d'arrondissement" },
  { value: "1925",    label: "Créée en" },
]

export default function HeroSection({ announcements }: { announcements: Announcement[] }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (announcements.length < 2) return
    const t = setInterval(() => setCurrent((p) => (p + 1) % announcements.length), 4200)
    return () => clearInterval(t)
  }, [announcements.length])

  const active = announcements[current] ?? announcements[0]

  return (
    <section className="relative flex flex-col" aria-label="Bienvenue">

      {/* ── Ticker d'annonces — bleu royal ── */}
      {active && (
      <div style={{ backgroundColor: "#1B4FA8" }}>
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-4">
          <span
            className="shrink-0 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded"
            style={{ backgroundColor: "#F5C200", color: "#0D1A2E" }}
          >
            Annonce
          </span>
          {/* Perle décorative */}
          <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-white opacity-40" aria-hidden="true" />
          <div className="overflow-hidden flex-1 min-w-0">
            <Link
              key={active.id}
              href={`/actualites/${active.slug}`}
              className="block text-sm font-semibold text-white animate-fadeup truncate hover:underline underline-offset-2"
            >
              {active.title}
            </Link>
          </div>
          {/* Indicateurs */}
          <div className={announcements.length > 1 ? "hidden sm:flex items-center gap-1" : "hidden"}>
            {announcements.map((a, i) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setCurrent(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === current ? 16 : 6,
                  height: 6,
                  backgroundColor: i === current ? "#F5C200" : "rgba(255,255,255,0.3)",
                }}
                aria-label={`Annonce ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      )}

      {/* ── Image principale ── */}
      <div className="relative" style={{ minHeight: "86vh" }}>
        <Image
          src="/images/hero-bafoussam.png"
          alt="Hôtel de Ville de Bafoussam — La Mairie, City Council"
          fill
          priority
          className="object-cover"
        />

        {/* Overlay noir dégradé */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(115deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.12) 100%)" }}
        />

        {/* ── Motif Bamileke — rangées de points côté droit ── */}
        <div
          className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none hidden lg:block"
          aria-hidden="true"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='3' fill='%23F5C200' fill-opacity='0.22'/%3E%3C/svg%3E")`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* ── Contenu ── */}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-8 lg:px-14 w-full">
            <div className="max-w-[620px]">

              {/* Badge localisation */}
              <div className="flex items-center gap-2 mb-6">
                <span
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border backdrop-blur-sm text-white"
                  style={{ backgroundColor: "rgba(27,79,168,0.35)", borderColor: "rgba(245,194,0,0.5)" }}
                >
                  <MapPin className="w-3 h-3" style={{ color: "#F5C200" }} />
                  Cameroun · Région de l'Ouest
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-black text-white leading-[1.07] text-balance mb-5">
                Bienvenue à{" "}
                <span style={{ color: "#F5C200" }}>Bafoussam</span>
              </h1>

              {/* Ligne décorative losanges Bamileke */}
              <div className="flex items-center gap-1.5 mb-6" aria-hidden="true">
                {[0,1,2,3,4,5,6,7].map((i) => (
                  <svg key={i} width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M5 0L10 5L5 10L0 5Z" fill={i % 3 === 0 ? "#F5C200" : i % 3 === 1 ? "white" : "#3B6FCA"} fillOpacity={i % 2 === 0 ? 1 : 0.5} />
                  </svg>
                ))}
              </div>

              <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-xl text-pretty">
                Le portail officiel de la Communauté Urbaine. Retrouvez toutes les actualités,
                services citoyens et démarches administratives en un seul endroit.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/demarches"
                  className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-lg transition-all hover:gap-3 hover:opacity-90"
                  style={{ backgroundColor: "#F5C200", color: "#0D1A2E" }}
                >
                  Démarches en ligne
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none">
          <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>Défiler</span>
          <ChevronDown className="w-4 h-4 animate-bounce" style={{ color: "#F5C200" }} />
        </div>
      </div>

      {/* ── Barre de stats — fond dégradé bleu royal ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(120deg, #1B4FA8 0%, #0D2F6E 50%, #0D1A2E 100%)",
          backgroundAttachment: "scroll",
        }}
      >
        {/* Motif discret */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='16' cy='16' r='1' fill='%23F5C200'/%3E%3C/svg%3E")`,
            backgroundSize: "32px 32px",
          }}
        />
        {/* Bande tricolore top */}
        <div className="relative flex h-1.5 w-full z-10" aria-hidden="true">
          <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
          {[0,1,2,3,4,5].map((i) => (
            <div key={i} style={{ width: 12, backgroundColor: i % 2 === 0 ? "#F5C200" : "white" }} />
          ))}
          <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {stats.map((stat, i) => (
              <div key={stat.label} className="py-6 px-6 text-center group">
                <p className="text-3xl font-black leading-none transition-colors group-hover:text-yellow-300" style={{ color: "#F5C200" }}>
                  {stat.value}
                </p>
                {/* Mini rangée de perles déco */}
                <div className="flex justify-center gap-1 my-1.5" aria-hidden="true">
                  {[0,1,2].map((j) => (
                    <div key={j} className="rounded-full" style={{ width: 4, height: 4, backgroundColor: j === 1 ? "white" : "#3B6FCA", opacity: 0.6 }} />
                  ))}
                </div>
                <p className="text-[11px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
