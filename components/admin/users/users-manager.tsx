"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { KeyRound, Loader2, Pencil, Plus, ShieldCheck, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ROLE_DESCRIPTIONS, ROLE_LABELS, ROLES, type ClientUser, type Role } from "@/lib/roles"
import { passwordResetSchema, PASSWORD_MIN, userCreateSchema, userUpdateSchema } from "@/lib/user-schema"

type FormValues = { name: string; email: string; role: Role; active: boolean; password: string; confirm: string }
type Errors = Partial<Record<keyof FormValues, string>>
type EditorState = { user: ClientUser | null; values: FormValues } | null

const EMPTY: FormValues = { name: "", email: "", role: "editor", active: true, password: "", confirm: "" }

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Douala",
})

function firstErrors(issues: { path: (string | number)[]; message: string }[]): Errors {
  const out: Errors = {}
  for (const issue of issues) out[issue.path[0] as keyof FormValues] ??= issue.message
  return out
}

function RoleBadge({ role }: { role: Role }) {
  return role === "admin" ? (
    <Badge className="border-transparent bg-[#F5C200]/25 text-[#7a5c00]">
      <ShieldCheck className="size-3" /> {ROLE_LABELS.admin}
    </Badge>
  ) : (
    <Badge className="border-transparent bg-[#1B4FA8]/10 text-[#1B4FA8]">{ROLE_LABELS.editor}</Badge>
  )
}

