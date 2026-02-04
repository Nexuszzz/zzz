/**
 * API Route: Get Panduan
 * GET /api/panduan
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const staticPanduan = {
    lomba: [
        { step: 1, title: 'Browse Katalog Lomba', description: 'Kunjungi menu "Lomba & Kompetisi" untuk melihat daftar lomba yang tersedia. Gunakan filter kategori, tingkat, atau status untuk mempersempit pencarian.' },
        { step: 2, title: 'Pilih Lomba yang Diminati', description: 'Klik card lomba untuk melihat detail lengkap. Perhatikan deadline pendaftaran, kategori lomba, dan persyaratan peserta.' },
        { step: 3, title: 'Baca Syarat & Ketentuan', description: 'Pahami dengan detail syarat pendaftaran, timeline lomba, kriteria penilaian, dan hadiah yang ditawarkan. Pastikan Anda memenuhi semua persyaratan.' },
        { step: 4, title: 'Cek Tipe Pendaftaran', description: 'Perhatikan badge tipe pendaftaran di halaman detail. "Internal" berarti daftar via form APM, "Eksternal" berarti redirect ke website lomba resmi.' },
        { step: 5, title: 'Daftar via Form Internal (jika tersedia)', description: 'Jika lomba menggunakan pendaftaran internal, klik tombol "Daftar via APM". Isi form dengan data lengkap: nama, NIM, email, WhatsApp, fakultas, prodi. Submit form dan Anda akan langsung terdaftar.' },
        { step: 6, title: 'Atau Akses Website Lomba (jika eksternal)', description: 'Jika lomba menggunakan pendaftaran eksternal, klik tombol "Daftar Sekarang" untuk redirect ke website resmi penyelenggara. Ikuti prosedur pendaftaran di website tersebut.' },
        { step: 7, title: 'Konfirmasi Pendaftaran', description: 'Untuk pendaftaran internal, cek email konfirmasi atau pantau status di dashboard (future feature). Untuk eksternal, ikuti instruksi dari penyelenggara lomba.' },
    ],
    prestasi: [
        { step: 1, title: 'Buka Menu Submit Prestasi', description: 'Klik menu "Prestasi" di navigasi atas, lalu pilih tombol "Laporkan Prestasi" atau akses langsung via /prestasi/submit.' },
        { step: 2, title: 'Isi Informasi Prestasi (Step 1)', description: 'Masukkan detail prestasi: Judul karya/proyek, nama lomba, penyelenggara, tingkat (Regional/Nasional/Internasional), peringkat yang diraih, tanggal lomba, kategori, dan deskripsi singkat.' },
        { step: 3, title: 'Input Data Tim & Pembimbing (Step 2)', description: 'Isi data submitter (nama, NIM, email, WhatsApp), tambahkan anggota tim (nama, NIM, prodi), dan data dosen pembimbing (nama, NIDN, WhatsApp). Pastikan data lengkap dan valid.' },
        { step: 4, title: 'Upload Dokumen Pendukung (Step 3)', description: 'Upload sertifikat/piagam resmi, foto dokumentasi kompetisi, surat tugas/keterangan, dan dokumen pendukung lainnya (proposal, laporan, screenshot hasil). Format yang diterima: PDF, JPG, PNG.' },
        { step: 5, title: 'Review & Submit', description: 'Periksa kembali semua data yang diisi. Pastikan tidak ada yang terlewat. Klik tombol "Submit Prestasi" untuk mengirim data ke tim APM.' },
        { step: 6, title: 'Tunggu Verifikasi', description: 'Tim APM akan memverifikasi data dan dokumen dalam 3-7 hari kerja. Anda akan menerima notifikasi via email jika prestasi sudah diverifikasi.' },
        { step: 7, title: 'Prestasi Dipublikasikan', description: 'Setelah diverifikasi, prestasi Anda akan muncul di galeri Prestasi & Pencapaian dengan badge "Verified" dan bisa dilihat oleh publik.' },
    ],
    expo: [
        { step: 1, title: 'Cek Jadwal Expo', description: 'Kunjungi halaman "Expo & Pameran" untuk melihat jadwal event expo yang akan datang beserta tema dan persyaratannya.' },
        { step: 2, title: 'Siapkan Project/Karya', description: 'Pastikan project atau karya yang akan dipamerkan sudah selesai dan siap demo. Siapkan deskripsi, poster, dan video demo jika ada.' },
        { step: 3, title: 'Daftar via Form Expo', description: 'Klik tombol "Daftar Expo" pada event yang diminati. Isi form pendaftaran dengan data project, anggota tim, dan upload proposal singkat.' },
        { step: 4, title: 'Tunggu Konfirmasi Booth', description: 'Panitia akan menghubungi via email/WhatsApp untuk konfirmasi booth dan detail teknis (ukuran booth, fasilitas, jadwal setup).' },
        { step: 5, title: 'Persiapan Hari H', description: 'Siapkan poster A3/A2, materi presentasi, laptop/monitor demo, dan brosur/flyer (jika ada). Datang sesuai jadwal setup booth.' },
        { step: 6, title: 'Pameran & Dokumentasi', description: 'Jelaskan project Anda kepada pengunjung dengan antusias. Panitia akan mendokumentasikan dan mempublikasikan di galeri expo.' },
    ],
};

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'lomba';

    // Map 'pendaftaran' to 'lomba' for backward compatibility
    const typeKey = type === 'pendaftaran' ? 'lomba' : type;
    const data = staticPanduan[typeKey as keyof typeof staticPanduan] || staticPanduan.lomba;
    
    return NextResponse.json({ data, source: 'static' });
}
