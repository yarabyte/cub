import { z } from "zod"

export const ALBUM_NAME_MAX = 80
export const GALLERY_CAPTION_MAX = 255
/** Files accepted in a single upload request. */
export const GALLERY_UPLOAD_MAX_FILES = 20
/** Photos shown in the home page section; the rest is on /mediatheque. */
export const GALLERY_HOME_LIMIT = 8

export const albumSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(ALBUM_NAME_MAX, `${ALBUM_NAME_MAX} caractères maximum`),
})

export const photoUpdateSchema = z
  .object({
    caption: z.string().trim().max(GALLERY_CAPTION_MAX, `Légende : ${GALLERY_CAPTION_MAX} caractères maximum`),
    albumId: z.number().int().positive().nullable(),
  })
  .partial()

export const reorderSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(1000),
})

export type GalleryAlbum = { id: number; name: string; slug: string }
export type GalleryAlbumWithCount = GalleryAlbum & { photoCount: number }
export type GalleryPhoto = { id: number; url: string; caption: string; albumId: number | null }
