import { getDb, query } from "./db"
import { setArticleCategories, upsertWpCategory } from "./categories-db"
import { formatArticleDate } from "./format-date"

export { formatArticleDate }

export type ArticleStatus = "draft" | "published"
export type ArticleSource = "wordpress" | "local"

export type ArticleRow = {
  id: number
  wp_id: number | null
  slug: string
  title: string
  excerpt: string | null
  image_url: string | null
  content: string | null
  published_at: Date | null
  wp_modified_at: Date | null
  author_name: string | null
  source: ArticleSource
  status: ArticleStatus
  featured: number
  deleted_at: Date | null
  created_at: Date
  updated_at: Date
}

/** Category as returned by the WordPress API. */
export type ArticleCategory = { id: number; slug: string; name: string }

/** Category attached to an article, with its badge color. */
export type CategoryTag = { id: number; slug: string; name: string; color: string }

export type PublicArticle = {
  id: number
  slug: string
  title: string
  excerpt: string | null
  image_url: string | null
  published_at: Date | null
  modified_at: Date | null
  date: string
  author_name: string | null
  featured: boolean
  categories: CategoryTag[]
}

export type ArticlePhoto = { id: number; url: string; caption: string | null }

/** A gallery entry to save: an existing photo of the article (`id`) or a newly stored file (`url`). */
export type ArticlePhotoInput = { id: number; caption: string | null } | { url: string; caption: string | null }

export type PublicArticleDetail = PublicArticle & { content: string | null; photos: ArticlePhoto[] }

export type AdminArticle = {
  id: number
  slug: string
  title: string
  image_url: string | null
  published_at: Date | null
  updated_at: Date
  author_name: string | null
  source: ArticleSource
  status: ArticleStatus
  featured: boolean
  deleted_at: Date | null
  categories: CategoryTag[]
}

export type AdminArticleDetail = ArticleRow & { categoryIds: number[]; photos: ArticlePhoto[] }

export type ArticleInput = {
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  status: ArticleStatus
  published_at: Date | null
  author_name: string | null
  featured: boolean
  image_url: string | null
}

export type ArticleForUpsert = {
  wp_id: number
  slug: string
  title: string
  excerpt: string | null
  image_url: string | null
  content: string | null
  published_at: Date | null
  wp_modified_at: Date | null
  author_name: string | null
  categories: ArticleCategory[]
}

export type ArticleStats = {
  total: number
  published: number
  drafts: number
  trashed: number
  lastPublishedAt: Date | null
  lastSyncedAt: Date | null
}

const VISIBLE = "a.status = 'published' AND a.deleted_at IS NULL"

function safeLimit(limit: number | undefined): string {
  if (limit == null) return ""
  const n = Math.max(1, Math.min(500, Math.floor(limit)))
  return ` LIMIT ${n}`
}

async function getCategoriesFor(articleIds: number[]): Promise<Map<number, CategoryTag[]>> {
  const map = new Map<number, CategoryTag[]>()
  if (articleIds.length === 0) return map
  const rows = await query<(CategoryTag & { article_id: number })[]>(
    `SELECT ac.article_id, c.id, c.slug, c.name, c.color
     FROM article_categories ac JOIN categories c ON c.id = ac.category_id
     WHERE ac.article_id IN (${articleIds.map(() => "?").join(",")})
     ORDER BY c.name`,
    articleIds
  )
  for (const { article_id, ...cat } of rows) {
    const list = map.get(article_id) ?? []
    list.push(cat)
    map.set(article_id, list)
  }
  return map
}

type PublicRow = Omit<PublicArticle, "date" | "featured" | "categories"> & { featured: number; content?: string | null }

async function toPublicArticles(rows: PublicRow[]): Promise<PublicArticle[]> {
  const cats = await getCategoriesFor(rows.map((r) => r.id))
  return rows.map(({ content: _content, ...r }) => ({
    ...r,
    featured: Boolean(r.featured),
    date: formatArticleDate(r.published_at),
    categories: cats.get(r.id) ?? [],
  }))
}

