import { redirect } from "next/navigation"
import { getCurrentUser } from "./admin-auth"
import type { AdminUser } from "./auth-db"

/** For server pages of the admin: returns the logged-in user or ends the session. */
export async function requireUserPage(): Promise<AdminUser> {
  const user = await getCurrentUser()
  if (!user) redirect("/api/admin/logout")
  return user
}

/** For server pages reserved to administrators: editors are sent back to the dashboard. */
export async function requireAdminPage(): Promise<AdminUser> {
  const user = await requireUserPage()
  if (user.role !== "admin") redirect("/admin")
  return user
}
