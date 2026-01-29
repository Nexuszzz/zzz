/**
 * API Route: Single Message Management
 * PATCH /api/kontak/[id] - Update message status
 * DELETE /api/kontak/[id] - Soft delete message
 */

import { NextRequest, NextResponse } from 'next/server';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const messageId = params.id;

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.status) {
      if (!['read', 'unread'].includes(body.status)) {
        return NextResponse.json(
          { error: 'Status tidak valid' },
          { status: 400 }
        );
      }
      updates.status = body.status;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data untuk diupdate' },
        { status: 400 }
      );
    }

    const response = await fetch(`${DIRECTUS_URL}/items/messages/${messageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      console.error('Failed to update message:', await response.text());
      return NextResponse.json(
        { error: 'Gagal mengupdate pesan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pesan berhasil diupdate',
    });

  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const messageId = params.id;

  try {
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      // Permanent delete
      const response = await fetch(`${DIRECTUS_URL}/items/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        console.error('Failed to delete message:', await response.text());
        return NextResponse.json(
          { error: 'Gagal menghapus pesan' },
          { status: 500 }
        );
      }
    } else {
      // Soft delete
      const response = await fetch(`${DIRECTUS_URL}/items/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_deleted: true }),
      });

      if (!response.ok) {
        console.error('Failed to soft-delete message:', await response.text());
        return NextResponse.json(
          { error: 'Gagal menghapus pesan' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Pesan berhasil dihapus',
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const messageId = params.id;

  try {
    const response = await fetch(
      `${DIRECTUS_URL}/items/messages/${messageId}?fields=id,nama,email,subjek,pesan,phone,status,date_created`
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Pesan tidak ditemukan' },
        { status: 404 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.data,
    });

  } catch (error) {
    console.error('Error fetching message:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
