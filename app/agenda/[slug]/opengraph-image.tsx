import { getPublishedEventBySlug } from "@/lib/events-db"
import { formatEventDate } from "@/lib/event-format"
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og-image"

export const alt = "Agenda de la Ville de Bafoussam"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getPublishedEventBySlug(slug).catch(() => null)
  if (!event) return renderOgCard({ eyebrow: "Agenda", title: "L'agenda de la Ville de Bafoussam" })
  return renderOgCard({
    eyebrow: event.category || "Agenda",
    title: event.title,
    footer: [formatEventDate(event), event.location].filter(Boolean).join(" · "),
    imageSrc: event.imageUrl,
  })
}
