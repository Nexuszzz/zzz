'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Trophy,
  Upload,
  Users,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button, Breadcrumb } from '@/components/ui';
import {
  FormField,
  TextAreaField,
  SelectField,
  FileUpload,
  TeamMemberInput,
  TeamMember
} from '@/components/forms';

const tingkatOptions = [
  { value: 'regional', label: 'Regional' },
  { value: 'nasional', label: 'Nasional' },
  { value: 'internasional', label: 'Internasional' },
];

const kategoriOptions = [
  { value: 'teknologi', label: 'Teknologi' },
  { value: 'bisnis', label: 'Bisnis' },
  { value: 'desain', label: 'Desain' },
  { value: 'akademik', label: 'Akademik' },
  { value: 'olahraga', label: 'Olahraga' },
  { value: 'seni', label: 'Seni & Budaya' },
  { value: 'lainnya', label: 'Lainnya' },
];

// Program studi options - only Telkom programs
const prodiOptions = [
  { value: 'd3-tektel', label: 'D3 Teknik Telekomunikasi' },
  { value: 'd4-jtd', label: 'D4 Jaringan Telekomunikasi Digital' },
];

interface FormData {
  judul: string;
  nama_lomba: string;
  penyelenggara: string;
  tingkat: string;
  peringkat: string;
  tanggal: string;
  kategori: string;
  deskripsi: string;
  submitter_name: string;
  submitter_nim: string;
  submitter_email: string;
  submitter_whatsapp: string;
}

