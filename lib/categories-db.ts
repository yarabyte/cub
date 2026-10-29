import { query } from "./db"
import { slugify } from "./slugify"

export type Category = {
  id: number
  name: string
  slug: string
  color: string
  wp_id: number | null
}

export type CategoryWithCount = Category & { article_count: number }

/** Same palette as scripts/migrate-articles.js */
export const CATEGORY_COLORS = ["#1B4FA8", "#B45309", "#15803D", "#B91C1C", "#7C3AED", "#0E7490", "#0D2F6E", "#A16207"]

export const DEFAULT_CATEGORY_COLOR = CATEGORY_COLORS[0]

export async function getCategories(): Promise<CategoryWithCount[]> {
  const rows = await query<(Category & { article_count: number | string })[]>(
    `SELECT c.id, c.name, c.slug, c.color, c.wp_id, COUNT(a.id) AS article_count
     FROM categories c
     LEFT JOIN article_categories ac ON ac.category_id = c.id
     LEFT JOIN articles a ON a.id = ac.article_id AND a.deleted_at IS NULL
     GROUP BY c.id
     ORDER BY c.name`
  )
  return rows.map((r) => ({ ...r, article_count: Number(r.article_count) }))
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const rows = await query<Category[]>("SELECT id, name, slug, color, wp_id FROM categories WHERE id = ? LIMIT 1", [id])
  return rows[0] ?? null
}

async function nextColor(): Promise<string> {
  const rows = await query<{ n: number }[]>("SELECT COUNT(*) AS n FROM categories")
  return CATEGORY_COLORS[Number(rows[0]?.n ?? 0) % CATEGORY_COLORS.length]
}

export async function createCategory(input: { name: string; slug?: string; color?: string }): Promise<number> {
  const slug = input.slug || slugify(input.name)
  const color = input.color || (await nextColor())
  const res = await query<{ insertId: number }>("INSERT INTO categories (name, slug, color) VALUES (?, ?, ?)", [
    input.name,
    slug,
    color,
  ])
  return res.insertId
}

export async function updateCategory(id: number, input: { name: string; slug: string; color: string }): Promise<boolean> {
  const res = await query<{ affectedRows: number }>("UPDATE categories SET name = ?, slug = ?, color = ? WHERE id = ?", [
    input.name,
    input.slug,
    input.color,
    id,
  ])
  return res.affectedRows > 0
}

export async function deleteCategory(id: number): Promise<boolean> {
  const res = await query<{ affectedRows: number }>("DELETE FROM categories WHERE id = ?", [id])
  return res.affectedRows > 0
}

/** Finds the local category matching a WordPress category (by WP id, then slug) or creates it. */
export async function upsertWpCategory(cat: { id: number; slug: string; name: string }): Promise<number> {
  const found = await query<{ id: number; wp_id: number | null }[]>(
    "SELECT id, wp_id FROM categories WHERE wp_id = ? OR slug = ? ORDER BY wp_id = ? DESC LIMIT 1",
    [cat.id, cat.slug, cat.id]
  )
  if (found[0]) {
    if (found[0].wp_id == null) {
      await query("UPDATE categories SET wp_id = ? WHERE id = ?", [cat.id, found[0].id])
    }
    return found[0].id
  }
  const res = await query<{ insertId: number }>(
    "INSERT INTO categories (name, slug, color, wp_id) VALUES (?, ?, ?, ?)",
    [cat.name, cat.slug, await nextColor(), cat.id]
  )
  return res.insertId
}

export async function setArticleCategories(articleId: number, categoryIds: number[]): Promise<void> {
  await query("DELETE FROM article_categories WHERE article_id = ?", [articleId])
  const unique = [...new Set(categoryIds)]
  if (unique.length === 0) return
  await query(
    `INSERT IGNORE INTO article_categories (article_id, category_id)
     SELECT ?, id FROM categories WHERE id IN (${unique.map(() => "?").join(",")})`,
    [articleId, ...unique]
  )
}
