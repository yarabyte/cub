import AdminPageHeader from "@/components/admin/admin-page-header"
import MayorMessageForm from "@/components/admin/mot-du-maire/mayor-message-form"
import { getMayorMessage } from "@/lib/settings-db"
import { requireUserPage } from "@/lib/admin-page-auth"

export const metadata = { title: "Mot du maire — Administration" }
export const dynamic = "force-dynamic"

export default async function AdminMotDuMairePage() {
  await requireUserPage()
  const message = await getMayorMessage()

  return (
    <>
      <AdminPageHeader
        title="Mot du maire"
        subtitle="Message affiché sur la page d'accueil et sur la page « Mot du Maire »"
      />
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <MayorMessageForm initialValues={message} />
      </div>
    </>
  )
}
