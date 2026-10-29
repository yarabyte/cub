"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react"
import { CONTACT_SUBJECTS, contactSchema, type ContactValues } from "@/lib/contact-schema"

const MESSAGE_MAX = 5000

const inputClass =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#0D1A2E] placeholder:text-slate-400 outline-none transition focus:border-[#1B4FA8] focus:ring-4 focus:ring-[#1B4FA8]/10 aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-100"

function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string
  label: string
  optional?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold" style={{ color: "#0D1A2E" }}>
        {label}
        {optional ? (
          <span className="ml-1 font-normal text-slate-400">(facultatif)</span>
        ) : (
          <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export default function ContactForm() {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [website, setWebsite] = useState("")
  const [shownAt] = useState(() => Date.now())

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", subject: undefined, message: "" },
  })
  const { register, handleSubmit, formState, setError, reset, watch } = form
  const { errors, isSubmitting } = formState
  const messageLength = watch("message")?.length ?? 0

  async function onSubmit(values: ContactValues) {
    setServerError(null)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website, elapsedMs: Date.now() - shownAt }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.field && data.field in values) {
          setError(data.field as keyof ContactValues, { message: data.error })
        } else {
          setServerError(data.error ?? "L'envoi a échoué. Merci de réessayer.")
        }
        return
      }
      reset()
      setSent(true)
    } catch {
      setServerError("Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.")
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center py-10 px-6" role="status">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: "rgba(21,128,61,0.12)" }}>
          <CheckCircle2 className="w-8 h-8" style={{ color: "#15803D" }} />
        </div>
        <h3 className="text-xl font-black mb-2" style={{ color: "#0D1A2E" }}>
          Message envoyé
        </h3>
        <p className="text-sm max-w-md leading-relaxed" style={{ color: "#4B5563" }}>
          Merci, votre message a bien été transmis aux services de la Communauté Urbaine de Bafoussam.
          Une réponse vous sera adressée à l'adresse e-mail indiquée.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 text-sm font-bold underline-offset-4 hover:underline"
          style={{ color: "#1B4FA8" }}
        >
          Envoyer un autre message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field id="contact-name" label="Nom complet" error={errors.name?.message}>
          <input
            id="contact-name"
            autoComplete="name"
            className={inputClass}
            style={{ borderColor: "#D6E0F5" }}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            {...register("name")}
          />
        </Field>
        <Field id="contact-email" label="Adresse e-mail" error={errors.email?.message}>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            className={inputClass}
            style={{ borderColor: "#D6E0F5" }}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            {...register("email")}
          />
        </Field>
        <Field id="contact-phone" label="Téléphone" optional error={errors.phone?.message}>
          <input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+237 6XX XX XX XX"
            className={inputClass}
            style={{ borderColor: "#D6E0F5" }}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "contact-phone-error" : undefined}
            {...register("phone")}
          />
        </Field>
        <Field id="contact-subject" label="Objet" error={errors.subject?.message}>
          <select
            id="contact-subject"
            className={`${inputClass} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10`}
            style={{ borderColor: "#D6E0F5" }}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={errors.subject ? "contact-subject-error" : undefined}
            defaultValue=""
            {...register("subject")}
          >
            <option value="" disabled>
              Choisissez un objet
            </option>
            {CONTACT_SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="contact-message" label="Message" error={errors.message?.message}>
        <textarea
          id="contact-message"
          rows={7}
          maxLength={MESSAGE_MAX}
          className={`${inputClass} resize-y min-h-[160px]`}
          style={{ borderColor: "#D6E0F5" }}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          {...register("message")}
        />
        <p className="self-end text-[11px] tabular-nums text-slate-400">
          {messageLength.toLocaleString("fr-FR")} / {MESSAGE_MAX.toLocaleString("fr-FR")}
        </p>
      </Field>

      <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Ne pas remplir ce champ</label>
        <input
          id="contact-website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {serverError && (
        <div className="flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "#FECACA", backgroundColor: "#FEF2F2", color: "#B91C1C" }} role="alert">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {serverError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <p className="text-xs leading-relaxed max-w-sm" style={{ color: "#64748b" }}>
          Vos données servent uniquement à traiter votre demande et ne sont pas transmises à des tiers.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 font-bold px-6 py-3 rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: "#1B4FA8", color: "white" }}
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {isSubmitting ? "Envoi en cours…" : "Envoyer le message"}
        </button>
      </div>
    </form>
  )
}
