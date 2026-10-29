"use client"

import { useEffect, useState } from "react"
import { Check, Facebook, Link2, Linkedin, Printer, Share2 } from "lucide-react"

type PrintableContent = { date?: string; author?: string; paragraphs: string[] }

type ShareButtonsProps = {
  /** Absolute canonical URL, computed on the server so it never points to localhost or a preview host. */
  url: string
  title: string
  print?: PrintableContent
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43m8.03-17.46A11.27 11.27 0 0 0 12.05.72C5.79.72.7 5.8.7 12.06c0 2 .52 3.95 1.52 5.67L.6 23.6l6.01-1.58a11.33 11.33 0 0 0 5.43 1.38h.01c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.32-8.02" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z" />
    </svg>
  )
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

function printContent(title: string, { date, author, paragraphs }: PrintableContent) {
  const meta = [date, author].filter(Boolean).join(" — ")
  const body = [
    `<h1 style="font-family:Georgia,serif;font-size:1.5rem;color:#0D1A2E;margin-bottom:0.5rem">${escapeHtml(title)}</h1>`,
    meta && `<p style="font-size:0.875rem;color:#64748b;margin-bottom:1.5rem">${escapeHtml(meta)}</p>`,
    ...paragraphs.map((p) => `<p style="font-family:Georgia,serif;line-height:1.6;color:#374151;margin-bottom:1rem">${escapeHtml(p)}</p>`),
  ]
    .filter(Boolean)
    .join("")
  const w = window.open("", "_blank")
  if (!w) return
  w.document.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{max-width:65ch;margin:2rem auto;padding:0 1rem;font-size:1rem}</style></head><body>${body}</body></html>`
  )
  w.document.close()
  w.focus()
  setTimeout(() => {
    w.print()
    w.close()
  }, 250)
}

const BUTTON = "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"

export default function ShareButtons({ url, title, print }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function")
  }, [])

  const u = encodeURIComponent(url)
  const networks = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
      icon: WhatsAppIcon,
      style: { backgroundColor: "rgba(37,211,102,0.12)", color: "#128C4A" },
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      icon: Facebook,
      style: { backgroundColor: "rgba(24,119,242,0.10)", color: "#1877F2" },
    },
    {
      label: "X",
      href: `https://x.com/intent/post?url=${u}&text=${encodeURIComponent(title)}`,
      icon: XIcon,
      style: { backgroundColor: "rgba(15,20,25,0.08)", color: "#0F1419" },
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      icon: Linkedin,
      style: { backgroundColor: "rgba(10,102,194,0.10)", color: "#0A66C2" },
    },
  ]

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt("Copiez ce lien :", url)
    }
  }

  const nativeShare = () => {
    navigator.share({ title, url }).catch(() => {})
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {networks.map(({ label, href, icon: Icon, style }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Partager sur ${label}`}
          className={BUTTON}
          style={style}
        >
          <Icon className="w-3.5 h-3.5" /> {label}
        </a>
      ))}
      <button type="button" onClick={copyLink} aria-label="Copier le lien" className={BUTTON} style={{ backgroundColor: "rgba(27,79,168,0.08)", color: "#1B4FA8" }}>
        {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />} {copied ? "Copié !" : "Copier le lien"}
      </button>
      {canNativeShare && (
        <button type="button" onClick={nativeShare} aria-label="Partager via le téléphone" className={`${BUTTON} sm:hidden`} style={{ backgroundColor: "#1B4FA8", color: "white" }}>
          <Share2 className="w-3.5 h-3.5" /> Partager
        </button>
      )}
      {print && (
        <button
          type="button"
          onClick={() => printContent(title, print)}
          aria-label="Imprimer"
          className={`${BUTTON} hidden sm:flex`}
          style={{ backgroundColor: "rgba(100,116,139,0.08)", color: "#475569" }}
        >
          <Printer className="w-3.5 h-3.5" /> Imprimer
        </button>
      )}
    </div>
  )
}
