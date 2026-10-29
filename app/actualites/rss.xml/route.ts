import { getPublishedArticles, type PublicArticle } from "@/lib/articles-db"
import { absoluteUrl, SITE } from "@/lib/site"
import { escapeXml, imageMimeType, xmlResponse } from "@/lib/xml"

export const dynamic = "force-dynamic"

const FEED_SIZE = 50

export async function GET() {
  let articles: PublicArticle[] = []
  try {
    articles = await getPublishedArticles({ limit: FEED_SIZE })
  } catch (e) {
    console.error("Flux RSS : actualités indisponibles :", e)
  }

  const feedUrl = absoluteUrl("/actualites/rss.xml")
  const lastBuild = articles[0]?.published_at ? new Date(articles[0].published_at) : new Date()

  const items = articles
    .map((a) => {
      const link = absoluteUrl(`/actualites/${a.slug}`)
      const lines = [
        `      <title>${escapeXml(a.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        a.published_at && `      <pubDate>${new Date(a.published_at).toUTCString()}</pubDate>`,
        `      <dc:creator>${escapeXml(a.author_name || SITE.organization)}</dc:creator>`,
        a.excerpt && `      <description>${escapeXml(a.excerpt)}</description>`,
        ...a.categories.map((c) => `      <category>${escapeXml(c.name)}</category>`),
        a.image_url &&
          `      <enclosure url="${escapeXml(absoluteUrl(a.image_url))}" type="${imageMimeType(a.image_url)}" length="0" />`,
      ].filter(Boolean)
      return `    <item>\n${lines.join("\n")}\n    </item>`
    })
    .join("\n")

  return xmlResponse(
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(`Actualités — ${SITE.name}`)}</title>
    <link>${escapeXml(absoluteUrl("/actualites"))}</link>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(`Les actualités officielles de la ${SITE.organization}.`)}</description>
    <language>fr-CM</language>
    <copyright>${escapeXml(`© ${new Date().getFullYear()} ${SITE.organization}`)}</copyright>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <image>
      <url>${escapeXml(absoluteUrl(SITE.logo))}</url>
      <title>${escapeXml(`Actualités — ${SITE.name}`)}</title>
      <link>${escapeXml(absoluteUrl("/actualites"))}</link>
    </image>
${items}
  </channel>
</rss>
`,
    "application/rss+xml"
  )
}
