"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ImagePlus, Loader2, Pencil, Plus, RefreshCw, Save, Trash2, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import CategoryBadge from "@/components/category-badge"
import { articleFormSchema, IMAGE_ACCEPT, IMAGE_MAX_BYTES, type ArticleFormValues } from "@/lib/article-schema"
import type { ArticlePhoto } from "@/lib/articles-db"
import { slugify } from "@/lib/slugify"
import { cn } from "@/lib/utils"
import ArticlePhotosEditor, { type PhotoDraft } from "./article-photos-editor"
import { RichTextEditor } from "./rich-text-editor"
import type { CategoryOption } from "./types"

type Props = {
  articleId?: number
  initialValues: ArticleFormValues
  initialImageUrl: string | null
  initialPhotos: ArticlePhoto[]
  categories: CategoryOption[]
}

const ACCEPTED_TYPES = IMAGE_ACCEPT.split(",")

function toDrafts(photos: ArticlePhoto[]): PhotoDraft[] {
  return photos.map((p) => ({ key: `photo-${p.id}`, id: p.id, preview: p.url, caption: p.caption ?? "" }))
}

function revokePreviews(photos: PhotoDraft[]) {
  for (const p of photos) if (p.preview.startsWith("blob:")) URL.revokeObjectURL(p.preview)
}

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-[#1B4FA8]/12 bg-white p-5 shadow-sm", className)}>
      <h2 className="mb-4 text-sm font-semibold text-[#0D1A2E]">{title}</h2>
      {children}
    </section>
  )
}

