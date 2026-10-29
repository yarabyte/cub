import { NextResponse } from "next/server"
import { requireAdminRole } from "@/lib/admin-auth"
import { createAdminUser, emailTaken, listAdminUsers, toClientUser } from "@/lib/auth-db"
import { jsonError } from "@/lib/article-request"
import { userCreateSchema } from "@/lib/user-schema"

export async function GET() {
  const auth = await requireAdminRole()
  if (auth instanceof NextResponse) return auth

  try {
    return NextResponse.json((await listAdminUsers()).map(toClientUser))
  } catch (e) {
    console.error("Users list error:", e)
    return jsonError("Impossible de charger les utilisateurs", 500)
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminRole()
  if (auth instanceof NextResponse) return auth

  const parsed = userCreateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return jsonError(issue?.message ?? "Données invalides", 400, issue?.path[0]?.toString())
  }
  const { name, email, role, password } = parsed.data

  try {
    if (await emailTaken(email)) return jsonError("Un utilisateur utilise déjà cet e-mail", 409, "email")
    const id = await createAdminUser({ email, name: name || null, role, password })
    return NextResponse.json({ id }, { status: 201 })
  } catch (e) {
    console.error("User create error:", e)
    return jsonError("Impossible de créer l'utilisateur", 500)
  }
}
