/**
 * Calendar Admin API - CRUD Operations
 * 
 * GET  /api/admin/calendar - List all calendar events
 * POST /api/admin/calendar - Create new calendar event
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth } from '@/lib/auth/jwt'
import { createCalendarEventSchema, queryCalendarEventsSchema } from '@/lib/validations/calendar'
import {
  successResponse,
  createdResponse,
  errorResponse,
  unauthorizedResponse,
  calculatePagination,
  parseSearchParams,
  validationErrorFromZod,
} from '@/lib/api/helpers'

/**
 * GET /api/admin/calendar
 * List all calendar events with filtering
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
      'start', 'end', 'source', 'event_type', 'page', 'limit'
    ])

    // Optional date range filtering
    const start = params.start ? new Date(params.start) : undefined
    const end = params.end ? new Date(params.end) : undefined
    const page = params.page ? parseInt(params.page) : 1
    const limit = params.limit ? parseInt(params.limit) : 50

    // Build where clause
    interface WhereClause {
      type?: string
      start_date?: { gte?: Date; lte?: Date }
    }
    
    const where: WhereClause = {}

    if (start || end) {
      where.start_date = {}
      if (start) where.start_date.gte = start
      if (end) where.start_date.lte = end
    }

    if (params.event_type) {
      where.type = params.event_type
    }

    // Get total count
    const total = await prisma.calendarEvent.count({ where })

    // Get events
    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { start_date: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    const pagination = calculatePagination(total, page, limit)

    return successResponse({
      data: events,
    }, pagination)
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return errorResponse('Gagal mengambil data kalender')
  }
}

/**
 * POST /api/admin/calendar
 * Create a new calendar event
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return unauthorizedResponse()
    }

    const body = await request.json()

    // Validate input
    const validation = createCalendarEventSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorFromZod(validation.error.issues)
    }

    const data = validation.data

    // Create event
    const event = await prisma.calendarEvent.create({
      data: {
        title: data.title,
        description: data.description || null,
        type: data.event_type || 'event',
        color: data.color || '#3B82F6',
        start_date: new Date(data.start_date),
        end_date: data.end_date ? new Date(data.end_date) : null,
        all_day: data.all_day ?? true,
        link: data.url || null,
        is_active: true,
      },
    })

    return createdResponse(event, 'Event berhasil dibuat')
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return errorResponse('Gagal membuat event')
  }
}
