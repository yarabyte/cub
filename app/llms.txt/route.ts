import { getPublishedArticles, type PublicArticle } from "@/lib/articles-db"
import { DEMARCHES } from "@/lib/demarches"
import { getUpcomingEvents } from "@/lib/events-db"
import { formatEventDate } from "@/lib/event-format"
import { absoluteUrl, SITE } from "@/lib/site"

export const dynamic = "force-dynamic"

function link(label: string, path: string, note?: string): string {
  return `- [${label}](${absoluteUrl(path)})${note ? ` : ${note}` : ""}`
}

export async function GET() {
  let articles: PublicArticle[] = []
  try {
    articles = await getPublishedArticles({ limit: 20 })
  } catch (e) {
    console.error("llms.txt : actualités indisponibles :", e)
  }
  const events = await getUpcomingEvents(20)

  const { address } = SITE
  const body = `# ${SITE.organization} (${SITE.name})

> Portail officiel de la ${SITE.organization} (C.U.B.), collectivité territoriale qui administre la ville de Bafoussam, chef-lieu du département de la Mifi et de la région de l'Ouest du Cameroun. Le site publie les actualités officielles de la ville, les démarches d'état civil (naissance, mariage, décès) et les informations sur la municipalité.

## Informations clés

- Institution : ${SITE.organization} (C.U.B.), Bafoussam, Cameroun
- Maire de la Ville : ${SITE.mayor.honorific} ${SITE.mayor.name}
- Adresse : ${address.street}, ${address.postOfficeBox} ${address.locality}, ${address.department}, ${address.region}, ${address.countryName}
- Téléphone : ${SITE.phoneDisplay}
- E-mail : ${SITE.email}
- Horaires d'ouverture : ${SITE.openingHours.label}
- Langue du site : français

## Démarches administratives

${DEMARCHES.map((d) => link(d.title, `/demarches/${d.slug}`, `${d.depot.lieu}, ${d.depot.delai.toLowerCase()}.`)).join("\n")}
${link("Toutes les démarches", "/demarches")}

## La municipalité

${link("Mot du Maire", "/mot-du-maire")}
${link("L'exécutif municipal", "/municipalite/executif", "le Maire et ses adjoints")}
${link("Les conseillers municipaux", "/municipalite/conseillers")}
${link("Maires et délégués du gouvernement", "/municipalite/maires-delegues", "historique depuis 1925")}
${link("Organigramme", "/organigramme")}
${link("Présentation de la ville", "/presentation", "géographie, histoire, culture bamiléké")}
${link("Contact", "/contact", "formulaire, adresse, téléphone, horaires")}
${link("Suivre mon courrier", "/suivi", "avancement d'un courrier déposé à la mairie, avec le numéro de dossier et le code de suivi de l'accusé de réception")}

## Dernières actualités

${articles.map((a) => link(a.title, `/actualites/${a.slug}`, a.date || undefined)).join("\n") || "- Aucune actualité disponible."}
${link("Toutes les actualités", "/actualites")}
${link("Flux RSS des actualités", "/actualites/rss.xml")}

## Agenda de la Ville

${events.map((e) => link(e.title, `/agenda/${e.slug}`, [formatEventDate(e), e.location].filter(Boolean).join(", "))).join("\n") || "- Aucun événement programmé."}
${link("Tout l'agenda", "/agenda")}

## Optional

${link("Plan du site (sitemap)", "/sitemap.xml")}
${link("Mentions légales", "/mentions-legales")}
${link("Politique de confidentialité", "/confidentialite")}
`

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=900, stale-while-revalidate=3600",
    },
  })
}
