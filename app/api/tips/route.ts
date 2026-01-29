/**
 * API Route: Get Tips & Strategi
 * GET /api/tips
 * 
 * Fetches tips data from Directus tips collection
 * Falls back to static data if collection doesn't exist
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';

// Static fallback data
const staticTips = [
    {
        id: '1',
        title: 'Pahami Kriteria Penilaian',
        description: 'Baca dengan teliti kriteria penilaian yang diberikan panitia. Pastikan proposal atau karya Anda memenuhi setiap poin yang dinilai.',
        icon: 'target',
        order: 1,
    },
    {
        id: '2',
        title: 'Riset Kompetitor',
        description: 'Pelajari karya pemenang tahun-tahun sebelumnya untuk memahami standar yang diharapkan.',
        icon: 'search',
        order: 2,
    },
    {
        id: '3',
        title: 'Kerja Tim yang Solid',
        description: 'Bentuk tim dengan skill yang saling melengkapi dan komunikasi yang baik.',
        icon: 'users',
        order: 3,
    },
    {
        id: '4',
        title: 'Mulai Lebih Awal',
        description: 'Jangan tunggu deadline mendekat. Mulai persiapan sejak informasi lomba dirilis.',
        icon: 'clock',
        order: 4,
    },
    {
        id: '5',
        title: 'Minta Feedback Dosen',
        description: 'Konsultasikan proposal atau karya Anda dengan dosen pembimbing untuk mendapat masukan.',
        icon: 'message-circle',
        order: 5,
    },
    {
        id: '6',
        title: 'Latihan Presentasi',
        description: 'Jika ada sesi presentasi, latih berulang kali hingga Anda percaya diri.',
        icon: 'mic',
        order: 6,
    },
];

export async function GET() {
    try {
        // Try to fetch from Directus first
        const params = new URLSearchParams();
        params.set('sort', 'urutan');
        params.set('filter', JSON.stringify({ status: { _eq: 'published' } }));
        params.set('fields', 'id,judul,deskripsi,icon,urutan');

        const response = await fetch(`${DIRECTUS_URL}/items/tips?${params.toString()}`, {
            next: { revalidate: 60 },
        });

        if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.length > 0) {
                const data = result.data.map((item: Record<string, unknown>) => ({
                    id: String(item.id),
                    title: item.judul,
                    description: item.deskripsi,
                    icon: item.icon || 'lightbulb',
                    order: item.urutan,
                }));
                return NextResponse.json({ data, source: 'directus' });
            }
        }

        // Fallback to static data
        return NextResponse.json({ data: staticTips, source: 'static' });
    } catch (error) {
        console.error('Error fetching tips:', error);
        return NextResponse.json({ data: staticTips, source: 'static' });
    }
}
