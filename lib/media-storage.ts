import { randomUUID } from "node:crypto"
import { mkdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"

const DOWNLOAD_TIMEOUT_MS = 30_000
const MEDIA_URL_PREFIX = "/media"
const ARTICLES_DIR = "articles"

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
}

export const CONTENT_TYPE_BY_EXT: Record<string, string> = Object.fromEntries(
  Object.entries(EXT_BY_TYPE).map(([type, ext]) => [ext, type])
)
CONTENT_TYPE_BY_EXT.jpeg = "image/jpeg"

export function getStorageDir(): string {
  return path.resolve(/*turbopackIgnore: true*/ process.env.STORAGE_DIR || path.join(process.cwd(), "storage", "uploads"))
}

function safeSlug(slug: string): string {
  let s = slug
  try {
    s = decodeURIComponent(slug)
  } catch {}
  return (
    s
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image"
  )
}

/** Featured images of imported posts may only come from the old WordPress site. */
const WORDPRESS_IMAGE_HOSTS = new Set(["cubafoussam.cm", "www.cubafoussam.cm"])
const DOWNLOAD_MAX_BYTES = 10 * 1024 * 1024

export async function saveArticleImage(
  url: string,
  wpId: number,
  slug: string,
  date: Date | null
): Promise<string> {
  const source = new URL(url)
  if (source.protocol !== "https:" || !WORDPRESS_IMAGE_HOSTS.has(source.hostname)) {
    throw new Error(`Hôte d'image non autorisé (${source.hostname})`)
  }
  const res = await fetch(source, {
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`Téléchargement de l'image refusé (${res.status})`)
  if (Number(res.headers.get("content-length") ?? 0) > DOWNLOAD_MAX_BYTES) throw new Error("Image trop volumineuse")
  const input = Buffer.from(await res.arrayBuffer())
  if (input.length > DOWNLOAD_MAX_BYTES) throw new Error("Image trop volumineuse")

  const output = await encodeImage(input, 1600).catch(() => {
    throw new Error("Le fichier téléchargé n'est pas une image valide")
  })

  const d = date ?? new Date()
  const yyyy = String(d.getFullYear())
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const fileName = `${wpId}-${safeSlug(slug)}.webp`
  const relativeDir = path.posix.join(ARTICLES_DIR, yyyy, mm)

  const absoluteDir = path.join(/*turbopackIgnore: true*/ getStorageDir(), relativeDir)
  await mkdir(absoluteDir, { recursive: true })
  await writeFile(path.join(absoluteDir, fileName), output)

  return `${MEDIA_URL_PREFIX}/${relativeDir}/${fileName}`
}

/** Images larger than this (about 6300 × 6300) are refused, so a tiny file cannot expand into gigabytes of pixels. */
const MAX_INPUT_PIXELS = 40_000_000

async function loadSharp() {
  return (await import("sharp")).default
}

/** Re-encodes any JPEG/PNG/WebP to WebP, `maxWidth` wide at most. Throws if the input is not one of those formats. */
async function encodeImage(input: Buffer, maxWidth: number): Promise<Buffer> {
  const sharp = await loadSharp()
  const { format } = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS }).metadata()
  if (!format || !UPLOAD_FORMATS.has(format)) throw new Error(`Unsupported format: ${format}`)
  return sharp(input, { limitInputPixels: MAX_INPUT_PIXELS })
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()
}

export function resolveMediaFile(segments: string[]): string | null {
  const root = getStorageDir()
  const target = path.resolve(root, ...segments)
  if (target !== root && target.startsWith(root + path.sep)) return target
  return null
}

/** Deletes a stored file from its public `/media/...` URL. Other URLs are ignored. */
export async function deleteMediaFile(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith(`${MEDIA_URL_PREFIX}/`)) return
  const segments = url.slice(MEDIA_URL_PREFIX.length + 1).split("/").filter(Boolean)
  const file = resolveMediaFile(segments)
  if (!file) return
  await rm(file, { force: true }).catch((e) => console.error(`Suppression de ${url} impossible :`, e))
}

export async function deleteMediaFiles(urls: string[]): Promise<void> {
  for (const url of urls) await deleteMediaFile(url)
}

export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024
const UPLOAD_MAX_WIDTH = 1200
const UPLOAD_FORMATS = new Set(["jpeg", "png", "webp"])

export class ImageUploadError extends Error {}

/** Validates an uploaded image, resizes it to 1200 px wide max and stores it as WebP. Returns its `/media/...` URL. */
export function saveUploadedArticleImage(file: File): Promise<string> {
  return saveUploadedImage(file, { dir: path.posix.join(ARTICLES_DIR, "uploads") })
}

/**
 * Validates an uploaded image, resizes it to `maxWidth` and stores it as WebP
 * under `<dir>/YYYY/MM/`. Returns its `/media/...` URL.
 */
export async function saveUploadedImage(
  file: File,
  { dir, maxWidth = UPLOAD_MAX_WIDTH }: { dir: string; maxWidth?: number }
): Promise<string> {
  if (file.size === 0) throw new ImageUploadError("Le fichier image est vide")
  if (file.size > UPLOAD_MAX_BYTES) throw new ImageUploadError("L'image dépasse 5 Mo")

  const sharp = await loadSharp()
  const input = Buffer.from(await file.arrayBuffer())
  let meta: { format?: string; width?: number; height?: number }
  try {
    meta = await sharp(input, { limitInputPixels: false }).metadata()
  } catch {
    throw new ImageUploadError("Le fichier n'est pas une image valide")
  }
  if (!meta.format || !UPLOAD_FORMATS.has(meta.format)) {
    throw new ImageUploadError("Format non accepté : utilisez JPG, PNG ou WebP")
  }
  if ((meta.width ?? 0) * (meta.height ?? 0) > MAX_INPUT_PIXELS) {
    throw new ImageUploadError("Image trop grande : 40 mégapixels maximum")
  }

  const output = await encodeImage(input, maxWidth).catch(() => {
    throw new ImageUploadError("Le fichier n'est pas une image valide")
  })

  const now = new Date()
  const relativeDir = path.posix.join(
    dir,
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, "0")
  )
  const fileName = `${randomUUID()}.webp`
  const absoluteDir = path.join(/*turbopackIgnore: true*/ getStorageDir(), relativeDir)
  await mkdir(absoluteDir, { recursive: true })
  await writeFile(path.join(absoluteDir, fileName), output)

  return `${MEDIA_URL_PREFIX}/${relativeDir}/${fileName}`
}
