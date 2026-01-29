/**
 * Expo Registrations Admin API
 * 
 * GET   /api/admin/expo/[id]/registrations - List all registrations for an expo
 * PATCH /api/admin/expo/[id]/registrations - Batch update registration status
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
 * GET /api/admin/expo/[id]/registrations
 * List all registrations for a specific expo with pagination
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const expoId = parseInt(id, 10)
    
    if (isNaN(expoId)) {
      return errorResponse('ID Expo tidak valid', 400)
    }

    // Verify expo exists
    const expo = await prisma.expo.findUnique({
      where: { id: expoId },
      select: { id: true, nama_event: true },
    })

    if (!expo) {
      return notFoundResponse('Expo tidak ditemukan')
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
      expo_id: number
      status?: string
      OR?: Array<{ 
        nama?: { contains: string; mode: 'insensitive' }
        nim?: { contains: string; mode: 'insensitive' }
        email?: { contains: string; mode: 'insensitive' }
        project_name?: { contains: string; mode: 'insensitive' }
      }>
    }
    
    const where: WhereClause = {
      expo_id: expoId,
    }

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { nim: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { project_name: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    // Get total count
    const total = await prisma.expoRegistration.count({ where })

    // Get registrations
    const registrations = await prisma.expoRegistration.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
    })

    const pagination = calculatePagination(total, page, limit)

    // Get stats by status
    const statusStats = await prisma.expoRegistration.groupBy({
      by: ['status'],
      where: { expo_id: expoId },
      _count: { _all: true },
    })

    const stats = statusStats.reduce((acc, item) => ({
      ...acc,
      [item.status]: item._count._all,
    }), {} as Record<string, number>)

    return successResponse({
      expo,
      data: registrations,
      stats,
    }, pagination)
  } catch (error) {
    console.error('Error fetching expo registrations:', error)
    return errorResponse('Gagal mengambil data pendaftaran expo')
  }
}

/**
 * PATCH /api/admin/expo/[id]/registrations
 * Batch update registration status
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const expoId = parseInt(id, 10)
    
    if (isNaN(expoId)) {
      return errorResponse('ID Expo tidak valid', 400)
    }

    // Verify expo exists
    const expo = await prisma.expo.findUnique({
      where: { id: expoId },
      select: { id: true },
    })

    if (!expo) {
      return notFoundResponse('Expo tidak ditemukan')
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
    const result = await prisma.expoRegistration.updateMany({
      where: {
        id: { in: registrationIds },
        expo_id: expoId,
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
    console.error('Error updating expo registrations:', error)
    return errorResponse('Gagal memperbarui status pendaftaran')
  }
}
