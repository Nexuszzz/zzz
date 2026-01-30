'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { 
  Upload, 
  X, 
  Loader2, 
  ImageIcon,
  GripVertical,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
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
  category?: string; // subdirectory for upload
  className?: string;
}

interface UploadedImage {
  url: string;
  uploading?: boolean;
  error?: string;
}

export default function ImageUpload({
  value,
  onChange,
  multiple = false,
  maxFiles = 6,
  maxSize = 5,
  accept = 'image/*',
  label,
  error,
  helperText,
  disabled = false,
  category = 'general',
  className,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize value to array
  const images: string[] = value 
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
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.data?.url || null;
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    }
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Filter valid files
    const validFiles = fileArray.filter(file => {
      // Check type
      if (!file.type.startsWith('image/')) {
        return false;
      }
      // Check size
      if (file.size > maxSize * 1024 * 1024) {
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Limit files
    const remainingSlots = multiple ? maxFiles - images.length : 1;
    const filesToUpload = validFiles.slice(0, remainingSlots);

    // Track uploading state
    const uploadIds = filesToUpload.map(() => Math.random().toString());
    setUploadingFiles(prev => {
      const next = new Set(Array.from(prev));
      uploadIds.forEach(id => next.add(id));
      return next;
    });

    // Upload files
    const uploadPromises = filesToUpload.map(async (file, index) => {
      const url = await uploadFile(file);
      setUploadingFiles(prev => {
        const next = new Set(prev);
        next.delete(uploadIds[index]);
        return next;
      });
      return url;
    });

    const urls = await Promise.all(uploadPromises);
    const successUrls = urls.filter((url): url is string => url !== null);

    if (successUrls.length > 0) {
      if (multiple) {
        onChange([...images, ...successUrls]);
      } else {
        onChange(successUrls[0]);
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [disabled, images, multiple, maxFiles, maxSize, category, onChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    if (multiple) {
      const newImages = [...images];
      newImages.splice(index, 1);
      onChange(newImages);
    } else {
      onChange('');
    }
  };

  const isUploading = uploadingFiles.size > 0;
  const canAddMore = multiple ? images.length < maxFiles : images.length === 0;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {multiple && maxFiles && (
            <span className="text-gray-500 font-normal ml-1">
              ({images.length}/{maxFiles})
            </span>
          )}
        </label>
      )}

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className={cn(
          'grid gap-3',
          multiple ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1 max-w-xs'
        )}>
          {images.map((url, index) => (
            <div 
              key={`${url}-${index}`}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
            >
              <Image
                src={url}
                alt={`Uploaded ${index + 1}`}
                fill
                className="object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {multiple && (
                <div className="absolute top-1 left-1 p-1 bg-black/50 text-white rounded text-xs">
                  {index + 1}
                </div>
              )}
            </div>
          ))}

          {/* Upload placeholder while uploading */}
          {Array.from(uploadingFiles).map((id) => (
            <div 
              key={id}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center"
            >
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
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
            error && 'border-red-300 bg-red-50',
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
                  <ImageIcon className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {isDragging ? 'Lepaskan file di sini' : 'Klik atau drag & drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF, WebP (max {maxSize}MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
