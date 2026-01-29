'use client'

/**
 * Form Renderer Component
 * 
 * Renders a dynamic form based on FormConfig.
 * Handles form state, validation, and submission.
 */

import React, { useState, useCallback, useMemo } from 'react'
import { 
  FormConfig, 
  FormField, 
  FormState, 
  ConditionalDisplay,
  FieldCondition,
  ConditionOperator 
} from '@/types/form-builder'
import { FieldWrapper } from './FormFields'

// ================================
// Types
// ================================

interface FormRendererProps {
  /** Form configuration */
  config: FormConfig
  /** Initial values (optional) */
  initialValues?: Record<string, unknown>
  /** Submit handler */
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  /** Cancel handler (optional) */
  onCancel?: () => void
  /** Whether form is disabled */
  disabled?: boolean
  /** Custom submit button text */
  submitText?: string
  /** Show cancel button */
  showCancel?: boolean
  /** Additional CSS classes */
  className?: string
}

// ================================
// Condition Evaluation
// ================================

function evaluateCondition(
  condition: FieldCondition,
  values: Record<string, unknown>
): boolean {
  const fieldValue = values[condition.field]
  const { operator, value } = condition

  switch (operator) {
    case 'equals':
      return fieldValue === value

    case 'not_equals':
      return fieldValue !== value

    case 'contains':
      if (typeof fieldValue === 'string' && typeof value === 'string') {
        return fieldValue.toLowerCase().includes(value.toLowerCase())
      }
      if (Array.isArray(fieldValue) && typeof value === 'string') {
        return fieldValue.includes(value)
      }
      return false

    case 'not_contains':
      if (typeof fieldValue === 'string' && typeof value === 'string') {
        return !fieldValue.toLowerCase().includes(value.toLowerCase())
      }
      if (Array.isArray(fieldValue) && typeof value === 'string') {
        return !fieldValue.includes(value)
      }
      return true

    case 'starts_with':
      if (typeof fieldValue === 'string' && typeof value === 'string') {
        return fieldValue.toLowerCase().startsWith(value.toLowerCase())
      }
      return false

    case 'ends_with':
      if (typeof fieldValue === 'string' && typeof value === 'string') {
        return fieldValue.toLowerCase().endsWith(value.toLowerCase())
      }
      return false

    case 'greater_than':
      if (typeof fieldValue === 'number' && typeof value === 'number') {
        return fieldValue > value
      }
      return false

    case 'less_than':
      if (typeof fieldValue === 'number' && typeof value === 'number') {
        return fieldValue < value
      }
      return false

    case 'is_empty':
      return fieldValue === '' || fieldValue === null || fieldValue === undefined ||
        (Array.isArray(fieldValue) && fieldValue.length === 0)

    case 'is_not_empty':
      return fieldValue !== '' && fieldValue !== null && fieldValue !== undefined &&
        !(Array.isArray(fieldValue) && fieldValue.length === 0)

    case 'in':
      if (Array.isArray(value)) {
        return value.includes(fieldValue as string)
      }
      return false

    case 'not_in':
      if (Array.isArray(value)) {
        return !value.includes(fieldValue as string)
      }
      return true

    default:
      return true
  }
}

function evaluateConditionalDisplay(
  display: ConditionalDisplay,
  values: Record<string, unknown>
): boolean {
  const { show, logic, conditions } = display

  if (conditions.length === 0) {
    return show
  }

  const results = conditions.map((cond) => evaluateCondition(cond, values))
  
  let conditionsMet: boolean
  if (logic === 'and') {
    conditionsMet = results.every((r) => r)
  } else {
    conditionsMet = results.some((r) => r)
  }

  // If show=true, display when conditions are met
  // If show=false (hide), display when conditions are NOT met
  return show ? conditionsMet : !conditionsMet
}

// ================================
// Field Validation
// ================================

