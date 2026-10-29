"use client"

import { useEffect, useId, useRef, useState } from "react"
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  CalendarCheck,
  CalendarClock,
  FileText,
  Inbox,
  KeyRound,
  Loader2,
  PackageSearch,
  RotateCcw,
} from "lucide-react"
import {
  TONE_COLORS,
  formatCode,
  formatDateTime,
  formatDay,
  stepMeta,
  trackingErrorMessage,
  type MailTracking,
  type TrackingError,
} from "@/lib/mail-tracking"

const INPUT_CLASS =
  "h-12 w-full rounded-xl border-2 bg-white pl-12 pr-4 text-base text-[#0D1A2E] placeholder:text-slate-400 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1B4FA8] disabled:opacity-60"

function InfoTile({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Building2
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-white p-4" style={{ borderColor: "rgba(27,79,168,0.12)" }}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(27,79,168,0.08)" }}>
        <Icon className="h-4.5 w-4.5" style={{ color: "#1B4FA8" }} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#64748b" }}>
          {label}
        </p>
        <div className="mt-0.5 text-sm font-semibold leading-snug" style={{ color: "#0D1A2E" }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function TrackingResult({ result, onReset }: { result: MailTracking; onReset: () => void }) {
  const current = stepMeta(result.step.id)
  const tone = TONE_COLORS[current.tone]
  const StepIcon = current.icon
  const received = result.arrivalDate ?? result.mailDate

  return (
    <section className="animate-slide-up-in mt-6" aria-live="polite" aria-label={`Suivi du courrier ${result.reference}`}>
      <div className="overflow-hidden rounded-2xl border-2" style={{ borderColor: tone.border, backgroundColor: tone.bg }}>
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold tracking-wide" style={{ color: "#64748b" }}>
              Dossier n° {result.reference}
            </p>
            <h3 className="mt-1 text-lg font-black leading-snug text-balance sm:text-xl" style={{ color: "#0D1A2E" }}>
              {result.subject ?? "Courrier arrivée"}
            </h3>
          </div>
          <span
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full px-3.5 py-1.5 text-sm font-bold"
            style={{ backgroundColor: "white", color: tone.fg, boxShadow: `0 0 0 1.5px ${tone.border}` }}
          >
            <StepIcon className="h-4 w-4" aria-hidden="true" />
            {result.step.label}
          </span>
        </div>

        <div className="grid gap-3 px-5 pb-5 sm:grid-cols-3 sm:px-6 sm:pb-6">
          <InfoTile icon={Building2} label="Service en charge">
            {result.service ?? <span style={{ color: "#64748b" }}>Pas encore attribué</span>}
          </InfoTile>
          <InfoTile icon={Inbox} label={result.arrivalDate ? "Reçu le" : "Courrier du"}>
            {received ? formatDay(received) : <span style={{ color: "#64748b" }}>—</span>}
          </InfoTile>
          <InfoTile icon={result.overdue ? CalendarClock : CalendarCheck} label="Traitement prévu avant le">
            {result.dueDate ? (
              <span className="flex flex-wrap items-center gap-2">
                {formatDay(result.dueDate)}
                {result.overdue && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700">
                    <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                    Délai dépassé
                  </span>
                )}
              </span>
            ) : (
              <span style={{ color: "#64748b" }}>Fixé à l’attribution au service</span>
            )}
          </InfoTile>
        </div>
      </div>

      {result.timeline.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-4 text-xs font-black uppercase tracking-widest" style={{ color: "#1B4FA8" }}>
            Historique du courrier
          </h4>
          <ol className="relative">
            {result.timeline.map((item, index) => {
              const meta = stepMeta(item.step)
              const Icon = meta.icon
              const isLast = index === result.timeline.length - 1
              const colors = isLast ? TONE_COLORS[meta.tone] : null
              return (
                <li key={`${item.step}-${item.date}`} className="relative flex gap-4 pb-6 last:pb-0">
                  {!isLast && (
                    <span className="absolute left-[17px] top-9 bottom-0 w-0.5" style={{ backgroundColor: "rgba(27,79,168,0.15)" }} aria-hidden="true" />
                  )}
                  <span
                    className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2"
                    style={{
                      backgroundColor: colors ? colors.fg : "white",
                      borderColor: colors ? colors.fg : "rgba(27,79,168,0.25)",
                      color: colors ? "white" : "#1B4FA8",
                    }}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 pt-1">
                    <p className={`text-sm leading-snug ${isLast ? "font-bold" : "font-semibold"}`} style={{ color: "#0D1A2E" }}>
                      {item.label}
                    </p>
                    <time dateTime={item.date} className="mt-0.5 block text-xs" style={{ color: "#64748b" }}>
                      {formatDateTime(item.date)}
                    </time>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      <button
        type="button"
        onClick={onReset}
        className="mt-6 flex items-center gap-2 rounded-lg text-sm font-semibold transition-colors hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4FA8] focus-visible:ring-offset-2"
        style={{ color: "#1B4FA8" }}
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Nouvelle recherche
      </button>
    </section>
  )
}

export default function TrackingLookup({ readFromUrl = false }: { readFromUrl?: boolean }) {
  const [reference, setReference] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MailTracking | null>(null)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)
  const referenceId = useId()
  const codeId = useId()
  const errorId = useId()

  async function lookup(ref: string, secret: string) {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await fetch("/api/suivi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: ref, code: secret }),
      })
      const data = await response.json().catch(() => null)
      if (id !== requestId.current) return
      if (response.ok && data) setResult(data as MailTracking)
      else {
        const body = (data ?? {}) as { error?: TrackingError; retryAfter?: number }
        const retryAfter = body.retryAfter ?? Number(response.headers.get("retry-after"))
        setError(trackingErrorMessage(body.error ?? "unavailable", retryAfter || null))
      }
    } catch {
      if (id === requestId.current) setError("Connexion impossible. Vérifiez votre réseau puis réessayez.")
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }

  // QR code of the receipt: `?reference=…` in the query, `#code=…` in the fragment, erased as soon as read.
  useEffect(() => {
    if (!readFromUrl) return
    const readUrl = () => {
      const ref = new URLSearchParams(window.location.search).get("reference") ?? ""
      const secret = new URLSearchParams(window.location.hash.slice(1)).get("code") ?? ""
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search)
      }
      if (ref) setReference(ref)
      if (secret) setCode(formatCode(secret))
      if (ref && secret) void lookup(ref, secret)
    }
    readUrl()
    window.addEventListener("hashchange", readUrl)
    return () => window.removeEventListener("hashchange", readUrl)
  }, [readFromUrl])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reference.trim() || !code.trim()) {
      setError("Saisissez le numéro de dossier et le code de suivi.")
      return
    }
    void lookup(reference, code)
  }

  function reset() {
    requestId.current++
    setReference("")
    setCode("")
    setResult(null)
    setError(null)
    setLoading(false)
  }

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate aria-describedby={error ? errorId : undefined} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] sm:items-start">
          <div>
            <label htmlFor={referenceId} className="mb-1.5 block text-sm font-semibold" style={{ color: "#374151" }}>
              Numéro de dossier
            </label>
            <div className="relative">
              <FileText className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: reference ? "#1B4FA8" : "#94a3b8" }} aria-hidden="true" />
              <input
                id={referenceId}
                value={reference}
                onChange={(e) => {
                  setReference(e.target.value)
                  if (error) setError(null)
                }}
                placeholder="ARR-2026-00042"
                maxLength={40}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                disabled={loading}
                aria-invalid={!!error}
                className={`${INPUT_CLASS} font-mono uppercase placeholder:normal-case`}
                style={{ borderColor: error ? "#b91c1c" : "rgba(27,79,168,0.2)" }}
              />
            </div>
          </div>
          <div>
            <label htmlFor={codeId} className="mb-1.5 block text-sm font-semibold" style={{ color: "#374151" }}>
              Code de suivi
            </label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: code ? "#1B4FA8" : "#94a3b8" }} aria-hidden="true" />
              <input
                id={codeId}
                value={code}
                onChange={(e) => {
                  setCode(formatCode(e.target.value))
                  if (error) setError(null)
                }}
                placeholder="XXXX-XXXX"
                maxLength={9}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                disabled={loading}
                aria-invalid={!!error}
                className={`${INPUT_CLASS} font-mono tracking-widest`}
                style={{ borderColor: error ? "#b91c1c" : "rgba(27,79,168,0.2)" }}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex h-12 items-center justify-center gap-2 rounded-xl px-6 font-bold text-white transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-60 sm:mt-[30px] sm:px-8"
            style={{ backgroundColor: "#1B4FA8", boxShadow: "0 2px 8px rgba(27,79,168,0.35)" }}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <PackageSearch className="h-5 w-5" aria-hidden="true" />}
            {loading ? "Recherche…" : "Suivre"}
          </button>
        </div>

        <p className="text-xs" style={{ color: "#64748b" }}>
          Le numéro de dossier et le code de suivi figurent dans l’encadré de votre accusé de réception (ou dans le message WhatsApp ou email reçu).
        </p>

        {error && (
          <div
            id={errorId}
            role="alert"
            className="flex items-start gap-3 rounded-xl border p-4"
            style={{ backgroundColor: "rgba(185,28,28,0.06)", borderColor: "rgba(185,28,28,0.25)" }}
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "#b91c1c" }} aria-hidden="true" />
            <p className="text-sm font-medium" style={{ color: "#b91c1c" }}>
              {error}
            </p>
          </div>
        )}
      </form>

      {loading && (
        <div className="mt-6 animate-pulse rounded-2xl border p-5" style={{ borderColor: "rgba(27,79,168,0.12)", backgroundColor: "rgba(27,79,168,0.03)" }} aria-hidden="true">
          <div className="h-3 w-1/4 rounded" style={{ backgroundColor: "rgba(27,79,168,0.1)" }} />
          <div className="mt-3 h-5 w-2/3 rounded" style={{ backgroundColor: "rgba(27,79,168,0.15)" }} />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-xl" style={{ backgroundColor: "rgba(27,79,168,0.08)" }} />
            ))}
          </div>
        </div>
      )}

      {result && !loading && <TrackingResult result={result} onReset={reset} />}
    </div>
  )
}
