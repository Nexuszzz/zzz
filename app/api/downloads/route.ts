/**
 * API Route: Get Downloads/Materi
 * GET /api/downloads
 */

import { NextResponse } from 'next/server';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const staticDownloads = [
    {
        id: '1',
        title: 'Panduan PKM 2024',
        description: 'Buku panduan lengkap Program Kreativitas Mahasiswa.',
        format: 'PDF',
        size: '2.5 MB',
        category: 'panduan',
        downloadUrl: '#',
    },
    {
        id: '2',
        title: 'Materi Workshop Proposal',
        description: 'Slide presentasi workshop penulisan proposal.',
        format: 'PPTX',
        size: '5.1 MB',
        category: 'materi',
        downloadUrl: '#',
    },
    {
        id: '3',
        title: 'Template Dokumen Lomba',
        description: 'Kumpulan template dalam satu paket.',
        format: 'ZIP',
        size: '12 MB',
        category: 'template',
        downloadUrl: '#',
    },
    {
        id: '4',
        title: 'Video Tutorial Presentasi',
        description: 'Rekaman webinar tips presentasi yang baik.',
        format: 'MP4',
        size: '150 MB',
        category: 'video',
        downloadUrl: '#',
    },
    {
        id: '5',
        title: 'Contoh Proposal Pemenang',
        description: 'Kumpulan proposal pemenang tahun sebelumnya.',
        format: 'PDF',
        size: '8.3 MB',
        category: 'contoh',
        downloadUrl: '#',
    },
];

export async function GET() {
    try {
        const params = new URLSearchParams();
        params.set('sort', '-date_created');
        params.set('filter', JSON.stringify({ status: { _eq: 'published' } }));
        params.set('fields', 'id,judul,deskripsi,format,ukuran,kategori,file');

        const response = await fetch(`${DIRECTUS_URL}/items/resources?${params.toString()}`, {
            next: { revalidate: 60 },
        });

        if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.length > 0) {
                const data = result.data.map((item: Record<string, unknown>) => ({
                    id: String(item.id),
                    title: item.judul,
                    description: item.deskripsi,
                    format: item.format,
                    size: item.ukuran,
                    category: item.kategori,
                    downloadUrl: item.file ? `${DIRECTUS_URL}/assets/${item.file}` : '#',
                }));
                return NextResponse.json({ data, source: 'directus' });
            }
        }

        return NextResponse.json({ data: staticDownloads, source: 'static' });
    } catch (error) {
        console.error('Error fetching downloads:', error);
        return NextResponse.json({ data: staticDownloads, source: 'static' });
    }
}
