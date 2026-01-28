import { createDirectus, rest, graphql, authentication } from '@directus/sdk';

// ============================================
// TYPES - Match actual Directus collections
// ============================================

export interface Lomba {
  id: number;
  nama_lomba: string;
  slug: string;
  deskripsi?: string;
  deadline?: string; // This is the correct field name in Directus
  kategori: string;
  tingkat: 'regional' | 'nasional' | 'internasional';
  status: 'open' | 'closed' | 'coming-soon';
  link_pendaftaran?: string;
  syarat_ketentuan?: string; // This is the correct field name in Directus
  hadiah?: string; // JSON string
  kontak_panitia?: string; // JSON string
  poster?: string;
  biaya: number; // This is the correct field name in Directus (not biaya_pendaftaran)
  lokasi?: string;
  tanggal_pelaksanaan?: string;
  penyelenggara?: string;
  website?: string;
  tags?: string; // JSON string
  is_featured: boolean;
  is_urgent: boolean;
  is_deleted: boolean;
  date_created: string;
  date_updated?: string;
}

export interface Prestasi {
  id: number;
  judul: string;
  slug: string;
  nama_lomba?: string;
  peringkat: string;
  tingkat: 'regional' | 'nasional' | 'internasional';
  kategori?: string;
  tanggal?: string;
  tahun: number;
  deskripsi?: string;
  foto?: string;
  sertifikat?: string;
  link_berita?: string;
  link_portofolio?: string;
  status_verifikasi: 'pending' | 'verified' | 'rejected';
  // New fields for submission
  status: 'pending' | 'verified' | 'rejected';
  reviewer_notes?: string;
  verified_at?: string;
  verified_by?: string;
  submitter_name?: string;
  submitter_nim?: string;
  submitter_email?: string;
  is_deleted: boolean;
  date_created: string;
  date_updated?: string;
}

export interface PrestasiTim {
  id: number;
  prestasi_id: number;
  nama_mahasiswa: string;
  nim: string;
  fakultas?: string;
  prodi?: string;
  is_ketua: boolean;
  date_created: string;
}

export interface PrestasiPembimbing {
  id: number;
  prestasi_id: number;
  nama_pembimbing: string;
  nidn?: string;
  fakultas?: string;
  date_created: string;
}

export interface Expo {
  id: number;
  nama_event: string;
  slug: string;
  tema?: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  lokasi: string;
  alamat_lengkap?: string;
  deskripsi?: string;
  poster?: string;
  highlights?: string; // JSON string
  rundown?: string; // JSON string
  galeri?: string; // JSON string
  biaya_partisipasi: number;
  benefit?: string;
  link_pendaftaran?: string;
  website_resmi?: string;
  is_featured: boolean;
  status: 'upcoming' | 'ongoing' | 'completed';
  // New fields for registration
  registration_open: boolean;
  registration_deadline?: string;
  max_participants?: number;
  is_deleted: boolean;
  date_created: string;
  date_updated?: string;
}

export interface ExpoRegistration {
  id: number;
  expo_id: number;
  nama_project: string;
  deskripsi_project?: string;
  link_demo?: string;
  ketua_nama: string;
  ketua_nim: string;
  ketua_email: string;
  ketua_phone?: string;
  anggota_1_nama?: string;
  anggota_1_nim?: string;
  anggota_2_nama?: string;
  anggota_2_nim?: string;
  anggota_3_nama?: string;
  anggota_3_nim?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewer_notes?: string;
  is_deleted: boolean;
  date_created: string;
  date_updated?: string;
}

export interface Resource {
  id: number;
  judul: string;
  slug: string;
  kategori: 'tips' | 'template' | 'panduan' | 'faq';
  deskripsi?: string;
  konten?: string;
  thumbnail?: string;
  file_attachment?: string;
  link_eksternal?: string;
  tags?: string; // JSON string
  download_count: number;
  is_featured: boolean;
  is_published: boolean;
  urutan: number;
  date_created: string;
  date_updated?: string;
}

export interface Submission {
  id: number;
  tipe: 'lomba' | 'prestasi';
  data: string; // JSON string
  files?: string; // JSON string
  submitted_by: string;
  email: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewer_notes?: string;
  date_created: string;
  date_updated?: string;
}

export interface About {
  id: number;
  visi?: string;
  misi?: string;
  sejarah?: string;
  kontak?: string; // JSON string
  social_media?: string; // JSON string
  date_updated?: string;
}

export interface Tim {
  id: number;
  nama: string;
  jabatan: string;
  divisi?: string;
  foto?: string;
  email?: string;
  linkedin?: string;
  periode?: string;
  is_active: boolean;
  urutan: number;
  date_created: string;
}

export interface Faq {
  id: number;
  pertanyaan: string;
  jawaban: string;
  kategori?: string;
  urutan: number;
  is_published: boolean;
  date_created: string;
}

// Schema type untuk Directus SDK
export interface DirectusSchema {
  apm_lomba: Lomba[];
  apm_prestasi: Prestasi[];
  apm_prestasi_tim: PrestasiTim[];
  apm_prestasi_pembimbing: PrestasiPembimbing[];
  apm_expo: Expo[];
  apm_expo_registrations: ExpoRegistration[];
  apm_resources: Resource[];
  apm_submissions: Submission[];
  apm_about: About;
  apm_tim: Tim[];
  apm_faq: Faq[];
}

// Directus client instance
const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.DIRECTUS_URL || 'http://localhost:8055';

export const directus = createDirectus<DirectusSchema>(directusUrl)
  .with(rest())
  .with(graphql())
  .with(authentication());

// Helper function untuk get asset URL
export function getAssetUrl(assetId: string | null | undefined, options?: { width?: number; height?: number; quality?: number }): string {
  if (!assetId) return '/images/placeholder.jpg';
  
  let url = `${directusUrl}/assets/${assetId}`;
  
  if (options) {
    const params = new URLSearchParams();
    if (options.width) params.append('width', String(options.width));
    if (options.height) params.append('height', String(options.height));
    if (options.quality) params.append('quality', String(options.quality));
    
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
  }
  
  return url;
}

// Helper untuk fetch dengan error handling
export async function fetchFromDirectus<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${directusUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Directus API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data as T;
}
