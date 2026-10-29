import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import ActualitesSection from "@/components/actualites-section"
import SuiviCourrierSection from "@/components/suivi-courrier-section"
import MaireSection from "@/components/maire-section"
import DemarchesSection from "@/components/demarches-section"
import AgendaSection from "@/components/agenda-section"
import GalerieSection from "@/components/galerie-section"
import Footer from "@/components/footer"
import WhatsAppWidget from "@/components/whatsapp-widget"
import { getFeaturedArticles, getPublishedArticles, type PublicArticle } from "@/lib/articles-db"
import { DEFAULT_WHATSAPP_SETTINGS, getMayorMessage, getWhatsappSettings } from "@/lib/settings-db"
import { getGalleryHome } from "@/lib/gallery-db"
import { getHomeEvents } from "@/lib/events-db"
import { pageMetadata, SITE } from "@/lib/site"
import JsonLd from "@/components/json-ld"
import { cityHallSchema, mayorSchema } from "@/lib/structured-data"

export const dynamic = "force-dynamic"

export const metadata = {
  ...pageMetadata({ title: `${SITE.name} — Portail officiel`, description: SITE.description, path: "/" }),
  title: { absolute: `${SITE.name} — Portail officiel de la Communauté Urbaine de Bafoussam` },
}

/** Articles of this category feed the announcement banner above the hero. */
const ANNOUNCEMENTS_CATEGORY_SLUG = "annonces"

export default async function Home() {
  let articles: PublicArticle[] = []
  let announcements: PublicArticle[] = []
  const whatsappPromise = getWhatsappSettings().catch((e) => {
    console.error("Réglages WhatsApp indisponibles :", e)
    return DEFAULT_WHATSAPP_SETTINGS
  })
  try {
    ;[articles, announcements] = await Promise.all([
      getFeaturedArticles(7),
      getPublishedArticles({ categorySlug: ANNOUNCEMENTS_CATEGORY_SLUG, limit: 5 }),
    ])
  } catch (e) {
    console.error("Actualités indisponibles :", e)
  }
  const [whatsapp, mayor, gallery, agenda] = await Promise.all([
    whatsappPromise,
    getMayorMessage(),
    getGalleryHome(),
    getHomeEvents(),
  ])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <JsonLd data={[cityHallSchema(), mayorSchema(mayor)]} />
      <main>
        <HeroSection announcements={announcements.map(({ id, slug, title }) => ({ id, slug, title }))} />
        <ActualitesSection articles={articles} />
        <SuiviCourrierSection />
        <MaireSection message={mayor} />
        <DemarchesSection />
        <AgendaSection featured={agenda.featured} rest={agenda.rest} />
        <GalerieSection albums={gallery.albums} photos={gallery.photos} />
      </main>
      <Footer />
      {whatsapp.enabled && whatsapp.phone && (
        <WhatsAppWidget phone={whatsapp.phone} questions={whatsapp.questions} />
      )}
    </div>
  )
}
