/**
 * API Route: Get Homepage Data
 * GET /api/homepage
 * 
 * Returns featured lomba, recent prestasi, and upcoming expo for homepage
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch featured lomba (not closed, prioritize urgent ones)
    const lombaData = await prisma.lomba.findMany({
      where: {
        is_deleted: false,
        status: { not: 'closed' },
      },
      orderBy: [
        { is_urgent: 'desc' },
        { created_at: 'desc' },
      ],
      take: 4,
      select: {
        id: true,
        nama_lomba: true,
        slug: true,
        deadline: true,
        kategori: true,
        tingkat: true,
        status: true,
        biaya: true,
        is_urgent: true,
        is_featured: true,
      },
    });

    // Fetch recent verified prestasi
    const prestasiData = await prisma.prestasi.findMany({
      where: {
        is_published: true,
      },
      orderBy: { published_at: 'desc' },
      take: 3,
      select: {
        id: true,
        slug: true,
        nama_lomba: true,
        peringkat: true,
        tingkat: true,
        tahun: true,
        kategori: true,
      },
    });

    // Fetch upcoming expo
    const expoData = await prisma.expo.findMany({
      where: {
        is_deleted: false,
        status: 'upcoming',
      },
      orderBy: { tanggal_mulai: 'asc' },
      take: 3,
      select: {
        id: true,
        nama_event: true,
        slug: true,
        tanggal_mulai: true,
        tanggal_selesai: true,
        lokasi: true,
      },
    });

    // Transform data
    const formatTanggal = (start: Date | null, end?: Date | null) => {
      if (!start) return '-';
      const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
      
      if (end && end.getTime() !== start.getTime()) {
        return `${start.toLocaleDateString('id-ID', { day: 'numeric' })}-${end.toLocaleDateString('id-ID', opts)}`;
      }
      return start.toLocaleDateString('id-ID', opts);
    };

    const lomba = lombaData.map((item) => ({
      id: String(item.id),
      slug: item.slug,
      title: item.nama_lomba,
      deadline: item.deadline?.toISOString() || null,
      deadlineDisplay: item.deadline 
        ? item.deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) 
        : null,
      kategori: String(item.kategori || '').charAt(0).toUpperCase() + String(item.kategori || '').slice(1),
      tingkat: String(item.tingkat || '').charAt(0).toUpperCase() + String(item.tingkat || '').slice(1),
      status: item.status || 'open',
      isUrgent: item.is_urgent,
      isFree: item.biaya === 0,
    }));

    const prestasi = prestasiData.map((item) => ({
      id: String(item.id),
      slug: item.slug,
      title: item.nama_lomba,
      peringkat: item.peringkat,
      tingkat: String(item.tingkat || '').charAt(0).toUpperCase() + String(item.tingkat || '').slice(1),
      tahun: String(item.tahun),
      kategori: String(item.kategori || ''),
      isVerified: true,
    }));

    const expo = expoData.map((item) => ({
      id: String(item.id),
      slug: item.slug,
      title: item.nama_event,
      tanggal: formatTanggal(item.tanggal_mulai, item.tanggal_selesai),
      lokasi: item.lokasi,
    }));

    return NextResponse.json({
      lomba,
      prestasi,
      expo,
    });
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homepage data', lomba: [], prestasi: [], expo: [] },
      { status: 500 }
    );
  }
}

