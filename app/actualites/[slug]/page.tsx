import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Calendar, Clock, ImageOff, RefreshCw, User } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ShareButtons from "@/components/share-buttons"
import ArticlePhotoGallery from "@/components/article-photo-gallery"
import CategoryBadge from "@/components/category-badge"
import { SectionLabel, BandeBamileke, RangeePerles } from "@/components/bamileke-pattern"
import { cache } from "react"
import type { Metadata } from "next"
import { getArticleBySlug, getPublishedArticles, type PublicArticle, type PublicArticleDetail } from "@/lib/articles-db"
import { formatArticleDate } from "@/lib/format-date"
import { sanitizeArticleHtml } from "@/lib/sanitize-article-html"
import { absoluteUrl, RSS_ALTERNATE, SITE } from "@/lib/site"
import JsonLd from "@/components/json-ld"
import { breadcrumbSchema, newsArticleSchema } from "@/lib/structured-data"

export const dynamic = "force-dynamic"

const loadArticle = cache((slug: string) => getArticleBySlug(slug).catch(() => null))

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " }

function htmlToParagraphs(html: string | null): string[] {
  if (!html) return []
  return sanitizeArticleHtml(html)
    .replace(/<\/(p|h[1-6]|li|blockquote)>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, code: string) => {
      if (code[0] !== "#") return ENTITIES[code.toLowerCase()] ?? m
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
      return Number.isFinite(n) ? String.fromCodePoint(n) : m
    })
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)
}

