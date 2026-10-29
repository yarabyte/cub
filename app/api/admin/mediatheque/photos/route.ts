import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin-auth"
import { addPhotos, albumExists, getPhotos } from "@/lib/gallery-db"
import { GALLERY_UPLOAD_MAX_FILES } from "@/lib/gallery-schema"
import { assertContentLength, GALLERY_MAX_BODY, jsonError, parseId } from "@/lib/article-request"
import { deleteMediaFiles, ImageUploadError, saveUploadedImage } from "@/lib/media-storage"

export const runtime = "nodejs"

const GALLERY_MAX_WIDTH = 1600

export async function GET() {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth
  return NextResponse.json(await getPhotos())
}

/** Multipart body: one or more `photos` files and an optional `albumId`. */
export async function POST(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const oversized = assertContentLength(request, GALLERY_MAX_BODY)
  if (oversized) return oversized
  const form = await request.formData().catch(() => null)
  if (!form) return jsonError("Requête invalide", 400)

  const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0)
  if (files.length === 0) return jsonError("Aucune photo reçue", 400, "photos")
  if (files.length > GALLERY_UPLOAD_MAX_FILES) {
    return jsonError(`${GALLERY_UPLOAD_MAX_FILES} photos maximum par envoi`, 400, "photos")
  }

  const rawAlbum = String(form.get("albumId") ?? "")
  const albumId = rawAlbum ? parseId(rawAlbum) : null
  if (rawAlbum && (!albumId || !(await albumExists(albumId)))) return jsonError("Album introuvable", 404, "albumId")

  const saved: string[] = []
  try {
    for (const file of files) saved.push(await saveUploadedImage(file, { dir: "mediatheque", maxWidth: GALLERY_MAX_WIDTH }))
  } catch (e) {
    await deleteMediaFiles(saved)
    if (e instanceof ImageUploadError) return jsonError(e.message, 400, "photos")
    console.error("Gallery photo upload error:", e)
    return jsonError("Impossible d'enregistrer les photos", 500, "photos")
  }

  try {
    const photos = await addPhotos(albumId, saved.map((url) => ({ url, caption: "" })))
    return NextResponse.json(photos, { status: 201 })
  } catch (e) {
    await deleteMediaFiles(saved)
    console.error("Gallery photos insert error:", e)
    return jsonError("Impossible d'enregistrer les photos", 500, "photos")
  }
}
