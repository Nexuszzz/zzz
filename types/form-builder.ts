/**
 * Form Builder Types
 * 
 * Complete type definitions for the dynamic form builder system.
 * Supports drag-drop form creation with conditional logic.
 */

// ================================
// Field Types
// ================================

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'phone'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'multiselect'
  | 'file'
  | 'date'
  | 'time'
  | 'datetime'
  | 'url'
  | 'nim'
  | 'fakultas'
  | 'prodi'
  | 'hidden'

// ================================
// Field Option (for select, radio, checkbox)
// ================================

export interface FieldOption {
  value: string
  label: string
  disabled?: boolean
}

// ================================
// Validation Config
// ================================

export interface FieldValidation {
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  patternMessage?: string
  required?: boolean
  requiredMessage?: string
  // File validation
  maxFileSize?: number // in bytes
  allowedFileTypes?: string[] // e.g., ['image/*', 'application/pdf']
}

// ================================
// Conditional Logic
// ================================

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty'
  | 'in'
  | 'not_in'

export interface FieldCondition {
  /** ID of the field to check */
  field: string
  /** Operator for comparison */
  operator: ConditionOperator
  /** Value to compare against (optional for is_empty/is_not_empty) */
  value?: string | number | string[]
}

export type ConditionLogic = 'and' | 'or'

export interface ConditionalDisplay {
  /** Show this field when conditions are met */
  show: boolean
  /** Logic for combining multiple conditions */
  logic: ConditionLogic
  /** Conditions to evaluate */
  conditions: FieldCondition[]
}

// ================================
// Form Field Definition
// ================================

export interface FormField {
  /** Unique identifier for the field */
  id: string
  /** Field type */
  type: FieldType
  /** Display label */
  label: string
  /** Placeholder text */
  placeholder?: string
  /** Help text shown below field */
  helpText?: string
  /** Default value */
  defaultValue?: string | number | boolean | string[]
  /** Whether field is required */
  required: boolean
  /** Whether field is disabled */
  disabled?: boolean
  /** Whether field is read-only */
  readOnly?: boolean
  /** Options for select, radio, checkbox, multiselect */
  options?: FieldOption[]
  /** Validation rules */
  validation?: FieldValidation
  /** Conditional display logic */
  condition?: ConditionalDisplay
  /** Display order */
  order: number
  /** Column span (1-12 for grid layout) */
  colSpan?: number
  /** Custom CSS classes */
  className?: string
  /** Custom attributes */
  attributes?: Record<string, string>
}

// ================================
// Form Settings
// ================================

export interface FormSettings {
  /** Submit button text */
  submitButtonText: string
  /** Message shown on successful submission */
  successMessage: string
  /** Allow multiple submissions from same user */
  allowMultipleSubmissions: boolean
  /** Redirect URL after submission */
  redirectUrl?: string
  /** Show confirmation before submit */
  showConfirmation?: boolean
  /** Confirmation message */
  confirmationMessage?: string
  /** Enable captcha */
  enableCaptcha?: boolean
  /** Custom submit handler name */
  submitHandler?: string
}

// ================================
// Form Configuration (stored in DB as JSON)
// ================================

export interface FormConfig {
  /** Form fields */
  fields: FormField[]
  /** Form settings */
  settings: FormSettings
  /** Form version for migration */
  version?: number
}

// ================================
// Form State (for rendering)
// ================================

export interface FormState {
  /** Field values */
  values: Record<string, unknown>
  /** Field errors */
  errors: Record<string, string>
  /** Fields that are touched */
  touched: Record<string, boolean>
  /** Whether form is submitting */
  isSubmitting: boolean
  /** Whether form has been submitted */
  isSubmitted: boolean
  /** Visible field IDs (after conditional logic) */
  visibleFields: Set<string>
}

// ================================
// Form Submission Data
// ================================

export interface FormSubmission {
  /** Submitted values */
  data: Record<string, unknown>
  /** Submission metadata */
  metadata: {
    submittedAt: string
    userAgent?: string
    ipAddress?: string
    formVersion?: number
  }
}

