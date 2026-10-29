import type { MetadataRoute } from "next"
import { getPublishedArticles, type PublicArticle } from "@/lib/articles-db"
import { DEMARCHES } from "@/lib/demarches"
import { getPublishedEvents } from "@/lib/events-db"
import { getGalleryAll } from "@/lib/gallery-db"
import { absoluteUrl } from "@/lib/site"

export const dynamic = "force-dynamic"

type Frequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>

const STATIC_PAGES: { path: string; priority: number; changeFrequency: Frequency }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/actualites", priority: 0.9, changeFrequency: "daily" },
  { path: "/demarches", priority: 0.9, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.8, changeFrequency: "yearly" },
  { path: "/suivi", priority: 0.7, changeFrequency: "yearly" },
  { path: "/presentation", priority: 0.7, changeFrequency: "yearly" },
  { path: "/mot-du-maire", priority: 0.7, changeFrequency: "yearly" },
  { path: "/municipalite/executif", priority: 0.7, changeFrequency: "yearly" },
  { path: "/municipalite/conseillers", priority: 0.6, changeFrequency: "yearly" },
  { path: "/municipalite/maires-delegues", priority: 0.5, changeFrequency: "yearly" },
  { path: "/organigramme", priority: 0.6, changeFrequency: "yearly" },
  { path: "/agenda", priority: 0.8, changeFrequency: "daily" },
  { path: "/mediatheque", priority: 0.6, changeFrequency: "weekly" },
  { path: "/mentions-legales", priority: 0.2, changeFrequency: "yearly" },
  { path: "/confidentialite", priority: 0.2, changeFrequency: "yearly" },
  { path: "/accessibilite", priority: 0.2, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.2, changeFrequency: "yearly" },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: PublicArticle[] = []
  try {
    articles = await getPublishedArticles()
  } catch (e) {
    console.error("Sitemap : actualités indisponibles :", e)
  }
  const latest = articles[0]?.published_at ?? undefined
  const galleryImages = (await getGalleryAll()).photos.map((p) => absoluteUrl(p.url))
  const events = await getPublishedEvents()

  return [
    ...STATIC_PAGES.map(({ path, priority, changeFrequency }) => ({
      url: absoluteUrl(path),
      priority,
      changeFrequency,
      lastModified: path === "/" || path === "/actualites" ? latest : undefined,
      images: path === "/mediatheque" && galleryImages.length > 0 ? galleryImages : undefined,
    })),
    ...DEMARCHES.map((d) => ({
      url: absoluteUrl(`/demarches/${d.slug}`),
      priority: 0.9,
      changeFrequency: "monthly" as const,
    })),
    ...articles.map((a) => ({
      url: absoluteUrl(`/actualites/${a.slug}`),
      lastModified: a.modified_at ?? a.published_at ?? undefined,
      priority: 0.6,
      changeFrequency: "monthly" as const,
      images: a.image_url ? [absoluteUrl(a.image_url)] : undefined,
    })),
    ...events.map((e) => ({
      url: absoluteUrl(`/agenda/${e.slug}`),
      lastModified: e.updatedAt ?? undefined,
      priority: 0.5,
      changeFrequency: "weekly" as const,
      images: e.imageUrl ? [absoluteUrl(e.imageUrl)] : undefined,
    })),
  ]
}
