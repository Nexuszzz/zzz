/**
 * Lomba Registration Admin API
 * 
 * GET   /api/admin/lomba/[id]/registrations - List all registrations for a lomba
 * PATCH /api/admin/lomba/[id]/registrations - Batch update registration status
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth } from '@/lib/auth/jwt'
import { paginationSchema } from '@/lib/validations/common'
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
  calculatePagination,
  parseSearchParams,
} from '@/lib/api/helpers'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/lomba/[id]/registrations
 * List all registrations for a specific lomba with pagination
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const lombaId = parseInt(id, 10)
    
    if (isNaN(lombaId)) {
      return errorResponse('ID Lomba tidak valid', 400)
    }

    // Verify lomba exists
    const lomba = await prisma.lomba.findUnique({
      where: { id: lombaId },
      select: { id: true, nama_lomba: true },
    })

    if (!lomba) {
      return notFoundResponse('Lomba tidak ditemukan')
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const queryParams = parseSearchParams(searchParams, [
      'page', 'limit', 'search', 'status', 'sort', 'order'
    ])

    const validation = paginationSchema.safeParse({
      page: queryParams.page ? parseInt(queryParams.page) : 1,
      limit: queryParams.limit ? parseInt(queryParams.limit) : 20,
    })

    const page = validation.success ? validation.data.page : 1
    const limit = validation.success ? validation.data.limit : 20
    const search = queryParams.search || ''
    const status = queryParams.status || ''
    const sort = queryParams.sort || 'created_at'
    const order = (queryParams.order || 'desc') as 'asc' | 'desc'

    // Build where clause
    interface WhereClause {
      lomba_id: number
      status?: string
      OR?: Array<{ nama?: { contains: string; mode: 'insensitive' }; nim?: { contains: string; mode: 'insensitive' }; email?: { contains: string; mode: 'insensitive' } }>
    }
    
    const where: WhereClause = {
      lomba_id: lombaId,
    }

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { nim: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    // Get total count
    const total = await prisma.lombaRegistration.count({ where })

    // Get registrations
    const registrations = await prisma.lombaRegistration.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
    })

    const pagination = calculatePagination(total, page, limit)

    return successResponse({
      lomba: lomba,
      data: registrations,
    }, pagination)
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return errorResponse('Gagal mengambil data pendaftaran')
  }
}

/**
 * PATCH /api/admin/lomba/[id]/registrations
 * Update registration status (batch update)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const lombaId = parseInt(id, 10)
    
    if (isNaN(lombaId)) {
      return errorResponse('ID Lomba tidak valid', 400)
    }

    // Verify lomba exists
    const lomba = await prisma.lomba.findUnique({
      where: { id: lombaId },
      select: { id: true },
    })

    if (!lomba) {
      return notFoundResponse('Lomba tidak ditemukan')
    }

    const body = await request.json()
    const { registrationIds, status } = body

    if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
      return errorResponse('registrationIds harus berupa array dengan minimal 1 item', 400)
    }

    if (!status || !['registered', 'approved', 'rejected'].includes(status)) {
      return errorResponse('status harus berupa registered, approved, atau rejected', 400)
    }

    // Update registrations
    const result = await prisma.lombaRegistration.updateMany({
      where: {
        id: { in: registrationIds },
        lomba_id: lombaId,
      },
      data: {
        status,
        updated_at: new Date(),
      },
    })

    return successResponse({
      updated: result.count,
      message: `${result.count} pendaftaran berhasil diperbarui`,
    })
  } catch (error) {
    console.error('Error updating registrations:', error)
    return errorResponse('Gagal memperbarui status pendaftaran')
  }
}
