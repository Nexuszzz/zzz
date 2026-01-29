/**
 * Current User API Route
 * GET /api/auth/me - Get current authenticated user
 * PATCH /api/auth/me - Update current user profile
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { getSessionFromRequest, createToken, setAuthCookie } from '@/lib/auth/jwt'
import { verifyPassword, hashPassword } from '@/lib/auth/password'
import { updateAdminSchema, changePasswordSchema } from '@/lib/validations/auth'

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get fresh user data from database
    const admin = await prisma.admin.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_active: true,
        last_login: true,
        created_at: true
      }
    })

    if (!admin || !admin.is_active) {
      return NextResponse.json(
        { success: false, error: 'User not found or inactive' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: admin
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/auth/me
 * Update current user profile
 */
export async function PATCH(request: Request) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Handle password change separately
    if (body.current_password) {
      const passwordResult = changePasswordSchema.safeParse(body)
      if (!passwordResult.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Validation failed',
            details: passwordResult.error.flatten().fieldErrors
          },
          { status: 400 }
        )
      }

      // Get current password hash
      const admin = await prisma.admin.findUnique({
        where: { id: session.id },
        select: { password_hash: true }
      })

      if (!admin) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }

      // Verify current password
      const isValid = await verifyPassword(
        passwordResult.data.current_password, 
        admin.password_hash
      )
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Password saat ini salah' },
          { status: 400 }
        )
      }

      // Update password
      const newHash = await hashPassword(passwordResult.data.new_password)
      await prisma.admin.update({
        where: { id: session.id },
        data: { password_hash: newHash }
      })

      return NextResponse.json({
        success: true,
        message: 'Password berhasil diubah'
      })
    }

    // Handle profile update
    const validationResult = updateAdminSchema.safeParse(body)
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

    // Remove password and role from update (can't change own role)
    const { password, role, is_active, ...updateData } = validationResult.data

    // Check email uniqueness if changing
    if (updateData.email && updateData.email !== session.email) {
      const existing = await prisma.admin.findUnique({
        where: { email: updateData.email }
      })
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Email sudah digunakan' },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.admin.update({
      where: { id: session.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    // If email or name changed, refresh token
    if (updateData.email || updateData.name) {
      const newToken = await createToken({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role
      })
      await setAuthCookie(newToken)
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Profil berhasil diperbarui'
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
