import Link from "next/link"
import { ChevronRight, Clock, Mail, MapPin, MessageSquare, Phone } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageBanner from "@/components/page-banner"
import ContactForm from "@/components/contact/contact-form"
import { RangeePerles } from "@/components/bamileke-pattern"
import { pageMetadata } from "@/lib/site"
import JsonLd from "@/components/json-ld"
import { breadcrumbSchema, cityHallSchema } from "@/lib/structured-data"

export const metadata = pageMetadata({
  title: "Contacter la mairie",
  description:
    "Contactez la Communauté Urbaine de Bafoussam : formulaire en ligne, adresse, téléphone, e-mail et horaires d'ouverture.",
  path: "/contact",
})

const COORDONNEES = [
  {
    icon: MapPin,
    label: "Adresse",
    lines: ["Hôtel de Ville, Rue Poya", "B.P. 995 Bafoussam — Région de l'Ouest, Cameroun"],
  },
  { icon: Phone, label: "Téléphone", lines: ["+237 233 44 15 62"], href: "tel:+237233441562" },
  { icon: Mail, label: "E-mail", lines: ["contact@cubafoussam.cm"], href: "mailto:contact@cubafoussam.cm" },
  { icon: Clock, label: "Horaires d'ouverture", lines: ["Du lundi au vendredi", "07h30 – 15h30"] },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <JsonLd data={[cityHallSchema(), breadcrumbSchema([{ name: "Contact" }])]} />

      <PageBanner
        icon={MessageSquare}
        title="Contactez la mairie"
        subtitle="Une question, une demande ou une réclamation ? Écrivez aux services de la Communauté Urbaine de Bafoussam."
        crumbs={[{ label: "Contact" }]}
      />

      <main className="flex-1 py-14" style={{ backgroundColor: "#F2F4F8" }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="flex flex-col gap-4">
            {COORDONNEES.map(({ icon: Icon, label, lines, href }) => {
              const body = (
                <>
                  <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EFF4FF" }}>
                    <Icon className="w-5 h-5" style={{ color: "#1B4FA8" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#1B4FA8" }}>
                      {label}
                    </p>
                    {lines.map((line) => (
                      <p key={line} className="mt-1 text-sm font-semibold leading-snug break-words" style={{ color: "#0D1A2E" }}>
                        {line}
                      </p>
                    ))}
                  </div>
                </>
              )
              const className = "bg-white rounded-2xl border p-5 flex items-start gap-4"
              return href ? (
                <a
                  key={label}
                  href={href}
                  className={`${className} transition-all hover:shadow-md hover:-translate-y-0.5`}
                  style={{ borderColor: "#E5ECFF" }}
                >
                  {body}
                </a>
              ) : (
                <div key={label} className={className} style={{ borderColor: "#E5ECFF" }}>
                  {body}
                </div>
              )
            })}

            <div className="rounded-2xl border p-5" style={{ backgroundColor: "#EFF4FF", borderColor: "#C7D7F5" }}>
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#1B4FA8" }}>
                Démarches d'état civil
              </p>
              <p className="text-sm leading-relaxed mb-3" style={{ color: "#4B5563" }}>
                Pièces à fournir et délais pour les actes de naissance, de mariage et de décès.
              </p>
              <Link
                href="/demarches"
                className="inline-flex items-center gap-1.5 text-sm font-bold transition-all hover:gap-2.5"
                style={{ color: "#1B4FA8" }}
              >
                Voir les démarches
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </aside>

          <section className="lg:col-span-2 relative bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#E5ECFF" }}>
            <div className="flex h-1.5" aria-hidden="true">
              <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={{ width: 12, backgroundColor: i % 2 === 0 ? "#F5C200" : "white" }} />
              ))}
              <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
            </div>
            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <RangeePerles count={5} color="#F5C200" size={5} gap={6} />
                <h2 className="mt-3 text-xl font-black" style={{ color: "#0D1A2E" }}>
                  Écrire à la mairie
                </h2>
                <p className="mt-1 text-sm" style={{ color: "#64748b" }}>
                  Votre message est transmis à <span className="font-semibold" style={{ color: "#0D1A2E" }}>contact@cubafoussam.cm</span>.
                  Les champs marqués d'un <span className="text-red-500">*</span> sont obligatoires.
                </p>
              </div>
              <ContactForm />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
