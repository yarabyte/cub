import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og-image"

export const alt = "Portail officiel de la Ville de Bafoussam — Communauté Urbaine de Bafoussam"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderOgCard({
    eyebrow: "Portail officiel",
    title: "Bienvenue sur le portail de la Ville de Bafoussam",
    subtitle: "Actualités de la ville, démarches d'état civil, municipalité et services aux citoyens.",
  })
}
