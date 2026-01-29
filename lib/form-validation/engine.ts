/**
 * Form Validation Engine
 * 
 * Generates dynamic Zod schemas from FormConfig at runtime.
 * Validates form submissions against the custom form definition.
 */

import { z } from 'zod'
import { FormConfig, FormField, FieldType } from '@/types/form-builder'

// ================================
// Field Type to Zod Schema Mapping
// ================================

function createFieldSchema(field: FormField): z.ZodTypeAny {
  let schema: z.ZodTypeAny

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'nim':
    case 'prodi':
      schema = z.string()
      if (field.validation?.minLength) {
        schema = (schema as z.ZodString).min(
          field.validation.minLength,
          `${field.label} minimal ${field.validation.minLength} karakter`
        )
      }
      if (field.validation?.maxLength) {
        schema = (schema as z.ZodString).max(
          field.validation.maxLength,
          `${field.label} maksimal ${field.validation.maxLength} karakter`
        )
      }
      if (field.validation?.pattern) {
        schema = (schema as z.ZodString).regex(
          new RegExp(field.validation.pattern),
          field.validation.patternMessage || `Format ${field.label} tidak valid`
        )
      }
      break

    case 'email':
      schema = z.string().email(`Format email tidak valid`)
      break

    case 'url':
      schema = z.string().url(`Format URL tidak valid`)
      break

    case 'number':
      schema = z.number()
      if (field.validation?.min !== undefined) {
        schema = (schema as z.ZodNumber).min(
          field.validation.min,
          `${field.label} minimal ${field.validation.min}`
        )
      }
      if (field.validation?.max !== undefined) {
        schema = (schema as z.ZodNumber).max(
          field.validation.max,
          `${field.label} maksimal ${field.validation.max}`
        )
      }
      break

    case 'phone':
      schema = z.string()
        .min(10, 'Nomor telepon minimal 10 digit')
        .max(15, 'Nomor telepon maksimal 15 digit')
        .regex(/^[0-9+]+$/, 'Nomor telepon tidak valid')
      break

    case 'select':
    case 'radio':
    case 'fakultas':
      if (field.options && field.options.length > 0) {
        const values = field.options.map((o) => o.value) as [string, ...string[]]
        schema = z.enum(values)
      } else {
        schema = z.string()
      }
      break

    case 'checkbox':
    case 'multiselect':
      schema = z.array(z.string())
      if (field.validation?.min) {
        schema = (schema as z.ZodArray<z.ZodString>).min(
          field.validation.min,
          `Pilih minimal ${field.validation.min} opsi`
        )
      }
      break

    case 'date':
    case 'time':
    case 'datetime':
      schema = z.string().refine(
        (val) => !val || !isNaN(Date.parse(val)),
        { message: `Format ${field.label} tidak valid` }
      )
      break

    case 'file':
      // Files are validated separately during upload
      schema = z.any()
      break

    case 'hidden':
      schema = z.any()
      break

    default:
      schema = z.string()
  }

  // Handle required/optional
  if (!field.required) {
    schema = schema.optional().or(z.literal(''))
  } else {
    // Add required message
    const message = field.validation?.requiredMessage || `${field.label} wajib diisi`
    
    // For strings, ensure non-empty
    if (['text', 'textarea', 'email', 'url', 'nim', 'prodi', 'phone', 'select', 'radio', 'fakultas', 'date', 'time', 'datetime'].includes(field.type)) {
      schema = z.string().min(1, message)
      // Re-apply string validations after min(1)
      if (field.type === 'email') {
        schema = (schema as z.ZodString).email('Format email tidak valid')
      }
      if (field.type === 'url') {
        schema = (schema as z.ZodString).url('Format URL tidak valid')
      }
      if (field.type === 'phone') {
        schema = (schema as z.ZodString)
          .min(10, 'Nomor telepon minimal 10 digit')
          .max(15, 'Nomor telepon maksimal 15 digit')
          .regex(/^[0-9+]+$/, 'Nomor telepon tidak valid')
      }
      if (field.validation?.minLength && field.validation.minLength > 1) {
        schema = (schema as z.ZodString).min(
          field.validation.minLength,
          `${field.label} minimal ${field.validation.minLength} karakter`
        )
      }
      if (field.validation?.maxLength) {
        schema = (schema as z.ZodString).max(
          field.validation.maxLength,
          `${field.label} maksimal ${field.validation.maxLength} karakter`
        )
      }
      if (field.validation?.pattern) {
        schema = (schema as z.ZodString).regex(
          new RegExp(field.validation.pattern),
          field.validation.patternMessage || `Format ${field.label} tidak valid`
        )
      }
    }
  }

  return schema
}

