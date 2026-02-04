'use client';

import Link from 'next/link';
import { useNavigate } from '@/hooks';
import { Button, Breadcrumb } from '@/components/ui';
import { 
  Loader2, 
  ArrowLeft, 
  Home, 
  Trophy,
  Calendar,
  BookOpen,
  Search,
  Users,
  ExternalLink
} from 'lucide-react';

export default function LoadingDemoPage() {
  const { navigate, isNavigating } = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-primary via-blue-600 to-cyan-600 text-white">
        <div className="container-apm py-12">
          <Breadcrumb
            items={[
              { label: 'Demo', href: '#' },
              { label: 'Page Loading Test' },
            ]}
            className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white mb-6"
          />
          <h1 className="text-4xl font-bold font-heading mb-4">Page Loading Demo</h1>
          <p className="text-white/90 text-lg max-w-2xl">
            Test implementasi loading indicator saat pindah halaman. Perhatikan loading bar biru di atas saat klik tombol atau link.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container-apm">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Method 1: Next.js Link (Automatic Loading Bar) */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-text-main mb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">1</span>
                </div>
                Next.js Link (Otomatis Loading Bar)
              </h2>
              <p className="text-text-muted mb-4">
                Menggunakan komponen <code className="bg-gray-100 px-2 py-1 rounded text-sm">{"<Link>"}</code> dari Next.js. 
                Loading bar muncul otomatis saat diklik.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/">
                  <Button variant="primary">
                    <Home className="w-4 h-4 mr-2" />
                    Beranda
                  </Button>
                </Link>
                <Link href="/lomba">
                  <Button variant="primary">
                    <Trophy className="w-4 h-4 mr-2" />
                    Lomba
                  </Button>
                </Link>
                <Link href="/prestasi">
                  <Button variant="primary">
                    <Trophy className="w-4 h-4 mr-2" />
                    Prestasi
                  </Button>
                </Link>
                <Link href="/expo">
                  <Button variant="primary">
                    <Calendar className="w-4 h-4 mr-2" />
                    Expo
                  </Button>
                </Link>
                <Link href="/resources">
                  <Button variant="primary">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Resources
                  </Button>
                </Link>
              </div>
            </div>

            {/* Method 2: useNavigate Hook (Manual Loading State) */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-text-main mb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <span className="text-success font-bold">2</span>
                </div>
                useNavigate Hook (Loading Bar + Button State)
              </h2>
              <p className="text-text-muted mb-4">
                Menggunakan <code className="bg-gray-100 px-2 py-1 rounded text-sm">useNavigate()</code> hook. 
                Loading bar muncul + button disabled + text berubah saat loading.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="primary"
                  onClick={() => navigate('/')}
                  disabled={isNavigating}
                >
                  {isNavigating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {!isNavigating && <Home className="w-4 h-4 mr-2" />}
                  {isNavigating ? 'Loading...' : 'Beranda'}
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => navigate('/lomba')}
                  disabled={isNavigating}
                >
                  {isNavigating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {!isNavigating && <Trophy className="w-4 h-4 mr-2" />}
                  {isNavigating ? 'Loading...' : 'Lomba'}
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => navigate('/prestasi')}
                  disabled={isNavigating}
                >
                  {isNavigating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {!isNavigating && <Trophy className="w-4 h-4 mr-2" />}
                  {isNavigating ? 'Loading...' : 'Prestasi'}
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => navigate('/kalender')}
                  disabled={isNavigating}
                >
                  {isNavigating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {!isNavigating && <Calendar className="w-4 h-4 mr-2" />}
                  {isNavigating ? 'Loading...' : 'Kalender'}
                </Button>
              </div>
            </div>

            {/* Method 3: Browser Navigation */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-text-main mb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <span className="text-warning font-bold">3</span>
                </div>
                Browser Back/Forward (Otomatis Loading Bar)
              </h2>
              <p className="text-text-muted mb-4">
                Tekan tombol <strong>Back</strong> atau <strong>Forward</strong> di browser. 
                Loading bar akan muncul otomatis.
              </p>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-sm text-blue-900">
                  💡 <strong>Tips:</strong> Klik salah satu link di atas, lalu tekan tombol Back browser untuk melihat loading bar.
                </p>
              </div>
            </div>

            {/* Visual Feedback Info */}
            <div className="bg-gradient-to-br from-primary/5 to-cyan-50 rounded-xl border border-primary/10 p-6">
              <h3 className="text-lg font-semibold text-text-main mb-3">
                ✨ Visual Feedback yang Ditampilkan
              </h3>
              <ul className="space-y-2 text-text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Loading Bar</strong> - Progress bar berwarna biru di atas halaman (smooth animation 0% → 100%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Button Disabled</strong> - Tombol tidak bisa diklik saat loading (mencegah spam klik)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Text Change</strong> - Text tombol berubah dari "Nama Halaman" → "Loading..."</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Loader Icon</strong> - Icon berputar (spinner) muncul saat loading</span>
                </li>
              </ul>
            </div>

            {/* Implementation Info */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-text-main mb-3">
                📝 Implementasi
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-text-main mb-2">Files yang dibuat:</h4>
                  <ul className="text-sm text-text-muted space-y-1 ml-4">
                    <li>• <code className="bg-gray-100 px-2 py-0.5 rounded">hooks/usePageLoading.ts</code></li>
                    <li>• <code className="bg-gray-100 px-2 py-0.5 rounded">hooks/useNavigate.ts</code></li>
                    <li>• <code className="bg-gray-100 px-2 py-0.5 rounded">components/layout/PageLoadingBar.tsx</code></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-text-main mb-2">Files yang diupdate:</h4>
                  <ul className="text-sm text-text-muted space-y-1 ml-4">
                    <li>• <code className="bg-gray-100 px-2 py-0.5 rounded">components/layout/ConditionalLayout.tsx</code></li>
                    <li>• <code className="bg-gray-100 px-2 py-0.5 rounded">hooks/index.ts</code></li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <Link 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm flex items-center gap-1"
                  >
                    <BookOpen className="w-4 h-4" />
                    Lihat dokumentasi lengkap di docs/PAGE-LOADING-GUIDE.md
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="flex justify-center pt-4">
              <Link href="/">
                <Button variant="outline" size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Beranda
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
