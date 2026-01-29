'use client'

/**
 * Form Field Components
 * 
 * Individual field components for rendering different input types.
 */

import React from 'react'
import { FormField, FieldProps, FAKULTAS_LIST } from '@/types/form-builder'

// ================================
// Text Input
// ================================

export function TextField({ field, value, error, onChange, onBlur, disabled }: FieldProps) {
  return (
    <input
      type="text"
      id={field.id}
      name={field.id}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled || field.disabled}
      readOnly={field.readOnly}
      placeholder={field.placeholder}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
        ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
        ${disabled || field.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        ${field.className || ''}`}
      {...field.attributes}
    />
  )
}

// ================================
// Textarea
// ================================

export function TextareaField({ field, value, error, onChange, onBlur, disabled }: FieldProps) {
  return (
    <textarea
      id={field.id}
      name={field.id}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled || field.disabled}
      readOnly={field.readOnly}
      placeholder={field.placeholder}
      rows={4}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-y
        ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
        ${disabled || field.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        ${field.className || ''}`}
      {...field.attributes}
    />
  )
}

// ================================
// Email Input
// ================================

export function EmailField({ field, value, error, onChange, onBlur, disabled }: FieldProps) {
  return (
    <input
      type="email"
      id={field.id}
      name={field.id}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled || field.disabled}
      placeholder={field.placeholder || 'email@example.com'}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
        ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
        ${disabled || field.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    />
  )
}

// ================================
// Number Input
// ================================

export function NumberField({ field, value, error, onChange, onBlur, disabled }: FieldProps) {
  return (
    <input
      type="number"
      id={field.id}
      name={field.id}
      value={value !== undefined ? String(value) : ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
      onBlur={onBlur}
      disabled={disabled || field.disabled}
      placeholder={field.placeholder}
      min={field.validation?.min}
      max={field.validation?.max}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
        ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
        ${disabled || field.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    />
  )
}

// ================================
// Phone Input
// ================================

export function PhoneField({ field, value, error, onChange, onBlur, disabled }: FieldProps) {
  return (
    <input
      type="tel"
      id={field.id}
      name={field.id}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9+]/g, ''))}
      onBlur={onBlur}
      disabled={disabled || field.disabled}
      placeholder={field.placeholder || '08xxxxxxxxxx'}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
        ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
        ${disabled || field.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    />
  )
}

// ================================
// Select Dropdown
// ================================

export function SelectField({ field, value, error, onChange, onBlur, disabled }: FieldProps) {
  const options = field.options || []
  
  return (
    <select
      id={field.id}
      name={field.id}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled || field.disabled}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
        ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
        ${disabled || field.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    >
      <option value="">{field.placeholder || 'Pilih...'}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

// ================================
// Radio Buttons
// ================================

export function RadioField({ field, value, error, onChange, disabled }: FieldProps) {
  const options = field.options || []
  
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-center gap-2 cursor-pointer ${opt.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="radio"
            name={field.id}
            value={opt.value}
            checked={value === opt.value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || field.disabled || opt.disabled}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="text-gray-700">{opt.label}</span>
        </label>
      ))}
    </div>
  )
}

// ================================
// Checkbox (single or multiple)
// ================================

export function CheckboxField({ field, value, error, onChange, disabled }: FieldProps) {
  const options = field.options || []
  const selectedValues = Array.isArray(value) ? value : []
  
  const handleChange = (optValue: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedValues, optValue])
    } else {
      onChange(selectedValues.filter((v) => v !== optValue))
    }
  }
  
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-center gap-2 cursor-pointer ${opt.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="checkbox"
            name={field.id}
            value={opt.value}
            checked={selectedValues.includes(opt.value)}
            onChange={(e) => handleChange(opt.value, e.target.checked)}
            disabled={disabled || field.disabled || opt.disabled}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700">{opt.label}</span>
        </label>
      ))}
    </div>
  )
}

// ================================
// Date Input
// ================================

export function DateField({ field, value, error, onChange, onBlur, disabled }: FieldProps) {
  return (
    <input
      type="date"
      id={field.id}
      name={field.id}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled || field.disabled}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
        ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
        ${disabled || field.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    />
  )
}

