"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { Camera, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"

type Photo = {
  url: string
  caption: string | null
}

type Props = {
  photos: Photo[]
  title: string
}

export default function ArticlePhotoGallery({ photos, title }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const altOf = (i: number) => photos[i].caption || `${title} — photo ${i + 1}`

  const prev = useCallback(
    () => setLightbox((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)),
    [photos.length]
  )
  const next = useCallback(
    () => setLightbox((i) => (i === null ? null : (i + 1) % photos.length)),
    [photos.length]
  )

  const open = lightbox !== null
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
      if (e.key === "Escape") setLightbox(null)
    }
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener("keydown", onKey)
    }
  }, [open, prev, next])

  const gridCols =
    photos.length === 1
      ? "grid-cols-1"
      : photos.length === 2
      ? "grid-cols-2"
      : photos.length === 3
      ? "grid-cols-3"
      : photos.length === 4
      ? "grid-cols-2 sm:grid-cols-4"
      : "grid-cols-2 sm:grid-cols-3"

  return (
    <>
      <section
        className="rounded-2xl border overflow-hidden mt-8"
        style={{ borderColor: "rgba(27,79,168,0.12)", backgroundColor: "white" }}
        aria-label="Photos de l'article"
      >
        <div
          className="flex items-center gap-2.5 px-5 py-3 border-b"
          style={{ borderColor: "rgba(27,79,168,0.10)" }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(27,79,168,0.08)" }}
          >
            <Camera className="w-3.5 h-3.5" style={{ color: "#1B4FA8" }} />
          </div>
          <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: "#1B4FA8" }}>
            Photos de l'article
          </h2>
          <span
            className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(27,79,168,0.08)", color: "#1B4FA8" }}
          >
            {photos.length} photo{photos.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="p-4" style={{ backgroundColor: "#F8FAFF" }}>
          <div className={`grid gap-3 ${gridCols}`}>
            {photos.map((photo, i) => (
              <button
                key={photo.url}
                type="button"
                onClick={() => setLightbox(i)}
                className="group relative rounded-lg overflow-hidden bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4FA8]"
                style={{ aspectRatio: photos.length === 1 ? "16/9" : photos.length === 2 ? "4/3" : "1/1" }}
                aria-label={`Agrandir : ${altOf(i)}`}
                title={photo.caption ?? undefined}
              >
                <Image
                  src={photo.url}
                  alt={altOf(i)}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes={photos.length === 1 ? "(min-width: 1024px) 760px, 100vw" : "(min-width: 640px) 260px, 50vw"}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {photo.caption && (
                  <span className="absolute inset-x-0 bottom-0 px-2.5 pb-2 pt-6 text-left text-[11px] font-medium leading-snug text-white line-clamp-2 bg-gradient-to-t from-black/70 to-transparent">
                    {photo.caption}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex h-1" aria-hidden="true">
          <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ width: 8, backgroundColor: i % 2 === 0 ? "#F5C200" : "white" }} />
          ))}
          <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
        </div>
      </section>

      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ backgroundColor: "rgba(13,26,46,0.98)" }}
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Galerie photos"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-[#F5C200]"
            style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
            aria-label="Fermer la galerie"
            autoFocus
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-2 sm:left-4 z-10 w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:bg-[#1B4FA8]"
              style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
              aria-label="Photo précédente"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}

          <div className="relative mx-14 sm:mx-20 max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full h-[65vh] sm:h-[72vh]">
              <Image
                key={photos[lightbox].url}
                src={photos[lightbox].url}
                alt={altOf(lightbox)}
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
            </div>

            <div className="flex items-start justify-between gap-4 mt-4 px-1">
              <p className="text-sm font-semibold text-white">{photos[lightbox].caption}</p>
              <span className="text-xs font-bold tabular-nums shrink-0" style={{ color: "rgba(255,255,255,0.45)" }}>
                {lightbox + 1} / {photos.length}
              </span>
            </div>

            {photos.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 overflow-x-auto pb-1">
                {photos.map((photo, i) => (
                  <button
                    key={photo.url}
                    type="button"
                    onClick={() => setLightbox(i)}
                    className="relative shrink-0 rounded-lg overflow-hidden transition-all"
                    style={{
                      width: 56, height: 40,
                      outline: i === lightbox ? "2px solid #F5C200" : "2px solid transparent",
                      opacity: i === lightbox ? 1 : 0.5,
                    }}
                    aria-label={`Afficher la photo ${i + 1}`}
                    aria-current={i === lightbox}
                  >
                    <Image src={photo.url} alt="" fill className="object-cover" sizes="56px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-2 sm:right-4 z-10 w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:bg-[#1B4FA8]"
              style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
              aria-label="Photo suivante"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      )}
    </>
  )
}
