"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ArrowUpRight, X } from "lucide-react"
import { isValidPhone, whatsappLink } from "@/lib/whatsapp-schema"
import { cn } from "@/lib/utils"

const WHATSAPP_GREEN = "#25D366"

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

type PanelProps = {
  phone: string
  questions: string[]
  onClose?: () => void
  className?: string
}

/** Links are rendered without href while the number is invalid (admin preview). */
export function WhatsAppPanel({ phone, questions, onClose, className }: PanelProps) {
  const valid = isValidPhone(phone)
  const linkProps = (text?: string) =>
    valid ? { href: whatsappLink(phone, text), target: "_blank", rel: "noopener noreferrer" } : {}

  return (
    <div
      className={cn(
        "flex w-[340px] max-w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5",
        className
      )}
      role="dialog"
      aria-label="Contacter la mairie sur WhatsApp"
    >
      <div className="flex shrink-0 items-center gap-3 px-4 py-3.5" style={{ backgroundColor: "#1B4FA8" }}>
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-[#F5C200]/70">
          <Image src="/images/logo-cub.png" alt="" width={34} height={34} className="size-8 object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight text-white">Communauté Urbaine de Bafoussam</p>
          <p className="flex items-center gap-1.5 text-xs text-white/75">
            <span className="size-2 rounded-full" style={{ backgroundColor: WHATSAPP_GREEN }} aria-hidden="true" />
            Réponse sur WhatsApp
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <div className="flex h-1 shrink-0" aria-hidden="true">
        <div className="flex-1" style={{ backgroundColor: "#F5C200" }} />
        <div className="w-1/5 bg-white" />
        <div className="flex-1" style={{ backgroundColor: "#0D2F6E" }} />
      </div>

      <div className="min-h-0 space-y-3 overflow-y-auto p-4" style={{ backgroundColor: "#F2F4F8" }}>
        <p className="rounded-xl rounded-tl-sm bg-white px-3.5 py-2.5 text-sm leading-relaxed text-[#374151] shadow-sm">
          Bonjour ! Choisissez une question, nous vous répondons sur WhatsApp.
        </p>

        <ul className="space-y-2">
          {questions.map((question, i) => (
            <li key={i}>
              <a
                {...linkProps(question)}
                className="group flex items-start gap-2 rounded-xl border border-[#1B4FA8]/15 bg-white px-3.5 py-2.5 text-left text-sm font-medium text-[#0D1A2E] transition-colors hover:border-[#25D366] hover:bg-[#25D366]/5"
              >
                <span className="flex-1">{question || "…"}</span>
                <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-[#1B4FA8]/50 transition-colors group-hover:text-[#25D366]" />
              </a>
            </li>
          ))}
        </ul>

        <a
          {...linkProps()}
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: WHATSAPP_GREEN }}
        >
          <WhatsAppIcon className="size-4" />
          Autre question
        </a>
      </div>
    </div>
  )
}

export default function WhatsAppWidget({ phone, questions }: { phone: string; questions: string[] }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    function onPointer(e: PointerEvent) {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointer)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointer)
    }
  }, [open])

  return (
    <div ref={root} className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <WhatsAppPanel
          phone={phone}
          questions={questions}
          onClose={() => setOpen(false)}
          className="max-h-[calc(100dvh-12rem)] max-w-[calc(100vw-2.5rem)] animate-fadeup"
        />
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Fermer WhatsApp" : "Contacter la mairie sur WhatsApp"}
        className="flex size-14 items-center justify-center rounded-full text-white shadow-lg shadow-black/20 ring-4 ring-white transition-transform hover:scale-105"
        style={{ backgroundColor: WHATSAPP_GREEN }}
      >
        {open ? <X className="size-6" /> : <WhatsAppIcon className="size-7" />}
      </button>
    </div>
  )
}
