import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin-auth"
import { getMayorMessage, saveMayorMessage } from "@/lib/settings-db"
import { mayorMessageSchema } from "@/lib/mayor-message-schema"
import { assertContentLength, jsonError, SINGLE_IMAGE_MAX_BODY } from "@/lib/article-request"
import { deleteMediaFile, ImageUploadError, saveUploadedImage } from "@/lib/media-storage"

export const runtime = "nodejs"

export async function GET() {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth
  return NextResponse.json(await getMayorMessage())
}

/** Multipart body: `data` (JSON content) and an optional `photo` file replacing the current one. */
export async function PUT(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const oversized = assertContentLength(request, SINGLE_IMAGE_MAX_BODY)
  if (oversized) return oversized
  const form = await request.formData().catch(() => null)
  if (!form) return jsonError("Requête invalide", 400)

  let raw: unknown = null
  try {
    raw = JSON.parse(String(form.get("data") ?? ""))
  } catch {
    return jsonError("Requête invalide", 400)
  }

  const current = await getMayorMessage()
  const parsed = mayorMessageSchema.safeParse({ ...(raw as object), photo: current.photo })
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return jsonError(issue?.message ?? "Contenu invalide", 400, issue?.path.join("."))
  }

  const photo = form.get("photo")
  let newPhoto: string | null = null
  if (photo instanceof File && photo.size > 0) {
    try {
      newPhoto = await saveUploadedImage(photo, { dir: "maire" })
    } catch (e) {
      if (e instanceof ImageUploadError) return jsonError(e.message, 400, "photo")
      console.error("Mayor photo upload error:", e)
      return jsonError("Impossible d'enregistrer la photo", 500, "photo")
    }
  }

  try {
    const saved = await saveMayorMessage({ ...parsed.data, photo: newPhoto ?? current.photo })
    if (newPhoto) await deleteMediaFile(current.photo)
    return NextResponse.json(saved)
  } catch (e) {
    await deleteMediaFile(newPhoto)
    console.error("Mayor message save error:", e)
    return jsonError("Impossible d'enregistrer le mot du maire", 500)
  }
}
