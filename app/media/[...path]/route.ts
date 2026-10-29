import { readFile, stat } from "node:fs/promises"
import path from "node:path"
import { CONTENT_TYPE_BY_EXT, resolveMediaFile } from "@/lib/media-storage"

export const runtime = "nodejs"

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params
  const filePath = resolveMediaFile(segments)
  if (!filePath) return new Response("Not found", { status: 404 })

  const ext = path.extname(filePath).slice(1).toLowerCase()
  const contentType = CONTENT_TYPE_BY_EXT[ext]
  if (!contentType) return new Response("Not found", { status: 404 })

  try {
    const info = await stat(filePath)
    if (!info.isFile()) return new Response("Not found", { status: 404 })
    const data = await readFile(filePath)
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch {
    return new Response("Not found", { status: 404 })
  }
}
