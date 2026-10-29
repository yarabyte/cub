"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { KeyRound, Loader2, Save, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ROLE_DESCRIPTIONS, ROLE_LABELS, type SessionUser } from "@/lib/roles"
import { accountNameSchema, accountPasswordSchema, PASSWORD_MIN } from "@/lib/user-schema"

type PasswordValues = { current: string; password: string; confirm: string }
type PasswordErrors = Partial<Record<keyof PasswordValues, string>>

const EMPTY_PASSWORD: PasswordValues = { current: "", password: "", confirm: "" }

function Panel({ icon: Icon, title, children }: { icon: typeof UserRound; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#1B4FA8]/12 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#0D1A2E]">
        <Icon className="size-4 text-[#1B4FA8]" /> {title}
      </h2>
      {children}
    </section>
  )
}

export default function AccountForms({ user }: { user: SessionUser }) {
  const router = useRouter()
  const [name, setName] = useState(user.name ?? "")
  const [nameError, setNameError] = useState<string | null>(null)
  const [savingName, setSavingName] = useState(false)
  const [pwd, setPwd] = useState<PasswordValues>(EMPTY_PASSWORD)
  const [pwdErrors, setPwdErrors] = useState<PasswordErrors>({})
  const [savingPwd, setSavingPwd] = useState(false)

  async function saveName(e: React.FormEvent) {
    e.preventDefault()
    const parsed = accountNameSchema.safeParse({ name })
    if (!parsed.success) {
      setNameError(parsed.error.issues[0]?.message ?? "Nom invalide")
      return
    }
    setSavingName(true)
    try {
      const res = await fetch("/api/admin/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setNameError(data.error ?? "Enregistrement impossible")
        toast.error(data.error ?? "Enregistrement impossible")
        return
      }
      setNameError(null)
      toast.success("Nom enregistré")
      router.refresh()
    } catch {
      toast.error("Enregistrement impossible")
    } finally {
      setSavingName(false)
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    const parsed = accountPasswordSchema.safeParse(pwd)
    if (!parsed.success) {
      const next: PasswordErrors = {}
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof PasswordValues] ??= issue.message
      setPwdErrors(next)
      return
    }
    setSavingPwd(true)
    try {
      const res = await fetch("/api/admin/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pwd),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.field) setPwdErrors({ [data.field]: data.error })
        toast.error(data.error ?? "Modification impossible")
        return
      }
      setPwdErrors({})
      setPwd(EMPTY_PASSWORD)
      toast.success("Mot de passe modifié", { description: "Utilisez-le à votre prochaine connexion." })
    } catch {
      toast.error("Modification impossible")
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel icon={UserRound} title="Profil">
        <form onSubmit={saveName} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-name">Nom affiché</Label>
            <Input
              id="account-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Prénom Nom"
              aria-invalid={Boolean(nameError)}
            />
            {nameError && <p className="text-sm text-red-600">{nameError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-email">E-mail de connexion</Label>
            <Input id="account-email" value={user.email} readOnly disabled />
          </div>
          <div className="rounded-lg border border-[#1B4FA8]/12 bg-[#1B4FA8]/[0.03] px-3 py-2.5">
            <p className="text-sm font-medium text-[#0D1A2E]">Rôle : {ROLE_LABELS[user.role]}</p>
            <p className="mt-0.5 text-xs text-slate-500">{ROLE_DESCRIPTIONS[user.role]}</p>
          </div>
          <p className="text-xs text-slate-400">L’e-mail et le rôle ne peuvent être modifiés que par un administrateur.</p>
          <Button
            type="submit"
            disabled={savingName}
            className="bg-[#1B4FA8] font-semibold text-white hover:bg-[#1B4FA8]/90"
          >
            {savingName ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Enregistrer
          </Button>
        </form>
      </Panel>

      <Panel icon={KeyRound} title="Mot de passe">
        <form onSubmit={savePassword} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-current">Mot de passe actuel</Label>
            <Input
              id="account-current"
              type="password"
              value={pwd.current}
              onChange={(e) => setPwd((v) => ({ ...v, current: e.target.value }))}
              aria-invalid={Boolean(pwdErrors.current)}
              autoComplete="current-password"
            />
            {pwdErrors.current && <p className="text-sm text-red-600">{pwdErrors.current}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-password">Nouveau mot de passe</Label>
            <Input
              id="account-password"
              type="password"
              value={pwd.password}
              onChange={(e) => setPwd((v) => ({ ...v, password: e.target.value }))}
              aria-invalid={Boolean(pwdErrors.password)}
              autoComplete="new-password"
            />
            <p className="text-xs text-slate-500">{PASSWORD_MIN} caractères minimum.</p>
            {pwdErrors.password && <p className="text-sm text-red-600">{pwdErrors.password}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-confirm">Confirmer le nouveau mot de passe</Label>
            <Input
              id="account-confirm"
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd((v) => ({ ...v, confirm: e.target.value }))}
              aria-invalid={Boolean(pwdErrors.confirm)}
              autoComplete="new-password"
            />
            {pwdErrors.confirm && <p className="text-sm text-red-600">{pwdErrors.confirm}</p>}
          </div>
          <Button
            type="submit"
            disabled={savingPwd}
            className="bg-[#1B4FA8] font-semibold text-white hover:bg-[#1B4FA8]/90"
          >
            {savingPwd ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
            Changer le mot de passe
          </Button>
        </form>
      </Panel>
    </div>
  )
}
