import Link from "next/link"
import { Plus } from "lucide-react"
import AdminPageHeader from "@/components/admin/admin-page-header"
import EventsManager from "@/components/admin/agenda/events-manager"
import { Button } from "@/components/ui/button"
import { getAdminEvents } from "@/lib/events-db"
import { requireUserPage } from "@/lib/admin-page-auth"

export const metadata = { title: "Agenda — Administration" }
export const dynamic = "force-dynamic"

export default async function AdminAgendaPage() {
  await requireUserPage()
  const events = await getAdminEvents()

  return (
    <>
      <AdminPageHeader
        title="Agenda de la Ville"
        subtitle={`${events.length} événement${events.length !== 1 ? "s" : ""} · les 5 prochains publiés s'affichent sur l'accueil`}
        actions={
          <Button asChild className="bg-[#1B4FA8] font-semibold text-white hover:bg-[#1B4FA8]/90">
            <Link href="/admin/agenda/nouveau">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Nouvel événement</span>
            </Link>
          </Button>
        }
      />
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <EventsManager events={events.map(({ content: _content, updatedAt: _updatedAt, ...e }) => e)} />
      </div>
    </>
  )
}
