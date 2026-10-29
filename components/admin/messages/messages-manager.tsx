"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Inbox,
  Loader2,
  Mail,
  MailCheck,
  MailOpen,
  MessageCircle,
  Phone,
  Reply,
  Search,
  SearchX,
  Send,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { EVENT_TIME_ZONE, todayInBafoussam } from "@/lib/event-format"
import { relativeTime } from "@/lib/format-date"
import { cn } from "@/lib/utils"
import type { MessageStatus } from "@/lib/contact-db"

export type MessageRow = {
  id: number
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: MessageStatus
  emailSent: boolean
  emailError: string | null
  createdAt: string
}

type Filter = "inbox" | "new" | "archived"

const FILTERS: { id: Filter; label: string }[] = [
  { id: "inbox", label: "Réception" },
  { id: "new", label: "Non lus" },
  { id: "archived", label: "Archivés" },
]

const SUBJECT_STYLES: Record<string, string> = {
  "Demande d'information": "bg-blue-50 text-blue-700 ring-blue-600/15",
  "État civil": "bg-violet-50 text-violet-700 ring-violet-600/15",
  "Urbanisme et travaux": "bg-amber-50 text-amber-800 ring-amber-600/20",
  "Hygiène et salubrité": "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  Réclamation: "bg-red-50 text-red-700 ring-red-600/15",
}

const AVATAR_COLORS = ["#1B4FA8", "#0E9F6E", "#C99A00", "#7C3AED", "#DB2777", "#0891B2", "#EA580C", "#0D2F6E"]

const fullDateFormat = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: EVENT_TIME_ZONE,
})
const quoteDateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: EVENT_TIME_ZONE })
const timeFormat = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: EVENT_TIME_ZONE })
const dayMonthFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: EVENT_TIME_ZONE })
const numericDateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeZone: EVENT_TIME_ZONE })
const monthYearFormat = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: EVENT_TIME_ZONE })

const DAY_MS = 86_400_000

function dayNumber(dayKey: string): number {
  const [y, m, d] = dayKey.split("-").map(Number)
  return Date.UTC(y, m - 1, d) / DAY_MS
}

function daysAgo(iso: string, todayKey: string): number {
  return dayNumber(todayKey) - dayNumber(todayInBafoussam(new Date(iso)))
}

function groupLabel(iso: string, todayKey: string): string {
  const diff = daysAgo(iso, todayKey)
  if (diff <= 0) return "Aujourd'hui"
  if (diff === 1) return "Hier"
  if (diff < 7) return "Cette semaine"
  if (diff < 30) return "Ce mois-ci"
  const label = monthYearFormat.format(new Date(iso))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function listDate(iso: string, todayKey: string): string {
  const date = new Date(iso)
  if (daysAgo(iso, todayKey) <= 0) return timeFormat.format(date)
  if (todayKey.slice(0, 4) === todayInBafoussam(date).slice(0, 4)) return dayMonthFormat.format(date)
  return numericDateFormat.format(date)
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  return ((parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase()
}

function avatarColor(name: string): string {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function normalize(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
}

/** wa.me expects an international number; 9-digit numbers are assumed to be Cameroonian. */
function whatsappNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^00/, "")
  return digits.length === 9 ? `237${digits}` : digits
}

function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full font-bold text-white", className)}
      style={{ backgroundColor: avatarColor(name) }}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  )
}

function SubjectBadge({ subject, className }: { subject: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center truncate rounded-md px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        SUBJECT_STYLES[subject] ?? "bg-slate-50 text-slate-600 ring-slate-500/15",
        className
      )}
    >
      {subject}
    </span>
  )
}

function IconAction({
  label,
  shortcut,
  children,
}: {
  label: string
  shortcut?: string
  children: React.ReactElement
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="flex items-center gap-2">
        {label}
        {shortcut && <Kbd>{shortcut}</Kbd>}
      </TooltipContent>
    </Tooltip>
  )
}

