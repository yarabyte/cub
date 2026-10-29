import type { ArticleCategory } from "./articles-db"

const WP_API = "https://cubafoussam.cm/wp-json/wp/v2"
const REQUEST_TIMEOUT_MS = 30_000

export type WpCategoryCount = ArticleCategory & { count: number }

export type WpPostSummary = {
  wpId: number
  slug: string
  title: string
  date: string
  categoryIds: number[]
}

export type WpPost = {
  wpId: number
  slug: string
  title: string
  excerpt: string | null
  content: string | null
  publishedAt: Date | null
  modifiedAt: Date | null
  authorName: string | null
  categories: ArticleCategory[]
  featuredImageUrl: string | null
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…",
  ndash: "–", mdash: "—", laquo: "«", raquo: "»",
}

export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED_ENTITIES[name.toLowerCase()] ?? m)
}

function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim()
}

function yearBounds(year: number) {
  return { after: `${year}-01-01T00:00:00`, before: `${year + 1}-01-01T00:00:00` }
}

async function wpFetch(path: string, params: Record<string, string | number>): Promise<Response> {
  const url = new URL(`${WP_API}/${path}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
  if (!res.ok) throw new Error(`WordPress a répondu ${res.status} pour ${path}`)
  return res
}

export async function getCategoriesWithCounts(year: number): Promise<WpCategoryCount[]> {
  const res = await wpFetch("categories", { per_page: 100, hide_empty: "true", _fields: "id,slug,name" })
  const categories = (await res.json()) as { id: number; slug: string; name: string }[]
  const { after, before } = yearBounds(year)

  const counted = await Promise.all(
    categories.map(async (c) => {
      const r = await wpFetch("posts", { categories: c.id, after, before, per_page: 1, _fields: "id" })
      return { id: c.id, slug: c.slug, name: decodeEntities(c.name), count: Number(r.headers.get("x-wp-total") ?? 0) }
    })
  )
  return counted.filter((c) => c.count > 0).sort((a, b) => b.count - a.count)
}

export async function listPosts(year: number, categoryIds: number[]): Promise<WpPostSummary[]> {
  const { after, before } = yearBounds(year)
  const posts: WpPostSummary[] = []
  let page = 1
  let totalPages = 1
  do {
    const res = await wpFetch("posts", {
      categories: categoryIds.join(","),
      after,
      before,
      per_page: 100,
      page,
      orderby: "date",
      order: "desc",
      _fields: "id,slug,title,date,categories",
    })
    totalPages = Number(res.headers.get("x-wp-totalpages") ?? 1)
    const batch = (await res.json()) as { id: number; slug: string; title: { rendered: string }; date: string; categories: number[] }[]
    for (const p of batch) {
      posts.push({
        wpId: p.id,
        slug: p.slug,
        title: decodeEntities(p.title?.rendered ?? ""),
        date: p.date,
        categoryIds: p.categories ?? [],
      })
    }
    page += 1
  } while (page <= totalPages)

  const seen = new Set<number>()
  return posts.filter((p) => (seen.has(p.wpId) ? false : (seen.add(p.wpId), true)))
}

type RawPost = {
  id: number
  slug: string
  date?: string
  modified?: string
  title?: { rendered?: string }
  excerpt?: { rendered?: string }
  content?: { rendered?: string }
  _embedded?: {
    author?: { name?: string }[]
    "wp:featuredmedia"?: {
      source_url?: string
      media_details?: { sizes?: Record<string, { source_url?: string }> }
    }[]
    "wp:term"?: { id: number; slug: string; name: string; taxonomy: string }[][]
  }
}

export async function getPost(wpId: number): Promise<WpPost> {
  const res = await wpFetch(`posts/${wpId}`, { _embed: "author,wp:featuredmedia,wp:term" })
  const p = (await res.json()) as RawPost
  const media = p._embedded?.["wp:featuredmedia"]?.[0]
  const categories = (p._embedded?.["wp:term"] ?? [])
    .flat()
    .filter((t) => t.taxonomy === "category")
    .map((t) => ({ id: t.id, slug: t.slug, name: decodeEntities(t.name) }))

  return {
    wpId: p.id,
    slug: p.slug || String(p.id),
    title: decodeEntities(p.title?.rendered ?? ""),
    excerpt: stripHtml(p.excerpt?.rendered ?? "") || null,
    content: p.content?.rendered ?? null,
    publishedAt: p.date ? new Date(p.date) : null,
    modifiedAt: p.modified ? new Date(p.modified) : null,
    authorName: p._embedded?.author?.[0]?.name ?? null,
    categories,
    featuredImageUrl: media?.media_details?.sizes?.large?.source_url ?? media?.source_url ?? null,
  }
}
