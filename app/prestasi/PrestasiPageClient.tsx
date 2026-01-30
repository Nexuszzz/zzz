'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Button, 
  Badge, 
  PrestasiCard, 
  SearchInput, 
  Breadcrumb,
  Pagination,
  Select
} from '@/components/ui';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  Trophy, 
  Medal,
  Award,
  Star,
  Filter,
  Grid3X3, 
  List, 
  ChevronDown,
  X
} from 'lucide-react';
import { kategoriLomba, tingkatLomba, fakultasList } from '@/lib/constants';
import type { PrestasiItem } from '@/hooks/useData';

interface PrestasiPageClientProps {
  initialData: PrestasiItem[];
  stats?: {
    total: number;
    juara1: number;
    internasional: number;
    tahunIni: number;
  };
}

// Statistics dengan data real atau default
const getPrestasiStats = (data: PrestasiItem[], stats?: any) => [
  { label: 'Total Prestasi', value: stats?.total || data.length, icon: Trophy, color: 'primary' },
  { label: 'Juara 1', value: stats?.juara1 || data.filter(p => p.peringkat?.toLowerCase().includes('juara 1')).length, icon: Medal, color: 'accent' },
  { label: 'Level Internasional', value: stats?.internasional || data.filter(p => p.tingkat?.toLowerCase() === 'internasional').length, icon: Award, color: 'secondary' },
  { label: 'Tahun Ini', value: stats?.tahunIni || data.filter(p => p.tahun === new Date().getFullYear().toString()).length, icon: Star, color: 'success' },
];

export default function PrestasiPageClient({ initialData, stats }: PrestasiPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string[]>([]);
  const [selectedTingkat, setSelectedTingkat] = useState('');
  const [selectedFakultas, setSelectedFakultas] = useState('');
  const [selectedTahun, setSelectedTahun] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const prestasiStats = getPrestasiStats(initialData, stats);

  // Filter logic
  const filteredPrestasi = initialData.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.namaLomba && p.namaLomba.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchKategori = selectedKategori.length === 0 || selectedKategori.includes(p.kategori);
    const matchTingkat = !selectedTingkat || p.tingkat === selectedTingkat;
    const matchTahun = !selectedTahun || p.tahun === selectedTahun;
    return matchSearch && matchKategori && matchTingkat && matchTahun;
  });

  const toggleKategori = (kategori: string) => {
    setSelectedKategori((prev) =>
      prev.includes(kategori)
        ? prev.filter((k) => k !== kategori)
        : [...prev, kategori]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedKategori([]);
    setSelectedTingkat('');
    setSelectedFakultas('');
    setSelectedTahun('');
  };

  const hasActiveFilters = searchQuery || selectedKategori.length > 0 || selectedTingkat || selectedFakultas || selectedTahun;

  // Generate tahun options dari data
  const tahunOptions = Array.from(new Set(initialData.map(p => p.tahun))).sort((a, b) => b.localeCompare(a));

  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredPrestasi.length / itemsPerPage);
  const paginatedData = filteredPrestasi.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary via-primary-600 to-primary-700">
        <div className="container-apm py-8">
          <Breadcrumb 
            items={[{ label: 'Prestasi & Pencapaian' }]} 
            className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white mb-4"
          />
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Prestasi & Pencapaian
          </h1>
          <p className="text-white/80 mt-1">
            Daftar prestasi membanggakan dari mahasiswa Politeknik Negeri Malang
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {prestasiStats.map((stat) => (
              <div 
                key={stat.label}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/70">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="container-apm py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <SearchInput
                placeholder="Cari prestasi, nama lomba, peserta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                showClearButton
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Kategori */}
              <div className="relative">
                <select
                  className="appearance-none px-4 py-2.5 pr-8 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                  value=""
                  onChange={(e) => toggleKategori(e.target.value)}
                >
                  <option value="" disabled>Kategori</option>
                  {kategoriLomba.map((kat) => (
                    <option key={kat.id} value={kat.name}>{kat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>

              {/* Tingkat */}
              <div className="relative">
                <select
                  className="appearance-none px-4 py-2.5 pr-8 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                  value={selectedTingkat}
                  onChange={(e) => setSelectedTingkat(e.target.value)}
                >
                  <option value="">Semua Tingkat</option>
                  {tingkatLomba.map((tingkat) => (
                    <option key={tingkat.id} value={tingkat.name}>{tingkat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>

              {/* Tahun */}
              <div className="relative">
                <select
                  className="appearance-none px-4 py-2.5 pr-8 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                  value={selectedTahun}
                  onChange={(e) => setSelectedTahun(e.target.value)}
                >
                  <option value="">Semua Tahun</option>
                  {tahunOptions.map((tahun) => (
                    <option key={tahun} value={tahun}>{tahun}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>

              {/* Clear Filter Button */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-text-muted hover:text-text-main"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden ml-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-text-muted hover:bg-gray-50'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-text-muted hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {selectedKategori.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedKategori.map((kat) => (
                <Badge
                  key={kat}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleKategori(kat)}
                >
                  {kat}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container-apm py-8">
        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-text-muted">
            Menampilkan <span className="font-semibold text-text-main">{paginatedData.length}</span> dari <span className="font-semibold">{filteredPrestasi.length}</span> prestasi
          </p>
        </div>

        {/* Prestasi Grid/List */}
        {paginatedData.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-4'
          }>
            {paginatedData.map((prestasi) => (
              <Link key={prestasi.id} href={`/prestasi/${prestasi.slug}`}>
                <PrestasiCard 
                  {...prestasi} 
                  foto={prestasi.thumbnailUrl || (prestasi.galeri && prestasi.galeri.length > 0 ? prestasi.galeri[0] : undefined)}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-text-muted">Tidak ada prestasi yang sesuai dengan filter</p>
            <Button variant="ghost" onClick={clearFilters} className="mt-4">
              Reset Filter
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
