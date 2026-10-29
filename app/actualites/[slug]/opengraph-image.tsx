import { getArticleBySlug } from "@/lib/articles-db"
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og-image"

export const alt = "Actualité de la Ville de Bafoussam"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug).catch(() => null)
  if (!article) return renderOgCard({ eyebrow: "Actualités", title: "Les actualités de la Ville de Bafoussam" })
  return renderOgCard({
    eyebrow: article.categories[0]?.name ?? "Actualités",
    title: article.title,
    footer: article.date || undefined,
    imageSrc: article.image_url,
  })
}
