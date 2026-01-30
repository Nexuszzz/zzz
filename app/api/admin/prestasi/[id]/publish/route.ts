import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/lib/auth/jwt';

// Type definitions
type TeamMember = {
  nama: string;
  nim: string;
  prodi: string | null;
  is_ketua: boolean;
};

type Document = {
  id: number;
  type: string;
  label: string | null;
  file_path: string;
  file_name: string;
};

// GET - Fetch submission data for publishing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult || 'error' in authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const submissionId = parseInt(resolvedParams.id);

    if (isNaN(submissionId)) {
      return NextResponse.json({ error: 'Invalid submission ID' }, { status: 400 });
    }

    // Fetch submission with related data
    const submission = await prisma.prestasiSubmission.findUnique({
      where: { id: submissionId },
      include: {
        team_members: true,
        pembimbing: true,
        documents: true,
        published: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission tidak ditemukan' }, { status: 404 });
    }

    // Only allow publishing if approved
    if (submission.status !== 'approved') {
      return NextResponse.json({ 
        error: 'Submission harus diverifikasi terlebih dahulu' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        judul: submission.judul,
        nama_lomba: submission.nama_lomba,
        penyelenggara: submission.penyelenggara,
        tingkat: submission.tingkat,
        peringkat: submission.peringkat,
        tanggal: submission.tanggal?.toISOString() || null,
        kategori: submission.kategori,
        deskripsi: submission.deskripsi,
        status: submission.status,
        team_members: submission.team_members.map(m => ({
          nama: m.nama,
          nim: m.nim,
          prodi: m.prodi,
          is_ketua: m.is_ketua,
        })),
        documents: submission.documents.map(d => ({
          id: d.id,
          type: d.type,
          label: d.label,
          file_path: d.file_path,
          file_name: d.file_name,
        })),
      },
      prestasi: submission.published ? {
        id: submission.published.id,
        judul: submission.published.judul,
        slug: submission.published.slug,
        nama_lomba: submission.published.nama_lomba,
        tingkat: submission.published.tingkat,
        peringkat: submission.published.peringkat,
        tahun: submission.published.tahun,
        kategori: submission.published.kategori,
        deskripsi: submission.published.deskripsi,
        thumbnail: submission.published.thumbnail,
        galeri: submission.published.galeri,
        sertifikat: submission.published.sertifikat,
        sertifikat_public: submission.published.sertifikat_public,
        link_berita: submission.published.link_berita,
        link_portofolio: submission.published.link_portofolio,
        is_featured: submission.published.is_featured,
        is_published: submission.published.is_published,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching submission for publish:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new Prestasi from submission
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult || 'error' in authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const submissionId = parseInt(resolvedParams.id);

    if (isNaN(submissionId)) {
      return NextResponse.json({ error: 'Invalid submission ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      judul,
      slug,
      nama_lomba,
      tingkat,
      peringkat,
      tahun,
      kategori,
      deskripsi,
      thumbnail,
      galeri,
      sertifikat,
      sertifikat_public,
      link_berita,
      link_portofolio,
      is_featured,
      is_published,
    } = body;

    // Check if submission exists and is approved
    const submission = await prisma.prestasiSubmission.findUnique({
      where: { id: submissionId },
      include: { published: true },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission tidak ditemukan' }, { status: 404 });
    }

    if (submission.status !== 'approved') {
      return NextResponse.json({ 
        error: 'Submission harus diverifikasi terlebih dahulu' 
      }, { status: 400 });
    }

    if (submission.published) {
      return NextResponse.json({ 
        error: 'Prestasi sudah dipublikasikan. Gunakan PUT untuk update.' 
      }, { status: 400 });
    }

    // Check if slug is unique
    const existingSlug = await prisma.prestasi.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return NextResponse.json({ 
        error: 'Slug sudah digunakan. Pilih slug lain.' 
      }, { status: 400 });
    }

    // Create Prestasi
    const prestasi = await prisma.prestasi.create({
      data: {
        submission_id: submissionId,
        judul,
        slug,
        nama_lomba: nama_lomba || submission.nama_lomba,
        tingkat: tingkat || submission.tingkat,
        peringkat: peringkat || submission.peringkat,
        tahun: tahun || new Date().getFullYear(),
        kategori: kategori || submission.kategori,
        deskripsi: deskripsi || submission.deskripsi,
        thumbnail,
        galeri: galeri || [],
        sertifikat,
        sertifikat_public: sertifikat_public || false,
        link_berita: link_berita || null,
        link_portofolio: link_portofolio || null,
        is_featured: is_featured || false,
        is_published: is_published !== undefined ? is_published : true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Prestasi berhasil dipublikasikan',
      prestasi: {
        id: prestasi.id,
        slug: prestasi.slug,
      },
    });
  } catch (error) {
    console.error('Error creating prestasi:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update existing Prestasi
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult || 'error' in authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const submissionId = parseInt(resolvedParams.id);

    if (isNaN(submissionId)) {
      return NextResponse.json({ error: 'Invalid submission ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      judul,
      slug,
      nama_lomba,
      tingkat,
      peringkat,
      tahun,
      kategori,
      deskripsi,
      thumbnail,
      galeri,
      sertifikat,
      sertifikat_public,
      link_berita,
      link_portofolio,
      is_featured,
      is_published,
    } = body;

    // Find existing prestasi
    const existingPrestasi = await prisma.prestasi.findUnique({
      where: { submission_id: submissionId },
    });

    if (!existingPrestasi) {
      return NextResponse.json({ 
        error: 'Prestasi belum dipublikasikan. Gunakan POST untuk membuat.' 
      }, { status: 404 });
    }

    // Check if new slug is unique (if changed)
    if (slug !== existingPrestasi.slug) {
      const slugExists = await prisma.prestasi.findFirst({
        where: { 
          slug,
          id: { not: existingPrestasi.id }
        },
      });

      if (slugExists) {
        return NextResponse.json({ 
          error: 'Slug sudah digunakan. Pilih slug lain.' 
        }, { status: 400 });
      }
    }

    // Update Prestasi
    const prestasi = await prisma.prestasi.update({
      where: { id: existingPrestasi.id },
      data: {
        judul,
        slug,
        nama_lomba,
        tingkat,
        peringkat,
        tahun,
        kategori,
        deskripsi,
        thumbnail,
        galeri: galeri || [],
        sertifikat,
        sertifikat_public: sertifikat_public || false,
        link_berita: link_berita || null,
        link_portofolio: link_portofolio || null,
        is_featured: is_featured || false,
        is_published: is_published !== undefined ? is_published : true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Prestasi berhasil diperbarui',
      prestasi: {
        id: prestasi.id,
        slug: prestasi.slug,
      },
    });
  } catch (error) {
    console.error('Error updating prestasi:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
