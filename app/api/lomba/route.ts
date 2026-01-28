/**
 * API Route: Get Lomba List
 * GET /api/lomba
 */

import { NextRequest, NextResponse } from 'next/server';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const kategori = searchParams.get('kategori');
    const tingkat = searchParams.get('tingkat');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const slug = searchParams.get('slug'); // Add slug filter for detail page
    const featured = searchParams.get('featured') === 'true';

    // Build filter
    const filter: Record<string, unknown> = {};

    if (slug) {
      // Direct slug lookup for detail page
      filter.slug = { _eq: slug };
    } else {
      // Normal filters for list page
      if (kategori) filter.kategori = { _eq: kategori };
      if (tingkat) filter.tingkat = { _eq: tingkat };
      if (status) filter.status = { _eq: status };
      if (featured) filter.is_featured = { _eq: true };
      if (search) {
        filter._or = [
          { nama_lomba: { _icontains: search } },
          { deskripsi: { _icontains: search } },
        ];
      }
    }

    // Build URL params
    const params = new URLSearchParams();
    params.set('limit', slug ? '1' : limit.toString());
    params.set('offset', slug ? '0' : ((page - 1) * limit).toString());
    params.set('sort', '-date_created');
    // Include more fields for detail view when querying by slug
    const fields = slug
      ? 'id,nama_lomba,slug,deadline,kategori,tingkat,status,poster,biaya,lokasi,is_featured,is_urgent,tags,deskripsi,penyelenggara,peserta_info,hadiah_info,syarat_info,timeline_info,kontak_email,kontak_phone,kontak_website,link_pendaftaran'
      : 'id,nama_lomba,slug,deadline,kategori,tingkat,status,poster,biaya,lokasi,is_featured,is_urgent,tags';
    params.set('fields', fields);

    if (Object.keys(filter).length > 0) {
      params.set('filter', JSON.stringify(filter));
    }

    const response = await fetch(`${DIRECTUS_URL}/items/apm_lomba?${params.toString()}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new Error(`Directus error: ${response.status}`);
    }

    const result = await response.json();

    // Use public Directus URL for asset URLs (browser accessible)
    const publicDirectusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || DIRECTUS_URL;

    // Transform data for frontend
    const data = result.data.map((item: Record<string, unknown>) => ({
      id: String(item.id),
      slug: item.slug,
      title: item.nama_lomba,
      deadline: item.deadline,
      deadlineDisplay: item.deadline ? new Date(item.deadline as string).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : null,
      kategori: String(item.kategori || '').charAt(0).toUpperCase() + String(item.kategori || '').slice(1),
      tingkat: String(item.tingkat || '').charAt(0).toUpperCase() + String(item.tingkat || '').slice(1),
      status: item.status || 'open',
      isUrgent: item.is_urgent,
      isFree: item.biaya === 0,
      posterUrl: item.poster ? `${publicDirectusUrl}/assets/${item.poster}?width=400` : null,
      // Detail fields (only present when querying by slug)
      deskripsi: item.deskripsi || '',
      penyelenggara: item.penyelenggara || '',
      lokasi: item.lokasi || '',
      biaya: item.biaya || 0,
      peserta: item.peserta_info || '',
      hadiah: item.hadiah_info || [],
      syarat: item.syarat_info || [],
      timeline: item.timeline_info || [],
      kontakEmail: item.kontak_email || '',
      kontakPhone: item.kontak_phone || '',
      kontakWebsite: item.kontak_website || '',
      linkPendaftaran: item.link_pendaftaran || '',
      tags: item.tags || [],
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching lomba:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lomba' },
      { status: 500 }
    );
  }
}

