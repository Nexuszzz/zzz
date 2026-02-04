import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb, Button, Badge } from '@/components/ui';
import { FileText, ArrowLeft, File, Presentation, Users, Mail, DollarSign, Briefcase } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Template Proposal | APM Polinema',
    description: 'Download template proposal untuk berbagai jenis lomba',
};

const templateCategories = [
    {
        icon: File,
        title: 'Template PKM',
        description: 'Template lengkap untuk Program Kreativitas Mahasiswa (PKM-GT, PKM-KC, PKM-PE, PKM-RSH, dan lainnya)',
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
    },
    {
        icon: Presentation,
        title: 'Business Model Canvas',
        description: 'Template BMC dan pitch deck untuk kompetisi startup dan business plan',
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
    },
    {
        icon: Briefcase,
        title: 'Proposal Startup',
        description: 'Template proposal untuk kompetisi kewirausahaan dan startup competition',
        color: 'from-indigo-500 to-indigo-600',
        bgColor: 'bg-indigo-50',
    },
    {
        icon: FileText,
        title: 'Proposal IoT & Robotika',
        description: 'Template khusus untuk kompetisi teknologi, IoT, robotika, dan embedded system',
        color: 'from-cyan-500 to-cyan-600',
        bgColor: 'bg-cyan-50',
    },
    {
        icon: Users,
        title: 'CV & Portfolio',
        description: 'Template CV profesional dan portfolio mahasiswa untuk pendaftaran kompetisi',
        color: 'from-emerald-500 to-emerald-600',
        bgColor: 'bg-emerald-50',
    },
    {
        icon: Mail,
        title: 'Surat Rekomendasi',
        description: 'Template surat rekomendasi dari dosen pembimbing untuk keperluan kompetisi',
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-50',
    },
    {
        icon: DollarSign,
        title: 'Rencana Anggaran Biaya',
        description: 'Template RAB (Rencana Anggaran Biaya) untuk proposal kompetisi',
        color: 'from-amber-500 to-amber-600',
        bgColor: 'bg-amber-50',
    },
];

export default async function TemplatePage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Header - APM Style */}
            <section className="bg-gradient-to-br from-secondary via-secondary to-primary text-white">
                <div className="container-apm py-12">
                    <Breadcrumb
                        items={[
                            { label: 'Resources', href: '/resources' },
                            { label: 'Template Proposal' },
                        ]}
                        className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white mb-6"
                    />
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-heading">Template Proposal</h1>
                            <p className="text-white/80 mt-1">Template siap pakai untuk berbagai jenis lomba</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coming Soon Content */}
            <section className="py-16">
                <div className="container-apm">
                    <div className="max-w-6xl mx-auto">
                        {/* Status Badge & Title */}
                        <div className="text-center mb-12">
                            <Badge variant="secondary" className="mb-4">
                                Dalam Pengembangan
                            </Badge>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Segera Hadir</h2>
                            <p className="text-text-muted text-lg max-w-2xl mx-auto">
                                Koleksi template profesional yang telah disesuaikan dengan standar kompetisi nasional dan internasional untuk mahasiswa Prodi Telekomunikasi.
                            </p>
                        </div>

                        {/* Templates Grid */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                            {templateCategories.map((template, index) => {
                                const IconComponent = template.icon;
                                return (
                                    <div
                                        key={index}
                                        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                                    >
                                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center mb-4`}>
                                            <IconComponent className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-2">{template.title}</h3>
                                        <p className="text-sm text-text-muted leading-relaxed">{template.description}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Info Box */}
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Format Template</h3>
                                    <p className="text-sm text-gray-600">
                                        Semua template akan tersedia dalam format DOCX (Microsoft Word) dan PDF yang dapat diedit sesuai kebutuhan. Sudah dilengkapi dengan panduan penggunaan dan contoh pengisian.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/resources/tips">
                                <Button variant="primary" size="lg">
                                    Lihat Tips & Strategi
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
