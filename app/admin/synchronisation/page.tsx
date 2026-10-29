import AdminPageHeader from "@/components/admin/admin-page-header"
import SyncRunner from "@/components/admin/sync/sync-runner"
import { requireAdminPage } from "@/lib/admin-page-auth"

export const metadata = { title: "Synchronisation — Admin CUB" }

export default async function SynchronisationPage() {
  await requireAdminPage()
  return (
    <>
      <AdminPageHeader title="Synchronisation" subtitle="Import des articles depuis cubafoussam.cm" />
      <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0D1A2E] sm:text-2xl">Synchroniser avec WordPress</h2>
          <p className="mt-1 text-sm text-slate-500">
            Les articles sont importés un par un : le contenu est enregistré en base et l’image à la une sur le serveur.
          </p>
        </div>
        <SyncRunner />
      </div>
    </>
  )
}
