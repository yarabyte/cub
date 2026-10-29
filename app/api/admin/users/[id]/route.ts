import { NextResponse } from "next/server"
import { requireAdminRole } from "@/lib/admin-auth"
import { countActiveAdmins, deleteAdminUser, emailTaken, getAdminById, updateAdminUser } from "@/lib/auth-db"
import { jsonError, parseId } from "@/lib/article-request"
import { userUpdateSchema } from "@/lib/user-schema"

type Context = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireAdminRole()
  if (auth instanceof NextResponse) return auth

  const id = parseId((await params).id)
  if (!id) return jsonError("Identifiant invalide", 400)

  const parsed = userUpdateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return jsonError(issue?.message ?? "Données invalides", 400, issue?.path[0]?.toString())
  }
  const { name, email, role, active } = parsed.data

  try {
    const existing = await getAdminById(id)
    if (!existing) return jsonError("Utilisateur introuvable", 404)

    const losesAdmin = existing.role === "admin" && Boolean(existing.active) && (role !== "admin" || !active)
    if (losesAdmin && id === auth.user.id) {
      return jsonError(
        active ? "Vous ne pouvez pas retirer votre propre rôle d'administrateur" : "Vous ne pouvez pas désactiver votre propre compte",
        409,
        active ? "role" : "active"
      )
    }
    if (losesAdmin && (await countActiveAdmins(id)) === 0) {
      return jsonError("Il doit rester au moins un administrateur actif", 409, active ? "role" : "active")
    }
    if (await emailTaken(email, id)) return jsonError("Un utilisateur utilise déjà cet e-mail", 409, "email")

    await updateAdminUser(id, { email, name: name || null, role, active })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("User update error:", e)
    return jsonError("Impossible d'enregistrer l'utilisateur", 500)
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const auth = await requireAdminRole()
  if (auth instanceof NextResponse) return auth

  const id = parseId((await params).id)
  if (!id) return jsonError("Identifiant invalide", 400)
  if (id === auth.user.id) return jsonError("Vous ne pouvez pas supprimer votre propre compte", 409)

  try {
    const existing = await getAdminById(id)
    if (!existing) return jsonError("Utilisateur introuvable", 404)
    if (existing.role === "admin" && existing.active && (await countActiveAdmins(id)) === 0) {
      return jsonError("Il doit rester au moins un administrateur actif", 409)
    }
    await deleteAdminUser(id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("User delete error:", e)
    return jsonError("Impossible de supprimer l'utilisateur", 500)
  }
}
