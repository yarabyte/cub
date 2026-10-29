import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin-auth"
import {
  deleteArticlePermanently,
  getArticleById,
  getArticlePhotos,
  replaceArticlePhotos,
  slugExists,
  trashArticle,
  updateArticle,
} from "@/lib/articles-db"
import { jsonError, parseArticleRequest, parseId, storeArticlePhotos, toArticleInput } from "@/lib/article-request"
import { deleteMediaFile, deleteMediaFiles, ImageUploadError, saveUploadedArticleImage } from "@/lib/media-storage"

export const runtime = "nodejs"

type Context = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Context) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const id = parseId((await params).id)
  if (!id) return jsonError("Identifiant invalide", 400)
  const existing = await getArticleById(id)
  if (!existing) return jsonError("Article introuvable", 404)

  const parsed = await parseArticleRequest(request)
  if (parsed instanceof NextResponse) return parsed
  const { values, image, photoFiles } = parsed

  if (await slugExists(values.slug, id)) {
    return jsonError("Ce slug est déjà utilisé par un autre article", 409, "slug")
  }

  let newImageUrl: string | null = null
  try {
    if (image) newImageUrl = await saveUploadedArticleImage(image)
  } catch (e) {
    if (e instanceof ImageUploadError) return jsonError(e.message, 400, "image")
    console.error("Article image upload error:", e)
    return jsonError("Impossible d'enregistrer l'image", 500, "image")
  }

  const stored = await storeArticlePhotos(values.photos, photoFiles)
  if (stored instanceof NextResponse) {
    await deleteMediaFile(newImageUrl)
    return stored
  }

  const imageUrl = newImageUrl ?? (values.removeImage ? null : existing.image_url)
  try {
    await updateArticle(id, toArticleInput(values, imageUrl), values.categoryIds)
  } catch (e) {
    await deleteMediaFile(newImageUrl)
    await deleteMediaFiles(stored.savedUrls)
    console.error("Article update error:", e)
    return jsonError("Impossible d'enregistrer l'article", 500)
  }
  if (existing.image_url && existing.image_url !== imageUrl) await deleteMediaFile(existing.image_url)

  try {
    await deleteMediaFiles(await replaceArticlePhotos(id, stored.photos))
  } catch (e) {
    await deleteMediaFiles(stored.savedUrls)
    console.error("Article photos save error:", e)
    return jsonError("L'article a été enregistré, mais pas ses photos", 500, "photos")
  }

  return NextResponse.json({ id, slug: values.slug, imageUrl, photos: await getArticlePhotos(id) })
}

export async function DELETE(request: Request, { params }: Context) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const id = parseId((await params).id)
  if (!id) return jsonError("Identifiant invalide", 400)

  try {
    if (new URL(request.url).searchParams.get("permanent") === "1") {
      const deleted = await deleteArticlePermanently(id)
      if (!deleted) return jsonError("Seuls les articles de la corbeille peuvent être supprimés définitivement", 409)
      await deleteMediaFile(deleted.imageUrl)
      await deleteMediaFiles(deleted.photoUrls)
      return NextResponse.json({ ok: true, permanent: true })
    }
    if (!(await trashArticle(id))) return jsonError("Article introuvable ou déjà dans la corbeille", 404)
    return NextResponse.json({ ok: true, permanent: false })
  } catch (e) {
    console.error("Article delete error:", e)
    return jsonError("Impossible de supprimer l'article", 500)
  }
}
