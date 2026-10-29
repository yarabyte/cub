import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { RangeePerles, LoSange } from "./bamileke-pattern"
import GalleryBrowser from "./gallery/gallery-browser"
import type { GalleryAlbum, GalleryPhoto } from "@/lib/gallery-schema"

export default function GalerieSection({ albums, photos }: { albums: GalleryAlbum[]; photos: GalleryPhoto[] }) {
  if (photos.length === 0) return null

  return (
    <section id="galerie" className="py-20 relative overflow-hidden" style={{ backgroundColor: "#ffffff" }}>

      {/* Motif de fond — pointillés légers */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='16' cy='16' r='1.2' fill='%231B4FA8' fill-opacity='0.06'/%3E%3C/svg%3E")`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3" aria-hidden="true">
              <RangeePerles count={6} color="#1B4FA8" size={6} gap={7} opacity={0.5} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.22em] mb-2" style={{ color: "#F5C200" }}>
              Médiathèque
            </p>
            <h2 className="text-3xl font-black text-balance" style={{ color: "#0D1A2E" }}>
              Album Photo de la Ville
            </h2>
          </div>
          <Link
            href="/mediatheque"
            className="shrink-0 hidden sm:flex items-center gap-2 text-sm font-bold transition-all hover:gap-3"
            style={{ color: "#1B4FA8" }}
          >
            Voir toute la médiathèque
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Séparateur losanges */}
        <div className="flex items-center gap-1 mb-8" aria-hidden="true">
          <div className="h-0.5 flex-1 rounded" style={{ backgroundColor: "#F2F4F8" }} />
          {[0, 1, 2].map((i) => <LoSange key={i} size={i === 1 ? 12 : 8} fill={i === 1 ? "#1B4FA8" : "#F5C200"} opacity={0.5} />)}
          <div className="h-0.5 flex-1 rounded" style={{ backgroundColor: "#F2F4F8" }} />
        </div>

        <GalleryBrowser albums={albums} photos={photos} />

        {/* CTA voir plus mobile */}
        <div className="flex justify-center mt-8 sm:hidden">
          <Link
            href="/mediatheque"
            className="flex items-center gap-2 text-sm font-bold transition-all hover:gap-3"
            style={{ color: "#1B4FA8" }}
          >
            Voir toute la médiathèque
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
