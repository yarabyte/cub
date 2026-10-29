import type { PublicArticleDetail } from "@/lib/articles-db"
import type { Demarche } from "@/lib/demarches"
import type { MayorMessage } from "@/lib/mayor-message-schema"
import type { EventRecord } from "@/lib/events-db"
import { eventIsoDates } from "@/lib/event-format"
import { absoluteUrl, SITE, SITE_URL } from "@/lib/site"

type Node = Record<string, unknown>

export const ORGANIZATION_ID = `${SITE_URL}/#organisation`
export const WEBSITE_ID = `${SITE_URL}/#site`
export const CITY_HALL_ID = `${SITE_URL}/#hotel-de-ville`
export const MAYOR_ID = `${SITE_URL}/#maire`

const ref = (id: string) => ({ "@id": id })

const postalAddress = {
  "@type": "PostalAddress",
  streetAddress: SITE.address.street,
  postOfficeBoxNumber: SITE.address.postOfficeBox,
  addressLocality: SITE.address.locality,
  addressRegion: SITE.address.region,
  addressCountry: SITE.address.country,
}

const areaServed = {
  "@type": "City",
  name: "Bafoussam",
  containedInPlace: { "@type": "AdministrativeArea", name: `${SITE.address.region}, ${SITE.address.countryName}` },
}

const openingHours = {
  "@type": "OpeningHoursSpecification",
  dayOfWeek: SITE.openingHours.days.map((d) => `https://schema.org/${d}`),
  opens: SITE.openingHours.opens,
  closes: SITE.openingHours.closes,
}

export function organizationSchema(): Node {
  return {
    "@type": "GovernmentOrganization",
    "@id": ORGANIZATION_ID,
    name: SITE.organization,
    alternateName: ["CUB", "C.U.B.", "Mairie de Bafoussam", SITE.name],
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: absoluteUrl(SITE.logo) },
    image: absoluteUrl(SITE.logo),
    description: SITE.description,
    address: postalAddress,
    telephone: SITE.phone,
    email: SITE.email,
    areaServed,
    location: ref(CITY_HALL_ID),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: SITE.phone,
      email: SITE.email,
      availableLanguage: "French",
      hoursAvailable: openingHours,
      areaServed: "CM",
    },
    ...(SITE.sameAs.length > 0 ? { sameAs: SITE.sameAs } : {}),
  }
}

export function websiteSchema(): Node {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE.name,
    alternateName: SITE.portalName,
    inLanguage: SITE.language,
    publisher: ref(ORGANIZATION_ID),
  }
}

export function cityHallSchema(): Node {
  return {
    "@type": "CityHall",
    "@id": CITY_HALL_ID,
    name: "Hôtel de Ville de Bafoussam",
    url: absoluteUrl("/contact"),
    image: absoluteUrl("/images/hero-bafoussam.png"),
    address: postalAddress,
    geo: { "@type": "GeoCoordinates", latitude: SITE.geo.latitude, longitude: SITE.geo.longitude },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${SITE.geo.latitude},${SITE.geo.longitude}`,
    telephone: SITE.phone,
    openingHoursSpecification: [openingHours],
    publicAccess: true,
  }
}

/** Uses the mayor message edited in the back office when given, the static identity otherwise. */
export function mayorSchema(message?: Pick<MayorMessage, "name" | "honorific" | "role" | "photo">): Node {
  return {
    "@type": "Person",
    "@id": MAYOR_ID,
    name: message?.name ?? SITE.mayor.name,
    honorificPrefix: (message ? message.honorific : SITE.mayor.honorific) || undefined,
    jobTitle: message?.role ?? SITE.mayor.jobTitle,
    image: absoluteUrl(message?.photo ?? SITE.mayor.image),
    url: absoluteUrl("/mot-du-maire"),
    worksFor: ref(ORGANIZATION_ID),
  }
}

/** Breadcrumb trail starting at the home page; the last item may omit its path. */
export function breadcrumbSchema(items: { name: string; path?: string }[]): Node {
  const trail = [{ name: "Accueil", path: "/" }, ...items]
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  }
}

export function newsArticleSchema(article: PublicArticleDetail, description: string): Node {
  const url = absoluteUrl(`/actualites/${article.slug}`)
  const images = [
    absoluteUrl(`/actualites/${article.slug}/opengraph-image`),
    ...(article.image_url ? [absoluteUrl(article.image_url)] : []),
    ...article.photos.slice(0, 3).map((p) => absoluteUrl(p.url)),
  ]
  const toIso = (d: Date | null) => (d ? new Date(d).toISOString() : undefined)
  return {
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    headline: article.title.length > 110 ? `${article.title.slice(0, 107)}…` : article.title,
    description: description || undefined,
    image: images,
    datePublished: toIso(article.published_at),
    dateModified: toIso(article.modified_at ?? article.published_at),
    inLanguage: SITE.language,
    articleSection: article.categories.map((c) => c.name),
    keywords: article.categories.map((c) => c.name).join(", ") || undefined,
    author: article.author_name
      ? { "@type": "Person", name: article.author_name, worksFor: ref(ORGANIZATION_ID) }
      : ref(ORGANIZATION_ID),
    publisher: ref(ORGANIZATION_ID),
    isPartOf: ref(WEBSITE_ID),
    contentLocation: areaServed,
  }
}

export function governmentServiceSchema(demarche: Demarche): Node {
  const url = absoluteUrl(`/demarches/${demarche.slug}`)
  return {
    "@type": "GovernmentService",
    "@id": `${url}#service`,
    name: `${demarche.title} — ${SITE.organization}`,
    description: demarche.summary,
    url,
    serviceType: "État civil",
    provider: ref(ORGANIZATION_ID),
    serviceOperator: ref(ORGANIZATION_ID),
    areaServed,
    audience: { "@type": "Audience", audienceType: "Citoyens et résidents de Bafoussam" },
    availableChannel: {
      "@type": "ServiceChannel",
      name: demarche.depot.lieu,
      serviceLocation: ref(CITY_HALL_ID),
      servicePhone: { "@type": "ContactPoint", telephone: SITE.phone, contactType: "customer service" },
      availableLanguage: "French",
    },
    ...(demarche.frais ? { offers: { "@type": "Offer", description: demarche.frais, priceCurrency: "XAF" } } : {}),
  }
}

export function eventSchema(event: EventRecord, description: string): Node {
  const url = absoluteUrl(`/agenda/${event.slug}`)
  const dates = eventIsoDates(event)
  return {
    "@type": "Event",
    "@id": `${url}#event`,
    name: event.title,
    url,
    description: description || undefined,
    startDate: dates.start,
    ...(dates.end ? { endDate: dates.end } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.location || SITE.address.locality,
      address: {
        "@type": "PostalAddress",
        addressLocality: SITE.address.locality,
        addressRegion: SITE.address.region,
        addressCountry: SITE.address.country,
      },
    },
    image: [
      absoluteUrl(`/agenda/${event.slug}/opengraph-image`),
      ...(event.imageUrl ? [absoluteUrl(event.imageUrl)] : []),
    ],
    organizer: ref(ORGANIZATION_ID),
    inLanguage: SITE.language,
    isAccessibleForFree: true,
    ...(event.category ? { keywords: event.category } : {}),
  }
}

/** Ordered list of event pages, for the /agenda page. */
export function eventListSchema(events: EventRecord[]): Node {
  return {
    "@type": "ItemList",
    itemListElement: events.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/agenda/${e.slug}`),
      name: e.title,
    })),
  }
}

export function faqSchema(faq: { q: string; a: string }[], path: string): Node {
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl(path)}#faq`,
    mainEntity: faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  }
}
