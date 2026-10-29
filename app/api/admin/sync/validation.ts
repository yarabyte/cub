export function parseYear(value: unknown): number | null {
  const year = Number(value)
  return Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : null
}

export function parseIds(value: unknown, max = 100): number[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > max) return null
  const ids = value.map(Number)
  return ids.every((id) => Number.isInteger(id) && id > 0) ? ids : null
}
