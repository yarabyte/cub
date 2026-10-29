import { z } from "zod"

export const CONTACT_SUBJECTS = [
  "Demande d'information",
  "État civil",
  "Urbanisme et travaux",
  "Hygiène et salubrité",
  "Réclamation",
  "Autre",
] as const

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom").max(120, "Nom trop long"),
  email: z.string().trim().email("Adresse e-mail invalide").max(255),
  phone: z
    .string()
    .trim()
    .max(40, "Numéro trop long")
    .regex(/^[+\d\s().-]*$/, "Numéro de téléphone invalide")
    .optional()
    .or(z.literal("")),
  subject: z.enum(CONTACT_SUBJECTS, { errorMap: () => ({ message: "Choisissez un objet" }) }),
  message: z
    .string()
    .trim()
    .min(10, "Votre message doit contenir au moins 10 caractères")
    .max(5000, "Votre message ne doit pas dépasser 5 000 caractères"),
})

export type ContactValues = z.infer<typeof contactSchema>
