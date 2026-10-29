import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin-auth"
import { categorySchema } from "@/lib/article-schema"
import { createCategory, getCategories } from "@/lib/categories-db"
import { jsonError } from "@/lib/article-request"

export async function GET() {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth
  try {
    return NextResponse.json({ categories: await getCategories() })
  } catch (e) {
    console.error("Categories list error:", e)
    return jsonError("Impossible de charger les catégories", 500)
  }
}

export async function POST(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const parsed = categorySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return jsonError(issue?.message ?? "Données invalides", 400, issue?.path[0]?.toString())
  }

  try {
    const id = await createCategory(parsed.data)
    return NextResponse.json({ id }, { status: 201 })
  } catch (e) {
    if ((e as { code?: string })?.code === "ER_DUP_ENTRY") {
      return jsonError("Ce slug est déjà utilisé par une autre catégorie", 409, "slug")
    }
    console.error("Category create error:", e)
    return jsonError("Impossible de créer la catégorie", 500)
  }
}
