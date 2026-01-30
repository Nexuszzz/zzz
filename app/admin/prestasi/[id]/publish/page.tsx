'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Save,
  Loader2,
  Image as ImageIcon,
  FileText,
  Eye,
  EyeOff,
  Check,
  ExternalLink,
  Link as LinkIcon,
  Star,
  Globe,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import { BackButton } from '@/components/admin/BackButton';

interface Submission {
  id: number;
  judul: string;
  nama_lomba: string;
  penyelenggara: string | null;
  tingkat: string;
  peringkat: string;
  tanggal: string | null;
  kategori: string | null;
  deskripsi: string | null;
  status: string;
  team_members: Array<{
    nama: string;
    nim: string;
    prodi: string | null;
    is_ketua: boolean;
  }>;
  documents: Array<{
    id: number;
    type: string;
    label: string | null;
    file_path: string;
    file_name: string;
  }>;
}

interface PublishData {
  submission_id: number;
  judul: string;
  slug: string;
  nama_lomba: string;
  tingkat: string;
  peringkat: string;
  tahun: number;
  kategori: string | null;
  deskripsi: string | null;
  thumbnail: string | null;
  galeri: string[];
  sertifikat: string | null;
  sertifikat_public: boolean;
  link_berita: string;
  link_portofolio: string;
  is_featured: boolean;
  is_published: boolean;
}

