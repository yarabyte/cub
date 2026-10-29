import AdminPageHeader from "@/components/admin/admin-page-header"
import EventForm from "@/components/admin/agenda/event-form"
import { getEventCategories } from "@/lib/events-db"
import { requireUserPage } from "@/lib/admin-page-auth"

export const metadata = { title: "Nouvel événement — Administration" }
export const dynamic = "force-dynamic"

export default async function NewEventPage() {
  await requireUserPage()
  const categories = await getEventCategories()

  return (
    <>
      <AdminPageHeader title="Nouvel événement" subtitle="Agenda de la Ville" />
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <EventForm
          categories={categories}
          initialImageUrl={null}
          initialValues={{
            title: "",
            slug: "",
            category: "",
            location: "",
            startDate: "",
            endDate: "",
            startTime: "",
            endTime: "",
            summary: "",
            content: "",
            status: "published",
            featured: false,
            removeImage: false,
          }}
        />
      </div>
    </>
  )
}
