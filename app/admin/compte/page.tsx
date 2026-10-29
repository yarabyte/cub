import AdminPageHeader from "@/components/admin/admin-page-header"
import AccountForms from "@/components/admin/account/account-forms"
import { toSessionUser } from "@/lib/admin-auth"
import { requireUserPage } from "@/lib/admin-page-auth"

export const metadata = { title: "Mon compte — Administration" }
export const dynamic = "force-dynamic"

export default async function AdminAccountPage() {
  const user = await requireUserPage()

  return (
    <>
      <AdminPageHeader title="Mon compte" subtitle={user.email} />
      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <AccountForms user={toSessionUser(user)} />
      </div>
    </>
  )
}
