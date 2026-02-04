import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb, Button } from '@/components/ui';
import { FileBarChart, ArrowLeft, Users, Eye, TrendingUp, Calendar, BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Laporan Kunjungan | APM Polinema',
    description: 'Laporan statistik kunjungan expo dan pameran',
};

export default function LaporanExpoPage() {
    const features = [
        {
            icon: Users,
            title: 'Total Pengunjung',
            description: 'Jumlah pengunjung dan demografi peserta expo',
            gradient: 'from-blue-500 to-blue-600',
        },
        {
            icon: Eye,
            title: 'Project Terpopuler',
            description: 'Proyek dengan kunjungan booth terbanyak',
            gradient: 'from-purple-500 to-purple-600',
        },
        {
            icon: TrendingUp,
            title: 'Rating & Feedback',
            description: 'Penilaian dan testimoni dari pengunjung',
            gradient: 'from-emerald-500 to-emerald-600',
        },
        {
            icon: BarChart3,
            title: 'Analisis Data',
            description: 'Grafik dan insight dari setiap expo',
            gradient: 'from-amber-400 to-amber-500',
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Header */}
            <section className="bg-gradient-to-br from-secondary via-secondary to-primary text-white">
                <div className="container-apm py-12">
                    <Breadcrumb
                        items={[
                            { label: 'Expo', href: '/expo' },
                            { label: 'Laporan Kunjungan' },
                        ]}
                        className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white mb-6"
                    />
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <FileBarChart className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-heading">Laporan Kunjungan</h1>
                            <p className="text-white/80 mt-1">Statistik kunjungan expo sebelumnya</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coming Soon Content */}
            <section className="py-16">
                <div className="container-apm">
                    <div className="max-w-4xl mx-auto">
                        {/* Main Coming Soon Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 lg:p-12 text-center shadow-sm mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-primary mb-6 shadow-lg">
                                <FileBarChart className="w-10 h-10 text-white" />
                            </div>
                            
                            <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
                                Dalam Pengembangan
                            </span>
                            
                            <h2 className="text-2xl lg:text-3xl font-bold text-text-main mb-4">
                                Laporan Kunjungan Sedang Dikembangkan
                            </h2>
                            
                            <p className="text-text-muted text-lg mb-6 max-w-2xl mx-auto">
                                Sistem pelaporan dan analisis data kunjungan expo masih dalam tahap pengembangan. Fitur ini akan menampilkan statistik lengkap dari setiap event expo.
                            </p>

                            <div className="flex items-center justify-center gap-2 text-secondary mb-8">
                                <Calendar className="w-5 h-5" />
                                <span className="font-medium">Estimasi: Q2 2026</span>
                            </div>
                        </div>

                        {/* Features Preview */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 shadow-md`}>
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-text-main text-lg mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-text-muted text-sm">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Info Box */}
                        <div className="bg-gradient-to-br from-secondary/5 to-primary/5 rounded-xl border border-secondary/10 p-6 mb-8">
                            <h3 className="font-semibold text-text-main mb-3 flex items-center gap-2">
                                <FileBarChart className="w-5 h-5 text-secondary" />
                                Data Yang Akan Ditampilkan
                            </h3>
                            <ul className="space-y-2 text-text-muted text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-secondary mt-0.5">•</span>
                                    <span>Total jumlah pengunjung per expo event</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-secondary mt-0.5">•</span>
                                    <span>Jumlah proyek/karya yang dipamerkan</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-secondary mt-0.5">•</span>
                                    <span>Rating kepuasan pengunjung (1-5 bintang)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-secondary mt-0.5">•</span>
                                    <span>Booth/proyek dengan kunjungan terbanyak</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-secondary mt-0.5">•</span>
                                    <span>Demografi pengunjung (mahasiswa, dosen, umum)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-secondary mt-0.5">•</span>
                                    <span>Grafik tren kunjungan dari tahun ke tahun</span>
                                </li>
                            </ul>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/expo">
                                <Button variant="primary" size="lg" className="bg-secondary hover:bg-secondary/90">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Lihat Expo Mendatang
                                </Button>
                            </Link>
                            <Link href="/expo">
                                <Button variant="outline" size="lg">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Kembali ke Expo
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
