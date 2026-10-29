"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  CheckCircle2,
  CircleSlash,
  Clock,
  Download,
  ImageOff,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { ImportOneResult, SyncCategory, SyncPost } from "@/lib/sync-types"

type Phase = "setup" | "running" | "paused" | "done"
type LogStatus = "imported" | "warning" | "skipped" | "error"
type LogEntry = { key: number; status: LogStatus; title: string; message: string | null; at: Date }
type Current = { title: string; date: string; imageUrl: string | null; loading: boolean }

const DEFAULT_CATEGORY_SLUG = "actualites"
const FIRST_YEAR = 2018

function formatWpDate(s: string): string {
  const d = new Date(s)
  return Number.isNaN(d.getTime())
    ? s
    : d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
}

function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return m > 0 ? `${m} min ${String(s).padStart(2, "0")} s` : `${s} s`
}

async function readJson<T>(res: Response): Promise<T & { error?: string }> {
  return (await res.json().catch(() => ({}))) as T & { error?: string }
}

const LOG_STYLES: Record<LogStatus, { icon: typeof CheckCircle2; className: string; label: string }> = {
  imported: { icon: CheckCircle2, className: "text-emerald-600", label: "Importé" },
  warning: { icon: AlertTriangle, className: "text-amber-500", label: "Importé avec avertissement" },
  skipped: { icon: CircleSlash, className: "text-slate-400", label: "Ignoré" },
  error: { icon: XCircle, className: "text-red-600", label: "Erreur" },
}

