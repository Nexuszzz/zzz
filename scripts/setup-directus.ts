/**
 * Directus Schema Setup Script
 * Run this to create all collections and fields
 * 
 * Usage: npx ts-node scripts/setup-directus.ts
 */

export { }; // Make this a module

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://directus-apmt.flx.web.id';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@apmt.flx.web.id';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Nyawitnihanak67';

interface DirectusField {
  field: string;
  type: string;
  meta?: {
    interface?: string;
    special?: string[];
    options?: Record<string, unknown>;
    display?: string;
    required?: boolean;
    hidden?: boolean;
    width?: string;
    sort?: number;
    note?: string;
  };
  schema?: {
    is_nullable?: boolean;
    default_value?: unknown;
    is_unique?: boolean;
    is_primary_key?: boolean;
  };
}

interface CollectionConfig {
  collection: string;
  meta: {
    icon: string;
    note?: string;
    singleton?: boolean;
    sort_field?: string;
    display_template?: string;
  };
  fields: DirectusField[];
}

// Collection definitions
const collections: CollectionConfig[] = [
  // 1. APM Lomba
  {
    collection: 'apm_lomba',
    meta: {
      icon: 'emoji_events',
      note: 'Informasi lomba dan kompetisi',
      display_template: '{{nama_lomba}}',
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { special: ['uuid'], hidden: true }, schema: { is_primary_key: true } },
      { field: 'nama_lomba', type: 'string', meta: { interface: 'input', required: true, width: 'full' } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true, note: 'URL-friendly name' }, schema: { is_unique: true } },
      { field: 'deskripsi', type: 'text', meta: { interface: 'input-rich-text-html', width: 'full' } },
      { field: 'deadline', type: 'timestamp', meta: { interface: 'datetime', required: true } },
      {
        field: 'kategori', type: 'string', meta: {
          interface: 'select-dropdown', options: {
            choices: [
              { text: 'Teknologi', value: 'teknologi' },
              { text: 'Bisnis', value: 'bisnis' },
              { text: 'Desain', value: 'desain' },
              { text: 'Akademik', value: 'akademik' },
              { text: 'Seni', value: 'seni' },
              { text: 'Olahraga', value: 'olahraga' },
            ]
          }
        }
      },
      {
        field: 'tingkat', type: 'string', meta: {
          interface: 'select-dropdown', options: {
            choices: [
              { text: 'Regional', value: 'regional' },
              { text: 'Nasional', value: 'nasional' },
              { text: 'Internasional', value: 'internasional' },
            ]
          }
        }
      },
      {
        field: 'status', type: 'string', meta: {
          interface: 'select-dropdown', options: {
            choices: [
              { text: 'Open', value: 'open' },
              { text: 'Closed', value: 'closed' },
              { text: 'Coming Soon', value: 'coming-soon' },
            ]
          }
        }, schema: { default_value: 'open' }
      },
      { field: 'link_pendaftaran', type: 'string', meta: { interface: 'input', display: 'formatted-value' } },
      { field: 'syarat_ketentuan', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'hadiah', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, note: 'Array: [{peringkat, nominal, keterangan}]' } },
      { field: 'kontak_panitia', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, note: '{nama, email, phone, whatsapp}' } },
      { field: 'poster', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'biaya', type: 'integer', meta: { interface: 'input', note: '0 = Gratis' }, schema: { default_value: 0 } },
      { field: 'lokasi', type: 'string', meta: { interface: 'input' } },
      { field: 'tanggal_pelaksanaan', type: 'timestamp', meta: { interface: 'datetime' } },
      { field: 'penyelenggara', type: 'string', meta: { interface: 'input' } },
      { field: 'website', type: 'string', meta: { interface: 'input' } },
      { field: 'tags', type: 'json', meta: { interface: 'tags' } },
      { field: 'is_featured', type: 'boolean', meta: { interface: 'boolean' }, schema: { default_value: false } },
      { field: 'is_urgent', type: 'boolean', meta: { interface: 'boolean' }, schema: { default_value: false } },
      { field: 'date_created', type: 'timestamp', meta: { special: ['date-created'], interface: 'datetime', hidden: true } },
      { field: 'date_updated', type: 'timestamp', meta: { special: ['date-updated'], interface: 'datetime', hidden: true } },
      { field: 'user_created', type: 'uuid', meta: { special: ['user-created'], interface: 'select-dropdown-m2o', hidden: true } },
    ],
  },

  // 2. APM Prestasi
  {
    collection: 'apm_prestasi',
    meta: {
      icon: 'military_tech',
      note: 'Prestasi mahasiswa',
      display_template: '{{judul}} - {{peringkat}}',
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { special: ['uuid'], hidden: true }, schema: { is_primary_key: true } },
      { field: 'judul', type: 'string', meta: { interface: 'input', required: true, width: 'full' } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'nama_lomba', type: 'string', meta: { interface: 'input' } },
      { field: 'peringkat', type: 'string', meta: { interface: 'input', required: true, note: 'Juara 1, 2, 3, Best Paper, dll' } },
      {
        field: 'tingkat', type: 'string', meta: {
          interface: 'select-dropdown', options: {
            choices: [
              { text: 'Regional', value: 'regional' },
              { text: 'Nasional', value: 'nasional' },
              { text: 'Internasional', value: 'internasional' },
            ]
          }
        }
      },
      { field: 'kategori', type: 'string', meta: { interface: 'input' } },
      { field: 'tanggal', type: 'date', meta: { interface: 'datetime' } },
      { field: 'tahun', type: 'integer', meta: { interface: 'input' } },
      { field: 'deskripsi', type: 'text', meta: { interface: 'input-rich-text-html' } },
      { field: 'foto_dokumentasi', type: 'alias', meta: { interface: 'files', special: ['files'] } },
      { field: 'sertifikat', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'link_berita', type: 'string', meta: { interface: 'input' } },
      {
        field: 'status_verifikasi', type: 'string', meta: {
          interface: 'select-dropdown', options: {
            choices: [
              { text: 'Pending', value: 'pending' },
              { text: 'Verified', value: 'verified' },
              { text: 'Rejected', value: 'rejected' },
            ]
          }
        }, schema: { default_value: 'pending' }
      },
      { field: 'catatan_reviewer', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'verified_at', type: 'timestamp', meta: { interface: 'datetime', note: 'Timestamp when prestasi was verified' } },
      { field: 'date_created', type: 'timestamp', meta: { special: ['date-created'], hidden: true } },
      { field: 'date_updated', type: 'timestamp', meta: { special: ['date-updated'], hidden: true } },
    ],
  },

  // 3. APM Prestasi Tim
  {
    collection: 'apm_prestasi_tim',
    meta: {
      icon: 'group',
      note: 'Anggota tim prestasi',
      display_template: '{{nama}} - {{nim}}',
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { special: ['uuid'], hidden: true }, schema: { is_primary_key: true } },
      { field: 'prestasi_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'], required: true } },
      { field: 'nama', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'nim', type: 'string', meta: { interface: 'input' } },
      { field: 'fakultas', type: 'string', meta: { interface: 'input' } },
      { field: 'prodi', type: 'string', meta: { interface: 'input' } },
      { field: 'is_ketua', type: 'boolean', meta: { interface: 'boolean' }, schema: { default_value: false } },
    ],
  },

  // 4. APM Prestasi Pembimbing
  {
    collection: 'apm_prestasi_pembimbing',
    meta: {
      icon: 'school',
      note: 'Dosen pembimbing prestasi',
      display_template: '{{nama}}',
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { special: ['uuid'], hidden: true }, schema: { is_primary_key: true } },
      { field: 'prestasi_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'], required: true } },
      { field: 'nama', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'nip', type: 'string', meta: { interface: 'input' } },
      { field: 'fakultas', type: 'string', meta: { interface: 'input' } },
    ],
  },

  // 5. APM Expo
  {
    collection: 'apm_expo',
    meta: {
      icon: 'event',
      note: 'Event dan expo',
      display_template: '{{nama_event}}',
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { special: ['uuid'], hidden: true }, schema: { is_primary_key: true } },
      { field: 'nama_event', type: 'string', meta: { interface: 'input', required: true, width: 'full' } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'tema', type: 'string', meta: { interface: 'input' } },
      { field: 'tanggal_mulai', type: 'date', meta: { interface: 'datetime', required: true } },
      { field: 'tanggal_selesai', type: 'date', meta: { interface: 'datetime' } },
      { field: 'lokasi', type: 'string', meta: { interface: 'input' } },
      { field: 'alamat_lengkap', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'google_maps_embed', type: 'string', meta: { interface: 'input', note: 'Embed URL Google Maps' } },
      { field: 'deskripsi', type: 'text', meta: { interface: 'input-rich-text-html' } },
      { field: 'highlights', type: 'json', meta: { interface: 'input-code', options: { language: 'json' } } },
      { field: 'rundown', type: 'json', meta: { interface: 'input-code', options: { language: 'json' } } },
      { field: 'biaya_partisipasi', type: 'integer', meta: { interface: 'input' }, schema: { default_value: 0 } },
      { field: 'benefit', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'website_resmi', type: 'string', meta: { interface: 'input' } },
      { field: 'poster', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'foto_dokumentasi', type: 'alias', meta: { interface: 'files', special: ['files'] } },
      { field: 'is_featured', type: 'boolean', meta: { interface: 'boolean' }, schema: { default_value: false } },
      {
        field: 'status', type: 'string', meta: {
          interface: 'select-dropdown', options: {
            choices: [
              { text: 'Upcoming', value: 'upcoming' },
              { text: 'Ongoing', value: 'ongoing' },
              { text: 'Completed', value: 'completed' },
            ]
          }
        }, schema: { default_value: 'upcoming' }
      },
      { field: 'date_created', type: 'timestamp', meta: { special: ['date-created'], hidden: true } },
    ],
  },

  // 6. APM Resources
  {
    collection: 'apm_resources',
    meta: {
      icon: 'library_books',
      note: 'Tips, template, dan panduan',
      display_template: '{{judul}}',
      sort_field: 'urutan',
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { special: ['uuid'], hidden: true }, schema: { is_primary_key: true } },
      { field: 'judul', type: 'string', meta: { interface: 'input', required: true, width: 'full' } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      {
        field: 'kategori', type: 'string', meta: {
          interface: 'select-dropdown', options: {
            choices: [
              { text: 'Tips', value: 'tips' },
              { text: 'Template', value: 'template' },
              { text: 'Panduan', value: 'panduan' },
              { text: 'FAQ', value: 'faq' },
            ]
          }
        }
      },
      { field: 'deskripsi', type: 'string', meta: { interface: 'input' } },
      { field: 'konten', type: 'text', meta: { interface: 'input-rich-text-html' } },
      { field: 'file_attachment', type: 'uuid', meta: { interface: 'file', special: ['file'] } },
      { field: 'thumbnail', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'tags', type: 'json', meta: { interface: 'tags' } },
      { field: 'download_count', type: 'integer', meta: { interface: 'input' }, schema: { default_value: 0 } },
      { field: 'is_featured', type: 'boolean', meta: { interface: 'boolean' }, schema: { default_value: false } },
      { field: 'is_published', type: 'boolean', meta: { interface: 'boolean' }, schema: { default_value: true } },
      { field: 'urutan', type: 'integer', meta: { interface: 'input' }, schema: { default_value: 0 } },
      { field: 'date_created', type: 'timestamp', meta: { special: ['date-created'], hidden: true } },
    ],
  },

  // 7. APM Submissions
  {
    collection: 'apm_submissions',
    meta: {
      icon: 'send',
      note: 'Pengajuan dari user',
      display_template: '{{tipe}} - {{submitted_by}}',
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { special: ['uuid'], hidden: true }, schema: { is_primary_key: true } },
      {
        field: 'tipe', type: 'string', meta: {
          interface: 'select-dropdown', options: {
            choices: [
              { text: 'Lomba', value: 'lomba' },
              { text: 'Prestasi', value: 'prestasi' },
            ]
          }, required: true
        }
      },
      {
        field: 'status', type: 'string', meta: {
          interface: 'select-dropdown', options: {
            choices: [
              { text: 'Pending', value: 'pending' },
              { text: 'Approved', value: 'approved' },
              { text: 'Rejected', value: 'rejected' },
            ]
          }
        }, schema: { default_value: 'pending' }
      },
      { field: 'data', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, width: 'full' } },
      { field: 'files', type: 'alias', meta: { interface: 'files', special: ['files'] } },
      { field: 'submitted_by', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'email', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'phone', type: 'string', meta: { interface: 'input' } },
      { field: 'reviewer_notes', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'reviewed_at', type: 'timestamp', meta: { interface: 'datetime' } },
      { field: 'date_created', type: 'timestamp', meta: { special: ['date-created'], hidden: true } },
    ],
  },

  // 8. APM About (Singleton)
  {
    collection: 'apm_about',
    meta: {
      icon: 'info',
      note: 'Informasi tentang APM Portal',
      singleton: true,
    },
    fields: [
      { field: 'id', type: 'integer', meta: { hidden: true }, schema: { is_primary_key: true } },
      { field: 'visi', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
      { field: 'misi', type: 'text', meta: { interface: 'input-rich-text-html', width: 'full' } },
      { field: 'sejarah', type: 'text', meta: { interface: 'input-rich-text-html', width: 'full' } },
      { field: 'hero_image', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'kontak', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, note: '{email, phone, address}' } },
      { field: 'social_media', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, note: '{instagram, twitter, youtube, telegram}' } },
    ],
  },

  // 9. APM Tim (Struktur Organisasi)
  {
    collection: 'apm_tim',
    meta: {
      icon: 'groups',
      note: 'Struktur organisasi APM - dapat diedit untuk mengubah nama pengurus',
      display_template: '{{nama}} - {{jabatan}}',
      sort_field: 'urutan',
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { special: ['uuid'], hidden: true }, schema: { is_primary_key: true } },
      { field: 'nama', type: 'string', meta: { interface: 'input', required: true, note: 'Gunakan lorem ipsum untuk placeholder' } },
      { field: 'jabatan', type: 'string', meta: { interface: 'input', required: true } },
      {
        field: 'role_type', type: 'string', meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Pembina', value: 'pembina' },
              { text: 'Ketua', value: 'ketua' },
              { text: 'Wakil Ketua', value: 'wakil' },
              { text: 'Sekretaris', value: 'sekretaris' },
              { text: 'Bendahara', value: 'bendahara' },
              { text: 'Kepala Divisi', value: 'kepala_divisi' },
              { text: 'Anggota Divisi', value: 'anggota_divisi' },
              { text: 'Koordinator Jurusan', value: 'koordinator' },
            ]
          }
        }
      },
      { field: 'foto', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'unit', type: 'string', meta: { interface: 'input', note: 'Jurusan atau unit kerja' } },
      { field: 'nip', type: 'string', meta: { interface: 'input' } },
      { field: 'email', type: 'string', meta: { interface: 'input' } },
      { field: 'divisi', type: 'string', meta: { interface: 'input', note: 'Nama divisi (untuk anggota/kepala divisi)' } },
      { field: 'tugas', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, note: 'Array of tugas strings: ["tugas1", "tugas2"]' } },
      { field: 'periode', type: 'string', meta: { interface: 'input', note: 'e.g., 2025-2026' } },
      { field: 'is_active', type: 'boolean', meta: { interface: 'boolean' }, schema: { default_value: true } },
      { field: 'urutan', type: 'integer', meta: { interface: 'input' }, schema: { default_value: 0 } },
      { field: 'social', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, note: '{linkedin, instagram}' } },
    ],
  },

  // 10. APM FAQ
  {
    collection: 'apm_faq',
    meta: {
      icon: 'help',
      note: 'Frequently Asked Questions',
      display_template: '{{pertanyaan}}',
      sort_field: 'urutan',
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { special: ['uuid'], hidden: true }, schema: { is_primary_key: true } },
      { field: 'pertanyaan', type: 'string', meta: { interface: 'input', required: true, width: 'full' } },
      { field: 'jawaban', type: 'text', meta: { interface: 'input-rich-text-html', width: 'full' } },
      { field: 'kategori', type: 'string', meta: { interface: 'input' } },
      { field: 'urutan', type: 'integer', meta: { interface: 'input' }, schema: { default_value: 0 } },
      { field: 'is_published', type: 'boolean', meta: { interface: 'boolean' }, schema: { default_value: true } },
    ],
  },

  // 11. APM Site Settings (Singleton)
  {
    collection: 'apm_site_settings',
    meta: {
      icon: 'settings',
      note: 'Pengaturan global website',
      singleton: true,
    },
    fields: [
      { field: 'id', type: 'integer', meta: { hidden: true }, schema: { is_primary_key: true } },
      // Statistics (can be auto-calculated or manually set)
      { field: 'stat_lomba', type: 'integer', meta: { interface: 'input', note: 'Jumlah lomba aktif (0 = auto calculate)' }, schema: { default_value: 0 } },
      { field: 'stat_prestasi', type: 'integer', meta: { interface: 'input', note: 'Jumlah prestasi tercatat (0 = auto calculate)' }, schema: { default_value: 0 } },
      { field: 'stat_mahasiswa', type: 'integer', meta: { interface: 'input', note: 'Jumlah mahasiswa bergabung (0 = auto calculate)' }, schema: { default_value: 0 } },
      { field: 'stat_expo', type: 'integer', meta: { interface: 'input', note: 'Jumlah expo (0 = auto calculate)' }, schema: { default_value: 0 } },
      // Help Section
      { field: 'help_title', type: 'string', meta: { interface: 'input' }, schema: { default_value: 'Butuh Bantuan?' } },
      { field: 'help_description', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'help_email', type: 'string', meta: { interface: 'input' }, schema: { default_value: 'apm@polinema.ac.id' } },
      { field: 'help_show_location', type: 'boolean', meta: { interface: 'boolean' }, schema: { default_value: false } },
      { field: 'help_location', type: 'string', meta: { interface: 'input' } },
    ],
  },

  // 12. APM Content Blocks (CMS-driven sections)
  {
    collection: 'apm_content_blocks',
    meta: {
      icon: 'dashboard_customize',
      note: 'Konten section website yang dapat diedit',
      display_template: '{{key}} - {{title}}',
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { special: ['uuid'], hidden: true }, schema: { is_primary_key: true } },
      { field: 'key', type: 'string', meta: { interface: 'input', required: true, note: 'Identifier unik: home_hero, help_contact, org_structure, dll' }, schema: { is_unique: true } },
      { field: 'title', type: 'string', meta: { interface: 'input', width: 'full' } },
      { field: 'subtitle', type: 'string', meta: { interface: 'input', width: 'full' } },
      { field: 'description', type: 'text', meta: { interface: 'input-rich-text-html', width: 'full' } },
      { field: 'image', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'icon', type: 'string', meta: { interface: 'input', note: 'Nama icon (lucide-react)' } },
      { field: 'cta_text', type: 'string', meta: { interface: 'input' } },
      { field: 'cta_link', type: 'string', meta: { interface: 'input' } },
      { field: 'extra_data', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, note: 'Data tambahan dalam format JSON' } },
      { field: 'is_active', type: 'boolean', meta: { interface: 'boolean' }, schema: { default_value: true } },
      { field: 'sort_order', type: 'integer', meta: { interface: 'input' }, schema: { default_value: 0 } },
      { field: 'date_created', type: 'timestamp', meta: { special: ['date-created'], hidden: true } },
      { field: 'date_updated', type: 'timestamp', meta: { special: ['date-updated'], hidden: true } },
    ],
  },

  // 13. APM Master Prodi (Program Studi)
  {
    collection: 'apm_master_prodi',
    meta: {
      icon: 'school',
      note: 'Master data program studi',
      display_template: '{{nama_prodi}}',
      sort_field: 'urutan',
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { special: ['uuid'], hidden: true }, schema: { is_primary_key: true } },
      { field: 'kode_prodi', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'nama_prodi', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'jenjang', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: 'D3', value: 'd3' }, { text: 'D4', value: 'd4' }, { text: 'S1', value: 's1' }] } } },
      { field: 'is_active', type: 'boolean', meta: { interface: 'boolean' }, schema: { default_value: true } },
      { field: 'urutan', type: 'integer', meta: { interface: 'input' }, schema: { default_value: 0 } },
    ],
  },
];

