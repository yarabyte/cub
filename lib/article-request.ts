import { NextResponse } from "next/server"
import { articleFormSchema, type ArticleFormValues, type ArticlePhotoItem } from "./article-schema"
import type { ArticleInput, ArticlePhotoInput } from "./articles-db"
import { deleteMediaFiles, ImageUploadError, saveUploadedArticleImage } from "./media-storage"
import { isEmptyHtml, sanitizeArticleHtml } from "./sanitize-article-html"

export type ParsedArticleRequest = { values: ArticleFormValues; image: File | null; photoFiles: File[] }

export function jsonError(error: string, status: number, field?: string) {
  return NextResponse.json({ error, ...(field ? { field } : {}) }, { status })
}

const MB = 1024 * 1024

/** Main image + 12 gallery photos of 5 MB each, plus the JSON fields. */
export const ARTICLE_MAX_BODY = 70 * MB
/** One image of 5 MB plus the JSON fields (events, mayor message). */
export const SINGLE_IMAGE_MAX_BODY = 8 * MB
/** 20 photos of 5 MB each. */
export const GALLERY_MAX_BODY = 105 * MB

/** Rejects a request body that is missing a length or is too large, before it is read into memory. */
export function assertContentLength(request: Request, maxBytes: number): NextResponse | null {
  const length = Number(request.headers.get("content-length"))
  if (!Number.isFinite(length) || length <= 0) return jsonError("Taille de la requête inconnue", 411)
  if (length > maxBytes) return jsonError(`Envoi trop volumineux (${Math.round(maxBytes / MB)} Mo maximum)`, 413)
  return null
}

/** Reads the multipart body sent by the article form: a `data` JSON field, an optional `image` file and the new gallery files (`photos`). */
export async function parseArticleRequest(request: Request): Promise<ParsedArticleRequest | NextResponse> {
  const oversized = assertContentLength(request, ARTICLE_MAX_BODY)
  if (oversized) return oversized
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return jsonError("Requête invalide", 400)
  }

  let raw: unknown
  try {
    raw = JSON.parse(String(form.get("data") ?? ""))
  } catch {
    return jsonError("Données invalides", 400)
  }

  const parsed = articleFormSchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return jsonError(issue?.message ?? "Données invalides", 400, issue?.path[0]?.toString())
  }

  const photoFiles = form.getAll("photos").filter((f): f is File => f instanceof File)
  const uploads = parsed.data.photos.flatMap((p) => ("upload" in p ? [p.upload] : []))
  if (
    uploads.some((i) => i >= photoFiles.length) ||
    new Set(uploads).size !== uploads.length ||
    uploads.length !== photoFiles.length
  ) {
    return jsonError("Photos envoyées incohérentes", 400, "photos")
  }

  const image = form.get("image")
  return { values: parsed.data, image: image instanceof File && image.size > 0 ? image : null, photoFiles }
}

/**
 * Stores the new gallery files and returns the gallery to save, in form order, with the URLs written to disk.
 * On failure, the files already written are deleted.
 */
export async function storeArticlePhotos(
  items: ArticlePhotoItem[],
  files: File[]
): Promise<{ photos: ArticlePhotoInput[]; savedUrls: string[] } | NextResponse> {
  const savedUrls: string[] = []
  const photos: ArticlePhotoInput[] = []
  for (const [index, item] of items.entries()) {
    const caption = item.caption || null
    if ("id" in item) {
      photos.push({ id: item.id, caption })
      continue
    }
    try {
      const url = await saveUploadedArticleImage(files[item.upload])
      savedUrls.push(url)
      photos.push({ url, caption })
    } catch (e) {
      await deleteMediaFiles(savedUrls)
      if (e instanceof ImageUploadError) return jsonError(`Photo ${index + 1} : ${e.message}`, 400, "photos")
      console.error("Article photo upload error:", e)
      return jsonError("Impossible d'enregistrer les photos", 500, "photos")
    }
  }
  return { photos, savedUrls }
}

export function toArticleInput(values: ArticleFormValues, imageUrl: string | null): ArticleInput {
  const content = sanitizeArticleHtml(values.content)
  let publishedAt = values.publishedAt ? new Date(values.publishedAt) : null
  if (!publishedAt && values.status === "published") publishedAt = new Date()
  return {
    title: values.title,
    slug: values.slug,
    excerpt: values.excerpt || null,
    content: isEmptyHtml(content) ? null : content,
    status: values.status,
    published_at: publishedAt,
    author_name: values.authorName || null,
    featured: values.featured,
    image_url: imageUrl,
  }
}

export function parseId(value: string): number | null {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}
