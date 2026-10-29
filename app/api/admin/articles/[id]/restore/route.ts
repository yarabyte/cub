import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin-auth"
import { restoreArticle } from "@/lib/articles-db"
import { jsonError, parseId } from "@/lib/article-request"

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const id = parseId((await params).id)
  if (!id) return jsonError("Identifiant invalide", 400)

  try {
    if (!(await restoreArticle(id))) return jsonError("Article introuvable dans la corbeille", 404)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Article restore error:", e)
    return jsonError("Impossible de restaurer l'article", 500)
  }
}