export default function UsersManager({ users, currentUserId }: { users: ClientUser[]; currentUserId: number }) {
  const router = useRouter()
  const [editor, setEditor] = useState<EditorState>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [resetFor, setResetFor] = useState<ClientUser | null>(null)
  const [resetValues, setResetValues] = useState({ password: "", confirm: "" })
  const [resetErrors, setResetErrors] = useState<Errors>({})
  const [toDelete, setToDelete] = useState<ClientUser | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const activeAdmins = users.filter((u) => u.role === "admin" && u.active).length
  const isLastAdmin = (u: ClientUser) => u.role === "admin" && u.active && activeAdmins <= 1
  const displayName = (u: ClientUser) => u.name || u.email

  /** Why the role and status of this account cannot be changed, if they cannot. */
  function lockReason(u: ClientUser | null): string | null {
    if (!u) return null
    if (u.id === currentUserId) return "Vous ne pouvez pas modifier votre propre rôle ni désactiver votre compte."
    if (isLastAdmin(u)) return "C’est le dernier administrateur actif : son rôle et son statut ne peuvent pas changer."
    return null
  }

  function openCreate() {
    setErrors({})
    setEditor({ user: null, values: EMPTY })
  }

  function openEdit(u: ClientUser) {
    setErrors({})
    setEditor({
      user: u,
      values: { name: u.name ?? "", email: u.email, role: u.role, active: u.active, password: "", confirm: "" },
    })
  }

  function update(patch: Partial<FormValues>) {
    setEditor((s) => (s ? { ...s, values: { ...s.values, ...patch } } : s))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!editor) return
    const { user, values } = editor
    const parsed = user ? userUpdateSchema.safeParse(values) : userCreateSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(firstErrors(parsed.error.issues))
      return
    }
    setSaving(true)
    try {
      const res = await fetch(user ? `/api/admin/users/${user.id}` : "/api/admin/users", {
        method: user ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user ? userUpdateSchema.parse(values) : values),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.field) setErrors({ [data.field]: data.error })
        toast.error(data.error ?? "Enregistrement impossible")
        return
      }
      toast.success(user ? "Utilisateur modifié" : "Utilisateur créé", {
        description: user ? values.email : `${values.email} peut se connecter avec le mot de passe défini.`,
      })
      setEditor(null)
      router.refresh()
    } catch {
      toast.error("Enregistrement impossible")
    } finally {
      setSaving(false)
    }
  }

  function openReset(u: ClientUser) {
    setResetErrors({})
    setResetValues({ password: "", confirm: "" })
    setResetFor(u)
  }

  async function saveReset(e: React.FormEvent) {
    e.preventDefault()
    if (!resetFor) return
    const parsed = passwordResetSchema.safeParse(resetValues)
    if (!parsed.success) {
      setResetErrors(firstErrors(parsed.error.issues))
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${resetFor.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resetValues),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.field) setResetErrors({ [data.field]: data.error })
        toast.error(data.error ?? "Modification impossible")
        return
      }
      toast.success("Mot de passe modifié", { description: `Transmettez-le à ${displayName(resetFor)}.` })
      setResetFor(null)
    } catch {
      toast.error("Modification impossible")
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    const u = toDelete
    if (!u) return
    setToDelete(null)
    setDeletingId(u.id)
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? "Suppression impossible")
      toast.success("Utilisateur supprimé", { description: u.email })
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Suppression impossible")
    } finally {
      setDeletingId(null)
    }
  }

  const locked = lockReason(editor?.user ?? null)

  return (
    <section className="rounded-2xl border border-[#1B4FA8]/12 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[#1B4FA8]/8 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-[#0D1A2E]">Comptes d’administration</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Les éditeurs ont accès à tout sauf la synchronisation et la gestion des utilisateurs.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-[#1B4FA8] text-white hover:bg-[#1B4FA8]/90">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Nouvel utilisateur</span>
        </Button>
      </div>

      {users.length === 0 ? (
        <Empty className="py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-[#1B4FA8]/10 text-[#1B4FA8]">
              <Users />
            </EmptyMedia>
            <EmptyTitle className="text-[#0D1A2E]">Aucun utilisateur</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Utilisateur</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead className="hidden sm:table-cell">Statut</TableHead>
              <TableHead className="hidden md:table-cell">Dernière connexion</TableHead>
              <TableHead className="w-36 pr-5 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const self = u.id === currentUserId
              const cannotDelete = self || isLastAdmin(u)
              return (
                <TableRow key={u.id} className={u.active ? undefined : "opacity-60"}>
                  <TableCell className="pl-5">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate font-medium text-[#0D1A2E]">
                        <span className="truncate">{u.name || "Sans nom"}</span>
                        {self && (
                          <span className="rounded bg-slate-100 px-1.5 py-px text-[10px] font-semibold text-slate-600">
                            Vous
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-slate-500">{u.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={u.role} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {u.active ? (
                      <Badge className="border-transparent bg-emerald-100 text-emerald-700">Actif</Badge>
                    ) : (
                      <Badge className="border-transparent bg-slate-200 text-slate-600">Désactivé</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-sm text-slate-500 md:table-cell">
                    {u.lastLoginAt ? dateFormat.format(new Date(u.lastLoginAt)) : "Jamais"}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(u)} aria-label={`Modifier ${displayName(u)}`}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openReset(u)}
                      aria-label={`Réinitialiser le mot de passe de ${displayName(u)}`}
                    >
                      <KeyRound className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setToDelete(u)}
                      disabled={cannotDelete || deletingId === u.id}
                      title={self ? "Vous ne pouvez pas supprimer votre propre compte" : cannotDelete ? "Dernier administrateur actif" : undefined}
                      aria-label={`Supprimer ${displayName(u)}`}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      {deletingId === u.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      <Dialog open={editor !== null} onOpenChange={(open) => !open && !saving && setEditor(null)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={save} noValidate>
            <DialogHeader>
              <DialogTitle>{editor?.user ? "Modifier l’utilisateur" : "Nouvel utilisateur"}</DialogTitle>
              <DialogDescription>
                {editor?.user
                  ? "Le mot de passe se change avec le bouton « Réinitialiser le mot de passe »."
                  : "Transmettez ensuite l’e-mail et le mot de passe à la personne. Elle pourra le changer dans « Mon compte »."}
              </DialogDescription>
            </DialogHeader>
            {editor && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="user-name">Nom</Label>
                  <Input
                    id="user-name"
                    value={editor.values.name}
                    onChange={(e) => update({ name: e.target.value })}
                    placeholder="Prénom Nom"
                    aria-invalid={Boolean(errors.name)}
                    autoFocus
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-email">E-mail</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={editor.values.email}
                    onChange={(e) => update({ email: e.target.value })}
                    placeholder="prenom.nom@cubafoussam.cm"
                    aria-invalid={Boolean(errors.email)}
                    autoComplete="off"
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-role">Rôle</Label>
                  <Select
                    value={editor.values.role}
                    onValueChange={(v) => update({ role: v as Role })}
                    disabled={Boolean(locked)}
                  >
                    <SelectTrigger id="user-role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">{ROLE_DESCRIPTIONS[editor.values.role]}</p>
                  {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
                </div>
                {editor.user ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
                      <div>
                        <Label htmlFor="user-active">Compte actif</Label>
                        <p className="text-xs text-slate-500">Un compte désactivé ne peut plus se connecter.</p>
                      </div>
                      <Switch
                        id="user-active"
                        checked={editor.values.active}
                        onCheckedChange={(v) => update({ active: v })}
                        disabled={Boolean(locked)}
                      />
                    </div>
                    {errors.active && <p className="text-sm text-red-600">{errors.active}</p>}
                    {locked && <p className="text-xs text-amber-700">{locked}</p>}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="user-password">Mot de passe</Label>
                      <Input
                        id="user-password"
                        type="password"
                        value={editor.values.password}
                        onChange={(e) => update({ password: e.target.value })}
                        aria-invalid={Boolean(errors.password)}
                        autoComplete="new-password"
                      />
                      <p className="text-xs text-slate-500">{PASSWORD_MIN} caractères minimum.</p>
                      {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-confirm">Confirmer le mot de passe</Label>
                      <Input
                        id="user-confirm"
                        type="password"
                        value={editor.values.confirm}
                        onChange={(e) => update({ confirm: e.target.value })}
                        aria-invalid={Boolean(errors.confirm)}
                        autoComplete="new-password"
                      />
                      {errors.confirm && <p className="text-sm text-red-600">{errors.confirm}</p>}
                    </div>
                  </>
                )}
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditor(null)} disabled={saving}>
                Annuler
              </Button>
              <Button type="submit" disabled={saving} className="bg-[#1B4FA8] text-white hover:bg-[#1B4FA8]/90">
                {saving && <Loader2 className="size-4 animate-spin" />}
                {editor?.user ? "Enregistrer" : "Créer le compte"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={resetFor !== null} onOpenChange={(open) => !open && !saving && setResetFor(null)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={saveReset} noValidate>
            <DialogHeader>
              <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
              <DialogDescription>
                Nouveau mot de passe pour {resetFor ? displayName(resetFor) : ""}. Transmettez-le à la personne.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reset-password">Nouveau mot de passe</Label>
                <Input
                  id="reset-password"
                  type="password"
                  value={resetValues.password}
                  onChange={(e) => setResetValues((v) => ({ ...v, password: e.target.value }))}
                  aria-invalid={Boolean(resetErrors.password)}
                  autoComplete="new-password"
                  autoFocus
                />
                <p className="text-xs text-slate-500">{PASSWORD_MIN} caractères minimum.</p>
                {resetErrors.password && <p className="text-sm text-red-600">{resetErrors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-confirm">Confirmer</Label>
                <Input
                  id="reset-confirm"
                  type="password"
                  value={resetValues.confirm}
                  onChange={(e) => setResetValues((v) => ({ ...v, confirm: e.target.value }))}
                  aria-invalid={Boolean(resetErrors.confirm)}
                  autoComplete="new-password"
                />
                {resetErrors.confirm && <p className="text-sm text-red-600">{resetErrors.confirm}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResetFor(null)} disabled={saving}>
                Annuler
              </Button>
              <Button type="submit" disabled={saving} className="bg-[#1B4FA8] text-white hover:bg-[#1B4FA8]/90">
                {saving && <Loader2 className="size-4 animate-spin" />}
                Modifier le mot de passe
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le compte de {toDelete ? displayName(toDelete) : ""} ?</AlertDialogTitle>
            <AlertDialogDescription>
              La personne ne pourra plus se connecter. Les articles qu’elle a rédigés ne sont pas supprimés. Pour
              suspendre l’accès sans supprimer le compte, désactivez-le plutôt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
