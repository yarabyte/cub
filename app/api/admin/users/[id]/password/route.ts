import { NextResponse } from "next/server"
import { requireAdminRole } from "@/lib/admin-auth"
import { getAdminById, setAdminPassword } from "@/lib/auth-db"
import { jsonError, parseId } from "@/lib/article-request"
import { passwordResetSchema } from "@/lib/user-schema"

type Context = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Context) {
  const auth = await requireAdminRole()
  if (auth instanceof NextResponse) return auth

  const id = parseId((await params).id)
  if (!id) return jsonError("Identifiant invalide", 400)

  const parsed = passwordResetSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return jsonError(issue?.message ?? "Données invalides", 400, issue?.path[0]?.toString())
  }

  try {
    if (!(await getAdminById(id))) return jsonError("Utilisateur introuvable", 404)
    await setAdminPassword(id, parsed.data.password)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("User password reset error:", e)
    return jsonError("Impossible de modifier le mot de passe", 500)
  }
}
