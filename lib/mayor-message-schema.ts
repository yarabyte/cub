import { z } from "zod"

export const MAYOR_PARAGRAPHS_MAX = 10
export const MAYOR_PARAGRAPH_MAX = 2000
/** Number of paragraphs shown in the home page excerpt. */
export const MAYOR_EXCERPT_PARAGRAPHS = 2

const text = (label: string, max: number, min = 1) =>
  z
    .string()
    .trim()
    .min(min, `${label} : champ obligatoire`)
    .max(max, `${label} : ${max} caractères maximum`)

const paragraph = text("Paragraphe", MAYOR_PARAGRAPH_MAX)

const paragraphList = <T extends z.ZodTypeAny>(item: T) =>
  z
    .array(item)
    .min(1, "Ajoutez au moins un paragraphe")
    .max(MAYOR_PARAGRAPHS_MAX, `${MAYOR_PARAGRAPHS_MAX} paragraphes maximum`)

const identityAndText = z.object({
  title: text("Titre", 120),
  titleHighlight: z.string().trim().max(80, "Fin du titre en couleur : 80 caractères maximum"),
  quote: text("Citation", 300),
  honorific: z.string().trim().max(40, "Titre honorifique : 40 caractères maximum"),
  name: text("Nom", 80),
  role: text("Fonction", 120),
  mandate: z.string().trim().max(40, "Mandat : 40 caractères maximum"),
})

export const mayorMessageSchema = identityAndText.extend({
  paragraphs: paragraphList(paragraph),
  photo: text("Photo", 500),
})

export type MayorMessage = z.infer<typeof mayorMessageSchema>

/** Admin form shape: react-hook-form field arrays need objects, not bare strings. */
export const mayorFormSchema = identityAndText.extend({
  paragraphs: paragraphList(z.object({ value: paragraph })),
})

export type MayorFormValues = z.infer<typeof mayorFormSchema>

export const DEFAULT_MAYOR_MESSAGE: MayorMessage = {
  title: "Une vision ambitieuse pour",
  titleHighlight: "notre ville",
  quote: "Ensemble, bâtissons une ville plus propre, plus sûre et plus prospère pour les générations futures.",
  paragraphs: [
    "Chers concitoyens, c'est avec un profond sentiment de responsabilité et d'engagement que je vous adresse ce message. Notre collectivité traverse une période de transformation profonde portée par notre identité Bamileke et notre ambition commune.",
    "Les défis sont nombreux — infrastructures, environnement, emploi des jeunes — mais notre détermination est plus grande encore. Ce portail numérique est un pas vers une gouvernance plus transparente et plus proche de vous.",
    "La Communauté Urbaine de Bafoussam s'attache au quotidien à améliorer le cadre de vie, à renforcer les services aux citoyens et à préserver notre patrimoine culturel. Votre confiance nous oblige ; nous nous engageons à mériter celle-ci par l'action, la rigueur et le dialogue.",
  ],
  honorific: "Commandant",
  name: "Roger TAFAM",
  role: "Maire de la Communauté Urbaine de Bafoussam",
  mandate: "2020–2025",
  photo: "/images/maire.png",
}

export function mayorFullName(m: Pick<MayorMessage, "honorific" | "name">): string {
  return [m.honorific, m.name].filter(Boolean).join(" ")
}
