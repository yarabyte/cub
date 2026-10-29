import Link from "next/link"
import { BarChart2, Clock, Database, Lock, MessageCircle, ShieldCheck, Target, UserCheck, Users } from "lucide-react"
import LegalPage, { LegalContact, type LegalSection } from "@/components/legal-page"
import { pageMetadata, SITE } from "@/lib/site"

export const metadata = pageMetadata({
  title: "Politique de confidentialité",
  description: "Comment la Communauté Urbaine de Bafoussam collecte, utilise et protège vos données personnelles sur son portail officiel, et comment exercer vos droits.",
  path: "/confidentialite",
})

const sections: LegalSection[] = [
  {
    id: "responsable",
    icon: ShieldCheck,
    title: "Responsable du traitement",
    content: `Les données personnelles collectées sur ce portail sont traitées par la ${SITE.organization}, ${SITE.address.street}, ${SITE.address.postOfficeBox} ${SITE.address.locality}, ${SITE.address.countryName}.

Contact : ${SITE.email} — ${SITE.phoneDisplay}.`,
  },
  {
    id: "donnees",
    icon: Database,
    title: "Données collectées",
    content: `Le portail ne vous demande aucun compte pour consulter les actualités et les démarches. Nous collectons uniquement :

• Formulaire de contact : nom complet, adresse e-mail, téléphone (facultatif), objet et message, ainsi que l'adresse IP utilisée lors de l'envoi (protection contre les abus).
• Mesure d'audience : si vous l'acceptez, des données de navigation anonymisées (pages vues, type d'appareil, provenance), via Google Analytics. Des statistiques agrégées, sans cookie ni donnée personnelle, sont également produites par l'hébergeur.
• Préférences cookies : votre choix est conservé dans votre navigateur.`,
  },
  {
    id: "finalites",
    icon: Target,
    title: "Finalités et base légale",
    content: `Vos données servent à :
• répondre à vos demandes, questions et réclamations adressées aux services de la ville ;
• améliorer le portail à partir des statistiques de fréquentation (uniquement avec votre consentement) ;
• assurer la sécurité du portail et prévenir les envois abusifs.

Ces traitements reposent sur l'exécution de la mission de service public de la ${SITE.organization} et, pour la mesure d'audience, sur votre consentement.`,
  },
  {
    id: "destinataires",
    icon: Users,
    title: "Destinataires",
    content: `Vos messages sont lus uniquement par les agents habilités de la ${SITE.organization} chargés d'y répondre. Ils ne sont ni vendus, ni cédés, ni utilisés à des fins publicitaires.

Les prestataires techniques (hébergement, envoi d'e-mails, mesure d'audience) n'accèdent aux données que dans la mesure nécessaire à leur mission.`,
  },
  {
    id: "whatsapp",
    icon: MessageCircle,
    title: "Échanges par WhatsApp",
    content: `Le bouton WhatsApp du portail ouvre une conversation dans l'application WhatsApp. Les messages échangés par ce canal sont soumis aux conditions et à la politique de confidentialité de WhatsApp (Meta). N'y transmettez pas de documents d'identité ou d'informations sensibles.`,
  },
  {
    id: "conservation",
    icon: Clock,
    title: "Durée de conservation",
    content: `• Messages du formulaire de contact : [à valider — par exemple 3 ans à compter du dernier échange], puis suppression ou archivage selon les règles applicables aux archives publiques.
• Données de mesure d'audience : 13 mois maximum.
• Préférences cookies : jusqu'à ce que vous les modifiez ou effaciez les données de votre navigateur.`,
  },
  {
    id: "securite",
    icon: Lock,
    title: "Sécurité",
    content: `Le portail est servi en HTTPS. L'accès à l'espace d'administration est réservé aux agents habilités, et protégé par mot de passe. Les données sont stockées sur des serveurs sécurisés.`,
  },
  {
    id: "droits",
    icon: UserCheck,
    title: "Vos droits",
    content: `Conformément à la législation camerounaise relative à la protection des données à caractère personnel, vous pouvez demander l'accès à vos données, leur rectification ou leur suppression, et vous opposer à leur traitement.

Pour exercer ces droits, écrivez à ${SITE.email} en précisant l'objet de votre demande. Une pièce justificative d'identité pourra vous être demandée.`,
  },
  {
    id: "audience",
    icon: BarChart2,
    title: "Cookies et mesure d'audience",
    content: `Aucun cookie de mesure d'audience n'est déposé sans votre accord. Vous pouvez modifier votre choix à tout moment depuis la politique des cookies.`,
  },
]

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      icon={ShieldCheck}
      updated="octobre 2026"
      sections={sections}
      intro={
        <p>
          La <strong style={{ color: "#0D1A2E" }}>{SITE.organization}</strong> attache une grande importance à la protection de vos
          données personnelles. Cette page explique quelles données sont collectées sur le portail, pourquoi, combien de temps elles
          sont conservées et comment exercer vos droits. Voir aussi la{" "}
          <Link href="/cookies" className="font-semibold underline" style={{ color: "#1B4FA8" }}>
            politique des cookies
          </Link>
          .
        </p>
      }
    >
      <LegalContact title="Exercer vos droits">
        <p>
          Écrivez à{" "}
          <a href={`mailto:${SITE.email}`} className="font-semibold hover:underline" style={{ color: "#1B4FA8" }}>
            {SITE.email}
          </a>{" "}
          ou par courrier : {SITE.organization}, {SITE.address.street}, {SITE.address.postOfficeBox} {SITE.address.locality}.
        </p>
      </LegalContact>
    </LegalPage>
  )
}
