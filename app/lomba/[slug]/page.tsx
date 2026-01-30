import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { 
  Button, 
  Badge, 
  Breadcrumb
} from '@/components/ui';
import { Countdown } from '@/components/ui/Countdown';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Trophy, 
  ExternalLink,
  Share2,
  Bookmark,
  Mail,
  Phone,
  Globe,
  FileText,
  Gift,
  CheckCircle
} from 'lucide-react';

async function getLombaBySlug(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/lomba?slug=${slug}`, {
      next: { revalidate: 60 },
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching lomba:', error);
    return null;
  }
}

export default async function LombaDetailPage({ params }: { params: { slug: string } }) {
  const lomba = await getLombaBySlug(params.slug);

  if (!lomba) {
    notFound();
  }

  const lombaDetail = {
    id: lomba.id,
    slug: lomba.slug,
    title: lomba.title,
    deadline: lomba.deadline,
    deadlineDisplay: lomba.deadlineDisplay,
    kategori: lomba.kategori,
    tingkat: lomba.tingkat,
    status: lomba.status,
    penyelenggara: lomba.penyelenggara || 'Belum diisi',
    lokasi: lomba.lokasi || 'Belum diisi',
    biaya: lomba.biaya || 0,
    peserta: lomba.peserta || 'Belum diisi',
    hadiah: Array.isArray(lomba.hadiah) ? lomba.hadiah : [],
    deskripsi: lomba.deskripsi || 'Belum ada deskripsi lengkap.',
    syarat: Array.isArray(lomba.syarat) ? lomba.syarat : [],
    timeline: Array.isArray(lomba.timeline) ? lomba.timeline : [],
    kontakEmail: lomba.kontakEmail || '',
    kontakPhone: lomba.kontakPhone || '',
    kontakWebsite: lomba.kontakWebsite || '',
    linkPendaftaran: lomba.linkPendaftaran || '',
    posterUrl: lomba.posterUrl,
    tags: Array.isArray(lomba.tags) ? lomba.tags : [],
    tipePendaftaran: lomba.tipePendaftaran || lomba.tipe_pendaftaran || 'internal',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header dengan Background */}
      <div className="bg-gradient-to-br from-primary via-primary-600 to-primary-700">
        <div className="container-apm py-6">
          <Breadcrumb 
            items={[
              { label: 'Lomba & Kompetisi', href: '/lomba' },
              { label: lombaDetail.title }
            ]} 
            className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container-apm -mt-2 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Card */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="open">{lombaDetail.status === 'open' ? 'OPEN' : 'CLOSED'}</Badge>
                    <Badge variant="nasional">{lombaDetail.tingkat}</Badge>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-text-main mb-2">
                    {lombaDetail.title}
                  </h1>
                  <p className="text-text-muted">
                    Diselenggarakan oleh <span className="font-medium">{lombaDetail.penyelenggara}</span>
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Bookmark className="w-5 h-5 text-text-muted" />
                  </button>
                  <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Share2 className="w-5 h-5 text-text-muted" />
                  </button>
                </div>
              </div>

              {/* Countdown */}
              <div className="bg-primary/5 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Deadline Pendaftaran</span>
                </div>
                <Countdown targetDate={lombaDetail.deadline} size="sm" />
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Deadline</p>
                    <p className="text-sm font-medium text-text-main">{lombaDetail.deadlineDisplay}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Lokasi</p>
                    <p className="text-sm font-medium text-text-main">{lombaDetail.lokasi}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Peserta</p>
                    <p className="text-sm font-medium text-text-main">{lombaDetail.peserta}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Biaya</p>
                    <p className="text-sm font-medium text-success">
                      {lombaDetail.biaya === 0 ? 'Gratis' : `Rp ${lombaDetail.biaya.toLocaleString('id-ID')}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-text-main mb-4">Deskripsi</h2>
              <div className="prose prose-sm max-w-none text-text-muted">
                {lombaDetail.deskripsi.split('\n').map((paragraph: string, idx: number) => (
                  paragraph.trim() && <p key={idx} className="mb-3">{paragraph.trim()}</p>
                ))}
              </div>
            </div>

            {/* Syarat & Ketentuan */}
            {lombaDetail.syarat.length > 0 && (
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-lg font-semibold text-text-main mb-4">Syarat & Ketentuan</h2>
                <ul className="space-y-3">
                  {lombaDetail.syarat.map((syarat: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-text-muted">{typeof syarat === 'string' ? syarat : syarat.text || ''}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hadiah */}
            {lombaDetail.hadiah.length > 0 && (
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-accent" />
                  Hadiah
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {lombaDetail.hadiah.map((h: any, idx: number) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-lg border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-accent" />
                        <span className="font-semibold text-accent">{h.peringkat || h.title || `Hadiah ${idx + 1}`}</span>
                      </div>
                      <p className="text-lg font-bold text-text-main mb-1">{h.nominal || h.prize || '-'}</p>
                      {h.detail && <p className="text-sm text-text-muted">{h.detail}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {lombaDetail.timeline.length > 0 && (
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Timeline
                </h2>
                <div className="space-y-4">
                  {lombaDetail.timeline.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">{idx + 1}</span>
                        </div>
                        {idx < lombaDetail.timeline.length - 1 && (
                          <div className="w-0.5 flex-1 bg-gray-200 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-text-main">{item.kegiatan || item.activity || '-'}</p>
                        <p className="text-sm text-text-muted">{item.tanggal || item.date || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Poster */}
              {lombaDetail.posterUrl && (
                <div className="bg-white rounded-xl shadow-card overflow-hidden">
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src={lombaDetail.posterUrl}
                      alt={lombaDetail.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {/* CTA Buttons - Conditional based on tipe_pendaftaran */}
              <div className="bg-white rounded-xl shadow-card p-6 space-y-3">
                {/* Internal: Daftar via form internal */}
                {lombaDetail.tipePendaftaran === 'internal' && (
                  <Link href={`/lomba/${lomba.slug}/daftar`}>
                    <Button variant="primary" size="lg" fullWidth>
                      Daftar Sekarang
                    </Button>
                  </Link>
                )}
                
                {/* Eksternal: Daftar via link penyelenggara */}
                {lombaDetail.tipePendaftaran === 'eksternal' && lombaDetail.linkPendaftaran && (
                  <a href={lombaDetail.linkPendaftaran} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" size="lg" fullWidth>
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Daftar di Website Penyelenggara
                    </Button>
                  </a>
                )}
                
                {/* None: Info only, no registration button */}
                {lombaDetail.tipePendaftaran === 'none' && (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-text-muted text-sm">
                      Lomba ini hanya untuk informasi.
                    </p>
                  </div>
                )}
              </div>

              {/* Kontak */}
              {(lombaDetail.kontakEmail || lombaDetail.kontakPhone || lombaDetail.kontakWebsite) && (
                <div className="bg-white rounded-xl shadow-card p-6">
                  <h3 className="font-semibold text-text-main mb-4">Kontak</h3>
                  <div className="space-y-3">
                    {lombaDetail.kontakEmail && (
                      <a href={`mailto:${lombaDetail.kontakEmail}`} className="flex items-center gap-3 text-sm text-text-muted hover:text-primary">
                        <Mail className="w-4 h-4" />
                        {lombaDetail.kontakEmail}
                      </a>
                    )}
                    {lombaDetail.kontakPhone && (
                      <a href={`tel:${lombaDetail.kontakPhone}`} className="flex items-center gap-3 text-sm text-text-muted hover:text-primary">
                        <Phone className="w-4 h-4" />
                        {lombaDetail.kontakPhone}
                      </a>
                    )}
                    {lombaDetail.kontakWebsite && (
                      <a href={lombaDetail.kontakWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-text-muted hover:text-primary">
                        <Globe className="w-4 h-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {lombaDetail.tags.length > 0 && (
                <div className="bg-white rounded-xl shadow-card p-6">
                  <h3 className="font-semibold text-text-main mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {lombaDetail.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
