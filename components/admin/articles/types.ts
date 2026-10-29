import type { ArticleSource, ArticleStatus } from "@/lib/articles-db"

export type CategoryOption = { id: number; name: string; slug: string; color: string }

export type AdminArticleItem = {
  id: number
  slug: string
  title: string
  image_url: string | null
  publishedAt: string | null
  status: ArticleStatus
  source: ArticleSource
  featured: boolean
  deletedAt: string | null
  authorName: string | null
  categories: CategoryOption[]
}
