"use client"

import { useEffect, useRef, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowDown, ArrowUp, ExternalLink, ImageUp, Loader2, Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { IMAGE_ACCEPT, IMAGE_MAX_BYTES } from "@/lib/article-schema"
import {
  MAYOR_EXCERPT_PARAGRAPHS,
  MAYOR_PARAGRAPH_MAX,
  MAYOR_PARAGRAPHS_MAX,
  mayorFormSchema,
  type MayorFormValues,
  type MayorMessage,
} from "@/lib/mayor-message-schema"
import { cn } from "@/lib/utils"

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-[#1B4FA8]/12 bg-white p-5 shadow-sm", className)}>
      <h2 className="mb-4 text-sm font-semibold text-[#0D1A2E]">{title}</h2>
      {children}
    </section>
  )
}

function toFormValues({ photo: _photo, paragraphs, ...rest }: MayorMessage): MayorFormValues {
  return { ...rest, paragraphs: paragraphs.map((value) => ({ value })) }
}

export default function MayorMessageForm({ initialValues }: { initialValues: MayorMessage }) {
  const form = useForm<MayorFormValues>({
    resolver: zodResolver(mayorFormSchema),
    defaultValues: toFormValues(initialValues),
  })
  const paragraphs = useFieldArray({ control: form.control, name: "paragraphs" })
  const [savedPhoto, setSavedPhoto] = useState(initialValues.photo)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const [name, honorific, role, mandate] = form.watch(["name", "honorific", "role", "mandate"])
  const { isSubmitting, isDirty } = form.formState

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview)
    }
  }, [photoPreview])

  function pickPhoto(file: File | undefined) {
    if (fileInput.current) fileInput.current.value = ""
    if (!file) return
    if (!IMAGE_ACCEPT.split(",").includes(file.type) || file.size > IMAGE_MAX_BYTES) {
      setPhotoError("JPG, PNG ou WebP de 5 Mo maximum")
      return
    }
    setPhotoError(null)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function cancelPhoto() {
    setPhotoFile(null)
    setPhotoPreview(null)
    setPhotoError(null)
  }

  async function onSubmit(values: MayorFormValues) {
    const body = new FormData()
    body.set("data", JSON.stringify({ ...values, paragraphs: values.paragraphs.map((p) => p.value) }))
    if (photoFile) body.set("photo", photoFile)

    const res = await fetch("/api/admin/mot-du-maire", { method: "PUT", body }).catch(() => null)
    const data = res ? await res.json().catch(() => ({})) : {}

    if (!res || !res.ok) {
      const message = data.error ?? "Enregistrement impossible"
      if (data.field === "photo") setPhotoError(message)
      else if (typeof data.field === "string" && data.field) {
        const field = data.field.replace(/^paragraphs\.(\d+)$/, "paragraphs.$1.value")
        form.setError(field as keyof MayorFormValues, { message })
      }
      toast.error(message)
      return
    }

    form.reset(toFormValues(data))
    setSavedPhoto(data.photo)
    cancelPhoto()
    toast.success("Mot du maire enregistré", { description: "Visible sur l'accueil et la page « Mot du Maire »." })
  }

  const fullName = [honorific, name].filter(Boolean).join(" ")
  const canSave = isDirty || photoFile !== null

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" noValidate>
        <div className="min-w-0 space-y-6">
          <Panel title="Titre et citation">
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={120} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="titleHighlight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fin du titre, en bleu</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={80} placeholder="Facultatif" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="quote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Citation</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} maxLength={300} />
                    </FormControl>
                    <FormDescription>Mise en avant en italique, avec un filet doré.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Panel>

          <Panel title="Message">
            <div className="space-y-4">
              {paragraphs.fields.map((item, i) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name={`paragraphs.${i}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-2">
                        <FormLabel className="flex items-center gap-2">
                          Paragraphe {i + 1}
                          {i < MAYOR_EXCERPT_PARAGRAPHS && (
                            <span className="rounded bg-[#F5C200]/20 px-1.5 py-px text-[10px] font-bold text-[#7a5c00]">
                              Accueil
                            </span>
                          )}
                        </FormLabel>
                        <div className="flex items-center gap-0.5">
                          <span className="mr-2 text-xs text-muted-foreground tabular-nums">
                            {field.value.length}/{MAYOR_PARAGRAPH_MAX}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            disabled={i === 0}
                            onClick={() => paragraphs.move(i, i - 1)}
                            aria-label={`Monter le paragraphe ${i + 1}`}
                          >
                            <ArrowUp className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            disabled={i === paragraphs.fields.length - 1}
                            onClick={() => paragraphs.move(i, i + 1)}
                            aria-label={`Descendre le paragraphe ${i + 1}`}
                          >
                            <ArrowDown className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                            disabled={paragraphs.fields.length === 1}
                            onClick={() => paragraphs.remove(i)}
                            aria-label={`Supprimer le paragraphe ${i + 1}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <FormControl>
                        <Textarea {...field} rows={4} maxLength={MAYOR_PARAGRAPH_MAX} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={paragraphs.fields.length >= MAYOR_PARAGRAPHS_MAX}
                  onClick={() => paragraphs.append({ value: "" })}
                >
                  <Plus />
                  Ajouter un paragraphe
                </Button>
                <p className="text-xs text-muted-foreground">
                  L&apos;accueil affiche la citation et les {MAYOR_EXCERPT_PARAGRAPHS} premiers paragraphes.
                </p>
              </div>
              {form.formState.errors.paragraphs?.root?.message && (
                <p className="text-sm text-red-600">{form.formState.errors.paragraphs.root.message}</p>
              )}
            </div>
          </Panel>

          <Panel title="Signature">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="honorific"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre honorifique</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={40} placeholder="Facultatif, ex. Commandant" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={80} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fonction</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={120} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mandate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mandat</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={40} placeholder="Facultatif, ex. 2020–2025" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Panel>

          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <a href="/mot-du-maire" target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                Voir la page
              </a>
            </Button>
            <Button type="submit" disabled={isSubmitting || !canSave} className="bg-[#1B4FA8] hover:bg-[#0D2F6E]">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
              Enregistrer
            </Button>
          </div>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
          <Panel title="Photo du maire">
            <input
              ref={fileInput}
              type="file"
              accept={IMAGE_ACCEPT}
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => pickPhoto(e.target.files?.[0])}
            />
            <div className="relative overflow-hidden rounded-xl bg-slate-100" style={{ aspectRatio: "3/4" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview ?? savedPhoto} alt={fullName || "Photo du maire"} className="size-full object-cover" />
              {photoFile && (
                <span className="absolute right-2 top-2 rounded bg-[#F5C200] px-1.5 py-0.5 text-[10px] font-bold text-[#0D1A2E]">
                  Nouvelle
                </span>
              )}
              <div
                className="absolute inset-x-0 bottom-0 p-4"
                style={{ background: "linear-gradient(to top, rgba(13,26,46,0.95) 0%, transparent 100%)" }}
              >
                <p className="text-lg font-black leading-tight text-white">{name || "Nom du maire"}</p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#F5C200]">{role}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => fileInput.current?.click()}>
                <ImageUp />
                Remplacer
              </Button>
              {photoFile && (
                <Button type="button" variant="ghost" size="sm" onClick={cancelPhoto}>
                  Annuler
                </Button>
              )}
            </div>
            {photoError && <p className="mt-2 text-sm text-red-600">{photoError}</p>}
            <p className="mt-2 text-xs text-muted-foreground">
              Format portrait conseillé (3:4). JPG, PNG ou WebP, 5 Mo max.
            </p>
            {(fullName || mandate) && (
              <p className="mt-3 border-t pt-3 text-xs text-slate-500">
                Signature : <span className="font-semibold text-[#0D1A2E]">{fullName}</span>
                {mandate && <> · Mandat {mandate}</>}
              </p>
            )}
          </Panel>
        </aside>
      </form>
    </Form>
  )
}
