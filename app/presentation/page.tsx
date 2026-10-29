import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { RangeePerles, LoSange } from "@/components/bamileke-pattern"
import { pageMetadata } from "@/lib/site"
import JsonLd from "@/components/json-ld"
import { breadcrumbSchema } from "@/lib/structured-data"
import {
  ChevronRight,
  MapPin,
  Landmark,
  Calendar,
  Building2,
  Users,
  BookOpen,
  Quote,
  Network,
} from "lucide-react"

const sidebarLinks = [
  { label: "Présentation", href: "/presentation", icon: MapPin },
  { label: "Mot du Maire", href: "/mot-du-maire", icon: Quote },
  { label: "Organigramme", href: "/organigramme", icon: Network },
  { label: "Histoire", href: "/presentation#histoire", icon: Building2 },
]

export const metadata = pageMetadata({
  title: "Présentation de la ville",
  description:
    "Découvrez Bafoussam : géographie, histoire, Communauté Urbaine de Bafoussam (CUB), chiffres clés et patrimoine. Chef-lieu de la région de l'Ouest au Cameroun.",
  path: "/presentation",
})

const sections = [
  {
    id: "en-bref",
    icon: Landmark,
    title: "Bafoussam en bref",
    content: `Bafoussam est une ville du Cameroun, chef-lieu du département de la Mifi et de la région de l'Ouest. Elle constitue le cœur économique, administratif et culturel de la région des Hautes Terres.

La ville doit son nom aux « Bafoussam », peuple de l'ethnie Bamiléké, et s'est développée autour des chefferies traditionnelles tout en devenant un pôle urbain moderne. Aujourd'hui, Bafoussam est le siège de la Communauté Urbaine de Bafoussam (C.U.B.), qui regroupe plusieurs communes d'arrondissement.`,
  },
  {
    id: "geographie",
    icon: MapPin,
    title: "Géographie et situation",
    content: `Bafoussam est située sur les Hautes Terres de l'Ouest camerounais, à environ 300 km au nord-ouest de Yaoundé et 350 km au nord-ouest de Douala. L'altitude varie entre 1 200 et 1 500 mètres, ce qui lui confère un climat relativement doux.

La ville est un carrefour important : elle est traversée par des axes routiers majeurs reliant les régions anglophones au reste du pays et vers les pays limitrophes. Son positionnement en fait un hub commercial et de transit pour toute la région.`,
  },
  {
    id: "histoire",
    icon: Calendar,
    title: "Histoire",
    content: `L'histoire de Bafoussam est marquée par l'organisation traditionnelle Bamiléké, fondée sur les chefferies et les sociétés secrètes. La colonisation allemande puis française a intégré la zone dans l'administration moderne, tout en laissant une forte empreinte culturelle locale.

La création de la Communauté Urbaine de Bafoussam (C.U.B.) a officialisé le regroupement des communes d'arrondissement (Bafoussam Ier, IIe et IIIe), par le décret n° 2008/022 du 17 janvier 2008, pour une gestion coordonnée du développement urbain, des infrastructures et des services aux citoyens.`,
  },
  {
    id: "cub",
    icon: Building2,
    title: "La Communauté Urbaine de Bafoussam (C.U.B.)",
    content: `La C.U.B. est l'instance de gouvernance qui regroupe les communes d'arrondissement de l'agglomération de Bafoussam. Elle assure la planification urbaine, le développement des infrastructures, la voirie, l'assainissement, l'état civil, l'urbanisme et de nombreux services de proximité.

Le Maire de la Ville et son exécutif, ainsi que le Conseil de la Communauté Urbaine, œuvrent au quotidien pour améliorer le cadre de vie des habitants, favoriser l'attractivité économique et préserver le patrimoine culturel bamiléké.`,
  },
  {
    id: "chiffres",
    icon: Users,
    title: "Chiffres clés",
    content: `La Communauté Urbaine de Bafoussam compte environ 537 000 habitants (estimation 2023) sur une superficie d'environ 413 km². La ville dispose d'équipements publics (marchés, stades, parcs, établissements scolaires et de santé) en constante évolution.

Ses 3 communes d'arrondissement (Bafoussam Ier, IIe et IIIe) et leurs nombreux quartiers forment un tissu urbain dense et animé, où cohabitent traditions et modernité.`,
  },
  {
    id: "culture",
    icon: BookOpen,
    title: "Culture et patrimoine",
    content: `Bafoussam et la région de la Mifi sont le berceau de la culture Bamiléké : art royal (perles, tissus, trônes), danses traditionnelles, chefferies et palais qui attirent visiteurs et chercheurs. Les sites touristiques et les manifestations culturelles (FODEBAF, festivals, journées du patrimoine) renforcent l'identité de la ville.

La C.U.B. promeut la culture et les traditions à travers la valorisation des chefferies, des musées et des événements qui mettent en avant le patrimoine immatériel et les savoir-faire locaux.`,
  },
]

