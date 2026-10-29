import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import JsonLd from "@/components/json-ld"
import GalleryBrowser from "@/components/gallery/gallery-browser"
import { RangeePerles, LoSange } from "@/components/bamileke-pattern"
import { getGalleryAll } from "@/lib/gallery-db"
import { pageMetadata } from "@/lib/site"
import { breadcrumbSchema } from "@/lib/structured-data"
import { ChevronRight, Images } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = pageMetadata({
  title: "Médiathèque — Album photo de la ville",
  description:
    "Album photo officiel de la Ville de Bafoussam : infrastructures, culture et fêtes Bamiléké, vie de la cité et événements de la Communauté Urbaine.",
  path: "/mediatheque",
})

export default async function MediathequePage() {
  const { albums, photos } = await getGalleryAll()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <JsonLd data={breadcrumbSchema([{ name: "Médiathèque" }])} />

      {/* Hero */}
      <div className="relative overflow-hidden py-14" style={{ backgroundColor: "#1B4FA8" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24 2L46 24L24 46L2 24Z' fill='none' stroke='white' stroke-opacity='0.08' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: "48px 48px",
          }}
          aria-hidden="true"
        />
        <div className="absolute top-6 right-20 hidden lg:block opacity-15" aria-hidden="true">
          <LoSange size={90} fill="white" />
        </div>
        <div className="absolute bottom-2 left-16 hidden lg:block opacity-10" aria-hidden="true">
          <LoSange size={55} fill="#F5C200" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <nav
            className="flex items-center gap-2 text-xs mb-6 font-medium flex-wrap"
            aria-label="Fil d'ariane"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <Link href="/" className="hover:text-white transition-colors underline-offset-2 hover:underline">
              Accueil
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span className="font-semibold" style={{ color: "#F5C200" }}>Médiathèque</span>
          </nav>

          <RangeePerles count={7} color="#F5C200" size={6} gap={8} opacity={0.6} />

          <div className="mt-5 flex items-start gap-5">
            <div
              className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ring-2 ring-white/20"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <Images className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white text-balance leading-tight tracking-tight">
                Album Photo de la Ville
              </h1>
              <p className="mt-2 text-sm md:text-base text-pretty max-w-xl" style={{ color: "rgba(255,255,255,0.82)" }}>
                {photos.length} photo{photos.length !== 1 ? "s" : ""} de Bafoussam : patrimoine, événements et
                réalisations de la Communauté Urbaine.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex" style={{ height: 4 }} aria-hidden="true">
          <div className="flex-1" style={{ backgroundColor: "#F5C200" }} />
          <div style={{ width: "20%", backgroundColor: "white" }} />
          <div className="flex-1" style={{ backgroundColor: "#0D2F6E" }} />
        </div>
      </div>

      <main className="flex-1 py-14" style={{ backgroundColor: "#F0F4FA" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-lg shadow-blue-950/5" style={{ borderColor: "rgba(27,79,168,0.12)" }}>
            {photos.length > 0 ? (
              <GalleryBrowser albums={albums} photos={photos} />
            ) : (
              <p className="py-16 text-center text-sm" style={{ color: "#64748B" }}>
                Aucune photo n&apos;est encore publiée dans la médiathèque.
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
