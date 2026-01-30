'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Badge,
  ExpoCard,
  SearchInput,
  Breadcrumb,
  Pagination,
} from '@/components/ui';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  Grid3X3,
  List,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface ExpoItem {
  id: string;
  slug: string;
  title: string;
  tanggal: string;
  lokasi: string;
  deskripsiSingkat?: string;
  peserta?: string;
  status: 'upcoming' | 'ongoing' | 'past';
  kategori?: string;
  posterUrl?: string;
}

interface ExpoSettings {
  is_active: boolean;
  inactive_message: string;
  next_expo_date: string | null;
}

interface ExpoPageClientProps {
  initialData: ExpoItem[];
  settings?: ExpoSettings;
}

export default function ExpoPageClient({ initialData, settings }: ExpoPageClientProps) {
  const [expoData] = useState<ExpoItem[]>(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Check if expo is inactive
  const isInactive = settings && !settings.is_active;

  // Filter by search and tab
  const filteredExpo = expoData.filter((expo) => {
    const matchSearch = !searchQuery ||
      expo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (expo.deskripsiSingkat?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchTab = activeTab === 'all' || expo.status === activeTab;

    return matchSearch && matchTab;
  });

  // Pagination
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredExpo.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpo = filteredExpo.slice(startIndex, startIndex + itemsPerPage);

  // If expo is inactive, show message
  if (isInactive) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="container-apm py-6">
            <Breadcrumb items={[{ label: 'Expo & Pameran' }]} />
            <h1 className="text-2xl lg:text-3xl font-bold text-text-main mt-4">
              Expo & Pameran
            </h1>
          </div>
        </div>

        {/* Inactive Message */}
        <div className="container-apm py-16">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">
              Expo Sedang Tidak Tersedia
            </h2>
            <p className="text-slate-600 mb-6">
              {settings?.inactive_message || 'Belum ada expo saat ini. Nantikan update selanjutnya!'}
            </p>
            
            {settings?.next_expo_date && (
              <div className="inline-flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-lg text-blue-700">
                <Calendar className="w-5 h-5" />
                <span>
                  Expo berikutnya: {new Date(settings.next_expo_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
            
            <div className="mt-8">
              <Link 
                href="/"
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-apm py-6">
          <Breadcrumb items={[{ label: 'Expo & Pameran' }]} />
          <h1 className="text-2xl lg:text-3xl font-bold text-text-main mt-4">
            Expo & Pameran
          </h1>
          <p className="text-text-muted mt-1">
            Ikuti berbagai event expo dan pameran karya mahasiswa
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="container-apm py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <Tabs defaultValue={activeTab} onChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="upcoming">Mendatang</TabsTrigger>
                <TabsTrigger value="ongoing">Berlangsung</TabsTrigger>
                <TabsTrigger value="past">Selesai</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="flex-1 lg:w-80">
                <SearchInput
                  placeholder="Cari event expo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery('')}
                  showClearButton
                />
              </div>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-text-muted hover:bg-gray-50'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-text-muted hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-apm py-8">
        <div className="mb-6">
          <p className="text-sm text-text-muted">
            Menampilkan <span className="font-semibold text-text-main">{filteredExpo.length}</span> event
          </p>
        </div>

        {paginatedExpo.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted">Tidak ada event ditemukan</p>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
            }>
              {paginatedExpo.map((expo) => (
                <ExpoCard key={expo.id} {...expo} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
