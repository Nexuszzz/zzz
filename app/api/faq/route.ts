/**
 * API Route: Get FAQ
 * GET /api/faq
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const staticFaq = [
    {
        id: '1',
        question: 'Apa itu APM Jurusan Teknik Elektro - Prodi Telekomunikasi?',
        answer: 'APM (Ajang Prestasi Mahasiswa) adalah organisasi kemahasiswaan yang fokus mengelola, memfasilitasi, dan mendokumentasikan prestasi mahasiswa Jurusan Teknik Elektro khususnya Prodi D3 Teknik Telekomunikasi dan D4 Jaringan Telekomunikasi Digital. Kami menyediakan informasi lomba, membantu persiapan kompetisi, dan mengapresiasi setiap pencapaian mahasiswa.',
        order: 1,
    },
    {
        id: '2',
        question: 'Siapa saja yang bisa menggunakan portal APM ini?',
        answer: 'Portal APM terbuka untuk seluruh mahasiswa aktif Jurusan Teknik Elektro - Prodi Telekomunikasi (D3 Teknik Telekomunikasi dan D4 Jaringan Telekomunikasi Digital). Dosen pembimbing juga dapat mengakses untuk melihat prestasi mahasiswa bimbingannya.',
        order: 2,
    },
    {
        id: '3',
        question: 'Bagaimana cara melihat lomba yang tersedia?',
        answer: 'Kunjungi menu "Lomba & Kompetisi" di navigasi atas. Di sana Anda dapat melihat daftar lomba yang sedang dibuka, filter berdasarkan kategori (Teknologi, IoT, Startup, dll), tingkat (Regional/Nasional/Internasional), dan status pembukaan. Setiap lomba memiliki informasi deadline, penyelenggara, dan link pendaftaran resmi.',
        order: 3,
    },
    {
        id: '4',
        question: 'Apakah APM mendaftarkan saya ke lomba?',
        answer: 'Tidak. APM menyediakan katalog dan informasi lomba, namun pendaftaran dilakukan secara mandiri oleh mahasiswa melalui link yang tersedia di detail lomba. APM berperan sebagai fasilitator informasi dan pendukung persiapan kompetisi.',
        order: 4,
    },
    {
        id: '5',
        question: 'Bagaimana cara melaporkan prestasi yang sudah saya raih?',
        answer: 'Gunakan menu "Submit Prestasi" atau klik tombol "Laporkan Prestasi" di halaman Prestasi. Anda akan mengisi form wizard 3 langkah: (1) Informasi Prestasi (nama lomba, penyelenggara, peringkat), (2) Data Tim & Pembimbing (anggota tim dan dosen pembimbing), (3) Upload Dokumen (sertifikat, foto, surat keterangan). Pastikan semua data terisi dengan benar untuk mempercepat proses verifikasi.',
        order: 5,
    },
    {
        id: '6',
        question: 'Berapa lama proses verifikasi prestasi?',
        answer: 'Proses verifikasi prestasi biasanya memakan waktu 3-7 hari kerja. Tim APM akan memeriksa kelengkapan dokumen dan keabsahan bukti prestasi. Anda akan menerima notifikasi via email ketika prestasi sudah diverifikasi dan dipublikasikan di galeri prestasi.',
        order: 6,
    },
    {
        id: '7',
        question: 'Dokumen apa saja yang perlu disiapkan untuk submit prestasi?',
        answer: 'Dokumen wajib: (1) Sertifikat/Piagam resmi dari penyelenggara, (2) Foto dokumentasi saat kompetisi/penyerahan piagam, (3) Surat Tugas atau Surat Keterangan dari jurusan (jika ada). Dokumen opsional: Proposal, laporan kompetisi, screenshot hasil/ranking, media coverage.',
        order: 7,
    },
    {
        id: '8',
        question: 'Apakah ada bantuan dana untuk ikut lomba?',
        answer: 'Untuk informasi pendanaan lomba, silakan konsultasikan dengan dosen pembimbing atau koordinator APM di jurusan. Pendanaan biasanya tersedia untuk lomba-lomba prioritas tingkat nasional dan internasional sesuai kebijakan jurusan.',
        order: 8,
    },
    {
        id: '9',
        question: 'Bagaimana jika saya butuh dosen pembimbing?',
        answer: 'Anda dapat berkonsultasi dengan Ketua Prodi atau koordinator APM untuk mendapatkan rekomendasi dosen pembimbing yang sesuai dengan bidang lomba. Untuk lomba resmi, biasanya dosen pembimbing ditunjuk oleh jurusan.',
        order: 9,
    },
    {
        id: '10',
        question: 'Apa itu Expo & Pameran di menu APM?',
        answer: 'Expo & Pameran adalah event showcase karya mahasiswa yang diselenggarakan oleh APM atau jurusan. Di menu Expo, Anda dapat melihat jadwal pameran mendatang, mendaftar sebagai peserta expo, atau melihat dokumentasi expo sebelumnya. Event ini menjadi wadah mahasiswa untuk memamerkan project, inovasi, atau hasil penelitian.',
        order: 10,
    },
    {
        id: '11',
        question: 'Bagaimana cara menghubungi tim APM?',
        answer: 'Anda dapat menghubungi tim APM melalui: (1) Halaman Kontak di website, (2) Email resmi APM yang tertera di footer, (3) Datang langsung ke sekretariat APM di Jurusan Teknik Elektro. Jam operasional sekretariat biasanya Senin-Jumat pukul 08.00-16.00 WIB.',
        order: 11,
    },
    {
        id: '12',
        question: 'Apakah prestasi saya akan muncul di website?',
        answer: 'Ya, setelah prestasi diverifikasi oleh tim APM, prestasi Anda akan dipublikasikan di galeri "Prestasi & Pencapaian" dengan informasi lengkap (nama lomba, peringkat, tingkat, tahun, foto, dan data tim). Prestasi yang verified juga bisa dilihat oleh publik dan calon mahasiswa sebagai showcase keunggulan program studi Telekomunikasi.',
        order: 12,
    },
];

export async function GET() {
    return NextResponse.json({ data: staticFaq, source: 'static' });
}
