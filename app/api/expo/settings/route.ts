/**
 * Public Expo Settings API
 * 
 * GET /api/expo/settings - Get current expo settings for public display
 * 
 * Returns:
 * - is_active: Whether expo pages are active
 * - inactive_message: Message to show when inactive
 * - next_expo_date: Next scheduled expo date (if set)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get public expo settings
 */
export async function GET() {
  try {
    // Get settings (always id = 1)
    let settings = await prisma.expoSettings.findUnique({
      where: { id: 1 },
      select: {
        is_active: true,
        inactive_message: true,
        next_expo_date: true,
      },
    });

    // If no settings exist, return defaults
    if (!settings) {
      settings = {
        is_active: true,
        inactive_message: 'Belum ada expo saat ini. Nantikan update selanjutnya!',
        next_expo_date: null,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        is_active: settings.is_active,
        inactive_message: settings.inactive_message,
        next_expo_date: settings.next_expo_date?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Error fetching expo settings:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil pengaturan' },
      { status: 500 }
    );
  }
}
