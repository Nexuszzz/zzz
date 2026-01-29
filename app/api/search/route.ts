/**
 * API Route: Unified Search
 * GET /api/search?q=query
 * 
 * Search across lomba, prestasi, expo, and resources
 * Lomba, Prestasi, Expo use Prisma (apm_ tables)
 * Resources still uses Directus (CMS content)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type'); // Optional: 'lomba', 'prestasi', 'expo', 'resources', or 'all'

    if (!query.trim()) {
      return NextResponse.json({
        lomba: [],
        prestasi: [],
        expo: [],
        resources: [],
        total: 0,
      });
    }

    const results: {
      lomba: unknown[];
      prestasi: unknown[];
      expo: unknown[];
      resources: unknown[];
      total: number;
    } = {
      lomba: [],
      prestasi: [],
      expo: [],
      resources: [],
      total: 0,
    };

    // Search Lomba using Prisma
    if (!type || type === 'all' || type === 'lomba') {
      try {
        const lombaData = await prisma.lomba.findMany({
          where: {
            is_deleted: false,
            OR: [
              { nama_lomba: { contains: query, mode: 'insensitive' } },
              { deskripsi: { contains: query, mode: 'insensitive' } },
              { penyelenggara: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 10,
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
            poster: true,
          },
        });

        results.lomba = lombaData.map((item) => ({
          id: item.id,
          slug: item.slug,
          title: item.nama_lomba,
          deadline: item.deadline?.toISOString() || null,
          deadlineDisplay: item.deadline 
            ? item.deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
            : null,
          kategori: item.kategori,
          tingkat: item.tingkat,
          status: item.status,
          isUrgent: item.is_urgent,
          isFree: item.biaya === 0,
          posterUrl: item.poster ? `/uploads/${item.poster}` : null,
        }));
      } catch (error) {
        console.error('Error searching lomba:', error);
      }
    }

    // Search Prestasi using Prisma
    if (!type || type === 'all' || type === 'prestasi') {
      try {
        const prestasiData = await prisma.prestasi.findMany({
          where: {
            is_published: true,
            OR: [
              { judul: { contains: query, mode: 'insensitive' } },
              { nama_lomba: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 10,
          include: {
            submission: {
              select: { submitter_name: true },
            },
          },
        });

        results.prestasi = prestasiData.map((item) => ({
          id: item.id,
          slug: item.slug,
          title: item.judul,
          namaLomba: item.nama_lomba,
          peringkat: item.peringkat,
          tingkat: item.tingkat,
          tahun: item.tahun,
          kategori: item.kategori,
          tim: item.submission?.submitter_name ? [{ nama: item.submission.submitter_name }] : [],
        }));
      } catch (error) {
        console.error('Error searching prestasi:', error);
      }
    }

    // Search Expo using Prisma
    if (!type || type === 'all' || type === 'expo') {
      try {
        const expoData = await prisma.expo.findMany({
          where: {
            is_deleted: false,
            OR: [
              { nama_event: { contains: query, mode: 'insensitive' } },
              { tema: { contains: query, mode: 'insensitive' } },
              { deskripsi: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 10,
          select: {
            id: true,
            nama_event: true,
            slug: true,
            tanggal_mulai: true,
            tanggal_selesai: true,
            lokasi: true,
          },
        });

        results.expo = expoData.map((item) => {
          const startDate = item.tanggal_mulai;
          const endDate = item.tanggal_selesai;
          let tanggal = '-';
          
          if (startDate) {
            if (endDate && endDate.getTime() !== startDate.getTime()) {
              tanggal = `${startDate.toLocaleDateString('id-ID', { day: 'numeric' })}-${endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
            } else {
              tanggal = startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            }
          }

          return {
            id: item.id,
            slug: item.slug,
            title: item.nama_event,
            tanggal,
            lokasi: item.lokasi,
          };
        });
      } catch (error) {
        console.error('Error searching expo:', error);
      }
    }

    // Search Resources - still uses Directus (CMS content)
    if (!type || type === 'all' || type === 'resources') {
      try {
        const resourcesParams = new URLSearchParams();
        resourcesParams.set('limit', '10');
        resourcesParams.set('filter', JSON.stringify({
          is_published: { _eq: true },
          _or: [
            { judul: { _icontains: query } },
            { deskripsi: { _icontains: query } },
          ],
        }));
        resourcesParams.set('fields', 'id,judul,slug,kategori,deskripsi,thumbnail');

        const resourcesRes = await fetch(`${DIRECTUS_URL}/items/resources?${resourcesParams.toString()}`, {
          next: { revalidate: 60 },
        });

        if (resourcesRes.ok) {
          const resourcesData = await resourcesRes.json();
          results.resources = (resourcesData.data || []).map((item: Record<string, unknown>) => ({
            id: item.id,
            slug: item.slug,
            title: item.judul,
            kategori: item.kategori,
            format: 'PDF',
          }));
        }
      } catch (error) {
        console.error('Error searching resources:', error);
      }
    }

    results.total = results.lomba.length + results.prestasi.length + results.expo.length + results.resources.length;

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
