import { z } from "zod"
import { ROLES } from "./roles"

export const PASSWORD_MIN = 8

const name = z.string().trim().max(120, "120 caractères maximum")
const email = z
  .string()
  .trim()
  .min(1, "L'e-mail est obligatoire")
  .max(255, "255 caractères maximum")
  .email("Adresse e-mail invalide")
  .transform((v) => v.toLowerCase())
const role = z.enum(ROLES, { errorMap: () => ({ message: "Rôle invalide" }) })
/** bcrypt ignores everything past 72 bytes. */
export const PASSWORD_MAX_BYTES = 72

const password = z
  .string()
  .min(PASSWORD_MIN, `${PASSWORD_MIN} caractères minimum`)
  .max(PASSWORD_MAX_BYTES, `${PASSWORD_MAX_BYTES} caractères maximum`)
  .refine((v) => new TextEncoder().encode(v).length <= PASSWORD_MAX_BYTES, "Mot de passe trop long")

function samePassword<T extends { password: string; confirm: string }>(v: T, ctx: z.RefinementCtx) {
  if (v.password !== v.confirm) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["confirm"], message: "Les mots de passe ne correspondent pas" })
  }
}

export const userCreateSchema = z
  .object({ name, email, role, password, confirm: z.string() })
  .superRefine(samePassword)

export type UserCreateValues = z.input<typeof userCreateSchema>

export const userUpdateSchema = z.object({ name, email, role, active: z.boolean() })

export type UserUpdateValues = z.input<typeof userUpdateSchema>

export const passwordResetSchema = z.object({ password, confirm: z.string() }).superRefine(samePassword)

export type PasswordResetValues = z.input<typeof passwordResetSchema>

export const accountNameSchema = z.object({ name })

export type AccountNameValues = z.input<typeof accountNameSchema>

export const accountPasswordSchema = z
  .object({ current: z.string().min(1, "Saisissez votre mot de passe actuel"), password, confirm: z.string() })
  .superRefine(samePassword)

export type AccountPasswordValues = z.input<typeof accountPasswordSchema>
