/**
 * Public Lomba Registration API
 * 
 * POST /api/lomba/[slug]/register - Submit registration for a lomba
 * GET  /api/lomba/[slug]/register - Check registration status
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { lombaRegistrationBaseSchema } from '@/lib/validations/lomba'
import { generateFormSchema } from '@/lib/form-validation/engine'
import {
  createdResponse,
  errorResponse,
  notFoundResponse,
  successResponse,
  validationErrorFromZod,
} from '@/lib/api/helpers'
import { submissionRateLimiter, getClientIP } from '@/lib/rate-limit'
import { FormConfig } from '@/types/form-builder'

interface RouteParams {
  params: Promise<{ slug: string }>
}

/**
 * POST /api/lomba/[slug]/register
 * Submit a registration for a lomba
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params

    // Rate limiting by IP
    const ip = getClientIP(request)
    const rateLimitResult = submissionRateLimiter.check(ip)
    if (!rateLimitResult.success) {
      return errorResponse(
        'Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit.',
        429
      )
    }

    // Find the lomba
    const lomba = await prisma.lomba.findUnique({
      where: { slug },
      select: {
        id: true,
        nama_lomba: true,
        slug: true,
        status: true,
        deadline: true,
        custom_form: true,
        tipe_pendaftaran: true,
      },
    })

    if (!lomba) {
      return notFoundResponse('Lomba tidak ditemukan')
    }

    // Check if registration is open
    if (lomba.status === 'closed') {
      return errorResponse('Pendaftaran untuk lomba ini sudah ditutup', 400)
    }

    // Check registration type
    if (lomba.tipe_pendaftaran !== 'internal') {
      return errorResponse('Lomba ini tidak menerima pendaftaran internal', 400)
    }

    // Check deadline
    if (lomba.deadline && new Date() > lomba.deadline) {
      return errorResponse('Batas waktu pendaftaran sudah berakhir', 400)
    }

    // Parse request body
    const body = await request.json()

    // Validate base registration fields
    const baseValidation = lombaRegistrationBaseSchema.safeParse(body)
    if (!baseValidation.success) {
      return validationErrorFromZod(baseValidation.error.issues)
    }

    const data = baseValidation.data

    // Check for duplicate registration
    const existingRegistration = await prisma.lombaRegistration.findFirst({
      where: {
        lomba_id: lomba.id,
        OR: [
          { email: data.email },
          { nim: data.nim },
        ],
      },
    })

    if (existingRegistration) {
      return errorResponse(
        'Email atau NIM sudah terdaftar untuk lomba ini',
        409
      )
    }

    // Validate dynamic form fields if custom_form exists
    let customData: Record<string, unknown> = {}
    if (lomba.custom_form) {
      const formConfig = lomba.custom_form as unknown as FormConfig
      
      // Extract form data (everything except base fields)
      const baseFields = ['nama', 'email', 'nim', 'fakultas', 'prodi', 'whatsapp']
      customData = Object.entries(body)
        .filter(([key]) => !baseFields.includes(key))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

      // Validate against dynamic schema
      const formSchema = generateFormSchema(formConfig)
      const formValidation = formSchema.safeParse(customData)
      
      if (!formValidation.success) {
        return validationErrorFromZod(formValidation.error.issues)
      }
      
      customData = formValidation.data as Record<string, unknown>
    }

    // Create registration
    const registration = await prisma.lombaRegistration.create({
      data: {
        lomba_id: lomba.id,
        nama: data.nama,
        email: data.email,
        nim: data.nim,
        fakultas: data.fakultas,
        prodi: data.prodi,
        whatsapp: data.whatsapp,
        custom_data: Object.keys(customData).length > 0 ? (customData as object) : undefined,
        status: 'registered',
      },
    })

    return createdResponse({
      id: registration.id,
      lomba: lomba.nama_lomba,
      nama: registration.nama,
      email: registration.email,
      status: registration.status,
      created_at: registration.created_at,
    }, 'Pendaftaran berhasil!')
  } catch (error) {
    console.error('Error submitting registration:', error)
    return errorResponse('Gagal menyimpan pendaftaran. Silakan coba lagi.')
  }
}

/**
 * GET /api/lomba/[slug]/register
 * Get registration status by email/nim
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    const nim = searchParams.get('nim')

    if (!email && !nim) {
      return errorResponse('Email atau NIM diperlukan untuk cek status', 400)
    }

    // Find the lomba
    const lomba = await prisma.lomba.findUnique({
      where: { slug },
      select: { id: true, nama_lomba: true },
    })

    if (!lomba) {
      return notFoundResponse('Lomba tidak ditemukan')
    }

    // Find registration
    const registration = await prisma.lombaRegistration.findFirst({
      where: {
        lomba_id: lomba.id,
        OR: [
          ...(email ? [{ email }] : []),
          ...(nim ? [{ nim }] : []),
        ],
      },
      select: {
        id: true,
        nama: true,
        email: true,
        nim: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    })

    if (!registration) {
      return notFoundResponse('Pendaftaran tidak ditemukan')
    }

    return successResponse({
      lomba: lomba.nama_lomba,
      registration,
    })
  } catch (error) {
    console.error('Error checking registration:', error)
    return errorResponse('Gagal mengecek status pendaftaran')
  }
}
