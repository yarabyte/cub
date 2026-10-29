import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySession, getCookieName } from "@/lib/session"

/** Old WordPress pages with no equivalent: 410 tells search engines to drop them for good. */
const GONE_PATHS = [
  "/pages-jaunes",
  "/documentations",
  "/inscrire-votre-entreprise",
  "/la-cub/culture-et-traditions",
  "/services/espaces-communaux",
  "/services/developpement-des-infrastructures-et-equipements",
  "/maintenance-page",
  "/wp-admin",
  "/wp-login.php",
  "/xmlrpc.php",
]

function isGone(pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname
  return GONE_PATHS.some((p) => path === p || path.startsWith(`${p}/`))
}

function goneResponse(): NextResponse {
  return new NextResponse(
    `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Page supprimée</title></head><body style="font-family:sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem;color:#0D1A2E"><h1>Cette page n'existe plus</h1><p>Le contenu demandé a été retiré du portail de la Communauté Urbaine de Bafoussam.</p><p><a href="/">Retour à l'accueil</a> · <a href="/demarches">Démarches</a> · <a href="/actualites">Actualités</a></p></body></html>`,
    { status: 410, headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" } }
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (isGone(pathname)) return goneResponse()
  if (!pathname.startsWith("/admin")) return NextResponse.next()

  const cookieName = getCookieName()
  const token = request.cookies.get(cookieName)?.value

  if (pathname === "/admin/login") {
    const payload = token ? await verifySession(token).catch(() => null) : null
    if (payload) return NextResponse.redirect(new URL("/admin", request.url))
    return NextResponse.next()
  }

  if (!token) {
    const url = new URL("/admin/login", request.url)
    return NextResponse.redirect(url)
  }
  try {
    const payload = await verifySession(token)
    if (!payload) {
      const url = new URL("/admin/login", request.url)
      const res = NextResponse.redirect(url)
      res.cookies.set(cookieName, "", { path: "/", maxAge: 0 })
      return res
    }
  } catch {
    const url = new URL("/admin/login", request.url)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/pages-jaunes/:path*",
    "/documentations/:path*",
    "/inscrire-votre-entreprise/:path*",
    "/la-cub/culture-et-traditions/:path*",
    "/services/espaces-communaux/:path*",
    "/services/developpement-des-infrastructures-et-equipements/:path*",
    "/maintenance-page/:path*",
    "/wp-admin/:path*",
    "/wp-login.php",
    "/xmlrpc.php",
  ],
}
