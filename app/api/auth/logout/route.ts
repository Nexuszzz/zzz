/**
 * Logout API Route
 * POST /api/auth/logout
 */

import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth/jwt'

export async function POST() {
  try {
    await clearAuthCookie()
    
    return NextResponse.json({
      success: true,
      message: 'Logout berhasil'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