function validateField(field: FormField, value: unknown): string | undefined {
  // Required check
  if (field.required) {
    const isEmpty = value === '' || value === null || value === undefined ||
      (Array.isArray(value) && value.length === 0)
    
    if (isEmpty) {
      return field.validation?.requiredMessage || `${field.label} wajib diisi`
    }
  }

  // Skip other validations if empty and not required
  if (value === '' || value === null || value === undefined) {
    return undefined
  }

  const validation = field.validation

  // String validations
  if (typeof value === 'string') {
    if (validation?.minLength && value.length < validation.minLength) {
      return `${field.label} minimal ${validation.minLength} karakter`
    }
    if (validation?.maxLength && value.length > validation.maxLength) {
      return `${field.label} maksimal ${validation.maxLength} karakter`
    }
    if (validation?.pattern) {
      const regex = new RegExp(validation.pattern)
      if (!regex.test(value)) {
        return validation.patternMessage || `Format ${field.label} tidak valid`
      }
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (validation?.min !== undefined && value < validation.min) {
      return `${field.label} minimal ${validation.min}`
    }
    if (validation?.max !== undefined && value > validation.max) {
      return `${field.label} maksimal ${validation.max}`
    }
  }

  // Email validation
  if (field.type === 'email' && typeof value === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return 'Format email tidak valid'
    }
  }

  // URL validation
  if (field.type === 'url' && typeof value === 'string') {
    try {
      new URL(value)
    } catch {
      return 'Format URL tidak valid'
    }
  }

  // Phone validation
  if ((field.type === 'phone' || field.type === 'nim') && typeof value === 'string') {
    if (validation?.minLength && value.length < validation.minLength) {
      return `${field.label} minimal ${validation.minLength} karakter`
    }
  }

  return undefined
}

// ================================
// Form Renderer Component
// ================================

export function FormRenderer({
  config,
  initialValues = {},
  onSubmit,
  onCancel,
  disabled = false,
  submitText,
  showCancel = false,
  className = ''
}: FormRendererProps) {
  // Form state
  const [values, setValues] = useState<Record<string, unknown>>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Sort fields by order
  const sortedFields = useMemo(() => {
    return [...config.fields].sort((a, b) => a.order - b.order)
  }, [config.fields])

  // Calculate visible fields based on conditions
  const visibleFields = useMemo(() => {
    return sortedFields.filter((field) => {
      if (!field.condition) return true
      return evaluateConditionalDisplay(field.condition, values)
    })
  }, [sortedFields, values])

  // Handle value change
  const handleChange = useCallback((fieldId: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }))
    
    // Clear error when value changes
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[fieldId]
        return next
      })
    }
    
    // Clear submit states
    setSubmitError(null)
    setSubmitSuccess(false)
  }, [errors])

  // Handle blur (mark as touched)
  const handleBlur = useCallback((fieldId: string) => {
    setTouched((prev) => ({ ...prev, [fieldId]: true }))
    
    // Validate on blur
    const field = config.fields.find((f) => f.id === fieldId)
    if (field) {
      const error = validateField(field, values[fieldId])
      if (error) {
        setErrors((prev) => ({ ...prev, [fieldId]: error }))
      }
    }
  }, [config.fields, values])

  // Validate all visible fields
  const validateAll = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    for (const field of visibleFields) {
      const error = validateField(field, values[field.id])
      if (error) {
        newErrors[field.id] = error
        isValid = false
      }
    }

    setErrors(newErrors)
    
    // Mark all as touched
    const allTouched: Record<string, boolean> = {}
    visibleFields.forEach((f) => {
      allTouched[f.id] = true
    })
    setTouched(allTouched)

    return isValid
  }, [visibleFields, values])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (disabled || isSubmitting) return

    // Validate
    if (!validateAll()) {
      return
    }

    // Confirmation dialog if enabled
    if (config.settings.showConfirmation) {
      const confirmed = window.confirm(
        config.settings.confirmationMessage || 'Apakah Anda yakin ingin mengirim formulir ini?'
      )
      if (!confirmed) return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Collect only visible field values
      const submitData: Record<string, unknown> = {}
      for (const field of visibleFields) {
        if (values[field.id] !== undefined) {
          submitData[field.id] = values[field.id]
        }
      }

      await onSubmit(submitData)
      setSubmitSuccess(true)
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitError(
        error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render success message
  if (submitSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 text-xl mb-2">✓</div>
        <p className="text-green-700 font-medium">
          {config.settings.successMessage || 'Pendaftaran berhasil!'}
        </p>
        {config.settings.redirectUrl && (
          <a
            href={config.settings.redirectUrl}
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            Lanjutkan →
          </a>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`${className}`}>
      <div className="grid grid-cols-12 gap-4">
        {visibleFields.map((field) => (
          <FieldWrapper
            key={field.id}
            field={field}
            value={values[field.id]}
            error={errors[field.id]}
            touched={touched[field.id]}
            onChange={(value) => handleChange(field.id, value)}
            onBlur={() => handleBlur(field.id)}
            disabled={disabled || isSubmitting}
          />
        ))}
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700">{submitError}</p>
        </div>
      )}

      <div className="flex items-center gap-4 mt-6">
        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className={`px-6 py-2 rounded-lg font-medium transition
            ${disabled || isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
        >
          {isSubmitting
            ? 'Mengirim...'
            : submitText || config.settings.submitButtonText || 'Kirim'
          }
        </button>

        {showCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-lg font-medium text-gray-600 border border-gray-300 
              hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  )
}

export default FormRenderer
