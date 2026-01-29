/**
 * Expo Admin API - CRUD Operations
 * 
 * GET  /api/admin/expo - List all expo events
 * POST /api/admin/expo - Create new expo event
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth } from '@/lib/auth/jwt'
import { createExpoSchema, queryExpoSchema } from '@/lib/validations/expo'
import {
  successResponse,
  createdResponse,
  errorResponse,
  unauthorizedResponse,
  generateSlug,
  calculatePagination,
  parseSearchParams,
  validationErrorFromZod,
} from '@/lib/api/helpers'

/**
 * GET /api/admin/expo
 * List all expo events with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return unauthorizedResponse()
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const params = parseSearchParams(searchParams, [
      'page', 'limit', 'search', 'status', 'sort', 'order'
    ])

    const validation = queryExpoSchema.safeParse({
      page: params.page ? parseInt(params.page) : 1,
      limit: params.limit ? parseInt(params.limit) : 10,
      search: params.search || undefined,
      status: params.status || undefined,
      sort: params.sort || 'created_at',
      order: params.order || 'desc',
    })

    if (!validation.success) {
      return validationErrorFromZod(validation.error.issues)
    }

    const { page, limit, search, status, sort, order } = validation.data

    // Build where clause
    interface WhereClause {
      is_deleted?: boolean
      status?: string
      OR?: Array<{
        nama_event?: { contains: string; mode: 'insensitive' }
        tema?: { contains: string; mode: 'insensitive' }
        deskripsi?: { contains: string; mode: 'insensitive' }
      }>
    }
    
    const where: WhereClause = {
      is_deleted: false,
    }

    if (search) {
      where.OR = [
        { nama_event: { contains: search, mode: 'insensitive' } },
        { tema: { contains: search, mode: 'insensitive' } },
        { deskripsi: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    // Get total count
    const total = await prisma.expo.count({ where })

    // Get paginated data
    const data = await prisma.expo.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        nama_event: true,
        slug: true,
        tema: true,
        tanggal_mulai: true,
        tanggal_selesai: true,
        lokasi: true,
        status: true,
        is_featured: true,
        registration_open: true,
        registration_deadline: true,
        max_participants: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: { registrations: true }
        }
      },
    })

    // Transform for response
    const transformedData = data.map(item => ({
      id: item.id,
      namaEvent: item.nama_event,
      slug: item.slug,
      tema: item.tema,
      tanggalMulai: item.tanggal_mulai?.toISOString() || null,
      tanggalSelesai: item.tanggal_selesai?.toISOString() || null,
      lokasi: item.lokasi,
      status: item.status,
      isFeatured: item.is_featured,
      registrationOpen: item.registration_open,
      registrationDeadline: item.registration_deadline?.toISOString() || null,
      maxParticipants: item.max_participants,
      dateCreated: item.created_at.toISOString(),
      registrationCount: item._count.registrations,
    }))

    const pagination = calculatePagination(total, page, limit)

    // Return data as array directly (not nested)
    return NextResponse.json({
      success: true,
      data: transformedData,
      meta: pagination,
    })
  } catch (error) {
    console.error('Error fetching expo:', error)
    return errorResponse('Gagal mengambil data expo')
  }
}

/**
 * POST /api/admin/expo
 * Create a new expo event
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    console.log('[Expo] Create request body:', JSON.stringify(body, null, 2))

    // Validate input
    const validation = createExpoSchema.safeParse(body)
    if (!validation.success) {
      console.log('[Expo] Validation errors:', JSON.stringify(validation.error.issues, null, 2))
      return validationErrorFromZod(validation.error.issues)
    }

    const data = validation.data

    // Generate slug
    let slug = data.slug
    if (!slug) {
      slug = generateSlug(data.nama_event)
      const existing = await prisma.expo.findUnique({ where: { slug } })
      if (existing) {
        slug = `${slug}-${Date.now()}`
      }
    } else {
      const existing = await prisma.expo.findUnique({ where: { slug } })
      if (existing) {
        return errorResponse('Slug sudah digunakan', 400)
      }
    }

    // Create expo
    const expo = await prisma.expo.create({
      data: {
        nama_event: data.nama_event,
        slug,
        tema: data.tema || null,
        tanggal_mulai: new Date(data.tanggal_mulai),
        tanggal_selesai: new Date(data.tanggal_selesai),
        lokasi: data.lokasi,
        alamat_lengkap: data.alamat_lengkap || null,
        deskripsi: data.deskripsi || null,
        poster: data.poster || null,
        galeri: data.galeri || [],
        status: data.status || 'upcoming',
        is_featured: data.is_featured || false,
        tipe_pendaftaran: data.tipe_pendaftaran || 'none',
        link_pendaftaran: data.link_pendaftaran || null,
        registration_open: data.registration_open ?? false,
        registration_deadline: data.registration_deadline 
          ? new Date(data.registration_deadline) 
          : null,
        max_participants: data.max_participants || null,
        biaya_partisipasi: data.biaya_partisipasi || 0,
        custom_form: data.custom_form || undefined,
        highlights: data.highlights || undefined,
        rundown: data.rundown || undefined,
        benefit: data.benefit || null,
        website_resmi: data.website_resmi || null,
      },
    })

    return createdResponse(expo, 'Expo berhasil dibuat')
  } catch (error) {
    console.error('Error creating expo:', error)
    
    // Check for unique constraint violation
    if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2002') {
      return errorResponse('Slug sudah digunakan', 400)
    }
    
    return errorResponse('Gagal membuat expo')
  }
}

