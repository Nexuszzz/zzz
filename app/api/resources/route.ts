/**
 * API Route: Get Resources List
 * GET /api/resources
 */

import { NextRequest, NextResponse } from 'next/server';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const kategori = searchParams.get('kategori');
    const featured = searchParams.get('featured') === 'true';
    const search = searchParams.get('search');
    const slug = searchParams.get('slug'); // Add slug filter for detail page

    // Build filter
    const filter: Record<string, unknown> = slug 
      ? { slug: { _eq: slug } } // Direct slug lookup
      : { is_published: { _eq: true } };
    
    if (!slug) {
      if (kategori) filter.kategori = { _eq: kategori };
      if (featured) filter.is_featured = { _eq: true };
      if (search) {
        filter._or = [
          { judul: { _icontains: search } },
          { deskripsi: { _icontains: search } },
        ];
      }
    }

    // Build URL params
    const params = new URLSearchParams();
    params.set('limit', slug ? '1' : limit.toString());
    params.set('offset', slug ? '0' : ((page - 1) * limit).toString());
    params.set('sort', 'urutan,-date_created');
    // Include file field for detail view
    const fields = slug
      ? 'id,judul,slug,kategori,deskripsi,thumbnail,tags,is_featured,konten,file,file_url,file_size'
      : 'id,judul,slug,kategori,deskripsi,thumbnail,tags,is_featured,konten';
    params.set('fields', fields);
    params.set('filter', JSON.stringify(filter));

    const response = await fetch(`${DIRECTUS_URL}/items/resources?${params.toString()}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Directus error: ${response.status}`);
    }

    const result = await response.json();
    
    // Transform data for frontend
    const data = result.data.map((item: Record<string, unknown>) => ({
      id: item.id,
      slug: item.slug,
      title: item.judul,
      kategori: item.kategori,
      description: item.deskripsi,
      content: item.konten,
      tags: item.tags,
      isFeatured: item.is_featured,
      thumbnailUrl: item.thumbnail ? `${DIRECTUS_URL}/assets/${item.thumbnail}?width=400` : null,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

