import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin-auth"
import { createAlbum, getAlbums } from "@/lib/gallery-db"
import { albumSchema } from "@/lib/gallery-schema"
import { parseJsonBody } from "@/lib/gallery-request"
import { jsonError } from "@/lib/article-request"

export async function GET() {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth
  return NextResponse.json(await getAlbums())
}

export async function POST(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const body = await parseJsonBody(request, albumSchema)
  if (body instanceof NextResponse) return body

  try {
    return NextResponse.json({ ...(await createAlbum(body.name)), photoCount: 0 }, { status: 201 })
  } catch (e) {
    console.error("Gallery album create error:", e)
    return jsonError("Impossible de créer l'album", 500)
  }
}