export default function ArticleForm({ articleId, initialValues, initialImageUrl, initialPhotos, categories }: Props) {
  const router = useRouter()
  const isEdit = articleId !== undefined
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: initialValues,
  })
  const [slugManual, setSlugManual] = useState(isEdit || initialValues.slug !== slugify(initialValues.title))
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(initialImageUrl)
  const [imageError, setImageError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<PhotoDraft[]>(() => toDrafts(initialPhotos))
  const [photosDirty, setPhotosDirty] = useState(false)
  const [photosError, setPhotosError] = useState<string | null>(null)
  const photosRef = useRef(photos)
  const submitting = form.formState.isSubmitting

  useEffect(() => {
    photosRef.current = photos
  }, [photos])
  useEffect(() => () => revokePreviews(photosRef.current), [])

  function changePhotos(next: PhotoDraft[]) {
    setPhotos(next)
    setPhotosDirty(true)
    setPhotosError(null)
  }

  const title = form.watch("title")
  useEffect(() => {
    if (!slugManual) form.setValue("slug", slugify(title), { shouldValidate: form.formState.isSubmitted })
  }, [title, slugManual, form])

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const dirty = form.formState.isDirty || imageFile !== null || photosDirty
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  function pickImage(file: File | undefined) {
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setImageError("Format non accepté : utilisez JPG, PNG ou WebP")
      return
    }
    if (file.size > IMAGE_MAX_BYTES) {
      setImageError("L'image dépasse 5 Mo")
      return
    }
    setImageError(null)
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
    form.setValue("removeImage", false)
  }

  function removeImage() {
    setImageFile(null)
    setPreview(null)
    setImageError(null)
    form.setValue("removeImage", initialImageUrl !== null, { shouldDirty: true })
    if (fileInput.current) fileInput.current.value = ""
  }

  async function onSubmit(values: ArticleFormValues) {
    const body = new FormData()
    const uploads: File[] = []
    const photoItems = photos.map((p) =>
      p.file ? { upload: uploads.push(p.file) - 1, caption: p.caption } : { id: p.id!, caption: p.caption }
    )
    body.append("data", JSON.stringify({ ...values, photos: photoItems }))
    if (imageFile) body.append("image", imageFile)
    for (const file of uploads) body.append("photos", file)

    const res = await fetch(isEdit ? `/api/admin/articles/${articleId}` : "/api/admin/articles", {
      method: isEdit ? "PUT" : "POST",
      body,
    }).catch(() => null)
    const data = res ? await res.json().catch(() => ({})) : {}

    if (!res || !res.ok) {
      const message = data.error ?? "Enregistrement impossible"
      if (data.field === "image") setImageError(message)
      else if (data.field === "photos") setPhotosError(message)
      else if (data.field && data.field in values) {
        form.setError(data.field as keyof ArticleFormValues, { message })
      }
      toast.error(message)
      return
    }

    toast.success(isEdit ? "Article enregistré" : "Article créé", {
      description: values.status === "published" ? "Visible sur le site." : "Enregistré comme brouillon.",
    })
    setPhotosDirty(false)
    if (isEdit) {
      form.reset({ ...values, removeImage: false, slug: data.slug ?? values.slug })
      setImageFile(null)
      if (Array.isArray(data.photos)) {
        revokePreviews(photos)
        setPhotos(toDrafts(data.photos))
      }
      router.refresh()
    } else {
      form.reset(values)
      setImageFile(null)
      if (data.photosError) toast.warning(data.photosError)
      router.push(`/admin/actualites/${data.id}`)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" noValidate>
        <div className="min-w-0 space-y-6">
          <Panel title="Contenu">
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Titre de l’article" className="text-base font-medium" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse (slug)</FormLabel>
                    <div className="flex items-center gap-2">
                      <div className="flex min-w-0 flex-1 items-center rounded-md border bg-slate-50 pl-3 text-sm text-slate-500 focus-within:ring-[3px] focus-within:ring-[#1B4FA8]/15">
                        <span className="shrink-0">/actualites/</span>
                        <FormControl>
                          <input
                            {...field}
                            readOnly={!slugManual}
                            className="h-9 min-w-0 flex-1 bg-transparent pr-3 text-slate-800 outline-none read-only:text-slate-500"
                          />
                        </FormControl>
                      </div>
                      {slugManual ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          title="Régénérer depuis le titre"
                          aria-label="Régénérer le slug depuis le titre"
                          onClick={() => setSlugManual(false)}
                        >
                          <RefreshCw className="size-4" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          title="Modifier manuellement"
                          aria-label="Modifier le slug manuellement"
                          onClick={() => setSlugManual(true)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      )}
                    </div>
                    <FormDescription className="flex items-center gap-1">
                      {slugManual ? <Pencil className="size-3" /> : <RefreshCw className="size-3" />}
                      {slugManual ? "Saisie manuelle." : "Généré automatiquement à partir du titre."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Extrait</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} placeholder="Résumé affiché dans les listes d’articles" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Texte de l’article</FormLabel>
                    <RichTextEditor value={field.value} onChange={field.onChange} invalid={Boolean(fieldState.error)} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Panel>

          <ArticlePhotosEditor photos={photos} onChange={changePhotos} error={photosError} />
        </div>

        <aside className="min-w-0 space-y-6 lg:sticky lg:top-20 lg:self-start">
          <Panel title="Publication">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="published">Publié</SelectItem>
                        <SelectItem value="draft">Brouillon</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="publishedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de publication</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>Vide : date et heure de la première publication.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="authorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Auteur</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Service communication" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-3 rounded-lg border border-[#F5C200]/40 bg-[#F5C200]/8 px-3 py-2.5">
                    <div>
                      <FormLabel>Mettre à la une</FormLabel>
                      <FormDescription className="text-xs">Mis en avant sur la page d’accueil.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </Panel>

          <Panel title="Catégories">
            <FormField
              control={form.control}
              name="categoryIds"
              render={({ field }) => (
                <FormItem>
                  {categories.length === 0 ? (
                    <p className="text-sm text-slate-500">Aucune catégorie pour le moment.</p>
                  ) : (
                    <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                      {categories.map((c) => {
                        const checked = field.value.includes(c.id)
                        return (
                          <Label
                            key={c.id}
                            className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 font-normal hover:bg-slate-50"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) =>
                                field.onChange(v ? [...field.value, c.id] : field.value.filter((id) => id !== c.id))
                              }
                            />
                            <CategoryBadge category={c} />
                          </Label>
                        )
                      })}
                    </div>
                  )}
                  <Link
                    href="/admin/categories"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#1B4FA8] hover:underline"
                  >
                    <Plus className="size-3" /> Gérer les catégories
                  </Link>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Panel>

          <Panel title="Image à la une">
            <input
              ref={fileInput}
              type="file"
              accept={IMAGE_ACCEPT}
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => pickImage(e.target.files?.[0])}
            />
            {preview ? (
              <div className="space-y-2">
                <div className="relative aspect-video overflow-hidden rounded-lg border bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Aperçu de l’image à la une" className="size-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => fileInput.current?.click()}>
                    <ImagePlus className="size-4" /> Remplacer
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeImage}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="size-4" /> Retirer
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragging(false)
                  pickImage(e.dataTransfer.files?.[0])
                }}
                className={cn(
                  "flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-center transition-colors",
                  dragging
                    ? "border-[#1B4FA8] bg-[#1B4FA8]/5"
                    : "border-slate-200 hover:border-[#1B4FA8]/50 hover:bg-slate-50"
                )}
              >
                <UploadCloud className="size-7 text-[#1B4FA8]/60" />
                <span className="text-sm font-medium text-slate-700">Glissez une image ou cliquez</span>
                <span className="text-xs text-slate-400">JPG, PNG ou WebP · 5 Mo max</span>
              </button>
            )}
            {imageFile && <p className="mt-2 truncate text-xs text-slate-500">Nouvelle image : {imageFile.name}</p>}
            {imageError && <p className="mt-2 text-sm text-red-600">{imageError}</p>}
            <p className="mt-2 text-xs text-slate-400">Redimensionnée à 1200 px de large et convertie en WebP.</p>
          </Panel>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#1B4FA8] font-semibold text-white hover:bg-[#1B4FA8]/90"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {isEdit ? "Enregistrer" : "Créer l’article"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/actualites">Annuler</Link>
            </Button>
          </div>
        </aside>
      </form>
    </Form>
  )
}
