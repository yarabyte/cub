import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin-auth"
import { categorySchema } from "@/lib/article-schema"
import { deleteCategory, updateCategory } from "@/lib/categories-db"
import { jsonError, parseId } from "@/lib/article-request"

type Context = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Context) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const id = parseId((await params).id)
  if (!id) return jsonError("Identifiant invalide", 400)

  const parsed = categorySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return jsonError(issue?.message ?? "Données invalides", 400, issue?.path[0]?.toString())
  }

  try {
    if (!(await updateCategory(id, parsed.data))) return jsonError("Catégorie introuvable", 404)
    return NextResponse.json({ ok: true })
  } catch (e) {
    if ((e as { code?: string })?.code === "ER_DUP_ENTRY") {
      return jsonError("Ce slug est déjà utilisé par une autre catégorie", 409, "slug")
    }
    console.error("Category update error:", e)
    return jsonError("Impossible de modifier la catégorie", 500)
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const id = parseId((await params).id)
  if (!id) return jsonError("Identifiant invalide", 400)

  try {
    if (!(await deleteCategory(id))) return jsonError("Catégorie introuvable", 404)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Category delete error:", e)
    return jsonError("Impossible de supprimer la catégorie", 500)
  }
}
