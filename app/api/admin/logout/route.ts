import { NextResponse } from "next/server"
import { getCookieName, sessionCookieOptions } from "@/lib/session"

function endSession(request: Request, loginPath: string) {
  const res = NextResponse.redirect(new URL(loginPath, request.url), 303)
  res.cookies.set(getCookieName(), "", sessionCookieOptions(0))
  return res
}

/** Sent by the logout page once the countdown ends or the user confirms. */
export function POST(request: Request) {
  return endSession(request, "/admin/login?deconnecte=1")
}

/** Used by admin pages to end a session whose account was deleted, disabled or revoked. */
export function GET(request: Request) {
  return endSession(request, "/admin/login")
}