export default function SyncRunner() {
  const currentYear = new Date().getFullYear()
  const years = useMemo(
    () => Array.from({ length: currentYear - FIRST_YEAR + 1 }, (_, i) => currentYear - i),
    [currentYear]
  )

  const [phase, setPhase] = useState<Phase>("setup")
  const [year, setYear] = useState(currentYear)
  const [categories, setCategories] = useState<SyncCategory[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [posts, setPosts] = useState<SyncPost[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [analysisKey, setAnalysisKey] = useState(0)

  const [processed, setProcessed] = useState(0)
  const [counts, setCounts] = useState({ imported: 0, warnings: 0, skipped: 0, errors: 0 })
  const [durations, setDurations] = useState<number[]>([])
  const [current, setCurrent] = useState<Current | null>(null)
  const [log, setLog] = useState<LogEntry[]>([])
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [finishedAt, setFinishedAt] = useState<number | null>(null)
  const [purging, setPurging] = useState(false)

  const pauseRequested = useRef(false)
  const nextIndex = useRef(0)
  const logKey = useRef(0)

  // Categories and their counts for the selected year.
  useEffect(() => {
    if (phase !== "setup") return
    const controller = new AbortController()
    setLoadingCategories(true)
    setSetupError(null)
    fetch(`/api/admin/sync/preview?year=${year}`, { signal: controller.signal })
      .then(async (res) => {
        const data = await readJson<{ categories: SyncCategory[] }>(res)
        if (!res.ok) throw new Error(data.error || "Erreur lors du chargement des catégories")
        setCategories(data.categories)
        setSelected((prev) => {
          const kept = prev.filter((id) => data.categories.some((c) => c.id === id))
          if (kept.length) return kept
          const fallback = data.categories.find((c) => c.slug === DEFAULT_CATEGORY_SLUG) ?? data.categories[0]
          return fallback ? [fallback.id] : []
        })
      })
      .catch((e) => {
        if (controller.signal.aborted) return
        setCategories([])
        setSelected([])
        setSetupError(e instanceof Error ? e.message : "Erreur de connexion")
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingCategories(false)
      })
    return () => controller.abort()
  }, [year, phase])

  // List of posts for the current selection, with "already imported" flags.
  useEffect(() => {
    if (phase !== "setup") return
    if (selected.length === 0) {
      setPosts([])
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(() => {
      setAnalyzing(true)
      fetch("/api/admin/sync/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, categoryIds: selected }),
        signal: controller.signal,
      })
        .then(async (res) => {
          const data = await readJson<{ posts: SyncPost[] }>(res)
          if (!res.ok) throw new Error(data.error || "Erreur lors de l'analyse")
          setPosts(data.posts)
          setSetupError(null)
        })
        .catch((e) => {
          if (controller.signal.aborted) return
          setPosts([])
          setSetupError(e instanceof Error ? e.message : "Erreur de connexion")
        })
        .finally(() => {
          if (!controller.signal.aborted) setAnalyzing(false)
        })
    }, 350)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [year, selected, phase, analysisKey])

  useEffect(() => {
    if (phase !== "running") return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [phase])

  const existingCount = posts.filter((p) => p.exists).length
  const toImportCount = posts.length - existingCount

  const addLog = useCallback((status: LogStatus, title: string, message: string | null) => {
    logKey.current += 1
    const entry: LogEntry = { key: logKey.current, status, title, message, at: new Date() }
    setLog((prev) => [entry, ...prev])
  }, [])

  const run = useCallback(
    async (queue: SyncPost[]) => {
      pauseRequested.current = false
      setPhase("running")

      while (nextIndex.current < queue.length) {
        if (pauseRequested.current) {
          setPhase("paused")
          return
        }
        const post = queue[nextIndex.current]

        if (post.exists) {
          addLog("skipped", post.title, "Déjà importé")
          setCounts((c) => ({ ...c, skipped: c.skipped + 1 }))
        } else {
          setCurrent({ title: post.title, date: post.date, imageUrl: null, loading: true })
          let result: ImportOneResult | null = null
          let failure: string | null = null
          try {
            const res = await fetch("/api/admin/sync/import-one", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ wpId: post.wpId }),
            })
            const data = await readJson<ImportOneResult>(res)
            if (res.ok) result = data
            else failure = data.error || `Erreur serveur (${res.status})`
          } catch {
            failure = "Connexion au serveur perdue"
          }

          const title = result?.title || post.title
          if (result) setDurations((d) => [...d, result.ms])
          setCurrent({ title, date: post.date, imageUrl: result?.imageUrl ?? null, loading: false })

          if (!result || result.status === "error") {
            addLog("error", title, result?.reason ?? failure)
            setCounts((c) => ({ ...c, errors: c.errors + 1 }))
          } else if (result.status === "skipped") {
            addLog("skipped", title, result.reason)
            setCounts((c) => ({ ...c, skipped: c.skipped + 1 }))
          } else if (result.warning) {
            addLog("warning", title, result.warning)
            setCounts((c) => ({ ...c, imported: c.imported + 1, warnings: c.warnings + 1 }))
          } else {
            addLog("imported", title, null)
            setCounts((c) => ({ ...c, imported: c.imported + 1 }))
          }
        }

        nextIndex.current += 1
        setProcessed(nextIndex.current)
      }

      setFinishedAt(Date.now())
      setPhase("done")
    },
    [addLog]
  )

  function start() {
    nextIndex.current = 0
    setProcessed(0)
    setCounts({ imported: 0, warnings: 0, skipped: 0, errors: 0 })
    setDurations([])
    setCurrent(null)
    setLog([])
    setStartedAt(Date.now())
    setFinishedAt(null)
    void run(posts)
  }

  function resume() {
    void run(posts)
  }

  function reset() {
    setPhase("setup")
    setCurrent(null)
    setAnalysisKey((k) => k + 1)
  }

  async function purge() {
    setPurging(true)
    try {
      const res = await fetch("/api/admin/sync/purge", { method: "POST" })
      const data = await readJson<{ deleted: number }>(res)
      if (!res.ok) throw new Error(data.error || "Erreur lors de la suppression")
      toast.success("Articles WordPress supprimés", {
        description: `${data.deleted} article(s) et leurs images supprimés.`,
      })
      setAnalysisKey((k) => k + 1)
    } catch (e) {
      toast.error("Échec", { description: e instanceof Error ? e.message : "Erreur de connexion" })
    } finally {
      setPurging(false)
    }
  }

  function toggleCategory(id: number, checked: boolean) {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
  }

  const total = posts.length
  const percent = total ? Math.round((processed / total) * 100) : 0
  const remainingToImport = posts.slice(processed).filter((p) => !p.exists).length
  const avgMs = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
  const eta = avgMs && remainingToImport ? formatDuration(avgMs * remainingToImport) : null
  const isActive = phase === "running" || phase === "paused"

  return (
    <div className="space-y-6">
      {phase === "setup" && (
        <section className="rounded-2xl border border-[#1B4FA8]/12 bg-white shadow-sm">
          <div className="border-b border-[#1B4FA8]/8 px-5 py-4">
            <h3 className="text-base font-semibold text-[#0D1A2E]">Paramètres de l’import</h3>
            <p className="mt-0.5 text-sm text-slate-500">Choisissez l’année et les catégories à récupérer.</p>
          </div>

          <div className="grid gap-6 p-5 md:grid-cols-[200px_1fr]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Année</label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="w-full" aria-label="Année">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Catégories</p>
              {loadingCategories ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-11 rounded-xl" />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Aucun article publié en {year} sur le site WordPress.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {categories.map((c) => {
                    const checked = selected.includes(c.id)
                    return (
                      <label
                        key={c.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                          checked ? "border-[#1B4FA8]/40 bg-[#1B4FA8]/5" : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => toggleCategory(c.id, v === true)}
                          className="data-[state=checked]:border-[#1B4FA8] data-[state=checked]:bg-[#1B4FA8]"
                        />
                        <span className="flex-1 text-sm font-medium text-[#0D1A2E]">{c.name}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          {c.count}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-[#1B4FA8]/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm" aria-live="polite">
              {setupError ? (
                <span className="font-medium text-red-600">{setupError}</span>
              ) : analyzing ? (
                <span className="inline-flex items-center gap-2 text-slate-500">
                  <Loader2 className="size-4 animate-spin" /> Analyse en cours…
                </span>
              ) : selected.length === 0 ? (
                <span className="text-slate-500">Sélectionnez au moins une catégorie.</span>
              ) : (
                <span className="text-slate-600">
                  <strong className="text-[#0D1A2E]">{total}</strong> article{total !== 1 ? "s" : ""} trouvé
                  {total !== 1 ? "s" : ""} · <strong className="text-[#0D1A2E]">{existingCount}</strong> déjà importé
                  {existingCount !== 1 ? "s" : ""} · <strong className="text-[#1B4FA8]">{toImportCount}</strong> à importer
                </span>
              )}
            </div>
            <Button
              onClick={start}
              disabled={analyzing || loadingCategories || total === 0 || !!setupError}
              className="bg-[#1B4FA8] font-semibold text-white hover:bg-[#1B4FA8]/90"
            >
              <Download className="size-4" />
              Lancer l’import
            </Button>
          </div>
        </section>
      )}

      {phase !== "setup" && (
        <section className="rounded-2xl border border-[#1B4FA8]/12 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#0D1A2E]">
                {phase === "done" ? "Import terminé" : phase === "paused" ? "Import en pause" : "Import en cours…"}
              </h3>
              <p className="mt-0.5 text-sm text-slate-500">
                {phase === "running"
                  ? "Gardez cette page ouverte jusqu’à la fin de l’import."
                  : phase === "paused"
                    ? "Reprenez quand vous voulez, l’import repartira de l’article suivant."
                    : `Durée totale : ${formatDuration((finishedAt ?? Date.now()) - (startedAt ?? Date.now()))}`}
              </p>
            </div>
            <div className="flex gap-2">
              {phase === "running" && (
                <Button variant="outline" onClick={() => (pauseRequested.current = true)}>
                  <Pause className="size-4" /> Pause
                </Button>
              )}
              {phase === "paused" && (
                <>
                  <Button onClick={resume} className="bg-[#1B4FA8] text-white hover:bg-[#1B4FA8]/90">
                    <Play className="size-4" /> Reprendre
                  </Button>
                  <Button variant="outline" onClick={reset}>
                    Arrêter
                  </Button>
                </>
              )}
              {phase === "done" && (
                <>
                  <Button variant="outline" onClick={reset}>
                    <RotateCcw className="size-4" /> Nouvelle synchronisation
                  </Button>
                  <Button asChild className="bg-[#1B4FA8] text-white hover:bg-[#1B4FA8]/90">
                    <Link href="/admin">Tableau de bord</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-baseline justify-between text-sm">
              <span className="font-semibold text-[#0D1A2E]">
                {processed} / {total}
              </span>
              <span className="font-semibold text-[#1B4FA8]">{percent} %</span>
            </div>
            <div
              className="h-3 w-full overflow-hidden rounded-full bg-[#1B4FA8]/10"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={processed}
              aria-label="Progression de l'import"
            >
              <div
                className={`h-full rounded-full transition-[width] duration-300 ${
                  phase === "done" ? "bg-emerald-500" : phase === "paused" ? "bg-[#F5C200]" : "bg-[#1B4FA8]"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Counter label="Importés" value={counts.imported} hint={counts.warnings ? `dont ${counts.warnings} avec avertissement` : undefined} className="text-emerald-600" />
            <Counter label="Ignorés" value={counts.skipped} hint="déjà présents" className="text-slate-500" />
            <Counter label="Erreurs" value={counts.errors} className="text-red-600" />
            <Counter
              label="Temps restant"
              value={phase === "done" ? "—" : eta ?? (isActive ? "calcul…" : "—")}
              icon={<Clock className="size-3.5" />}
              className="text-[#0D1A2E]"
            />
          </div>
        </section>
      )}

      {phase !== "setup" && (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <section className="min-w-0 rounded-2xl border border-[#1B4FA8]/12 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500">
              {phase === "running" ? "Article en cours" : "Dernier article traité"}
            </h3>
            {current ? (
              <div className="mt-3 space-y-3">
                <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-100">
                  {current.loading ? (
                    <Skeleton className="size-full" />
                  ) : current.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={current.imageUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-slate-400">
                      <ImageOff className="size-6" />
                    </div>
                  )}
                  {current.loading && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="size-6 animate-spin text-[#1B4FA8]" />
                    </span>
                  )}
                </div>
                <p className="line-clamp-3 text-sm font-semibold text-[#0D1A2E]">{current.title}</p>
                <p className="text-xs text-slate-500">{formatWpDate(current.date)}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">Aucun article téléchargé pour l’instant.</p>
            )}
          </section>

          <section className="flex min-h-0 min-w-0 flex-col rounded-2xl border border-[#1B4FA8]/12 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#1B4FA8]/8 px-5 py-3">
              <h3 className="text-sm font-semibold text-[#0D1A2E]">Journal</h3>
              <span className="text-xs text-slate-400">{log.length} entrée{log.length !== 1 ? "s" : ""}</span>
            </div>
            <ul className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto" aria-live="polite">
              {log.length === 0 && <li className="px-5 py-6 text-center text-sm text-slate-400">En attente…</li>}
              {log.map((entry) => {
                const style = LOG_STYLES[entry.status]
                const Icon = style.icon
                return (
                  <li key={entry.key} className="flex items-start gap-3 px-5 py-2.5">
                    <Icon className={`mt-0.5 size-4 shrink-0 ${style.className}`} aria-label={style.label} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-[#0D1A2E]">{entry.title}</p>
                      {entry.message && <p className={`text-xs ${entry.status === "error" ? "text-red-600" : "text-slate-500"}`}>{entry.message}</p>}
                    </div>
                    <time className="shrink-0 text-[11px] tabular-nums text-slate-400">
                      {entry.at.toLocaleTimeString("fr-FR")}
                    </time>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      )}

      <section className="rounded-2xl border border-red-200 bg-red-50/40 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-red-800">Zone de danger</h3>
            <p className="mt-0.5 text-sm text-red-700/80">
              Supprime les articles importés de WordPress et leurs images. Les articles créés dans l’admin sont
              conservés.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={isActive || purging} className="border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800">
                {purging ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                Supprimer les articles WordPress
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer les articles WordPress ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tous les articles importés depuis WordPress (y compris ceux modifiés ou mis à la corbeille) et
                  leurs images à la une seront définitivement supprimés. Les articles créés dans l’admin ne sont
                  pas touchés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={purge} className="bg-red-600 text-white hover:bg-red-700">
                  Oui, supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  )
}

function Counter({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string
  value: number | string
  hint?: string
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
      <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        {icon}
        {label}
      </p>
      <p className={`mt-1 text-xl font-bold tabular-nums ${className ?? ""}`}>{value}</p>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  )
}
