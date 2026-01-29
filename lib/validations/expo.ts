/**
 * Expo Validation Schemas
 */

import { z } from 'zod'
import { 
  slugSchema, 
  tipePendaftaranEnum,
  emailSchema,
  nimSchema,
  whatsappSchema,
  statusRegistrasiEnum,
  optionalDateSchema
} from './common'
import { formConfigSchema } from './lomba'

// ================================
// Expo Status Enum
// ================================

export const statusExpoEnum = z.enum([
  'upcoming',
  'registration_open',
  'ongoing',
  'completed',
  'cancelled'
])

// ================================
// Expo Highlight Schema
// ================================

export const expoHighlightSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  icon: z.string().optional()
})

// ================================
// Expo Rundown Schema
// ================================

export const rundownItemSchema = z.object({
  time: z.string(),
  title: z.string(),
  description: z.string().optional(),
  speaker: z.string().optional()
})

export const rundownDaySchema = z.object({
  date: z.string(),
  title: z.string().optional(),
  items: z.array(rundownItemSchema)
})

// ================================
// Create Expo Schema
// ================================

export const createExpoSchema = z.object({
  nama_event: z.string()
    .min(3, 'Nama event minimal 3 karakter')
    .max(200, 'Nama event maksimal 200 karakter'),
  slug: slugSchema.optional(),
  tema: z.string().optional(),
  deskripsi: z.string().optional(),
  tanggal_mulai: z.string().refine(val => !isNaN(Date.parse(val)), 'Tanggal mulai tidak valid'),
  tanggal_selesai: z.string().refine(val => !isNaN(Date.parse(val)), 'Tanggal selesai tidak valid'),
  lokasi: z.string().min(1, 'Lokasi wajib diisi'),
  alamat_lengkap: z.string().optional(),
  tipe_pendaftaran: tipePendaftaranEnum.default('none'),
  link_pendaftaran: z.string().url('URL tidak valid').optional().or(z.literal('')),
  custom_form: formConfigSchema.optional(),
  registration_open: z.boolean().default(false),
  registration_deadline: optionalDateSchema,
  max_participants: z.number().positive().optional(),
  biaya_partisipasi: z.number().min(0).default(0),
  highlights: z.array(expoHighlightSchema).optional(),
  rundown: z.array(rundownDaySchema).optional(),
  galeri: z.array(z.string()).optional(),
  benefit: z.string().optional(),
  website_resmi: z.string().url('URL tidak valid').optional().or(z.literal('')),
  poster: z.string().optional(),
  is_featured: z.boolean().default(false),
  status: statusExpoEnum.default('upcoming')
})

export type CreateExpoInput = z.infer<typeof createExpoSchema>

// ================================
// Update Expo Schema
// ================================

export const updateExpoSchema = createExpoSchema.partial()

export type UpdateExpoInput = z.infer<typeof updateExpoSchema>

// ================================
// Expo Settings Schema
// ================================

export const updateExpoSettingsSchema = z.object({
  is_active: z.boolean().optional(),
  inactive_message: z.string().optional(),
  next_expo_date: optionalDateSchema
})

export type UpdateExpoSettingsInput = z.infer<typeof updateExpoSettingsSchema>

// ================================
// Expo Query Schema
// ================================

export const queryExpoSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  search: z.string().optional(),
  status: statusExpoEnum.optional(),
  is_featured: z.coerce.boolean().optional(),
  sort: z.enum(['created_at', 'tanggal_mulai', 'nama_event']).default('tanggal_mulai'),
  order: z.enum(['asc', 'desc']).default('asc')
})

export type QueryExpoParams = z.infer<typeof queryExpoSchema>

// ================================
// Expo Registration Schema
// ================================

export const createExpoRegistrationSchema = z.object({
  expo_id: z.number().positive('ID Expo tidak valid'),
  nama: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  nim: nimSchema,
  email: emailSchema,
  whatsapp: whatsappSchema,
  project_name: z.string().optional(),
  project_desc: z.string().optional(),
  custom_data: z.record(z.string(), z.unknown()).optional()
})

export type CreateExpoRegistrationInput = z.infer<typeof createExpoRegistrationSchema>

// ================================
// Update Expo Registration Status
// ================================

export const updateExpoRegistrationStatusSchema = z.object({
  status: statusRegistrasiEnum
})

export type UpdateExpoRegistrationStatusInput = z.infer<typeof updateExpoRegistrationStatusSchema>
