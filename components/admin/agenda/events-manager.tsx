"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CalendarDays, Clock, ExternalLink, Loader2, MapPin, Pencil, Search, SearchX, Star, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { dateBadge, formatEventDate, formatEventTime, isPastEvent, todayInBafoussam } from "@/lib/event-format"
import type { EventRecord } from "@/lib/events-db"

export type AdminEventItem = Omit<EventRecord, "content" | "updatedAt">

type TabKey = "upcoming" | "past" | "draft"

function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

export default function EventsManager({ events }: { events: AdminEventItem[] }) {
  const router = useRouter()
  const [tab, setTab] = useState<TabKey>("upcoming")
  const [search, setSearch] = useState("")
  const [toDelete, setToDelete] = useState<AdminEventItem | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const today = todayInBafoussam()

  const groups = useMemo(() => {
    const published = events.filter((e) => e.status === "published")
    return {
      upcoming: published.filter((e) => !isPastEvent(e, today)).reverse(),
      past: published.filter((e) => isPastEvent(e, today)),
      draft: events.filter((e) => e.status === "draft"),
    }
  }, [events, today])

  const visible = useMemo(() => {
    const q = normalize(search.trim())
    if (!q) return groups[tab]
    return groups[tab].filter((e) => normalize(`${e.title} ${e.category ?? ""} ${e.location ?? ""}`).includes(q))
  }, [groups, tab, search])

  async function confirmDelete() {
    const event = toDelete
    if (!event) return
    setToDelete(null)
    setDeletingId(event.id)
    try {
      const res = await fetch(`/api/admin/agenda/${event.id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? "Suppression impossible")
      toast.success("Événement supprimé", { description: event.title })
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Suppression impossible")
    } finally {
      setDeletingId(null)
    }
  }

  const emptyText = {
    upcoming: "Aucun événement publié à venir.",
    past: "Aucun événement passé.",
    draft: "Aucun brouillon.",
  }[tab]

  return (
    <section className="rounded-2xl border border-[#1B4FA8]/12 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#1B4FA8]/8 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="upcoming">À venir ({groups.upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Passés ({groups.past.length})</TabsTrigger>
            <TabsTrigger value="draft">Brouillons ({groups.draft.length})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un événement…"
            aria-label="Rechercher un événement"
            className="pl-9 pr-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Effacer la recherche"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <Empty className="py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-[#1B4FA8]/10 text-[#1B4FA8]">
              {search ? <SearchX /> : <CalendarDays />}
            </EmptyMedia>
            <EmptyTitle className="text-[#0D1A2E]">{search ? "Aucun résultat" : emptyText}</EmptyTitle>
            {tab === "upcoming" && !search && (
              <EmptyDescription>Créez un événement ou publiez un brouillon pour l&apos;afficher sur le site.</EmptyDescription>
            )}
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="divide-y divide-[#1B4FA8]/8">
          {visible.map((e) => {
            const badge = dateBadge(e.startDate)
            return (
              <li key={e.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#1B4FA8]/[0.03]">
                <div className="flex w-14 shrink-0 flex-col items-center rounded-lg border border-[#1B4FA8]/15 bg-[#1B4FA8]/5 py-1.5 text-center">
                  <span className="text-lg font-black leading-none text-[#0D1A2E]">{badge.day}</span>
                  <span className="text-[10px] font-bold uppercase text-[#1B4FA8]">{badge.month}</span>
                  <span className="text-[10px] text-slate-400">{badge.year}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {e.featured && <Star className="size-3.5 shrink-0 fill-[#F5C200] text-[#F5C200]" aria-label="À la une" />}
                    <Link
                      href={`/admin/agenda/${e.id}`}
                      className="truncate font-semibold text-[#0D1A2E] hover:text-[#1B4FA8] hover:underline"
                    >
                      {e.title}
                    </Link>
                    {e.status === "draft" ? (
                      <Badge className="border-transparent bg-amber-100 font-medium text-amber-800">Brouillon</Badge>
                    ) : isPastEvent(e, today) ? (
                      <Badge className="border-transparent bg-slate-100 font-medium text-slate-600">Passé</Badge>
                    ) : (
                      <Badge className="border-transparent bg-emerald-100 font-medium text-emerald-700">Publié</Badge>
                    )}
                    {e.category && (
                      <span className="rounded bg-[#1B4FA8]/8 px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-[#1B4FA8]">
                        {e.category}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3" /> {formatEventDate(e)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" /> {formatEventTime(e)}
                    </span>
                    {e.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" /> {e.location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  {e.status === "published" && (
                    <Button variant="ghost" size="icon" asChild aria-label={`Voir « ${e.title} » sur le site`}>
                      <a href={`/agenda/${e.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" asChild aria-label={`Modifier « ${e.title} »`}>
                    <Link href={`/admin/agenda/${e.id}`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setToDelete(e)}
                    disabled={deletingId === e.id}
                    aria-label={`Supprimer « ${e.title} »`}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    {deletingId === e.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <AlertDialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer « {toDelete?.title} » ?</AlertDialogTitle>
            <AlertDialogDescription>
              L&apos;événement et son image seront définitivement supprimés. Pour le masquer sans le perdre, passez-le
              plutôt en brouillon.
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
