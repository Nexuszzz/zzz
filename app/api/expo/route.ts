/**
 * Public Expo API
 * 
 * GET /api/expo - Get list of public expo events
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const status = searchParams.get('status')
    const featured = searchParams.get('featured') === 'true'
    const search = searchParams.get('search')
    const slug = searchParams.get('slug')

    // Build where clause
    const where: Record<string, unknown> = {
      is_deleted: false,
    }

    if (slug) {
      where.slug = slug
    } else {
      if (status) where.status = status
      if (featured) where.is_featured = true
      
      if (search) {
        where.OR = [
          { nama_event: { contains: search, mode: 'insensitive' } },
          { tema: { contains: search, mode: 'insensitive' } },
        ]
      }
    }

    // Query expo - always select all fields for simplicity
    const [expoList, total] = await Promise.all([
      prisma.expo.findMany({
        where: where as any,
        orderBy: { tanggal_mulai: 'desc' },
        skip: slug ? 0 : (page - 1) * limit,
        take: slug ? 1 : limit,
      }),
      slug ? Promise.resolve(1) : prisma.expo.count({ where: where as any }),
    ])

    // Helper function for date formatting
    const formatTanggal = (start: Date, end?: Date) => {
      const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
      
      if (end && end.getTime() !== start.getTime()) {
        return `${start.toLocaleDateString('id-ID', { day: 'numeric' })}-${end.toLocaleDateString('id-ID', opts)}`
      }
      return start.toLocaleDateString('id-ID', opts)
    }

    // Transform data for frontend compatibility
    const data = expoList.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.nama_event,
      nama_event: item.nama_event,
      tema: item.tema || '',
      tanggal: formatTanggal(item.tanggal_mulai, item.tanggal_selesai),
      tanggalMulai: item.tanggal_mulai.toISOString(),
      tanggalSelesai: item.tanggal_selesai.toISOString(),
      lokasi: item.lokasi,
      deskripsi: item.deskripsi || '',
      isFree: item.biaya_partisipasi === 0,
      isFeatured: item.is_featured,
      status: item.status,
      posterUrl: item.poster || null,
      registrationOpen: item.registration_open,
      // Detail fields (always included)
      alamatLengkap: item.alamat_lengkap || '',
      tipe_pendaftaran: item.tipe_pendaftaran,
      link_pendaftaran: item.link_pendaftaran || null,
      custom_form: item.custom_form,
      registration_deadline: item.registration_deadline?.toISOString() || null,
      max_participants: item.max_participants,
      biaya_partisipasi: item.biaya_partisipasi,
      highlights: item.highlights,
      rundown: item.rundown,
      galeri: item.galeri,
      benefit: item.benefit || '',
      website_resmi: item.website_resmi || null,
    }))

    return NextResponse.json({
      success: true,
      data,
      pagination: slug ? undefined : {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching expo:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data expo' },
      { status: 500 }
    )
  }
}

