import { NextResponse } from "next/server"
import { trackMail } from "@/lib/flowmanager"
import { clientIp } from "@/lib/client-ip"
import { createRateLimiter } from "@/lib/rate-limit"
import { isSameOrigin } from "@/lib/same-origin"
import type { TrackingError } from "@/lib/mail-tracking"

export const dynamic = "force-dynamic"

const MAX_BODY_BYTES = 1024
/** Flowmanager allows 10 lookups per 15 min per user; this only stops floods before they reach it. */
const limiter = createRateLimiter({ limit: 20, windowMs: 15 * 60_000 })

const NO_STORE = { "Cache-Control": "no-store" }

function fail(error: TrackingError, status: number, retryAfter?: number) {
  return NextResponse.json(
    { error, ...(retryAfter ? { retryAfter } : {}) },
    { status, headers: { ...NO_STORE, ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}) } }
  )
}

export async function POST(request: Request) {
  if (!isSameOrigin(request.headers)) return fail("invalid", 403)
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return fail("invalid", 415)
  }
  const declared = Number(request.headers.get("content-length") ?? 0)
  if (declared > MAX_BODY_BYTES) return fail("invalid", 413)

  const raw = await request.text().catch(() => "")
  if (!raw || new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return fail("invalid", 413)

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return fail("invalid", 400)
  }
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>
  const reference = typeof b.reference === "string" ? b.reference : ""
  const code = typeof b.code === "string" ? b.code : ""
  if (!reference || !code) return fail("invalid", 400)

  const ip = clientIp(request)
  const wait = limiter.consume(ip ?? "unknown")
  if (wait) return fail("tooManyRequests", 429, wait)

  const result = await trackMail(reference, code, ip)
  if (!result.ok) return fail(result.error, result.status, result.retryAfter)
  return NextResponse.json(result.data, { headers: NO_STORE })
}