function readingTime(paragraphs: string[]): string {
  const words = paragraphs.join(" ").split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} min`
}

async function getRelated(article: PublicArticle): Promise<PublicArticle[]> {
  const related: PublicArticle[] = []
  for (const cat of article.categories) {
    if (related.length >= 5) break
    const list = await getPublishedArticles({ categorySlug: cat.slug, excludeId: article.id, limit: 5 })
    for (const a of list) if (!related.some((r) => r.id === a.id)) related.push(a)
  }
  if (related.length < 5) {
    const latest = await getPublishedArticles({ excludeId: article.id, limit: 10 })
    for (const a of latest) if (related.length < 5 && !related.some((r) => r.id === a.id)) related.push(a)
  }
  return related.slice(0, 5)
}

function articleDescription(article: PublicArticleDetail): string {
  const text = (article.excerpt || htmlToParagraphs(article.content)[0] || "").replace(/\s+/g, " ").trim()
  return text.length > 160 ? `${text.slice(0, 157).replace(/\s+\S*$/, "")}…` : text
}

/** Shows the update date only when the article was changed at least a day after publication. */
function updatedDate(article: PublicArticle): Date | null {
  const { published_at: published, modified_at: modified } = article
  if (!published || !modified) return null
  return new Date(modified).getTime() - new Date(published).getTime() > 86_400_000 ? new Date(modified) : null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await loadArticle(slug)
  if (!article) return { title: "Actualité introuvable", robots: { index: false } }
  const description = articleDescription(article) || undefined
  const path = `/actualites/${article.slug}`
  const author = article.author_name || SITE.organization
  return {
    title: article.title,
    description,
    authors: [{ name: author }],
    alternates: { canonical: path, types: RSS_ALTERNATE },
    openGraph: {
      type: "article",
      url: path,
      title: article.title,
      description,
      siteName: SITE.name,
      locale: SITE.locale,
      publishedTime: article.published_at ? new Date(article.published_at).toISOString() : undefined,
      modifiedTime: article.modified_at ? new Date(article.modified_at).toISOString() : undefined,
      authors: [author],
      section: article.categories[0]?.name,
      tags: article.categories.map((c) => c.name),
    },
    twitter: { card: "summary_large_image", title: article.title, description },
  }
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await loadArticle(slug)
  if (!article) notFound()

  const related = await getRelated(article)
  const paragraphs = htmlToParagraphs(article.content)
  const author = article.author_name || SITE.organization
  const updated = updatedDate(article)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FAFF" }}>
      <Navbar />
      <JsonLd
        data={[
          newsArticleSchema(article, articleDescription(article)),
          breadcrumbSchema([{ name: "Actualités", path: "/actualites" }, { name: article.title }]),
        ]}
      />

      <div
        className="relative w-full overflow-hidden h-[460px] md:h-[580px] lg:h-[660px]"
        style={{ backgroundColor: "#0D2F6E" }}
      >
        {article.image_url && (
          <Image src={article.image_url} alt={article.title} fill className="object-cover" priority sizes="100vw" />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,26,46,0.95) 0%, rgba(13,26,46,0.50) 50%, rgba(13,26,46,0.20) 100%)" }} />
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-losange" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M32 6L58 32L32 58L6 32Z" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.08" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-losange)" />
          </svg>
        </div>
        <div className="absolute top-0 left-0 right-0 flex h-2" aria-hidden="true">
          <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ width: 10, backgroundColor: i % 2 === 0 ? "#F5C200" : "white" }} />
          ))}
          <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-6 pb-10">
          {article.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {article.categories.map((c) => (
                <Link key={c.id} href={`/actualites?categorie=${c.slug}`}>
                  <CategoryBadge category={c} onDark />
                </Link>
              ))}
            </div>
          )}
          <h1 className="max-w-4xl text-3xl md:text-4xl font-black text-white text-balance leading-tight">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-5 mt-4">
            {article.date && (
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                <Calendar className="w-3.5 h-3.5" style={{ color: "#F5C200" }} />
                <time dateTime={article.published_at ? new Date(article.published_at).toISOString() : undefined}>{article.date}</time>
              </span>
            )}
            {updated && (
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                <RefreshCw className="w-3.5 h-3.5" style={{ color: "#F5C200" }} />
                Mis à jour le <time dateTime={updated.toISOString()}>{formatArticleDate(updated)}</time>
              </span>
            )}
            <span className="flex items-center gap-1.5 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
              <Clock className="w-3.5 h-3.5" style={{ color: "#F5C200" }} />
              Lecture : {readingTime(paragraphs)}
            </span>
            <span className="flex items-center gap-1.5 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
              <User className="w-3.5 h-3.5" style={{ color: "#F5C200" }} />
              {author}
            </span>
          </div>
        </div>
      </div>

      <nav aria-label="Fil d'ariane" style={{ backgroundColor: "white", borderBottom: "1px solid rgba(27,79,168,0.10)" }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
          <Link href="/" className="hover:underline font-medium" style={{ color: "#1B4FA8" }}>Accueil</Link>
          <span aria-hidden="true">/</span>
          <Link href="/actualites" className="hover:underline">Actualités</Link>
          <span aria-hidden="true">/</span>
          <span className="line-clamp-1" style={{ color: "#0D1A2E" }} aria-current="page">{article.title}</span>
        </div>
      </nav>

      <main className="flex-1 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <article className="lg:col-span-2 min-w-0">
              <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(27,79,168,0.12)" }}>
                <BandeBamileke className="h-1.5" />
                <div className="p-6 sm:p-8">
                  {article.excerpt && (
                    <p className="text-base leading-relaxed font-semibold mb-6" style={{ color: "#0D1A2E", borderLeft: "3px solid #1B4FA8", paddingLeft: "1rem" }}>
                      {article.excerpt}
                    </p>
                  )}
                  {article.content && (
                    <div
                      className="article-content text-base leading-relaxed break-words"
                      style={{ color: "#374151" }}
                      dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.content) }}
                    />
                  )}
                </div>
                <div className="flex h-1.5" aria-hidden="true">
                  <div style={{ width: "20%", backgroundColor: "#F5C200" }} />
                  <div style={{ width: "10%", backgroundColor: "white" }} />
                  <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
                </div>
              </div>

              {article.photos.length > 0 && <ArticlePhotoGallery photos={article.photos} title={article.title} />}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-8 px-5 py-4 rounded-xl border" style={{ backgroundColor: "white", borderColor: "rgba(27,79,168,0.12)" }}>
                <div className="flex items-center gap-2 shrink-0">
                  <RangeePerles count={4} color="#F5C200" size={5} gap={6} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Partager</span>
                </div>
                <ShareButtons
                  url={absoluteUrl(`/actualites/${article.slug}`)}
                  title={article.title}
                  print={{ date: article.date, author, paragraphs }}
                />
              </div>
            </article>

            <aside className="flex flex-col gap-6">
              {related.length > 0 && (
                <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(27,79,168,0.12)" }}>
                  <div className="px-5 py-3.5" style={{ backgroundColor: "#1B4FA8" }}>
                    <div className="flex items-center gap-1.5 mb-1" aria-hidden="true">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-full" style={{ width: 5, height: 5, backgroundColor: i % 2 === 0 ? "#F5C200" : "rgba(255,255,255,0.5)" }} />
                      ))}
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-white">Articles similaires</h2>
                  </div>
                  <ul className="divide-y p-2" style={{ borderColor: "rgba(27,79,168,0.08)" }}>
                    {related.map((rel) => (
                      <li key={rel.id}>
                        <Link href={`/actualites/${rel.slug}`} className="group flex gap-3 p-3 rounded-xl transition-colors hover:bg-blue-50">
                          <div className="relative w-16 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                            {rel.image_url ? (
                              <Image src={rel.image_url} alt="" fill className="object-cover" sizes="64px" />
                            ) : (
                              <ImageOff className="absolute inset-0 m-auto w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {rel.categories[0] && <CategoryBadge category={rel.categories[0]} className="mb-1 px-1.5 text-[9px]" />}
                            <p className="text-xs font-semibold leading-snug text-balance line-clamp-3 group-hover:text-primary" style={{ color: "#0D1A2E" }}>
                              {rel.title}
                            </p>
                            <span className="flex items-center gap-1 text-[10px] mt-1" style={{ color: "#94a3b8" }}>
                              <Calendar className="w-2.5 h-2.5" />
                              {rel.date}
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <BandeBamileke className="h-1.5" />
                </div>
              )}

              <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "#0B2B6B", borderColor: "rgba(245,194,0,0.20)" }}>
                <div className="relative p-5">
                  <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="side-losange" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M20 3L37 20L20 37L3 20Z" fill="none" stroke="#F5C200" strokeWidth="0.5" strokeOpacity="0.15" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#side-losange)" />
                    </svg>
                  </div>
                  <div className="relative">
                    <SectionLabel><span style={{ color: "#F5C200" }}>Démarches administratives</span></SectionLabel>
                    <p className="text-xs leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.70)" }}>
                      Pièces à fournir, lieux de dépôt et délais pour vos actes d'état civil.
                    </p>
                    <Link href="/demarches" className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-3 rounded-xl transition-opacity hover:opacity-90" style={{ backgroundColor: "#F5C200", color: "#0B2B6B" }}>
                      Voir les démarches
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
