import { Baby, HeartHandshake, ScrollText, type LucideIcon } from "lucide-react"
import type { DemarcheSlug } from "@/lib/demarches"

export const DEMARCHE_ICONS: Record<DemarcheSlug, LucideIcon> = {
  "acte-de-naissance": Baby,
  "acte-de-mariage": HeartHandshake,
  "acte-de-deces": ScrollText,
}
