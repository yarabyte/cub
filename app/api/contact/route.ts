import { NextResponse } from "next/server"
import { contactSchema } from "@/lib/contact-schema"
import { insertContactMessage, recordEmailResult } from "@/lib/contact-db"
import { isMailConfigured, sendContactEmail } from "@/lib/mailer"
import { jsonError } from "@/lib/article-request"
import { clientIp } from "@/lib/client-ip"
import { createRateLimiter } from "@/lib/rate-limit"
import { isSameOrigin } from "@/lib/same-origin"

/** Humans need more than this to fill in the form; faster submissions are bots. */
const MIN_FILL_MS = 3000
const MAX_BODY_BYTES = 32 * 1024
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 })

export async function POST(request: Request) {
  if (!isSameOrigin(request.headers)) return jsonError("Requête refusée", 403)
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return jsonError("Message trop volumineux", 413)
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") return jsonError("Requête invalide", 400)

  // Honeypot filled or form sent too fast: pretend success so bots don't retry.
  const tooFast = typeof body.elapsedMs !== "number" || body.elapsedMs < MIN_FILL_MS
  if ((typeof body.website === "string" && body.website.trim() !== "") || tooFast) {
    return NextResponse.json({ ok: true })
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return jsonError(issue?.message ?? "Données invalides", 400, issue?.path[0]?.toString())
  }

  const ip = clientIp(request)
  if (limiter.consume(ip ?? "unknown")) {
    return jsonError("Trop de messages envoyés. Merci de réessayer dans quelques minutes.", 429)
  }

  let id: number
  try {
    id = await insertContactMessage(parsed.data, ip)
  } catch (e) {
    console.error("Contact message insert error:", e)
    return jsonError("Votre message n'a pas pu être enregistré. Merci de réessayer plus tard.", 500)
  }

  if (isMailConfigured()) {
    try {
      await sendContactEmail(parsed.data, id)
      await recordEmailResult(id, null)
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      console.error("Contact email error:", message)
      await recordEmailResult(id, message).catch(() => {})
    }
  } else {
    await recordEmailResult(id, "SMTP non configuré : message enregistré uniquement").catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
