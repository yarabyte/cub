import { getDb, query } from "./db"
import { slugify } from "./slugify"
import {
  GALLERY_HOME_LIMIT,
  type GalleryAlbum,
  type GalleryAlbumWithCount,
  type GalleryPhoto,
} from "./gallery-schema"

type PhotoRow = { id: number; url: string; caption: string | null; album_id: number | null }

const toPhoto = (r: PhotoRow): GalleryPhoto => ({ id: r.id, url: r.url, caption: r.caption ?? "", albumId: r.album_id })

function requireDb() {
  const db = getDb()
  if (!db) throw new Error("MySQL not configured: set MYSQL_HOST and MYSQL_PASSWORD")
  return db
}

/* ── Albums ── */

export async function getAlbums(): Promise<GalleryAlbumWithCount[]> {
  const rows = await query<(GalleryAlbum & { photo_count: number | string })[]>(
    `SELECT a.id, a.name, a.slug, COUNT(p.id) AS photo_count
     FROM gallery_albums a
     LEFT JOIN gallery_photos p ON p.album_id = a.id
     GROUP BY a.id
     ORDER BY a.position, a.id`
  )
  return rows.map(({ photo_count, ...a }) => ({ ...a, photoCount: Number(photo_count) }))
}

export async function albumExists(id: number): Promise<boolean> {
  const rows = await query<{ id: number }[]>("SELECT id FROM gallery_albums WHERE id = ? LIMIT 1", [id])
  return rows.length > 0
}

