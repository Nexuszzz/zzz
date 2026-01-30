'use client';

import { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  X, 
  Loader2, 
  FileText,
  File,
  AlertCircle,
  Plus,
  Edit2,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileWithLabel {
  url: string;
  label: string;
}

interface FileUploadWithLabelsProps {
  value?: FileWithLabel[];
  onChange: (value: FileWithLabel[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  category?: string;
  className?: string;
  labelPlaceholder?: string;
}

export default function FileUploadWithLabels({
  value = [],
  onChange,
  maxFiles = 5,
  maxSize = 10,
  accept = '.pdf',
  label,
  error,
  helperText,
  disabled = false,
  category = 'documents',
  className,
  labelPlaceholder = 'Contoh: Surat Tugas, SK Rektor',
}: FileUploadWithLabelsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      return data.data?.url || null;
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  };

  const processFiles = async (fileList: FileList | File[]) => {
    const fileArray = Array.from(fileList);
    setUploadError(null);
    
    // Filter valid files
    const validFiles = fileArray.filter(file => {
      const allowedTypes = accept.split(',').map(t => t.trim());
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = allowedTypes.some(type => 
        type === fileExt || 
        type === file.type ||
        (type === '.pdf' && file.type === 'application/pdf')
      );
      
      if (!isValidType) {
        setUploadError(`File type not allowed. Accepted: ${accept}`);
        return false;
      }
      
      if (file.size > maxSize * 1024 * 1024) {
        setUploadError(`File too large. Max size: ${maxSize}MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const remainingSlots = maxFiles - value.length;
    const filesToUpload = validFiles.slice(0, remainingSlots);

    setIsUploading(true);

    try {
      const newFiles: FileWithLabel[] = [];
      for (const file of filesToUpload) {
        const url = await uploadFile(file);
        if (url) {
          // Generate default label from filename
          const defaultLabel = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          newFiles.push({
            url,
            label: defaultLabel,
          });
        }
      }

      if (newFiles.length > 0) {
        onChange([...value, ...newFiles]);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [disabled, value, maxFiles, maxSize, category, accept, onChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange(newFiles);
    setUploadError(null);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingLabel(value[index].label);
  };

  const saveLabel = () => {
    if (editingIndex !== null) {
      const newFiles = [...value];
      newFiles[editingIndex] = {
        ...newFiles[editingIndex],
        label: editingLabel.trim() || 'Dokumen',
      };
      onChange(newFiles);
      setEditingIndex(null);
      setEditingLabel('');
    }
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingLabel('');
  };

  const getFileName = (url: string): string => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const canAddMore = value.length < maxFiles;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          <span className="text-gray-500 font-normal ml-1">
            ({value.length}/{maxFiles})
          </span>
        </label>
      )}

      {/* File List with Labels */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, index) => (
            <div 
              key={`${file.url}-${index}`}
              className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg group"
            >
              <div className="p-2 bg-red-100 rounded">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                {editingIndex === index ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingLabel}
                      onChange={(e) => setEditingLabel(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder={labelPlaceholder}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveLabel();
                        if (e.key === 'Escape') cancelEditing();
                      }}
                    />
                    <button
                      type="button"
                      onClick={saveLabel}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      {file.label}
                      {!disabled && (
                        <button
                          type="button"
                          onClick={() => startEditing(index)}
                          className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </p>
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      {getFileName(file.url)}
                    </a>
                  </>
                )}
              </div>
              {editingIndex !== index && !disabled && (
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop Zone */}
      {canAddMore && !disabled && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer',
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100',
            (error || uploadError) && 'border-red-300 bg-red-50',
            isUploading && 'pointer-events-none opacity-60'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />

          <div className="flex items-center justify-center gap-2 text-center">
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span className="text-sm text-gray-600">Mengupload...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Tambah file ({accept.toUpperCase().replace(/\./g, '')}, max {maxSize}MB)
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {(error || uploadError) && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          {error || uploadError}
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && !uploadError && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
