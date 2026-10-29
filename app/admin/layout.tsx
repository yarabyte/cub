import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifySession, getCookieName } from "@/lib/session"
import { getCurrentUser, toSessionUser } from "@/lib/admin-auth"
import AdminShell from "@/components/admin/admin-shell"
import { countNewMessages } from "@/lib/contact-db"

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export default async function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(getCookieName())?.value
  const payload = token ? await verifySession(token).catch(() => null) : null
  if (!payload) return <>{children}</>

  const user = await getCurrentUser()
  if (!user) redirect("/api/admin/logout")

  const newMessages = await countNewMessages().catch(() => 0)
  return (
    <AdminShell newMessages={newMessages} user={toSessionUser(user)}>
      {children}
    </AdminShell>
  )
}
