import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { RangeePerles, LoSange } from "@/components/bamileke-pattern"
import { ArrowRight, Newspaper, ChevronRight } from "lucide-react"
import ActualitesFilters, { type ArticleCard, type FilterCategory } from "@/components/actualites-filters"
import { getPublishedArticles, type PublicArticle } from "@/lib/articles-db"
import { pageMetadata } from "@/lib/site"
import JsonLd from "@/components/json-ld"
import { breadcrumbSchema } from "@/lib/structured-data"

export const dynamic = "force-dynamic"

export const metadata = pageMetadata({
  title: "Actualités de Bafoussam",
  description:
    "Retrouvez toutes les actualités de la Communauté Urbaine de Bafoussam : infrastructures, gouvernance, coopération, culture et vie de la cité.",
  path: "/actualites",
})

export default async function ActualitesPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string | string[]; annee?: string | string[] }>
}) {
  const { categorie, annee } = await searchParams
  let dbArticles: PublicArticle[] = []
  try {
    dbArticles = await getPublishedArticles()
  } catch (e) {
    console.error("Actualités indisponibles :", e)
  }

  const articles: ArticleCard[] = dbArticles.map((a) => ({
    id: a.id,
    slug: a.slug,
    image: a.image_url,
    title: a.title,
    excerpt: a.excerpt ?? undefined,
    date: a.date,
    year: a.published_at ? new Date(a.published_at).getFullYear() : null,
    categories: a.categories,
  }))
  const categoryMap = new Map<number, FilterCategory>()
  for (const a of dbArticles) for (const c of a.categories) categoryMap.set(c.id, c)
  const categories = [...categoryMap.values()].sort((a, b) => a.name.localeCompare(b.name, "fr"))

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <JsonLd data={breadcrumbSchema([{ name: "Actualités" }])} />

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
            className="flex items-center gap-2 text-xs mb-6 font-medium"
            aria-label="Fil d'ariane"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span style={{ color: "#F5C200" }}>Toute l'actualité</span>
          </nav>

          <RangeePerles count={7} color="#F5C200" size={6} gap={8} opacity={0.6} />

          <div className="mt-4 flex items-start gap-5">
            <div
              className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <Newspaper className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white text-balance leading-tight">
                Toute l'actualité
              </h1>
              <p className="mt-2 text-sm text-pretty" style={{ color: "rgba(255,255,255,0.7)" }}>
                Les dernières nouvelles de la Communauté Urbaine de Bafoussam
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

      {/* Liste des articles avec filtres */}
      <main className="flex-1 py-14" style={{ backgroundColor: "#F2F4F8" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <Link
              href="/#actualites"
              className="inline-flex items-center gap-2 text-sm font-bold transition-colors hover:gap-3 order-2 sm:order-1"
              style={{ color: "#1B4FA8" }}
            >
              Retour à l'accueil
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <ActualitesFilters
            articles={articles}
            categories={categories}
            initialCategory={typeof categorie === "string" ? categorie : null}
            initialYear={typeof annee === "string" ? annee : null}
          />

          <div className="mt-12 pt-8 border-t flex justify-center" style={{ borderColor: "rgba(27,79,168,0.1)" }}>
            <Link
              href="/#actualites"
              className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl border-2 transition-all hover:bg-[#1B4FA8] hover:text-white"
              style={{ color: "#1B4FA8", borderColor: "#1B4FA8" }}
            >
              Voir la section actualités sur l'accueil
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
