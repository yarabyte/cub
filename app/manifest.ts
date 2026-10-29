import type { MetadataRoute } from "next"
import { SITE } from "@/lib/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.organization}`,
    short_name: "Bafoussam",
    description: SITE.description,
    lang: SITE.language,
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: SITE.colors.primary,
    categories: ["government", "news"],
    icons: [{ src: SITE.logo, type: "image/png", sizes: "any", purpose: "any" }],
  }
}
