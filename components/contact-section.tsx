"use client"

import Link from "next/link"
import { Phone, Mail, MapPin, Clock, Send, Facebook, Twitter, Youtube, Instagram } from "lucide-react"
import { RangeePerles, LoSange } from "./bamileke-pattern"

const quickLinks = [
  { label: "Présentation de la ville", href: "#" },
  { label: "Actualités", href: "#actualites" },
  { label: "Services municipaux", href: "#services" },
  { label: "Démarches en ligne", href: "/demarches" },
  { label: "Agenda culturel", href: "#agenda" },
  { label: "Organigramme", href: "/organigramme" },
]

const serviceLinks = [
  { label: "État Civil", href: "#" },
  { label: "Urbanisme & Architecture", href: "#" },
  { label: "Action Sociale", href: "#" },
  { label: "Environnement", href: "#" },
  { label: "Transport & Mobilité", href: "#" },
  { label: "Culture & Patrimoine", href: "#" },
]

export default function ContactSection() {
  return (
    <section id="contact" className="pt-0">

      {/* ── Bandeau contact — bleu royal avec motif perles ── */}
      <div className="relative overflow-hidden py-20" style={{ backgroundColor: "#1B4FA8" }}>
        {/* Motif points en filigrane */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='2.5' fill='white' fill-opacity='0.07'/%3E%3C/svg%3E")`,
            backgroundSize: "24px 24px",
          }}
          aria-hidden="true"
        />

        {/* Losanges décoratifs en arrière-plan */}
        <div className="absolute top-6 right-12 hidden lg:block opacity-15" aria-hidden="true">
          <LoSange size={60} fill="#F5C200" />
        </div>
        <div className="absolute bottom-6 left-24 hidden lg:block opacity-10" aria-hidden="true">
          <LoSange size={40} fill="white" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Info contact */}
            <div>
              <RangeePerles count={7} color="#F5C200" size={6} gap={8} opacity={0.7} className="mb-4" />
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#F5C200" }}>
                Nous contacter
              </p>
              <h2 className="text-3xl font-black text-white mb-7 text-balance">
                Votre Mairie est à votre service
              </h2>

              <div className="flex flex-col gap-5">
                {[
                  { Icon: MapPin, label: "Adresse", value: "Rue Poya, Bafoussam, Région de l'Ouest — Cameroun" },
                  { Icon: Phone, label: "Téléphone", value: "+237 233 44 15 62" },
                  { Icon: Mail, label: "Email", value: "contact@cubafoussam.cm" },
                  { Icon: Clock, label: "Horaires", value: "Lundi – Vendredi : 07h30 – 15h30" },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex gap-4 items-start">
                    <div
                      className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: "rgba(245,194,0,0.18)", border: "1px solid rgba(245,194,0,0.3)" }}
                    >
                      <Icon className="w-4.5 h-4.5" style={{ color: "#F5C200" }} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
                      <p className="text-sm font-semibold text-white mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Réseaux sociaux */}
              <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Suivez-nous
                </p>
                <div className="flex gap-3">
                  {[
                    { Icon: Facebook, label: "Facebook" },
                    { Icon: Twitter, label: "Twitter" },
                    { Icon: Youtube, label: "YouTube" },
                    { Icon: Instagram, label: "Instagram" },
                  ].map(({ Icon, label }) => (
                    <button
                      key={label}
                      aria-label={label}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5 hover:bg-yellow-400/30 hover:text-[#F5C200]"
                      style={{ backgroundColor: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div className="bg-white rounded-2xl p-7 shadow-2xl">
              {/* Bande accent top */}
              <div className="flex h-1.5 -mx-7 -mt-7 mb-7 rounded-t-2xl overflow-hidden" aria-hidden="true">
                <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
                {[0,1,2,3,4,5,6].map((i) => (
                  <div key={i} style={{ width: 9, backgroundColor: i % 2 === 0 ? "#F5C200" : "white" }} />
                ))}
                <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
              </div>

              <h3 className="font-black text-lg mb-5" style={{ color: "#0D1A2E" }}>Envoyer un message</h3>

              <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#475569" }}>Prénom</label>
                    <input
                      type="text"
                      placeholder="Jean"
                      className="w-full px-4 py-2.5 rounded-lg text-sm border outline-none transition-all"
                      style={{ borderColor: "rgba(27,79,168,0.2)", color: "#0D1A2E" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#1B4FA8"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(27,79,168,0.12)" }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(27,79,168,0.2)"; e.currentTarget.style.boxShadow = "none" }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#475569" }}>Nom</label>
                    <input
                      type="text"
                      placeholder="Dupont"
                      className="w-full px-4 py-2.5 rounded-lg text-sm border outline-none transition-all"
                      style={{ borderColor: "rgba(27,79,168,0.2)", color: "#0D1A2E" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#1B4FA8"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(27,79,168,0.12)" }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(27,79,168,0.2)"; e.currentTarget.style.boxShadow = "none" }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#475569" }}>Email</label>
                  <input
                    type="email"
                    placeholder="jean.dupont@email.com"
                    className="w-full px-4 py-2.5 rounded-lg text-sm border outline-none transition-all"
                    style={{ borderColor: "rgba(27,79,168,0.2)", color: "#0D1A2E" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#1B4FA8"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(27,79,168,0.12)" }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(27,79,168,0.2)"; e.currentTarget.style.boxShadow = "none" }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#475569" }}>Objet</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-lg text-sm border outline-none transition-all"
                    style={{ borderColor: "rgba(27,79,168,0.2)", color: "#0D1A2E" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#1B4FA8"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(27,79,168,0.12)" }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(27,79,168,0.2)"; e.currentTarget.style.boxShadow = "none" }}
                  >
                    <option value="">Sélectionner un objet</option>
                    <option>État civil</option>
                    <option>Urbanisme</option>
                    <option>Environnement</option>
                    <option>Autre demande</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#475569" }}>Message</label>
                  <textarea
                    rows={4}
                    placeholder="Décrivez votre demande..."
                    className="w-full px-4 py-2.5 rounded-lg text-sm border outline-none transition-all resize-none"
                    style={{ borderColor: "rgba(27,79,168,0.2)", color: "#0D1A2E" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#1B4FA8"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(27,79,168,0.12)" }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(27,79,168,0.2)"; e.currentTarget.style.boxShadow = "none" }}
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-bold text-sm transition-all hover:opacity-90 hover:gap-3"
                  style={{ backgroundColor: "#1B4FA8", color: "white" }}
                >
                  <Send className="w-4 h-4" />
                  Envoyer le message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer — bleu nuit ── */}
      <footer style={{ backgroundColor: "#0D1A2E" }}>
        {/* Bande Bamileke */}
        <div className="flex h-2 w-full" aria-hidden="true">
          <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ width: 9, backgroundColor: i % 2 === 0 ? "#F5C200" : "white" }} />
          ))}
          <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Colonne marque */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#1B4FA8" }}>
                  <svg viewBox="0 0 36 36" className="w-6 h-6" fill="none">
                    <rect x="5"  y="18" width="26" height="13" rx="1" fill="white" fillOpacity="0.95" />
                    <rect x="10" y="12" width="16" height="8"  rx="1" fill="white" fillOpacity="0.7" />
                    <rect x="15" y="6"  width="6"  height="8"  rx="0.5" fill="#F5C200" />
                    <rect x="8"  y="22" width="4"  height="5"  rx="0.5" fill="#1B4FA8" />
                    <rect x="16" y="22" width="4"  height="5"  rx="0.5" fill="#1B4FA8" />
                    <rect x="24" y="22" width="4"  height="5"  rx="0.5" fill="#1B4FA8" />
                  </svg>
                </div>
                <div>
                  <p className="font-black text-white leading-none">BAFOUSSAM</p>
                  <p className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: "#F5C200" }}>Portail Officiel</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-pretty mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>
                Le portail numérique officiel de la Communauté Urbaine de Bafoussam, capitale de la Région de l'Ouest.
              </p>
              {/* Perles décoratives */}
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {[0,1,2,3,4,5].map((i) => (
                  <div key={i} className="rounded-full" style={{ width: 6, height: 6, backgroundColor: i % 3 === 0 ? "#F5C200" : i % 3 === 1 ? "#3B6FCA" : "rgba(255,255,255,0.2)" }} />
                ))}
              </div>
            </div>

            {/* Liens rapides */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-0.5" aria-hidden="true">
                  <div className="h-3 w-1 rounded-full" style={{ backgroundColor: "#F5C200" }} />
                  <div className="h-3 w-1 rounded-full" style={{ backgroundColor: "#1B4FA8" }} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-white">Liens Rapides</h4>
              </div>
              <ul className="flex flex-col gap-2">
                {quickLinks.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="flex items-center gap-2 text-sm transition-all hover:gap-3 hover:text-[#F5C200]"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      <LoSange size={7} fill="#F5C200" opacity={0.6} />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-0.5" aria-hidden="true">
                  <div className="h-3 w-1 rounded-full" style={{ backgroundColor: "#F5C200" }} />
                  <div className="h-3 w-1 rounded-full" style={{ backgroundColor: "#1B4FA8" }} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-white">Services</h4>
              </div>
              <ul className="flex flex-col gap-2">
                {serviceLinks.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="flex items-center gap-2 text-sm transition-all hover:gap-3 hover:text-[#F5C200]"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      <LoSange size={7} fill="#F5C200" opacity={0.6} />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-0.5" aria-hidden="true">
                  <div className="h-3 w-1 rounded-full" style={{ backgroundColor: "#F5C200" }} />
                  <div className="h-3 w-1 rounded-full" style={{ backgroundColor: "#1B4FA8" }} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-white">Newsletter</h4>
              </div>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                Recevez les actualités et informations officielles de la mairie.
              </p>
              <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#F5C200"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)" }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)" }}
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-90"
                  style={{ backgroundColor: "#F5C200", color: "#0D1A2E" }}
                >
                  S'abonner
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bas de footer */}
        <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-center sm:text-left" style={{ color: "rgba(255,255,255,0.3)" }}>
              © 2026 Communauté Urbaine de Bafoussam. Tous droits réservés.
            </p>
            <div className="flex items-center gap-5 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              <Link href="#" className="transition-colors hover:text-white">Mentions légales</Link>
              <Link href="#" className="transition-colors hover:text-white">Politique de confidentialité</Link>
              <Link href="#" className="transition-colors hover:text-white">Accessibilité</Link>
            </div>
          </div>
        </div>
      </footer>
    </section>
  )
}
