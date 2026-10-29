/** Old WordPress URLs (same domain) mapped to their new pages, so existing rankings and shared links survive the switch. */
const WORDPRESS_REDIRECTS = [
  // Articles: /2026/10/21/slug/ (and /amp, /feed… suffixes)
  ["/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug/:rest*", "/actualites/:slug"],
  ["/:year(\\d{4})/:rest*", "/actualites"],
  ["/category/:slug/:rest*", "/actualites?categorie=:slug"],
  ["/tag/:slug/:rest*", "/actualites"],
  ["/page/:n", "/actualites"],
  ["/feed/:rest*", "/actualites/rss.xml"],
  ["/comments/feed", "/actualites/rss.xml"],
  ["/la-municipalite/lexecutif", "/municipalite/executif"],
  ["/la-municipalite/les-conseillers", "/municipalite/conseillers"],
  ["/la-municipalite/maires-et-delegues-du-gouvernement", "/municipalite/maires-delegues"],
  ["/la-municipalite/organigramme-de-la-communaute-urbaine-de-bafoussam", "/organigramme"],
  ["/la-municipalite", "/municipalite/executif"],
  ["/la-cub/presentation", "/presentation"],
  ["/la-cub", "/presentation"],
  ["/services/demarches-pratiques-et-administratives", "/demarches"],
  ["/services", "/demarches"],
]

const GOOGLE_ANALYTICS = "https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com"

/** Production only: the dev server needs eval() and a websocket for hot reload. */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  `connect-src 'self' ${GOOGLE_ANALYTICS}`,
  "img-src 'self' data: blob: https:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ")

const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY }] : []),
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/**": ["./assets/fonts/**/*"],
  },
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }]
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cubafoussam.cm",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return WORDPRESS_REDIRECTS.map(([source, destination]) => ({ source, destination, statusCode: 301 }))
  },
}

export default nextConfig
