/**
 * Calendar Admin API - Single Item Operations
 * 
 * GET    /api/admin/calendar/[id] - Get single event
 * PATCH  /api/admin/calendar/[id] - Update event
 * DELETE /api/admin/calendar/[id] - Delete event
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth } from '@/lib/auth/jwt'
import { updateCalendarEventSchema } from '@/lib/validations/calendar'
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
 * GET /api/admin/calendar/[id]
 * Get a single calendar event
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const eventId = parseInt(id, 10)
    
    if (isNaN(eventId)) {
      return errorResponse('ID Event tidak valid', 400)
    }

    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return notFoundResponse('Event tidak ditemukan')
    }

    return successResponse(event)
  } catch (error) {
    console.error('Error fetching calendar event:', error)
    return errorResponse('Gagal mengambil data event')
  }
}

/**
 * PATCH /api/admin/calendar/[id]
 * Update a calendar event
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const eventId = parseInt(id, 10)
    
    if (isNaN(eventId)) {
      return errorResponse('ID Event tidak valid', 400)
    }

    const existing = await prisma.calendarEvent.findUnique({ where: { id: eventId } })
    if (!existing) {
      return notFoundResponse('Event tidak ditemukan')
    }

    const body = await request.json()
    const validation = updateCalendarEventSchema.safeParse(body)
    
    if (!validation.success) {
      return validationErrorFromZod(validation.error.issues)
    }

    const data = validation.data

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description || null
    if (data.event_type !== undefined) updateData.type = data.event_type
    if (data.color !== undefined) updateData.color = data.color
    if (data.start_date !== undefined) updateData.start_date = new Date(data.start_date)
    if (data.end_date !== undefined) updateData.end_date = data.end_date ? new Date(data.end_date) : null
    if (data.all_day !== undefined) updateData.all_day = data.all_day
    if (data.url !== undefined) updateData.link = data.url || null

    const event = await prisma.calendarEvent.update({
      where: { id: eventId },
      data: updateData,
    })

    return successResponse(event)
  } catch (error) {
    console.error('Error updating calendar event:', error)
    return errorResponse('Gagal memperbarui event')
  }
}

/**
 * DELETE /api/admin/calendar/[id]
 * Delete a calendar event
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const eventId = parseInt(id, 10)
    
    if (isNaN(eventId)) {
      return errorResponse('ID Event tidak valid', 400)
    }

    const existing = await prisma.calendarEvent.findUnique({ where: { id: eventId } })
    if (!existing) {
      return notFoundResponse('Event tidak ditemukan')
    }

    await prisma.calendarEvent.delete({ where: { id: eventId } })

    return successResponse({ message: 'Event berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    return errorResponse('Gagal menghapus event')
  }
}
