import Link from "next/link"
import { notFound } from "next/navigation"
import { ExternalLink, Trash2 } from "lucide-react"
import AdminPageHeader from "@/components/admin/admin-page-header"
import ArticleForm from "@/components/admin/articles/article-form"
import { toCategoryOption } from "@/components/admin/articles/serialize"
import { Button } from "@/components/ui/button"
import { getArticleById } from "@/lib/articles-db"
import { getCategories } from "@/lib/categories-db"
import { toDateTimeLocal } from "@/lib/format-date"
import { requireUserPage } from "@/lib/admin-page-auth"

export const metadata = { title: "Modifier l’article — Administration" }

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUserPage()
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) notFound()
  const [article, categories] = await Promise.all([getArticleById(id), getCategories()])
  if (!article) notFound()

  const isPublic = article.status === "published" && !article.deleted_at

  return (
    <>
      <AdminPageHeader
        title="Modifier l’article"
        subtitle={article.source === "wordpress" ? "Importé depuis WordPress" : "Créé dans l’administration"}
        actions={
          isPublic ? (
            <Button variant="outline" asChild>
              <a href={`/actualites/${article.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                <span className="hidden sm:inline">Voir sur le site</span>
              </a>
            </Button>
          ) : undefined
        }
      />
      <div className="mx-auto w-full max-w-6xl space-y-4 p-4 sm:p-6">
        {article.deleted_at && (
          <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              <Trash2 className="size-4" /> Cet article est dans la corbeille et n’est pas visible sur le site.
            </span>
            <Link href="/admin/actualites" className="font-medium underline">
              Restaurer depuis la liste
            </Link>
          </div>
        )}
        <ArticleForm
          articleId={article.id}
          initialImageUrl={article.image_url}
          initialPhotos={article.photos}
          categories={categories.map(toCategoryOption)}
          initialValues={{
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt ?? "",
            content: article.content ?? "",
            status: article.status,
            publishedAt: toDateTimeLocal(article.published_at),
            authorName: article.author_name ?? "",
            featured: Boolean(article.featured),
            categoryIds: article.categoryIds,
            removeImage: false,
            photos: [],
          }}
        />
      </div>
    </>
  )
}
