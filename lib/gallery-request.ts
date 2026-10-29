import { NextResponse } from "next/server"
import type { z } from "zod"
import { jsonError } from "./article-request"

/** Parses a JSON body against `schema`; returns the data or a 400 response naming the first invalid field. */
export async function parseJsonBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<z.infer<T> | NextResponse> {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (parsed.success) return parsed.data
  const issue = parsed.error.issues[0]
  return jsonError(issue?.message ?? "Données invalides", 400, issue?.path.join(".") || undefined)
}
