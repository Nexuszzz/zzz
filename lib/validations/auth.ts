/**
 * Auth Validation Schemas
 */

import { z } from 'zod'

// ================================
// Login Schema
// ================================

export const loginSchema = z.object({
  email: z.string()
    .email('Email tidak valid')
    .min(1, 'Email wajib diisi'),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .max(100, 'Password maksimal 100 karakter')
})

export type LoginInput = z.infer<typeof loginSchema>

// ================================
// Admin Create/Update Schemas
// ================================

export const createAdminSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .max(100, 'Password maksimal 100 karakter'),
  name: z.string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  role: z.enum(['superadmin', 'admin', 'editor']).default('admin')
})

export type CreateAdminInput = z.infer<typeof createAdminSchema>

export const updateAdminSchema = z.object({
  email: z.string().email('Email tidak valid').optional(),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .max(100, 'Password maksimal 100 karakter')
    .optional(),
  name: z.string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter')
    .optional(),
  role: z.enum(['superadmin', 'admin', 'editor']).optional(),
  is_active: z.boolean().optional()
})

export type UpdateAdminInput = z.infer<typeof updateAdminSchema>

// ================================
// Change Password Schema
// ================================

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Password saat ini wajib diisi'),
  new_password: z.string()
    .min(8, 'Password baru minimal 8 karakter')
    .max(100, 'Password baru maksimal 100 karakter'),
  confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirm_password']
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

// ================================
// Session/Token Types
// ================================

export interface JWTPayload {
  sub: string // admin id
  email: string
  name: string
  role: string
  iat: number
  exp: number
}

export interface SessionUser {
  id: number
  email: string
  name: string
  role: string
}