// ================================
// Time Input
// ================================

export function TimeField({ field, value, error, onChange, onBlur, disabled }: FieldProps) {
  return (
    <input
      type="time"
      id={field.id}
      name={field.id}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled || field.disabled}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
        ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
        ${disabled || field.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    />
  )
}

// ================================
// URL Input
// ================================

export function UrlField({ field, value, error, onChange, onBlur, disabled }: FieldProps) {
  return (
    <input
      type="url"
      id={field.id}
      name={field.id}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled || field.disabled}
      placeholder={field.placeholder || 'https://...'}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
        ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
        ${disabled || field.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    />
  )
}

// ================================
// File Upload
// ================================

export function FileField({ field, value, error, onChange, disabled }: FieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onChange(files[0])
    }
  }
  
  return (
    <div>
      <input
        type="file"
        id={field.id}
        name={field.id}
        onChange={handleChange}
        disabled={disabled || field.disabled}
        accept={field.validation?.allowedFileTypes?.join(',')}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
          ${disabled || field.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
      {field.validation?.maxFileSize && (
        <p className="text-xs text-gray-500 mt-1">
          Max file size: {(field.validation.maxFileSize / 1024 / 1024).toFixed(1)}MB
        </p>
      )}
    </div>
  )
}

// ================================
// NIM Field (special text with validation)
// ================================

export function NimField({ field, value, error, onChange, onBlur, disabled }: FieldProps) {
  return (
    <input
      type="text"
      id={field.id}
      name={field.id}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9A-Za-z]/g, ''))}
      onBlur={onBlur}
      disabled={disabled || field.disabled}
      placeholder={field.placeholder || 'Masukkan NIM'}
      maxLength={20}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
        ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
        ${disabled || field.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    />
  )
}

// ================================
// Fakultas Field (dropdown with predefined options)
// ================================

export function FakultasField({ field, value, error, onChange, onBlur, disabled }: FieldProps) {
  const options = field.options?.length ? field.options : FAKULTAS_LIST
  
  return (
    <select
      id={field.id}
      name={field.id}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled || field.disabled}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
        ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
        ${disabled || field.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    >
      <option value="">Pilih Fakultas...</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

// ================================
// Prodi Field (text input)
// ================================

export function ProdiField({ field, value, error, onChange, onBlur, disabled }: FieldProps) {
  return (
    <input
      type="text"
      id={field.id}
      name={field.id}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled || field.disabled}
      placeholder={field.placeholder || 'Masukkan program studi'}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
        ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
        ${disabled || field.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    />
  )
}

// ================================
// Field Component Map
// ================================

export const FIELD_COMPONENTS: Record<string, React.FC<FieldProps>> = {
  text: TextField,
  textarea: TextareaField,
  email: EmailField,
  number: NumberField,
  phone: PhoneField,
  select: SelectField,
  radio: RadioField,
  checkbox: CheckboxField,
  multiselect: CheckboxField, // Same as checkbox for now
  date: DateField,
  time: TimeField,
  datetime: DateField, // Same as date for now
  url: UrlField,
  file: FileField,
  nim: NimField,
  fakultas: FakultasField,
  prodi: ProdiField,
  hidden: () => null
}

// ================================
// Field Wrapper Component
// ================================

interface FieldWrapperProps {
  field: FormField
  value: unknown
  error?: string
  touched?: boolean
  onChange: (value: unknown) => void
  onBlur: () => void
  disabled?: boolean
}

export function FieldWrapper({
  field,
  value,
  error,
  touched,
  onChange,
  onBlur,
  disabled
}: FieldWrapperProps) {
  const FieldComponent = FIELD_COMPONENTS[field.type]
  
  if (!FieldComponent) {
    console.warn(`Unknown field type: ${field.type}`)
    return null
  }
  
  const showError = touched && error
  
  return (
    <div className={`mb-4 ${field.colSpan ? `col-span-${field.colSpan}` : 'col-span-12'}`}>
      <label
        htmlFor={field.id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <FieldComponent
        field={field}
        value={value}
        error={error}
        touched={touched}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
      />
      
      {field.helpText && !showError && (
        <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
      )}
      
      {showError && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}
