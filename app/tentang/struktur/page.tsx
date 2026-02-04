'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Breadcrumb, Badge, Button } from '@/components/ui';
import {
    Users,
    Building2,
    Mail,
    Phone,
    Linkedin,
    Award,
    GraduationCap,
    ChevronDown,
    ChevronRight,
    Crown,
    Star,
    Briefcase,
    Calendar,
    MapPin
} from 'lucide-react';

// Data Struktur Organisasi APM Polinema
// Khusus untuk Jurusan Teknik Elektro - Prodi Telekomunikasi
// Periode 2025-2026
const strukturOrganisasi = {
    pembina: {
        nama: 'Lorem Ipsum Dolor, S.T., M.T.',
        jabatan: 'Pembina APM',
        nip: '000000000000000000',
        unit: 'Dosen/Tenaga Pendidik',
        foto: null,
        email: 'pembina@polinema.ac.id',
    },
    bph: {
        ketua: {
            nama: 'Amet Consectetur, S.T., M.T.',
            jabatan: 'Ketua',
            unit: 'Badan Pengurus Harian (BPH)',
            foto: null,
            email: 'ketua.apm@polinema.ac.id',
            tugas: [
                'Memimpin arah komunitas & keputusan akhir',
                'Mengkoordinasi semua koordinator divisi',
                'Mengurus komunikasi formal ke kampus/pembina'
            ]
        },
        sekretaris: {
            nama: 'Sed Do Eiusmod, S.Kom.',
            jabatan: 'Sekretaris',
            unit: 'Badan Pengurus Harian (BPH)',
            foto: null,
            email: 'sekretaris.apm@polinema.ac.id',
            tugas: [
                'Notulen rapat, arsip dokumen, SOP',
                'Administrasi surat/izin/event',
                'Jadwal rapat & kalender internal'
            ]
        },
        bendahara: {
            nama: 'Tempor Incididunt, S.E.',
            jabatan: 'Bendahara',
            unit: 'Badan Pengurus Harian (BPH)',
            foto: null,
            email: 'bendahara.apm@polinema.ac.id',
            tugas: [
                'Pencatatan pemasukan/pengeluaran',
                'Proposal dana/sponsorship (bareng Humas)',
                'Laporan keuangan sederhana per bulan/event'
            ]
        },
    },
    divisi: [
        {
            nama: 'Divisi Web/IT & Data',
            kepala: {
                nama: 'Ut Labore Dolore',
                jabatan: 'Koordinator Divisi',
                unit: 'Mahasiswa Telekomunikasi',
                foto: null,
            },
            tugas: [
                'Website/portal, domain, form pendaftaran, maintenance',
                'Dokumentasi teknis, akun & akses, database lomba/event',
                'Support kebutuhan digital event'
            ],
            warna: 'from-blue-500 to-indigo-600'
        },
        {
            nama: 'Divisi Media Kreatif & Branding',
            kepala: {
                nama: 'Nostrud Exercitation',
                jabatan: 'Koordinator Divisi',
                unit: 'Mahasiswa Telekomunikasi',
                foto: null,
            },
            tugas: [
                'Logo, guideline visual, desain poster',
                'Konten IG/TT/LinkedIn, dokumentasi foto/video',
                'Publikasi capaian prestasi & kegiatan'
            ],
            warna: 'from-purple-500 to-pink-600'
        },
        {
            nama: 'Divisi Event & Edukasi',
            kepala: {
                nama: 'Duis Aute Irure',
                jabatan: 'Koordinator Divisi',
                unit: 'Mahasiswa Telekomunikasi',
                foto: null,
            },
            tugas: [
                'Kelas/mini workshop (teknologi/robotik/penulisan, dll)',
                'Seminar sharing lomba, coaching clinic proposal/pitch',
                'Rundown, PIC acara, evaluasi event'
            ],
            warna: 'from-emerald-500 to-teal-600'
        },
        {
            nama: 'Divisi Kompetisi & Prestasi',
            kepala: {
                nama: 'Fugiat Nulla Pariatur',
                jabatan: 'Koordinator Divisi',
                unit: 'Mahasiswa Telekomunikasi',
                foto: null,
            },
            tugas: [
                'Kurasi info lomba (internal/eksternal) + reminder deadline',
                'Mentoring: proposal, pitch deck, presentasi, penulisan',
                'Sistem "submit prestasi" + verifikasi data (bareng admin portal)'
            ],
            warna: 'from-amber-500 to-orange-600'
        },
        {
            nama: 'Divisi Humas & Partnership',
            kepala: {
                nama: 'Culpa Qui Officia',
                jabatan: 'Koordinator Divisi',
                unit: 'Mahasiswa Telekomunikasi',
                foto: null,
            },
            tugas: [
                'Kolaborasi dengan komunitas/ormawa lain',
                'Sponsor, media partner, narasumber',
                'Hubungan eksternal & relasi kampus'
            ],
            warna: 'from-cyan-500 to-blue-600'
        },
        {
            nama: 'Divisi SDM & Oprec',
            kepala: {
                nama: 'Deserunt Mollit',
                jabatan: 'Koordinator Divisi',
                unit: 'Mahasiswa Telekomunikasi',
                foto: null,
            },
            tugas: [
                'Rekrut anggota/pengurus, onboarding',
                'Database anggota, minat & skill mapping',
                'Culture & internal bonding'
            ],
            warna: 'from-rose-500 to-red-600'
        },
    ]
};

