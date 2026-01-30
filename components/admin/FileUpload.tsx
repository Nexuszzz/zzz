'use client';

import { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  X, 
  Loader2, 
  FileText,
  File,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  category?: string;
  className?: string;
  showFileList?: boolean;
}

interface UploadedFile {
  url: string;
  name: string;
  size?: number;
}

export default function FileUpload({
  value,
  onChange,
  multiple = false,
  maxFiles = 5,
  maxSize = 10,
  accept = '.pdf',
  label,
  error,
  helperText,
  disabled = false,
  category = 'documents',
  className,
  showFileList = true,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize value to array
  const files: string[] = value 
    ? (Array.isArray(value) ? value : [value])
    : [];

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
      // Check type
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
      
      // Check size
      if (file.size > maxSize * 1024 * 1024) {
        setUploadError(`File too large. Max size: ${maxSize}MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Limit files
    const remainingSlots = multiple ? maxFiles - files.length : 1;
    const filesToUpload = validFiles.slice(0, remainingSlots);

    setIsUploading(true);

    try {
      // Upload files sequentially
      const urls: string[] = [];
      for (const file of filesToUpload) {
        const url = await uploadFile(file);
        if (url) urls.push(url);
      }

      if (urls.length > 0) {
        if (multiple) {
          onChange([...files, ...urls]);
        } else {
          onChange(urls[0]);
        }
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
  }, [disabled, files, multiple, maxFiles, maxSize, category, accept, onChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    if (multiple) {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      onChange(newFiles);
    } else {
      onChange('');
    }
    setUploadError(null);
  };

  const getFileName = (url: string): string => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const canAddMore = multiple ? files.length < maxFiles : files.length === 0;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {multiple && maxFiles && (
            <span className="text-gray-500 font-normal ml-1">
              ({files.length}/{maxFiles})
            </span>
          )}
        </label>
      )}

      {/* File List */}
      {showFileList && files.length > 0 && (
        <div className="space-y-2">
          {files.map((url, index) => (
            <div 
              key={`${url}-${index}`}
              className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg group"
            >
              <div className="p-2 bg-red-100 rounded">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {getFileName(url)}
                </p>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Lihat file
                </a>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
              {!disabled && (
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
            'relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
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
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />

          <div className="flex flex-col items-center justify-center gap-2 text-center">
            {isUploading ? (
              <>
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-gray-600">Mengupload...</p>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-gray-100">
                  <File className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {isDragging ? 'Lepaskan file di sini' : 'Klik atau drag & drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {accept.toUpperCase().replace(/\./g, '')} (max {maxSize}MB)
                  </p>
                </div>
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
