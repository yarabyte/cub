export const ROLES = ["admin", "editor"] as const

export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrateur",
  editor: "Éditeur",
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: "Accès complet, y compris la synchronisation et les utilisateurs.",
  editor: "Actualités, catégories, messages et WhatsApp. Pas de synchronisation ni de gestion des utilisateurs.",
}

export function isAdmin(role: Role | null | undefined): boolean {
  return role === "admin"
}

/** Current user as exposed to admin client components. */
export type SessionUser = { id: number; email: string; name: string | null; role: Role }

/** An account as listed on the users page (dates as ISO strings). */
export type ClientUser = SessionUser & { active: boolean; lastLoginAt: string | null; createdAt: string }
