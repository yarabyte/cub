import type { AdminArticle, CategoryTag } from "@/lib/articles-db"
import type { AdminArticleItem, CategoryOption } from "./types"

const iso = (d: Date | null) => (d ? new Date(d).toISOString() : null)

export function toCategoryOption(c: CategoryTag): CategoryOption {
  return { id: c.id, name: c.name, slug: c.slug, color: c.color }
}

export function toAdminArticleItem(a: AdminArticle): AdminArticleItem {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    image_url: a.image_url,
    publishedAt: iso(a.published_at),
    status: a.status,
    source: a.source,
    featured: a.featured,
    deletedAt: iso(a.deleted_at),
    authorName: a.author_name,
    categories: a.categories.map(toCategoryOption),
  }
}
