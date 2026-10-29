"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2, LogOut, X } from "lucide-react"

const LOGO_URL = "/images/logo-cub.png"
const HERO_URL = "/images/hero-bafoussam.png"
const DURATION_MS = 5000
const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function LogoutCountdown({ name, cancelHref }: { name: string; cancelHref: string }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const submittedRef = useRef(false)
  const [remaining, setRemaining] = useState(DURATION_MS)
  const [leaving, setLeaving] = useState(false)

  const logout = useCallback(() => {
    if (submittedRef.current) return
    submittedRef.current = true
    setLeaving(true)
    formRef.current?.requestSubmit()
  }, [])

  const cancel = useCallback(() => {
    if (submittedRef.current) return
    router.replace(cancelHref)
  }, [router, cancelHref])

  useEffect(() => {
    const deadline = Date.now() + DURATION_MS
    let frame = 0
    const tick = () => {
      const left = Math.max(0, deadline - Date.now())
      setRemaining(left)
      if (left > 0) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    // A timeout still fires in a background tab, where animation frames are paused.
    const timer = setTimeout(logout, DURATION_MS)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
    }
  }, [logout])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        cancel()
      } else if (e.key === "Enter") {
        const target = e.target as HTMLElement | null
        if (target?.closest("button, a")) return
        e.preventDefault()
        logout()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [cancel, logout])

  const seconds = Math.ceil(remaining / 1000)
  const progress = remaining / DURATION_MS

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#0D1A2E] px-4 py-10 font-sans antialiased">
      <Image src={HERO_URL} alt="" fill priority sizes="100vw" className="object-cover" />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, rgba(13,47,110,0.94) 0%, rgba(27,79,168,0.86) 55%, rgba(13,26,46,0.96) 100%)" }}
      />
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <pattern id="logout-losanges" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M28 4L52 28L28 52L4 28Z" fill="none" stroke="white" strokeWidth="0.6" strokeOpacity={0.09} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#logout-losanges)" />
      </svg>

      <main className="relative w-full max-w-[420px]">
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/30">
          <div className="flex h-1.5" aria-hidden="true">
            <div className="flex-1 bg-[#1B4FA8]" />
            <div className="w-16 bg-[#F5C200]" />
            <div className="flex-1 bg-[#0D2F6E]" />
          </div>

          <div className="p-7 text-center sm:p-9">
            <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white p-0.5 shadow-md ring-4 ring-[#1B4FA8]/10">
              <Image src={LOGO_URL} alt="" width={52} height={52} className="h-12 w-12 object-contain" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-[#0D1A2E]">À bientôt, {name}</h1>
            <p className="mt-1.5 text-sm text-slate-500">Vous allez être déconnecté de l’espace d’administration.</p>

            <div className="relative mx-auto my-8 h-36 w-36" role="timer" aria-label={`Déconnexion dans ${seconds} seconde${seconds > 1 ? "s" : ""}`}>
              <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#E8EEF8" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r={RADIUS}
                  fill="none"
                  stroke={seconds <= 2 ? "#DC2626" : "#1B4FA8"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
                  className="transition-[stroke] duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
                {leaving ? (
                  <Loader2 className="h-9 w-9 animate-spin text-[#1B4FA8]" />
                ) : (
                  <>
                    <span className="text-5xl font-black leading-none tabular-nums text-[#0D1A2E]">{seconds}</span>
                    <span className="mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      seconde{seconds > 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </div>
            </div>
            <p className="sr-only" aria-live="polite">
              Déconnexion dans 5 secondes. Appuyez sur Échap pour annuler.
            </p>

            <form ref={formRef} action="/api/admin/logout" method="POST" onSubmit={() => setLeaving(true)}>
              <div className="flex flex-col gap-2.5 sm:flex-row-reverse">
                <button
                  type="submit"
                  autoFocus
                  disabled={leaving}
                  onClick={(e) => {
                    e.preventDefault()
                    logout()
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-600/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {leaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogOut className="h-4 w-4" aria-hidden="true" />}
                  {leaving ? "Déconnexion…" : "Se déconnecter maintenant"}
                </button>
                <button
                  type="button"
                  onClick={cancel}
                  disabled={leaving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1B4FA8]/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Annuler
                </button>
              </div>
            </form>

            <p className="mt-5 text-xs text-slate-400">
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-sans text-[11px] font-semibold text-slate-500">Échap</kbd>{" "}
              pour annuler
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