// ================================
// Field Component Props
// ================================

export interface FieldProps {
  field: FormField
  value: unknown
  error?: string
  touched?: boolean
  onChange: (value: unknown) => void
  onBlur: () => void
  disabled?: boolean
}

// ================================
// Form Builder State (for editor)
// ================================

export interface FormBuilderState {
  /** Current form configuration */
  config: FormConfig
  /** Currently selected field ID */
  selectedFieldId: string | null
  /** Drag state */
  isDragging: boolean
  /** Undo history */
  history: FormConfig[]
  /** Current history index */
  historyIndex: number
}

// ================================
// Field Templates (for drag-drop palette)
// ================================

export interface FieldTemplate {
  type: FieldType
  label: string
  icon: string
  category: FieldCategory
  defaultConfig: Partial<FormField>
}

export type FieldCategory = 
  | 'basic' 
  | 'contact' 
  | 'selection' 
  | 'file' 
  | 'datetime' 
  | 'special'

export const FIELD_TEMPLATES: FieldTemplate[] = [
  // Basic Fields
  {
    type: 'text',
    label: 'Text Input',
    icon: 'type',
    category: 'basic',
    defaultConfig: { placeholder: 'Masukkan teks...' }
  },
  {
    type: 'textarea',
    label: 'Text Area',
    icon: 'align-left',
    category: 'basic',
    defaultConfig: { placeholder: 'Masukkan teks panjang...' }
  },
  {
    type: 'number',
    label: 'Number',
    icon: 'hash',
    category: 'basic',
    defaultConfig: { placeholder: '0' }
  },
  
  // Contact Fields
  {
    type: 'email',
    label: 'Email',
    icon: 'mail',
    category: 'contact',
    defaultConfig: { placeholder: 'email@example.com' }
  },
  {
    type: 'phone',
    label: 'Phone/WhatsApp',
    icon: 'phone',
    category: 'contact',
    defaultConfig: { placeholder: '08xxxxxxxxxx' }
  },
  {
    type: 'url',
    label: 'URL',
    icon: 'link',
    category: 'contact',
    defaultConfig: { placeholder: 'https://...' }
  },
  
  // Selection Fields
  {
    type: 'select',
    label: 'Dropdown',
    icon: 'chevron-down',
    category: 'selection',
    defaultConfig: { options: [{ value: 'option1', label: 'Option 1' }] }
  },
  {
    type: 'radio',
    label: 'Radio Buttons',
    icon: 'circle',
    category: 'selection',
    defaultConfig: { options: [{ value: 'option1', label: 'Option 1' }] }
  },
  {
    type: 'checkbox',
    label: 'Checkboxes',
    icon: 'check-square',
    category: 'selection',
    defaultConfig: { options: [{ value: 'option1', label: 'Option 1' }] }
  },
  {
    type: 'multiselect',
    label: 'Multi Select',
    icon: 'list',
    category: 'selection',
    defaultConfig: { options: [{ value: 'option1', label: 'Option 1' }] }
  },
  
  // File Fields
  {
    type: 'file',
    label: 'File Upload',
    icon: 'upload',
    category: 'file',
    defaultConfig: {
      validation: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedFileTypes: ['image/*', 'application/pdf']
      }
    }
  },
  
  // DateTime Fields
  {
    type: 'date',
    label: 'Date',
    icon: 'calendar',
    category: 'datetime',
    defaultConfig: {}
  },
  {
    type: 'time',
    label: 'Time',
    icon: 'clock',
    category: 'datetime',
    defaultConfig: {}
  },
  {
    type: 'datetime',
    label: 'Date & Time',
    icon: 'calendar-clock',
    category: 'datetime',
    defaultConfig: {}
  },
  
  // Special Fields (pre-configured for APM)
  {
    type: 'nim',
    label: 'NIM',
    icon: 'id-card',
    category: 'special',
    defaultConfig: {
      label: 'NIM',
      placeholder: 'Masukkan NIM',
      validation: {
        minLength: 8,
        maxLength: 20,
        pattern: '^[0-9A-Za-z]+$',
        patternMessage: 'NIM hanya boleh berisi huruf dan angka'
      }
    }
  },
  {
    type: 'fakultas',
    label: 'Fakultas',
    icon: 'building',
    category: 'special',
    defaultConfig: {
      label: 'Fakultas',
      options: [
        { value: 'ft', label: 'Fakultas Teknik' },
        { value: 'fk', label: 'Fakultas Kedokteran' },
        { value: 'fh', label: 'Fakultas Hukum' },
        { value: 'feb', label: 'Fakultas Ekonomika dan Bisnis' },
        { value: 'fisip', label: 'Fakultas Ilmu Sosial dan Ilmu Politik' },
        { value: 'fib', label: 'Fakultas Ilmu Budaya' },
        { value: 'fpsi', label: 'Fakultas Psikologi' },
        { value: 'fpp', label: 'Fakultas Peternakan dan Pertanian' },
        { value: 'fsm', label: 'Fakultas Sains dan Matematika' },
        { value: 'fkm', label: 'Fakultas Kesehatan Masyarakat' },
        { value: 'fpi', label: 'Fakultas Perikanan dan Ilmu Kelautan' },
        { value: 'sv', label: 'Sekolah Vokasi' }
      ]
    }
  },
  {
    type: 'prodi',
    label: 'Program Studi',
    icon: 'graduation-cap',
    category: 'special',
    defaultConfig: {
      label: 'Program Studi',
      placeholder: 'Masukkan program studi'
    }
  }
]

