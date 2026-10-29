import { z } from "zod"

export const WHATSAPP_QUESTION_COUNT = 5
export const WHATSAPP_QUESTION_MAX = 200

export const DEFAULT_WHATSAPP_QUESTIONS = [
  "Quelles pièces fournir pour établir un acte de naissance ?",
  "Comment obtenir une copie d'acte de mariage ?",
  "Quels sont les horaires d'ouverture de la mairie ?",
  "Comment suivre l'avancement de mon dossier ?",
  "Comment signaler un problème (voirie, éclairage, salubrité) ?",
]

/** wa.me expects the international number as digits only, without "+" or leading zeros. */
export function normalizePhone(value: string): string {
  return value.replace(/[\s+().-]/g, "").replace(/^00/, "")
}

export function isValidPhone(value: string): boolean {
  return /^[1-9]\d{7,14}$/.test(normalizePhone(value))
}

export function whatsappLink(phone: string, text?: string): string {
  const base = `https://wa.me/${normalizePhone(phone)}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

export const whatsappSchema = z
  .object({
    enabled: z.boolean(),
    phone: z.string().trim().max(30, "Numéro trop long"),
    questions: z
      .array(
        z
          .string()
          .trim()
          .min(3, "La question doit contenir au moins 3 caractères")
          .max(WHATSAPP_QUESTION_MAX, `La question ne doit pas dépasser ${WHATSAPP_QUESTION_MAX} caractères`)
      )
      .length(WHATSAPP_QUESTION_COUNT, `Il faut exactement ${WHATSAPP_QUESTION_COUNT} questions`),
  })
  .superRefine((values, ctx) => {
    if (values.phone === "" && !values.enabled) return
    if (values.phone === "") {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Indiquez le numéro qui recevra les messages" })
    } else if (!isValidPhone(values.phone)) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Numéro invalide : format international avec l'indicatif, ex. +237 6 90 00 00 00",
      })
    }
  })

export type WhatsappSettings = z.infer<typeof whatsappSchema>
