"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, Loader2, Pencil, Plus, Tags, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import CategoryBadge from "@/components/category-badge"
import { categorySchema, type CategoryValues } from "@/lib/article-schema"
import { slugify } from "@/lib/slugify"
import { cn } from "@/lib/utils"

export type CategoryRow = {
  id: number
  name: string
  slug: string
  color: string
  fromWordpress: boolean
  articleCount: number
}

type EditorState = { id: number | null; values: CategoryValues; slugTouched: boolean } | null

export default function CategoriesManager({ categories, palette }: { categories: CategoryRow[]; palette: string[] }) {
  const router = useRouter()
  const [editor, setEditor] = useState<EditorState>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof CategoryValues, string>>>({})
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState<CategoryRow | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  function openCreate() {
    setErrors({})
    setEditor({
      id: null,
      values: { name: "", slug: "", color: palette[categories.length % palette.length] },
      slugTouched: false,
    })
  }

  function openEdit(c: CategoryRow) {
    setErrors({})
    setEditor({ id: c.id, values: { name: c.name, slug: c.slug, color: c.color }, slugTouched: true })
  }

  function update(patch: Partial<CategoryValues>, slugTouched?: boolean) {
    setEditor((s) => {
      if (!s) return s
      const touched = slugTouched ?? s.slugTouched
      const values = { ...s.values, ...patch }
      if (!touched && patch.name !== undefined) values.slug = slugify(patch.name)
      return { ...s, values, slugTouched: touched }
    })
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!editor) return
    const parsed = categorySchema.safeParse(editor.values)
    if (!parsed.success) {
      const next: typeof errors = {}
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof CategoryValues] ??= issue.message
      setErrors(next)
      return
    }
    setSaving(true)
    try {
      const res = await fetch(editor.id ? `/api/admin/categories/${editor.id}` : "/api/admin/categories", {
        method: editor.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.field) setErrors({ [data.field]: data.error })
        toast.error(data.error ?? "Enregistrement impossible")
        return
      }
      toast.success(editor.id ? "Catégorie modifiée" : "Catégorie créée", { description: parsed.data.name })
      setEditor(null)
      router.refresh()
    } catch {
      toast.error("Enregistrement impossible")
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    const c = toDelete
    if (!c) return
    setToDelete(null)
    setDeletingId(c.id)
    try {
      const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? "Suppression impossible")
      toast.success("Catégorie supprimée", { description: c.name })
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Suppression impossible")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="rounded-2xl border border-[#1B4FA8]/12 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[#1B4FA8]/8 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-[#0D1A2E]">Catégories</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Utilisées pour classer les actualités et filtrer la page publique.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-[#1B4FA8] text-white hover:bg-[#1B4FA8]/90">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Nouvelle catégorie</span>
        </Button>
      </div>

      {categories.length === 0 ? (
        <Empty className="py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-[#1B4FA8]/10 text-[#1B4FA8]">
              <Tags />
            </EmptyMedia>
            <EmptyTitle className="text-[#0D1A2E]">Aucune catégorie</EmptyTitle>
            <EmptyDescription>Créez une catégorie ou lancez une synchronisation WordPress.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={openCreate} className="bg-[#1B4FA8] text-white hover:bg-[#1B4FA8]/90">
              <Plus className="size-4" /> Nouvelle catégorie
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Nom</TableHead>
              <TableHead className="hidden sm:table-cell">Slug</TableHead>
              <TableHead className="w-24 text-right">Articles</TableHead>
              <TableHead className="w-28 pr-5 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="pl-5">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={c} />
                    {c.fromWordpress && <span className="text-[11px] text-slate-400">WordPress</span>}
                  </div>
                </TableCell>
                <TableCell className="hidden font-mono text-xs text-slate-500 sm:table-cell">{c.slug}</TableCell>
                <TableCell className="text-right tabular-nums text-slate-700">{c.articleCount}</TableCell>
                <TableCell className="pr-5 text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label={`Modifier ${c.name}`}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setToDelete(c)}
                    disabled={deletingId === c.id}
                    aria-label={`Supprimer ${c.name}`}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    {deletingId === c.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={editor !== null} onOpenChange={(open) => !open && !saving && setEditor(null)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={save} noValidate>
            <DialogHeader>
              <DialogTitle>{editor?.id ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
              <DialogDescription>Le slug est utilisé dans les filtres de la page Actualités.</DialogDescription>
            </DialogHeader>
            {editor && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cat-name">Nom</Label>
                  <Input
                    id="cat-name"
                    value={editor.values.name}
                    onChange={(e) => update({ name: e.target.value })}
                    aria-invalid={Boolean(errors.name)}
                    autoFocus
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-slug">Slug</Label>
                  <Input
                    id="cat-slug"
                    value={editor.values.slug}
                    onChange={(e) => update({ slug: e.target.value }, true)}
                    aria-invalid={Boolean(errors.slug)}
                    className="font-mono text-sm"
                  />
                  {errors.slug && <p className="text-sm text-red-600">{errors.slug}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Couleur</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {palette.map((color) => {
                      const active = editor.values.color.toLowerCase() === color.toLowerCase()
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => update({ color })}
                          aria-label={`Couleur ${color}`}
                          aria-pressed={active}
                          className={cn(
                            "flex size-7 items-center justify-center rounded-full ring-offset-2 transition",
                            active ? "ring-2 ring-slate-400" : "hover:scale-110"
                          )}
                          style={{ backgroundColor: color }}
                        >
                          {active && <Check className="size-3.5 text-white" />}
                        </button>
                      )
                    })}
                    <label className="relative flex size-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-slate-300 text-slate-400 hover:border-slate-400">
                      <Plus className="size-3.5" />
                      <input
                        type="color"
                        value={editor.values.color}
                        onChange={(e) => update({ color: e.target.value.toUpperCase() })}
                        className="absolute inset-0 cursor-pointer opacity-0"
                        aria-label="Couleur personnalisée"
                      />
                    </label>
                  </div>
                  {errors.color && <p className="text-sm text-red-600">{errors.color}</p>}
                  <div className="pt-1">
                    <CategoryBadge category={{ name: editor.values.name || "Aperçu", color: editor.values.color }} />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditor(null)} disabled={saving}>
                Annuler
              </Button>
              <Button type="submit" disabled={saving} className="bg-[#1B4FA8] text-white hover:bg-[#1B4FA8]/90">
                {saving && <Loader2 className="size-4 animate-spin" />}
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer « {toDelete?.name} » ?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.articleCount
                ? `Elle sera retirée de ${toDelete.articleCount} article${toDelete.articleCount > 1 ? "s" : ""}. Les articles ne sont pas supprimés.`
                : "Aucun article n’utilise cette catégorie."}
              {toDelete?.fromWordpress && " Elle sera recréée si une synchronisation importe un article qui l’utilise."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
