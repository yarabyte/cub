"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Youtube, Instagram, ArrowRight } from "lucide-react"
import { LoSange, RangeePerles } from "./bamileke-pattern"
import { DEMARCHES } from "@/lib/demarches"

const footerLinks = {
  "La Municipalité": [
    { label: "L'exécutif", href: "/municipalite/executif" },
    { label: "Les conseillers", href: "/municipalite/conseillers" },
    { label: "Maires et délégués", href: "/municipalite/maires-delegues" },
  ],
  "La Ville": [
    { label: "Présentation", href: "#" },
    { label: "Mot du Maire", href: "/mot-du-maire" },
    { label: "Conseil Municipal", href: "#" },
    { label: "Organigramme", href: "/organigramme" },
    { label: "Agenda", href: "/agenda" },
    { label: "Médiathèque", href: "/mediatheque" },
    { label: "Histoire", href: "#" },
  ],
  Démarches: [
    ...DEMARCHES.map((d) => ({ label: d.title, href: `/demarches/${d.slug}` })),
    { label: "Certificat de résidence", href: "#" },
    { label: "Permis de construire", href: "#" },
    { label: "Légalisation", href: "#" },
    { label: "Autorisation commerciale", href: "#" },
  ],
}

export default function Footer() {
  return (
    <>
      {/* ── CTA Banner — fond bleu royal avec motif perles ── */}
      <section className="relative overflow-hidden py-16" style={{ backgroundColor: "#1B4FA8" }}>
        {/* Motif losanges en filigrane */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24 2L46 24L24 46L2 24Z' fill='none' stroke='white' stroke-opacity='0.07' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: "48px 48px",
          }}
          aria-hidden="true"
        />
        {/* Losanges décoratifs */}
        <div className="absolute top-4 right-16 hidden lg:block opacity-20" aria-hidden="true">
          <LoSange size={70} fill="#F5C200" />
        </div>
        <div className="absolute bottom-4 left-20 hidden lg:block opacity-10" aria-hidden="true">
          <LoSange size={45} fill="white" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          {/* Rangée de perles */}
          <div className="flex justify-center mb-4">
            <RangeePerles count={9} color="#F5C200" size={6} gap={8} opacity={0.65} />
          </div>
          <h2 className="text-3xl font-black text-white text-balance mb-3">
            Vos droits, nos services — en ligne
          </h2>
          <p className="max-w-xl mx-auto mb-8 leading-relaxed text-pretty" style={{ color: "rgba(255,255,255,0.72)" }}>
            Effectuez vos démarches administratives depuis chez vous, sans file d'attente.
            Le portail numérique de Bafoussam est ouvert 24h/24.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/demarches"
              className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-lg transition-all hover:gap-3 hover:opacity-90"
              style={{ backgroundColor: "#F5C200", color: "#0D1A2E" }}
            >
              Accéder aux démarches
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg border-2 transition-all hover:bg-white/10"
              style={{ borderColor: "rgba(255,255,255,0.5)", color: "white" }}
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer principal — bleu nuit ── */}
      <footer className="pattern-dark text-white/65" id="contact">

        {/* Bande Bamileke */}
        <div className="flex h-2 w-full" aria-hidden="true">
          <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} style={{ width: 8, backgroundColor: i % 2 === 0 ? "#F5C200" : "white" }} />
          ))}
          <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-14"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* Colonne marque */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <Link href="/" className="shrink-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
                    style={{
                      backgroundColor: "white",
                      boxShadow: "0 0 0 2px rgba(245,194,0,0.35)",
                    }}
                  >
                    <Image
                      src="/images/logo-cub.png"
                      alt="Logo Communauté Urbaine de Bafoussam"
                      width={44}
                      height={44}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                </Link>
                <div>
                  <span className="font-black text-lg text-white leading-tight tracking-tight">BAFOUSSAM</span>
                  <p className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: "#F5C200" }}>Portail Officiel</p>
                </div>
              </div>

              {/* Perles décoratives */}
              <div className="flex items-center gap-1.5 mb-5" aria-hidden="true">
                {[0,1,2,3,4,5,6,7].map((i) => (
                  <div key={i} className="rounded-full" style={{ width: 6, height: 6, backgroundColor: i % 3 === 0 ? "#F5C200" : i % 3 === 1 ? "#3B6FCA" : "rgba(255,255,255,0.2)" }} />
                ))}
              </div>

              <p className="text-sm leading-relaxed mb-6 text-pretty">
                Le portail officiel de la Communauté Urbaine de Bafoussam.
                Tous les services, actualités et démarches administratives en ligne.
              </p>

              <ul className="flex flex-col gap-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#F5C200" }} />
                  <span>Rue Poya, Bafoussam — Région de l'Ouest, Cameroun</span>
                </li>
                <li className="flex items-center gap-2.5 flex-wrap">
                  <span className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 shrink-0" style={{ color: "#F5C200" }} />
                    <a href="tel:+237233441562" className="transition-colors hover:text-[#F5C200]">+237 233 44 15 62</a>
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
                  <span className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 shrink-0" style={{ color: "#F5C200" }} />
                    <a href="mailto:contact@cubafoussam.cm" className="transition-colors hover:text-[#F5C200]">contact@cubafoussam.cm</a>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#F5C200" }} />
                  <span>Lun – Ven : 07h30 – 15h30</span>
                </li>
              </ul>
            </div>

            {/* Colonnes de liens */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex flex-col gap-0.5" aria-hidden="true">
                    <div className="h-1 w-1 rounded-full" style={{ backgroundColor: "#F5C200" }} />
                    <div className="h-1 w-1 rounded-full" style={{ backgroundColor: "#3B6FCA" }} />
                    <div className="h-1 w-1 rounded-full" style={{ backgroundColor: "#F5C200" }} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-white">{title}</h4>
                </div>
                <ul className="flex flex-col gap-2">
                  {links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="flex items-center gap-2 text-sm transition-all hover:gap-3 hover:text-[#F5C200]"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        <LoSange size={7} fill="#F5C200" opacity={0.55} />
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Réseaux sociaux — extrême droite */}
            <div className="flex flex-col items-end justify-start lg:col-span-1">
              <h4 className="text-xs font-black uppercase tracking-widest text-white mb-5">Suivez-nous</h4>
              <div className="flex items-center gap-2">
                {[
                  { icon: Facebook, label: "Facebook" },
                  { icon: Twitter,  label: "Twitter" },
                  { icon: Youtube,  label: "YouTube" },
                  { icon: Instagram, label: "Instagram" },
                ].map(({ icon: Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all text-white/60 hover:bg-[#1B4FA8] hover:text-[#F5C200]"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bas footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-5">
            <div className="text-center sm:text-left">
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>
                © 2026 Communauté Urbaine de Bafoussam. Tous droits réservés.
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                Site réalisé par{" "}
                <a
                  href="https://www.yarabyte.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold transition-colors hover:text-[#F5C200]"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Yarabyte
                </a>
                {" — "}
                <a
                  href="https://www.yarabyte.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#F5C200]"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  www.yarabyte.com
                </a>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              <Link href="/mentions-legales" className="transition-colors hover:text-white">Mentions légales</Link>
              <Link href="/confidentialite" className="transition-colors hover:text-white">Confidentialité</Link>
              <Link href="/cookies" className="transition-colors hover:text-white">Cookies</Link>
              <Link href="/accessibilite" className="transition-colors hover:text-white">Accessibilité</Link>
              <a href="/actualites/rss.xml" className="transition-colors hover:text-white">Flux RSS</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
