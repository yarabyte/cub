"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  Images,
  Loader2,
  Lock,
  Mail,
  Newspaper,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"

const LOGO_URL = "/images/logo-cub.png"
const HERO_URL = "/images/hero-bafoussam.png"

const FEATURES: { icon: LucideIcon; label: string }[] = [
  { icon: Newspaper, label: "Actualités et communiqués" },
  { icon: CalendarDays, label: "Agenda de la ville" },
  { icon: Images, label: "Médiathèque et galeries" },
]

function Losanges({ id, opacity }: { id: string; opacity: number }) {
  return (
    <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <pattern id={id} width="56" height="56" patternUnits="userSpaceOnUse">
          <path d="M28 4L52 28L28 52L4 28Z" fill="none" stroke="white" strokeWidth="0.6" strokeOpacity={opacity} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

function Field({
  id,
  label,
  icon: Icon,
  children,
}: {
  id: string
  label: string
  icon: LucideIcon
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="group relative">
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#1B4FA8]"
          aria-hidden="true"
        />
        {children}
      </div>
    </div>
  )
}

function LoggedOutNotice() {
  const fromLogout = useSearchParams().get("deconnecte") === "1"
  // Kept in state: clearing the URL below also updates useSearchParams.
  const [loggedOut] = useState(fromLogout)

  useEffect(() => {
    if (!loggedOut) return
    const url = new URL(window.location.href)
    url.searchParams.delete("deconnecte")
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash)
  }, [loggedOut])

  if (!loggedOut) return null
  return (
    <div
      className="mb-6 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
      role="status"
    >
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      Vous avez été déconnecté avec succès.
    </div>
  )
}

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 text-[15px] text-[#0D1A2E] placeholder:text-slate-400 transition-all hover:border-slate-300 focus:border-[#1B4FA8] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1B4FA8]/10"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || "Erreur de connexion")
        return
      }
      router.push("/admin")
      router.refresh()
    } catch {
      setError("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  function trackCapsLock(e: React.KeyboardEvent<HTMLInputElement>) {
    setCapsLock(e.getModifierState("CapsLock"))
  }

  return (
    <div className="flex min-h-screen font-sans antialiased bg-[#F2F4F8]">
      {/* Panneau visuel */}
      <aside className="relative hidden w-[46%] max-w-[720px] overflow-hidden lg:flex lg:flex-col">
        <Image src={HERO_URL} alt="" fill priority sizes="46vw" className="object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, rgba(13,47,110,0.92) 0%, rgba(27,79,168,0.82) 55%, rgba(13,26,46,0.94) 100%)" }}
        />
        <Losanges id="login-losanges" opacity={0.09} />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Link href="/" className="inline-flex items-center gap-3 self-start">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white p-0.5 shadow-lg ring-4 ring-white/15">
              <Image src={LOGO_URL} alt="" width={52} height={52} className="h-12 w-12 object-contain" />
            </span>
            <span>
              <span className="block text-lg font-black leading-none tracking-tight text-white">BAFOUSSAM</span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5C200]">
                Portail Officiel — C.U.B.
              </span>
            </span>
          </Link>

          <div className="max-w-md">
            <div className="mb-5 flex gap-1.5" aria-hidden="true">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: i % 2 === 0 ? "#F5C200" : "rgba(255,255,255,0.5)" }} />
              ))}
            </div>
            <p className="text-4xl font-black leading-tight text-white text-balance xl:text-[2.75rem]">
              Espace d’administration
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/75">
              Gérez les contenus du portail officiel de la Communauté Urbaine de Bafoussam.
            </p>
            <ul className="mt-8 space-y-3">
              {FEATURES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm font-medium text-white/90">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm">
                    <Icon className="h-4.5 w-4.5 text-[#F5C200]" aria-hidden="true" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/50">© {new Date().getFullYear()} Communauté Urbaine de Bafoussam</p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex h-1.5" aria-hidden="true">
          <div className="flex-1 bg-[#F5C200]" />
          <div className="w-[15%] bg-white" />
          <div className="flex-1 bg-[#0D2F6E]" />
        </div>
      </aside>

      {/* Formulaire */}
      <main className="relative flex flex-1 flex-col">
        <div className="flex h-1.5 shrink-0 lg:hidden" aria-hidden="true">
          <div className="flex-1 bg-[#1B4FA8]" />
          <div className="w-16 bg-[#F5C200]" />
          <div className="flex-1 bg-[#0D2F6E]" />
        </div>

        <div className="flex items-center justify-between px-6 pt-6 sm:px-10">
          <Link href="/" className="inline-flex items-center gap-2.5 lg:invisible">
            <Image src={LOGO_URL} alt="" width={40} height={40} className="h-10 w-10 rounded-full bg-white object-contain ring-2 ring-[#1B4FA8]/15" />
            <span className="text-sm font-black tracking-tight text-[#0D1A2E]">BAFOUSSAM</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-white hover:text-[#1B4FA8]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour au site
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-[420px]">
            <div className="rounded-3xl border border-slate-200/70 bg-white p-7 shadow-xl shadow-[#1B4FA8]/5 sm:p-9">
              <div className="mb-8">
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1B4FA8]/10 text-[#1B4FA8]">
                  <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                </span>
                <h1 className="text-2xl font-black tracking-tight text-[#0D1A2E]">Connexion</h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  Accédez à l’espace d’administration de la Communauté Urbaine de Bafoussam.
                </p>
              </div>

              <Suspense fallback={null}>
                <LoggedOutNotice />
              </Suspense>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div
                    className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
                    role="alert"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {error}
                  </div>
                )}

                <Field id="admin-email" label="Adresse email" icon={Mail}>
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                    className={`${INPUT_CLASS} pr-4`}
                    placeholder="admin@cubafoussam.cm"
                  />
                </Field>

                <div>
                  <Field id="admin-password" label="Mot de passe" icon={Lock}>
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={trackCapsLock}
                      onKeyUp={trackCapsLock}
                      onBlur={() => setCapsLock(false)}
                      required
                      autoComplete="current-password"
                      className={`${INPUT_CLASS} pr-12`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#1B4FA8]"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </Field>
                  {capsLock && (
                    <p className="mt-1.5 text-xs font-medium text-amber-700" role="status">
                      Verrouillage des majuscules activé
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B4FA8] py-3.5 text-[15px] font-bold text-white shadow-lg shadow-[#1B4FA8]/25 transition-all hover:bg-[#164394] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1B4FA8]/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {loading ? "Connexion en cours…" : "Se connecter"}
                </button>
              </form>
            </div>

            <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Accès réservé au personnel autorisé de la C.U.B.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