// ================================
// Generate Dynamic Schema
// ================================

/**
 * Generate a Zod schema from FormConfig
 * @param config - Form configuration
 * @param visibleFieldIds - Optional set of visible field IDs (for conditional logic)
 */
export function generateFormSchema(
  config: FormConfig,
  visibleFieldIds?: Set<string>
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const field of config.fields) {
    // Skip hidden fields if visibleFieldIds is provided
    if (visibleFieldIds && !visibleFieldIds.has(field.id)) {
      continue
    }

    // Skip hidden type fields
    if (field.type === 'hidden') {
      continue
    }

    shape[field.id] = createFieldSchema(field)
  }

  return z.object(shape)
}

// ================================
// Validate Form Data
// ================================

export interface ValidationResult {
  success: boolean
  data?: Record<string, unknown>
  errors?: Record<string, string>
}

/**
 * Validate form data against FormConfig
 */
export function validateFormData(
  config: FormConfig,
  data: Record<string, unknown>,
  visibleFieldIds?: Set<string>
): ValidationResult {
  try {
    const schema = generateFormSchema(config, visibleFieldIds)
    const result = schema.safeParse(data)

    if (result.success) {
      return {
        success: true,
        data: result.data
      }
    }

    // Convert Zod errors to our format
    const errors: Record<string, string> = {}
    const zodErrors = result.error.flatten()

    for (const [fieldId, messages] of Object.entries(zodErrors.fieldErrors)) {
      if (messages && messages.length > 0) {
        errors[fieldId] = messages[0]
      }
    }

    return {
      success: false,
      errors
    }
  } catch (error) {
    console.error('Validation error:', error)
    return {
      success: false,
      errors: { _form: 'Terjadi kesalahan validasi' }
    }
  }
}

// ================================
// Base Registration Schema
// ================================

/**
 * Base schema for all registrations
 * Used to ensure core fields are always present
 */
export const baseRegistrationSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  nim: z.string()
    .min(8, 'NIM minimal 8 karakter')
    .max(20, 'NIM maksimal 20 karakter')
    .regex(/^[0-9A-Za-z]+$/, 'NIM hanya boleh berisi huruf dan angka'),
  email: z.string().email('Format email tidak valid'),
  whatsapp: z.string()
    .min(10, 'Nomor WhatsApp minimal 10 digit')
    .max(15, 'Nomor WhatsApp maksimal 15 digit')
    .regex(/^[0-9+]+$/, 'Nomor WhatsApp tidak valid'),
  fakultas: z.string().min(1, 'Fakultas wajib diisi'),
  prodi: z.string().min(1, 'Program Studi wajib diisi')
})

/**
 * Merge base schema with custom form schema
 */
export function mergeWithBaseSchema(
  config: FormConfig,
  visibleFieldIds?: Set<string>
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const customSchema = generateFormSchema(config, visibleFieldIds)
  
  // Base schema is already included, just extend with custom fields
  // We let custom schema override if there are conflicts
  return z.object({
    ...baseRegistrationSchema.shape,
    ...customSchema.shape
  }) as z.ZodObject<Record<string, z.ZodTypeAny>>
}

// ================================
// Export Types
// ================================

export type BaseRegistration = z.infer<typeof baseRegistrationSchema>
