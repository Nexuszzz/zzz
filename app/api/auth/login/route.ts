/**
 * Login API Route
 * POST /api/auth/login
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { verifyPassword } from '@/lib/auth/password'
import { createToken, setAuthCookie } from '@/lib/auth/jwt'
import { loginSchema } from '@/lib/validations/auth'
import { authRateLimiter, checkRateLimit, getClientIP } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(request, authRateLimiter)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = loginSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    if (!admin) {
      // Don't reveal if email exists
      return NextResponse.json(
        { success: false, error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Check if admin is active
    if (!admin.is_active) {
      return NextResponse.json(
        { success: false, error: 'Akun Anda telah dinonaktifkan' },
        { status: 403 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, admin.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { last_login: new Date() }
    })

    // Create JWT token
    const token = await createToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    })

    // Set cookie
    await setAuthCookie(token)

    // Reset rate limit on successful login
    const ip = getClientIP(request)
    authRateLimiter.reset(ip)

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        },
        token
      },
      message: 'Login berhasil'
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
