"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArchiveRestore,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ImageOff,
  Loader2,
  MoreHorizontal,
  Newspaper,
  Pencil,
  Plus,
  Search,
  SearchX,
  Star,
  Trash2,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { formatArticleDate } from "@/lib/format-date"
import type { AdminArticleItem, CategoryOption } from "./types"

type TabKey = "all" | "published" | "draft" | "trash"
type SortKey = "recent" | "oldest" | "title"
type PendingAction = { kind: "trash" | "delete"; article: AdminArticleItem } | null

const PAGE_SIZE = 10

const NO_DATE = "none"

function articleYear(a: AdminArticleItem): string {
  return a.publishedAt ? String(new Date(a.publishedAt).getFullYear()) : NO_DATE
}

function inTab(a: AdminArticleItem, tab: TabKey): boolean {
  if (tab === "trash") return Boolean(a.deletedAt)
  if (a.deletedAt) return false
  return tab === "all" || a.status === tab
}

function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | "…")[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push("…")
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push("…")
  pages.push(total)
  return pages
}

function Thumbnail({ src, className }: { src: string | null; className: string }) {
  if (!src) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-[#1B4FA8]/8 text-[#1B4FA8]/50`}>
        <ImageOff className="size-4" />
      </div>
    )
  }
  return (
    <div className={`${className} relative overflow-hidden rounded-lg bg-slate-100`}>
      <Image src={src} alt="" fill className="object-cover" sizes="96px" />
    </div>
  )
}

function StatusBadge({ article }: { article: AdminArticleItem }) {
  if (article.deletedAt) {
    return <Badge className="border-transparent bg-red-100 font-medium text-red-700">Corbeille</Badge>
  }
  return article.status === "published" ? (
    <Badge className="border-transparent bg-emerald-100 font-medium text-emerald-700">Publié</Badge>
  ) : (
    <Badge className="border-transparent bg-amber-100 font-medium text-amber-800">Brouillon</Badge>
  )
}

function SourceBadge({ source }: { source: AdminArticleItem["source"] }) {
  return (
    <span className="text-[11px] font-medium text-slate-400">{source === "wordpress" ? "WordPress" : "Local"}</span>
  )
}

