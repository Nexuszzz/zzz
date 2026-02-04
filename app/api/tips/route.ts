/**
 * API Route: Get Tips & Strategi
 * GET /api/tips
 * 
 * Returns static tips data
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Static fallback data
const staticTips = [
    {
        id: '1',
        title: 'Pilih Lomba yang Sesuai Passion',
        description: 'Fokus pada lomba yang sesuai dengan minat dan keahlian Anda. Mahasiswa Telekomunikasi cocok untuk kompetisi IoT, Jaringan, Smart City, atau Startup berbasis teknologi komunikasi.',
        icon: 'target',
        order: 1,
    },
    {
        id: '2',
        title: 'Riset Pemenang Tahun Lalu',
        description: 'Pelajari proposal atau karya juara tahun sebelumnya untuk memahami standar dan ekspektasi juri. Cek galeri Prestasi di portal APM untuk referensi.',
        icon: 'search',
        order: 2,
    },
    {
        id: '3',
        title: 'Bentuk Tim yang Kompak',
        description: 'Pilih anggota tim dengan skill yang saling melengkapi: programmer, designer, presenter. Komunikasi dan chemistry tim sangat penting untuk kesuksesan.',
        icon: 'users',
        order: 3,
    },
    {
        id: '4',
        title: 'Manajemen Waktu yang Baik',
        description: 'Buat timeline persiapan sejak awal. Jangan ngebut di akhir! Bagi tugas ke anggota tim dan set milestone mingguan untuk tracking progress.',
        icon: 'clock',
        order: 4,
    },
    {
        id: '5',
        title: 'Konsultasi dengan Dosen',
        description: 'Manfaatkan dosen pembimbing untuk review proposal, validasi teknis, dan masukan strategi presentasi. Pengalaman mereka sangat berharga.',
        icon: 'message-circle',
        order: 5,
    },
    {
        id: '6',
        title: 'Latihan Presentasi Berkali-kali',
        description: 'Practice makes perfect! Latih pitch presentasi minimal 5-10 kali. Rekam video latihan, minta feedback teman, dan perbaiki terus hingga smooth dan percaya diri.',
        icon: 'mic',
        order: 6,
    },
    {
        id: '7',
        title: 'Fokus pada Problem & Solution',
        description: 'Juri lebih tertarik pada solusi inovatif untuk masalah nyata. Tunjukkan pain point yang jelas, lalu jelaskan bagaimana karya Anda menyelesaikannya dengan unik.',
        icon: 'lightbulb',
        order: 7,
    },
    {
        id: '8',
        title: 'Sertakan Data & Validasi',
        description: 'Dukung klaim dengan data riset, survey, atau hasil testing. Proposal dengan data valid lebih meyakinkan daripada sekadar asumsi.',
        icon: 'target',
        order: 8,
    },
    {
        id: '9',
        title: 'Baca Guideline Sampai Detail',
        description: 'Banyak tim gugur karena kesalahan administratif seperti format salah atau dokumen kurang. Baca guidebook lomba sampai tuntas, highlight poin penting.',
        icon: 'search',
        order: 9,
    },
    {
        id: '10',
        title: 'Networking dengan Alumni Juara',
        description: 'Hubungi kakak tingkat yang pernah juara untuk tips dan trik. Mereka punya pengalaman berharga yang bisa menghemat waktu persiapan Anda.',
        icon: 'users',
        order: 10,
    },
    {
        id: '11',
        title: 'Jaga Kesehatan Mental & Fisik',
        description: 'Jangan begadang mepet deadline! Istirahat cukup, makan teratur, dan kelola stress. Performa terbaik datang dari kondisi tubuh dan pikiran yang sehat.',
        icon: 'heart',
        order: 11,
    },
    {
        id: '12',
        title: 'Percaya Diri & Enjoy the Process',
        description: 'Lomba bukan hanya soal menang, tapi proses belajar. Nikmati setiap tahapannya, network dengan peserta lain, dan ambil pelajaran berharga untuk kompetisi berikutnya.',
        icon: 'star',
        order: 12,
    },
];

export async function GET() {
    return NextResponse.json({ data: staticTips, source: 'static' });
}
