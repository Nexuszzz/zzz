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
// TODO: Fetch from Directus team_members collection
const strukturOrganisasi = {
    pembina: {
        nama: 'Lorem Ipsum Dolor, S.T.',
        jabatan: 'Pembina APM',
        nip: '000000000000000000',
        unit: 'Wakil Direktur III',
        foto: null,
        email: 'pembina@polinema.ac.id',
    },
    ketua: {
        nama: 'Amet Consectetur, S.T., M.T.',
        jabatan: 'Ketua APM Polinema',
        nip: '000000000000000001',
        unit: 'Jurusan Teknologi Informasi',
        foto: null,
        email: 'ketua.apm@polinema.ac.id',
        tugas: [
            'Koordinasi seluruh kegiatan APM',
            'Pengambilan keputusan strategis',
            'Representasi APM di tingkat institusi'
        ]
    },
    wakil: {
        nama: 'Adipiscing Elit, S.Kom., M.Kom.',
        jabatan: 'Wakil Ketua APM',
        nip: '000000000000000002',
        unit: 'Jurusan Teknik Elektro',
        foto: null,
        email: 'wakil.apm@polinema.ac.id',
        tugas: [
            'Mendampingi Ketua dalam koordinasi',
            'Supervisi divisi-divisi',
            'Pengelolaan kerjasama eksternal'
        ]
    },
    sekretaris: {
        nama: 'Sed Do Eiusmod, S.Kom., M.Kom.',
        jabatan: 'Sekretaris',
        nip: '000000000000000003',
        unit: 'Jurusan Teknologi Informasi',
        foto: null,
        email: 'sekretaris.apm@polinema.ac.id',
        tugas: [
            'Administrasi dan dokumentasi',
            'Korespondensi organisasi',
            'Pengelolaan arsip'
        ]
    },
    bendahara: {
        nama: 'Tempor Incididunt, S.E., M.M.',
        jabatan: 'Bendahara',
        nip: '000000000000000004',
        unit: 'Jurusan Akuntansi',
        foto: null,
        email: 'bendahara.apm@polinema.ac.id',
        tugas: [
            'Pengelolaan keuangan',
            'Penganggaran kegiatan',
            'Pelaporan keuangan'
        ]
    },
    divisi: [
        {
            nama: 'Divisi Lomba & Kompetisi',
            kepala: {
                nama: 'Ut Labore Dolore, S.Pd., M.Pd.',
                jabatan: 'Kepala Divisi',
                nip: '000000000000000005',
                unit: 'Jurusan Administrasi Niaga',
                foto: null,
            },
            anggota: [
                { nama: 'Magna Aliqua, S.T.', jabatan: 'Koordinator Lomba Nasional', unit: 'JTI' },
                { nama: 'Enim Minim, S.Kom.', jabatan: 'Koordinator Lomba Internasional', unit: 'JTE' },
                { nama: 'Veniam Quis', jabatan: 'Staff Admin', unit: 'Mahasiswa JTI' },
            ],
            tugas: [
                'Kurasi informasi lomba',
                'Fasilitasi pendaftaran lomba',
                'Pembinaan peserta lomba',
                'Dokumentasi hasil lomba'
            ],
            warna: 'from-blue-500 to-indigo-600'
        },
        {
            nama: 'Divisi Prestasi & Dokumentasi',
            kepala: {
                nama: 'Nostrud Exercitation, S.T., M.T.',
                jabatan: 'Kepala Divisi',
                nip: '000000000000000006',
                unit: 'Jurusan Teknik Mesin',
                foto: null,
            },
            anggota: [
                { nama: 'Ullamco Laboris, S.Pd.', jabatan: 'Koordinator Prestasi', unit: 'JAK' },
                { nama: 'Nisi Aliquip', jabatan: 'Staff Dokumentasi', unit: 'Mahasiswa JTI' },
                { nama: 'Commodo Consequat', jabatan: 'Staff Verifikasi', unit: 'Mahasiswa JAN' },
            ],
            tugas: [
                'Verifikasi prestasi mahasiswa',
                'Dokumentasi pencapaian',
                'Publikasi prestasi',
                'Penghargaan mahasiswa berprestasi'
            ],
            warna: 'from-amber-500 to-orange-600'
        },
        {
            nama: 'Divisi Expo & Event',
            kepala: {
                nama: 'Duis Aute Irure, S.E., M.M.',
                jabatan: 'Kepala Divisi',
                nip: '000000000000000007',
                unit: 'Jurusan Administrasi Niaga',
                foto: null,
            },
            anggota: [
                { nama: 'Dolor Reprehenderit, S.Kom.', jabatan: 'Koordinator Event', unit: 'JTI' },
                { nama: 'Voluptate Velit', jabatan: 'Staff Logistik', unit: 'Mahasiswa JAK' },
                { nama: 'Esse Cillum', jabatan: 'Staff Publikasi', unit: 'Mahasiswa JTI' },
            ],
            tugas: [
                'Penyelenggaraan expo tahunan',
                'Koordinasi event kampus',
                'Manajemen vendor',
                'Promosi dan publikasi event'
            ],
            warna: 'from-emerald-500 to-teal-600'
        },
        {
            nama: 'Divisi Media & Teknologi',
            kepala: {
                nama: 'Fugiat Nulla Pariatur, S.Ds., M.Ds.',
                jabatan: 'Kepala Divisi',
                nip: '000000000000000008',
                unit: 'Jurusan Teknologi Informasi',
                foto: null,
            },
            anggota: [
                { nama: 'Excepteur Sint, S.Kom.', jabatan: 'Web Developer', unit: 'JTI' },
                { nama: 'Occaecat Cupidatat', jabatan: 'Graphic Designer', unit: 'Mahasiswa JTI' },
                { nama: 'Proident Sunt', jabatan: 'Social Media Manager', unit: 'Mahasiswa JAN' },
            ],
            tugas: [
                'Pengembangan website APM',
                'Desain grafis dan branding',
                'Pengelolaan media sosial',
                'Dokumentasi multimedia'
            ],
            warna: 'from-purple-500 to-pink-600'
        },
        {
            nama: 'Divisi Kerjasama & Sponsorship',
            kepala: {
                nama: 'Culpa Qui Officia, S.E., M.M.',
                jabatan: 'Kepala Divisi',
                nip: '000000000000000009',
                unit: 'Jurusan Akuntansi',
                foto: null,
            },
            anggota: [
                { nama: 'Deserunt Mollit, S.E.', jabatan: 'Koordinator Sponsorship', unit: 'JAK' },
                { nama: 'Anim Id Est', jabatan: 'Staff Partnership', unit: 'Mahasiswa JAN' },
            ],
            tugas: [
                'Pencarian sponsor kegiatan',
                'Kerjasama dengan industri',
                'Pengelolaan MoU',
                'Hubungan alumni'
            ],
            warna: 'from-cyan-500 to-blue-600'
        },
    ],
    koordinatorJurusan: [
        { jurusan: 'Jurusan Teknologi Informasi', kode: 'JTI', nama: 'Lorem Ipsum, S.T., M.T.', foto: null },
        { jurusan: 'Jurusan Teknik Elektro', kode: 'JTE', nama: 'Dolor Sit Amet, M.T.', foto: null },
        { jurusan: 'Jurusan Teknik Mesin', kode: 'JTM', nama: 'Consectetur Adipiscing, M.T.', foto: null },
        { jurusan: 'Jurusan Teknik Sipil', kode: 'JTS', nama: 'Elit Sed Do, M.T.', foto: null },
        { jurusan: 'Jurusan Teknik Kimia', kode: 'JTK', nama: 'Eiusmod Tempor, M.T.', foto: null },
        { jurusan: 'Jurusan Akuntansi', kode: 'JAK', nama: 'Incididunt Labore, M.M.', foto: null },
        { jurusan: 'Jurusan Administrasi Niaga', kode: 'JAN', nama: 'Dolore Magna, M.M.', foto: null },
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
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
            {/* Header */}
            <div className={`bg-gradient-to-r ${divisi.warna} px-5 py-4`}>
                <h3 className="font-bold text-white text-lg">{divisi.nama}</h3>
            </div>

            {/* Kepala Divisi */}
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
            <div className="p-5 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Tugas Utama</p>
                <ul className="grid grid-cols-2 gap-2">
                    {divisi.tugas.map((t, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                            <Star className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                            {t}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Anggota (Collapsible) */}
            <div className="p-5">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <span className="text-sm font-semibold text-gray-700">
                        Anggota Tim ({divisi.anggota.length})
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                    <div className="mt-4 space-y-3">
                        {divisi.anggota.map((anggota, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm">
                                    {anggota.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{anggota.nama}</p>
                                    <p className="text-xs text-gray-500">{anggota.jabatan} • {anggota.unit}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
                                Struktur kepengurusan Ajang Prestasi Mahasiswa Politeknik Negeri Malang periode 2025-2026
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/about">
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

                {/* Info Periode */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Periode Kepengurusan 2025-2026</h3>
                            <p className="text-sm text-gray-600">SK Direktur No. 123/PL4/HK/2025 tentang Penetapan Pengurus APM</p>
                        </div>
                    </div>
                    <Badge variant="accent" className="self-start md:self-center">
                        <Star className="w-3 h-3 mr-1" /> Aktif
                    </Badge>
                </div>

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

                    {/* Level 2: Ketua */}
                    <div className="flex justify-center mb-8">
                        <div className="text-center">
                            <Badge variant="primary" className="mb-3">
                                <Crown className="w-3 h-3 mr-1" /> Ketua
                            </Badge>
                            <PersonCard
                                {...strukturOrganisasi.ketua}
                                size="lg"
                                showTugas={true}
                                gradient="from-primary to-primary-700"
                            />
                        </div>
                    </div>

                    {/* Connector Line */}
                    <div className="flex justify-center mb-8">
                        <div className="w-0.5 h-8 bg-primary"></div>
                    </div>

                    {/* Level 3: Wakil Ketua */}
                    <div className="flex justify-center mb-8">
                        <div className="text-center">
                            <Badge variant="secondary" className="mb-3">Wakil Ketua</Badge>
                            <PersonCard
                                {...strukturOrganisasi.wakil}
                                size="md"
                                showTugas={true}
                                gradient="from-secondary to-secondary-600"
                            />
                        </div>
                    </div>

                    {/* Connector Lines to Sekretaris & Bendahara */}
                    <div className="flex justify-center mb-8">
                        <div className="relative w-full max-w-md">
                            <div className="absolute left-1/2 top-0 w-0.5 h-8 bg-primary -translate-x-1/2"></div>
                            <div className="absolute left-1/4 top-8 right-1/4 h-0.5 bg-primary"></div>
                            <div className="absolute left-1/4 top-8 w-0.5 h-8 bg-primary"></div>
                            <div className="absolute right-1/4 top-8 w-0.5 h-8 bg-primary"></div>
                            <div className="h-16"></div>
                        </div>
                    </div>

                    {/* Level 4: Sekretaris & Bendahara */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
                        <div className="text-center">
                            <Badge variant="outline" className="mb-3 bg-blue-50 text-blue-700 border-blue-200">Sekretaris</Badge>
                            <PersonCard
                                {...strukturOrganisasi.sekretaris}
                                size="md"
                                showTugas={true}
                                gradient="from-blue-500 to-indigo-600"
                            />
                        </div>
                        <div className="text-center">
                            <Badge variant="outline" className="mb-3 bg-emerald-50 text-emerald-700 border-emerald-200">Bendahara</Badge>
                            <PersonCard
                                {...strukturOrganisasi.bendahara}
                                size="md"
                                showTugas={true}
                                gradient="from-emerald-500 to-teal-600"
                            />
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
                        <p className="text-gray-600 mt-2">5 divisi yang menjalankan program kerja APM</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {strukturOrganisasi.divisi.map((divisi, index) => (
                            <DivisiCard key={index} divisi={divisi} />
                        ))}
                    </div>
                </div>

                {/* Koordinator Jurusan */}
                <div className="mb-16">
                    <div className="text-center mb-8">
                        <Badge variant="secondary" className="mb-3">
                            <GraduationCap className="w-3 h-3 mr-1" /> Koordinator
                        </Badge>
                        <h2 className="text-xl font-bold text-gray-900">Koordinator APM Per Jurusan</h2>
                        <p className="text-gray-600 mt-2">Perwakilan APM di setiap jurusan</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {strukturOrganisasi.koordinatorJurusan.map((koord, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-shadow"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge variant="primary" size="sm">{koord.kode}</Badge>
                                    <span className="text-xs text-gray-500">{koord.jurusan}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                                        {koord.nama.split(' ').slice(0, 2).map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{koord.nama}</p>
                                        <p className="text-xs text-primary">Koordinator</p>
                                    </div>
                                </div>
                            </div>
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
