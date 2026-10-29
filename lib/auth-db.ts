import bcrypt from "bcryptjs"
import { getDb, query } from "./db"
import type { ClientUser, Role } from "./roles"

export type AdminUser = {
  id: number
  email: string
  name: string | null
  password_hash: string
  role: Role
  active: number
  last_login_at: Date | null
  /** Bumped on password change or deactivation; tokens signed with an older value are rejected. */
  session_version: number
  created_at: Date
}

/** A user without its password hash, as listed in the admin. */
export type AdminUserSummary = Omit<AdminUser, "password_hash" | "active" | "session_version"> & { active: boolean }

const COLUMNS = "id, email, name, password_hash, role, active, last_login_at, session_version, created_at"
const BCRYPT_ROUNDS = 12

let dummyHash: Promise<string> | null = null

function toSummary({ password_hash: _hash, session_version: _sv, ...u }: AdminUser): AdminUserSummary {
  return { ...u, active: Boolean(u.active) }
}

export function toClientUser(u: AdminUserSummary): ClientUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    active: u.active,
    lastLoginAt: u.last_login_at ? new Date(u.last_login_at).toISOString() : null,
    createdAt: new Date(u.created_at).toISOString(),
  }
}

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  if (!getDb()) return null
  const rows = await query<AdminUser[]>(
    `SELECT ${COLUMNS} FROM admin_users WHERE LOWER(TRIM(email)) = ? LIMIT 1`,
    [email.trim().toLowerCase()]
  )
  return rows[0] ?? null
}

export async function getAdminById(id: number): Promise<AdminUser | null> {
  if (!getDb()) return null
  const rows = await query<AdminUser[]>(`SELECT ${COLUMNS} FROM admin_users WHERE id = ? LIMIT 1`, [id])
  return rows[0] ?? null
}

export async function listAdminUsers(): Promise<AdminUserSummary[]> {
  const rows = await query<AdminUser[]>(`SELECT ${COLUMNS} FROM admin_users ORDER BY role, COALESCE(name, email)`)
  return rows.map(toSummary)
}

export async function emailTaken(email: string, excludeId?: number): Promise<boolean> {
  const rows = await query<{ id: number }[]>(
    "SELECT id FROM admin_users WHERE LOWER(TRIM(email)) = ? AND id <> ? LIMIT 1",
    [email.trim().toLowerCase(), excludeId ?? 0]
  )
  return rows.length > 0
}

export async function createAdminUser(input: {
  email: string
  name: string | null
  role: Role
  password: string
}): Promise<number> {
  const hash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)
  const res = await query<{ insertId: number }>(
    "INSERT INTO admin_users (email, name, password_hash, role, active) VALUES (?, ?, ?, ?, 1)",
    [input.email, input.name, hash, input.role]
  )
  return res.insertId
}

export async function updateAdminUser(
  id: number,
  input: { email: string; name: string | null; role: Role; active: boolean }
): Promise<void> {
  const active = input.active ? 1 : 0
  // session_version is assigned first so that it compares against the previous `active` value.
  await query(
    `UPDATE admin_users
     SET session_version = session_version + (active = 1 AND ? = 0), email = ?, name = ?, role = ?, active = ?
     WHERE id = ?`,
    [active, input.email, input.name, input.role, active, id]
  )
}

export async function updateAdminName(id: number, name: string | null): Promise<void> {
  await query("UPDATE admin_users SET name = ? WHERE id = ?", [name, id])
}

/** Changes the password and revokes every open session of the account. */
export async function setAdminPassword(id: number, password: string): Promise<void> {
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS)
  await query("UPDATE admin_users SET password_hash = ?, session_version = session_version + 1 WHERE id = ?", [hash, id])
}

export async function deleteAdminUser(id: number): Promise<boolean> {
  const res = await query<{ affectedRows: number }>("DELETE FROM admin_users WHERE id = ?", [id])
  return res.affectedRows > 0
}

/** Number of active administrators, optionally ignoring one account. */
export async function countActiveAdmins(excludeId?: number): Promise<number> {
  const rows = await query<{ n: number }[]>(
    "SELECT COUNT(*) AS n FROM admin_users WHERE role = 'admin' AND active = 1 AND id <> ?",
    [excludeId ?? 0]
  )
  return Number(rows[0]?.n ?? 0)
}

export async function touchLastLogin(id: number): Promise<void> {
  await query("UPDATE admin_users SET last_login_at = NOW() WHERE id = ?", [id])
}

export function checkPassword(user: AdminUser, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.password_hash)
}

/** After a successful login, re-hashes passwords stored with an older, cheaper cost (sessions stay valid). */
export async function upgradePasswordHash(user: AdminUser, password: string): Promise<void> {
  if (bcrypt.getRounds(user.password_hash) >= BCRYPT_ROUNDS) return
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS)
  await query("UPDATE admin_users SET password_hash = ? WHERE id = ?", [hash, user.id])
}

/** Spends the same bcrypt time as a real check, so response times don't reveal which e-mails exist. */
export async function burnPasswordCheck(password: string): Promise<void> {
  dummyHash ??= bcrypt.hash("cubafoussam-placeholder-password", BCRYPT_ROUNDS)
  await bcrypt.compare(password, await dummyHash)
}
