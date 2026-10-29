export type SyncCategory = { id: number; slug: string; name: string; count: number }

export type SyncPost = { wpId: number; title: string; date: string; exists: boolean }

export type ImportOneResult = {
  status: "imported" | "skipped" | "error"
  wpId: number
  title: string | null
  imageUrl: string | null
  warning: string | null
  reason: string | null
  ms: number
}
