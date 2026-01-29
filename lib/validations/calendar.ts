/**
 * Calendar Validation Schemas
 */

import { z } from 'zod'
import { optionalDateSchema } from './common'

// ================================
// Event Source Enum
// ================================

export const eventSourceEnum = z.enum([
  'lomba',
  'expo',
  'manual'
])

// ================================
// Event Type Enum
// ================================

export const eventTypeEnum = z.enum([
  'deadline',
  'event',
  'registration',
  'announcement',
  'other'
])

// ================================
// Create Calendar Event Schema
// ================================

export const createCalendarEventSchema = z.object({
  title: z.string()
    .min(3, 'Judul minimal 3 karakter')
    .max(200, 'Judul maksimal 200 karakter'),
  description: z.string().optional(),
  start_date: z.string().refine(val => !isNaN(Date.parse(val)), 'Tanggal mulai tidak valid'),
  end_date: optionalDateSchema,
  all_day: z.boolean().default(true),
  event_type: eventTypeEnum.default('event'),
  source: eventSourceEnum.default('manual'),
  source_id: z.number().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format warna tidak valid (hex)').optional(),
  url: z.string().url('URL tidak valid').optional().or(z.literal(''))
})

export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>

// ================================
// Update Calendar Event Schema
// ================================

export const updateCalendarEventSchema = createCalendarEventSchema.partial()

export type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventSchema>

// ================================
// Query Calendar Events Schema
// ================================

export const queryCalendarEventsSchema = z.object({
  start: z.string().refine(val => !isNaN(Date.parse(val)), 'Tanggal mulai tidak valid'),
  end: z.string().refine(val => !isNaN(Date.parse(val)), 'Tanggal akhir tidak valid'),
  source: eventSourceEnum.optional(),
  event_type: eventTypeEnum.optional()
})

export type QueryCalendarEventsParams = z.infer<typeof queryCalendarEventsSchema>
