"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ImagePlus, Loader2, Pencil, RefreshCw, Save, Trash2, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RichTextEditor } from "@/components/admin/articles/rich-text-editor"
import { IMAGE_ACCEPT, IMAGE_MAX_BYTES } from "@/lib/article-schema"
import {
  EVENT_CATEGORY_MAX,
  EVENT_LOCATION_MAX,
  EVENT_SUMMARY_MAX,
  eventFormSchema,
  type EventFormValues,
} from "@/lib/event-schema"
import { formatEventDate, formatEventTime } from "@/lib/event-format"
import { slugify } from "@/lib/slugify"
import { cn } from "@/lib/utils"

type Props = {
  eventId?: number
  initialValues: EventFormValues
  initialImageUrl: string | null
  categories: string[]
}

const ACCEPTED_TYPES = IMAGE_ACCEPT.split(",")

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-[#1B4FA8]/12 bg-white p-5 shadow-sm", className)}>
      <h2 className="mb-4 text-sm font-semibold text-[#0D1A2E]">{title}</h2>
      {children}
    </section>
  )
}

export default function EventForm({ eventId, initialValues, initialImageUrl, categories }: Props) {
  const router = useRouter()
  const isEdit = eventId !== undefined
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialValues,
  })
  const [slugManual, setSlugManual] = useState(isEdit)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(initialImageUrl)
  const [imageError, setImageError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const submitting = form.formState.isSubmitting

  const [title, startDate, endDate, startTime, endTime, summary] = form.watch([
    "title",
    "startDate",
    "endDate",
    "startTime",
    "endTime",
    "summary",
  ])

  useEffect(() => {
    if (!slugManual) form.setValue("slug", slugify(title), { shouldValidate: form.formState.isSubmitted })
  }, [title, slugManual, form])

  useEffect(() => {
    if (!startTime && form.getValues("endTime")) form.setValue("endTime", "", { shouldDirty: true })
  }, [startTime, form])

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const dirty = form.formState.isDirty || imageFile !== null
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  function pickImage(file: File | undefined) {
    if (fileInput.current) fileInput.current.value = ""
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type) || file.size > IMAGE_MAX_BYTES) {
      setImageError("JPG, PNG ou WebP de 5 Mo maximum")
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
  }

  async function onSubmit(values: EventFormValues) {
    const body = new FormData()
    body.append("data", JSON.stringify(values))
    if (imageFile) body.append("image", imageFile)

    const res = await fetch(isEdit ? `/api/admin/agenda/${eventId}` : "/api/admin/agenda", {
      method: isEdit ? "PUT" : "POST",
      body,
    }).catch(() => null)
    const data = res ? await res.json().catch(() => ({})) : {}

    if (!res || !res.ok) {
      const message = data.error ?? "Enregistrement impossible"
      if (data.field === "image") setImageError(message)
      else if (data.field && data.field in values) form.setError(data.field as keyof EventFormValues, { message })
      toast.error(message)
      return
    }

    toast.success(isEdit ? "Événement enregistré" : "Événement créé", {
      description: values.status === "published" ? "Visible sur le site." : "Enregistré comme brouillon.",
    })
    form.reset({ ...values, removeImage: false })
    setImageFile(null)
    if (isEdit) {
      setPreview(data.imageUrl ?? null)
      router.refresh()
    } else {
      router.push(`/admin/agenda/${data.id}`)
    }
  }

  const datePreview = startDate
    ? `${formatEventDate({ startDate, endDate: endDate || null })} · ${formatEventTime({
        startTime: startTime || null,
        endTime: endTime || null,
      })}`
    : null

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" noValidate>
        <div className="min-w-0 space-y-6">
          <Panel title="Événement">
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Titre de l’événement" className="text-base font-medium" />
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
                        <span className="shrink-0">/agenda/</span>
                        <FormControl>
                          <input
                            {...field}
                            readOnly={!slugManual}
                            className="h-9 min-w-0 flex-1 bg-transparent pr-3 text-slate-800 outline-none read-only:text-slate-500"
                          />
                        </FormControl>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title={slugManual ? "Régénérer depuis le titre" : "Modifier manuellement"}
                        aria-label={slugManual ? "Régénérer le slug depuis le titre" : "Modifier le slug manuellement"}
                        onClick={() => setSlugManual(!slugManual)}
                      >
                        {slugManual ? <RefreshCw className="size-4" /> : <Pencil className="size-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          list="event-categories"
                          maxLength={EVENT_CATEGORY_MAX}
                          placeholder="ex. Culture, Gouvernance…"
                          autoComplete="off"
                        />
                      </FormControl>
                      <datalist id="event-categories">
                        {categories.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lieu</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={EVENT_LOCATION_MAX} placeholder="ex. Hôtel de Ville" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Résumé</FormLabel>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {summary.length}/{EVENT_SUMMARY_MAX}
                      </span>
                    </div>
                    <FormControl>
                      <Textarea {...field} rows={2} maxLength={EVENT_SUMMARY_MAX} placeholder="Une ou deux phrases" />
                    </FormControl>
                    <FormDescription>Affiché dans la liste de l’agenda et lors des partages.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      invalid={Boolean(fieldState.error)}
                      placeholder="Programme, intervenants, informations pratiques…"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Panel>
        </div>

        <aside className="min-w-0 space-y-6 lg:sticky lg:top-20 lg:self-start">
          <Panel title="Date et heure">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Début</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fin</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} min={startDate || undefined} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure de début</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure de fin</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} disabled={!startTime} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Fin facultative (événement sur plusieurs jours). Sans heure : « Toute la journée ».
              </p>
              {datePreview && (
                <p className="rounded-md bg-[#1B4FA8]/6 px-3 py-2 text-xs font-medium text-[#1B4FA8]">{datePreview}</p>
              )}
            </div>
          </Panel>

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
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-3 rounded-lg border border-[#F5C200]/40 bg-[#F5C200]/8 px-3 py-2.5">
                    <div>
                      <FormLabel>À la une</FormLabel>
                      <FormDescription className="text-xs">Grande carte de l’agenda sur l’accueil.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </Panel>

          <Panel title="Image">
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
                  <img src={preview} alt="Aperçu de l’image de l’événement" className="size-full object-cover" />
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
                  dragging ? "border-[#1B4FA8] bg-[#1B4FA8]/5" : "border-slate-200 hover:border-[#1B4FA8]/50 hover:bg-slate-50"
                )}
              >
                <UploadCloud className="size-7 text-[#1B4FA8]/60" />
                <span className="text-sm font-medium text-slate-700">Glissez une image ou cliquez</span>
                <span className="text-xs text-slate-400">Facultatif · JPG, PNG ou WebP · 5 Mo max</span>
              </button>
            )}
            {imageError && <p className="mt-2 text-sm text-red-600">{imageError}</p>}
          </Panel>

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting} className="flex-1 bg-[#1B4FA8] font-semibold text-white hover:bg-[#1B4FA8]/90">
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {isEdit ? "Enregistrer" : "Créer l’événement"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/agenda">Annuler</Link>
            </Button>
          </div>
        </aside>
      </form>
    </Form>
  )
}
