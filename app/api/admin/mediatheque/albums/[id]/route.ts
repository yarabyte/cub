import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin-auth"
import { deleteAlbum, renameAlbum } from "@/lib/gallery-db"
import { albumSchema } from "@/lib/gallery-schema"
import { parseJsonBody } from "@/lib/gallery-request"
import { jsonError, parseId } from "@/lib/article-request"

type Context = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const id = parseId((await params).id)
  if (!id) return jsonError("Identifiant invalide", 400)
  const body = await parseJsonBody(request, albumSchema)
  if (body instanceof NextResponse) return body

  try {
    const album = await renameAlbum(id, body.name)
    return album ? NextResponse.json(album) : jsonError("Album introuvable", 404)
  } catch (e) {
    console.error("Gallery album rename error:", e)
    return jsonError("Impossible de renommer l'album", 500)
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const id = parseId((await params).id)
  if (!id) return jsonError("Identifiant invalide", 400)

  try {
    if (!(await deleteAlbum(id))) return jsonError("Album introuvable", 404)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Gallery album delete error:", e)
    return jsonError("Impossible de supprimer l'album", 500)
  }
}
