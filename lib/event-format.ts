/** Pure date helpers for the agenda, usable on the server and in the browser. */

export const EVENT_TIME_ZONE = "Africa/Douala"
const UTC_OFFSET = "+01:00"

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
const MONTHS_SHORT = ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"]

export type EventDates = {
  startDate: string
  endDate: string | null
  startTime: string | null
  endTime: string | null
}

/** Today as `YYYY-MM-DD` in Bafoussam. */
export function todayInBafoussam(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: EVENT_TIME_ZONE }).format(now)
}

function parts(date: string) {
  const [y, m, d] = date.split("-").map(Number)
  return { y, m, d }
}

/** Day, short month and year for the calendar badges. */
export function dateBadge(date: string) {
  const { y, m, d } = parts(date)
  return { day: String(d).padStart(2, "0"), month: MONTHS_SHORT[m - 1], year: String(y) }
}

export function monthLabel(date: string): string {
  const { y, m } = parts(date)
  const name = MONTHS[m - 1]
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${y}`
}

function longDate(date: string, withYear = true): string {
  const { y, m, d } = parts(date)
  return `${d === 1 ? "1er" : d} ${MONTHS[m - 1]}${withYear ? ` ${y}` : ""}`
}

/** "10 mars 2026", "10 – 12 mars 2026" or "28 mars – 2 avril 2026". */
export function formatEventDate({ startDate, endDate }: Pick<EventDates, "startDate" | "endDate">): string {
  if (!endDate || endDate === startDate) return longDate(startDate)
  const s = parts(startDate)
  const e = parts(endDate)
  if (s.y !== e.y) return `${longDate(startDate)} – ${longDate(endDate)}`
  if (s.m !== e.m) return `${longDate(startDate, false)} – ${longDate(endDate)}`
  return `${s.d === 1 ? "1er" : s.d} – ${longDate(endDate)}`
}

const hour = (t: string) => t.replace(":", "h")

/** "09h00 – 17h00", "À partir de 09h00" or "Toute la journée". */
export function formatEventTime({ startTime, endTime }: Pick<EventDates, "startTime" | "endTime">): string {
  if (!startTime) return "Toute la journée"
  return endTime ? `${hour(startTime)} – ${hour(endTime)}` : `À partir de ${hour(startTime)}`
}

/** ISO 8601 values for schema.org: a date alone for all-day events, a local date-time otherwise. */
export function eventIsoDates(e: EventDates): { start: string; end?: string } {
  const start = e.startTime ? `${e.startDate}T${e.startTime}:00${UTC_OFFSET}` : e.startDate
  const endDay = e.endDate ?? e.startDate
  if (e.endTime) return { start, end: `${endDay}T${e.endTime}:00${UTC_OFFSET}` }
  if (e.endDate && e.endDate !== e.startDate) return { start, end: e.endDate }
  return { start }
}

/** Short plain-text description (160 characters max) for meta tags and structured data. */
export function eventDescription(e: { summary: string | null; content: string | null }): string {
  const text = (e.summary || (e.content ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ") || "")
    .replace(/\s+/g, " ")
    .trim()
  return text.length > 160 ? `${text.slice(0, 157).replace(/\s+\S*$/, "")}…` : text
}

export function isPastEvent(e: Pick<EventDates, "startDate" | "endDate">, today = todayInBafoussam()): boolean {
  return (e.endDate ?? e.startDate) < today
}
