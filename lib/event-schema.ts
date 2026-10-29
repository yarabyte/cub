import { z } from "zod"
import { SLUG_PATTERN } from "./slugify"

export const EVENT_SUMMARY_MAX = 300
export const EVENT_CATEGORY_MAX = 60
export const EVENT_LOCATION_MAX = 200

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

const isRealDate = (v: string) => DATE_PATTERN.test(v) && !Number.isNaN(new Date(`${v}T00:00:00Z`).getTime())

export const eventFormSchema = z
  .object({
    title: z.string().trim().min(1, "Le titre est obligatoire").max(255, "255 caractères maximum"),
    slug: z
      .string()
      .trim()
      .min(1, "Le slug est obligatoire")
      .max(200, "200 caractères maximum")
      .regex(SLUG_PATTERN, "Lettres minuscules, chiffres et tirets uniquement"),
    category: z.string().trim().max(EVENT_CATEGORY_MAX, `${EVENT_CATEGORY_MAX} caractères maximum`),
    location: z.string().trim().max(EVENT_LOCATION_MAX, `${EVENT_LOCATION_MAX} caractères maximum`),
    /** `YYYY-MM-DD` */
    startDate: z.string().refine(isRealDate, "Indiquez la date de l'événement"),
    /** `YYYY-MM-DD` or empty for a single-day event */
    endDate: z.string().refine((v) => v === "" || isRealDate(v), "Date invalide"),
    /** `HH:mm` or empty for an all-day event */
    startTime: z.string().refine((v) => v === "" || TIME_PATTERN.test(v), "Heure invalide"),
    endTime: z.string().refine((v) => v === "" || TIME_PATTERN.test(v), "Heure invalide"),
    summary: z.string().trim().max(EVENT_SUMMARY_MAX, `${EVENT_SUMMARY_MAX} caractères maximum`),
    content: z.string().max(2_000_000, "Contenu trop long"),
    status: z.enum(["draft", "published"]),
    featured: z.boolean(),
    /** true when the current image must be removed without replacement */
    removeImage: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.endDate && v.startDate && v.endDate < v.startDate) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "La date de fin précède la date de début" })
    }
    if (v.endTime && !v.startTime) {
      ctx.addIssue({ code: "custom", path: ["startTime"], message: "Indiquez aussi l'heure de début" })
    }
    const sameDay = !v.endDate || v.endDate === v.startDate
    if (sameDay && v.startTime && v.endTime && v.endTime <= v.startTime) {
      ctx.addIssue({ code: "custom", path: ["endTime"], message: "L'heure de fin doit suivre l'heure de début" })
    }
  })

export type EventFormValues = z.infer<typeof eventFormSchema>
