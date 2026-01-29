'use client'

/**
 * Form Builder Component
 * 
 * Drag-and-drop form builder for admin to create custom forms.
 */

import React, { useState, useCallback } from 'react'
import {
  FormConfig,
  FormField,
  FieldTemplate,
  FIELD_TEMPLATES,
  createFieldFromTemplate,
  createEmptyFormConfig,
  DEFAULT_FORM_SETTINGS
} from '@/types/form-builder'

// ================================
// Types
// ================================

interface FormBuilderProps {
  /** Initial form configuration */
  initialConfig?: FormConfig
  /** Save handler */
  onSave: (config: FormConfig) => Promise<void>
  /** Cancel handler */
  onCancel?: () => void
}

// ================================
// Field Palette Component
// ================================

interface FieldPaletteProps {
  onAddField: (template: FieldTemplate) => void
}

function FieldPalette({ onAddField }: FieldPaletteProps) {
  const categories = [
    { id: 'basic', label: 'Basic', icon: '📝' },
    { id: 'contact', label: 'Contact', icon: '📧' },
    { id: 'selection', label: 'Selection', icon: '☑️' },
    { id: 'datetime', label: 'Date/Time', icon: '📅' },
    { id: 'file', label: 'File', icon: '📎' },
    { id: 'special', label: 'APM Fields', icon: '🎓' }
  ]

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold text-gray-800 mb-3">Field Types</h3>
      
      {categories.map((category) => {
        const fields = FIELD_TEMPLATES.filter((t) => t.category === category.id)
        if (fields.length === 0) return null
        
        return (
          <div key={category.id} className="mb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </div>
            <div className="space-y-1">
              {fields.map((template) => (
                <button
                  key={template.type}
                  type="button"
                  onClick={() => onAddField(template)}
                  className="w-full px-3 py-2 text-left text-sm bg-gray-50 hover:bg-blue-50 
                    hover:text-blue-700 rounded border border-transparent hover:border-blue-200 
                    transition flex items-center gap-2"
                >
                  <span className="text-gray-400">+</span>
                  <span>{template.label}</span>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ================================
// Field Editor Component
// ================================

interface FieldEditorProps {
  field: FormField
  onUpdate: (field: FormField) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
}

function FieldEditor({
  field,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown
}: FieldEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleChange = (key: keyof FormField, value: unknown) => {
    onUpdate({ ...field, [key]: value })
  }

  return (
    <div className="bg-white rounded-lg border p-4 mb-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Move buttons */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className={`text-xs px-1 ${canMoveUp ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
            >
              ▲
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className={`text-xs px-1 ${canMoveDown ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
            >
              ▼
            </button>
          </div>
          
          {/* Field info */}
          <div>
            <div className="font-medium text-gray-800">{field.label}</div>
            <div className="text-xs text-gray-500">
              {field.type} {field.required && '• Required'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            {isExpanded ? 'Collapse' : 'Edit'}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Expanded Editor */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-4">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => handleChange('label', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Placeholder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Help Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Help Text
            </label>
            <input
              type="text"
              value={field.helpText || ''}
              onChange={(e) => handleChange('helpText', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Required */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => handleChange('required', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Required field</span>
            </label>
          </div>

          {/* Options (for select, radio, checkbox) */}
          {['select', 'radio', 'checkbox', 'multiselect'].includes(field.type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options (one per line, format: value|label)
              </label>
              <textarea
                value={
                  field.options
                    ?.map((o) => `${o.value}|${o.label}`)
                    .join('\n') || ''
                }
                onChange={(e) => {
                  const lines = e.target.value.split('\n')
                  const options = lines
                    .filter((l) => l.trim())
                    .map((l) => {
                      const [value, label] = l.split('|')
                      return { value: value.trim(), label: (label || value).trim() }
                    })
                  handleChange('options', options)
                }}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                placeholder="value1|Label 1&#10;value2|Label 2"
              />
            </div>
          )}

          {/* Column Span */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Column Span (1-12)
            </label>
            <select
              value={field.colSpan || 12}
              onChange={(e) => handleChange('colSpan', parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value={12}>Full Width (12)</option>
              <option value={6}>Half (6)</option>
              <option value={4}>Third (4)</option>
              <option value={3}>Quarter (3)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

// ================================
// Settings Editor Component
// ================================

interface SettingsEditorProps {
  config: FormConfig
  onUpdate: (config: FormConfig) => void
}

function SettingsEditor({ config, onUpdate }: SettingsEditorProps) {
  const handleChange = (key: keyof typeof config.settings, value: unknown) => {
    onUpdate({
      ...config,
      settings: { ...config.settings, [key]: value }
    })
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold text-gray-800 mb-4">Form Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Submit Button Text
          </label>
          <input
            type="text"
            value={config.settings.submitButtonText}
            onChange={(e) => handleChange('submitButtonText', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Success Message
          </label>
          <textarea
            value={config.settings.successMessage}
            onChange={(e) => handleChange('successMessage', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.settings.allowMultipleSubmissions}
              onChange={(e) => handleChange('allowMultipleSubmissions', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Allow multiple submissions</span>
          </label>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.settings.showConfirmation ?? true}
              onChange={(e) => handleChange('showConfirmation', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Show confirmation before submit</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Redirect URL (optional)
          </label>
          <input
            type="url"
            value={config.settings.redirectUrl || ''}
            onChange={(e) => handleChange('redirectUrl', e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>
    </div>
  )
}

// ================================
// Main Form Builder Component
// ================================

export function FormBuilder({ initialConfig, onSave, onCancel }: FormBuilderProps) {
  const [config, setConfig] = useState<FormConfig>(
    initialConfig || createEmptyFormConfig()
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'fields' | 'settings'>('fields')

  // Add new field
  const handleAddField = useCallback((template: FieldTemplate) => {
    const newField = createFieldFromTemplate(template, config.fields.length)
    setConfig((prev) => ({
      ...prev,
      fields: [...prev.fields, newField]
    }))
  }, [config.fields.length])

  // Update field
  const handleUpdateField = useCallback((index: number, field: FormField) => {
    setConfig((prev) => ({
      ...prev,
      fields: prev.fields.map((f, i) => (i === index ? field : f))
    }))
  }, [])

  // Delete field
  const handleDeleteField = useCallback((index: number) => {
    setConfig((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }))
  }, [])

  // Move field up
  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return
    setConfig((prev) => {
      const newFields = [...prev.fields]
      const temp = newFields[index]
      newFields[index] = newFields[index - 1]
      newFields[index - 1] = temp
      // Update order values
      return {
        ...prev,
        fields: newFields.map((f, i) => ({ ...f, order: i }))
      }
    })
  }, [])

  // Move field down
  const handleMoveDown = useCallback((index: number) => {
    if (index === config.fields.length - 1) return
    setConfig((prev) => {
      const newFields = [...prev.fields]
      const temp = newFields[index]
      newFields[index] = newFields[index + 1]
      newFields[index + 1] = temp
      // Update order values
      return {
        ...prev,
        fields: newFields.map((f, i) => ({ ...f, order: i }))
      }
    })
  }, [config.fields.length])

  // Save
  const handleSave = async () => {
    if (config.fields.length === 0) {
      setError('Form harus memiliki minimal 1 field')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await onSave(config)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan form')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Form Builder</h2>
          <div className="flex items-center gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Form'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar - Field Palette */}
        <div className="w-64 p-4 border-r bg-gray-50 min-h-screen">
          <FieldPalette onAddField={handleAddField} />
        </div>

        {/* Center - Form Preview/Editor */}
        <div className="flex-1 p-6">
          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('fields')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'fields'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border'
              }`}
            >
              Fields ({config.fields.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border'
              }`}
            >
              Settings
            </button>
          </div>

          {/* Content */}
          {activeTab === 'fields' ? (
            <div>
              {config.fields.length === 0 ? (
                <div className="bg-white rounded-lg border-2 border-dashed p-12 text-center text-gray-500">
                  <p className="text-lg mb-2">Belum ada field</p>
                  <p className="text-sm">
                    Klik field type di sidebar kiri untuk menambahkan field
                  </p>
                </div>
              ) : (
                <div>
                  {config.fields.map((field, index) => (
                    <FieldEditor
                      key={field.id}
                      field={field}
                      onUpdate={(f) => handleUpdateField(index, f)}
                      onDelete={() => handleDeleteField(index)}
                      onMoveUp={() => handleMoveUp(index)}
                      onMoveDown={() => handleMoveDown(index)}
                      canMoveUp={index > 0}
                      canMoveDown={index < config.fields.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <SettingsEditor config={config} onUpdate={setConfig} />
          )}
        </div>
      </div>
    </div>
  )
}

export default FormBuilder