// ================================
// Fakultas & Prodi Data
// ================================

export const FAKULTAS_LIST = [
  { value: 'ft', label: 'Fakultas Teknik' },
  { value: 'fk', label: 'Fakultas Kedokteran' },
  { value: 'fh', label: 'Fakultas Hukum' },
  { value: 'feb', label: 'Fakultas Ekonomika dan Bisnis' },
  { value: 'fisip', label: 'Fakultas Ilmu Sosial dan Ilmu Politik' },
  { value: 'fib', label: 'Fakultas Ilmu Budaya' },
  { value: 'fpsi', label: 'Fakultas Psikologi' },
  { value: 'fpp', label: 'Fakultas Peternakan dan Pertanian' },
  { value: 'fsm', label: 'Fakultas Sains dan Matematika' },
  { value: 'fkm', label: 'Fakultas Kesehatan Masyarakat' },
  { value: 'fpi', label: 'Fakultas Perikanan dan Ilmu Kelautan' },
  { value: 'sv', label: 'Sekolah Vokasi' }
]

// ================================
// Default Form Settings
// ================================

export const DEFAULT_FORM_SETTINGS: FormSettings = {
  submitButtonText: 'Daftar',
  successMessage: 'Pendaftaran berhasil! Terima kasih telah mendaftar.',
  allowMultipleSubmissions: false,
  showConfirmation: true,
  confirmationMessage: 'Apakah Anda yakin ingin mengirim formulir ini?'
}

// ================================
// Helper Functions
// ================================

/**
 * Generate a unique field ID
 */
export function generateFieldId(): string {
  return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create a new field from template
 */
export function createFieldFromTemplate(
  template: FieldTemplate,
  order: number
): FormField {
  return {
    id: generateFieldId(),
    type: template.type,
    label: template.label,
    required: false,
    order,
    ...template.defaultConfig
  }
}

/**
 * Create an empty form config
 */
export function createEmptyFormConfig(): FormConfig {
  return {
    fields: [],
    settings: { ...DEFAULT_FORM_SETTINGS },
    version: 1
  }
}

/**
 * Validate form config structure
 */
export function isValidFormConfig(config: unknown): config is FormConfig {
  if (!config || typeof config !== 'object') return false
  const c = config as Record<string, unknown>
  return Array.isArray(c.fields) && typeof c.settings === 'object'
}