/** Imported articles get `updated_at` bumped by every sync, so their WordPress modification date is the meaningful one. */
const PUBLIC_COLUMNS = `a.id, a.slug, a.title, a.excerpt, a.image_url, a.published_at, a.author_name, a.featured,
  GREATEST(
    COALESCE(CASE WHEN a.source = 'wordpress' THEN a.wp_modified_at ELSE a.updated_at END, a.published_at, a.updated_at),
    COALESCE(a.published_at, a.updated_at)
  ) AS modified_at`

export async function getPublishedArticles(
  options: { categorySlug?: string; limit?: number; excludeId?: number } = {}
): Promise<PublicArticle[]> {
  if (!getDb()) return []
  const where = [VISIBLE]
  const params: (string | number)[] = []
  if (options.categorySlug) {
    where.push(
      "EXISTS (SELECT 1 FROM article_categories ac JOIN categories c ON c.id = ac.category_id WHERE ac.article_id = a.id AND c.slug = ?)"
    )
    params.push(options.categorySlug)
  }
  if (options.excludeId) {
    where.push("a.id <> ?")
    params.push(options.excludeId)
  }
  const rows = await query<PublicRow[]>(
    `SELECT ${PUBLIC_COLUMNS} FROM articles a WHERE ${where.join(" AND ")}
     ORDER BY a.published_at DESC${safeLimit(options.limit)}`,
    params
  )
  return toPublicArticles(rows)
}

/** Featured articles first, then the most recent ones. */
export async function getFeaturedArticles(limit: number): Promise<PublicArticle[]> {
  if (!getDb()) return []
  const rows = await query<PublicRow[]>(
    `SELECT ${PUBLIC_COLUMNS} FROM articles a WHERE ${VISIBLE}
     ORDER BY a.featured DESC, a.published_at DESC${safeLimit(limit)}`
  )
  return toPublicArticles(rows)
}

export async function getArticleBySlug(slug: string): Promise<PublicArticleDetail | null> {
  if (!getDb()) return null
  const rows = await query<PublicRow[]>(
    `SELECT ${PUBLIC_COLUMNS}, a.content FROM articles a WHERE a.slug = ? AND ${VISIBLE} LIMIT 1`,
    [slug]
  )
  if (rows.length === 0) return null
  const [[article], photos] = await Promise.all([toPublicArticles(rows), getArticlePhotos(rows[0].id)])
  return { ...article, content: rows[0].content ?? null, photos }
}

export async function getArticleStats(): Promise<ArticleStats> {
  const empty = { total: 0, published: 0, drafts: 0, trashed: 0, lastPublishedAt: null, lastSyncedAt: null }
  if (!getDb()) return empty
  const rows = await query<Record<string, number | string | Date | null>[]>(
    `SELECT
       SUM(deleted_at IS NULL) AS total,
       SUM(deleted_at IS NULL AND status = 'published') AS published,
       SUM(deleted_at IS NULL AND status = 'draft') AS drafts,
       SUM(deleted_at IS NOT NULL) AS trashed,
       MAX(CASE WHEN deleted_at IS NULL AND status = 'published' THEN published_at END) AS last_published,
       MAX(CASE WHEN source = 'wordpress' THEN created_at END) AS last_synced
     FROM articles`
  )
  const r = rows[0]
  if (!r) return empty
  return {
    total: Number(r.total ?? 0),
    published: Number(r.published ?? 0),
    drafts: Number(r.drafts ?? 0),
    trashed: Number(r.trashed ?? 0),
    lastPublishedAt: (r.last_published as Date | null) ?? null,
    lastSyncedAt: (r.last_synced as Date | null) ?? null,
  }
}

// ---------- Admin ----------

