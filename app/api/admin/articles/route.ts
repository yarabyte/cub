import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin-auth"
import { createArticle, replaceArticlePhotos, uniqueSlug } from "@/lib/articles-db"
import { jsonError, parseArticleRequest, storeArticlePhotos, toArticleInput } from "@/lib/article-request"
import { deleteMediaFile, deleteMediaFiles, ImageUploadError, saveUploadedArticleImage } from "@/lib/media-storage"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const parsed = await parseArticleRequest(request)
  if (parsed instanceof NextResponse) return parsed
  const { values, image, photoFiles } = parsed

  let imageUrl: string | null = null
  try {
    if (image) imageUrl = await saveUploadedArticleImage(image)
  } catch (e) {
    if (e instanceof ImageUploadError) return jsonError(e.message, 400, "image")
    console.error("Article image upload error:", e)
    return jsonError("Impossible d'enregistrer l'image", 500, "image")
  }

  const stored = await storeArticlePhotos(values.photos, photoFiles)
  if (stored instanceof NextResponse) {
    await deleteMediaFile(imageUrl)
    return stored
  }

  let id: number
  let slug: string
  try {
    const input = toArticleInput({ ...values, slug: await uniqueSlug(values.slug) }, imageUrl)
    id = await createArticle(input, values.categoryIds)
    slug = input.slug
  } catch (e) {
    await deleteMediaFile(imageUrl)
    await deleteMediaFiles(stored.savedUrls)
    console.error("Article create error:", e)
    return jsonError("Impossible de créer l'article", 500)
  }

  try {
    await replaceArticlePhotos(id, stored.photos)
  } catch (e) {
    await deleteMediaFiles(stored.savedUrls)
    console.error("Article photos save error:", e)
    return NextResponse.json(
      { id, slug, photosError: "L'article a été créé, mais ses photos n'ont pas pu être enregistrées" },
      { status: 201 }
    )
  }
  return NextResponse.json({ id, slug }, { status: 201 })
}
