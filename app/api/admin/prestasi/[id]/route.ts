/**
 * Prestasi Submission Admin API - Single Item Operations
 * 
 * GET    /api/admin/prestasi/[id] - Get single submission
 * PATCH  /api/admin/prestasi/[id] - Review/update submission
 * DELETE /api/admin/prestasi/[id] - Delete submission
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth } from '@/lib/auth/jwt'
import { reviewSubmissionSchema } from '@/lib/validations/prestasi'
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
  generateSlug,
  validationErrorFromZod,
} from '@/lib/api/helpers'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/prestasi/[id]
 * Get a single prestasi submission with all details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const submissionId = parseInt(id, 10)
    
    if (isNaN(submissionId)) {
      return errorResponse('ID Submission tidak valid', 400)
    }

    const submission = await prisma.prestasiSubmission.findUnique({
      where: { id: submissionId },
      include: {
        team_members: true,
        pembimbing: true,
        documents: true,
        published: true,
      },
    })

    if (!submission) {
      return notFoundResponse('Submission tidak ditemukan')
    }

    return successResponse(submission)
  } catch (error) {
    console.error('Error fetching prestasi submission:', error)
    return errorResponse('Gagal mengambil data prestasi')
  }
}

/**
 * PATCH /api/admin/prestasi/[id]
 * Review/update a prestasi submission
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const submissionId = parseInt(id, 10)
    
    if (isNaN(submissionId)) {
      return errorResponse('ID Submission tidak valid', 400)
    }

    const submission = await prisma.prestasiSubmission.findUnique({
      where: { id: submissionId },
    })

    if (!submission) {
      return notFoundResponse('Submission tidak ditemukan')
    }

    const body = await request.json()
    const validation = reviewSubmissionSchema.safeParse(body)
    
    if (!validation.success) {
      return validationErrorFromZod(validation.error.issues)
    }

    const data = validation.data

    // Update submission status
    const updated = await prisma.prestasiSubmission.update({
      where: { id: submissionId },
      data: {
        status: data.status,
        reviewer_notes: data.reviewer_notes || null,
        reviewed_at: new Date(),
        reviewed_by: session.id,
      },
    })

    // If approved and make_public is true, create published prestasi
    if (data.status === 'approved' && data.make_public) {
      // Check if already published
      const existingPublished = await prisma.prestasi.findUnique({
        where: { submission_id: submissionId },
      })

      if (!existingPublished) {
        // Generate slug
        let slug = generateSlug(submission.judul)
        const existingSlug = await prisma.prestasi.findUnique({ where: { slug } })
        if (existingSlug) {
          slug = `${slug}-${Date.now()}`
        }

        // Create published prestasi
        await prisma.prestasi.create({
          data: {
            submission_id: submissionId,
            judul: submission.judul,
            slug,
            nama_lomba: submission.nama_lomba,
            tingkat: submission.tingkat,
            peringkat: submission.peringkat,
            tahun: submission.tanggal ? new Date(submission.tanggal).getFullYear() : new Date().getFullYear(),
            kategori: submission.kategori,
            deskripsi: submission.deskripsi,
            sertifikat_public: data.sertifikat_public || false,
            is_featured: false,
            is_published: true,
          },
        })
      }
    }

    // If rejected, unpublish if exists
    if (data.status === 'rejected') {
      await prisma.prestasi.deleteMany({
        where: { submission_id: submissionId },
      })
    }

    return successResponse(updated)
  } catch (error) {
    console.error('Error updating prestasi submission:', error)
    return errorResponse('Gagal memperbarui prestasi')
  }
}

/**
 * DELETE /api/admin/prestasi/[id]
 * Delete a prestasi submission
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return unauthorizedResponse()
    }

    if (session.role !== 'superadmin') {
      return errorResponse('Hanya superadmin yang dapat menghapus prestasi', 403)
    }

    const { id } = await params
    const submissionId = parseInt(id, 10)
    
    if (isNaN(submissionId)) {
      return errorResponse('ID Submission tidak valid', 400)
    }

    const submission = await prisma.prestasiSubmission.findUnique({
      where: { id: submissionId },
    })

    if (!submission) {
      return notFoundResponse('Submission tidak ditemukan')
    }

    // Delete submission (cascades to team_members, pembimbing, documents)
    await prisma.prestasiSubmission.delete({ where: { id: submissionId } })

    return successResponse({ message: 'Prestasi berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting prestasi submission:', error)
    return errorResponse('Gagal menghapus prestasi')
  }
}