export default function ArticlesManager({
  articles,
  categories,
  canSync,
}: {
  articles: AdminArticleItem[]
  categories: CategoryOption[]
  canSync: boolean
}) {
  const router = useRouter()
  const [tab, setTab] = useState<TabKey>("all")
  const [category, setCategory] = useState("all")
  const [year, setYear] = useState("all")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortKey>("recent")
  const [page, setPage] = useState(1)
  const [pending, setPending] = useState<PendingAction>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  const counts = useMemo(() => {
    const live = articles.filter((a) => !a.deletedAt)
    return {
      all: live.length,
      published: live.filter((a) => a.status === "published").length,
      draft: live.filter((a) => a.status === "draft").length,
      trash: articles.length - live.length,
    }
  }, [articles])

  /** Years present in the current tab, newest first, with their article count. */
  const years = useMemo(() => {
    const byYear = new Map<string, number>()
    for (const a of articles) {
      if (!inTab(a, tab)) continue
      const y = articleYear(a)
      byYear.set(y, (byYear.get(y) ?? 0) + 1)
    }
    return [...byYear.entries()].sort(([a], [b]) => (a === NO_DATE ? 1 : b === NO_DATE ? -1 : Number(b) - Number(a)))
  }, [articles, tab])
  const activeYear = years.some(([y]) => y === year) ? year : "all"

  const filtered = useMemo(() => {
    const q = normalize(search.trim())
    const list = articles.filter((a) => {
      if (!inTab(a, tab)) return false
      if (activeYear !== "all" && articleYear(a) !== activeYear) return false
      if (category !== "all" && !a.categories.some((c) => String(c.id) === category)) return false
      return !q || normalize(a.title).includes(q)
    })
    const time = (a: AdminArticleItem) => (a.publishedAt ? new Date(a.publishedAt).getTime() : 0)
    if (sort === "recent") list.sort((a, b) => time(b) - time(a))
    else if (sort === "oldest") list.sort((a, b) => time(a) - time(b))
    else list.sort((a, b) => a.title.localeCompare(b.title, "fr", { sensitivity: "base" }))
    return list
  }, [articles, tab, activeYear, category, search, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const from = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const to = Math.min(currentPage * PAGE_SIZE, filtered.length)

  function resetPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v)
      setPage(1)
    }
  }
  const updateSearch = resetPage(setSearch)

  async function run(article: AdminArticleItem, request: () => Promise<Response>, success: string) {
    setBusyId(article.id)
    try {
      const res = await request()
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? "Opération impossible")
      toast.success(success, { description: article.title })
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Opération impossible")
    } finally {
      setBusyId(null)
    }
  }

  const trash = (a: AdminArticleItem) =>
    run(a, () => fetch(`/api/admin/articles/${a.id}`, { method: "DELETE" }), "Article mis à la corbeille")
  const restore = (a: AdminArticleItem) =>
    run(a, () => fetch(`/api/admin/articles/${a.id}/restore`, { method: "POST" }), "Article restauré")
  const destroy = (a: AdminArticleItem) =>
    run(a, () => fetch(`/api/admin/articles/${a.id}?permanent=1`, { method: "DELETE" }), "Article supprimé définitivement")

  function confirmPending() {
    if (!pending) return
    if (pending.kind === "trash") trash(pending.article)
    else destroy(pending.article)
    setPending(null)
  }

  function RowActions({ article }: { article: AdminArticleItem }) {
    const busy = busyId === article.id
    const visible = !article.deletedAt && article.status === "published"
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={busy} aria-label={`Actions pour « ${article.title} »`}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {article.deletedAt ? (
            <>
              <DropdownMenuItem onSelect={() => restore(article)}>
                <ArchiveRestore /> Restaurer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setPending({ kind: "delete", article })}>
                <Trash2 /> Supprimer définitivement
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link href={`/admin/actualites/${article.id}`}>
                  <Pencil /> Modifier
                </Link>
              </DropdownMenuItem>
              {visible && (
                <DropdownMenuItem asChild>
                  <a href={`/actualites/${article.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink /> Voir sur le site
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setPending({ kind: "trash", article })}>
                <Trash2 /> Mettre à la corbeille
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const titleLink = (a: AdminArticleItem, className: string) =>
    a.deletedAt ? (
      <span className={className}>{a.title}</span>
    ) : (
      <Link href={`/admin/actualites/${a.id}`} className={`${className} hover:text-[#1B4FA8] hover:underline`}>
        {a.title}
      </Link>
    )

  return (
    <section className="rounded-2xl border border-[#1B4FA8]/12 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#1B4FA8]/8 px-4 py-3 sm:px-5">
        <Tabs value={tab} onValueChange={(v) => resetPage(setTab)(v as TabKey)}>
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="all">Tous ({counts.all})</TabsTrigger>
            <TabsTrigger value="published">Publiés ({counts.published})</TabsTrigger>
            <TabsTrigger value="draft">Brouillons ({counts.draft})</TabsTrigger>
            <TabsTrigger value="trash">Corbeille ({counts.trash})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
              placeholder="Rechercher un article…"
              aria-label="Rechercher un article"
              className="pl-9 pr-9 focus-visible:ring-[#1B4FA8]/30"
            />
            {search && (
              <button
                type="button"
                onClick={() => updateSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Effacer la recherche"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 sm:flex-nowrap lg:ml-auto">
            <Select value={activeYear} onValueChange={resetPage(setYear)}>
              <SelectTrigger className="w-full sm:w-40" aria-label="Filtrer par année">
                <CalendarDays className="size-4 text-slate-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les années</SelectItem>
                {years.map(([y, n]) => (
                  <SelectItem key={y} value={y}>
                    {y === NO_DATE ? "Sans date" : y} ({n})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={resetPage(setCategory)}>
              <SelectTrigger className="w-full sm:w-52" aria-label="Filtrer par catégorie">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => resetPage(setSort)(v as SortKey)}>
              <SelectTrigger className="w-full sm:w-40" aria-label="Trier les articles">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récents</SelectItem>
                <SelectItem value="oldest">Plus anciens</SelectItem>
                <SelectItem value="title">Titre A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {articles.length === 0 ? (
        <Empty className="py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-[#1B4FA8]/10 text-[#1B4FA8]">
              <Newspaper />
            </EmptyMedia>
            <EmptyTitle className="text-[#0D1A2E]">Aucun article pour le moment</EmptyTitle>
            <EmptyDescription>Rédigez un premier article ou importez ceux de cubafoussam.cm.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <Button asChild size="sm" className="bg-[#1B4FA8] text-white hover:bg-[#1B4FA8]/90">
              <Link href="/admin/actualites/nouveau">
                <Plus className="size-4" /> Nouvel article
              </Link>
            </Button>
            {canSync && (
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/synchronisation">Synchronisation</Link>
              </Button>
            )}
          </EmptyContent>
        </Empty>
      ) : filtered.length === 0 ? (
        <Empty className="py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-slate-100 text-slate-500">
              {tab === "trash" ? <Trash2 /> : <SearchX />}
            </EmptyMedia>
            <EmptyTitle className="text-[#0D1A2E]">
              {tab === "trash" && !search && category === "all" && activeYear === "all" ? "La corbeille est vide" : "Aucun résultat"}
            </EmptyTitle>
            <EmptyDescription>
              {search ? `Aucun article ne correspond à « ${search} ».` : "Aucun article dans cette vue."}
            </EmptyDescription>
          </EmptyHeader>
          {(search || category !== "all" || activeYear !== "all") && (
            <EmptyContent>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  updateSearch("")
                  setCategory("all")
                  setYear("all")
                }}
              >
                Réinitialiser les filtres
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <>
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-24 pl-5">Image</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead className="w-28">Statut</TableHead>
                <TableHead className="w-32">Publication</TableHead>
                <TableHead className="w-16 pr-5 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((a) => (
                <TableRow key={a.id} className="hover:bg-[#1B4FA8]/[0.03]">
                  <TableCell className="pl-5">
                    <Thumbnail src={a.image_url} className="h-12 w-16" />
                  </TableCell>
                  <TableCell className="max-w-0 whitespace-normal">
                    <div className="flex items-start gap-1.5">
                      {a.featured && (
                        <Star className="mt-0.5 size-3.5 shrink-0 fill-[#F5C200] text-[#F5C200]" aria-label="À la une" />
                      )}
                      {titleLink(a, "line-clamp-2 font-medium text-[#0D1A2E]")}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {a.categories.map((c) => (
                        <CategoryBadge key={c.id} category={c} className="text-[9px]" />
                      ))}
                      <SourceBadge source={a.source} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge article={a} />
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{formatArticleDate(a.publishedAt) || "—"}</TableCell>
                  <TableCell className="pr-5 text-right">
                    <RowActions article={a} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <ul className="divide-y divide-[#1B4FA8]/8 md:hidden">
            {pageItems.map((a) => (
              <li key={a.id} className="flex gap-3 px-4 py-3">
                <Thumbnail src={a.image_url} className="h-16 w-20 shrink-0" />
                <div className="min-w-0 flex-1">
                  {titleLink(a, "line-clamp-2 text-sm font-medium text-[#0D1A2E]")}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <StatusBadge article={a} />
                    {a.featured && <Star className="size-3.5 fill-[#F5C200] text-[#F5C200]" aria-label="À la une" />}
                    <span className="text-xs text-slate-500">{formatArticleDate(a.publishedAt) || "—"}</span>
                  </div>
                </div>
                <RowActions article={a} />
              </li>
            ))}
          </ul>

          <div className="flex flex-col items-center gap-3 border-t border-[#1B4FA8]/8 px-5 py-3 sm:flex-row sm:justify-between">
            <p className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">
                {from}–{to}
              </span>{" "}
              sur {filtered.length}
            </p>
            {totalPages > 1 && (
              <nav aria-label="Pagination" className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                {pageNumbers(currentPage, totalPages).map((p, i) =>
                  p === "…" ? (
                    <span key={`gap-${i}`} className="px-1 text-sm text-slate-400">
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={p === currentPage ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setPage(p)}
                      aria-current={p === currentPage ? "page" : undefined}
                      className={p === currentPage ? "bg-[#1B4FA8] hover:bg-[#1B4FA8]/90" : ""}
                    >
                      {p}
                    </Button>
                  ),
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Page suivante"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </nav>
            )}
          </div>
        </>
      )}

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.kind === "delete" ? "Supprimer définitivement ?" : "Mettre à la corbeille ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.kind === "delete"
                ? `« ${pending.article.title} » et son image à la une seront supprimés. Cette action est irréversible.`
                : `« ${pending?.article.title ?? ""} » ne sera plus visible sur le site. Vous pourrez le restaurer depuis la corbeille.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPending} className="bg-red-600 text-white hover:bg-red-700">
              {pending?.kind === "delete" ? "Supprimer" : "Mettre à la corbeille"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