export async function getAdminArticles(): Promise<AdminArticle[]> {
  if (!getDb()) return []
  const rows = await query<(Omit<AdminArticle, "featured" | "categories"> & { featured: number })[]>(
    `SELECT id, slug, title, image_url, published_at, updated_at, author_name, source, status, featured, deleted_at
     FROM articles ORDER BY published_at DESC, id DESC`
  )
  const cats = await getCategoriesFor(rows.map((r) => r.id))
  return rows.map((r) => ({ ...r, featured: Boolean(r.featured), categories: cats.get(r.id) ?? [] }))
}

export async function getArticleById(id: number): Promise<AdminArticleDetail | null> {
  const rows = await query<ArticleRow[]>("SELECT * FROM articles WHERE id = ? LIMIT 1", [id])
  if (rows.length === 0) return null
  const [links, photos] = await Promise.all([
    query<{ category_id: number }[]>("SELECT category_id FROM article_categories WHERE article_id = ?", [id]),
    getArticlePhotos(id),
  ])
  return { ...rows[0], categoryIds: links.map((l) => l.category_id), photos }
}

export async function getArticlePhotos(articleId: number): Promise<ArticlePhoto[]> {
  return query<ArticlePhoto[]>(
    "SELECT id, url, caption FROM article_photos WHERE article_id = ? ORDER BY position, id",
    [articleId]
  )
}

/**
 * Makes the article gallery match `items`, in that order. Ids that do not belong to the article are ignored.
 * Returns the URLs of the photos removed from the gallery, whose files can then be deleted.
 */
export async function replaceArticlePhotos(articleId: number, items: ArticlePhotoInput[]): Promise<string[]> {
  const db = getDb()
  if (!db) throw new Error("MySQL not configured: set MYSQL_HOST and MYSQL_PASSWORD")
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    const [rows] = await conn.execute("SELECT id, url FROM article_photos WHERE article_id = ? FOR UPDATE", [articleId])
    const existing = new Map((rows as { id: number; url: string }[]).map((r) => [r.id, r.url]))
    const kept = new Set<number>()

    let position = 0
    for (const item of items) {
      if ("id" in item) {
        if (!existing.has(item.id) || kept.has(item.id)) continue
        kept.add(item.id)
        await conn.execute("UPDATE article_photos SET caption = ?, position = ? WHERE id = ?", [
          item.caption,
          position++,
          item.id,
        ])
      } else {
        await conn.execute("INSERT INTO article_photos (article_id, url, caption, position) VALUES (?, ?, ?, ?)", [
          articleId,
          item.url,
          item.caption,
          position++,
        ])
      }
    }

    const removed = [...existing].filter(([id]) => !kept.has(id))
    if (removed.length > 0) {
      await conn.execute(
        `DELETE FROM article_photos WHERE id IN (${removed.map(() => "?").join(",")})`,
        removed.map(([id]) => id)
      )
    }
    await conn.commit()
    return removed.map(([, url]) => url)
  } catch (e) {
    await conn.rollback().catch(() => {})
    throw e
  } finally {
    conn.release()
  }
}

export async function slugExists(slug: string, excludeId?: number): Promise<boolean> {
  const rows = await query<{ id: number }[]>(
    "SELECT id FROM articles WHERE slug = ? AND id <> ? LIMIT 1",
    [slug, excludeId ?? 0]
  )
  return rows.length > 0
}

/** Returns `base`, or `base-2`, `base-3`… if the slug is already used by another article. */
export async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
  let candidate = base
  for (let i = 2; await slugExists(candidate, excludeId); i++) {
    candidate = `${base.slice(0, 240)}-${i}`
  }
  return candidate
}

function inputParams(input: ArticleInput): (string | number | Date | null)[] {
  return [
    input.title,
    input.slug,
    input.excerpt,
    input.content,
    input.status,
    input.published_at,
    input.author_name,
    input.featured ? 1 : 0,
    input.image_url,
  ]
}

