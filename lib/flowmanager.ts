import {
  CODE_PATTERN,
  REFERENCE_PATTERN,
  normalizeCode,
  normalizeReference,
  type MailTracking,
  type TrackingError,
} from "./mail-tracking"

export type TrackResult =
  | { ok: true; data: MailTracking }
  | { ok: false; status: number; error: TrackingError; retryAfter?: number }

const TIMEOUT_MS = 10_000

function config(): { url: string; key: string } | null {
  const url = process.env.FLOWMANAGER_URL?.trim().replace(/\/+$/, "")
  const key = process.env.FLOWMANAGER_TRACKING_KEY?.trim()
  return url && key ? { url, key } : null
}

export function isTrackingConfigured(): boolean {
  return config() !== null
}

function text(value: unknown, max = 300): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null
}

function day(value: unknown): string | null {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}

/** Keeps only the documented fields, so nothing unexpected from Flowmanager reaches the browser. */
function sanitize(body: unknown, fallbackReference: string): MailTracking | null {
  if (!body || typeof body !== "object") return null
  const b = body as Record<string, unknown>
  const step = (b.step && typeof b.step === "object" ? b.step : {}) as Record<string, unknown>
  const timeline = Array.isArray(b.timeline) ? b.timeline : []
  return {
    reference: text(b.reference, 60) ?? fallbackReference,
    subject: text(b.subject, 500),
    mailDate: day(b.mailDate),
    arrivalDate: day(b.arrivalDate),
    step: {
      id: text(step.id, 40) ?? "en_traitement",
      label: text(step.label) ?? "En cours de traitement",
    },
    service: text(b.service),
    dueDate: day(b.dueDate),
    overdue: b.overdue === true,
    timeline: timeline
      .slice(0, 50)
      .map((item) => {
        const i = (item && typeof item === "object" ? item : {}) as Record<string, unknown>
        const date = text(i.date, 40)
        const label = text(i.label)
        if (!date || !label || Number.isNaN(Date.parse(date))) return null
        return { step: text(i.step, 40) ?? "en_traitement", label, date }
      })
      .filter((i): i is MailTracking["timeline"][number] => i !== null),
  }
}

/** Asks Flowmanager for the public status of a mail. The access key never leaves this server. */
export async function trackMail(rawReference: string, rawCode: string, clientIp: string | null): Promise<TrackResult> {
  const reference = normalizeReference(rawReference)
  const code = normalizeCode(rawCode)
  if (!REFERENCE_PATTERN.test(reference) || !CODE_PATTERN.test(code)) {
    return { ok: false, status: 400, error: "invalid" }
  }

  const cfg = config()
  if (!cfg) {
    console.error("Suivi courrier : FLOWMANAGER_URL ou FLOWMANAGER_TRACKING_KEY manquant")
    return { ok: false, status: 503, error: "unavailable" }
  }

  let response: Response
  try {
    response = await fetch(`${cfg.url}/api/public/suivi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.key}`,
        ...(clientIp ? { "X-Client-IP": clientIp } : {}),
      },
      body: JSON.stringify({ reference, code }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (e) {
    console.error("Suivi courrier : Flowmanager injoignable :", e instanceof Error ? e.message : e)
    return { ok: false, status: 503, error: "unavailable" }
  }

  if (response.ok) {
    const data = sanitize(await response.json().catch(() => null), reference)
    if (data) return { ok: true, data }
    console.error("Suivi courrier : réponse Flowmanager illisible")
    return { ok: false, status: 503, error: "unavailable" }
  }

  switch (response.status) {
    case 404:
      return { ok: false, status: 404, error: "notFound" }
    case 429: {
      const retryAfter = Number(response.headers.get("retry-after"))
      return {
        ok: false,
        status: 429,
        error: "tooManyRequests",
        ...(Number.isFinite(retryAfter) && retryAfter > 0 ? { retryAfter: Math.ceil(retryAfter) } : {}),
      }
    }
    case 400:
    case 413:
    case 415:
      return { ok: false, status: 400, error: "invalid" }
    default:
      // 401, 403, 503…: a configuration problem on one side or the other, not the user's fault.
      console.error(`Suivi courrier : Flowmanager a répondu ${response.status}`)
      return { ok: false, status: 503, error: "unavailable" }
  }
}
