import { SITE_URL } from "./site"

/**
 * CSRF guard: browsers send `Origin` on cross-site requests and on same-origin requests that
 * change data. A request is rejected only when that header names another site (or is "null").
 */
export function isSameOrigin(headers: Headers): boolean {
  const origin = headers.get("origin")
  if (!origin) return true
  let originHost: string
  try {
    originHost = new URL(origin).host
  } catch {
    return false
  }
  const allowed = new Set<string>()
  for (const h of [headers.get("x-forwarded-host"), headers.get("host")]) {
    const first = h?.split(",")[0]?.trim()
    if (first) allowed.add(first)
  }
  try {
    allowed.add(new URL(SITE_URL).host)
  } catch {}
  return allowed.has(originHost)
}
