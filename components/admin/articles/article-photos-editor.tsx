"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, ImagePlus, Trash2, UploadCloud } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ARTICLE_PHOTOS_MAX, IMAGE_ACCEPT, IMAGE_MAX_BYTES, PHOTO_CAPTION_MAX } from "@/lib/article-schema"
import { cn } from "@/lib/utils"

/** A gallery photo being edited: either stored (`id`) or picked in this session (`file`). */
export type PhotoDraft = { key: string; id?: number; file?: File; preview: string; caption: string }

const ACCEPTED_TYPES = IMAGE_ACCEPT.split(",")

type Props = {
  photos: PhotoDraft[]
  onChange: (photos: PhotoDraft[]) => void
  error: string | null
}

export default function ArticlePhotosEditor({ photos, onChange, error }: Props) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const remaining = ARTICLE_PHOTOS_MAX - photos.length

  function addFiles(list: FileList | null | undefined) {
    if (!list || list.length === 0) return
    const files = Array.from(list)
    const valid = files.filter((f) => ACCEPTED_TYPES.includes(f.type) && f.size <= IMAGE_MAX_BYTES)
    const rejected = files.length - valid.length
    if (rejected > 0) {
      toast.error(`${rejected} fichier(s) ignoré(s)`, { description: "JPG, PNG ou WebP de 5 Mo maximum." })
    }
    const accepted = valid.slice(0, Math.max(0, remaining))
    if (valid.length > accepted.length) {
      toast.warning(`Limite de ${ARTICLE_PHOTOS_MAX} photos atteinte`, {
        description: `${valid.length - accepted.length} photo(s) non ajoutée(s).`,
      })
    }
    if (accepted.length > 0) {
      onChange([
        ...photos,
        ...accepted.map((file) => ({
          key: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          caption: "",
        })),
      ])
    }
    if (fileInput.current) fileInput.current.value = ""
  }

  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= photos.length) return
    const next = [...photos]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  function remove(index: number) {
    const photo = photos[index]
    if (photo.preview.startsWith("blob:")) URL.revokeObjectURL(photo.preview)
    onChange(photos.filter((_, i) => i !== index))
  }

  function setCaption(index: number, caption: string) {
    onChange(photos.map((p, i) => (i === index ? { ...p, caption } : p)))
  }

  const dropHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(true)
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      addFiles(e.dataTransfer.files)
    },
  }

  return (
    <section className="rounded-2xl border border-[#1B4FA8]/12 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[#0D1A2E]">Photos de l’article</h2>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums",
            remaining === 0 ? "bg-[#F5C200]/20 text-[#7a5c00]" : "bg-[#1B4FA8]/8 text-[#1B4FA8]"
          )}
        >
          {photos.length} / {ARTICLE_PHOTOS_MAX}
        </span>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => addFiles(e.target.files)}
      />

      {photos.length === 0 ? (
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          {...dropHandlers}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-10 text-center transition-colors",
            dragging ? "border-[#1B4FA8] bg-[#1B4FA8]/5" : "border-slate-200 hover:border-[#1B4FA8]/50 hover:bg-slate-50"
          )}
        >
          <UploadCloud className="size-7 text-[#1B4FA8]/60" />
          <span className="text-sm font-medium text-slate-700">Glissez des photos ou cliquez pour les choisir</span>
          <span className="text-xs text-slate-400">
            {ARTICLE_PHOTOS_MAX} photos maximum · JPG, PNG ou WebP · 5 Mo max par photo
          </span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {photos.map((photo, i) => (
            <div key={photo.key} className="overflow-hidden rounded-lg border bg-slate-50">
              <div className="group relative aspect-[4/3] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.preview} alt={photo.caption || `Photo ${i + 1}`} className="size-full object-cover" />
                <span className="absolute left-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-[#0D1A2E]/70 text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                {photo.file && (
                  <span className="absolute right-1.5 top-1.5 rounded bg-[#F5C200] px-1.5 py-0.5 text-[10px] font-bold text-[#0D1A2E]">
                    Nouvelle
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="flex size-7 items-center justify-center rounded-md bg-white/90 text-slate-700 hover:bg-white disabled:opacity-40"
                      aria-label={`Déplacer la photo ${i + 1} vers la gauche`}
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === photos.length - 1}
                      className="flex size-7 items-center justify-center rounded-md bg-white/90 text-slate-700 hover:bg-white disabled:opacity-40"
                      aria-label={`Déplacer la photo ${i + 1} vers la droite`}
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="flex size-7 items-center justify-center rounded-md bg-white/90 text-red-600 hover:bg-red-50"
                    aria-label={`Supprimer la photo ${i + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <Input
                  value={photo.caption}
                  onChange={(e) => setCaption(i, e.target.value)}
                  maxLength={PHOTO_CAPTION_MAX}
                  placeholder="Légende (facultatif)"
                  aria-label={`Légende de la photo ${i + 1}`}
                  className="h-8 bg-white text-xs"
                />
              </div>
            </div>
          ))}

          {remaining > 0 && (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              {...dropHandlers}
              className={cn(
                "flex min-h-40 flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed p-3 text-center transition-colors",
                dragging ? "border-[#1B4FA8] bg-[#1B4FA8]/5" : "border-slate-200 hover:border-[#1B4FA8]/50 hover:bg-slate-50"
              )}
            >
              <ImagePlus className="size-6 text-[#1B4FA8]/60" />
              <span className="text-xs font-medium text-slate-700">Ajouter des photos</span>
              <span className="text-[11px] text-slate-400">encore {remaining}</span>
            </button>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <p className="mt-3 text-xs text-slate-400">
        Affichées en bas de l’article, dans cet ordre. Redimensionnées à 1200 px de large et converties en WebP.
      </p>
    </section>
  )
}
