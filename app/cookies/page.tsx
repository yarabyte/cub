import Link from "next/link"
import ReopenCookieBannerButton from "@/components/reopen-cookie-banner-button"
import LegalPage, { LegalContact, type LegalSection } from "@/components/legal-page"
import { pageMetadata, SITE, SITE_URL } from "@/lib/site"
import { Cookie, ShieldCheck, BarChart2, Megaphone, Settings2 } from "lucide-react"

export const metadata = pageMetadata({
  title: "Politique des cookies",
  description: "Informations sur l'utilisation des cookies par le portail officiel de la Communauté Urbaine de Bafoussam.",
  path: "/cookies",
})

const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "")

const sections: LegalSection[] = [
  {
    id: "definition",
    icon: Cookie,
    title: "Qu'est-ce qu'un cookie ?",
    content: `Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, smartphone, tablette) lors de votre visite sur notre portail. Il permet de mémoriser des informations relatives à votre navigation afin de vous offrir une expérience personnalisée et adaptée.

Les cookies ne permettent pas d'identifier directement une personne physique. Ils collectent uniquement des informations techniques liées à votre navigation.`,
  },
  {
    id: "necessaires",
    icon: ShieldCheck,
    title: "Cookies nécessaires",
    content: `Ces cookies sont indispensables au fonctionnement du portail. Ils ne peuvent pas être désactivés. Sans eux, certaines fonctionnalités essentielles du site seraient indisponibles.

Exemples d'usage :
• Maintien de votre session lors de vos démarches en ligne
• Mémorisation de vos préférences de langue et d'accessibilité
• Sécurisation des formulaires contre les soumissions frauduleuses (CSRF)
• Conservation de vos choix en matière de cookies

Durée de conservation : session ou jusqu'à 12 mois maximum.`,
  },
  {
    id: "analytiques",
    icon: BarChart2,
    title: "Cookies analytiques",
    content: `Ces cookies nous permettent de comprendre comment les visiteurs utilisent notre portail afin d'en améliorer le contenu et les fonctionnalités. Toutes les données collectées sont anonymisées.

Exemples d'usage :
• Mesure du nombre de visiteurs uniques et des pages vues
• Identification des parcours de navigation les plus fréquents
• Analyse du taux de rebond et du temps passé sur les pages
• Détection des erreurs techniques rencontrées par les utilisateurs

Outil utilisé : Google Analytics (données anonymisées, sans transfert vers des tiers publicitaires).

Durée de conservation : 13 mois maximum.`,
  },
  {
    id: "marketing",
    icon: Megaphone,
    title: "Cookies marketing",
    content: `Ces cookies permettent de vous proposer des contenus et des publicités adaptés à vos centres d'intérêt sur d'autres sites web que vous pourriez visiter.

Exemples d'usage :
• Affichage de contenus personnalisés sur les réseaux sociaux partenaires
• Mesure de l'efficacité des campagnes de communication de la ville
• Partage de contenus vers des plateformes tierces (Facebook, YouTube, etc.)

Vous pouvez refuser ces cookies sans que cela n'affecte votre utilisation du portail.

Durée de conservation : 13 mois maximum.`,
  },
  {
    id: "gestion",
    icon: Settings2,
    title: "Gérer vos préférences",
    content: `Vous pouvez à tout moment modifier vos préférences en matière de cookies grâce au bouton « Rouvrir le panneau cookies » de cette page.

Vous pouvez également gérer vos cookies directement depuis les paramètres de votre navigateur :
• Google Chrome : Paramètres > Confidentialité et sécurité > Cookies
• Mozilla Firefox : Préférences > Vie privée et sécurité
• Safari : Préférences > Confidentialité
• Microsoft Edge : Paramètres > Confidentialité, recherche et services

Attention : la désactivation de certains cookies peut affecter le bon fonctionnement du portail et limiter l'accès à certains services en ligne.`,
  },
]

export default function CookiesPage() {
  return (
    <LegalPage
      title="Politique des cookies"
      icon={Cookie}
      updated="octobre 2026"
      sections={sections}
      intro={
        <>
          <p>
            Le portail officiel de la <strong style={{ color: "#0D1A2E" }}>Communauté Urbaine de Bafoussam (C.U.B.)</strong> s&apos;engage
            à protéger votre vie privée et à respecter les réglementations en vigueur relatives à la protection des données personnelles.
          </p>
          <p>
            La présente politique vous informe sur la nature des cookies utilisés sur notre portail, leur finalité, leur durée de
            conservation et la manière dont vous pouvez exercer vos droits. Elle s&apos;applique à l&apos;ensemble des pages du domaine{" "}
            <span className="font-semibold" style={{ color: "#1B4FA8" }}>{SITE_HOST}</span>. Pour en savoir plus sur le traitement de vos
            données, consultez notre{" "}
            <Link href="/confidentialite" className="font-semibold underline" style={{ color: "#1B4FA8" }}>
              politique de confidentialité
            </Link>
            .
          </p>
        </>
      }
      asideFooter={
        <>
          <p className="text-xs font-semibold mb-3" style={{ color: "#4B5563" }}>
            Modifier vos préférences à tout moment :
          </p>
          <ReopenCookieBannerButton />
        </>
      }
    >
      <LegalContact title="Contact — protection des données">
        <p className="mb-4">
          Pour toute question relative à la présente politique ou pour exercer vos droits (accès, rectification, suppression), écrivez-nous :
        </p>
        <div className="flex flex-col gap-1.5 font-medium" style={{ color: "#1B4FA8" }}>
          <a href={`mailto:${SITE.email}`} className="hover:underline">{SITE.email}</a>
          <span>{SITE.organization} — {SITE.address.street}, {SITE.address.locality}</span>
        </div>
      </LegalContact>
    </LegalPage>
  )
}
