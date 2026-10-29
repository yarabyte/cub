import nodemailer, { type Transporter } from "nodemailer"
import type { ContactValues } from "@/lib/contact-schema"

const DEFAULT_RECIPIENT = "contact@cubafoussam.cm"

function env(name: string): string {
  return process.env[name]?.trim() ?? ""
}

const globalForMail = globalThis as unknown as { mailTransport?: Transporter }

function getTransport(): Transporter | null {
  if (globalForMail.mailTransport) return globalForMail.mailTransport
  const host = env("SMTP_HOST")
  if (!host) return null
  const port = parseInt(env("SMTP_PORT") || "465", 10)
  const user = env("SMTP_USER")
  globalForMail.mailTransport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass: env("SMTP_PASSWORD") } : undefined,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
  })
  return globalForMail.mailTransport
}

export function isMailConfigured(): boolean {
  return env("SMTP_HOST") !== ""
}

export function contactRecipient(): string {
  return env("CONTACT_EMAIL_TO") || DEFAULT_RECIPIENT
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

/** Header values must not carry line breaks (header injection). */
function oneLine(s: string): string {
  return s.replace(/[\r\n]+/g, " ").trim()
}

export async function sendContactEmail(values: ContactValues, messageId: number): Promise<void> {
  const transport = getTransport()
  if (!transport) throw new Error("SMTP non configuré (SMTP_HOST manquant)")

  const name = oneLine(values.name)
  const rows: [string, string][] = [
    ["Nom", name],
    ["E-mail", values.email],
    ["Téléphone", values.phone || "—"],
    ["Objet", values.subject],
  ]

  const text = [
    `Nouveau message reçu depuis le formulaire de contact du portail (n° ${messageId}).`,
    "",
    ...rows.map(([k, v]) => `${k} : ${v}`),
    "",
    values.message,
  ].join("\n")

  const html = `
    <div style="font-family:Arial,sans-serif;color:#0D1A2E;max-width:640px">
      <h2 style="color:#1B4FA8;margin:0 0 12px">Nouveau message du portail</h2>
      <p style="color:#475569;margin:0 0 16px">Formulaire de contact — message n° ${messageId}</p>
      <table style="border-collapse:collapse;width:100%;margin-bottom:16px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:6px 12px 6px 0;color:#64748b;white-space:nowrap">${k}</td><td style="padding:6px 0;font-weight:600">${escapeHtml(v)}</td></tr>`
          )
          .join("")}
      </table>
      <div style="white-space:pre-wrap;line-height:1.6;border-left:3px solid #F5C200;padding:8px 14px;background:#F8FAFF">${escapeHtml(values.message)}</div>
      <p style="color:#94a3b8;font-size:12px;margin-top:20px">Répondez directement à cet e-mail pour écrire à ${escapeHtml(name)}.</p>
    </div>`

  await transport.sendMail({
    from: env("SMTP_FROM") || env("SMTP_USER") || contactRecipient(),
    to: contactRecipient(),
    replyTo: { name, address: values.email },
    subject: oneLine(`[Contact portail] ${values.subject} — ${name}`),
    text,
    html,
  })
}
