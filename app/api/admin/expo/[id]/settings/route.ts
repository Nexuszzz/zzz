/**
 * Expo Settings Admin API
 * 
 * GET  /api/admin/expo/[id]/settings - Get expo settings
 * PUT  /api/admin/expo/[id]/settings - Update expo settings
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth } from '@/lib/auth/jwt'
import { updateExpoSettingsSchema } from '@/lib/validations/expo'
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
  validationErrorFromZod,
} from '@/lib/api/helpers'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/expo/[id]/settings
 * Get expo global settings (singleton - id is always 1)
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

    // Get global settings (singleton with id=1)
    let settings = await prisma.expoSettings.findUnique({
      where: { id: 1 },
    })

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.expoSettings.create({
        data: {
          id: 1,
          is_active: true,
          inactive_message: 'Belum ada expo saat ini. Nantikan update selanjutnya!',
        },
      })
    }

    return successResponse({
      expo,
      settings,
    })
  } catch (error) {
    console.error('Error fetching expo settings:', error)
    return errorResponse('Gagal mengambil pengaturan expo')
  }
}

/**
 * PUT /api/admin/expo/[id]/settings
 * Update expo global settings
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const validation = updateExpoSettingsSchema.safeParse(body)
    
    if (!validation.success) {
      return validationErrorFromZod(validation.error.issues)
    }

    const data = validation.data

    // Upsert global settings (singleton with id=1)
    const settings = await prisma.expoSettings.upsert({
      where: { id: 1 },
      update: {
        is_active: data.is_active,
        inactive_message: data.inactive_message,
        next_expo_date: data.next_expo_date ? new Date(data.next_expo_date) : undefined,
      },
      create: {
        id: 1,
        is_active: data.is_active ?? true,
        inactive_message: data.inactive_message || 'Belum ada expo saat ini. Nantikan update selanjutnya!',
        next_expo_date: data.next_expo_date ? new Date(data.next_expo_date) : null,
      },
    })

    return successResponse(settings)
  } catch (error) {
    console.error('Error updating expo settings:', error)
    return errorResponse('Gagal menyimpan pengaturan expo')
  }
}
