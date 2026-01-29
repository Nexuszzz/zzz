/**
 * Expo Admin API - Single Item Operations
 * 
 * GET    /api/admin/expo/[id] - Get single expo
 * PATCH  /api/admin/expo/[id] - Update expo
 * DELETE /api/admin/expo/[id] - Delete expo
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth } from '@/lib/auth/jwt'
import { updateExpoSchema } from '@/lib/validations/expo'
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
  generateSlug,
  validationErrorFromZod,
} from '@/lib/api/helpers'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/expo/[id]
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

    const expo = await prisma.expo.findUnique({
      where: { id: expoId },
      include: {
        registrations: {
          select: {
            id: true,
            nama: true,
            nim: true,
            email: true,
            status: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
        _count: {
          select: { registrations: true },
        },
      },
    })

    if (!expo) {
      return notFoundResponse('Expo tidak ditemukan')
    }

    return successResponse({
      ...expo,
      registration_count: expo._count.registrations,
    })
  } catch (error) {
    console.error('Error fetching expo:', error)
    return errorResponse('Gagal mengambil data expo')
  }
}

/**
 * PATCH /api/admin/expo/[id]
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

    const existing = await prisma.expo.findUnique({ where: { id: expoId } })
    if (!existing) {
      return notFoundResponse('Expo tidak ditemukan')
    }

    const body = await request.json()
    const validation = updateExpoSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorFromZod(validation.error.issues)
    }

    const data = validation.data

    // Handle slug
    let slug = data.slug
    if (slug && slug !== existing.slug) {
      const existingSlug = await prisma.expo.findFirst({
        where: { slug, id: { not: expoId } },
      })
      if (existingSlug) {
        return errorResponse('Slug sudah digunakan', 400)
      }
    } else if (data.nama_event && data.nama_event !== existing.nama_event && !slug) {
      slug = generateSlug(data.nama_event)
      const existingSlug = await prisma.expo.findFirst({
        where: { slug, id: { not: expoId } },
      })
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (data.nama_event !== undefined) updateData.nama_event = data.nama_event
    if (slug !== undefined) updateData.slug = slug
    if (data.tema !== undefined) updateData.tema = data.tema || null
    if (data.tanggal_mulai !== undefined) updateData.tanggal_mulai = new Date(data.tanggal_mulai)
    if (data.tanggal_selesai !== undefined) {
      updateData.tanggal_selesai = new Date(data.tanggal_selesai)
    }
    if (data.lokasi !== undefined) updateData.lokasi = data.lokasi
    if (data.alamat_lengkap !== undefined) updateData.alamat_lengkap = data.alamat_lengkap || null
    if (data.deskripsi !== undefined) updateData.deskripsi = data.deskripsi || null
    if (data.poster !== undefined) updateData.poster = data.poster || null
    if (data.galeri !== undefined) updateData.galeri = data.galeri || []
    if (data.status !== undefined) updateData.status = data.status
    if (data.is_featured !== undefined) updateData.is_featured = data.is_featured
    if (data.tipe_pendaftaran !== undefined) updateData.tipe_pendaftaran = data.tipe_pendaftaran
    if (data.link_pendaftaran !== undefined) updateData.link_pendaftaran = data.link_pendaftaran || null
    if (data.registration_open !== undefined) updateData.registration_open = data.registration_open
    if (data.registration_deadline !== undefined) {
      updateData.registration_deadline = data.registration_deadline 
        ? new Date(data.registration_deadline) 
        : null
    }
    if (data.max_participants !== undefined) updateData.max_participants = data.max_participants
    if (data.biaya_partisipasi !== undefined) updateData.biaya_partisipasi = data.biaya_partisipasi
    if (data.custom_form !== undefined) updateData.custom_form = data.custom_form || null
    if (data.highlights !== undefined) updateData.highlights = data.highlights || null
    if (data.rundown !== undefined) updateData.rundown = data.rundown || null
    if (data.benefit !== undefined) updateData.benefit = data.benefit || null
    if (data.website_resmi !== undefined) updateData.website_resmi = data.website_resmi || null

    const expo = await prisma.expo.update({
      where: { id: expoId },
      data: updateData,
    })

    return successResponse(expo)
  } catch (error) {
    console.error('Error updating expo:', error)
    
    // Check for unique constraint violation
    if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2002') {
      return errorResponse('Slug sudah digunakan', 400)
    }
    
    return errorResponse('Gagal memperbarui expo')
  }
}

/**
 * DELETE /api/admin/expo/[id]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return unauthorizedResponse()
    }

    if (session.role !== 'superadmin') {
      return errorResponse('Hanya superadmin yang dapat menghapus expo', 403)
    }

    const { id } = await params
    const expoId = parseInt(id, 10)
    
    if (isNaN(expoId)) {
      return errorResponse('ID Expo tidak valid', 400)
    }

    const existing = await prisma.expo.findUnique({
      where: { id: expoId },
      include: { _count: { select: { registrations: true } } },
    })

    if (!existing) {
      return notFoundResponse('Expo tidak ditemukan')
    }

    if (existing._count.registrations > 0) {
      const { searchParams } = new URL(request.url)
      const force = searchParams.get('force') === 'true'
      
      if (!force) {
        return errorResponse(
          `Expo ini memiliki ${existing._count.registrations} pendaftar. Tambahkan ?force=true untuk menghapus paksa.`,
          400
        )
      }
    }

    // Soft delete
    await prisma.expo.update({
      where: { id: expoId },
      data: { is_deleted: true },
    })

    return successResponse({ message: 'Expo berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting expo:', error)
    return errorResponse('Gagal menghapus expo')
  }
}
