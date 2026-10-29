import { NextResponse } from "next/server"
import { burnPasswordCheck, checkPassword, getAdminByEmail, touchLastLogin, upgradePasswordHash } from "@/lib/auth-db"
import { clientIp } from "@/lib/client-ip"
import { createRateLimiter } from "@/lib/rate-limit"
import { isSameOrigin } from "@/lib/same-origin"
import { createSession, getCookieName, sessionCookieOptions } from "@/lib/session"

const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILURES = 5
const failuresByIp = createRateLimiter({ limit: MAX_FAILURES, windowMs: WINDOW_MS })
const failuresByEmail = createRateLimiter({ limit: MAX_FAILURES, windowMs: WINDOW_MS })

function tooManyAttempts(retryAfter: number) {
  const minutes = Math.max(1, Math.ceil(retryAfter / 60))
  return NextResponse.json(
    { error: `Trop de tentatives de connexion. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.` },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  )
}

export async function POST(request: Request) {
  if (!isSameOrigin(request.headers)) {
    return NextResponse.json({ error: "Requête refusée" }, { status: 403 })
  }
  try {
    const body = await request.json().catch(() => null)
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 255) : ""
    const password = typeof body?.password === "string" ? body.password.slice(0, 200) : ""
    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
    }

    const ipKey = clientIp(request) ?? "unknown"
    const wait = Math.max(failuresByIp.retryAfter(ipKey), failuresByEmail.retryAfter(email))
    if (wait) return tooManyAttempts(wait)

    const admin = await getAdminByEmail(email)
    const valid = admin ? await checkPassword(admin, password) : (await burnPasswordCheck(password), false)
    if (!admin || !valid) {
      failuresByIp.hit(ipKey)
      failuresByEmail.hit(email)
      console.warn(`Échec de connexion admin pour ${email} depuis ${ipKey}`)
      return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 })
    }
    if (!admin.active) {
      return NextResponse.json({ error: "Ce compte est désactivé. Contactez un administrateur." }, { status: 403 })
    }

    failuresByEmail.reset(email)
    await touchLastLogin(admin.id).catch((e) => console.error("last_login_at update error:", e))
    await upgradePasswordHash(admin, password).catch((e) => console.error("Password rehash error:", e))
    const token = await createSession({ userId: admin.id, sessionVersion: admin.session_version })
    const res = NextResponse.json({ ok: true })
    res.cookies.set(getCookieName(), token, sessionCookieOptions())
    return res
  } catch (e) {
    console.error("Login error:", e)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
