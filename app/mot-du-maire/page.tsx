import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { RangeePerles, LoSange } from "@/components/bamileke-pattern"
import { pageMetadata } from "@/lib/site"
import JsonLd from "@/components/json-ld"
import { breadcrumbSchema, mayorSchema } from "@/lib/structured-data"
import { getMayorMessage } from "@/lib/settings-db"
import { mayorFullName } from "@/lib/mayor-message-schema"
import { ChevronRight, Quote, MapPin, Building2, Network } from "lucide-react"

export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const message = await getMayorMessage()
  const title = [message.title, message.titleHighlight].filter(Boolean).join(" ")
  return pageMetadata({
    title: "Mot du Maire",
    description: `Message du ${mayorFullName(message)}, ${message.role}. ${title}.`.slice(0, 200),
    path: "/mot-du-maire",
  })
}

const sidebarLinks = [
  { label: "Présentation", href: "/presentation", icon: MapPin },
  { label: "Mot du Maire", href: "/mot-du-maire", icon: Quote },
  { label: "Organigramme", href: "/organigramme", icon: Network },
  { label: "Histoire", href: "/presentation#histoire", icon: Building2 },
]

export default async function MotDuMairePage() {
  const message = await getMayorMessage()
  const fullName = mayorFullName(message)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <JsonLd data={[mayorSchema(message), breadcrumbSchema([{ name: "Mot du Maire" }])]} />

      {/* Hero */}
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
            className="flex items-center gap-2 text-xs mb-6 font-medium flex-wrap"
            aria-label="Fil d'ariane"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <Link href="/" className="hover:text-white transition-colors underline-offset-2 hover:underline">
              Accueil
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <Link href="/presentation" className="hover:text-white transition-colors underline-offset-2 hover:underline">
              La Ville
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span className="font-semibold" style={{ color: "#F5C200" }}>Mot du Maire</span>
          </nav>

          <RangeePerles count={7} color="#F5C200" size={6} gap={8} opacity={0.6} />

          <div className="mt-5 flex items-start gap-5">
            <div
              className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ring-2 ring-white/20"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <Quote className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white text-balance leading-tight tracking-tight">
                Mot du Maire
              </h1>
              <p className="mt-2 text-sm md:text-base text-pretty max-w-xl" style={{ color: "rgba(255,255,255,0.82)" }}>
                {fullName} — {message.role}
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

      <main className="flex-1 py-14" style={{ backgroundColor: "#F0F4FA" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar La Ville */}
            <aside className="lg:col-span-1">
              <div
                className="sticky top-28 bg-white rounded-2xl border overflow-hidden"
                style={{ borderColor: "#E5ECFF" }}
              >
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
                      const isActive = href === "/mot-du-maire"
                      return (
                        <li key={href}>
                          <Link
                            href={href}
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
              <div
                className="mt-6 rounded-xl border p-5"
                style={{ backgroundColor: "#EFF4FF", borderColor: "#C7D7F5" }}
              >
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#1B4FA8" }}>
                  En savoir plus
                </p>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "#4B5563" }}>
                  L'exécutif municipal et l'organigramme de la C.U.B.
                </p>
                <Link
                  href="/municipalite/executif"
                  className="inline-flex items-center gap-2 text-sm font-bold transition-colors hover:gap-3"
                  style={{ color: "#1B4FA8" }}
                >
                  La Municipalité
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </aside>

            {/* Contenu */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border p-8 md:p-10 shadow-lg shadow-blue-950/5" style={{ borderColor: "rgba(27,79,168,0.12)" }}>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
                  {/* Photo */}
                  <div className="lg:col-span-2">
                    <div className="relative rounded-2xl overflow-hidden shadow-xl" style={{ aspectRatio: "3/4" }}>
                      <Image
                        src={message.photo}
                        alt={`${fullName} — ${message.role}`}
                        fill
                        sizes="(min-width: 1024px) 360px, 100vw"
                        className="object-cover"
                      />
                      <div
                        className="absolute bottom-0 left-0 right-0 p-4"
                        style={{ background: "linear-gradient(to top, rgba(13,26,46,0.95) 0%, transparent 100%)" }}
                      >
                        <p className="text-white font-black text-lg">{message.name}</p>
                        <p className="text-xs font-semibold uppercase tracking-wider mt-0.5" style={{ color: "#F5C200" }}>
                          {message.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex h-2 mt-0 overflow-hidden rounded-b" aria-hidden="true">
                      <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
                      {[0,1,2,3,4,5,6].map((i) => (
                        <div key={i} style={{ width: 9, backgroundColor: i % 2 === 0 ? "#F5C200" : "white" }} />
                      ))}
                      <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="lg:col-span-3">
                    <h2 className="text-2xl font-black mb-4 text-balance" style={{ color: "#0D1A2E" }}>
                      {message.title}
                      {message.titleHighlight && (
                        <>
                          {" "}
                          <span style={{ color: "#1B4FA8" }}>{message.titleHighlight}</span>
                        </>
                      )}
                    </h2>

                    <div className="relative pl-5 mb-6 py-1" style={{ borderLeft: "4px solid #F5C200" }}>
                      <p className="text-lg font-bold italic leading-relaxed" style={{ color: "#0D1A2E" }}>
                        {message.quote}
                      </p>
                    </div>

                    <div className="space-y-4 text-[15px] leading-relaxed" style={{ color: "#475569" }}>
                      {message.paragraphs.map((p, i) => (
                        <p key={i} className="whitespace-pre-line">
                          {p}
                        </p>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 mt-8 pt-6" style={{ borderTop: "1px solid rgba(27,79,168,0.12)" }}>
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 ring-2 ring-[#F5C200]">
                        <Image src={message.photo} alt={message.name} width={56} height={56} className="object-cover w-full h-full" />
                      </div>
                      <div>
                        <p className="font-black text-lg" style={{ color: "#0D1A2E" }}>{fullName}</p>
                        <p className="text-sm" style={{ color: "#1B4FA8" }}>
                          {message.role}
                          {message.mandate && <> · Mandat {message.mandate}</>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
