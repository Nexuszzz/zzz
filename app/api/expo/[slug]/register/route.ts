/**
 * Public Expo Registration API
 * 
 * POST /api/expo/[slug]/register - Submit registration for an expo
 * GET  /api/expo/[slug]/register - Check registration status
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { createExpoRegistrationSchema } from '@/lib/validations/expo'
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
 * POST /api/expo/[slug]/register
 * Submit a registration for an expo
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

    // Find the expo
    const expo = await prisma.expo.findUnique({
      where: { slug },
      select: {
        id: true,
        nama_event: true,
        slug: true,
        status: true,
        registration_open: true,
        registration_deadline: true,
        max_participants: true,
        tipe_pendaftaran: true,
        custom_form: true,
      },
    })

    if (!expo) {
      return notFoundResponse('Expo tidak ditemukan')
    }

    // Check if registration is open
    if (!expo.registration_open) {
      return errorResponse('Pendaftaran untuk expo ini belum/sudah ditutup', 400)
    }

    // Check registration type
    if (expo.tipe_pendaftaran !== 'internal') {
      return errorResponse('Expo ini tidak menerima pendaftaran internal', 400)
    }

    // Check deadline
    if (expo.registration_deadline && new Date() > expo.registration_deadline) {
      return errorResponse('Batas waktu pendaftaran sudah berakhir', 400)
    }

    // Check max participants
    if (expo.max_participants) {
      const registrationCount = await prisma.expoRegistration.count({
        where: { expo_id: expo.id, status: { not: 'rejected' } },
      })
      if (registrationCount >= expo.max_participants) {
        return errorResponse('Kuota pendaftaran sudah penuh', 400)
      }
    }

    // Parse request body
    const body = await request.json()

    // Add expo_id to body for validation
    const dataToValidate = { ...body, expo_id: expo.id }

    // Validate registration fields
    const validation = createExpoRegistrationSchema.safeParse(dataToValidate)
    if (!validation.success) {
      return validationErrorFromZod(validation.error.issues)
    }

    const data = validation.data

    // Check for duplicate registration
    const existingRegistration = await prisma.expoRegistration.findFirst({
      where: {
        expo_id: expo.id,
        OR: [
          { email: data.email },
          { nim: data.nim },
        ],
      },
    })

    if (existingRegistration) {
      return errorResponse(
        'Email atau NIM sudah terdaftar untuk expo ini',
        409
      )
    }

    // Validate dynamic form fields if custom_form exists
    let customData: Record<string, unknown> = {}
    if (expo.custom_form) {
      const formConfig = expo.custom_form as unknown as FormConfig
      
      // Extract form data (everything except base fields)
      const baseFields = ['expo_id', 'nama', 'email', 'nim', 'whatsapp', 'project_name', 'project_desc']
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
    const registration = await prisma.expoRegistration.create({
      data: {
        expo_id: expo.id,
        nama: data.nama,
        email: data.email,
        nim: data.nim,
        whatsapp: data.whatsapp,
        project_name: data.project_name || null,
        project_desc: data.project_desc || null,
        custom_data: Object.keys(customData).length > 0 ? (customData as object) : undefined,
        status: 'registered',
      },
    })

    return createdResponse({
      id: registration.id,
      expo: expo.nama_event,
      nama: registration.nama,
      email: registration.email,
      status: registration.status,
      created_at: registration.created_at,
    }, 'Pendaftaran berhasil!')
  } catch (error) {
    console.error('Error submitting expo registration:', error)
    return errorResponse('Gagal menyimpan pendaftaran. Silakan coba lagi.')
  }
}

/**
 * GET /api/expo/[slug]/register
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

    // Find the expo
    const expo = await prisma.expo.findUnique({
      where: { slug },
      select: { id: true, nama_event: true },
    })

    if (!expo) {
      return notFoundResponse('Expo tidak ditemukan')
    }

    // Find registration
    const registration = await prisma.expoRegistration.findFirst({
      where: {
        expo_id: expo.id,
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
        project_name: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    })

    if (!registration) {
      return notFoundResponse('Pendaftaran tidak ditemukan')
    }

    return successResponse({
      expo: expo.nama_event,
      registration,
    })
  } catch (error) {
    console.error('Error checking expo registration:', error)
    return errorResponse('Gagal mengecek status pendaftaran')
  }
}
