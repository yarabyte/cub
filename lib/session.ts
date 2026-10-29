import { SignJWT, jwtVerify } from "jose"

const COOKIE_NAME = "admin_session"
const MAX_AGE = 60 * 60 * 24 // 24 hours
const MIN_SECRET_LENGTH = 32

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error("SESSION_SECRET or ADMIN_SESSION_SECRET must be set")
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`ADMIN_SESSION_SECRET must be at least ${MIN_SECRET_LENGTH} characters (openssl rand -base64 48)`)
  }
  return new TextEncoder().encode(secret)
}

/** `sessionVersion` must match `admin_users.session_version`; bumping it revokes every existing token. */
export type SessionPayload = { userId: number; sessionVersion: number }

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ userId: payload.userId, sv: payload.sessionVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret())
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] })
    const userId = payload.userId
    const sv = payload.sv
    if (typeof userId !== "number" || !userId || typeof sv !== "number") return null
    return { userId, sessionVersion: sv }
  } catch {
    return null
  }
}

export function getCookieName(): string {
  return COOKIE_NAME
}

export function getCookieMaxAge(): number {
  return MAX_AGE
}

export function sessionCookieOptions(maxAge = MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  }
}
