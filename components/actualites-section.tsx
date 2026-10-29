import Image from "next/image"
import Link from "next/link"
import { Calendar, ArrowRight, ImageOff, Newspaper } from "lucide-react"
import { SectionLabel, BandeBamileke } from "./bamileke-pattern"
import CategoryBadge from "./category-badge"
import type { PublicArticle } from "@/lib/articles-db"

function Cover({ src, alt, sizes, className }: { src: string | null; alt: string; sizes: string; className: string }) {
  if (!src) return <ImageOff className="absolute inset-0 m-auto w-8 h-8 text-white/30" />
  return <Image src={src} alt={alt} fill sizes={sizes} className={className} />
}

export default function ActualitesSection({ articles }: { articles: PublicArticle[] }) {
  const [featured, ...rest] = articles
  const secondary = rest.slice(0, 2)
  const sideNews = rest.slice(2, 6)

  return (
    <section id="actualites" className="py-20 pattern-light">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <SectionLabel>Portail info</SectionLabel>
            <h2 className="text-3xl font-black text-balance" style={{ color: "#0D1A2E" }}>
              Actualités de la Ville
            </h2>
          </div>
          <Link
            href="/actualites"
            className="hidden sm:flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-lg transition-all hover:gap-3 hover:opacity-90"
            style={{ backgroundColor: "#F5C200", color: "#0D1A2E" }}
          >
            Toutes les actualités
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {!featured ? (
          <div className="text-center py-16 rounded-2xl border bg-white" style={{ borderColor: "rgba(27,79,168,0.12)" }}>
            <Newspaper className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(27,79,168,0.35)" }} />
            <p className="text-sm font-medium" style={{ color: "#64748b" }}>
              Aucune actualité publiée pour le moment.
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Article vedette */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <Link href={`/actualites/${featured.slug}`} className="group relative rounded-xl overflow-hidden block" style={{ aspectRatio: "16/9", backgroundColor: "#0D2F6E" }}>
              <Cover
                src={featured.image_url}
                alt={featured.title}
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,26,46,0.92) 0%, rgba(13,26,46,0.25) 60%, transparent 100%)" }} />

              {/* Bande Bamileke en haut */}
              <div className="absolute top-0 left-0 right-0 flex h-2" aria-hidden="true">
                <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
                {[0,1,2,3,4].map((i) => (
                  <div key={i} style={{ width: 10, backgroundColor: i % 2 === 0 ? "#F5C200" : "white" }} />
                ))}
                <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                {featured.categories[0] && <CategoryBadge category={featured.categories[0]} onDark />}
                <h3 className="text-xl font-black text-white mt-2 leading-snug text-balance transition-colors group-hover:text-yellow-300">
                  {featured.title}
                </h3>
                {featured.excerpt && <p className="text-white/65 text-sm mt-1.5 line-clamp-2">{featured.excerpt}</p>}
                <div className="flex items-center gap-3 mt-3">
                  <span className="flex items-center gap-1.5 text-white/50 text-xs">
                    <Calendar className="w-3 h-3" />
                    {featured.date}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold transition-all group-hover:gap-2" style={{ color: "#F5C200" }}>
                    Lire l'article
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>

            {/* Secondaires */}
            {secondary.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {secondary.map((article) => (
                <Link
                  key={article.id}
                  href={`/actualites/${article.slug}`}
                  className="group bg-white rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5"
                  style={{ borderColor: "rgba(27,79,168,0.12)" }}
                >
                  <div className="relative aspect-video overflow-hidden" style={{ backgroundColor: "#0D2F6E" }}>
                    <Cover
                      src={article.image_url}
                      alt={article.title}
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Bande accent bas */}
                    <div className="absolute bottom-0 left-0 right-0 flex h-1.5" aria-hidden="true">
                      <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
                      <div style={{ width: 20, backgroundColor: "#F5C200" }} />
                    </div>
                  </div>
                  <div className="p-4">
                    {article.categories[0] && <CategoryBadge category={article.categories[0]} />}
                    <h3 className="text-sm font-bold mt-2 leading-snug text-balance line-clamp-3 transition-colors group-hover:text-primary" style={{ color: "#0D1A2E" }}>
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs mt-3" style={{ color: "#64748b" }}>
                      <Calendar className="w-3 h-3" style={{ color: "#F5C200" }} />
                      {article.date}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            )}
          </div>

          {/* Sidebar — Dernières nouvelles */}
          <div className="lg:sticky lg:top-24">
            <div
              className="bg-white rounded-2xl flex flex-col overflow-hidden h-full"
              style={{
                border: "1px solid rgba(27,79,168,0.12)",
                boxShadow: "0 4px 20px rgba(13,26,46,0.06)",
              }}
            >
              {/* En-tête */}
              <div
                className="relative px-5 py-4 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #1B4FA8 0%, #0D2F6E 100%)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='8' cy='8' r='1' fill='white'/%3E%3C/svg%3E")`,
                    backgroundSize: "16px 16px",
                  }}
                />
                <div className="relative flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  >
                    <Newspaper className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5" aria-hidden="true">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="rounded-full"
                          style={{
                            width: 4,
                            height: 4,
                            backgroundColor: i % 2 === 0 ? "#F5C200" : "rgba(255,255,255,0.6)",
                          }}
                        />
                      ))}
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">
                      Dernières nouvelles
                    </h3>
                  </div>
                </div>
              </div>

              <ul className="flex flex-col flex-1">
                {sideNews.length === 0 && (
                  <li className="px-5 py-8 text-center text-sm" style={{ color: "#64748b" }}>
                    Pas d’autres nouvelles pour le moment.
                  </li>
                )}
                {sideNews.map((item, index) => (
                  <li key={item.id}>
                    <Link
                      href={`/actualites/${item.slug}`}
                      className="group flex gap-4 px-5 py-4 transition-all duration-200 hover:bg-[#E2E8F0]"
                      style={{
                        borderTop: index > 0 ? "1px solid rgba(27,79,168,0.06)" : undefined,
                        backgroundColor: index % 2 === 1 ? "#F1F5F9" : undefined,
                      }}
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors duration-200 group-hover:bg-[#1B4FA8] group-hover:text-white"
                        style={{
                          backgroundColor: "rgba(27,79,168,0.08)",
                          color: "#1B4FA8",
                        }}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        {item.categories[0] && <CategoryBadge category={item.categories[0]} />}
                        <p
                          className="mt-1.5 text-sm font-semibold leading-snug text-balance line-clamp-3 transition-colors duration-200 group-hover:text-[#1B4FA8]"
                          style={{ color: "#0D1A2E" }}
                        >
                          {item.title}
                        </p>
                        <div
                          className="mt-2 flex items-center gap-1.5 text-xs"
                          style={{ color: "#64748b" }}
                        >
                          <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: "#F5C200" }} />
                          {item.date}
                        </div>
                      </div>
                      <ArrowRight
                        className="w-4 h-4 shrink-0 self-center opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                        style={{ color: "#1B4FA8" }}
                      />
                    </Link>
                  </li>
                ))}
              </ul>

              <BandeBamileke className="h-1.5 shrink-0" />

              <div className="p-4">
                <Link
                  href="/actualites"
                  className="flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-xl transition-all duration-200 hover:opacity-90 hover:shadow-md"
                  style={{ backgroundColor: "#F5C200", color: "#0D1A2E" }}
                >
                  Voir toutes les actualités
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </section>
  )
}
