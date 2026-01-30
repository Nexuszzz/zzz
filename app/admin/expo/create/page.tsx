'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Info } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import ImageUpload from '@/components/admin/ImageUpload';

interface ExpoFormData {
  nama_event: string;
  slug: string;
  tema: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  lokasi: string;
  alamat_lengkap: string;
  deskripsi: string;
  biaya_partisipasi: number;
  benefit: string;
  website_resmi: string;
  is_featured: boolean;
  status: string;
  registration_open: boolean;
  registration_deadline: string;
  max_participants: number;
  poster: string;
  tipe_pendaftaran: string;
}

const initialFormData: ExpoFormData = {
  nama_event: '',
  slug: '',
  tema: '',
  tanggal_mulai: '',
  tanggal_selesai: '',
  lokasi: '',
  alamat_lengkap: '',
  deskripsi: '',
  biaya_partisipasi: 0,
  benefit: '',
  website_resmi: '',
  is_featured: false,
  status: 'draft',
  registration_open: false,
  registration_deadline: '',
  max_participants: 0,
  poster: '',
  tipe_pendaftaran: 'internal',
};

const statusOptions = [
  { value: 'draft', label: 'Draft (Belum dipublish)' },
  { value: 'upcoming', label: 'Published (Akan datang)' },
  { value: 'ongoing', label: 'Sedang Berlangsung' },
  { value: 'completed', label: 'Selesai' },
];

const tipePendaftaranOptions = [
  { value: 'internal', label: 'Internal', desc: 'Pendaftaran melalui form di website ini' },
  { value: 'eksternal', label: 'Eksternal', desc: 'Pendaftaran melalui link website penyelenggara' },
  { value: 'none', label: 'Info Only', desc: 'Hanya informasi, tanpa pendaftaran' },
];

export default function CreateExpoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ExpoFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value,
    }));

    if (name === 'nama_event') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/expo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat expo');
      }

      router.push('/admin/expo');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/expo"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tambah Expo Baru</h1>
          <p className="text-slate-600">Isi form untuk menambahkan expo baru</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Informasi Dasar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nama Event <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama_event"
                value={formData.nama_event}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Contoh: Tech Expo Indonesia 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
                placeholder="tech-expo-indonesia-2026"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tema
              </label>
              <input
                type="text"
                name="tema"
                value={formData.tema}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Contoh: Future of Technology"
              />
            </div>
          </div>
        </div>

        {/* Poster Upload */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Poster Expo</h2>
          <ImageUpload
            value={formData.poster}
            onChange={(value) => setFormData(prev => ({ ...prev, poster: value as string }))}
            category="expo"
            label="Upload Poster"
            helperText="Ukuran rekomendasi: 800x1200px (Portrait). Max 5MB."
          />
        </div>

        {/* Tipe Pendaftaran */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Mode Pendaftaran</h2>
          <div className="space-y-3">
            {tipePendaftaranOptions.map(opt => (
              <label 
                key={opt.value}
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.tipe_pendaftaran === opt.value 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="tipe_pendaftaran"
                  value={opt.value}
                  checked={formData.tipe_pendaftaran === opt.value}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium text-slate-800">{opt.label}</span>
                  <p className="text-sm text-slate-500">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
          
          {formData.tipe_pendaftaran === 'eksternal' && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Link Pendaftaran Eksternal <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="website_resmi"
                value={formData.website_resmi}
                onChange={handleChange}
                required={formData.tipe_pendaftaran === 'eksternal'}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://website-penyelenggara.com/daftar"
              />
            </div>
          )}

          {formData.tipe_pendaftaran === 'internal' && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-start gap-3">
              <Info size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-purple-800">
                Pendaftaran akan menggunakan form bawaan website.
              </p>
            </div>
          )}

          {formData.tipe_pendaftaran === 'none' && (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
              <Info size={20} className="text-slate-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">
                Expo ini hanya menampilkan informasi tanpa tombol pendaftaran.
              </p>
            </div>
          )}
        </div>

        {/* Date & Location */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Tanggal & Lokasi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tanggal Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tanggal_mulai"
                value={formData.tanggal_mulai}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tanggal Selesai <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tanggal_selesai"
                value={formData.tanggal_selesai}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Lokasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lokasi"
                value={formData.lokasi}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Contoh: Jakarta"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Alamat Lengkap
              </label>
              <textarea
                name="alamat_lengkap"
                value={formData.alamat_lengkap}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Alamat lengkap venue"
              />
            </div>
          </div>
        </div>

        {/* Registration Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Pengaturan Registrasi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="registration_open"
                  checked={formData.registration_open}
                  onChange={handleChange}
                  className="w-5 h-5 text-purple-600 rounded"
                />
                <div>
                  <span className="font-medium text-slate-800">Buka Registrasi</span>
                  <p className="text-sm text-slate-500">Aktifkan untuk membuka pendaftaran peserta</p>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Deadline Registrasi
              </label>
              <input
                type="date"
                name="registration_deadline"
                value={formData.registration_deadline}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Maksimal Peserta
              </label>
              <input
                type="number"
                name="max_participants"
                value={formData.max_participants}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0 = tidak terbatas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Biaya Partisipasi (Rp)
              </label>
              <input
                type="number"
                name="biaya_partisipasi"
                value={formData.biaya_partisipasi}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0 untuk gratis"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Website Resmi
              </label>
              <input
                type="url"
                name="website_resmi"
                value={formData.website_resmi}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Deskripsi Expo</h2>
          <RichTextEditor
            content={formData.deskripsi}
            onChange={(content) => setFormData(prev => ({ ...prev, deskripsi: content }))}
            placeholder="Tulis deskripsi lengkap tentang expo ini..."
          />
        </div>

        {/* Benefit */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Benefit Peserta</h2>
          <textarea
            name="benefit"
            value={formData.benefit}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Benefit yang didapat peserta..."
          />
        </div>

        {/* Options */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Opsi</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-5 h-5 text-purple-600 rounded"
            />
            <div>
              <span className="font-medium text-slate-800">Tampilkan di Featured</span>
              <p className="text-sm text-slate-500">Expo akan ditampilkan di halaman utama</p>
            </div>
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/expo"
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Simpan Expo</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

