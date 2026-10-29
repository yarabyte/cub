import AdminPageHeader from "@/components/admin/admin-page-header"
import WhatsappSettingsForm from "@/components/admin/whatsapp/whatsapp-settings-form"
import { getWhatsappSettings } from "@/lib/settings-db"
import { requireUserPage } from "@/lib/admin-page-auth"

export const metadata = { title: "WhatsApp — Administration" }
export const dynamic = "force-dynamic"

export default async function AdminWhatsappPage() {
  await requireUserPage()
  const settings = await getWhatsappSettings()

  return (
    <>
      <AdminPageHeader
        title="WhatsApp"
        subtitle="Bouton de contact WhatsApp de la page d'accueil : numéro destinataire et questions proposées"
      />
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <WhatsappSettingsForm initialValues={settings} />
      </div>
    </>
  )
}
