import type { Metadata } from "next"
import { requireUserPage } from "@/lib/admin-page-auth"
import LogoutCountdown from "@/components/admin/logout-countdown"

export const metadata: Metadata = { title: "Déconnexion" }

/** Only paths inside the admin are accepted, so the link cannot send users to another site. */
function safeReturnPath(from: string | string[] | undefined): string {
  const path = typeof from === "string" ? from : ""
  if (!/^\/admin(\/|\?|$)/.test(path) || path.includes("\\")) return "/admin"
  if (path.startsWith("/admin/deconnexion") || path.startsWith("/admin/login")) return "/admin"
  return path
}

export default async function AdminLogoutPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[] }>
}) {
  const user = await requireUserPage()
  const { from } = await searchParams
  const firstName = (user.name?.trim() || user.email).split(/\s+/)[0]

  return <LogoutCountdown name={firstName} cancelHref={safeReturnPath(from)} />
}
