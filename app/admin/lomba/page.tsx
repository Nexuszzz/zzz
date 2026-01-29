'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  RotateCcw,
  ChevronLeft, 
  ChevronRight,
  Star,
  ExternalLink,
  Users
} from 'lucide-react';
import { BackButton } from '@/components/admin/BackButton';

interface Lomba {
  id: number;
  namaLomba: string;
  slug: string;
  kategori: string;
  tingkat: string;
  penyelenggara: string;
  deadline: string;
  tanggalPelaksanaan: string;
  status: string;
  isFeatured: boolean;
  isDeleted: boolean;
  dateCreated: string;
  posterUrl: string | null;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminLombaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [data, setData] = useState<Lomba[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [showDeleted, setShowDeleted] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', (meta.page).toString());
      params.set('limit', meta.limit.toString());
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (showDeleted) params.set('includeDeleted', 'true');

      const res = await fetch(`/api/admin/lomba?${params.toString()}`);
      const result = await res.json();
      
      if (res.ok) {
        setData(result.data);
        setMeta(result.meta);
      }
    } catch (error) {
      console.error('Error fetching lomba:', error);
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, search, status, showDeleted]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMeta(prev => ({ ...prev, page: 1 }));
    fetchData();
  };

  const handleDelete = async (id: number, permanent = false) => {
    const message = permanent 
      ? 'Yakin ingin menghapus permanen? Data tidak bisa dikembalikan.'
      : 'Yakin ingin menghapus lomba ini?';
    
    if (!confirm(message)) return;

    try {
      const url = permanent ? `/api/admin/lomba/${id}?permanent=true` : `/api/admin/lomba/${id}`;
      const res = await fetch(url, { method: 'DELETE' });
      
      if (res.ok) {
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || 'Gagal menghapus lomba');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Terjadi kesalahan');
    }
  };

  const handleRestore = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/lomba/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_deleted: false }),
      });
      
      if (res.ok) {
        fetchData();
      } else {
        alert('Gagal restore lomba');
      }
    } catch (error) {
      console.error('Error restoring:', error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      upcoming: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      closed: 'bg-slate-100 text-slate-800',
    };
    return styles[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Back to Dashboard */}
      <BackButton />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Lomba</h1>
          <p className="text-slate-600">Daftar semua lomba yang tersedia</p>
        </div>
        <Link
          href="/admin/lomba/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          <span>Tambah Lomba</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama lomba atau penyelenggara..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setMeta(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="closed">Closed</option>
          </select>

          {/* Show Deleted Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => {
                setShowDeleted(e.target.checked);
                setMeta(prev => ({ ...prev, page: 1 }));
              }}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-slate-600">Tampilkan Terhapus</span>
          </label>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Lomba</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Kategori</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Tingkat</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Deadline</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Status</th>
                <th className="text-center py-4 px-4 text-sm font-medium text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Tidak ada data lomba
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`border-t border-slate-100 hover:bg-slate-50 ${item.isDeleted ? 'bg-red-50' : ''}`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {item.posterUrl ? (
                          <img 
                            src={item.posterUrl} 
                            alt={item.namaLomba}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                            No img
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-800">{item.namaLomba}</p>
                            {item.isFeatured && (
                              <Star size={14} className="text-yellow-500 fill-yellow-500" />
                            )}
                            {item.isDeleted && (
                              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Terhapus</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">{item.penyelenggara}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-600 capitalize">{item.kategori}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-600 capitalize">{item.tingkat}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-600">{formatDate(item.deadline)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/lomba/${item.id}/registrations`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Lihat Pendaftar"
                        >
                          <Users size={16} />
                        </Link>
                        <Link
                          href={`/lomba/${item.slug}`}
                          target="_blank"
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Lihat"
                        >
                          <ExternalLink size={16} />
                        </Link>
                        <Link
                          href={`/admin/lomba/${item.id}/edit`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </Link>
                        {item.isDeleted ? (
                          <>
                            <button
                              onClick={() => handleRestore(item.id)}
                              className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                              title="Restore"
                            >
                              <RotateCcw size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, true)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus Permanen"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Menampilkan {((meta.page - 1) * meta.limit) + 1} - {Math.min(meta.page * meta.limit, meta.total)} dari {meta.total} data
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMeta(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={meta.page <= 1}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-slate-600">
                {meta.page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setMeta(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={meta.page >= meta.totalPages}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

