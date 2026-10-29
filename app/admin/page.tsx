import Image from "next/image"
import Link from "next/link"
import {
  CalendarDays,
  CalendarPlus,
  ExternalLink,
  ImageOff,
  ImagePlus,
  Images,
  Inbox,
  MapPin,
  Newspaper,
  PenLine,
  Quote,
  RefreshCw,
  Star,
  Users,
} from "lucide-react"
import { getAdminArticles, getArticleStats } from "@/lib/articles-db"
import { getContactMessages } from "@/lib/contact-db"
import { getAdminEvents } from "@/lib/events-db"
import { dateBadge, formatEventTime, isPastEvent, todayInBafoussam, EVENT_TIME_ZONE } from "@/lib/event-format"
import { getGalleryStats, getPhotos } from "@/lib/gallery-db"
import { getMayorMessage } from "@/lib/settings-db"
import { formatArticleDate, relativeTime } from "@/lib/format-date"
import { mayorFullName } from "@/lib/mayor-message-schema"
import { ROLE_LABELS } from "@/lib/roles"
import { requireUserPage } from "@/lib/admin-page-auth"
import AdminPageHeader from "@/components/admin/admin-page-header"
import StatsCards, { type StatItem } from "@/components/admin/stats-cards"
import DashboardPanel from "@/components/admin/dashboard-panel"
import { Badge } from "@/components/ui/badge"
import SyncButton from "./sync-button"

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n > 1 ? many : one}`

function greeting(now: Date): string {
  const hour = Number(new Intl.DateTimeFormat("fr-FR", { hour: "numeric", hour12: false, timeZone: EVENT_TIME_ZONE }).format(now))
  return hour >= 18 || hour < 4 ? "Bonsoir" : "Bonjour"
}

export default async function AdminDashboardPage() {
  const user = await requireUserPage()
  const canManage = user.role === "admin"
  const [articles, stats, events, gallery, photos, messages, mayor] = await Promise.all([
    getAdminArticles(),
    getArticleStats(),
    getAdminEvents().catch(() => []),
    getGalleryStats().catch(() => ({ albums: 0, photos: 0 })),
    getPhotos(6).catch(() => []),
    getContactMessages().catch(() => []),
    getMayorMessage(),
  ])

  const now = new Date()
  const today = todayInBafoussam(now)
  const recentArticles = articles.filter((a) => !a.deleted_at).slice(0, 5)
  const upcoming = events
    .filter((e) => e.status === "published" && !isPastEvent(e, today))
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || (a.startTime ?? "").localeCompare(b.startTime ?? ""))
  const eventDrafts = events.filter((e) => e.status === "draft").length
  const newMessages = messages.filter((m) => m.status === "new")
  const recentMessages = messages.filter((m) => m.status !== "archived").slice(0, 4)

  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: EVENT_TIME_ZONE,
  }).format(now)
  const firstName = user.name?.trim().split(/\s+/)[0] || user.email.split("@")[0]

  const todo = [
    newMessages.length > 0 && plural(newMessages.length, "message non lu", "messages non lus"),
    stats.drafts > 0 && plural(stats.drafts, "article en brouillon", "articles en brouillon"),
    eventDrafts > 0 && plural(eventDrafts, "événement en brouillon", "événements en brouillon"),
  ].filter(Boolean) as string[]

  const kpis: StatItem[] = [
    {
      label: "Articles publiés",
      value: String(stats.published),
      hint: stats.lastPublishedAt ? `Dernier le ${formatArticleDate(stats.lastPublishedAt)}` : plural(stats.drafts, "brouillon"),
      href: "/admin/actualites",
      icon: Newspaper,
      color: "#1B4FA8",
    },
    {
      label: "Événements à venir",
      value: String(upcoming.length),
      hint: upcoming[0] ? `Prochain : ${upcoming[0].title}` : "Aucun événement programmé",
      href: "/admin/agenda",
      icon: CalendarDays,
      color: "#C99A00",
    },
    {
      label: "Photos en médiathèque",
      value: String(gallery.photos),
      hint: plural(gallery.albums, "album"),
      href: "/admin/mediatheque",
      icon: Images,
      color: "#0E9F6E",
    },
    {
      label: "Messages non lus",
      value: String(newMessages.length),
      hint: messages[0] ? `Dernier reçu ${relativeTime(messages[0].created_at)}` : "Aucun message reçu",
      href: "/admin/messages",
      icon: Inbox,
      color: newMessages.length > 0 ? "#DC2626" : "#64748B",
      alert: newMessages.length > 0,
    },
  ]

  const quickActions = [
    { href: "/admin/actualites/nouveau", label: "Rédiger un article", icon: PenLine },
    { href: "/admin/agenda/nouveau", label: "Ajouter un événement", icon: CalendarPlus },
    { href: "/admin/mediatheque", label: "Ajouter des photos", icon: ImagePlus },
  ]

  return (
    <>
      <AdminPageHeader
        title="Tableau de bord"
        subtitle={dateLabel}
        actions={canManage ? <SyncButton variant="outline" /> : undefined}
      />

      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
        {/* Welcome banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D2F6E] via-[#1B4FA8] to-[#1B4FA8] p-6 text-white shadow-lg shadow-blue-950/10 sm:p-8">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24 2L46 24L24 46L2 24Z' fill='none' stroke='white' stroke-opacity='0.07' stroke-width='1'/%3E%3C/svg%3E")`,
              backgroundSize: "48px 48px",
            }}
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[#F5C200]/15 blur-3xl" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 flex h-1.5" aria-hidden="true">
            <div className="flex-1 bg-[#F5C200]" />
            <div className="w-1/5 bg-white" />
            <div className="flex-1 bg-[#0D2F6E]" />
          </div>

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                <span>Espace d&apos;administration</span>
                <span className="rounded bg-[#F5C200] px-1.5 py-px text-[10px] font-bold tracking-normal text-[#0D1A2E]">
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                {greeting(now)}, {firstName}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                {todo.length > 0
                  ? `À traiter : ${todo.join(", ")}.`
                  : "Tout est à jour. Bonne journée sur le portail de la Communauté Urbaine de Bafoussam."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {quickActions.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur transition-colors hover:bg-white/20"
                >
                  <a.icon className="size-4 text-[#F5C200]" />
                  {a.label}
                </Link>
              ))}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#F5C200] px-3.5 py-2.5 text-sm font-bold text-[#0D1A2E] transition-opacity hover:opacity-90"
              >
                <ExternalLink className="size-4" />
                Voir le site
              </a>
            </div>
          </div>
        </section>

        <StatsCards items={kpis} />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent articles */}
          <DashboardPanel
            className="lg:col-span-2"
            title="Derniers articles"
            subtitle="Les 5 plus récents, publiés ou en brouillon"
            icon={Newspaper}
            link={{ href: "/admin/actualites", label: "Tout voir" }}
          >
            {recentArticles.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-slate-500">
                Aucun article.{" "}
                <Link href="/admin/actualites/nouveau" className="font-medium text-[#1B4FA8] hover:underline">
                  Rédiger le premier
                </Link>
                {canManage && (
                  <>
                    {" "}ou{" "}
                    <Link href="/admin/synchronisation" className="font-medium text-[#1B4FA8] hover:underline">
                      importer depuis WordPress
                    </Link>
                  </>
                )}
                .
              </p>
            ) : (
              <ul className="divide-y divide-[#1B4FA8]/8">
                {recentArticles.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/admin/actualites/${a.id}`}
                      className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#1B4FA8]/[0.03]"
                    >
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-black/5">
                        {a.image_url ? (
                          <Image src={a.image_url} alt="" fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="80px" />
                        ) : (
                          <ImageOff className="absolute inset-0 m-auto size-4 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-[#0D1A2E] group-hover:text-[#1B4FA8]">
                          {a.featured && <Star className="size-3.5 shrink-0 fill-[#F5C200] text-[#F5C200]" />}
                          <span className="line-clamp-1">{a.title}</span>
                        </p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                          <span>{formatArticleDate(a.published_at) || "Sans date"}</span>
                          {a.categories.slice(0, 2).map((c) => (
                            <span key={c.id} className="rounded bg-slate-100 px-1.5 py-px text-[10px] font-semibold text-slate-600">
                              {c.name}
                            </span>
                          ))}
                        </p>
                      </div>
                      {a.status === "draft" ? (
                        <Badge className="border-transparent bg-amber-100 text-amber-800">Brouillon</Badge>
                      ) : (
                        <Badge className="border-transparent bg-emerald-100 text-emerald-700">Publié</Badge>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </DashboardPanel>

          {/* Upcoming events */}
          <DashboardPanel
            title="Prochains événements"
            subtitle={eventDrafts > 0 ? `${plural(eventDrafts, "brouillon")} à publier` : "Agenda de la Ville"}
            icon={CalendarDays}
            link={{ href: "/admin/agenda", label: "Agenda" }}
          >
            {upcoming.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                Aucun événement à venir.{" "}
                <Link href="/admin/agenda/nouveau" className="font-medium text-[#1B4FA8] hover:underline">
                  En programmer un
                </Link>
              </div>
            ) : (
              <ul className="space-y-1 p-2">
                {upcoming.slice(0, 5).map((e) => {
                  const b = dateBadge(e.startDate)
                  return (
                    <li key={e.id}>
                      <Link
                        href={`/admin/agenda/${e.id}`}
                        className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#1B4FA8]/[0.04]"
                      >
                        <div className="flex w-12 shrink-0 flex-col items-center rounded-xl border-2 border-[#F5C200] bg-[#0D2F6E] py-1.5 text-center">
                          <span className="text-base font-black leading-none text-white">{b.day}</span>
                          <span className="text-[9px] font-black uppercase tracking-wide text-[#F5C200]">{b.month}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1 text-sm font-semibold text-[#0D1A2E] group-hover:text-[#1B4FA8]">
                            {e.featured && <Star className="size-3 shrink-0 fill-[#F5C200] text-[#F5C200]" />}
                            <span className="line-clamp-1">{e.title}</span>
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                            {formatEventTime(e)}
                            {e.location && (
                              <>
                                <span aria-hidden="true">·</span>
                                <MapPin className="size-3 shrink-0" />
                                <span className="truncate">{e.location}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </DashboardPanel>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Messages */}
          <DashboardPanel
            title="Messages récents"
            subtitle={newMessages.length > 0 ? plural(newMessages.length, "nouveau message", "nouveaux messages") : "Formulaire de contact"}
            icon={Inbox}
            link={{ href: "/admin/messages", label: "Boîte" }}
          >
            {recentMessages.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-slate-500">Aucun message pour le moment.</p>
            ) : (
              <ul className="divide-y divide-[#1B4FA8]/8">
                {recentMessages.map((m) => (
                  <li key={m.id}>
                    <Link href="/admin/messages" className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-[#1B4FA8]/[0.03]">
                      <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1B4FA8]/10 text-xs font-bold uppercase text-[#1B4FA8]">
                        {m.name.trim().charAt(0) || "?"}
                        {m.status === "new" && (
                          <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className={`truncate text-sm ${m.status === "new" ? "font-bold text-[#0D1A2E]" : "font-medium text-slate-700"}`}>
                            {m.name}
                          </p>
                          <span className="shrink-0 text-[10px] text-slate-400">{relativeTime(m.created_at)}</span>
                        </div>
                        <p className="truncate text-xs text-slate-500">{m.subject}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </DashboardPanel>

          {/* Gallery */}
          <DashboardPanel
            title="Médiathèque"
            subtitle={`${plural(gallery.photos, "photo")} · ${plural(gallery.albums, "album")}`}
            icon={Images}
            link={{ href: "/admin/mediatheque", label: "Gérer" }}
          >
            {photos.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-slate-500">
                Aucune photo.{" "}
                <Link href="/admin/mediatheque" className="font-medium text-[#1B4FA8] hover:underline">
                  Ajouter des photos
                </Link>
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 p-3">
                {photos.map((p) => (
                  <Link
                    key={p.id}
                    href="/admin/mediatheque"
                    className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100"
                  >
                    <Image
                      src={p.url}
                      alt={p.caption}
                      fill
                      sizes="120px"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </Link>
                ))}
              </div>
            )}
          </DashboardPanel>

          {/* Mayor + admin tools */}
          <div className="flex flex-col gap-6">
            <DashboardPanel title="Mot du maire" icon={Quote} link={{ href: "/admin/mot-du-maire", label: "Modifier" }}>
              <div className="flex items-center gap-4 p-5">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-2 ring-[#F5C200]">
                  <Image src={mayor.photo} alt="" fill sizes="64px" className="object-cover object-top" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#0D1A2E]">{mayorFullName(mayor)}</p>
                  <p className="line-clamp-2 text-xs text-slate-500">{mayor.role}</p>
                  {mayor.mandate && <p className="mt-1 text-[11px] font-semibold text-[#1B4FA8]">{mayor.mandate}</p>}
                </div>
              </div>
            </DashboardPanel>

            {canManage && (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/admin/synchronisation"
                  className="group rounded-2xl border border-[#1B4FA8]/10 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <RefreshCw className="size-5 text-emerald-600 transition-transform duration-500 group-hover:rotate-180" />
                  <p className="mt-3 text-sm font-bold text-[#0D1A2E]">Synchronisation</p>
                  <p className="truncate text-[11px] text-slate-500">{stats.lastSyncedAt ? relativeTime(stats.lastSyncedAt) : "Jamais lancée"}</p>
                </Link>
                <Link
                  href="/admin/utilisateurs"
                  className="group rounded-2xl border border-[#1B4FA8]/10 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Users className="size-5 text-[#1B4FA8]" />
                  <p className="mt-3 text-sm font-bold text-[#0D1A2E]">Utilisateurs</p>
                  <p className="truncate text-[11px] text-slate-500">Comptes et rôles</p>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
