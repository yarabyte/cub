"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown, Search, Phone, Mail, PackageSearch } from "lucide-react"
import { DEMARCHES } from "@/lib/demarches"

const navLinks = [
  {
    label: "La Municipalité",
    href: "/municipalite/executif",
    children: [
      { label: "L'exécutif", href: "/municipalite/executif" },
      { label: "Les conseillers", href: "/municipalite/conseillers" },
      { label: "Maires et délégués", href: "/municipalite/maires-delegues" },
    ],
  },
  {
    label: "La Ville",
    href: "/presentation",
    children: [
      { label: "Présentation", href: "/presentation" },
      { label: "Mot du Maire", href: "/mot-du-maire" },
      { label: "Organigramme", href: "/organigramme" },
      { label: "Histoire", href: "#" },
    ],
  },
  { label: "Actualités", href: "/actualites", children: null },
  {
    label: "Démarches",
    href: "/demarches",
    children: DEMARCHES.map((d) => ({ label: d.title, href: `/demarches/${d.slug}` })),
  },
  { label: "Agenda",  href: "/agenda",   children: null },
  { label: "Médiathèque", href: "/mediatheque", children: null },
  { label: "Contact", href: "/contact",  children: null },
]

export default function Navbar() {
  const [isOpen, setIsOpen]   = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdown, setDropdown] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full">

      {/* ── Barre utilitaire — bleu royal + motif perles ── */}
      <div className="relative overflow-hidden" style={{ backgroundColor: "#1B4FA8" }}>
        {/* Losanges en filigrane très discrets */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="top-losange" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M18 3L33 18L18 33L3 18Z" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.12" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#top-losange)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-5">
            <a href="tel:+237233441562" className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium transition-opacity hover:opacity-80" style={{ color: "rgba(255,255,255,0.85)" }}>
              <Phone className="w-3 h-3" style={{ color: "#F5C200" }} />
              +237 233 44 15 62
            </a>
            <a href="mailto:contact@cubafoussam.cm" className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium transition-opacity hover:opacity-80" style={{ color: "rgba(255,255,255,0.85)" }}>
              <Mail className="w-3 h-3" style={{ color: "#F5C200" }} />
              contact@cubafoussam.cm
            </a>
          </div>
          {/* Perles décoratives Bamileke or / blanc */}
          <div className="hidden lg:flex items-center gap-1.5" aria-hidden="true">
            {[0,1,2,3,4,5,6,7,8].map((i) => (
              <div
                key={i}
                className="rounded-full shrink-0"
                style={{
                  width: i === 4 ? 7 : 5,
                  height: i === 4 ? 7 : 5,
                  backgroundColor: i % 2 === 0 ? "#F5C200" : "rgba(255,255,255,0.55)",
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/suivi"
              className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-black uppercase tracking-widest px-2 sm:px-3 py-1 rounded border transition-colors hover:bg-white/10"
              style={{ borderColor: "rgba(255,255,255,0.45)", color: "white" }}
            >
              <PackageSearch className="w-3 h-3" style={{ color: "#F5C200" }} />
              <span className="hidden sm:inline">Suivre mon courrier</span>
              <span className="sm:hidden">Courrier</span>
            </Link>
            <Link
              href="/demarches"
              className="whitespace-nowrap text-[10px] font-black uppercase tracking-widest px-2 sm:px-3 py-1 rounded transition-all hover:opacity-90"
              style={{ backgroundColor: "#F5C200", color: "#0D1A2E" }}
            >
              <span className="hidden sm:inline">Démarches en ligne</span>
              <span className="sm:hidden">Démarches</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Séparateur tricolore fin : vert | rouge | jaune (drapeau du Cameroun) ── */}
      <div className="flex items-stretch" style={{ height: 3 }} aria-hidden="true">
        <div className="flex-1" style={{ backgroundColor: "#007A5E" }} />
        <div className="flex-1" style={{ backgroundColor: "#CE1126" }} />
        <div className="flex-1" style={{ backgroundColor: "#FCD116" }} />
      </div>

      {/* ── Navigation principale ── */}
      <nav
        className="w-full transition-all duration-300"
        style={{
          backgroundColor: "white",
          boxShadow: scrolled ? "0 4px 24px rgba(13,26,46,0.15)" : "0 1px 0 rgba(0,0,0,0.07)",
        }}
        aria-label="Navigation principale"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center h-[62px] gap-4 xl:gap-8">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all"
                style={{
                  backgroundColor: scrolled ? "rgba(255,255,255,0.12)" : "white",
                  padding: "2px",
                  boxShadow: "0 0 0 2px rgba(27,79,168,0.15)",
                }}
              >
                <Image
                  src="/images/logo-cub.png"
                  alt="Logo Communauté Urbaine de Bafoussam"
                  width={44}
                  height={44}
                  className="w-10 h-10 object-contain"
                  priority
                />
              </div>
              <div>
                <div className="font-black text-[15px] leading-none tracking-tight" style={{ color: "#0D1A2E" }}>
                  BAFOUSSAM
                </div>
                <div className="text-[9px] uppercase tracking-[0.18em] font-bold mt-0.5" style={{ color: "#1B4FA8" }}>
                  Portail Officiel — C.U.B.
                </div>
              </div>
            </Link>

            {/* Nav desktop */}
            <ul className="hidden lg:flex items-center gap-0.5 flex-1">
              {navLinks.map((link) => (
                <li key={link.label} className="relative group">
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 whitespace-nowrap px-2 xl:px-3 py-2 text-[13px] xl:text-sm font-semibold rounded transition-all hover:bg-blue-50 hover:text-[#1B4FA8]"
                    style={{ color: "#1a2a4a" }}
                  >
                    {link.label}
                    {link.children && <ChevronDown className="w-3 h-3 opacity-50" />}
                  </Link>

                  {link.children && (
                    <div
                      className="absolute top-full left-0 mt-1.5 w-52 rounded-lg shadow-2xl border py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0"
                      style={{ backgroundColor: "white", borderColor: "rgba(27,79,168,0.18)" }}
                    >
                      {/* Bande accent */}
                      <div className="flex h-1 mx-3 mb-2 rounded overflow-hidden" aria-hidden="true">
                        <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
                        <div className="w-5"  style={{ backgroundColor: "#F5C200" }} />
                        <div className="w-2"  style={{ backgroundColor: "white" }} />
                      </div>
                      {link.children.map((child) => {
                        const item = typeof child === "string" ? { label: child, href: "#" } : child
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm transition-all hover:bg-blue-50 hover:text-[#1B4FA8]"
                            style={{ color: "#1a2a4a" }}
                          >
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#F5C200" }} aria-hidden="true" />
                            {item.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {/* Recherche */}
            <button
              aria-label="Rechercher"
              className="hidden lg:flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:bg-blue-50"
              style={{ color: "#1B4FA8" }}
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* Burger mobile */}
            <button
              className="lg:hidden ml-auto flex items-center justify-center w-9 h-9 rounded-lg transition-all"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Fermer" : "Menu"}
              aria-expanded={isOpen}
              style={{
                color: "#1B4FA8",
                backgroundColor: "rgba(27,79,168,0.08)",
              }}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isOpen && (
          <div className="lg:hidden border-t" style={{ backgroundColor: "#F8FAFF", borderColor: "rgba(27,79,168,0.12)" }}>
            {/* Perles décoratives */}
            <div className="flex justify-center gap-1.5 py-2.5" aria-hidden="true">
              {[0,1,2,3,4,5,6,7,8,9,10].map((i) => (
                <div key={i} className="rounded-full shrink-0" style={{ width: 5, height: 5, backgroundColor: i % 3 === 0 ? "#F5C200" : i % 3 === 1 ? "#1B4FA8" : "#cbd5e1", opacity: 0.7 }} />
              ))}
            </div>
            <nav className="px-5 pb-5 flex flex-col gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center justify-between px-3 py-3 text-sm font-semibold rounded-lg transition-colors border-b hover:bg-blue-50"
                  style={{ color: "#0D1A2E", borderColor: "rgba(27,79,168,0.08)" }}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                  {link.children && <ChevronDown className="w-4 h-4 opacity-40" />}
                </Link>
              ))}
              <Link
                href="/suivi"
                className="mt-3 flex items-center justify-center gap-2 text-sm font-black px-4 py-3 rounded-lg border transition-colors hover:bg-blue-50"
                style={{ borderColor: "#1B4FA8", color: "#1B4FA8" }}
                onClick={() => setIsOpen(false)}
              >
                <PackageSearch className="w-4 h-4" />
                Suivre mon courrier
              </Link>
              <Link
                href="/demarches"
                className="mt-2 text-sm font-black px-4 py-3 rounded-lg text-center transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#1B4FA8", color: "white" }}
                onClick={() => setIsOpen(false)}
              >
                Démarches en ligne
              </Link>
            </nav>
          </div>
        )}
      </nav>
    </header>
  )
}
