import { NextResponse } from "next/server"
import { requireAdminRole } from "@/lib/admin-auth"
import { purgeWordpressArticles } from "@/lib/articles-db"
import { deleteMediaFiles } from "@/lib/media-storage"

export const runtime = "nodejs"

export async function POST() {
  const auth = await requireAdminRole()
  if (auth instanceof NextResponse) return auth

  try {
    const { deleted, imageUrls } = await purgeWordpressArticles()
    await deleteMediaFiles(imageUrls)
    return NextResponse.json({ ok: true, deleted })
  } catch (e) {
    console.error("Sync purge error:", e)
    return NextResponse.json({ error: "Impossible de vider la base" }, { status: 500 })
  }
}
