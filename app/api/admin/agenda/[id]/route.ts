import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin-auth"
import { deleteEvent, eventSlugExists, getEventById, updateEvent } from "@/lib/events-db"
import { jsonError, parseId } from "@/lib/article-request"
import { parseEventRequest, storeEventImage, toEventInput } from "@/lib/event-request"
import { deleteMediaFile } from "@/lib/media-storage"

export const runtime = "nodejs"

type Context = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Context) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const id = parseId((await params).id)
  if (!id) return jsonError("Identifiant invalide", 400)
  const existing = await getEventById(id)
  if (!existing) return jsonError("Événement introuvable", 404)

  const parsed = await parseEventRequest(request)
  if (parsed instanceof NextResponse) return parsed
  const { values, image } = parsed

  if (await eventSlugExists(values.slug, id)) {
    return jsonError("Ce slug est déjà utilisé par un autre événement", 409, "slug")
  }

  const newImageUrl = await storeEventImage(image)
  if (newImageUrl instanceof NextResponse) return newImageUrl

  const imageUrl = newImageUrl ?? (values.removeImage ? null : existing.imageUrl)
  try {
    await updateEvent(id, toEventInput(values, imageUrl))
  } catch (e) {
    await deleteMediaFile(newImageUrl)
    console.error("Event update error:", e)
    return jsonError("Impossible d'enregistrer l'événement", 500)
  }
  if (existing.imageUrl && existing.imageUrl !== imageUrl) await deleteMediaFile(existing.imageUrl)

  return NextResponse.json({ id, slug: values.slug, imageUrl })
}

export async function DELETE(_request: Request, { params }: Context) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const id = parseId((await params).id)
  if (!id) return jsonError("Identifiant invalide", 400)

  try {
    const imageUrl = await deleteEvent(id)
    if (imageUrl === undefined) return jsonError("Événement introuvable", 404)
    await deleteMediaFile(imageUrl)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Event delete error:", e)
    return jsonError("Impossible de supprimer l'événement", 500)
  }
}
