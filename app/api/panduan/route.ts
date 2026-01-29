/**
 * API Route: Get Panduan
 * GET /api/panduan
 */

import { NextRequest, NextResponse } from 'next/server';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const staticPanduan = {
    pendaftaran: [
        { step: 1, title: 'Cari Lomba', description: 'Jelajahi daftar lomba di halaman Lomba atau gunakan fitur pencarian.' },
        { step: 2, title: 'Baca Detail Lomba', description: 'Pahami persyaratan, deadline, dan kriteria penilaian.' },
        { step: 3, title: 'Siapkan Dokumen', description: 'Kumpulkan dokumen yang dibutuhkan seperti proposal, CV tim, dan lainnya.' },
        { step: 4, title: 'Daftar via APM', description: 'Klik tombol "Daftar" pada halaman lomba dan isi formulir pendaftaran.' },
        { step: 5, title: 'Tunggu Konfirmasi', description: 'Tim APM akan memverifikasi pendaftaran dan menghubungi Anda.' },
        { step: 6, title: 'Ikuti Pembinaan', description: 'APM menyediakan pembinaan untuk mempersiapkan peserta lomba.' },
    ],
    expo: [
        { step: 1, title: 'Cek Jadwal Expo', description: 'Lihat jadwal expo yang tersedia di halaman Expo.' },
        { step: 2, title: 'Siapkan Karya', description: 'Pastikan proyek/karya Anda siap dipamerkan.' },
        { step: 3, title: 'Daftar Partisipasi', description: 'Isi formulir pendaftaran expo dan upload proposal singkat.' },
        { step: 4, title: 'Tunggu Konfirmasi', description: 'Panitia akan menghubungi untuk konfirmasi booth.' },
        { step: 5, title: 'Siapkan Booth', description: 'Siapkan poster dan materi presentasi untuk hari H.' },
    ],
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'pendaftaran';

        const params = new URLSearchParams();
        params.set('sort', 'urutan');
        params.set('filter', JSON.stringify({
            status: { _eq: 'published' },
            tipe: { _eq: type }
        }));
        params.set('fields', 'id,step,judul,deskripsi,tipe,urutan');

        const response = await fetch(`${DIRECTUS_URL}/items/panduan?${params.toString()}`, {
            next: { revalidate: 60 },
        });

        if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.length > 0) {
                const data = result.data.map((item: Record<string, unknown>) => ({
                    step: item.step || item.urutan,
                    title: item.judul,
                    description: item.deskripsi,
                }));
                return NextResponse.json({ data, source: 'directus' });
            }
        }

        const fallbackData = type === 'expo' ? staticPanduan.expo : staticPanduan.pendaftaran;
        return NextResponse.json({ data: fallbackData, source: 'static' });
    } catch (error) {
        console.error('Error fetching panduan:', error);
        return NextResponse.json({ data: staticPanduan.pendaftaran, source: 'static' });
    }
}
