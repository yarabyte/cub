"use client"

import { useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FolderOpen,
  ImageOff,
  Images,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { IMAGE_ACCEPT, IMAGE_MAX_BYTES } from "@/lib/article-schema"
import {
  ALBUM_NAME_MAX,
  albumSchema,
  GALLERY_CAPTION_MAX,
  GALLERY_HOME_LIMIT,
  GALLERY_UPLOAD_MAX_FILES,
  type GalleryAlbum,
  type GalleryPhoto,
} from "@/lib/gallery-schema"
import { cn } from "@/lib/utils"

type Filter = "all" | "none" | number

const ACCEPTED_TYPES = IMAGE_ACCEPT.split(",")

async function api<T>(url: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData
  const res = await fetch(url, {
    ...init,
    headers: isForm || !init.body ? init.headers : { "Content-Type": "application/json", ...init.headers },
  }).catch(() => null)
  const data = res ? await res.json().catch(() => ({})) : {}
  if (!res || !res.ok) throw new Error(data.error ?? "Opération impossible")
  return data as T
}

/** Puts `visibleOrder` back into the slots the visible photos occupy in `all`, like the server does. */
function applySubsetOrder(all: GalleryPhoto[], visibleOrder: GalleryPhoto[]): GalleryPhoto[] {
  const ids = new Set(visibleOrder.map((p) => p.id))
  let i = 0
  return all.map((p) => (ids.has(p.id) ? visibleOrder[i++] : p))
}

type AlbumEditor = { id: number | null; name: string; error: string | null } | null

export default function MediathequeManager({
  initialAlbums,
  initialPhotos,
}: {
  initialAlbums: GalleryAlbum[]
  initialPhotos: GalleryPhoto[]
}) {
  const [albums, setAlbums] = useState(initialAlbums)
  const [photos, setPhotos] = useState(initialPhotos)
  const [filter, setFilter] = useState<Filter>("all")
  const [albumEditor, setAlbumEditor] = useState<AlbumEditor>(null)
  const [savingAlbum, setSavingAlbum] = useState(false)
  const [albumToDelete, setAlbumToDelete] = useState<GalleryAlbum | null>(null)
  const [photoToDelete, setPhotoToDelete] = useState<GalleryPhoto | null>(null)
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const counts = useMemo(() => {
    const map = new Map<number | null, number>()
    for (const p of photos) map.set(p.albumId, (map.get(p.albumId) ?? 0) + 1)
    return map
  }, [photos])

  const visible = useMemo(
    () =>
      filter === "all"
        ? photos
        : photos.filter((p) => (filter === "none" ? p.albumId === null : p.albumId === filter)),
    [photos, filter]
  )
  const homeIds = useMemo(() => new Set(photos.slice(0, GALLERY_HOME_LIMIT).map((p) => p.id)), [photos])

  const selectedAlbum = typeof filter === "number" ? albums.find((a) => a.id === filter) ?? null : null
  const title = filter === "all" ? "Toutes les photos" : filter === "none" ? "Sans album" : selectedAlbum?.name ?? ""
  const uploadAlbumId = selectedAlbum?.id ?? null

  /* ── Albums ── */

  async function saveAlbum(e: React.FormEvent) {
    e.preventDefault()
    if (!albumEditor) return
    const parsed = albumSchema.safeParse({ name: albumEditor.name })
    if (!parsed.success) {
      setAlbumEditor({ ...albumEditor, error: parsed.error.issues[0]?.message ?? "Nom invalide" })
      return
    }
    setSavingAlbum(true)
    try {
      if (albumEditor.id) {
        const album = await api<GalleryAlbum>(`/api/admin/mediatheque/albums/${albumEditor.id}`, {
          method: "PATCH",
          body: JSON.stringify(parsed.data),
        })
        setAlbums((list) => list.map((a) => (a.id === album.id ? album : a)))
        toast.success("Album renommé", { description: album.name })
      } else {
        const album = await api<GalleryAlbum>("/api/admin/mediatheque/albums", {
          method: "POST",
          body: JSON.stringify(parsed.data),
        })
        setAlbums((list) => [...list, { id: album.id, name: album.name, slug: album.slug }])
        setFilter(album.id)
        toast.success("Album créé", { description: album.name })
      }
      setAlbumEditor(null)
    } catch (err) {
      setAlbumEditor({ ...albumEditor, error: err instanceof Error ? err.message : "Enregistrement impossible" })
    } finally {
      setSavingAlbum(false)
    }
  }

  async function moveAlbum(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= albums.length) return
    const previous = albums
    const next = [...albums]
    ;[next[index], next[target]] = [next[target], next[index]]
    setAlbums(next)
    try {
      await api("/api/admin/mediatheque/albums/reorder", {
        method: "PUT",
        body: JSON.stringify({ ids: next.map((a) => a.id) }),
      })
    } catch (err) {
      setAlbums(previous)
      toast.error(err instanceof Error ? err.message : "Réordonnancement impossible")
    }
  }

  async function confirmDeleteAlbum() {
    const album = albumToDelete
    if (!album) return
    setAlbumToDelete(null)
    try {
      await api(`/api/admin/mediatheque/albums/${album.id}`, { method: "DELETE" })
      setAlbums((list) => list.filter((a) => a.id !== album.id))
      setPhotos((list) => list.map((p) => (p.albumId === album.id ? { ...p, albumId: null } : p)))
      if (filter === album.id) setFilter("all")
      toast.success("Album supprimé", { description: album.name })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Suppression impossible")
    }
  }

  /* ── Photos ── */

  async function uploadFiles(list: FileList | null | undefined) {
    if (fileInput.current) fileInput.current.value = ""
    if (!list || list.length === 0 || uploading) return
    const files = Array.from(list)
    const valid = files.filter((f) => ACCEPTED_TYPES.includes(f.type) && f.size <= IMAGE_MAX_BYTES)
    if (valid.length < files.length) {
      toast.error(`${files.length - valid.length} fichier(s) ignoré(s)`, {
        description: "JPG, PNG ou WebP de 5 Mo maximum.",
      })
    }
    if (valid.length === 0) return

    setUploading({ done: 0, total: valid.length })
    let added = 0
    try {
      // Batches are sent last-first so the first chosen file ends up first, as new photos go to the top.
      const batches: File[][] = []
      for (let i = 0; i < valid.length; i += GALLERY_UPLOAD_MAX_FILES) batches.push(valid.slice(i, i + GALLERY_UPLOAD_MAX_FILES))
      for (const batch of batches.reverse()) {
        const body = new FormData()
        for (const file of batch) body.append("photos", file)
        if (uploadAlbumId) body.set("albumId", String(uploadAlbumId))
        const created = await api<GalleryPhoto[]>("/api/admin/mediatheque/photos", { method: "POST", body })
        setPhotos((current) => [...created, ...current])
        added += created.length
        setUploading({ done: added, total: valid.length })
      }
      toast.success(`${added} photo${added > 1 ? "s" : ""} ajoutée${added > 1 ? "s" : ""}`, {
        description: selectedAlbum ? `Album « ${selectedAlbum.name} »` : "Sans album",
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Envoi impossible", {
        description: added > 0 ? `${added} photo(s) ajoutée(s) avant l'erreur.` : undefined,
      })
    } finally {
      setUploading(null)
    }
  }

  async function patchPhoto(photo: GalleryPhoto, patch: { caption?: string; albumId?: number | null }) {
    const previous = photos
    setPhotos((list) => list.map((p) => (p.id === photo.id ? { ...p, ...patch } : p)))
    try {
      await api(`/api/admin/mediatheque/photos/${photo.id}`, { method: "PATCH", body: JSON.stringify(patch) })
      if (patch.caption !== undefined) toast.success("Légende enregistrée")
      if (patch.albumId !== undefined) {
        const album = albums.find((a) => a.id === patch.albumId)
        toast.success(album ? `Photo déplacée dans « ${album.name} »` : "Photo retirée de son album")
      }
    } catch (err) {
      setPhotos(previous)
      toast.error(err instanceof Error ? err.message : "Modification impossible")
    }
  }

  async function movePhoto(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= visible.length) return
    const previous = photos
    const order = [...visible]
    ;[order[index], order[target]] = [order[target], order[index]]
    setPhotos(applySubsetOrder(photos, order))
    try {
      await api("/api/admin/mediatheque/photos/reorder", {
        method: "PUT",
        body: JSON.stringify({ ids: order.map((p) => p.id) }),
      })
    } catch (err) {
      setPhotos(previous)
      toast.error(err instanceof Error ? err.message : "Réordonnancement impossible")
    }
  }

  async function confirmDeletePhoto() {
    const photo = photoToDelete
    if (!photo) return
    setPhotoToDelete(null)
    try {
      await api(`/api/admin/mediatheque/photos/${photo.id}`, { method: "DELETE" })
      setPhotos((list) => list.filter((p) => p.id !== photo.id))
      toast.success("Photo supprimée")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Suppression impossible")
    }
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
      uploadFiles(e.dataTransfer.files)
    },
  }

  const filterButton = (value: Filter, label: string, count: number, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => setFilter(value)}
      className={cn(
        "flex w-full min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
        filter === value ? "bg-[#1B4FA8] font-semibold text-white" : "text-slate-700 hover:bg-[#1B4FA8]/8"
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className={cn("text-xs tabular-nums", filter === value ? "text-white/80" : "text-slate-400")}>{count}</span>
    </button>
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* ── Albums ── */}
      <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
        <section className="rounded-2xl border border-[#1B4FA8]/12 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-[#0D1A2E]">Albums</h2>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-[#1B4FA8]"
              onClick={() => setAlbumEditor({ id: null, name: "", error: null })}
            >
              <Plus className="size-4" />
              Nouvel album
            </Button>
          </div>
          <div className="space-y-0.5">
            {filterButton("all", "Toutes les photos", photos.length, <Images className="size-4 shrink-0" />)}
            {albums.map((album, i) => (
              <div key={album.id} className="group flex items-center gap-0.5">
                {filterButton(album.id, album.name, counts.get(album.id) ?? 0, <FolderOpen className="size-4 shrink-0" />)}
                <div className="flex shrink-0 opacity-60 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={i === 0}
                    onClick={() => moveAlbum(i, -1)}
                    aria-label={`Monter l'album ${album.name}`}
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={i === albums.length - 1}
                    onClick={() => moveAlbum(i, 1)}
                    aria-label={`Descendre l'album ${album.name}`}
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => setAlbumEditor({ id: album.id, name: album.name, error: null })}
                    aria-label={`Renommer l'album ${album.name}`}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setAlbumToDelete(album)}
                    aria-label={`Supprimer l'album ${album.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {(counts.get(null) ?? 0) > 0 &&
              filterButton("none", "Sans album", counts.get(null) ?? 0, <ImageOff className="size-4 shrink-0" />)}
          </div>
        </section>
        <p className="px-1 text-xs text-slate-500">
          L&apos;ordre des albums est celui des filtres du site. Les albums sans photo n&apos;y apparaissent pas.
        </p>
        <Button variant="outline" size="sm" asChild className="w-full">
          <a href="/mediatheque" target="_blank" rel="noopener noreferrer">
            <ExternalLink />
            Voir la médiathèque
          </a>
        </Button>
      </aside>

      {/* ── Photos ── */}
      <section className="min-w-0 rounded-2xl border border-[#1B4FA8]/12 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-[#0D1A2E]">{title}</h2>
            <p className="text-sm text-slate-500">
              {visible.length} photo{visible.length !== 1 ? "s" : ""}
              {filter === "all" && ` · les ${GALLERY_HOME_LIMIT} premières s'affichent sur l'accueil`}
            </p>
          </div>
          <Button
            onClick={() => fileInput.current?.click()}
            disabled={uploading !== null}
            className="bg-[#1B4FA8] text-white hover:bg-[#1B4FA8]/90"
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
            {uploading ? `Envoi ${uploading.done}/${uploading.total}…` : "Ajouter des photos"}
          </Button>
        </div>

        <input
          ref={fileInput}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => uploadFiles(e.target.files)}
        />

        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading !== null}
          {...dropHandlers}
          className={cn(
            "mb-5 flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 text-center transition-colors",
            visible.length === 0 ? "py-14" : "py-5",
            dragging ? "border-[#1B4FA8] bg-[#1B4FA8]/5" : "border-slate-200 hover:border-[#1B4FA8]/50 hover:bg-slate-50"
          )}
        >
          <UploadCloud className="size-6 text-[#1B4FA8]/60" />
          <span className="text-sm font-medium text-slate-700">Glissez des photos ou cliquez pour les choisir</span>
          <span className="text-xs text-slate-400">
            {selectedAlbum ? `Ajoutées dans « ${selectedAlbum.name} »` : "Ajoutées sans album"} · placées en tête ·
            JPG, PNG ou WebP, 5 Mo max
          </span>
        </button>

        {visible.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((photo, i) => (
              <div key={photo.id} className="overflow-hidden rounded-lg border bg-slate-50">
                <div className="relative aspect-[4/3] bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt={photo.caption || `Photo ${i + 1}`} className="size-full object-cover" loading="lazy" />
                  <span className="absolute left-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0D1A2E]/70 px-1.5 text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                  {homeIds.has(photo.id) && (
                    <span className="absolute right-1.5 top-1.5 rounded bg-[#F5C200] px-1.5 py-0.5 text-[10px] font-bold text-[#0D1A2E]">
                      Accueil
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => movePhoto(i, -1)}
                        disabled={i === 0}
                        className="flex size-7 items-center justify-center rounded-md bg-white/90 text-slate-700 hover:bg-white disabled:opacity-40"
                        aria-label={`Déplacer la photo ${i + 1} vers la gauche`}
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePhoto(i, 1)}
                        disabled={i === visible.length - 1}
                        className="flex size-7 items-center justify-center rounded-md bg-white/90 text-slate-700 hover:bg-white disabled:opacity-40"
                        aria-label={`Déplacer la photo ${i + 1} vers la droite`}
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhotoToDelete(photo)}
                      className="flex size-7 items-center justify-center rounded-md bg-white/90 text-red-600 hover:bg-red-50"
                      aria-label={`Supprimer la photo ${i + 1}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 p-2">
                  <CaptionInput
                    key={`${photo.id}-${photo.caption}`}
                    initial={photo.caption}
                    label={`Légende de la photo ${i + 1}`}
                    onSave={(caption) => patchPhoto(photo, { caption })}
                  />
                  <select
                    value={photo.albumId ?? ""}
                    onChange={(e) => patchPhoto(photo, { albumId: e.target.value ? Number(e.target.value) : null })}
                    aria-label={`Album de la photo ${i + 1}`}
                    className="h-8 w-full rounded-md border border-input bg-white px-2 text-xs text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4FA8]/40"
                  >
                    <option value="">Sans album</option>
                    {albums.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog open={albumEditor !== null} onOpenChange={(open) => !open && !savingAlbum && setAlbumEditor(null)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={saveAlbum} noValidate>
            <DialogHeader>
              <DialogTitle>{albumEditor?.id ? "Renommer l'album" : "Nouvel album"}</DialogTitle>
              <DialogDescription>Le nom apparaît dans les filtres de la médiathèque.</DialogDescription>
            </DialogHeader>
            {albumEditor && (
              <div className="space-y-2 py-4">
                <Label htmlFor="album-name">Nom</Label>
                <Input
                  id="album-name"
                  value={albumEditor.name}
                  onChange={(e) => setAlbumEditor({ ...albumEditor, name: e.target.value, error: null })}
                  maxLength={ALBUM_NAME_MAX}
                  aria-invalid={Boolean(albumEditor.error)}
                  autoFocus
                />
                {albumEditor.error && <p className="text-sm text-red-600">{albumEditor.error}</p>}
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAlbumEditor(null)} disabled={savingAlbum}>
                Annuler
              </Button>
              <Button type="submit" disabled={savingAlbum} className="bg-[#1B4FA8] text-white hover:bg-[#1B4FA8]/90">
                {savingAlbum && <Loader2 className="size-4 animate-spin" />}
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={albumToDelete !== null} onOpenChange={(open) => !open && setAlbumToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l&apos;album « {albumToDelete?.name} » ?</AlertDialogTitle>
            <AlertDialogDescription>
              {albumToDelete && (counts.get(albumToDelete.id) ?? 0) > 0
                ? `Ses ${counts.get(albumToDelete.id)} photo(s) ne sont pas supprimées : elles passent dans « Sans album ».`
                : "Cet album ne contient aucune photo."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAlbum} className="bg-red-600 text-white hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={photoToDelete !== null} onOpenChange={(open) => !open && setPhotoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette photo ?</AlertDialogTitle>
            <AlertDialogDescription>
              {photoToDelete?.caption ? `« ${photoToDelete.caption} » sera` : "Elle sera"} retirée du site. Cette
              action est définitive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePhoto} className="bg-red-600 text-white hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/** Saves on blur or Enter, only when the value changed. */
function CaptionInput({ initial, label, onSave }: { initial: string; label: string; onSave: (value: string) => void }) {
  const [value, setValue] = useState(initial)
  const commit = () => {
    const trimmed = value.trim()
    if (trimmed !== initial) onSave(trimmed)
  }
  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur()
        if (e.key === "Escape") setValue(initial)
      }}
      maxLength={GALLERY_CAPTION_MAX}
      placeholder="Légende (facultatif)"
      aria-label={label}
      className="h-8 bg-white text-xs"
    />
  )
}
