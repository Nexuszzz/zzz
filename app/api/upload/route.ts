/**
 * File Upload API
 * 
 * POST /api/upload - Upload files (images, documents)
 * 
 * Supports:
 * - Single file upload
 * - Multiple files upload (use 'files' field)
 * - Images (poster, gallery): max 5MB
 * - Documents (PDF, DOC): max 10MB
 * - Subdirectories: lomba, expo, prestasi, general
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { requireAuth } from '@/lib/auth/jwt'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api/helpers'

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_DOC_SIZE = 10 * 1024 * 1024 // 10MB

interface UploadResult {
  filename: string;
  url: string;
  size: number;
  type: string;
}

/**
 * Process and save a single file
 */
async function processFile(file: File, category: string): Promise<UploadResult> {
  // Validate file type
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
  const isDoc = ALLOWED_DOC_TYPES.includes(file.type)

  if (!isImage && !isDoc) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP, PDF, DOC, DOCX')
  }

  // Validate file size
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE
  if (file.size > maxSize) {
    throw new Error(`File too large. Max size: ${maxSize / 1024 / 1024}MB`)
  }

  // Generate unique filename
  const ext = path.extname(file.name) || (isImage ? '.jpg' : '.pdf')
  const filename = `${uuidv4()}${ext}`
  
  // Determine upload directory
  const uploadDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    category
  )

  // Create directory if not exists
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }

  // Save file
  const filePath = path.join(uploadDir, filename)
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  await writeFile(filePath, buffer)

  // Generate public URL
  const publicUrl = `/uploads/${category}/${filename}`

  return {
    filename,
    url: publicUrl,
    size: file.size,
    type: file.type,
  }
}

/**
 * POST /api/upload
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check - optional for public uploads
    const session = await requireAuth(request).catch(() => null)
    
    // Get form data
    const formData = await request.formData()
    const category = formData.get('category') as string || 'general'

    // Check for single file or multiple files
    const singleFile = formData.get('file') as File | null
    const multipleFiles = formData.getAll('files') as File[]

    // Collect all files to process
    const filesToProcess: File[] = []
    
    if (singleFile && singleFile.size > 0) {
      filesToProcess.push(singleFile)
    }
    
    if (multipleFiles.length > 0) {
      for (const file of multipleFiles) {
        if (file && file.size > 0) {
          filesToProcess.push(file)
        }
      }
    }

    if (filesToProcess.length === 0) {
      return errorResponse('No file uploaded', 400)
    }

    // Process all files
    const results: UploadResult[] = []
    const errors: string[] = []

    for (const file of filesToProcess) {
      try {
        const result = await processFile(file, category)
        results.push(result)
      } catch (err) {
        errors.push(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    if (results.length === 0) {
      return errorResponse(errors.join(', ') || 'All uploads failed', 400)
    }

    // Return appropriate response
    if (filesToProcess.length === 1) {
      // Single file response (backward compatible)
      return successResponse({
        ...results[0],
        category,
        uploadedBy: session?.id || 'anonymous',
        uploadedAt: new Date().toISOString(),
        message: 'File uploaded successfully',
      })
    } else {
      // Multiple files response
      return successResponse({
        files: results,
        count: results.length,
        errors: errors.length > 0 ? errors : undefined,
        category,
        uploadedBy: session?.id || 'anonymous',
        uploadedAt: new Date().toISOString(),
        message: `${results.length} file(s) uploaded successfully`,
      })
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return errorResponse('Failed to upload file')
  }
}

/**
 * GET /api/upload
 * List uploaded files (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return unauthorizedResponse()
    }

    // For now, just return a message
    // In production, you'd list files from a database or storage
    return successResponse({
      message: 'File listing not implemented. Files are stored in /public/uploads/',
    })
  } catch (error) {
    console.error('Error listing files:', error)
    return errorResponse('Failed to list files')
  }
}
