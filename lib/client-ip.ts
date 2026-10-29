/**
 * Client IP as seen by the reverse proxy. Traefik (Coolify) overwrites `X-Real-Ip` with the
 * connecting address, so clients cannot forge it. Behind another proxy such as Cloudflare,
 * set TRUSTED_IP_HEADER (e.g. `cf-connecting-ip`).
 */
export function clientIp(request: Request): string | null {
  const trusted = process.env.TRUSTED_IP_HEADER?.trim().toLowerCase() || "x-real-ip"
  const direct = request.headers.get(trusted)?.trim()
  if (direct) return direct.slice(0, 64)
  // The last entry is the one appended by our own proxy; earlier ones come from the client.
  const forwarded = request.headers.get("x-forwarded-for")
  const last = forwarded?.split(",").map((s) => s.trim()).filter(Boolean).at(-1)
  return last ? last.slice(0, 64) : null
}
