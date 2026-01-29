/**
 * API Route: Contact Messages
 * POST /api/kontak
 * 
 * Saves contact form submissions to messages collection
 */

import { NextRequest, NextResponse } from 'next/server';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation
    const errors: Record<string, string> = {};
    
    if (!body.nama?.trim()) errors.nama = 'Nama wajib diisi';
    if (!body.email?.trim()) errors.email = 'Email wajib diisi';
    if (!body.subjek?.trim()) errors.subjek = 'Subjek wajib diisi';
    if (!body.pesan?.trim()) errors.pesan = 'Pesan wajib diisi';

    // Email validation
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      errors.email = 'Format email tidak valid';
    }

    // Message length validation
    if (body.pesan && body.pesan.trim().length < 10) {
      errors.pesan = 'Pesan minimal 10 karakter';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Create message record
    const messageData = {
      nama: body.nama.trim(),
      email: body.email.trim().toLowerCase(),
      subjek: body.subjek.trim(),
      pesan: body.pesan.trim(),
      phone: body.phone?.trim() || null,
      status: 'unread',
      is_deleted: false,
    };

    const response = await fetch(`${DIRECTUS_URL}/items/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      console.error('Failed to save message:', await response.text());
      return NextResponse.json(
        { error: 'Gagal menyimpan pesan. Silakan coba lagi.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pesan berhasil dikirim! Tim kami akan menghubungi Anda segera.',
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/kontak
 * Get list of messages (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const params = new URLSearchParams();
    params.set('fields', 'id,nama,email,subjek,pesan,phone,status,date_created');
    params.set('sort', '-date_created');
    params.set('limit', limit.toString());
    params.set('offset', offset.toString());

    // Build filter
    const filter: Record<string, unknown> = { is_deleted: { _eq: false } };
    if (status !== 'all') {
      filter.status = { _eq: status };
    }
    params.set('filter', JSON.stringify(filter));

    const response = await fetch(`${DIRECTUS_URL}/items/messages?${params.toString()}`);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Gagal mengambil data pesan' },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Get total count
    const countParams = new URLSearchParams();
    countParams.set('filter', JSON.stringify(filter));
    countParams.set('aggregate[count]', 'id');

    const countRes = await fetch(`${DIRECTUS_URL}/items/messages?${countParams.toString()}`);
    const countData = await countRes.json();
    const total = countData.data?.[0]?.count?.id || 0;

    return NextResponse.json({
      success: true,
      data: data.data || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
