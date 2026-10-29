export type DemarcheSlug = "acte-de-naissance" | "acte-de-mariage" | "acte-de-deces"

export type Demarche = {
  slug: DemarcheSlug
  title: string
  summary: string
  /** Short recap shown on the homepage card. */
  steps: [string, string, string]
  depot: { lieu: string; delai: string }
  pieces: { heading?: string; items: string[] }[]
  notes?: string[]
  frais?: string
  documents?: { label: string; href: string; size: string }[]
  /** Draft answers built from the fields above; to be validated by the civil registry service. */
  faq: { q: string; a: string }[]
}

export const DEMARCHES: Demarche[] = [
  {
    slug: "acte-de-naissance",
    title: "Acte de naissance",
    summary:
      "Pièces à fournir en vue de l'établissement de l'acte de naissance à la Communauté Urbaine de Bafoussam. En dehors des formations hospitalières, le parent doit déposer le dossier au service de l'État civil.",
    steps: [
      "Déclaration de naissance hospitalière (Mifi)",
      "Actes de naissance et CNI des parents",
      "Dépôt à l'état civil sous 90 jours",
    ],
    depot: {
      lieu: "Service de l'État civil de la Communauté Urbaine de Bafoussam",
      delai: "Dans les 90 jours suivant la naissance de l'enfant",
    },
    pieces: [
      {
        heading: "Pour les enfants nés de parents mariés",
        items: [
          "Déclaration de naissance de l'enfant dressée dans une formation hospitalière du département de la Mifi",
          "Photocopies couleur des actes de naissance et photocopies couleur des CNI des parents (comme documents de référence)",
          "Une photocopie couleur de l'acte de mariage",
        ],
      },
      {
        heading: "Pour les enfants nés de parents hors mariage",
        items: [
          "Déclaration de naissance de l'enfant dressée dans une formation hospitalière du département de la Mifi",
          "Photocopies couleur des actes de naissance et photocopies des CNI des parents (comme documents de référence)",
          "La reconnaissance de l'enfant né de parents hors mariage, effective lors du dépôt de la déclaration",
        ],
      },
    ],
    notes: [
      "Le jour de la reconnaissance, les parents doivent se présenter au service de l'État civil munis de leurs CNI, accompagnés chacun d'un témoin responsable, lui aussi muni de sa CNI.",
      "Au cas où l'un des parents de l'enfant à reconnaître est mineur, son témoin sera l'un de ses parents.",
    ],
    faq: [
      {
        q: "Dans quel délai faut-il déclarer une naissance à Bafoussam ?",
        a: "Le dossier doit être déposé au service de l'État civil de la Communauté Urbaine de Bafoussam dans les 90 jours suivant la naissance de l'enfant.",
      },
      {
        q: "Quelles pièces fournir pour un enfant né de parents mariés ?",
        a: "La déclaration de naissance dressée dans une formation hospitalière du département de la Mifi, les photocopies couleur des actes de naissance et des CNI des deux parents, et une photocopie couleur de l'acte de mariage.",
      },
      {
        q: "Quelles pièces fournir si les parents ne sont pas mariés ?",
        a: "La déclaration de naissance hospitalière, les photocopies couleur des actes de naissance et les photocopies des CNI des parents. La reconnaissance de l'enfant est effectuée lors du dépôt de la déclaration.",
      },
      {
        q: "Comment se déroule la reconnaissance d'un enfant né hors mariage ?",
        a: "Le jour de la reconnaissance, les parents se présentent au service de l'État civil munis de leur CNI, chacun accompagné d'un témoin responsable lui aussi muni de sa CNI. Si l'un des parents est mineur, son témoin est l'un de ses propres parents.",
      },
      {
        q: "Où déposer le dossier d'acte de naissance ?",
        a: "Au service de l'État civil de la Communauté Urbaine de Bafoussam, Hôtel de Ville, Rue Poya, du lundi au vendredi de 07h30 à 15h30.",
      },
    ],
  },
  {
    slug: "acte-de-mariage",
    title: "Acte de mariage",
    summary:
      "Pièces à fournir par les futurs époux en vue de la célébration de leur mariage à la Communauté Urbaine de Bafoussam.",
    steps: [
      "Demande timbrée adressée au Maire",
      "Pièces des époux, témoins et chefs de famille",
      "Dépôt 45 jours avant la date",
    ],
    depot: {
      lieu: "Service du courrier de la Communauté Urbaine de Bafoussam",
      delai: "45 jours avant la date souhaitée pour la célébration du mariage",
    },
    pieces: [
      {
        items: [
          "Une demande de célébration de mariage timbrée à 1 000 FCFA (2 timbres communaux), adressée à l'attention du Maire de la Ville",
          "2 photocopies couleur des actes de naissance des futurs époux",
          "2 photocopies couleur des CNI des futurs époux, ou photocopies des cartes de séjour pour les candidats camerounais vivant à l'étranger et pour les candidats de nationalité étrangère résidant au Cameroun",
          "2 photocopies couleur des CNI des témoins de chaque époux (un témoin par conjoint)",
          "2 photocopies couleur des CNI des chefs de famille de chaque époux (un chef de famille par conjoint)",
          "11 photos couleur 4×4 des futurs époux (9 photos pour 3 registres de 3 actes chacun, 1 photo pour la publication des bans et 1 photo pour le livret de famille)",
          "1 livret de famille",
        ],
      },
    ],
    frais: "50 000 FCFA de frais de location de la salle de célébration",
    documents: [
      {
        label: "Demande de célébration de mariage",
        href: "/documents/demande-celebration-mariage.pdf",
        size: "PDF · 472 Ko",
      },
    ],
    faq: [
      {
        q: "Quand déposer le dossier de mariage à Bafoussam ?",
        a: "Le dossier doit être déposé au service du courrier de la Communauté Urbaine de Bafoussam au moins 45 jours avant la date souhaitée pour la célébration du mariage.",
      },
      {
        q: "Combien coûte la célébration d'un mariage à la mairie de Bafoussam ?",
        a: "Les frais de location de la salle de célébration sont de 50 000 FCFA. La demande de célébration doit en outre être timbrée à 1 000 FCFA (2 timbres communaux).",
      },
      {
        q: "Combien de photos faut-il fournir pour un mariage ?",
        a: "11 photos couleur 4×4 des futurs époux : 9 pour les 3 registres de 3 actes chacun, 1 pour la publication des bans et 1 pour le livret de famille.",
      },
      {
        q: "Quels documents fournir pour les témoins et les chefs de famille ?",
        a: "Deux photocopies couleur de la CNI du témoin de chaque époux (un témoin par conjoint) et deux photocopies couleur de la CNI du chef de famille de chaque époux (un chef de famille par conjoint).",
      },
      {
        q: "Un futur époux vivant à l'étranger ou de nationalité étrangère peut-il se marier à Bafoussam ?",
        a: "Oui. Les Camerounais vivant à l'étranger et les étrangers résidant au Cameroun fournissent des photocopies de leur carte de séjour à la place de la CNI.",
      },
      {
        q: "Où trouver le formulaire de demande de célébration de mariage ?",
        a: "Le formulaire « Demande de célébration de mariage » est téléchargeable en PDF sur cette page. Il doit être adressé à l'attention du Maire de la Ville et timbré.",
      },
    ],
  },
  {
    slug: "acte-de-deces",
    title: "Acte de décès",
    summary:
      "Pièces à fournir en vue de l'établissement de l'acte de décès à la Communauté Urbaine de Bafoussam. Le dossier est déposé par la parenté du défunt.",
    steps: [
      "Déclaration de décès hospitalière",
      "Pièces du défunt et de 2 témoins",
      "Dépôt à l'état civil sous 90 jours",
    ],
    depot: {
      lieu: "Service de l'État civil de la Communauté Urbaine de Bafoussam",
      delai: "Dans les 90 jours suivant le décès",
    },
    pieces: [
      {
        items: [
          "Déclaration de décès dressée dans une formation hospitalière du département de la Mifi, ou attestation de constat de décès pour les décès constatés dans les formations hospitalières",
          "1 photocopie couleur de l'acte de naissance du défunt",
          "1 photocopie couleur de la CNI du défunt",
          "1 photocopie couleur des CNI de deux témoins",
          "1 photocopie couleur de l'acte de mariage du défunt (le cas échéant)",
        ],
      },
    ],
    faq: [
      {
        q: "Qui doit déclarer un décès à Bafoussam ?",
        a: "Le dossier est déposé par la parenté du défunt au service de l'État civil de la Communauté Urbaine de Bafoussam.",
      },
      {
        q: "Dans quel délai déclarer un décès ?",
        a: "Le dossier doit être déposé dans les 90 jours suivant le décès.",
      },
      {
        q: "Quelles pièces fournir pour obtenir un acte de décès ?",
        a: "La déclaration de décès dressée dans une formation hospitalière du département de la Mifi (ou l'attestation de constat de décès), une photocopie couleur de l'acte de naissance et de la CNI du défunt, une photocopie couleur des CNI de deux témoins et, le cas échéant, une photocopie couleur de l'acte de mariage du défunt.",
      },
      {
        q: "Combien de témoins faut-il pour un acte de décès ?",
        a: "Deux témoins, dont il faut fournir une photocopie couleur de la CNI.",
      },
      {
        q: "Où déposer le dossier d'acte de décès ?",
        a: "Au service de l'État civil de la Communauté Urbaine de Bafoussam, Hôtel de Ville, Rue Poya, du lundi au vendredi de 07h30 à 15h30.",
      },
    ],
  },
]

export function getDemarche(slug: string): Demarche | undefined {
  return DEMARCHES.find((d) => d.slug === slug)
}
