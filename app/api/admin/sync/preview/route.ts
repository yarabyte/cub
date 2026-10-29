import { NextResponse } from "next/server"
import { requireAdminRole } from "@/lib/admin-auth"
import { getCategoriesWithCounts } from "@/lib/wordpress"
import { parseYear } from "../validation"

export async function GET(request: Request) {
  const auth = await requireAdminRole()
  if (auth instanceof NextResponse) return auth

  const year = parseYear(new URL(request.url).searchParams.get("year"))
  if (!year) return NextResponse.json({ error: "Année invalide" }, { status: 400 })

  try {
    const categories = await getCategoriesWithCounts(year)
    return NextResponse.json({ year, categories })
  } catch (e) {
    console.error("Sync preview error:", e)
    return NextResponse.json({ error: "Impossible de joindre WordPress" }, { status: 502 })
  }
}
