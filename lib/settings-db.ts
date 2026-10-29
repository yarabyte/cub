import type { RowDataPacket } from "mysql2"
import { getDb, query } from "@/lib/db"
import {
  DEFAULT_WHATSAPP_QUESTIONS,
  normalizePhone,
  whatsappSchema,
  type WhatsappSettings,
} from "@/lib/whatsapp-schema"
import { DEFAULT_MAYOR_MESSAGE, mayorMessageSchema, type MayorMessage } from "@/lib/mayor-message-schema"

const WHATSAPP_KEY = "whatsapp"
const MAYOR_MESSAGE_KEY = "mayor_message"

export const DEFAULT_WHATSAPP_SETTINGS: WhatsappSettings = {
  enabled: false,
  phone: "",
  questions: DEFAULT_WHATSAPP_QUESTIONS,
}

async function getSetting(key: string): Promise<unknown> {
  const rows = await query<(RowDataPacket & { value: unknown })[]>(
    "SELECT value FROM site_settings WHERE setting_key = ? LIMIT 1",
    [key]
  )
  if (rows.length === 0) return null
  const { value } = rows[0]
  return typeof value === "string" ? JSON.parse(value) : value
}

async function setSetting(key: string, value: unknown): Promise<void> {
  await query(
    "INSERT INTO site_settings (setting_key, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)",
    [key, JSON.stringify(value)]
  )
}

export async function getWhatsappSettings(): Promise<WhatsappSettings> {
  if (!getDb()) return DEFAULT_WHATSAPP_SETTINGS
  const parsed = whatsappSchema.safeParse(await getSetting(WHATSAPP_KEY))
  return parsed.success ? parsed.data : DEFAULT_WHATSAPP_SETTINGS
}

export async function saveWhatsappSettings(values: WhatsappSettings): Promise<WhatsappSettings> {
  const settings = { ...values, phone: values.phone ? normalizePhone(values.phone) : "" }
  await setSetting(WHATSAPP_KEY, settings)
  return settings
}

/** Falls back to the original message when the database is unavailable or nothing was saved yet. */
export async function getMayorMessage(): Promise<MayorMessage> {
  if (!getDb()) return DEFAULT_MAYOR_MESSAGE
  try {
    const parsed = mayorMessageSchema.safeParse(await getSetting(MAYOR_MESSAGE_KEY))
    return parsed.success ? parsed.data : DEFAULT_MAYOR_MESSAGE
  } catch (e) {
    console.error("Mot du maire indisponible :", e)
    return DEFAULT_MAYOR_MESSAGE
  }
}

export async function saveMayorMessage(values: MayorMessage): Promise<MayorMessage> {
  await setSetting(MAYOR_MESSAGE_KEY, values)
  return values
}
