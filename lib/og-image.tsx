import { readFile } from "node:fs/promises"
import path from "node:path"
import { ImageResponse } from "next/og"
import sharp from "sharp"
import { resolveMediaFile } from "@/lib/media-storage"
import { SITE, SITE_URL } from "@/lib/site"

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = "image/jpeg"

const { primary: BLUE, dark: NAVY, accent: YELLOW } = SITE.colors

async function loadFonts() {
  const dir = path.join(process.cwd(), "assets", "fonts")
  const [medium, bold, extraBold] = await Promise.all(
    ["Medium", "Bold", "ExtraBold"].map((w) => readFile(path.join(dir, `PlusJakartaSans-${w}.ttf`)))
  )
  return [
    { name: "Jakarta", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Jakarta", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Jakarta", data: extraBold, weight: 800 as const, style: "normal" as const },
  ]
}

async function readLocalImage(src: string): Promise<Buffer | null> {
  try {
    if (src.startsWith("/media/")) {
      const file = resolveMediaFile(src.slice("/media/".length).split("/"))
      return file ? await readFile(file) : null
    }
    if (src.startsWith("/")) {
      const publicRoot = path.join(process.cwd(), "public")
      const file = path.resolve(publicRoot, `.${src}`)
      return file.startsWith(publicRoot + path.sep) ? await readFile(file) : null
    }
    if (new URL(src).origin !== new URL(SITE_URL).origin) return null
    const res = await fetch(src, { signal: AbortSignal.timeout(5000), redirect: "error" })
    const size = Number(res.headers.get("content-length") ?? 0)
    return res.ok && size <= 10 * 1024 * 1024 ? Buffer.from(await res.arrayBuffer()) : null
  } catch {
    return null
  }
}

/** Navy veil baked into background photos: Satori's gradients over images are too faint on light pictures. */
const PHOTO_VEIL = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_SIZE.width}" height="${OG_SIZE.height}">
    <defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${OG_SIZE.height}">
      <stop offset="0" style="stop-color:#0B1B3A;stop-opacity:0.82"/>
      <stop offset="0.3" style="stop-color:#0B1B3A;stop-opacity:0.45"/>
      <stop offset="0.55" style="stop-color:#0B1B3A;stop-opacity:0.68"/>
      <stop offset="1" style="stop-color:#0B1B3A;stop-opacity:0.96"/>
    </linearGradient></defs>
    <rect width="${OG_SIZE.width}" height="${OG_SIZE.height}" fill="url(#g)"/>
  </svg>`
)

/** Satori cannot decode WebP, so pictures are re-encoded: logo to PNG, background photos to veiled JPEG. */
async function toDataUrl(src: string, kind: "logo" | "photo"): Promise<string | null> {
  const input = await readLocalImage(src)
  if (!input) return null
  try {
    if (kind === "logo") return `data:image/png;base64,${(await sharp(input).png().toBuffer()).toString("base64")}`
    const out = await sharp(input)
      .resize({ ...OG_SIZE, fit: "cover", position: "attention" })
      .composite([{ input: PHOTO_VEIL }])
      .jpeg({ quality: 82 })
      .toBuffer()
    return `data:image/jpeg;base64,${out.toString("base64")}`
  } catch {
    return null
  }
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…` : text
}

function BamilekeBand() {
  return (
    <div style={{ display: "flex", height: 12, width: "100%" }}>
      <div style={{ flex: 1, backgroundColor: BLUE }} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} style={{ width: 16, backgroundColor: i % 2 === 0 ? YELLOW : "white" }} />
      ))}
      <div style={{ flex: 1, backgroundColor: BLUE }} />
    </div>
  )
}

function Losanges() {
  return (
    <div style={{ position: "absolute", right: 40, top: 110, display: "flex", flexWrap: "wrap", width: 330, gap: 26, opacity: 0.18 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 70,
            height: 70,
            transform: "rotate(45deg)",
            border: `3px solid ${i % 3 === 0 ? YELLOW : "white"}`,
          }}
        />
      ))}
    </div>
  )
}

export type OgCardOptions = {
  title: string
  eyebrow?: string
  subtitle?: string
  footer?: string
  imageSrc?: string | null
}

/** Rendered as PNG by Satori, then re-encoded to JPEG: WhatsApp drops previews heavier than ~600 KB. */
export async function renderOgCard(options: OgCardOptions): Promise<Response> {
  const png = Buffer.from(await (await renderPng(options)).arrayBuffer())
  const jpeg = await sharp(png).jpeg({ quality: 84, mozjpeg: true }).toBuffer()
  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": OG_CONTENT_TYPE,
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  })
}

async function renderPng({ title, eyebrow, subtitle, footer, imageSrc }: OgCardOptions): Promise<ImageResponse> {
  const [fonts, logo, photo] = await Promise.all([
    loadFonts(),
    toDataUrl(SITE.logo, "logo"),
    imageSrc ? toDataUrl(imageSrc, "photo") : Promise.resolve(null),
  ])
  const shownTitle = truncate(title, 120)
  const titleSize = shownTitle.length > 90 ? 44 : shownTitle.length > 55 ? 52 : 62
  const host = SITE_URL.replace(/^https?:\/\//, "")

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", backgroundColor: NAVY, fontFamily: "Jakarta", position: "relative" }}>
        {photo ? (
          <img src={photo} width={OG_SIZE.width} height={OG_SIZE.height} style={{ position: "absolute", top: 0, left: 0, width: OG_SIZE.width, height: OG_SIZE.height }} />
        ) : (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: OG_SIZE.width,
              height: OG_SIZE.height,
              display: "flex",
              backgroundImage: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)`,
            }}
          />
        )}
        {!photo && <Losanges />}
        <BamilekeBand />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "40px 64px 48px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {logo && (
              <div style={{ display: "flex", backgroundColor: "white", borderRadius: 18, padding: "10px 12px" }}>
                <img src={logo} height={74} style={{ height: 74 }} />
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 34, fontWeight: 800, color: "white", letterSpacing: 1 }}>BAFOUSSAM</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: YELLOW }}>{SITE.organization}</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", gap: 18, maxWidth: photo ? 1070 : 820 }}>
            {eyebrow && (
              <div style={{ display: "flex" }}>
                <div style={{ backgroundColor: YELLOW, color: NAVY, fontSize: 20, fontWeight: 800, padding: "8px 18px", borderRadius: 999, textTransform: "uppercase", letterSpacing: 1.5 }}>
                  {eyebrow}
                </div>
              </div>
            )}
            <div style={{ fontSize: titleSize, fontWeight: 800, color: "white", lineHeight: 1.12 }}>{shownTitle}</div>
            {subtitle && (
              <div style={{ fontSize: 24, fontWeight: 500, color: "rgba(255,255,255,0.78)", lineHeight: 1.35 }}>{truncate(subtitle, 150)}</div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 6, fontSize: 22, fontWeight: 700 }}>
              {footer && <div style={{ color: "rgba(255,255,255,0.85)" }}>{footer}</div>}
              {footer && <div style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: YELLOW }} />}
              <div style={{ color: YELLOW }}>{host}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts }
  )
}
