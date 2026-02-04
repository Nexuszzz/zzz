import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb, Button } from '@/components/ui';
import { BarChart3, ArrowLeft, TrendingUp, Calendar } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Statistik Prestasi | APM Polinema',
    description: 'Statistik dan analisis prestasi mahasiswa',
};

export default function StatistikPrestasiPage() {
    return (
        <div className="min-h-screen bg-background">
            <section className="bg-gradient-to-br from-accent via-accent to-accent-hover text-white">
                <div className="container-apm py-12">
                    <Breadcrumb
                        items={[
                            { label: 'Prestasi', href: '/prestasi' },
                            { label: 'Statistik' },
                        ]}
                        className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white mb-6"
                    />
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <BarChart3 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-heading">Statistik Prestasi</h1>
                            <p className="text-white/80 mt-1">Analisis data prestasi mahasiswa</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="container-apm">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 lg:p-12 text-center shadow-sm mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent-hover mb-6 shadow-lg">
                                <BarChart3 className="w-10 h-10 text-white" />
                            </div>
                            
                            <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                                Dalam Pengembangan
                            </span>
                            
                            <h2 className="text-2xl lg:text-3xl font-bold text-text-main mb-4">
                                Statistik Prestasi Sedang Dikembangkan
                            </h2>
                            
                            <p className="text-text-muted text-lg mb-6 max-w-2xl mx-auto">
                                Fitur statistik dan analisis data prestasi masih dalam tahap pengembangan. Fitur ini akan menampilkan grafik tren prestasi, perbandingan antar prodi, dan analisis mendalam lainnya.
                            </p>

                            <div className="flex items-center justify-center gap-2 text-accent mb-8">
                                <Calendar className="w-5 h-5" />
                                <span className="font-medium">Estimasi: Q2 2026</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/prestasi">
                                <Button variant="primary" size="lg" className="bg-accent hover:bg-accent-hover">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Lihat Prestasi
                                </Button>
                            </Link>
                            <Link href="/prestasi">
                                <Button variant="outline" size="lg">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Kembali
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
