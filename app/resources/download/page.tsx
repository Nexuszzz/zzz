import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb, Button, Badge } from '@/components/ui';
import { Download, ArrowLeft, FileText, Video, BookOpen, FileCheck, Lightbulb } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Download Materi | APM Polinema',
    description: 'Download materi persiapan lomba dari APM',
};

const upcomingMaterials = [
    {
        icon: FileText,
        title: 'Panduan Proposal Lomba',
        description: 'Panduan lengkap struktur dan cara menulis proposal untuk berbagai jenis kompetisi',
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700'
    },
    {
        icon: FileCheck,
        title: 'Template Presentasi',
        description: 'Template slide presentasi dan pitch deck yang profesional dan menarik',
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700'
    },
    {
        icon: Video,
        title: 'Video Tutorial',
        description: 'Tutorial video lengkap tentang persiapan dan strategi mengikuti kompetisi',
        color: 'from-pink-500 to-pink-600',
        bgColor: 'bg-pink-50',
        textColor: 'text-pink-700'
    },
    {
        icon: BookOpen,
        title: 'E-book & Modul',
        description: 'Materi pembelajaran digital untuk meningkatkan kemampuan teknis dan soft skill',
        color: 'from-emerald-500 to-emerald-600',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700'
    },
    {
        icon: Lightbulb,
        title: 'Studi Kasus Pemenang',
        description: 'Contoh proposal dan karya dari mahasiswa yang berhasil meraih juara',
        color: 'from-amber-500 to-amber-600',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700'
    },
];

export default async function DownloadPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Header - APM Style */}
            <section className="bg-gradient-to-br from-primary via-primary-600 to-secondary text-white">
                <div className="container-apm py-12">
                    <Breadcrumb
                        items={[
                            { label: 'Resources', href: '/resources' },
                            { label: 'Download Materi' },
                        ]}
                        className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white mb-6"
                    />
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <Download className="w-8 h-8 text-accent" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-heading">Download Materi</h1>
                            <p className="text-white/80 mt-1">Materi persiapan lomba siap unduh</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coming Soon Content */}
            <section className="py-16">
                <div className="container-apm">
                    <div className="max-w-5xl mx-auto">
                        {/* Status Badge & Title */}
                        <div className="text-center mb-12">
                            <Badge variant="secondary" className="mb-4">
                                Dalam Pengembangan
                            </Badge>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Segera Hadir</h2>
                            <p className="text-text-muted text-lg max-w-2xl mx-auto">
                                Tim APM sedang menyusun koleksi materi berkualitas untuk mendukung kesuksesan kompetisi mahasiswa Jurusan Teknik Elektro - Prodi Telekomunikasi.
                            </p>
                        </div>

                        {/* Materials Grid */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                            {upcomingMaterials.map((material, index) => {
                                const IconComponent = material.icon;
                                return (
                                    <div
                                        key={index}
                                        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                                    >
                                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${material.color} flex items-center justify-center mb-4`}>
                                            <IconComponent className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-2">{material.title}</h3>
                                        <p className="text-sm text-text-muted leading-relaxed">{material.description}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Info Box */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Download className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Notifikasi Peluncuran</h3>
                                    <p className="text-sm text-gray-600">
                                        Materi download akan tersedia segera. Pantau terus portal APM atau hubungi tim APM untuk informasi lebih lanjut tentang ketersediaan materi.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/resources/panduan">
                                <Button variant="primary" size="lg">
                                    Lihat Panduan Pendaftaran
                                </Button>
                            </Link>
                            <Link href="/resources">
                                <Button variant="outline" size="lg">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Kembali ke Resources
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
