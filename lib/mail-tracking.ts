import {
  Building2,
  CheckCircle2,
  Crown,
  FileSignature,
  Inbox,
  Loader,
  Send,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react"

/** Public tracking data of an incoming mail, as returned by Flowmanager and relayed by `/api/suivi`. */
export type MailTracking = {
  reference: string
  subject: string | null
  mailDate: string | null
  arrivalDate: string | null
  step: { id: string; label: string }
  service: string | null
  dueDate: string | null
  overdue: boolean
  timeline: { step: string; label: string; date: string }[]
}

export type TrackingError = "invalid" | "notFound" | "tooManyRequests" | "unavailable"

export type StepTone = "progress" | "attention" | "done"

export const STEP_META: Record<string, { icon: LucideIcon; tone: StepTone }> = {
  recu: { icon: Inbox, tone: "progress" },
  chez_maire: { icon: Crown, tone: "progress" },
  chez_sg: { icon: UserRound, tone: "progress" },
  au_service: { icon: Building2, tone: "progress" },
  en_visa: { icon: ShieldCheck, tone: "attention" },
  en_signature: { icon: FileSignature, tone: "attention" },
  traite: { icon: CheckCircle2, tone: "done" },
  reponse_preparee: { icon: CheckCircle2, tone: "done" },
  reponse_envoyee: { icon: Send, tone: "done" },
  en_traitement: { icon: Loader, tone: "progress" },
}

export function stepMeta(id: string) {
  return STEP_META[id] ?? STEP_META.en_traitement
}

export const TONE_COLORS: Record<StepTone, { fg: string; bg: string; border: string }> = {
  progress: { fg: "#1B4FA8", bg: "rgba(27,79,168,0.08)", border: "rgba(27,79,168,0.25)" },
  attention: { fg: "#B45309", bg: "rgba(245,194,0,0.14)", border: "rgba(217,119,6,0.3)" },
  done: { fg: "#15803D", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.35)" },
}

const TIME_ZONE = "Africa/Douala"
const dayFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: TIME_ZONE })
const dateTimeFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: TIME_ZONE })

/** `AAAA-MM-JJ` read at noon in Douala (UTC+1), so the day never shifts. */
export function formatDay(value: string): string {
  const d = new Date(`${value}T12:00:00+01:00`)
  return Number.isNaN(d.getTime()) ? value : dayFormat.format(d)
}

export function formatDateTime(value: string): string {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : dateTimeFormat.format(d)
}

/** `k7mp q3xa` → `K7MPQ3XA`. */
export function normalizeCode(value: string): string {
  return value.replace(/[\s-]+/g, "").toUpperCase()
}

/** `K7MPQ3XA` → `K7MP-Q3XA`, as printed on the receipt. */
export function formatCode(value: string): string {
  const raw = normalizeCode(value).replace(/[^A-Z0-9]/g, "").slice(0, 8)
  return raw.length > 4 ? `${raw.slice(0, 4)}-${raw.slice(4)}` : raw
}

export function normalizeReference(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase()
}

export const CODE_PATTERN = /^[A-Z0-9]{8}$/
export const REFERENCE_PATTERN = /^[A-Z0-9][A-Z0-9/_-]{2,39}$/

export function trackingErrorMessage(error: TrackingError | null, retryAfter?: number | null): string {
  switch (error) {
    case "notFound":
      return "Numéro de dossier ou code de suivi incorrect."
    case "tooManyRequests": {
      const minutes = retryAfter ? Math.max(1, Math.ceil(retryAfter / 60)) : null
      return minutes
        ? `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`
        : "Trop de tentatives. Réessayez plus tard."
    }
    case "invalid":
      return "Vérifiez le numéro de dossier (ex. ARR-2026-00042) et le code de suivi à 8 caractères (ex. K7MP-Q3XA)."
    default:
      return "Service de suivi momentanément indisponible. Merci de réessayer plus tard."
  }
}
