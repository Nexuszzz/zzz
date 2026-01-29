/**
 * Lomba Validation Schemas
 */

import { z } from 'zod'
import { 
  slugSchema, 
  tingkatEnum, 
  kategoriLombaEnum, 
  statusLombaEnum,
  tipePendaftaranEnum,
  sumberLombaEnum,
  optionalDateSchema,
  emailSchema,
  nimSchema,
  whatsappSchema,
  fakultasSchema,
  prodiSchema,
  statusRegistrasiEnum
} from './common'

// ================================
// Form Config Schema (for custom_form)
// ================================

export const formFieldOptionSchema = z.object({
  value: z.string(),
  label: z.string()
})

export const formFieldConditionSchema = z.object({
  field: z.string(),
  operator: z.enum(['equals', 'not_equals', 'contains', 'not_empty', 'empty']),
  value: z.string().optional()
})

export const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum([
    'text',
    'textarea',
    'email',
    'number',
    'phone',
    'select',
    'radio',
    'checkbox',
    'file',
    'date',
    'time',
    'url',
    'nim',
    'fakultas',
    'prodi'
  ]),
  label: z.string().min(1, 'Label wajib diisi'),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(formFieldOptionSchema).optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    message: z.string().optional()
  }).optional(),
  condition: formFieldConditionSchema.optional(),
  order: z.number().default(0)
})

export const formConfigSchema = z.object({
  fields: z.array(formFieldSchema),
  settings: z.object({
    submitButtonText: z.string().default('Daftar'),
    successMessage: z.string().default('Pendaftaran berhasil!'),
    allowMultipleSubmissions: z.boolean().default(false)
  }).optional()
})

export type FormField = z.infer<typeof formFieldSchema>
export type FormConfig = z.infer<typeof formConfigSchema>

// ================================
// Kontak Panitia Schema
// ================================

export const kontakPanitiaSchema = z.object({
  nama: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional(),
  line: z.string().optional()
})

// ================================
// Hadiah Schema
// ================================

export const hadiahSchema = z.object({
  juara1: z.string().optional(),
  juara2: z.string().optional(),
  juara3: z.string().optional(),
  lainnya: z.string().optional()
})

// ================================
// Lomba Create Schema
// ================================

export const createLombaSchema = z.object({
  nama_lomba: z.string()
    .min(3, 'Nama lomba minimal 3 karakter')
    .max(200, 'Nama lomba maksimal 200 karakter'),
  slug: slugSchema.optional(), // Auto-generate if not provided
  deskripsi: z.string().optional(),
  kategori: kategoriLombaEnum,
  tingkat: tingkatEnum,
  deadline: optionalDateSchema,
  tanggal_pelaksanaan: optionalDateSchema,
  penyelenggara: z.string().optional(),
  lokasi: z.string().optional(),
  sumber: sumberLombaEnum.default('internal'),
  tipe_pendaftaran: tipePendaftaranEnum.default('internal'),
  link_pendaftaran: z.string().url('URL tidak valid').optional().or(z.literal('')),
  custom_form: formConfigSchema.optional(),
  syarat_ketentuan: z.string().optional(),
  hadiah: hadiahSchema.optional(),
  biaya: z.number().min(0).default(0),
  kontak_panitia: kontakPanitiaSchema.optional(),
  poster: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_featured: z.boolean().default(false),
  is_urgent: z.boolean().default(false),
  status: statusLombaEnum.default('draft')
})

export type CreateLombaInput = z.infer<typeof createLombaSchema>

// ================================
// Lomba Update Schema
// ================================

export const updateLombaSchema = createLombaSchema.partial()

export type UpdateLombaInput = z.infer<typeof updateLombaSchema>

// ================================
// Lomba Query Schema
// ================================

export const queryLombaSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  search: z.string().optional(),
  kategori: kategoriLombaEnum.optional(),
  tingkat: tingkatEnum.optional(),
  status: statusLombaEnum.optional(),
  is_featured: z.coerce.boolean().optional(),
  sort: z.enum(['created_at', 'deadline', 'nama_lomba']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc')
})

export type QueryLombaParams = z.infer<typeof queryLombaSchema>

// ================================
// Lomba Registration Schema
// ================================

export const lombaRegistrationBaseSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  nim: nimSchema,
  email: emailSchema,
  whatsapp: whatsappSchema,
  fakultas: fakultasSchema,
  prodi: prodiSchema
})

export const createLombaRegistrationSchema = lombaRegistrationBaseSchema.extend({
  lomba_id: z.number().positive('ID Lomba tidak valid'),
  custom_data: z.record(z.string(), z.unknown()).optional()
})

export type CreateLombaRegistrationInput = z.infer<typeof createLombaRegistrationSchema>

// ================================
// Update Registration Status
// ================================

export const updateRegistrationStatusSchema = z.object({
  status: statusRegistrasiEnum
})

export type UpdateRegistrationStatusInput = z.infer<typeof updateRegistrationStatusSchema>
