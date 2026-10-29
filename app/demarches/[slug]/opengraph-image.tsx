import { getDemarche } from "@/lib/demarches"
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og-image"

export const alt = "Démarche administrative à la Communauté Urbaine de Bafoussam"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const demarche = getDemarche((await params).slug)
  return renderOgCard({
    eyebrow: "Démarches administratives",
    title: demarche ? `${demarche.title} : pièces à fournir et délais` : "Démarches administratives",
    subtitle: demarche ? `Dépôt : ${demarche.depot.lieu}. Délai : ${demarche.depot.delai.toLowerCase()}.` : undefined,
  })
}
