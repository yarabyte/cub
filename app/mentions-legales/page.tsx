import Link from "next/link"
import { Building2, Copyright, ExternalLink, Landmark, Scale, Server, ShieldAlert, UserRound } from "lucide-react"
import LegalPage, { LegalContact, type LegalSection } from "@/components/legal-page"
import { pageMetadata, SITE, SITE_URL } from "@/lib/site"

export const metadata = pageMetadata({
  title: "Mentions légales",
  description: "Mentions légales du portail officiel de la Communauté Urbaine de Bafoussam : éditeur, directeur de la publication, hébergement et conditions d'utilisation.",
  path: "/mentions-legales",
})

const { address } = SITE

const sections: LegalSection[] = [
  {
    id: "editeur",
    icon: Building2,
    title: "Éditeur du site",
    content: `Le portail ${SITE_URL.replace(/^https?:\/\//, "")} est édité par la ${SITE.organization} (C.U.B.), collectivité territoriale décentralisée de la République du Cameroun.

${address.street}
${address.postOfficeBox} ${address.locality} — ${address.region}, ${address.countryName}
Téléphone : ${SITE.phoneDisplay}
E-mail : ${SITE.email}`,
  },
  {
    id: "publication",
    icon: UserRound,
    title: "Directeur de la publication",
    content: `${SITE.mayor.honorific} ${SITE.mayor.name}, ${SITE.mayor.jobTitle}.

La rédaction des contenus est assurée par les services de la ${SITE.organization}.`,
  },
  {
    id: "hebergement",
    icon: Server,
    title: "Conception et hébergement",
    content: `Conception et réalisation : Yarabyte (www.yarabyte.com).

Hébergement : [à compléter — nom, adresse et téléphone de l'hébergeur].`,
  },
  {
    id: "propriete",
    icon: Copyright,
    title: "Propriété intellectuelle",
    content: `Les contenus publiés sur ce portail (textes, photographies, logos, armoiries, documents) sont la propriété de la ${SITE.organization}, sauf mention contraire.

Les actualités et les informations sur les démarches peuvent être reprises et partagées librement, à condition de citer la source (« ${SITE.organization} ») et d'inclure un lien vers la page d'origine. Toute autre reproduction, notamment à des fins commerciales, nécessite une autorisation écrite préalable.`,
  },
  {
    id: "responsabilite",
    icon: ShieldAlert,
    title: "Responsabilité",
    content: `La ${SITE.organization} s'efforce de publier des informations exactes et à jour. Les pièces à fournir, délais et frais des démarches administratives sont donnés à titre indicatif et peuvent évoluer : en cas de doute, renseignez-vous auprès des services concernés avant tout déplacement.

La ${SITE.organization} ne saurait être tenue responsable d'une interruption du service, d'un dysfonctionnement technique ou de l'utilisation faite des informations publiées.`,
  },
  {
    id: "liens",
    icon: ExternalLink,
    title: "Liens hypertextes",
    content: `Les liens vers d'autres sites sont fournis à titre d'information. La ${SITE.organization} n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.

La création de liens vers le portail est libre, sous réserve de ne pas présenter les pages de manière trompeuse ou dans un cadre (iframe) masquant leur origine.`,
  },
  {
    id: "donnees",
    icon: Landmark,
    title: "Données personnelles et cookies",
    content: `Le traitement des données personnelles collectées sur le portail est décrit dans la politique de confidentialité. L'usage des cookies est détaillé dans la politique des cookies.`,
  },
  {
    id: "droit",
    icon: Scale,
    title: "Droit applicable",
    content: `Les présentes mentions légales sont régies par le droit camerounais, notamment la loi n° 2010/012 du 21 décembre 2010 relative à la cybersécurité et à la cybercriminalité au Cameroun. Tout litige relève de la compétence des juridictions camerounaises.`,
  },
]

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      icon={Scale}
      updated="octobre 2026"
      sections={sections}
      intro={
        <p>
          Conformément à la réglementation en vigueur, vous trouverez ci-dessous les informations relatives à l&apos;éditeur et à
          l&apos;hébergeur du portail officiel de la <strong style={{ color: "#0D1A2E" }}>{SITE.organization}</strong>, ainsi que les
          conditions d&apos;utilisation de ses contenus. Consultez aussi notre{" "}
          <Link href="/confidentialite" className="font-semibold underline" style={{ color: "#1B4FA8" }}>
            politique de confidentialité
          </Link>{" "}
          et notre{" "}
          <Link href="/cookies" className="font-semibold underline" style={{ color: "#1B4FA8" }}>
            politique des cookies
          </Link>
          .
        </p>
      }
    >
      <LegalContact title="Une question sur ces mentions ?">
        <p>
          Écrivez-nous à{" "}
          <a href={`mailto:${SITE.email}`} className="font-semibold hover:underline" style={{ color: "#1B4FA8" }}>
            {SITE.email}
          </a>{" "}
          ou utilisez le{" "}
          <Link href="/contact" className="font-semibold underline" style={{ color: "#1B4FA8" }}>
            formulaire de contact
          </Link>
          .
        </p>
      </LegalContact>
    </LegalPage>
  )
}
