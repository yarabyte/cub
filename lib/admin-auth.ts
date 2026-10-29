import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"
import { verifySession, getCookieName } from "./session"
import { getAdminById, type AdminUser } from "./auth-db"
import { isSameOrigin } from "./same-origin"
import type { SessionUser } from "./roles"

/** The logged-in account, read from the database on every call. Null if missing, disabled, revoked or not logged in. */
export async function getCurrentUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(getCookieName())?.value
  const payload = token ? await verifySession(token) : null
  if (!payload) return null
  const user = await getAdminById(payload.userId).catch(() => null)
  if (!user || !user.active) return null
  return user.session_version === payload.sessionVersion ? user : null
}

export function toSessionUser(user: AdminUser): SessionUser {
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

/** Any active account, from a request sent by this site. Returns the user, or a 401/403 response. */
export async function requireUser(): Promise<{ user: AdminUser } | NextResponse> {
  if (!isSameOrigin(await headers())) {
    return NextResponse.json({ error: "Requête refusée" }, { status: 403 })
  }
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  return { user }
}

/** Administrators only. Returns the user, or a 401/403 response. */
export async function requireAdminRole(): Promise<{ user: AdminUser } | NextResponse> {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth
  if (auth.user.role !== "admin") {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 })
  }
  return auth
}
