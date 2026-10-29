import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin-auth"
import { reorderPhotos } from "@/lib/gallery-db"
import { reorderSchema } from "@/lib/gallery-schema"
import { parseJsonBody } from "@/lib/gallery-request"
import { jsonError } from "@/lib/article-request"

export async function PUT(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const body = await parseJsonBody(request, reorderSchema)
  if (body instanceof NextResponse) return body

  try {
    await reorderPhotos(body.ids)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Gallery photos reorder error:", e)
    return jsonError("Impossible de réordonner les photos", 500)
  }
}
