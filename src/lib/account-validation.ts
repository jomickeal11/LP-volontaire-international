import { z } from "zod"

export const accountDisplayNameSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères.").max(80, "Le nom ne peut dépasser 80 caractères."),
})

export const accountEmailChangeSchema = z.object({
  email: z.string().trim().max(254, "Adresse e-mail trop longue.").email("Adresse e-mail invalide.").transform((value) => value.toLowerCase()),
  lang: z.enum(["FR", "EN", "DE"]).default("FR"),
})

export const accountPasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe actuel est obligatoire.").max(1024),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères.")
    .refine((value) => new TextEncoder().encode(value).length <= 72, "Le nouveau mot de passe ne peut dépasser 72 octets."),
  confirmPassword: z.string().min(1, "La confirmation est obligatoire."),
}).refine((value) => value.newPassword === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "La confirmation ne correspond pas au nouveau mot de passe.",
})

const secureNewPasswordSchema = z.string()
  .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères.")
  .refine((value) => new TextEncoder().encode(value).length <= 72, "Le nouveau mot de passe ne peut dépasser 72 octets.")

export const passwordResetRequestSchema = z.object({
  email: z.string().trim().max(254).email().transform((value) => value.toLowerCase()),
})

export const passwordResetSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  newPassword: secureNewPasswordSchema,
  confirmPassword: z.string().min(1, "La confirmation est obligatoire."),
}).refine((value) => value.newPassword === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "La confirmation ne correspond pas au nouveau mot de passe.",
})

export const accountEmailChangeTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/, "Jeton invalide.")
