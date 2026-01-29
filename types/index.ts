// ============================================
// Core Types (Previously from Directus, now standalone)
// ============================================

export interface Lomba {
  id: number
  nama_lomba: string
  slug: string
  deskripsi?: string
  deadline?: string
  kategori: string
  tingkat: 'regional' | 'nasional' | 'internasional'
  status: 'draft' | 'open' | 'closed'
  link_pendaftaran?: string
  syarat_ketentuan?: string
  hadiah?: string
  kontak_panitia?: string
  poster?: string
  biaya: number
  lokasi?: string
  tanggal_pelaksanaan?: string
  penyelenggara?: string
  tags?: string[]
  is_featured: boolean
  is_urgent: boolean
  is_deleted: boolean
  created_at?: string
}

export interface Prestasi {
  id: number
  judul: string
  slug: string
  nama_lomba?: string
  peringkat: string
  tingkat: 'regional' | 'nasional' | 'internasional'
  kategori?: string
  tanggal?: string
  tahun: number
  deskripsi?: string
  thumbnail?: string
  sertifikat?: string
  link_berita?: string
  link_portofolio?: string
  is_featured: boolean
  is_published: boolean
}

export interface PrestasiTim {
  id: number
  nama: string
  nim: string
  prodi?: string
  angkatan?: string
  whatsapp?: string
  is_ketua: boolean
}

export interface PrestasiPembimbing {
  id: number
  nama: string
  nidn?: string
  whatsapp?: string
}

export interface Expo {
  id: number
  nama_event: string
  slug: string
  tema?: string
  tanggal_mulai: string
  tanggal_selesai: string
  lokasi: string
  alamat_lengkap?: string
  deskripsi?: string
  poster?: string
  highlights?: unknown[]
  rundown?: unknown[]
  galeri?: unknown[]
  biaya_partisipasi: number
  benefit?: string
  link_pendaftaran?: string
  website_resmi?: string
  is_featured: boolean
  status: 'upcoming' | 'ongoing' | 'completed'
}

// CMS Types (still from Directus for FAQ, Tips, etc.)
export interface Resource {
  id: number
  judul: string
  slug: string
  deskripsi?: string
  kategori: string
  thumbnail?: string
  file_attachment?: string
}

export interface About {
  id: number
  tentang_kami?: string
  visi?: string
  misi?: string
  alamat?: string
  email?: string
  telepon?: string
}

export interface Tim {
  id: number
  nama: string
  jabatan: string
  foto?: string
  divisi: string
  periode: string
  is_active: boolean
}

export interface Faq {
  id: number
  pertanyaan: string
  jawaban: string
  kategori: string
  urutan: number
}

// ============================================
// Additional Types
// ============================================

// Navigation
export interface NavItem {
  name: string;
  href: string;
  submenu?: NavItem[];
}

// Pagination
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// Filter options
export interface LombaFilters {
  kategori?: string;
  tingkat?: string;
  status?: string;
  deadline?: 'urgent' | 'soon' | 'all';
  biaya?: 'gratis' | 'berbayar' | 'all';
  search?: string;
}

export interface PrestasiFilters {
  fakultas?: string;
  jenis?: string;
  tahun?: string;
  status?: 'pending' | 'verified' | 'all';
  search?: string;
}

export interface ExpoFilters {
  tahun?: string;
  lokasi?: string;
  search?: string;
}

// Form types
export interface SubmitPrestasiForm {
  nama_mahasiswa: string;
  nim: string;
  fakultas: string;
  email: string;
  phone: string;
  nama_prestasi: string;
  tingkat_prestasi: string;
  tanggal_pencapaian: string;
  kategori_prestasi: string;
  deskripsi: string;
  nama_pembimbing?: string;
  link_berita?: string;
  persetujuan: boolean;
}

export interface SubmitLombaForm {
  nama_lomba: string;
  deadline: string;
  kategori: string;
  tingkat: string;
  link_pendaftaran: string;
  syarat_ketentuan: string;
  hadiah: string;
  kontak_panitia: string;
  biaya: number;
  lokasi: string;
  nama_pengirim: string;
  email_pengirim: string;
}

// Contact Form
export interface ContactForm {
  nama: string;
  email: string;
  subjek: string;
  pesan: string;
}

// Kalender Event
export interface KalenderEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'lomba' | 'prestasi' | 'expo';
  status?: string;
  link?: string;
}

// Statistics
export interface PortalStatistics {
  totalLomba: number;
  totalPrestasi: number;
  totalExpo: number;
  totalMahasiswa: number;
  lombaAktif: number;
  prestasiTerverifikasi: number;
}

// Search Result
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'lomba' | 'prestasi' | 'expo' | 'resource';
  url: string;
  date?: string;
  status?: string;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Toast/Notification
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// Modal
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// Table Column
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

// Countdown
export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Breadcrumb
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// File upload
export interface UploadedFile {
  id: string;
  filename: string;
  type: string;
  size: number;
  url: string;
}

// Success Story
export interface SuccessStory {
  id: string;
  prestasi: Prestasi;
  interview: string;
  tips: string[];
  featured_image: string;
  is_featured: boolean;
  date_published: string;
}

// Organization Structure
export interface OrganizationMember {
  id: string;
  nama: string;
  jabatan: string;
  foto: string | null;
  divisi: string;
  periode: string;
  is_active: boolean;
}

// FAQ Item
export interface FaqItem {
  id: string;
  pertanyaan: string;
  jawaban: string;
  kategori: string;
  urutan: number;
}
