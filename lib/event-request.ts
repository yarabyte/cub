import { NextResponse } from "next/server"
import { assertContentLength, jsonError, SINGLE_IMAGE_MAX_BODY } from "./article-request"
import { eventFormSchema, type EventFormValues } from "./event-schema"
import type { EventInput } from "./events-db"
import { ImageUploadError, saveUploadedImage } from "./media-storage"
import { isEmptyHtml, sanitizeArticleHtml } from "./sanitize-article-html"

/** Reads the multipart body sent by the event form: a `data` JSON field and an optional `image` file. */
export async function parseEventRequest(
  request: Request
): Promise<{ values: EventFormValues; image: File | null } | NextResponse> {
  const oversized = assertContentLength(request, SINGLE_IMAGE_MAX_BODY)
  if (oversized) return oversized
  const form = await request.formData().catch(() => null)
  if (!form) return jsonError("Requête invalide", 400)

  let raw: unknown
  try {
    raw = JSON.parse(String(form.get("data") ?? ""))
  } catch {
    return jsonError("Données invalides", 400)
  }

  const parsed = eventFormSchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return jsonError(issue?.message ?? "Données invalides", 400, issue?.path[0]?.toString())
  }
  const image = form.get("image")
  return { values: parsed.data, image: image instanceof File && image.size > 0 ? image : null }
}

/** Stores the uploaded event image; returns its URL, `null` without file, or an error response. */
export async function storeEventImage(image: File | null): Promise<string | null | NextResponse> {
  if (!image) return null
  try {
    return await saveUploadedImage(image, { dir: "agenda" })
  } catch (e) {
    if (e instanceof ImageUploadError) return jsonError(e.message, 400, "image")
    console.error("Event image upload error:", e)
    return jsonError("Impossible d'enregistrer l'image", 500, "image")
  }
}

export function toEventInput(values: EventFormValues, imageUrl: string | null): EventInput {
  const content = sanitizeArticleHtml(values.content)
  const endDate = values.endDate && values.endDate !== values.startDate ? values.endDate : null
  return {
    slug: values.slug,
    title: values.title,
    category: values.category || null,
    location: values.location || null,
    startDate: values.startDate,
    endDate,
    startTime: values.startTime || null,
    endTime: values.startTime ? values.endTime || null : null,
    summary: values.summary || null,
    content: isEmptyHtml(content) ? null : content,
    imageUrl,
    featured: values.featured,
    status: values.status,
  }
}
