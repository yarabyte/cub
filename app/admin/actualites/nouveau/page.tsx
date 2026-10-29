import AdminPageHeader from "@/components/admin/admin-page-header"
import ArticleForm from "@/components/admin/articles/article-form"
import { toCategoryOption } from "@/components/admin/articles/serialize"
import { getCategories } from "@/lib/categories-db"
import { requireUserPage } from "@/lib/admin-page-auth"

export const metadata = { title: "Nouvel article — Administration" }

export default async function NewArticlePage() {
  await requireUserPage()
  const categories = await getCategories()

  return (
    <>
      <AdminPageHeader title="Nouvel article" subtitle="Actualités" />
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <ArticleForm
          initialImageUrl={null}
          initialPhotos={[]}
          categories={categories.map(toCategoryOption)}
          initialValues={{
            title: "",
            slug: "",
            excerpt: "",
            content: "",
            status: "published",
            publishedAt: "",
            authorName: "",
            featured: false,
            categoryIds: [],
            removeImage: false,
            photos: [],
          }}
        />
      </div>
    </>
  )
}
