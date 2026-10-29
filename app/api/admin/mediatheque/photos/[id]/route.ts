import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin-auth"
import { albumExists, deletePhoto, getPhotoById, updatePhoto } from "@/lib/gallery-db"
import { photoUpdateSchema } from "@/lib/gallery-schema"
import { parseJsonBody } from "@/lib/gallery-request"
import { jsonError, parseId } from "@/lib/article-request"
import { deleteMediaFile } from "@/lib/media-storage"

export const runtime = "nodejs"

type Context = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const id = parseId((await params).id)
  if (!id) return jsonError("Identifiant invalide", 400)
  const body = await parseJsonBody(request, photoUpdateSchema)
  if (body instanceof NextResponse) return body
  if (body.albumId && !(await albumExists(body.albumId))) return jsonError("Album introuvable", 404, "albumId")

  try {
    if (!(await updatePhoto(id, body))) return jsonError("Photo introuvable", 404)
    return NextResponse.json(await getPhotoById(id))
  } catch (e) {
    console.error("Gallery photo update error:", e)
    return jsonError("Impossible de modifier la photo", 500)
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const id = parseId((await params).id)
  if (!id) return jsonError("Identifiant invalide", 400)

  try {
    const url = await deletePhoto(id)
    if (url === null) return jsonError("Photo introuvable", 404)
    await deleteMediaFile(url)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Gallery photo delete error:", e)
    return jsonError("Impossible de supprimer la photo", 500)
  }
}
