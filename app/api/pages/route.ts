/**
 * API Route: Get Page Content
 * GET /api/pages?slug=about
 */

import { NextRequest, NextResponse } from 'next/server';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      // Return all published pages
      const params = new URLSearchParams();
      params.set('filter', JSON.stringify({ is_published: { _eq: true } }));
      params.set('sort', 'sort,title');
      params.set('fields', 'id,title,slug,meta_description,date_updated');

      const response = await fetch(`${DIRECTUS_URL}/items/pages?${params.toString()}`, {
        next: { revalidate: 60 },
      });

      if (!response.ok) {
        throw new Error(`Directus error: ${response.status}`);
      }

      const result = await response.json();
      return NextResponse.json({ data: result.data || [] });
    }

    // Get specific page by slug
    const params = new URLSearchParams();
    params.set('filter', JSON.stringify({ 
      slug: { _eq: slug },
      is_published: { _eq: true }
    }));
    params.set('limit', '1');
    params.set('fields', '*');

    const response = await fetch(`${DIRECTUS_URL}/items/pages?${params.toString()}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Directus error: ${response.status}`);
    }

    const result = await response.json();
    const page = result.data?.[0];

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ data: page });
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}
