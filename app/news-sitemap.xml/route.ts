import { getPublishedArticles, type PublicArticle } from "@/lib/articles-db"
import { absoluteUrl, SITE } from "@/lib/site"
import { escapeXml, xmlResponse } from "@/lib/xml"

export const dynamic = "force-dynamic"

/** Google News only reads articles published in the last two days. */
const NEWS_WINDOW_MS = 2 * 24 * 60 * 60 * 1000

export async function GET() {
  let articles: PublicArticle[] = []
  try {
    articles = await getPublishedArticles({ limit: 100 })
  } catch (e) {
    console.error("Sitemap News : actualités indisponibles :", e)
  }
  const since = Date.now() - NEWS_WINDOW_MS
  const recent = articles.filter((a) => a.published_at && new Date(a.published_at).getTime() >= since)

  const urls = recent
    .map(
      (a) => `  <url>
    <loc>${escapeXml(absoluteUrl(`/actualites/${a.slug}`))}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE.name)}</news:name>
        <news:language>fr</news:language>
      </news:publication>
      <news:publication_date>${new Date(a.published_at!).toISOString()}</news:publication_date>
      <news:title>${escapeXml(a.title)}</news:title>
    </news:news>
  </url>`
    )
    .join("\n")

  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>
`)
}