/** Derives a unique slug from the name, suffixing -2, -3… on collision. */
async function uniqueAlbumSlug(name: string, excludeId?: number): Promise<string> {
  const base = slugify(name).slice(0, 90) || "album"
  const rows = await query<{ slug: string }[]>(
    "SELECT slug FROM gallery_albums WHERE (slug = ? OR slug LIKE ?) AND id <> ?",
    [base, `${base}-%`, excludeId ?? 0]
  )
  const taken = new Set(rows.map((r) => r.slug))
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base}-${n}`)) n += 1
  return `${base}-${n}`
}

export async function createAlbum(name: string): Promise<GalleryAlbum> {
  const slug = await uniqueAlbumSlug(name)
  const res = await query<{ insertId: number }>(
    "INSERT INTO gallery_albums (name, slug, position) SELECT ?, ?, COALESCE(MAX(position), -1) + 1 FROM gallery_albums",
    [name, slug]
  )
  return { id: res.insertId, name, slug }
}

export async function renameAlbum(id: number, name: string): Promise<GalleryAlbum | null> {
  const slug = await uniqueAlbumSlug(name, id)
  const res = await query<{ affectedRows: number }>("UPDATE gallery_albums SET name = ?, slug = ? WHERE id = ?", [
    name,
    slug,
    id,
  ])
  return res.affectedRows > 0 ? { id, name, slug } : null
}

/** Photos of a deleted album are kept, without album. */
export async function deleteAlbum(id: number): Promise<boolean> {
  const res = await query<{ affectedRows: number }>("DELETE FROM gallery_albums WHERE id = ?", [id])
  return res.affectedRows > 0
}

export async function reorderAlbums(ids: number[]): Promise<void> {
  const conn = await requireDb().getConnection()
  try {
    await conn.beginTransaction()
    for (const [position, id] of ids.entries()) {
      await conn.execute("UPDATE gallery_albums SET position = ? WHERE id = ?", [position, id])
    }
    await conn.commit()
  } catch (e) {
    await conn.rollback().catch(() => {})
    throw e
  } finally {
    conn.release()
  }
}

export async function getGalleryStats(): Promise<{ albums: number; photos: number }> {
  const rows = await query<{ albums: number | string; photos: number | string }[]>(
    "SELECT (SELECT COUNT(*) FROM gallery_albums) AS albums, (SELECT COUNT(*) FROM gallery_photos) AS photos"
  )
  return { albums: Number(rows[0]?.albums ?? 0), photos: Number(rows[0]?.photos ?? 0) }
}

/* ── Photos ── */

export async function getPhotos(limit?: number): Promise<GalleryPhoto[]> {
  const rows = await query<PhotoRow[]>(
    `SELECT id, url, caption, album_id FROM gallery_photos ORDER BY position, id${limit ? ` LIMIT ${Math.floor(limit)}` : ""}`
  )
  return rows.map(toPhoto)
}

export async function getPhotoById(id: number): Promise<GalleryPhoto | null> {
  const rows = await query<PhotoRow[]>("SELECT id, url, caption, album_id FROM gallery_photos WHERE id = ? LIMIT 1", [id])
  return rows[0] ? toPhoto(rows[0]) : null
}

/** Inserts photos before all existing ones, keeping the given order. */
export async function addPhotos(albumId: number | null, items: { url: string; caption: string }[]): Promise<GalleryPhoto[]> {
  const conn = await requireDb().getConnection()
  try {
    await conn.beginTransaction()
    const [rows] = await conn.execute("SELECT COALESCE(MIN(position), 0) AS first FROM gallery_photos FOR UPDATE")
    let position = Number((rows as { first: number }[])[0].first) - items.length
    const created: GalleryPhoto[] = []
    for (const item of items) {
      const [res] = await conn.execute(
        "INSERT INTO gallery_photos (album_id, url, caption, position) VALUES (?, ?, ?, ?)",
        [albumId, item.url, item.caption || null, position++]
      )
      created.push({ id: (res as { insertId: number }).insertId, url: item.url, caption: item.caption, albumId })
    }
    await conn.commit()
    return created
  } catch (e) {
    await conn.rollback().catch(() => {})
    throw e
  } finally {
    conn.release()
  }
}

export async function updatePhoto(id: number, patch: { caption?: string; albumId?: number | null }): Promise<boolean> {
  const sets: string[] = []
  const params: (string | number | null)[] = []
  if (patch.caption !== undefined) {
    sets.push("caption = ?")
    params.push(patch.caption || null)
  }
  if (patch.albumId !== undefined) {
    sets.push("album_id = ?")
    params.push(patch.albumId)
  }
  if (sets.length === 0) return (await getPhotoById(id)) !== null
  const res = await query<{ affectedRows: number }>(`UPDATE gallery_photos SET ${sets.join(", ")} WHERE id = ?`, [
    ...params,
    id,
  ])
  return res.affectedRows > 0
}

/** Returns the URL of the deleted photo so its file can be removed. */
export async function deletePhoto(id: number): Promise<string | null> {
  const photo = await getPhotoById(id)
  if (!photo) return null
  await query("DELETE FROM gallery_photos WHERE id = ?", [id])
  return photo.url
}

/**
 * Reorders a subset of photos (e.g. those of one album) among the positions they already occupy,
 * so the relative order of the other photos is unchanged.
 */
export async function reorderPhotos(ids: number[]): Promise<void> {
  const unique = [...new Set(ids)]
  const conn = await requireDb().getConnection()
  try {
    await conn.beginTransaction()
    const [rows] = await conn.execute(
      `SELECT id, position FROM gallery_photos WHERE id IN (${unique.map(() => "?").join(",")}) FOR UPDATE`,
      unique
    )
    const found = rows as { id: number; position: number }[]
    const known = new Set(found.map((r) => r.id))
    const ordered = unique.filter((id) => known.has(id))
    const positions = found.map((r) => r.position).sort((a, b) => a - b)
    // Ties would make the order ambiguous: spread duplicates onto consecutive values.
    for (let i = 1; i < positions.length; i++) {
      if (positions[i] <= positions[i - 1]) positions[i] = positions[i - 1] + 1
    }
    for (const [i, id] of ordered.entries()) {
      await conn.execute("UPDATE gallery_photos SET position = ? WHERE id = ?", [positions[i], id])
    }
    await conn.commit()
  } catch (e) {
    await conn.rollback().catch(() => {})
    throw e
  } finally {
    conn.release()
  }
}

/* ── Public site ── */

export type GalleryData = { albums: GalleryAlbum[]; photos: GalleryPhoto[] }

/** Albums that contain at least one of the given photos, in album order. */
function albumsUsedBy(albums: GalleryAlbumWithCount[], photos: GalleryPhoto[]): GalleryAlbum[] {
  const used = new Set(photos.map((p) => p.albumId))
  return albums.filter((a) => used.has(a.id)).map(({ id, name, slug }) => ({ id, name, slug }))
}

async function loadGallery(limit?: number): Promise<GalleryData> {
  if (!getDb()) return { albums: [], photos: [] }
  try {
    const [albums, photos] = await Promise.all([getAlbums(), getPhotos(limit)])
    return { albums: albumsUsedBy(albums, photos), photos }
  } catch (e) {
    console.error("Médiathèque indisponible :", e)
    return { albums: [], photos: [] }
  }
}

export const getGalleryHome = () => loadGallery(GALLERY_HOME_LIMIT)
export const getGalleryAll = () => loadGallery()
