import { NextResponse } from "next/server"
import { z } from "zod"
import { requireUser } from "@/lib/admin-auth"
import { deleteContactMessage, setMessageStatus } from "@/lib/contact-db"
import { jsonError, parseId } from "@/lib/article-request"

type Context = { params: Promise<{ id: string }> }

const patchSchema = z.object({ status: z.enum(["new", "read", "archived"]) })

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const id = parseId((await params).id)
  if (!id) return jsonError("Identifiant invalide", 400)

  const parsed = patchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return jsonError("Statut invalide", 400)

  try {
    if (!(await setMessageStatus(id, parsed.data.status))) return jsonError("Message introuvable", 404)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Message status error:", e)
    return jsonError("Impossible de modifier le message", 500)
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const id = parseId((await params).id)
  if (!id) return jsonError("Identifiant invalide", 400)

  try {
    if (!(await deleteContactMessage(id))) return jsonError("Message introuvable", 404)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Message delete error:", e)
    return jsonError("Impossible de supprimer le message", 500)
  }
}