export default function SubmitPrestasiPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    judul: '',
    nama_lomba: '',
    penyelenggara: '',
    tingkat: '',
    peringkat: '',
    tanggal: '',
    kategori: '',
    deskripsi: '',
    submitter_name: '',
    submitter_nim: '',
    submitter_email: '',
    submitter_whatsapp: '',
  });
  const [sertifikat, setSertifikat] = useState<File | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { nama: '', nim: '', role: 'ketua', angkatan: '' },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is changed
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.judul.trim()) newErrors.judul = 'Nama prestasi wajib diisi';
    if (!formData.nama_lomba.trim()) newErrors.nama_lomba = 'Nama lomba wajib diisi';
    if (!formData.tingkat) newErrors.tingkat = 'Tingkat wajib dipilih';
    if (!formData.peringkat.trim()) newErrors.peringkat = 'Peringkat wajib diisi';
    if (!formData.tanggal) newErrors.tanggal = 'Tanggal wajib diisi';
    if (!formData.kategori) newErrors.kategori = 'Kategori wajib dipilih';
    if (!formData.submitter_name.trim()) newErrors.submitter_name = 'Nama wajib diisi';
    if (!formData.submitter_nim.trim()) newErrors.submitter_nim = 'NIM wajib diisi';
    if (!formData.submitter_email.trim()) newErrors.submitter_email = 'Email wajib diisi';
    if (!formData.submitter_whatsapp.trim()) newErrors.submitter_whatsapp = 'Nomor WhatsApp wajib diisi';
    if (!sertifikat) newErrors.sertifikat = 'Sertifikat wajib diupload';

    // WhatsApp validation (Indonesian phone number)
    if (formData.submitter_whatsapp && !/^(\+62|62|0)8[1-9][0-9]{7,11}$/.test(formData.submitter_whatsapp.replace(/[\s-]/g, ''))) {
      newErrors.submitter_whatsapp = 'Format nomor WhatsApp tidak valid';
    }

    // Email validation
    if (formData.submitter_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.submitter_email)) {
      newErrors.submitter_email = 'Format email tidak valid';
    }

    // NIM validation
    if (formData.submitter_nim && !/^\d+$/.test(formData.submitter_nim)) {
      newErrors.submitter_nim = 'NIM harus berupa angka';
    }

    // Team validation
    const ketua = teamMembers[0];
    if (!ketua.nama.trim()) newErrors['members.0.nama'] = 'Nama ketua wajib diisi';
    if (!ketua.nim.trim()) newErrors['members.0.nim'] = 'NIM ketua wajib diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const submitFormData = new FormData();

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitFormData.append(key, value);
      });

      // Add file
      if (sertifikat) {
        submitFormData.append('sertifikat', sertifikat);
      }

      // Add team members
      submitFormData.append('tim', JSON.stringify(teamMembers));

      const response = await fetch('/api/prestasi/submit', {
        method: 'POST',
        body: submitFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrorMessage(result.error || 'Gagal mengirim data');
        }
        setSubmitStatus('error');
        return;
      }

      setSubmitStatus('success');
    } catch (error) {
      console.error('Submit error:', error);
      setErrorMessage('Terjadi kesalahan. Silakan coba lagi.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-apm max-w-2xl">
          <div className="bg-white rounded-2xl shadow-card p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Prestasi Berhasil Disubmit!
            </h1>
            <p className="text-gray-600 mb-6">
              Terima kasih telah mengirimkan prestasi. Data akan diverifikasi oleh pengurus APM.
              Anda akan mendapat notifikasi melalui email setelah prestasi diverifikasi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => router.push('/prestasi')}>
                Lihat Galeri Prestasi
              </Button>
              <Button variant="outline" onClick={() => {
                setSubmitStatus('idle');
                setFormData({
                  judul: '',
                  nama_lomba: '',
                  penyelenggara: '',
                  tingkat: '',
                  peringkat: '',
                  tanggal: '',
                  kategori: '',
                  deskripsi: '',
                  submitter_name: '',
                  submitter_nim: '',
                  submitter_email: '',
                  submitter_whatsapp: '',
                });
                setSertifikat(null);
                setTeamMembers([{ nama: '', nim: '', role: 'ketua', angkatan: '' }]);
              }}>
                Submit Lagi
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container-apm py-6">
          <Breadcrumb
            items={[
              { label: 'Beranda', href: '/' },
              { label: 'Prestasi', href: '/prestasi' },
              { label: 'Submit Prestasi' },
            ]}
          />
          <div className="mt-4 flex items-center gap-4">
            <Link
              href="/prestasi"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Submit Prestasi
              </h1>
              <p className="text-gray-600 mt-1">
                Bagikan prestasi dan pencapaianmu bersama APM
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container-apm py-8 max-w-3xl">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Info Prestasi */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Informasi Prestasi</h2>
                <p className="text-sm text-gray-500">Detail pencapaian yang diraih</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormField
                  label="Nama Prestasi"
                  value={formData.judul}
                  onChange={(e) => handleChange('judul', e.target.value)}
                  placeholder="Juara 1 Hackathon Nasional"
                  required
                  error={errors.judul}
                />
              </div>
              <FormField
                label="Nama Lomba/Kompetisi"
                value={formData.nama_lomba}
                onChange={(e) => handleChange('nama_lomba', e.target.value)}
                placeholder="Hackathon Indonesia 2026"
                required
                error={errors.nama_lomba}
              />
              <FormField
                label="Penyelenggara"
                value={formData.penyelenggara}
                onChange={(e) => handleChange('penyelenggara', e.target.value)}
                placeholder="Kementerian Kominfo"
              />
              <SelectField
                label="Tingkat"
                value={formData.tingkat}
                onChange={(e) => handleChange('tingkat', e.target.value)}
                options={tingkatOptions}
                placeholder="Pilih tingkat"
                required
                error={errors.tingkat}
              />
              <FormField
                label="Peringkat"
                value={formData.peringkat}
                onChange={(e) => handleChange('peringkat', e.target.value)}
                placeholder="Juara 1, Finalist, Best Paper, dll"
                required
                error={errors.peringkat}
              />
              <FormField
                label="Tanggal Pencapaian"
                type="date"
                value={formData.tanggal}
                onChange={(e) => handleChange('tanggal', e.target.value)}
                required
                error={errors.tanggal}
              />
              <SelectField
                label="Kategori"
                value={formData.kategori}
                onChange={(e) => handleChange('kategori', e.target.value)}
                options={kategoriOptions}
                placeholder="Pilih kategori"
                required
                error={errors.kategori}
              />
              <div className="md:col-span-2">
                <TextAreaField
                  label="Deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => handleChange('deskripsi', e.target.value)}
                  placeholder="Ceritakan tentang prestasi ini..."
                  hint="Opsional. Maksimal 500 karakter"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Upload */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Bukti Prestasi</h2>
                <p className="text-sm text-gray-500">Upload sertifikat atau bukti lainnya</p>
              </div>
            </div>

            <FileUpload
              label="Sertifikat"
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={5}
              value={sertifikat}
              onChange={setSertifikat}
              required
              error={errors.sertifikat}
              hint="Format: PDF, JPG, PNG. Maksimal 5MB"
            />
          </div>

          {/* Section 3: Tim */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Anggota Tim</h2>
                <p className="text-sm text-gray-500">Data mahasiswa yang meraih prestasi</p>
              </div>
            </div>

            <TeamMemberInput
              members={teamMembers}
              onChange={setTeamMembers}
              maxMembers={6}
              errors={errors}
            />
          </div>

          {/* Section 4: Submitter Info */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Data Pengisi Form</h2>
                <p className="text-sm text-gray-500">Untuk keperluan konfirmasi</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Nama Lengkap"
                value={formData.submitter_name}
                onChange={(e) => handleChange('submitter_name', e.target.value)}
                placeholder="Nama lengkap"
                required
                error={errors.submitter_name}
              />
              <FormField
                label="NIM"
                value={formData.submitter_nim}
                onChange={(e) => handleChange('submitter_nim', e.target.value)}
                placeholder="1234567890"
                required
                error={errors.submitter_nim}
              />
              <FormField
                label="Email"
                type="email"
                value={formData.submitter_email}
                onChange={(e) => handleChange('submitter_email', e.target.value)}
                placeholder="email@student.ac.id"
                required
                error={errors.submitter_email}
              />
              <FormField
                label="Nomor WhatsApp"
                type="tel"
                value={formData.submitter_whatsapp}
                onChange={(e) => handleChange('submitter_whatsapp', e.target.value)}
                placeholder="08xxxxxxxxxx"
                required
                error={errors.submitter_whatsapp}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                'Submit Prestasi'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