async function main() {
  console.log('🚀 Starting Directus Schema Setup...\n');

  // 1. Login to get access token
  console.log('1️⃣ Logging in to Directus...');
  const loginRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!loginRes.ok) {
    console.error('❌ Failed to login:', await loginRes.text());
    process.exit(1);
  }

  const { data: authData } = await loginRes.json();
  const token = authData.access_token;
  console.log('✅ Logged in successfully!\n');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // 2. Create collections
  console.log('2️⃣ Creating collections...\n');

  for (const config of collections) {
    console.log(`   Creating collection: ${config.collection}...`);

    // Create collection
    const collectionRes = await fetch(`${DIRECTUS_URL}/collections`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        collection: config.collection,
        meta: config.meta,
        schema: {},
      }),
    });

    if (!collectionRes.ok) {
      const error = await collectionRes.text();
      if (error.includes('already exists')) {
        console.log(`   ⚠️  Collection ${config.collection} already exists, skipping...`);
      } else {
        console.error(`   ❌ Failed to create ${config.collection}:`, error);
        continue;
      }
    } else {
      console.log(`   ✅ Created collection: ${config.collection}`);
    }

    // Create fields
    for (const field of config.fields) {
      const fieldRes = await fetch(`${DIRECTUS_URL}/fields/${config.collection}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(field),
      });

      if (!fieldRes.ok) {
        const error = await fieldRes.text();
        if (!error.includes('already exists')) {
          console.log(`      ⚠️  Field ${field.field}: ${error.substring(0, 50)}...`);
        }
      }
    }
    console.log(`   ✅ Fields created for ${config.collection}\n`);
  }

  // 3. Setup relations
  console.log('3️⃣ Setting up relations...\n');

  const relations = [
    {
      collection: 'apm_prestasi_tim',
      field: 'prestasi_id',
      related_collection: 'apm_prestasi',
      meta: { one_field: 'tim' },
    },
    {
      collection: 'apm_prestasi_pembimbing',
      field: 'prestasi_id',
      related_collection: 'apm_prestasi',
      meta: { one_field: 'pembimbing' },
    },
  ];

  for (const relation of relations) {
    const relRes = await fetch(`${DIRECTUS_URL}/relations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(relation),
    });

    if (relRes.ok) {
      console.log(`   ✅ Created relation: ${relation.collection}.${relation.field} → ${relation.related_collection}`);
    } else {
      const error = await relRes.text();
      if (error.includes('already exists')) {
        console.log(`   ⚠️  Relation already exists, skipping...`);
      }
    }
  }

  // 4. Setup public permissions
  console.log('\n4️⃣ Setting up public permissions...\n');

  const publicCollections = [
    'apm_lomba', 'apm_prestasi', 'apm_prestasi_tim', 'apm_prestasi_pembimbing',
    'apm_expo', 'apm_resources', 'apm_about', 'apm_tim', 'apm_faq', 'apm_site_settings',
    'apm_content_blocks', 'apm_master_prodi'
  ];

  for (const collection of publicCollections) {
    const permRes = await fetch(`${DIRECTUS_URL}/permissions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        role: null, // null = public
        collection,
        action: 'read',
        permissions: {},
        validation: {},
        presets: null,
        fields: ['*'],
      }),
    });

    if (permRes.ok) {
      console.log(`   ✅ Public read access for: ${collection}`);
    }
  }

  // Public can create submissions
  const subPermRes = await fetch(`${DIRECTUS_URL}/permissions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      role: null,
      collection: 'apm_submissions',
      action: 'create',
      permissions: {},
      validation: {},
      fields: ['tipe', 'data', 'submitted_by', 'email', 'phone'],
    }),
  });

  if (subPermRes.ok) {
    console.log('   ✅ Public create access for: apm_submissions');
  }

  console.log('\n✅ Schema setup complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Open http://localhost:8055 and login');
  console.log('   2. Add sample data to collections');
  console.log('   3. Test API endpoints');
}

main().catch(console.error);
