import type { ResultSetHeader, RowDataPacket } from "mysql2"
import { query } from "@/lib/db"
import type { ContactValues } from "@/lib/contact-schema"

export type MessageStatus = "new" | "read" | "archived"

export type ContactMessage = {
  id: number
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: MessageStatus
  email_sent_at: Date | null
  email_error: string | null
  created_at: Date
}

type MessageRow = ContactMessage & RowDataPacket

export async function insertContactMessage(values: ContactValues, ip: string | null): Promise<number> {
  const res = await query<ResultSetHeader>(
    "INSERT INTO contact_messages (name, email, phone, subject, message, ip) VALUES (?, ?, ?, ?, ?, ?)",
    [values.name, values.email, values.phone || null, values.subject, values.message, ip]
  )
  return res.insertId
}

export async function recordEmailResult(id: number, error: string | null): Promise<void> {
  if (error) {
    await query("UPDATE contact_messages SET email_error = ? WHERE id = ?", [error.slice(0, 500), id])
  } else {
    await query("UPDATE contact_messages SET email_sent_at = NOW(), email_error = NULL WHERE id = ?", [id])
  }
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  return query<MessageRow[]>(
    `SELECT id, name, email, phone, subject, message, status, email_sent_at, email_error, created_at
     FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT 500`
  )
}

export async function countNewMessages(): Promise<number> {
  const rows = await query<(RowDataPacket & { n: number })[]>(
    "SELECT COUNT(*) AS n FROM contact_messages WHERE status = 'new'"
  )
  return Number(rows[0]?.n ?? 0)
}

export async function setMessageStatus(id: number, status: MessageStatus): Promise<boolean> {
  const res = await query<ResultSetHeader>("UPDATE contact_messages SET status = ? WHERE id = ?", [status, id])
  return res.affectedRows > 0
}

export async function deleteContactMessage(id: number): Promise<boolean> {
  const res = await query<ResultSetHeader>("DELETE FROM contact_messages WHERE id = ?", [id])
  return res.affectedRows > 0
}