export default function PresentationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <JsonLd data={breadcrumbSchema([{ name: "Présentation de la ville" }])} />

      {/* Hero / bannière */}
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
          <nav
            className="flex items-center gap-2 text-xs mb-6 font-medium"
            aria-label="Fil d'ariane"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span style={{ color: "#F5C200" }}>Présentation de la ville</span>
          </nav>

          <RangeePerles count={7} color="#F5C200" size={6} gap={8} opacity={0.6} />

          <div className="mt-4 flex items-start gap-5">
            <div
              className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <Landmark className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white text-balance leading-tight">
                Présentation de la ville
              </h1>
              <p className="mt-2 text-sm text-pretty" style={{ color: "rgba(255,255,255,0.7)" }}>
                Bafoussam — Chef-lieu de la Mifi et de la région de l'Ouest, Cameroun
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

      {/* Contenu principal */}
      <main className="flex-1 py-14" style={{ backgroundColor: "#F2F4F8" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar sommaire */}
            <aside className="lg:col-span-1">
              <div className="sticky top-28 flex flex-col gap-6">
              <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#E5ECFF" }}>
                <div className="px-5 py-4" style={{ backgroundColor: "#1B4FA8" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <RangeePerles count={3} color="#F5C200" size={5} gap={5} opacity={0.8} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-white">
                    La Ville
                  </p>
                </div>
                <nav aria-label="Navigation La Ville">
                  <ul className="divide-y" style={{ borderColor: "#F0F4FF" }}>
                    {sidebarLinks.map(({ label, href, icon: Icon }) => {
                      const isActive = href === "/presentation"
                      return (
                        <li key={href}>
                          <Link
                            href={href}
                            aria-current={isActive ? "page" : undefined}
                            className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${isActive ? "bg-blue-50 font-bold" : "hover:bg-[#F8FAFF]"}`}
                            style={{ color: isActive ? "#1B4FA8" : "#374151" }}
                          >
                            <Icon className="w-4 h-4 shrink-0" style={{ color: "#1B4FA8" }} />
                            <span>{label}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              </div>

              <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#E5ECFF" }}>
                <div className="px-5 py-3" style={{ backgroundColor: "#F8FAFF", borderBottom: "1px solid #E5ECFF" }}>
                  <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#1B4FA8" }}>
                    Sur cette page
                  </p>
                </div>
                <nav aria-label="Sommaire de la page">
                  <ul className="divide-y" style={{ borderColor: "#F0F4FF" }}>
                    {sections.map(({ id, icon: Icon, title }) => (
                      <li key={id}>
                        <a
                          href={`#${id}`}
                          className="flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors hover:bg-[#F8FAFF] group"
                          style={{ color: "#374151" }}
                        >
                          <Icon
                            className="w-4 h-4 shrink-0"
                            style={{ color: "#1B4FA8" }}
                          />
                          <span className="leading-tight">{title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
              </div>
            </aside>

            {/* Corps de la page */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              <figure className="rounded-2xl border overflow-hidden bg-white" style={{ borderColor: "#E5ECFF" }}>
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src="/images/hero-bafoussam.png"
                    alt="Hôtel de Ville de Bafoussam, siège de la Communauté Urbaine"
                    fill
                    priority
                    sizes="(min-width: 1024px) 900px, 100vw"
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
                    style={{ background: "linear-gradient(to top, rgba(13,26,46,0.75), transparent)" }}
                    aria-hidden="true"
                  />
                  <div className="absolute left-5 bottom-4 flex items-center gap-2 text-white">
                    <MapPin className="w-4 h-4 shrink-0" style={{ color: "#F5C200" }} />
                    <span className="text-sm font-semibold">Bafoussam — Région de l'Ouest, Cameroun</span>
                  </div>
                </div>
                <figcaption className="px-5 py-3 text-xs" style={{ color: "#64748b" }}>
                  L'Hôtel de Ville de Bafoussam, siège de la Communauté Urbaine de Bafoussam (C.U.B.).
                </figcaption>
              </figure>

              {sections.map(({ id, icon: Icon, title, content }) => (
                <div
                  key={id}
                  id={id}
                  className="bg-white rounded-2xl border p-8 scroll-mt-32"
                  style={{ borderColor: "#E5ECFF" }}
                >
                  <div className="flex items-start gap-4 mb-5 pb-5" style={{ borderBottom: "1px solid #EEF2FF" }}>
                    <div
                      className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "#EFF4FF" }}
                    >
                      <Icon className="w-5 h-5" style={{ color: "#1B4FA8" }} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-balance" style={{ color: "#0D1A2E" }}>
                        {title}
                      </h2>
                      <div className="flex items-center gap-1 mt-1.5" aria-hidden="true">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#F5C200" }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#1B4FA8" }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#F5C200" }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#4B5563" }}>
                    {content}
                  </div>
                </div>
              ))}

              {/* CTA */}
              <div
                className="rounded-2xl border p-8 text-center"
                style={{ backgroundColor: "#1B4FA8", borderColor: "#0D2F6E" }}
              >
                <p className="text-white font-bold text-lg mb-2">
                  Découvrez les démarches de la C.U.B.
                </p>
                <p className="text-white/80 text-sm mb-6 max-w-xl mx-auto">
                  Pièces à fournir, lieux de dépôt et délais pour vos actes d'état civil.
                </p>
                <Link
                  href="/demarches"
                  className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: "#F5C200", color: "#0D1A2E" }}
                >
                  Voir les démarches
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
