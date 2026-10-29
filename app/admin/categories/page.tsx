import AdminPageHeader from "@/components/admin/admin-page-header"
import CategoriesManager from "@/components/admin/categories/categories-manager"
import { CATEGORY_COLORS, getCategories } from "@/lib/categories-db"
import { requireUserPage } from "@/lib/admin-page-auth"

export const metadata = { title: "Catégories — Administration" }

export default async function AdminCategoriesPage() {
  await requireUserPage()
  const categories = await getCategories()

  return (
    <>
      <AdminPageHeader
        title="Catégories"
        subtitle={`${categories.length} catégorie${categories.length !== 1 ? "s" : ""}`}
      />
      <div className="mx-auto w-full max-w-4xl p-4 sm:p-6">
        <CategoriesManager
          palette={CATEGORY_COLORS}
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            color: c.color,
            fromWordpress: c.wp_id !== null,
            articleCount: c.article_count,
          }))}
        />
      </div>
    </>
  )
}
