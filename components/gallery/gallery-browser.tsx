"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { LoSange } from "@/components/bamileke-pattern"
import type { GalleryAlbum, GalleryPhoto } from "@/lib/gallery-schema"

const FALLBACK_ALT = "Photo de la ville de Bafoussam"

/** Album filters, mosaic grid and lightbox of the médiathèque. */
export default function GalleryBrowser({ albums, photos }: { albums: GalleryAlbum[]; photos: GalleryPhoto[] }) {
  const [activeAlbum, setActiveAlbum] = useState<number | "all">("all")
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filtered = activeAlbum === "all" ? photos : photos.filter((p) => p.albumId === activeAlbum)
  const albumName = (id: number | null) => albums.find((a) => a.id === id)?.name
  const altOf = (p: GalleryPhoto) => p.caption || albumName(p.albumId) || FALLBACK_ALT

  const closeLightbox = () => setLightboxIndex(null)
  const prev = () => setLightboxIndex((i) => (i !== null ? (i - 1 + filtered.length) % filtered.length : 0))
  const next = () => setLightboxIndex((i) => (i !== null ? (i + 1) % filtered.length : 0))

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null)
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i !== null ? (i - 1 + filtered.length) % filtered.length : 0))
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i !== null ? (i + 1) % filtered.length : 0))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [lightboxIndex, filtered.length])

  const current = lightboxIndex !== null ? filtered[lightboxIndex] : null

  return (
    <>
      {/* Filtres par album */}
      {albums.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {[{ id: "all" as const, name: "Tous", count: photos.length }, ...albums.map((a) => ({
            id: a.id,
            name: a.name,
            count: photos.filter((p) => p.albumId === a.id).length,
          }))].map((item) => {
            const isActive = activeAlbum === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveAlbum(item.id)}
                aria-pressed={isActive}
                className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all"
                style={{
                  backgroundColor: isActive ? "#1B4FA8" : "#F2F4F8",
                  color: isActive ? "white" : "#1a2a4a",
                }}
              >
                {item.name} ({item.count})
              </button>
            )
          })}
        </div>
      )}

      {/* Grille masonry-style */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className="group relative rounded-xl overflow-hidden focus:outline-none focus-visible:ring-2"
            style={{
              aspectRatio: index % 5 === 0 ? "1 / 1.3" : index % 7 === 0 ? "1 / 0.75" : "1 / 1",
              gridRow: index % 5 === 0 ? "span 2" : "span 1",
            }}
            aria-label={`Ouvrir la photo : ${altOf(photo)}`}
          >
            <Image
              src={photo.url}
              alt={altOf(photo)}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {/* Overlay survol */}
            <div
              className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "linear-gradient(to top, rgba(11,43,107,0.90) 0%, rgba(11,43,107,0.30) 60%, transparent 100%)" }}
            >
              <div className="flex h-1 mb-2 rounded overflow-hidden" aria-hidden="true">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="flex-1" style={{ backgroundColor: i % 3 === 0 ? "#F5C200" : i % 3 === 1 ? "white" : "#1B4FA8" }} />
                ))}
              </div>
              {photo.caption && (
                <p className="text-white font-bold text-xs text-left leading-snug text-balance">{photo.caption}</p>
              )}
            </div>
            <div
              className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: "#F5C200" }}
            >
              <ZoomIn className="w-3.5 h-3.5" style={{ color: "#0D1A2E" }} />
            </div>
            {albumName(photo.albumId) && (
              <div
                className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: "#1B4FA8", color: "white" }}
              >
                {albumName(photo.albumId)}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* ── Lightbox ── */}
      {current && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(9,18,38,0.96)" }}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Visionneuse photo"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='56' height='56' viewBox='0 0 56 56' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 3L53 28L28 53L3 28Z' fill='none' stroke='%23F5C200' stroke-opacity='0.06' stroke-width='1'/%3E%3C/svg%3E")`,
              backgroundSize: "56px 56px",
            }}
          />

          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-5 right-5 z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-[#F5C200]"
            style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-4 z-10 w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:bg-[#1B4FA8]"
            style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
            aria-label="Photo précédente"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <div className="relative mx-20 max-w-4xl w-full" style={{ maxHeight: "80vh" }} onClick={(e) => e.stopPropagation()}>
            <div className="relative rounded-2xl overflow-hidden bg-black/30" style={{ aspectRatio: "16/10" }}>
              <Image src={current.url} alt={altOf(current)} fill className="object-contain" sizes="90vw" priority />
              <div className="absolute bottom-0 left-0 right-0 flex h-2" aria-hidden="true">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className="flex-1" style={{ backgroundColor: i % 3 === 0 ? "#F5C200" : i % 3 === 1 ? "white" : "#1B4FA8" }} />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 mt-4 px-1">
              <div className="flex min-w-0 items-center gap-3">
                <LoSange size={10} fill="#F5C200" opacity={0.8} />
                <p className="text-sm font-semibold text-white">{current.caption || albumName(current.albumId) || ""}</p>
              </div>
              <span className="shrink-0 text-xs font-bold tabular-nums" style={{ color: "rgba(255,255,255,0.45)" }}>
                {lightboxIndex + 1} / {filtered.length}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
              {filtered.map((photo, i) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i) }}
                  className="relative shrink-0 rounded-lg overflow-hidden transition-all"
                  style={{
                    width: 56,
                    height: 40,
                    outline: i === lightboxIndex ? "2px solid #F5C200" : "2px solid transparent",
                    opacity: i === lightboxIndex ? 1 : 0.5,
                  }}
                  aria-label={altOf(photo)}
                  aria-current={i === lightboxIndex}
                >
                  <Image src={photo.url} alt="" fill className="object-cover" sizes="56px" />
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-4 z-10 w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:bg-[#1B4FA8]"
            style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
            aria-label="Photo suivante"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
    </>
  )
}
