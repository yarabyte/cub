import Link from "next/link"
import { Accessibility, AlertTriangle, CheckCircle2, Keyboard, MessageSquareWarning, Target } from "lucide-react"
import LegalPage, { LegalContact, type LegalSection } from "@/components/legal-page"
import { pageMetadata, SITE } from "@/lib/site"

export const metadata = pageMetadata({
  title: "Accessibilité",
  description: "Déclaration d'accessibilité du portail officiel de la Communauté Urbaine de Bafoussam : engagement, état de conformité, limites connues et contact.",
  path: "/accessibilite",
})

const sections: LegalSection[] = [
  {
    id: "engagement",
    icon: Target,
    title: "Notre engagement",
    content: `La ${SITE.organization} veut rendre son portail utilisable par tous les citoyens, y compris les personnes en situation de handicap, les personnes âgées et les visiteurs qui naviguent sur mobile avec une connexion limitée.

Le portail vise le niveau AA des règles internationales WCAG 2.1.`,
  },
  {
    id: "conformite",
    icon: CheckCircle2,
    title: "État de conformité",
    content: `Le portail n'a pas encore fait l'objet d'un audit d'accessibilité complet. Il est à ce jour considéré comme partiellement conforme.`,
  },
  {
    id: "mesures",
    icon: Keyboard,
    title: "Mesures en place",
    content: `• Structure des pages avec titres hiérarchisés et fils d'Ariane
• Navigation possible au clavier, y compris dans la galerie photos (flèches, touche Échap)
• Textes alternatifs sur les images informatives
• Contrastes de couleurs renforcés et police lisible
• Pages adaptées aux mobiles et au zoom du navigateur
• Formulaires avec libellés explicites et messages d'erreur`,
  },
  {
    id: "limites",
    icon: AlertTriangle,
    title: "Limites connues",
    content: `• Certains communiqués sont publiés sous forme d'images ou de documents scannés, sans version texte équivalente
• Certains documents PDF à télécharger ne sont pas entièrement accessibles aux lecteurs d'écran
• Les contenus plus anciens, repris de l'ancien site, peuvent comporter des images sans description

Ces points sont progressivement corrigés.`,
  },
  {
    id: "signaler",
    icon: MessageSquareWarning,
    title: "Signaler un problème",
    content: `Si vous ne parvenez pas à accéder à un contenu ou à un service, contactez-nous : nous vous fournirons l'information sous une autre forme et corrigerons le problème lorsque c'est possible.

E-mail : ${SITE.email}
Téléphone : ${SITE.phoneDisplay} (${SITE.openingHours.label.toLowerCase()})`,
  },
]

export default function AccessibilitePage() {
  return (
    <LegalPage
      title="Accessibilité"
      icon={Accessibility}
      updated="octobre 2026"
      sections={sections}
      intro={
        <p>
          Cette déclaration d&apos;accessibilité s&apos;applique au portail officiel de la{" "}
          <strong style={{ color: "#0D1A2E" }}>{SITE.organization}</strong>. Elle décrit le niveau d&apos;accessibilité atteint, les
          limites connues et la manière de nous signaler une difficulté.
        </p>
      }
    >
      <LegalContact title="Besoin d'aide pour une démarche ?">
        <p>
          Les agents de l&apos;Hôtel de Ville vous accueillent {SITE.openingHours.label.toLowerCase()}. Vous pouvez aussi nous écrire via
          le{" "}
          <Link href="/contact" className="font-semibold underline" style={{ color: "#1B4FA8" }}>
            formulaire de contact
          </Link>
          .
        </p>
      </LegalContact>
    </LegalPage>
  )
}
