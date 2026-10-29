import AdminPageHeader from "@/components/admin/admin-page-header"
import ArticlesManager from "@/components/admin/articles/articles-manager"
import NewArticleButton from "@/components/admin/articles/new-article-button"
import { getAdminArticles } from "@/lib/articles-db"
import { getCategories } from "@/lib/categories-db"
import { toAdminArticleItem, toCategoryOption } from "@/components/admin/articles/serialize"
import { requireUserPage } from "@/lib/admin-page-auth"

export const metadata = { title: "Actualités — Administration" }

export default async function AdminArticlesPage() {
  const user = await requireUserPage()
  const [articles, categories] = await Promise.all([getAdminArticles(), getCategories()])
  const live = articles.filter((a) => !a.deleted_at).length

  return (
    <>
      <AdminPageHeader
        title="Actualités"
        subtitle={`${live} article${live !== 1 ? "s" : ""}`}
        actions={<NewArticleButton />}
      />
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <ArticlesManager
          articles={articles.map(toAdminArticleItem)}
          categories={categories.map(toCategoryOption)}
          canSync={user.role === "admin"}
        />
      </div>
    </>
  )
}
