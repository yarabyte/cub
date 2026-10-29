import { notFound } from "next/navigation"
import { ExternalLink } from "lucide-react"
import AdminPageHeader from "@/components/admin/admin-page-header"
import EventForm from "@/components/admin/agenda/event-form"
import { Button } from "@/components/ui/button"
import { getEventById, getEventCategories } from "@/lib/events-db"
import { requireUserPage } from "@/lib/admin-page-auth"

export const metadata = { title: "Modifier l’événement — Administration" }
export const dynamic = "force-dynamic"

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUserPage()
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) notFound()
  const [event, categories] = await Promise.all([getEventById(id), getEventCategories()])
  if (!event) notFound()

  return (
    <>
      <AdminPageHeader
        title="Modifier l’événement"
        subtitle={event.status === "published" ? "Publié" : "Brouillon : non visible sur le site"}
        actions={
          event.status === "published" ? (
            <Button variant="outline" asChild>
              <a href={`/agenda/${event.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                <span className="hidden sm:inline">Voir sur le site</span>
              </a>
            </Button>
          ) : undefined
        }
      />
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <EventForm
          eventId={event.id}
          categories={categories}
          initialImageUrl={event.imageUrl}
          initialValues={{
            title: event.title,
            slug: event.slug,
            category: event.category ?? "",
            location: event.location ?? "",
            startDate: event.startDate,
            endDate: event.endDate ?? "",
            startTime: event.startTime ?? "",
            endTime: event.endTime ?? "",
            summary: event.summary ?? "",
            content: event.content ?? "",
            status: event.status,
            featured: event.featured,
            removeImage: false,
          }}
        />
      </div>
    </>
  )
}