// Component: Person Card
function PersonCard({
    nama,
    jabatan,
    unit,
    nip,
    email,
    foto,
    size = 'md',
    tugas,
    showTugas = false,
    gradient = 'from-primary to-primary-600'
}: {
    nama: string;
    jabatan: string;
    unit?: string;
    nip?: string;
    email?: string;
    foto?: string | null;
    size?: 'sm' | 'md' | 'lg';
    tugas?: string[];
    showTugas?: boolean;
    gradient?: string;
}) {
    const sizes = {
        sm: { avatar: 'w-12 h-12', text: 'text-sm', subtext: 'text-xs' },
        md: { avatar: 'w-16 h-16', text: 'text-base', subtext: 'text-sm' },
        lg: { avatar: 'w-20 h-20', text: 'text-lg', subtext: 'text-sm' },
    };

    const initials = nama.split(' ').map(n => n[0]).slice(0, 2).join('');

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-start gap-4">
                <div className={`${sizes[size].avatar} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-gray-900 ${sizes[size].text} truncate`}>{nama}</h4>
                    <p className={`text-primary font-medium ${sizes[size].subtext}`}>{jabatan}</p>
                    {unit && <p className={`text-gray-500 ${sizes[size].subtext}`}>{unit}</p>}
                    {nip && <p className="text-xs text-gray-400 mt-1">NIP: {nip}</p>}
                    {email && (
                        <a href={`mailto:${email}`} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {email}
                        </a>
                    )}
                </div>
            </div>

            {showTugas && tugas && tugas.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Tugas & Tanggung Jawab:</p>
                    <ul className="space-y-1">
                        {tugas.map((t, i) => (
                            <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                                <ChevronRight className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                                {t}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// Component: Divisi Card
function DivisiCard({
    divisi
}: {
    divisi: typeof strukturOrganisasi.divisi[0]
}) {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
            {/* Header */}
            <div className={`bg-gradient-to-r ${divisi.warna} px-5 py-4`}>
                <h3 className="font-bold text-white text-lg">{divisi.nama}</h3>
            </div>

            {/* Koordinator Divisi */}
            <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${divisi.warna} flex items-center justify-center text-white font-bold`}>
                        {divisi.kepala.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">{divisi.kepala.nama}</h4>
                        <p className="text-sm text-primary font-medium">{divisi.kepala.jabatan}</p>
                        <p className="text-xs text-gray-500">{divisi.kepala.unit}</p>
                    </div>
                </div>
            </div>

            {/* Tugas */}
            <div className="p-5 bg-gray-50">
                <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Tugas & Tanggung Jawab</p>
                <ul className="space-y-2">
                    {divisi.tugas.map((t, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            {t}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default function StrukturOrganisasiPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Header */}
            <div className="bg-gradient-to-br from-primary via-primary-600 to-primary-700 relative overflow-hidden">
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

                <div className="container-apm py-12 relative z-10">
                    <Breadcrumb
                        items={[
                            { label: 'Tentang', href: '/about' },
                            { label: 'Struktur Organisasi' }
                        ]}
                        className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white mb-6"
                    />
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-4">
                                <Building2 className="w-3 h-3 mr-1" />
                                Organisasi
                            </Badge>
                            <h1 className="text-2xl lg:text-4xl font-bold text-white flex items-center gap-3">
                                <Users className="w-8 h-8" />
                                Struktur Organisasi APM
                            </h1>
                            <p className="text-white/80 mt-2 max-w-2xl">
                                Struktur kepengurusan Ajang Prestasi Mahasiswa - Jurusan Teknik Elektro Prodi Telekomunikasi periode 2025-2026
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/tentang">
                                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                                    Tentang APM
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-apm py-12">

                {/* Org Chart Visual */}
                <div className="mb-16">
                    <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">Bagan Struktur Organisasi</h2>

                    {/* Level 1: Pembina */}
                    <div className="flex justify-center mb-8">
                        <div className="text-center">
                            <Badge variant="outline" className="mb-3 bg-gray-100">Pembina</Badge>
                            <PersonCard
                                {...strukturOrganisasi.pembina}
                                size="lg"
                                gradient="from-gray-600 to-gray-800"
                            />
                        </div>
                    </div>

                    {/* Connector Line */}
                    <div className="flex justify-center mb-8">
                        <div className="w-0.5 h-12 bg-gradient-to-b from-gray-400 to-primary"></div>
                    </div>

                    {/* Level 2: BPH (Badan Pengurus Harian) */}
                    <div className="mb-12">
                        <div className="flex justify-center mb-6">
                            <Badge variant="primary" className="text-base px-4 py-2">
                                <Crown className="w-4 h-4 mr-2" /> Badan Pengurus Harian (BPH)
                            </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {/* Ketua */}
                            <div className="text-center">
                                <Badge variant="outline" className="mb-3 bg-primary/10 text-primary border-primary/30">Ketua</Badge>
                                <PersonCard
                                    {...strukturOrganisasi.bph.ketua}
                                    size="md"
                                    showTugas={true}
                                    gradient="from-primary to-primary-700"
                                />
                            </div>

                            {/* Sekretaris */}
                            <div className="text-center">
                                <Badge variant="outline" className="mb-3 bg-blue-50 text-blue-700 border-blue-200">Sekretaris</Badge>
                                <PersonCard
                                    {...strukturOrganisasi.bph.sekretaris}
                                    size="md"
                                    showTugas={true}
                                    gradient="from-blue-500 to-indigo-600"
                                />
                            </div>

                            {/* Bendahara */}
                            <div className="text-center">
                                <Badge variant="outline" className="mb-3 bg-emerald-50 text-emerald-700 border-emerald-200">Bendahara</Badge>
                                <PersonCard
                                    {...strukturOrganisasi.bph.bendahara}
                                    size="md"
                                    showTugas={true}
                                    gradient="from-emerald-500 to-teal-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divisi Section */}
                <div className="mb-16">
                    <div className="text-center mb-8">
                        <Badge variant="accent" className="mb-3">
                            <Briefcase className="w-3 h-3 mr-1" /> Divisi
                        </Badge>
                        <h2 className="text-xl font-bold text-gray-900">Divisi-Divisi APM</h2>
                        <p className="text-gray-600 mt-2">6 divisi yang menjalankan program kerja APM (masing-masing 1 koordinator)</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {strukturOrganisasi.divisi.map((divisi, index) => (
                            <DivisiCard key={index} divisi={divisi} />
                        ))}
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-gradient-to-r from-primary to-primary-600 rounded-2xl p-8 text-white text-center">
                    <h2 className="text-2xl font-bold mb-2">Hubungi Kami</h2>
                    <p className="text-white/80 mb-6">Butuh informasi lebih lanjut tentang APM Polinema?</p>

                    <div className="flex flex-wrap justify-center gap-6 mb-6">
                        <a href="mailto:apm@polinema.ac.id" className="flex items-center gap-2 text-white/90 hover:text-white">
                            <Mail className="w-5 h-5" />
                            apm@polinema.ac.id
                        </a>
                        <span className="flex items-center gap-2 text-white/90">
                            <Phone className="w-5 h-5" />
                            (0341) 404424 ext. 123
                        </span>
                        <span className="flex items-center gap-2 text-white/90">
                            <MapPin className="w-5 h-5" />
                            Gedung JTI Lt. 3, Kampus Polinema
                        </span>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Link href="/about">
                            <Button className="bg-white text-primary hover:bg-white/90">
                                Tentang APM
                            </Button>
                        </Link>
                        <Link href="/prestasi/submit">
                            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                                Submit Prestasi
                            </Button>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
