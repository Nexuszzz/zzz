import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb, Button } from '@/components/ui';
import { BookOpen, ArrowLeft, FileText, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Panduan Expo | APM Polinema',
    description: 'Panduan lengkap untuk mengikuti expo dan pameran',
};

export default function PanduanExpoPage() {
    const features = [
        {
            icon: FileText,
            title: 'Syarat Pendaftaran',
            description: 'Dokumen dan persyaratan untuk mengikuti expo',
            gradient: 'from-blue-500 to-blue-600',
        },
        {
            icon: Calendar,
            title: 'Timeline Kegiatan',
            description: 'Jadwal lengkap dari persiapan hingga acara',
            gradient: 'from-purple-500 to-purple-600',
        },
        {
            icon: CheckCircle,
            title: 'Checklist Persiapan',
            description: 'Daftar hal yang perlu disiapkan sebelum expo',
            gradient: 'from-emerald-500 to-emerald-600',
        },
        {
            icon: AlertCircle,
            title: 'Tips & Trik',
            description: 'Saran dan strategi dari peserta sebelumnya',
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
                            { label: 'Panduan' },
                        ]}
                        className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white mb-6"
                    />
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-heading">Panduan Expo</h1>
                            <p className="text-white/80 mt-1">Panduan lengkap mengikuti expo</p>
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
                                <BookOpen className="w-10 h-10 text-white" />
                            </div>
                            
                            <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
                                Dalam Pengembangan
                            </span>
                            
                            <h2 className="text-2xl lg:text-3xl font-bold text-text-main mb-4">
                                Panduan Expo Sedang Dikembangkan
                            </h2>
                            
                            <p className="text-text-muted text-lg mb-6 max-w-2xl mx-auto">
                                Sistem panduan lengkap untuk mengikuti expo masih dalam tahap pengembangan. Fitur ini akan berisi tutorial step-by-step, checklist persiapan, dan tips sukses mengikuti expo.
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
                                <BookOpen className="w-5 h-5 text-secondary" />
                                Konten Panduan Yang Akan Tersedia
                            </h3>
                            <ul className="space-y-2 text-text-muted text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-secondary mt-0.5">•</span>
                                    <span>Alur pendaftaran expo dari awal hingga akhir</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-secondary mt-0.5">•</span>
                                    <span>Dokumen yang wajib disiapkan peserta</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-secondary mt-0.5">•</span>
                                    <span>Timeline persiapan (H-30 hingga hari-H)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-secondary mt-0.5">•</span>
                                    <span>Tips setup booth dan display karya yang menarik</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-secondary mt-0.5">•</span>
                                    <span>Cara presentasi yang efektif ke pengunjung</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-secondary mt-0.5">•</span>
                                    <span>Video tutorial dan dokumentasi expo sebelumnya</span>
                                </li>
                            </ul>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/expo">
                                <Button variant="primary" size="lg" className="bg-secondary hover:bg-secondary/90">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Daftar Expo
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
