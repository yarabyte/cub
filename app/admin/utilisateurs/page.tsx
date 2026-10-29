import AdminPageHeader from "@/components/admin/admin-page-header"
import UsersManager from "@/components/admin/users/users-manager"
import { requireAdminPage } from "@/lib/admin-page-auth"
import { listAdminUsers, toClientUser } from "@/lib/auth-db"

export const metadata = { title: "Utilisateurs — Administration" }
export const dynamic = "force-dynamic"

export default async function AdminUsersPage() {
  const currentUser = await requireAdminPage()
  const users = (await listAdminUsers()).map(toClientUser)

  return (
    <>
      <AdminPageHeader
        title="Utilisateurs"
        subtitle={`${users.length} compte${users.length !== 1 ? "s" : ""}`}
      />
      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <UsersManager users={users} currentUserId={currentUser.id} />
      </div>
    </>
  )
}
