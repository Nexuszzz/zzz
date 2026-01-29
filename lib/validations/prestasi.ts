/**
 * Prestasi Validation Schemas
 */

import { z } from 'zod'
import { 
  slugSchema, 
  tingkatEnum, 
  statusPrestasiEnum,
  emailSchema,
  nimSchema,
  whatsappSchema,
  optionalDateSchema
} from './common'

// ================================
// Peringkat Enum
// ================================

export const peringkatEnum = z.enum([
  'juara_1',
  'juara_2', 
  'juara_3',
  'harapan_1',
  'harapan_2',
  'harapan_3',
  'finalis',
  'semifinalis',
  'peserta_terbaik',
  'honorable_mention',
  'best_paper',
  'best_presentation',
  'lainnya'
])

// ================================
// Team Member Schema
// ================================

export const teamMemberSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  nim: nimSchema,
  prodi: z.string().optional(),
  angkatan: z.string().optional(),
  whatsapp: z.string().optional(),
  is_ketua: z.boolean().default(false)
})

export type TeamMemberInput = z.infer<typeof teamMemberSchema>

// ================================
// Pembimbing Schema
// ================================

export const pembimbingSchema = z.object({
  nama: z.string().min(2, 'Nama pembimbing minimal 2 karakter'),
  nidn: z.string().optional(),
  whatsapp: z.string().optional()
})

export type PembimbingInput = z.infer<typeof pembimbingSchema>

// ================================
// Document Type Enum
// ================================

export const documentTypeEnum = z.enum([
  'sertifikat',
  'surat_tugas',
  'dokumentasi',
  'poster',
  'paper',
  'lainnya'
])

// ================================
// Document Schema
// ================================

export const prestasiDocumentSchema = z.object({
  type: documentTypeEnum,
  label: z.string().optional(), // Free text label (e.g., "Surat Rekomendasi")
  file_path: z.string(),
  file_name: z.string(),
  file_type: z.string(),
  file_size: z.number().max(10 * 1024 * 1024, 'Ukuran file maksimal 10MB')
})

export type PrestasiDocumentInput = z.infer<typeof prestasiDocumentSchema>

// ================================
// Prestasi Submission Schema
// ================================

export const createPrestasiSubmissionSchema = z.object({
  // Info Prestasi
  judul: z.string()
    .min(5, 'Judul minimal 5 karakter')
    .max(300, 'Judul maksimal 300 karakter'),
  nama_lomba: z.string()
    .min(3, 'Nama lomba minimal 3 karakter')
    .max(200, 'Nama lomba maksimal 200 karakter'),
  penyelenggara: z.string().optional(),
  tingkat: tingkatEnum,
  peringkat: peringkatEnum,
  tanggal: optionalDateSchema,
  kategori: z.string().optional(),
  deskripsi: z.string().optional(),
  
  // Submitter Info
  submitter_name: z.string().min(2, 'Nama minimal 2 karakter'),
  submitter_nim: nimSchema,
  submitter_email: emailSchema,
  submitter_whatsapp: whatsappSchema,
  
  // Team Members (optional)
  team_members: z.array(teamMemberSchema).optional(),
  
  // Pembimbing (optional)
  pembimbing: z.array(pembimbingSchema).optional()
})

export type CreatePrestasiSubmissionInput = z.infer<typeof createPrestasiSubmissionSchema>

// ================================
// Submission Review Schema
// ================================

export const reviewSubmissionSchema = z.object({
  status: z.enum(['approved', 'rejected', 'revision_needed']),
  reviewer_notes: z.string().optional(),
  // For approved submissions
  make_public: z.boolean().default(true),
  sertifikat_public: z.boolean().default(false)
})

export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>

// ================================
// Published Prestasi Schema
// ================================

export const updatePrestasiSchema = z.object({
  judul: z.string().min(5).max(300).optional(),
  slug: slugSchema.optional(),
  tingkat: tingkatEnum.optional(),
  peringkat: peringkatEnum.optional(),
  tanggal: optionalDateSchema,
  kategori: z.string().optional(),
  deskripsi: z.string().optional(),
  is_featured: z.boolean().optional(),
  sertifikat_public: z.boolean().optional()
})

export type UpdatePrestasiInput = z.infer<typeof updatePrestasiSchema>

// ================================
// Query Prestasi Schema
// ================================

export const queryPrestasiSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  search: z.string().optional(),
  tingkat: tingkatEnum.optional(),
  peringkat: peringkatEnum.optional(),
  kategori: z.string().optional(),
  tahun: z.coerce.number().optional(),
  is_featured: z.coerce.boolean().optional(),
  sort: z.enum(['created_at', 'tanggal', 'judul']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc')
})

export type QueryPrestasiParams = z.infer<typeof queryPrestasiSchema>

// ================================
// Query Submissions Schema (Admin)
// ================================

export const querySubmissionsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  search: z.string().optional(),
  status: statusPrestasiEnum.optional(),
  tingkat: tingkatEnum.optional(),
  sort: z.enum(['created_at', 'tanggal', 'judul', 'status']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc')
})

export type QuerySubmissionsParams = z.infer<typeof querySubmissionsSchema>
