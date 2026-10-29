import type { Metadata } from "next"

/** Public origin of the site, without trailing slash. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://cubafoussam.cm").replace(/\/+$/, "")

export const SITE = {
  name: "Ville de Bafoussam",
  portalName: "Portail officiel de la Ville de Bafoussam",
  organization: "Communauté Urbaine de Bafoussam",
  shortName: "CUB",
  description:
    "Portail officiel de la Communauté Urbaine de Bafoussam (Cameroun) : actualités de la ville, démarches administratives d'état civil, municipalité, services citoyens et informations pratiques.",
  locale: "fr_CM",
  language: "fr-CM",
  logo: "/images/logo-cub.png",
  colors: { primary: "#1B4FA8", dark: "#0B2B6B", accent: "#F5C200" },
  address: {
    street: "Hôtel de Ville, Rue Poya",
    postOfficeBox: "B.P. 995",
    locality: "Bafoussam",
    department: "Mifi",
    region: "Région de l'Ouest",
    country: "CM",
    countryName: "Cameroun",
  },
  geo: { latitude: 5.4781, longitude: 10.4176 },
  phone: "+237233441562",
  phoneDisplay: "+237 233 44 15 62",
  email: "contact@cubafoussam.cm",
  openingHours: {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "07:30",
    closes: "15:30",
    label: "Du lundi au vendredi, 07h30 – 15h30",
  },
  mayor: {
    name: "Roger TAFAM",
    honorific: "Commandant",
    jobTitle: "Maire de la Ville de Bafoussam",
    image: "/images/maire.png",
  },
  /** Official social profiles, used as schema.org `sameAs`. Fill in once the accounts are confirmed. */
  sameAs: [] as string[],
} as const

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

/** `alternates.types` entry advertising the news feed; repeated per page because `alternates` is not merged. */
export const RSS_ALTERNATE = {
  "application/rss+xml": [{ url: "/actualites/rss.xml", title: `Actualités — ${SITE.name}` }],
}

/** Site-wide share image (app/opengraph-image.tsx); pages that define `openGraph` do not inherit it. */
export const DEFAULT_SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Portail officiel de la Ville de Bafoussam — Communauté Urbaine de Bafoussam",
}

/** Canonical URL and Open Graph fields shared by a static public page. */
export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_SHARE_IMAGE,
}: {
  title: string
  description: string
  path: string
  image?: typeof DEFAULT_SHARE_IMAGE
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path, types: RSS_ALTERNATE },
    openGraph: { title, description, url: path, type: "website", siteName: SITE.name, locale: SITE.locale, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  }
}