export default function AdminPrestasiPublishPage() {
  const router = useRouter();
  const params = useParams();
  const submissionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [existingPrestasi, setExistingPrestasi] = useState<any>(null);
  
  const [publishData, setPublishData] = useState<PublishData>({
    submission_id: 0,
    judul: '',
    slug: '',
    nama_lomba: '',
    tingkat: '',
    peringkat: '',
    tahun: new Date().getFullYear(),
    kategori: null,
    deskripsi: null,
    thumbnail: null,
    galeri: [],
    sertifikat: null,
    sertifikat_public: false,
    link_berita: '',
    link_portofolio: '',
    is_featured: false,
    is_published: true,
  });

  // Fetch submission data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/prestasi/${submissionId}/publish`);
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Gagal memuat data');
      }
      
      setSubmission(result.submission);
      setExistingPrestasi(result.prestasi);
      
      // If prestasi already exists, use existing data
      if (result.prestasi) {
        setPublishData({
          submission_id: result.submission.id,
          judul: result.prestasi.judul,
          slug: result.prestasi.slug,
          nama_lomba: result.prestasi.nama_lomba,
          tingkat: result.prestasi.tingkat,
          peringkat: result.prestasi.peringkat,
          tahun: result.prestasi.tahun,
          kategori: result.prestasi.kategori,
          deskripsi: result.prestasi.deskripsi,
          thumbnail: result.prestasi.thumbnail,
          galeri: result.prestasi.galeri || [],
          sertifikat: result.prestasi.sertifikat,
          sertifikat_public: result.prestasi.sertifikat_public,
          link_berita: result.prestasi.link_berita || '',
          link_portofolio: result.prestasi.link_portofolio || '',
          is_featured: result.prestasi.is_featured,
          is_published: result.prestasi.is_published,
        });
      } else {
        // Initialize from submission
        const sub = result.submission;
        const tanggalYear = sub.tanggal 
          ? new Date(sub.tanggal).getFullYear() 
          : new Date().getFullYear();
        
        // Generate slug from judul
        const slug = sub.judul
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        
        // Find sertifikat
        const sertifikat = sub.documents.find((d: any) => d.type === 'sertifikat');
        
        // Find dokumentasi (potential galeri)
        const dokumentasi = sub.documents
          .filter((d: any) => d.type === 'dokumentasi')
          .map((d: any) => d.file_path);
        
        setPublishData({
          submission_id: sub.id,
          judul: sub.judul,
          slug: slug,
          nama_lomba: sub.nama_lomba,
          tingkat: sub.tingkat,
          peringkat: sub.peringkat,
          tahun: tanggalYear,
          kategori: sub.kategori,
          deskripsi: sub.deskripsi,
          thumbnail: dokumentasi[0] || null, // Default to first image
          galeri: dokumentasi,
          sertifikat: sertifikat?.file_path || null,
          sertifikat_public: false,
          link_berita: '',
          link_portofolio: '',
          is_featured: false,
          is_published: true,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (field: keyof PublishData, value: any) => {
    setPublishData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from judul
    if (field === 'judul') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setPublishData(prev => ({ ...prev, slug }));
    }
  };

  const handleSelectThumbnail = (imagePath: string) => {
    setPublishData(prev => ({
      ...prev,
      thumbnail: prev.thumbnail === imagePath ? null : imagePath
    }));
  };

  const handleToggleGaleri = (imagePath: string) => {
    setPublishData(prev => {
      const galeri = prev.galeri.includes(imagePath)
        ? prev.galeri.filter(p => p !== imagePath)
        : [...prev.galeri, imagePath];
      return { ...prev, galeri };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publishData.judul || !publishData.slug) {
      alert('Judul dan slug wajib diisi');
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/prestasi/${submissionId}/publish`, {
        method: existingPrestasi ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(publishData),
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Gagal menyimpan');
      }
      
      // Redirect back to prestasi list
      router.push('/admin/prestasi');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Get dokumentasi images from submission
  const dokumentasiImages = submission?.documents
    .filter(d => d.type === 'dokumentasi')
    .map(d => d.file_path) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <BackButton />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="space-y-4">
        <BackButton />
        <div className="text-center py-8 text-slate-500">
          Submission tidak ditemukan
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {existingPrestasi ? 'Edit Publikasi' : 'Publikasikan Prestasi'}
          </h1>
          <p className="text-slate-600">
            {existingPrestasi 
              ? 'Perbarui data publikasi prestasi'
              : 'Atur tampilan dan informasi untuk dipublikasikan'
            }
          </p>
        </div>
        {existingPrestasi && (
          <a
            href={`/prestasi/${existingPrestasi.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Lihat di Website
          </a>
        )}
      </div>

      {/* Submission Summary */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <h3 className="font-medium text-slate-700 mb-2">Data Submission</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Nama Prestasi:</span>
            <p className="font-medium">{submission.judul}</p>
          </div>
          <div>
            <span className="text-slate-500">Lomba:</span>
            <p className="font-medium">{submission.nama_lomba}</p>
          </div>
          <div>
            <span className="text-slate-500">Tingkat:</span>
            <p className="font-medium capitalize">{submission.tingkat}</p>
          </div>
          <div>
            <span className="text-slate-500">Peringkat:</span>
            <p className="font-medium">{submission.peringkat}</p>
          </div>
        </div>
        {submission.team_members.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <span className="text-slate-500 text-sm">Tim:</span>
            <p className="text-sm">
              {submission.team_members.map(m => m.nama).join(', ')}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Informasi Publikasi
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Judul Prestasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={publishData.judul}
                onChange={(e) => handleChange('judul', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Juara 1 Hackathon Nasional"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Slug URL <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm">/prestasi/</span>
                <input
                  type="text"
                  value={publishData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="juara-1-hackathon-nasional"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tahun
              </label>
              <input
                type="number"
                value={publishData.tahun}
                onChange={(e) => handleChange('tahun', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                min={2000}
                max={2099}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Deskripsi
              </label>
              <textarea
                value={publishData.deskripsi || ''}
                onChange={(e) => handleChange('deskripsi', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px]"
                placeholder="Deskripsi prestasi..."
              />
            </div>
          </div>
        </div>

        {/* Thumbnail & Galeri */}
        {dokumentasiImages.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Thumbnail & Galeri
            </h2>
            
            <p className="text-sm text-slate-600 mb-4">
              Klik gambar untuk memilih sebagai thumbnail (gambar utama). 
              Centang gambar untuk dimasukkan ke galeri.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {dokumentasiImages.map((img, index) => {
                const isThumbnail = publishData.thumbnail === img;
                const inGaleri = publishData.galeri.includes(img);
                
                return (
                  <div 
                    key={index}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      isThumbnail 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Foto ${index + 1}`}
                      fill
                      className="object-cover cursor-pointer"
                      onClick={() => handleSelectThumbnail(img)}
                    />
                    
                    {/* Thumbnail badge */}
                    {isThumbnail && (
                      <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Thumbnail
                      </div>
                    )}
                    
                    {/* Galeri checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleGaleri(img)}
                      className={`absolute bottom-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        inGaleri 
                          ? 'bg-green-500 text-white' 
                          : 'bg-white/80 border border-slate-300 hover:bg-white'
                      }`}
                    >
                      {inGaleri && <Check className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
            
            <p className="text-xs text-slate-500 mt-3">
              {publishData.galeri.length} foto dipilih untuk galeri
            </p>
          </div>
        )}

        {/* Sertifikat */}
        {publishData.sertifikat && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Sertifikat
            </h2>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-700">Sertifikat</p>
                  <a 
                    href={publishData.sertifikat}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Lihat file
                  </a>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => handleChange('sertifikat_public', !publishData.sertifikat_public)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  publishData.sertifikat_public
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {publishData.sertifikat_public ? (
                  <>
                    <Eye className="w-4 h-4" />
                    Publik
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Admin Only
                  </>
                )}
              </button>
            </div>
            
            <p className="text-xs text-slate-500 mt-2">
              {publishData.sertifikat_public 
                ? 'Sertifikat dapat dilihat oleh pengunjung website'
                : 'Sertifikat hanya dapat dilihat oleh admin'
              }
            </p>
          </div>
        )}

        {/* Links */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Link Terkait
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Link Berita
              </label>
              <input
                type="url"
                value={publishData.link_berita}
                onChange={(e) => handleChange('link_berita', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Link Portofolio
              </label>
              <input
                type="url"
                value={publishData.link_portofolio}
                onChange={(e) => handleChange('link_portofolio', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Pengaturan Tampilan
          </h2>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={publishData.is_published}
                onChange={(e) => handleChange('is_published', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <div>
                <span className="font-medium text-slate-700">Publikasikan</span>
                <p className="text-sm text-slate-500">Tampilkan prestasi ini di website publik</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={publishData.is_featured}
                onChange={(e) => handleChange('is_featured', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <div>
                <span className="font-medium text-slate-700">Jadikan Unggulan</span>
                <p className="text-sm text-slate-500">Tampilkan di section unggulan homepage</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {existingPrestasi ? 'Simpan Perubahan' : 'Publikasikan'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
