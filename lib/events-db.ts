import { getDb, query } from "./db"
import { todayInBafoussam } from "./event-format"

export type EventStatus = "draft" | "published"

export type EventRecord = {
  id: number
  slug: string
  title: string
  category: string | null
  location: string | null
  startDate: string
  endDate: string | null
  startTime: string | null
  endTime: string | null
  summary: string | null
  content: string | null
  imageUrl: string | null
  featured: boolean
  status: EventStatus
  updatedAt: Date | null
}

export type EventInput = Omit<EventRecord, "id" | "updatedAt">

type EventRow = {
  id: number
  slug: string
  title: string
  category: string | null
  location: string | null
  start_date: string
  end_date: string | null
  start_time: string | null
  end_time: string | null
  summary: string | null
  content: string | null
  image_url: string | null
  featured: number
  status: EventStatus
  updated_at: Date | null
}

/** Dates and times are formatted in SQL so the Node time zone cannot shift them. */
const COLUMNS = `id, slug, title, category, location,
  DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
  DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date,
  TIME_FORMAT(start_time, '%H:%i') AS start_time,
  TIME_FORMAT(end_time, '%H:%i') AS end_time,
  summary, content, image_url, featured, status, updated_at`

const ORDER_CHRONO = "start_date, start_time IS NOT NULL, start_time, id"

function toEvent(r: EventRow): EventRecord {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    location: r.location,
    startDate: r.start_date,
    endDate: r.end_date,
    startTime: r.start_time,
    endTime: r.end_time,
    summary: r.summary,
    content: r.content,
    imageUrl: r.image_url,
    featured: Boolean(r.featured),
    status: r.status,
    updatedAt: r.updated_at,
  }
}

function toParams(e: EventInput): (string | number | null)[] {
  return [
    e.slug,
    e.title,
    e.category || null,
    e.location || null,
    e.startDate,
    e.endDate || null,
    e.startTime || null,
    e.endTime || null,
    e.summary || null,
    e.content || null,
    e.imageUrl,
    e.featured ? 1 : 0,
    e.status,
  ]
}

/* ── Admin ── */

export async function getAdminEvents(): Promise<EventRecord[]> {
  const rows = await query<EventRow[]>(`SELECT ${COLUMNS} FROM events ORDER BY start_date DESC, start_time DESC, id DESC`)
  return rows.map(toEvent)
}

export async function getEventById(id: number): Promise<EventRecord | null> {
  const rows = await query<EventRow[]>(`SELECT ${COLUMNS} FROM events WHERE id = ? LIMIT 1`, [id])
  return rows[0] ? toEvent(rows[0]) : null
}

export async function eventSlugExists(slug: string, excludeId?: number): Promise<boolean> {
  const rows = await query<{ id: number }[]>("SELECT id FROM events WHERE slug = ? AND id <> ? LIMIT 1", [
    slug,
    excludeId ?? 0,
  ])
  return rows.length > 0
}

export async function createEvent(e: EventInput): Promise<number> {
  const res = await query<{ insertId: number }>(
    `INSERT INTO events (slug, title, category, location, start_date, end_date, start_time, end_time,
       summary, content, image_url, featured, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    toParams(e)
  )
  return res.insertId
}

export async function updateEvent(id: number, e: EventInput): Promise<boolean> {
  const res = await query<{ affectedRows: number }>(
    `UPDATE events SET slug = ?, title = ?, category = ?, location = ?, start_date = ?, end_date = ?,
       start_time = ?, end_time = ?, summary = ?, content = ?, image_url = ?, featured = ?, status = ?
     WHERE id = ?`,
    [...toParams(e), id]
  )
  return res.affectedRows > 0
}

/** Returns the image URL of the deleted event so its file can be removed, or `undefined` if not found. */
export async function deleteEvent(id: number): Promise<string | null | undefined> {
  const existing = await getEventById(id)
  if (!existing) return undefined
  await query("DELETE FROM events WHERE id = ?", [id])
  return existing.imageUrl
}

/** Categories already used, most frequent first, for the form suggestions. */
export async function getEventCategories(): Promise<string[]> {
  const rows = await query<{ category: string }[]>(
    "SELECT category FROM events WHERE category IS NOT NULL AND category <> '' GROUP BY category ORDER BY COUNT(*) DESC, category"
  )
  return rows.map((r) => r.category)
}

/* ── Public site ── */

async function publicQuery(sql: string, params: (string | number)[]): Promise<EventRecord[]> {
  if (!getDb()) return []
  try {
    return (await query<EventRow[]>(sql, params)).map(toEvent)
  } catch (e) {
    console.error("Agenda indisponible :", e)
    return []
  }
}

/** Published events not finished yet, soonest first. */
export function getUpcomingEvents(limit = 200): Promise<EventRecord[]> {
  return publicQuery(
    `SELECT ${COLUMNS} FROM events
     WHERE status = 'published' AND COALESCE(end_date, start_date) >= ?
     ORDER BY ${ORDER_CHRONO} LIMIT ${Math.floor(limit)}`,
    [todayInBafoussam()]
  )
}

/** Published events already over, most recent first. */
export function getPastEvents(limit = 30): Promise<EventRecord[]> {
  return publicQuery(
    `SELECT ${COLUMNS} FROM events
     WHERE status = 'published' AND COALESCE(end_date, start_date) < ?
     ORDER BY start_date DESC, start_time DESC, id DESC LIMIT ${Math.floor(limit)}`,
    [todayInBafoussam()]
  )
}

export async function getPublishedEventBySlug(slug: string): Promise<EventRecord | null> {
  const rows = await publicQuery(`SELECT ${COLUMNS} FROM events WHERE slug = ? AND status = 'published' LIMIT 1`, [slug])
  return rows[0] ?? null
}

export function getPublishedEvents(): Promise<EventRecord[]> {
  return publicQuery(`SELECT ${COLUMNS} FROM events WHERE status = 'published' ORDER BY start_date DESC`, [])
}

/** Home page: the featured upcoming event (or the next one) followed by the following ones. */
export async function getHomeEvents(count = 5): Promise<{ featured: EventRecord | null; rest: EventRecord[] }> {
  const upcoming = await getUpcomingEvents(50)
  const featured = upcoming.find((e) => e.featured) ?? upcoming[0] ?? null
  return { featured, rest: upcoming.filter((e) => e !== featured).slice(0, count - 1) }
}
