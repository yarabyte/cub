import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin-auth"
import { checkPassword, getAdminById, setAdminPassword, updateAdminName } from "@/lib/auth-db"
import { createSession, getCookieName, sessionCookieOptions } from "@/lib/session"
import { jsonError } from "@/lib/article-request"
import { accountNameSchema, accountPasswordSchema } from "@/lib/user-schema"

/** Updates the display name of the logged-in user. */
export async function PATCH(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const parsed = accountNameSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return jsonError(issue?.message ?? "Données invalides", 400, issue?.path[0]?.toString())
  }

  try {
    await updateAdminName(auth.user.id, parsed.data.name || null)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Account update error:", e)
    return jsonError("Impossible d'enregistrer votre nom", 500)
  }
}

/** Changes the password of the logged-in user, after checking the current one. */
export async function PUT(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const parsed = accountPasswordSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return jsonError(issue?.message ?? "Données invalides", 400, issue?.path[0]?.toString())
  }

  try {
    if (!(await checkPassword(auth.user, parsed.data.current))) {
      return jsonError("Mot de passe actuel incorrect", 400, "current")
    }
    await setAdminPassword(auth.user.id, parsed.data.password)
    // Other sessions are revoked by the password change; keep this one alive with a fresh token.
    const updated = await getAdminById(auth.user.id)
    const res = NextResponse.json({ ok: true })
    if (updated) {
      const token = await createSession({ userId: updated.id, sessionVersion: updated.session_version })
      res.cookies.set(getCookieName(), token, sessionCookieOptions())
    }
    return res
  } catch (e) {
    console.error("Account password error:", e)
    return jsonError("Impossible de modifier le mot de passe", 500)
  }
}
