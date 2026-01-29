/**
 * API Route: Get FAQ
 * GET /api/faq
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';

const staticFaq = [
    {
        id: '1',
        question: 'Apa itu APM?',
        answer: 'APM (Asisten Prestasi Mahasiswa) adalah unit yang membantu mahasiswa dalam mengikuti berbagai kompetisi dan lomba tingkat nasional maupun internasional.',
        order: 1,
    },
    {
        id: '2',
        question: 'Bagaimana cara mendaftar lomba?',
        answer: 'Kunjungi halaman Lomba, pilih lomba yang diminati, lalu klik tombol "Daftar". Isi formulir dan unggah dokumen yang diperlukan.',
        order: 2,
    },
    {
        id: '3',
        question: 'Apakah ada biaya pendaftaran?',
        answer: 'Untuk lomba yang difasilitasi APM, biaya pendaftaran biasanya ditanggung institusi. Untuk lomba mandiri, biaya mungkin ditanggung peserta.',
        order: 3,
    },
    {
        id: '4',
        question: 'Bagaimana jika saya butuh tim?',
        answer: 'APM dapat membantu mencarikan anggota tim. Hubungi kami atau gunakan fitur "Cari Tim" di portal.',
        order: 4,
    },
    {
        id: '5',
        question: 'Apakah ada pembinaan sebelum lomba?',
        answer: 'Ya, APM menyediakan program pembinaan dan mentoring untuk peserta lomba yang terdaftar.',
        order: 5,
    },
    {
        id: '6',
        question: 'Bagaimana cara submit prestasi?',
        answer: 'Kunjungi halaman "Submit Prestasi" dan isi formulir dengan bukti prestasi seperti sertifikat atau SK.',
        order: 6,
    },
];

export async function GET() {
    try {
        const params = new URLSearchParams();
        params.set('sort', 'urutan');
        params.set('filter', JSON.stringify({ status: { _eq: 'published' } }));
        params.set('fields', 'id,pertanyaan,jawaban,urutan');

        const response = await fetch(`${DIRECTUS_URL}/items/faq?${params.toString()}`, {
            next: { revalidate: 60 },
        });

        if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.length > 0) {
                const data = result.data.map((item: Record<string, unknown>) => ({
                    id: String(item.id),
                    question: item.pertanyaan,
                    answer: item.jawaban,
                    order: item.urutan,
                }));
                return NextResponse.json({ data, source: 'directus' });
            }
        }

        return NextResponse.json({ data: staticFaq, source: 'static' });
    } catch (error) {
        console.error('Error fetching FAQ:', error);
        return NextResponse.json({ data: staticFaq, source: 'static' });
    }
}
