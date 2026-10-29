import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin-auth"
import { createEvent, eventSlugExists } from "@/lib/events-db"
import { jsonError } from "@/lib/article-request"
import { parseEventRequest, storeEventImage, toEventInput } from "@/lib/event-request"
import { deleteMediaFile } from "@/lib/media-storage"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const parsed = await parseEventRequest(request)
  if (parsed instanceof NextResponse) return parsed
  const { values, image } = parsed

  if (await eventSlugExists(values.slug)) {
    return jsonError("Ce slug est déjà utilisé par un autre événement", 409, "slug")
  }

  const imageUrl = await storeEventImage(image)
  if (imageUrl instanceof NextResponse) return imageUrl

  try {
    const id = await createEvent(toEventInput(values, imageUrl))
    return NextResponse.json({ id, slug: values.slug }, { status: 201 })
  } catch (e) {
    await deleteMediaFile(imageUrl)
    console.error("Event create error:", e)
    return jsonError("Impossible de créer l'événement", 500)
  }
}
