/**
 * Admin Expo Settings API
 * 
 * GET /api/admin/expo/settings - Get current settings
 * PUT /api/admin/expo/settings - Update settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/jwt';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET - Get current expo settings
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get or create settings (always id = 1)
    let settings = await prisma.expoSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      // Create default settings
      settings = await prisma.expoSettings.create({
        data: {
          id: 1,
          is_active: true,
          inactive_message: 'Belum ada expo saat ini. Nantikan update selanjutnya!',
          next_expo_date: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching expo settings:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil pengaturan' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update expo settings
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { is_active, inactive_message, next_expo_date } = body;

    // Upsert settings (always id = 1)
    const settings = await prisma.expoSettings.upsert({
      where: { id: 1 },
      update: {
        is_active: is_active ?? true,
        inactive_message: inactive_message || 'Belum ada expo saat ini. Nantikan update selanjutnya!',
        next_expo_date: next_expo_date ? new Date(next_expo_date) : null,
      },
      create: {
        id: 1,
        is_active: is_active ?? true,
        inactive_message: inactive_message || 'Belum ada expo saat ini. Nantikan update selanjutnya!',
        next_expo_date: next_expo_date ? new Date(next_expo_date) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Pengaturan berhasil disimpan',
    });
  } catch (error) {
    console.error('Error updating expo settings:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan pengaturan' },
      { status: 500 }
    );
  }
}