export async function createArticle(input: ArticleInput, categoryIds: number[]): Promise<number> {
  const res = await query<{ insertId: number }>(
    `INSERT INTO articles (title, slug, excerpt, content, status, published_at, author_name, featured, image_url, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'local')`,
    inputParams(input)
  )
  await setArticleCategories(res.insertId, categoryIds)
  return res.insertId
}

export async function updateArticle(id: number, input: ArticleInput, categoryIds: number[]): Promise<void> {
  await query(
    `UPDATE articles SET title = ?, slug = ?, excerpt = ?, content = ?, status = ?, published_at = ?,
       author_name = ?, featured = ?, image_url = ?
     WHERE id = ?`,
    [...inputParams(input), id]
  )
  await setArticleCategories(id, categoryIds)
}

export async function trashArticle(id: number): Promise<boolean> {
  const res = await query<{ affectedRows: number }>(
    "UPDATE articles SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL",
    [id]
  )
  return res.affectedRows > 0
}

export async function restoreArticle(id: number): Promise<boolean> {
  const res = await query<{ affectedRows: number }>(
    "UPDATE articles SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL",
    [id]
  )
  return res.affectedRows > 0
}

/**
 * Deletes an article that is already in the trash, with its gallery.
 * Returns its image and photo URLs, or false if nothing was deleted.
 */
export async function deleteArticlePermanently(
  id: number
): Promise<{ imageUrl: string | null; photoUrls: string[] } | false> {
  const rows = await query<{ image_url: string | null }[]>(
    "SELECT image_url FROM articles WHERE id = ? AND deleted_at IS NOT NULL LIMIT 1",
    [id]
  )
  if (rows.length === 0) return false
  const photos = await getArticlePhotos(id)
  await query("DELETE FROM articles WHERE id = ? AND deleted_at IS NOT NULL", [id])
  return { imageUrl: rows[0].image_url, photoUrls: photos.map((p) => p.url) }
}

// ---------- WordPress sync ----------

export async function getExistingWpIds(wpIds: number[]): Promise<Set<number>> {
  if (wpIds.length === 0) return new Set()
  const placeholders = wpIds.map(() => "?").join(",")
  const rows = await query<{ wp_id: number }[]>(
    `SELECT wp_id FROM articles WHERE wp_id IN (${placeholders})`,
    wpIds
  )
  return new Set((Array.isArray(rows) ? rows : []).map((r) => Number(r.wp_id)))
}

export async function articleExists(wpId: number): Promise<boolean> {
  return (await getExistingWpIds([wpId])).has(wpId)
}

export async function insertArticle(a: ArticleForUpsert): Promise<void> {
  const res = await query<{ insertId: number }>(
    `INSERT INTO articles
      (wp_id, slug, title, excerpt, image_url, content, published_at, wp_modified_at, author_name, categories, source, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'wordpress', 'published')`,
    [
      a.wp_id,
      a.slug,
      a.title,
      a.excerpt,
      a.image_url,
      a.content,
      a.published_at,
      a.wp_modified_at,
      a.author_name,
      JSON.stringify(a.categories),
    ]
  )
  const categoryIds: number[] = []
  for (const cat of a.categories) categoryIds.push(await upsertWpCategory(cat))
  await setArticleCategories(res.insertId, categoryIds)
}

/** Deletes every article imported from WordPress (local articles are kept). Returns their image URLs. */
export async function purgeWordpressArticles(): Promise<{ deleted: number; imageUrls: string[] }> {
  const rows = await query<{ image_url: string | null }[]>(
    "SELECT image_url FROM articles WHERE source = 'wordpress'"
  )
  const result = await query<{ affectedRows?: number }>("DELETE FROM articles WHERE source = 'wordpress'")
  return {
    deleted: Number(result?.affectedRows ?? 0),
    imageUrls: rows.map((r) => r.image_url).filter((u): u is string => Boolean(u)),
  }
}