function StatTile({ icon: Icon, label, value, hint, color }: { icon: LucideIcon; label: string; value: string; hint?: string; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#1B4FA8]/10 bg-white px-4 py-3 shadow-sm">
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-xl"
        style={{ color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
      >
        <Icon className="size-[18px]" />
      </div>
      <div className="min-w-0">
        <p className="flex items-baseline gap-1.5">
          <span className="text-xl font-black leading-none tracking-tight text-[#0D1A2E] tabular-nums">{value}</span>
          {hint && <span className="truncate text-[11px] font-medium text-slate-400">{hint}</span>}
        </p>
        <p className="mt-1 truncate text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  )
}

export default function MessagesManager({
  messages,
  mailConfigured,
}: {
  messages: MessageRow[]
  mailConfigured: boolean
}) {
  const router = useRouter()
  const [rows, setRows] = useState(messages)
  const [filter, setFilter] = useState<Filter>("inbox")
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => setRows(messages), [messages])

  const todayKey = todayInBafoussam()

  const counts = useMemo(
    () => ({
      inbox: rows.filter((m) => m.status !== "archived").length,
      new: rows.filter((m) => m.status === "new").length,
      archived: rows.filter((m) => m.status === "archived").length,
    }),
    [rows]
  )

  const stats = useMemo(() => {
    const lastWeek = rows.filter((m) => daysAgo(m.createdAt, todayKey) < 7).length
    const sent = rows.filter((m) => m.emailSent).length
    return { lastWeek, sent }
  }, [rows, todayKey])

  const visible = useMemo(() => {
    const q = normalize(search.trim())
    return rows.filter((m) => {
      const inFilter =
        filter === "archived" ? m.status === "archived" : filter === "new" ? m.status === "new" : m.status !== "archived"
      if (!inFilter) return false
      if (!q) return true
      return normalize(`${m.name} ${m.email} ${m.phone ?? ""} ${m.subject} ${m.message}`).includes(q)
    })
  }, [rows, filter, search])

  const groups = useMemo(() => {
    const out: { label: string; items: MessageRow[] }[] = []
    for (const m of visible) {
      const label = groupLabel(m.createdAt, todayKey)
      const last = out[out.length - 1]
      if (last?.label === label) last.items.push(m)
      else out.push({ label, items: [m] })
    }
    return out
  }, [visible, todayKey])

  const selected = rows.find((m) => m.id === selectedId) ?? null
  const selectedIndex = selected ? visible.findIndex((m) => m.id === selected.id) : -1

  async function patchStatus(id: number, status: MessageStatus, silent = false) {
    const previous = rows
    setRows((r) => r.map((m) => (m.id === id ? { ...m, status } : m)))
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Modification impossible")
      if (!silent) {
        toast.success(
          status === "archived" ? "Message archivé" : status === "new" ? "Marqué comme non lu" : "Message restauré"
        )
      }
      router.refresh()
    } catch (e) {
      setRows(previous)
      toast.error(e instanceof Error ? e.message : "Modification impossible")
    }
  }

  function open(m: MessageRow) {
    setSelectedId(m.id)
    if (m.status === "new") void patchStatus(m.id, "read", true)
  }

  function step(delta: 1 | -1) {
    if (visible.length === 0) return
    const next = selectedIndex === -1 ? visible[0] : visible[selectedIndex + delta]
    if (next) open(next)
  }

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copié`)
    } catch {
      toast.error("Copie impossible")
    }
  }

  async function remove() {
    if (!selected) return
    setConfirmDelete(false)
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/messages/${selected.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Suppression impossible")
      setRows((r) => r.filter((m) => m.id !== selected.id))
      setSelectedId(null)
      toast.success("Message supprimé")
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Suppression impossible")
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (confirmDelete || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable=true], [role=dialog]")) return
      if (e.key === "j") step(1)
      else if (e.key === "k") step(-1)
      else if (e.key === "Escape" && selectedId !== null) setSelectedId(null)
      else return
      e.preventDefault()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  useEffect(() => {
    if (selectedId !== null) document.getElementById(`message-${selectedId}`)?.scrollIntoView({ block: "nearest" })
  }, [selectedId])

  const replyHref = selected
    ? `mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}&body=${encodeURIComponent(
        `\n\n---\nLe ${quoteDateFormat.format(new Date(selected.createdAt))}, ${selected.name} a écrit :\n${selected.message
          .split("\n")
          .map((l) => `> ${l}`)
          .join("\n")}`
      )}`
    : "#"
  const firstName = selected?.name.trim().split(/\s+/)[0] ?? ""

  return (
    <div className="flex flex-col gap-4">
      {!mailConfigured && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            L'envoi par e-mail n'est pas configuré : les messages sont enregistrés ici mais ne sont pas transmis à
            contact@cubafoussam.cm. Renseignez <code className="font-mono text-xs">SMTP_HOST</code>,{" "}
            <code className="font-mono text-xs">SMTP_USER</code> et <code className="font-mono text-xs">SMTP_PASSWORD</code>{" "}
            dans <code className="font-mono text-xs">.env.local</code>, puis redémarrez le serveur.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={Inbox} label="Messages reçus" value={String(rows.length)} color="#1B4FA8" />
        <StatTile
          icon={Mail}
          label="Non lus"
          value={String(counts.new)}
          color={counts.new > 0 ? "#DC2626" : "#64748B"}
        />
        <StatTile icon={CalendarClock} label="Ces 7 derniers jours" value={String(stats.lastWeek)} color="#C99A00" />
        <StatTile
          icon={MailCheck}
          label="Transmis par e-mail"
          value={String(stats.sent)}
          hint={rows.length > 0 ? `/ ${rows.length}` : undefined}
          color="#0E9F6E"
        />
      </div>

      <section className="grid min-h-[560px] overflow-hidden rounded-2xl border border-[#1B4FA8]/10 bg-white shadow-sm lg:h-[calc(100svh-15rem)] lg:grid-cols-[minmax(320px,2fr)_minmax(0,3fr)]">
        {/* Message list */}
        <div className={cn("flex min-h-0 min-w-0 flex-col border-[#1B4FA8]/8 lg:border-r", selected && "hidden lg:flex")}>
          <div className="space-y-3 border-b border-[#1B4FA8]/8 p-3">
            <InputGroup className="h-10 rounded-xl border-[#1B4FA8]/12 bg-[#F8FAFF] shadow-none">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un nom, un e-mail, un mot…"
                aria-label="Rechercher dans les messages"
              />
              {search && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton size="icon-xs" onClick={() => setSearch("")} aria-label="Effacer la recherche">
                    <X />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>

            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1" role="tablist">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all sm:text-sm",
                    filter === f.id ? "bg-white text-[#1B4FA8] shadow-sm" : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  <span className="truncate">{f.label}</span>
                  <span
                    className={cn(
                      "min-w-5 rounded-full px-1.5 text-[10px] font-bold tabular-nums leading-4",
                      filter === f.id
                        ? f.id === "new" && counts.new > 0
                          ? "bg-red-500 text-white"
                          : "bg-[#1B4FA8] text-white"
                        : "bg-slate-200 text-slate-500"
                    )}
                  >
                    {counts[f.id]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <Empty className="flex-1 py-14">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="bg-[#1B4FA8]/10 text-[#1B4FA8]">
                  {search ? <SearchX /> : <Inbox />}
                </EmptyMedia>
                <EmptyTitle className="text-[#0D1A2E]">{search ? "Aucun résultat" : "Aucun message"}</EmptyTitle>
                <EmptyDescription>
                  {search
                    ? `Aucun message ne correspond à « ${search.trim()} ».`
                    : filter === "archived"
                      ? "Les messages archivés apparaîtront ici."
                      : filter === "new"
                        ? "Vous avez lu tous vos messages."
                        : "Les messages envoyés depuis la page Contact apparaîtront ici."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto">
              {groups.map((g) => (
                <div key={g.label}>
                  <p className="sticky top-0 z-10 border-b border-[#1B4FA8]/6 bg-white/95 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 backdrop-blur">
                    {g.label}
                  </p>
                  <ul className="space-y-0.5 p-1.5">
                    {g.items.map((m) => {
                      const unread = m.status === "new"
                      const active = selectedId === m.id
                      return (
                        <li key={m.id} id={`message-${m.id}`}>
                          <button
                            type="button"
                            onClick={() => open(m)}
                            className={cn(
                              "group relative flex w-full gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                              active ? "bg-[#EFF4FF] ring-1 ring-[#1B4FA8]/15" : "hover:bg-slate-50"
                            )}
                          >
                            {active && <span className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-[#1B4FA8]" aria-hidden="true" />}
                            <div className="relative">
                              <Avatar name={m.name} className={cn("size-10 text-xs", !unread && !active && "opacity-80")} />
                              {unread && (
                                <span
                                  className="absolute -right-0.5 -top-0.5 size-3 rounded-full bg-red-500 ring-2 ring-white"
                                  aria-label="Non lu"
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline gap-2">
                                <span
                                  className={cn(
                                    "min-w-0 flex-1 truncate text-sm",
                                    unread ? "font-bold text-[#0D1A2E]" : "font-medium text-slate-700"
                                  )}
                                >
                                  {m.name}
                                </span>
                                <span
                                  className={cn(
                                    "shrink-0 text-[11px] tabular-nums",
                                    unread ? "font-semibold text-[#1B4FA8]" : "text-slate-400"
                                  )}
                                >
                                  {listDate(m.createdAt, todayKey)}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-1.5">
                                <SubjectBadge subject={m.subject} />
                                {m.phone && <Phone className="size-3 shrink-0 text-slate-300" aria-label="Téléphone fourni" />}
                                {!m.emailSent && (
                                  <AlertTriangle className="size-3 shrink-0 text-amber-500" aria-label="Non transmis par e-mail" />
                                )}
                              </div>
                              <p className={cn("mt-1 line-clamp-2 text-xs leading-relaxed", unread ? "text-slate-600" : "text-slate-400")}>
                                {m.message}
                              </p>
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="hidden items-center justify-center gap-3 border-t border-[#1B4FA8]/8 px-3 py-2 text-[11px] text-slate-400 lg:flex">
            <span className="flex items-center gap-1">
              <Kbd>J</Kbd>
              <Kbd>K</Kbd> naviguer
            </span>
            <span className="flex items-center gap-1">
              <Kbd>Échap</Kbd> fermer
            </span>
          </div>
        </div>

        {/* Reading pane */}
        <div className={cn("min-h-0 min-w-0 flex-col bg-[#FBFCFE]", selected ? "flex" : "hidden lg:flex")}>
          {selected ? (
            <>
              <div className="flex items-center gap-1 border-b border-[#1B4FA8]/8 bg-white px-3 py-2">
                <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSelectedId(null)}>
                  <ArrowLeft className="size-4" /> Retour
                </Button>
                <div className="hidden items-center gap-0.5 lg:flex">
                  <IconAction label="Message précédent" shortcut="K">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => step(-1)}
                      disabled={selectedIndex <= 0}
                      aria-label="Message précédent"
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                  </IconAction>
                  <IconAction label="Message suivant" shortcut="J">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => step(1)}
                      disabled={selectedIndex === -1 || selectedIndex >= visible.length - 1}
                      aria-label="Message suivant"
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                  </IconAction>
                  {selectedIndex !== -1 && (
                    <span className="ml-1 text-xs tabular-nums text-slate-400">
                      {selectedIndex + 1} sur {visible.length}
                    </span>
                  )}
                </div>
                <div className="flex-1" />
                <IconAction label="Marquer comme non lu">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => patchStatus(selected.id, "new")}
                    disabled={selected.status === "new"}
                    aria-label="Marquer comme non lu"
                  >
                    <Mail className="size-4" />
                  </Button>
                </IconAction>
                {selected.status === "archived" ? (
                  <IconAction label="Restaurer dans la boîte de réception">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => patchStatus(selected.id, "read")}
                      aria-label="Restaurer"
                    >
                      <ArchiveRestore className="size-4" />
                    </Button>
                  </IconAction>
                ) : (
                  <IconAction label="Archiver">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => patchStatus(selected.id, "archived")}
                      aria-label="Archiver"
                    >
                      <Archive className="size-4" />
                    </Button>
                  </IconAction>
                )}
                <IconAction label="Supprimer définitivement">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setConfirmDelete(true)}
                    disabled={busy}
                    aria-label="Supprimer"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  </Button>
                </IconAction>
                <div className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
                <Button asChild size="sm" className="bg-[#1B4FA8] text-white hover:bg-[#1B4FA8]/90">
                  <a href={replyHref}>
                    <Reply className="size-4" /> Répondre
                  </a>
                </Button>
              </div>

              <article className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto max-w-3xl p-5 sm:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <SubjectBadge subject={selected.subject} className="px-2 py-1 text-xs" />
                    {selected.status === "archived" && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                        <Archive className="size-3" /> Archivé
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-start gap-4">
                    <Avatar name={selected.name} className="size-12 text-sm ring-4 ring-white shadow-sm" />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-bold text-[#0D1A2E]">{selected.name}</h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        <span className="first-letter:uppercase">{fullDateFormat.format(new Date(selected.createdAt))}</span>
                        <span className="text-slate-300"> · </span>
                        {relativeTime(selected.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#1B4FA8]/12 bg-white py-1 pl-3 pr-1 text-sm shadow-xs">
                      <MailOpen className="size-3.5 shrink-0 text-[#1B4FA8]" />
                      <a href={`mailto:${selected.email}`} className="truncate px-1 text-slate-700 hover:text-[#1B4FA8]">
                        {selected.email}
                      </a>
                      <IconAction label="Copier l'adresse">
                        <button
                          type="button"
                          onClick={() => copy(selected.email, "E-mail")}
                          className="flex size-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          aria-label="Copier l'adresse e-mail"
                        >
                          <Copy className="size-3.5" />
                        </button>
                      </IconAction>
                    </div>
                    {selected.phone && (
                      <div className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#1B4FA8]/12 bg-white py-1 pl-3 pr-1 text-sm shadow-xs">
                        <Phone className="size-3.5 shrink-0 text-[#1B4FA8]" />
                        <a
                          href={`tel:${selected.phone.replace(/[^\d+]/g, "")}`}
                          className="truncate px-1 tabular-nums text-slate-700 hover:text-[#1B4FA8]"
                        >
                          {selected.phone}
                        </a>
                        <IconAction label="Copier le numéro">
                          <button
                            type="button"
                            onClick={() => copy(selected.phone ?? "", "Numéro")}
                            className="flex size-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Copier le numéro de téléphone"
                          >
                            <Copy className="size-3.5" />
                          </button>
                        </IconAction>
                      </div>
                    )}
                  </div>

                  <div className="relative mt-6 overflow-hidden rounded-2xl border border-[#1B4FA8]/10 bg-white shadow-sm">
                    <div className="absolute inset-y-0 left-0 w-1 bg-[#F5C200]" aria-hidden="true" />
                    <p className="whitespace-pre-wrap break-words p-5 pl-6 text-[15px] leading-7 text-slate-800 sm:p-6 sm:pl-7">
                      {selected.message}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "mt-4 flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs",
                      selected.emailSent ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
                    )}
                  >
                    {selected.emailSent ? (
                      <CheckCircle2 className="mt-px size-3.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="mt-px size-3.5 shrink-0" />
                    )}
                    <span>
                      {selected.emailSent
                        ? "Transmis par e-mail à contact@cubafoussam.cm."
                        : `Non transmis par e-mail${selected.emailError ? ` : ${selected.emailError}` : "."}`}
                    </span>
                  </div>
                </div>
              </article>

              <div className="border-t border-[#1B4FA8]/8 bg-white px-4 py-3 sm:px-6">
                <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2">
                  <p className="mr-auto text-xs font-medium text-slate-500">Répondre à {firstName}</p>
                  <Button asChild size="sm" className="bg-[#1B4FA8] text-white hover:bg-[#1B4FA8]/90">
                    <a href={replyHref}>
                      <Send className="size-4" /> Par e-mail
                    </a>
                  </Button>
                  {selected.phone && (
                    <>
                      <Button asChild variant="outline" size="sm">
                        <a href={`tel:${selected.phone.replace(/[^\d+]/g, "")}`}>
                          <Phone className="size-4" /> Appeler
                        </a>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="text-emerald-700 hover:text-emerald-800">
                        <a href={`https://wa.me/${whatsappNumber(selected.phone)}`} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="size-4" /> WhatsApp
                        </a>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <Empty className="flex-1">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="size-14 rounded-2xl bg-[#1B4FA8]/10 text-[#1B4FA8] [&_svg:not([class*='size-'])]:size-6">
                  <MailOpen />
                </EmptyMedia>
                <EmptyTitle className="text-[#0D1A2E]">Sélectionnez un message</EmptyTitle>
                <EmptyDescription>
                  {counts.new > 0
                    ? `Vous avez ${counts.new} message${counts.new > 1 ? "s" : ""} non lu${counts.new > 1 ? "s" : ""}.`
                    : "Le contenu du message s'affichera ici."}
                </EmptyDescription>
              </EmptyHeader>
              {visible.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => open(visible[0])}>
                  Ouvrir le plus récent
                </Button>
              )}
            </Empty>
          )}
        </div>
      </section>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce message ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le message de {selected?.name} sera définitivement supprimé. Pour le garder hors de la boîte de réception,
              archivez-le plutôt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-red-600 text-white hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
