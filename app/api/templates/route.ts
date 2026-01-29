/**
 * API Route: Get Templates
 * GET /api/templates
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';

// Static fallback data
const staticTemplates = [
    {
        id: '1',
        title: 'Template Proposal PKM',
        description: 'Template proposal Program Kreativitas Mahasiswa sesuai panduan Dikti.',
        format: 'DOCX',
        category: 'proposal',
        downloadUrl: '#',
    },
    {
        id: '2',
        title: 'Template Proposal Business Plan',
        description: 'Template untuk kompetisi bisnis dan kewirausahaan.',
        format: 'DOCX',
        category: 'proposal',
        downloadUrl: '#',
    },
    {
        id: '3',
        title: 'Template Proposal Penelitian',
        description: 'Template proposal untuk lomba karya ilmiah dan riset.',
        format: 'DOCX',
        category: 'proposal',
        downloadUrl: '#',
    },
    {
        id: '4',
        title: 'Template Slide Presentasi',
        description: 'Template PowerPoint untuk presentasi lomba.',
        format: 'PPTX',
        category: 'presentation',
        downloadUrl: '#',
    },
    {
        id: '5',
        title: 'Template Poster Ilmiah',
        description: 'Template poster untuk pameran dan kompetisi ilmiah.',
        format: 'AI/PSD',
        category: 'design',
        downloadUrl: '#',
    },
];

export async function GET() {
    try {
        const params = new URLSearchParams();
        params.set('sort', 'urutan');
        params.set('filter', JSON.stringify({ status: { _eq: 'published' } }));
        params.set('fields', 'id,judul,deskripsi,format,kategori,file');

        const response = await fetch(`${DIRECTUS_URL}/items/templates?${params.toString()}`, {
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
                    category: item.kategori,
                    downloadUrl: item.file ? `${DIRECTUS_URL}/assets/${item.file}` : '#',
                }));
                return NextResponse.json({ data, source: 'directus' });
            }
        }

        return NextResponse.json({ data: staticTemplates, source: 'static' });
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json({ data: staticTemplates, source: 'static' });
    }
}
