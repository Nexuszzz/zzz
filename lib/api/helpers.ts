/**
 * API Response Helpers
 * 
 * Standard response format utilities for API routes.
 */

import { NextResponse } from 'next/server'

// ================================
// Response Types
// ================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: PaginationMeta
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// ================================
// Success Responses
// ================================

export function successResponse<T>(
  data: T,
  meta?: PaginationMeta,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
      message
    },
    { status }
  )
}

export function createdResponse<T>(
  data: T,
  message: string = 'Created successfully'
): NextResponse<ApiResponse<T>> {
  return successResponse(data, undefined, message, 201)
}

// ================================
// Error Responses
// ================================

export function errorResponse(
  error: string,
  status: number = 400,
  details?: Record<string, string[]>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details && { details })
    },
    { status }
  )
}

export function validationError(
  errors: Record<string, string[]>
): NextResponse<ApiResponse> {
  return errorResponse('Validation failed', 400, errors)
}

export function unauthorizedError(
  message: string = 'Unauthorized'
): NextResponse<ApiResponse> {
  return errorResponse(message, 401)
}

export function forbiddenError(
  message: string = 'Forbidden'
): NextResponse<ApiResponse> {
  return errorResponse(message, 403)
}

export function notFoundError(
  message: string = 'Not found'
): NextResponse<ApiResponse> {
  return errorResponse(message, 404)
}

export function serverError(
  message: string = 'Internal server error'
): NextResponse<ApiResponse> {
  return errorResponse(message, 500)
}

// ================================
// Slug Generation
// ================================

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

export function generateUniqueSlug(text: string): string {
  const baseSlug = generateSlug(text)
  const timestamp = Date.now().toString(36)
  return `${baseSlug}-${timestamp}`
}

// ================================
// Pagination Helpers
// ================================

export function calculatePagination(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  }
}

export function getSkip(page: number, limit: number): number {
  return (page - 1) * limit
}

// ================================
// Parse URL Search Params
// ================================

export function parseSearchParams(
  searchParams: URLSearchParams,
  keys?: string[]
): Record<string, string> {
  const params: Record<string, string> = {}
  
  if (keys) {
    keys.forEach(key => {
      const value = searchParams.get(key)
      if (value) params[key] = value
    })
  } else {
    searchParams.forEach((value, key) => {
      params[key] = value
    })
  }
  
  return params
}

// ================================
// Alias functions for compatibility
// ================================

export const unauthorizedResponse = () => unauthorizedError()
export const notFoundResponse = (message?: string) => notFoundError(message)

// Validation error that accepts Zod errors format
export function validationErrorFromZod(
  errors: Array<{ path?: PropertyKey[]; message: string }>
): NextResponse<ApiResponse> {
  const formatted: Record<string, string[]> = {}
  errors.forEach(err => {
    const key = err.path?.map(p => String(p)).join('.') || 'general'
    if (!formatted[key]) formatted[key] = []
    formatted[key].push(err.message)
  })
  return validationError(formatted)
}

