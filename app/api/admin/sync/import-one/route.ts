import { NextResponse } from "next/server"
import { requireAdminRole } from "@/lib/admin-auth"
import { getPost } from "@/lib/wordpress"
import { saveArticleImage } from "@/lib/media-storage"
import { articleExists, insertArticle } from "@/lib/articles-db"
import { sanitizeArticleHtml } from "@/lib/sanitize-article-html"
import type { ImportOneResult } from "@/lib/sync-types"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const auth = await requireAdminRole()
  if (auth instanceof NextResponse) return auth

  const body = await request.json().catch(() => ({}))
  const wpId = Number(body.wpId)
  if (!Number.isInteger(wpId) || wpId <= 0) {
    return NextResponse.json({ error: "Identifiant d'article invalide" }, { status: 400 })
  }

  const started = Date.now()
  const result = (partial: Omit<ImportOneResult, "wpId" | "ms">) =>
    NextResponse.json<ImportOneResult>({ ...partial, wpId, ms: Date.now() - started })

  try {
    if (await articleExists(wpId)) {
      return result({ status: "skipped", title: null, imageUrl: null, warning: null, reason: "Déjà importé" })
    }

    const post = await getPost(wpId)

    let imageUrl: string | null = null
    let warning: string | null = null
    if (post.featuredImageUrl) {
      try {
        imageUrl = await saveArticleImage(post.featuredImageUrl, post.wpId, post.slug, post.publishedAt)
      } catch (e) {
        console.error(`Sync image error (wp_id ${wpId}):`, e)
        warning = "Image non enregistrée"
      }
    } else {
      warning = "Aucune image à la une"
    }

    await insertArticle({
      wp_id: post.wpId,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      image_url: imageUrl,
      content: post.content ? sanitizeArticleHtml(post.content) || null : null,
      published_at: post.publishedAt,
      wp_modified_at: post.modifiedAt,
      author_name: post.authorName,
      categories: post.categories,
    })

    return result({ status: "imported", title: post.title, imageUrl, warning, reason: null })
  } catch (e) {
    const code = (e as { code?: string })?.code
    if (code === "ER_DUP_ENTRY" && (await articleExists(wpId))) {
      return result({ status: "skipped", title: null, imageUrl: null, warning: null, reason: "Déjà importé" })
    }
    const reason =
      code === "ER_DUP_ENTRY" ? "Un autre article utilise déjà ce slug" : "Import impossible (détails dans les journaux du serveur)"
    console.error(`Sync import-one error (wp_id ${wpId}):`, e)
    return result({ status: "error", title: null, imageUrl: null, warning: null, reason })
  }
}
