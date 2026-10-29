import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin-auth"
import { getWhatsappSettings, saveWhatsappSettings } from "@/lib/settings-db"
import { whatsappSchema } from "@/lib/whatsapp-schema"
import { jsonError } from "@/lib/article-request"

export async function GET() {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  try {
    return NextResponse.json(await getWhatsappSettings())
  } catch (e) {
    console.error("WhatsApp settings read error:", e)
    return jsonError("Impossible de charger les réglages", 500)
  }
}

export async function PUT(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const parsed = whatsappSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return jsonError(issue?.message ?? "Réglages invalides", 400, issue?.path.join("."))
  }

  try {
    return NextResponse.json(await saveWhatsappSettings(parsed.data))
  } catch (e) {
    console.error("WhatsApp settings save error:", e)
    return jsonError("Impossible d'enregistrer les réglages", 500)
  }
}
