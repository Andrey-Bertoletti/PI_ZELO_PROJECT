import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Nome muito curto').max(80),
    email: z.string().trim().toLowerCase().email('E-mail inválido'),
    phone: z.string().trim().regex(/^\+?\d{10,15}$/, 'Telefone inválido').optional(),
    password: z.string().min(8, 'Senha muito curta').max(128),
    role: z.enum(['CLIENT', 'PROVIDER']).default('CLIENT'),
    city: z.string().trim().max(80).optional(),
    neighborhood: z.string().trim().max(80).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('E-mail inválido'),
    password: z.string().min(1, 'Senha obrigatória'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(32, 'Refresh token inválido'),
  }),
});

export const logoutSchema = refreshSchema;

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Senha atual obrigatória').max(128),
    newPassword: z.string().min(8, 'Nova senha muito curta').max(128),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('E-mail inválido'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(32, 'Token inválido').max(128),
    newPassword: z.string().min(8, 'Nova senha muito curta').max(128),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    phone: z.string().trim().regex(/^\+?\d{10,15}$/, 'Telefone inválido').optional().or(z.literal('')),
    city: z.string().trim().max(80).optional().or(z.literal('')),
    neighborhood: z.string().trim().max(80).optional().or(z.literal('')),
    avatarHue: z.number().int().min(0).max(360).optional(),
  }),
});
