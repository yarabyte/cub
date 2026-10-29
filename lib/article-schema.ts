import { z } from "zod"
import { SLUG_PATTERN } from "./slugify"

export const ARTICLE_PHOTOS_MAX = 12
export const PHOTO_CAPTION_MAX = 255

const photoCaption = z.string().trim().max(PHOTO_CAPTION_MAX, `Légende : ${PHOTO_CAPTION_MAX} caractères maximum`)

/** A gallery entry: an already stored photo (`id`) or the index of a file sent in the `photos` field (`upload`). */
export const articlePhotoItemSchema = z.union([
  z.object({ id: z.number().int().positive(), caption: photoCaption }),
  z.object({ upload: z.number().int().min(0), caption: photoCaption }),
])

export type ArticlePhotoItem = z.infer<typeof articlePhotoItemSchema>

export const articleFormSchema = z.object({
  title: z.string().trim().min(1, "Le titre est obligatoire").max(500, "500 caractères maximum"),
  slug: z
    .string()
    .trim()
    .min(1, "Le slug est obligatoire")
    .max(200, "200 caractères maximum")
    .regex(SLUG_PATTERN, "Lettres minuscules, chiffres et tirets uniquement"),
  excerpt: z.string().trim().max(1000, "1000 caractères maximum"),
  content: z.string().max(2_000_000, "Contenu trop long"),
  status: z.enum(["draft", "published"]),
  /** `YYYY-MM-DDTHH:mm` (datetime-local input) or empty */
  publishedAt: z
    .string()
    .refine((v) => v === "" || !Number.isNaN(new Date(v).getTime()), "Date invalide"),
  authorName: z.string().trim().max(255, "255 caractères maximum"),
  featured: z.boolean(),
  categoryIds: z.array(z.number().int().positive()).max(50),
  /** true when the current image must be removed without replacement */
  removeImage: z.boolean(),
  photos: z.array(articlePhotoItemSchema).max(ARTICLE_PHOTOS_MAX, `${ARTICLE_PHOTOS_MAX} photos maximum`),
})

export type ArticleFormValues = z.infer<typeof articleFormSchema>

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Le nom est obligatoire").max(255, "255 caractères maximum"),
  slug: z
    .string()
    .trim()
    .min(1, "Le slug est obligatoire")
    .max(200, "200 caractères maximum")
    .regex(SLUG_PATTERN, "Lettres minuscules, chiffres et tirets uniquement"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide"),
})

export type CategoryValues = z.infer<typeof categorySchema>

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp"
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024
