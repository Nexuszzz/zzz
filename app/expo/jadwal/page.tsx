import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb, Button, Badge } from '@/components/ui';
import { Calendar, ArrowLeft, MapPin, Clock, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma/client';

export const metadata: Metadata = {
    title: 'Jadwal Pameran | APM Polinema',
    description: 'Jadwal pameran dan expo yang akan datang',
};

interface ExpoItem {
    id: string;
    slug: string;
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    status: string;
}

async function getUpcomingExpos(): Promise<ExpoItem[]> {
    try {
        const expoData = await prisma.expo.findMany({
            where: {
                is_deleted: false,
                status: { in: ['upcoming', 'ongoing'] },
            },
            orderBy: { tanggal_mulai: 'asc' },
            take: 10,
            select: {
                id: true,
                slug: true,
                nama_event: true,
                tanggal_mulai: true,
                tanggal_selesai: true,
                lokasi: true,
                status: true,
            },
        });

        return expoData.map((item) => ({
            id: String(item.id),
            slug: item.slug || '',
            title: item.nama_event || '',
            startDate: item.tanggal_mulai?.toISOString() || '',
            endDate: item.tanggal_selesai?.toISOString() || '',
            location: item.lokasi || '',
            status: item.status || 'upcoming',
        }));
    } catch {
        return [];
    }
}

function formatDate(start: string, end?: string): string {
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const startDate = new Date(start);
    if (end && end !== start) {
        const endDate = new Date(end);
        return `${startDate.toLocaleDateString('id-ID', { day: 'numeric' })} - ${endDate.toLocaleDateString('id-ID', opts)}`;
    }
    return startDate.toLocaleDateString('id-ID', opts);
}

export default async function JadwalExpoPage() {
    const expos = await getUpcomingExpos();

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Header - APM Style */}
            <section className="bg-gradient-to-br from-primary via-primary-600 to-primary-700 text-white">
                <div className="container-apm py-12">
                    <Breadcrumb
                        items={[
                            { label: 'Expo', href: '/expo' },
                            { label: 'Jadwal Pameran' },
                        ]}
                        className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white mb-6"
                    />
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-accent" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-heading">Jadwal Pameran</h1>
                            <p className="text-white/80 mt-1">Daftar expo dan pameran mendatang</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-10">
                <div className="container-apm">
                    {expos.length > 0 ? (
                        <div className="space-y-4">
                            {expos.map((expo) => (
                                <div
                                    key={expo.id}
                                    className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-text-main text-lg">{expo.title}</h3>
                                                <Badge variant={expo.status === 'ongoing' ? 'success' : 'info'}>
                                                    {expo.status === 'ongoing' ? 'Berlangsung' : 'Mendatang'}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4 text-primary" />
                                                    {formatDate(expo.startDate, expo.endDate)}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4 text-secondary" />
                                                    {expo.location}
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={`/expo/${expo.slug}`}>
                                            <Button variant="outline" size="sm">
                                                Detail <ArrowRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                            <Calendar className="w-12 h-12 text-text-muted mx-auto mb-4" />
                            <h3 className="font-semibold text-text-main mb-2">Belum Ada Jadwal</h3>
                            <p className="text-text-muted">Tidak ada expo mendatang. Cek kembali nanti.</p>
                        </div>
                    )}

                    {/* Back Button */}
                    <div className="mt-12 text-center">
                        <Link href="/expo">
                            <Button variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali ke Expo
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
