/**
 * Public Calendar API
 * 
 * GET /api/calendar - Get public calendar events from all sources
 * 
 * Aggregates events from:
 * - CalendarEvent table (manual events)
 * - Lomba deadlines
 * - Expo dates
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import {
  successResponse,
  errorResponse,
  parseSearchParams,
} from '@/lib/api/helpers'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface CalendarEventOutput {
  id: string
  title: string
  type: string
  start_date: Date
  end_date: Date | null
  all_day: boolean
  link: string | null
  color: string | null
  source: 'calendar' | 'lomba' | 'expo'
  source_id?: number
}

/**
 * GET /api/calendar
 * Get aggregated calendar events
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = parseSearchParams(searchParams, [
      'month', 'year', 'type', 'source', 'limit'
    ])

    const month = params.month ? parseInt(params.month) : null
    const year = params.year ? parseInt(params.year) : new Date().getFullYear()
    const typeFilter = params.type || ''
    const sourceFilter = params.source || ''
    const limit = params.limit ? parseInt(params.limit) : 200

    // Calculate date range
    let startDate: Date
    let endDate: Date

    if (month !== null) {
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0, 23, 59, 59)
    } else {
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31, 23, 59, 59)
    }

    const events: CalendarEventOutput[] = []

    // 1. Fetch CalendarEvent entries
    if (!sourceFilter || sourceFilter === 'calendar') {
      const calendarEvents = await prisma.calendarEvent.findMany({
        where: {
          is_active: true,
          OR: [
            {
              start_date: { gte: startDate, lte: endDate },
            },
            {
              AND: [
                { start_date: { lte: endDate } },
                { end_date: { gte: startDate } },
              ],
            },
          ],
          ...(typeFilter ? { type: typeFilter } : {}),
        },
        select: {
          id: true,
          title: true,
          type: true,
          start_date: true,
          end_date: true,
          all_day: true,
          link: true,
          color: true,
        },
      })

      events.push(
        ...calendarEvents.map(e => ({
          id: `calendar-${e.id}`,
          title: e.title,
          type: e.type,
          start_date: e.start_date,
          end_date: e.end_date,
          all_day: e.all_day,
          link: e.link,
          color: e.color,
          source: 'calendar' as const,
          source_id: e.id,
        }))
      )
    }

    // 2. Fetch Lomba deadlines
    if (!sourceFilter || sourceFilter === 'lomba') {
      const lombas = await prisma.lomba.findMany({
        where: {
          status: { not: 'closed' },
          is_deleted: false,
          deadline: { gte: startDate, lte: endDate },
        },
        select: {
          id: true,
          nama_lomba: true,
          slug: true,
          deadline: true,
          tanggal_pelaksanaan: true,
          lokasi: true,
          kategori: true,
          is_urgent: true,
        },
      })

      events.push(
        ...lombas.filter(l => l.deadline).map(l => ({
          id: `lomba-deadline-${l.id}`,
          title: `[Deadline] ${l.nama_lomba}`,
          type: 'deadline',
          start_date: l.deadline!,
          end_date: null,
          all_day: true,
          link: `/lomba/${l.slug}`,
          color: l.is_urgent ? '#ef4444' : '#f59e0b',
          source: 'lomba' as const,
          source_id: l.id,
        }))
      )

      // Add pelaksanaan dates
      events.push(
        ...lombas.filter(l => l.tanggal_pelaksanaan).map(l => ({
          id: `lomba-exec-${l.id}`,
          title: l.nama_lomba,
          type: 'lomba',
          start_date: l.tanggal_pelaksanaan!,
          end_date: null,
          all_day: true,
          link: `/lomba/${l.slug}`,
          color: '#3b82f6',
          source: 'lomba' as const,
          source_id: l.id,
        }))
      )
    }

    // 3. Fetch Expo dates
    if (!sourceFilter || sourceFilter === 'expo') {
      const expos = await prisma.expo.findMany({
        where: {
          status: { not: 'cancelled' },
          is_deleted: false,
          OR: [
            { tanggal_mulai: { gte: startDate, lte: endDate } },
            {
              AND: [
                { tanggal_mulai: { lte: endDate } },
                { tanggal_selesai: { gte: startDate } },
              ],
            },
          ],
        },
        select: {
          id: true,
          nama_event: true,
          slug: true,
          tanggal_mulai: true,
          tanggal_selesai: true,
          lokasi: true,
        },
      })

      events.push(
        ...expos.map(e => ({
          id: `expo-${e.id}`,
          title: e.nama_event,
          type: 'expo',
          start_date: e.tanggal_mulai,
          end_date: e.tanggal_selesai,
          all_day: true,
          link: `/expo/${e.slug}`,
          color: '#8b5cf6',
          source: 'expo' as const,
          source_id: e.id,
        }))
      )
    }

    // Sort by start_date
    events.sort((a, b) => a.start_date.getTime() - b.start_date.getTime())

    // Apply limit
    const limitedEvents = events.slice(0, limit)

    // Group by type for summary
    const byType = limitedEvents.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const bySource = limitedEvents.reduce((acc, e) => {
      acc[e.source] = (acc[e.source] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return successResponse({
      year,
      month: month || 'all',
      total: limitedEvents.length,
      events: limitedEvents,
      summary: {
        byType,
        bySource,
      },
    })
  } catch (error) {
    console.error('Error fetching public calendar:', error)
    return errorResponse('Gagal mengambil data kalender')
  }
}
