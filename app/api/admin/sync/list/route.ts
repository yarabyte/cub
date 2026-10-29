import { NextResponse } from "next/server"
import { requireAdminRole } from "@/lib/admin-auth"
import { listPosts } from "@/lib/wordpress"
import { getExistingWpIds } from "@/lib/articles-db"
import { parseIds, parseYear } from "../validation"

export async function POST(request: Request) {
  const auth = await requireAdminRole()
  if (auth instanceof NextResponse) return auth

  const body = await request.json().catch(() => ({}))
  const year = parseYear(body.year)
  const categoryIds = parseIds(body.categoryIds)
  if (!year || !categoryIds) {
    return NextResponse.json({ error: "Année ou catégories invalides" }, { status: 400 })
  }

  try {
    const posts = await listPosts(year, categoryIds)
    const existing = await getExistingWpIds(posts.map((p) => p.wpId))
    return NextResponse.json({
      posts: posts.map((p) => ({ wpId: p.wpId, title: p.title, date: p.date, exists: existing.has(p.wpId) })),
    })
  } catch (e) {
    console.error("Sync list error:", e)
    return NextResponse.json({ error: "Impossible de récupérer la liste des articles" }, { status: 502 })
  }
}
