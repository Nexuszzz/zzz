# 🎯 RENCANA BACKEND MANDIRI v2
## APM Portal - Lomba, Expo, Prestasi

> **Status**: ✅ APPROVED - Siap Eksekusi  
> **Tanggal**: 29 Januari 2026  
> **Versi**: 2.1

---

## 📌 KEPUTUSAN YANG SUDAH DISETUJUI

| No | Keputusan | Jawaban |
|----|-----------|---------|
| Q1 | Surat pendukung prestasi | **Bebas** - mahasiswa isi label sendiri (setiap kompetisi beda-beda) |
| Q2 | Login untuk pendaftaran | **Tidak perlu login** - cukup NIM, Email, WhatsApp |
| Q3 | Custom Form Builder | **Full builder** - drag-drop, validasi lengkap, conditional logic |
| Q4 | Mode tombol Daftar | **3 mode**: Internal, Eksternal+link, Info-only |
| Q5 | Expo ON/OFF message | **Bisa diubah admin** |
| Q6 | Kalender | **Lomba + Expo + extensible** (bisa tambah event lain) |
| Q7 | File storage | **Local storage** (nanti ke VPS, harus mudah backup) |
| Q8 | Email notifikasi | **Tidak perlu** - dikasih tau manual oleh pengurus |
| Q9 | Migrasi data | **Fresh start** - tidak ada data lama |
| Q10 | Sertifikat publik | **Configurable** - bisa publik/private per prestasi |
| Q11 | Verifikasi pendaftaran | **Langsung masuk** tanpa approval admin |
| Q12 | Batasan upload | Sertifikat 5MB, Surat 3MB, Foto 2MB/file (1-6 foto) |

### Catatan Tambahan:
- **WhatsApp wajib** untuk: pendaftar lomba/expo, submitter prestasi
- **WhatsApp pembimbing** dan **salah satu anggota tim** wajib untuk prestasi (biar bisa dihubungi pengurus)

---

## 📋 DAFTAR ISI
1. [Keputusan yang Sudah Disetujui](#-keputusan-yang-sudah-disetujui)
2. [Ringkasan Kondisi Saat Ini](#1-ringkasan-kondisi-saat-ini)
3. [Arsitektur Baru](#2-arsitektur-baru)
4. [Fitur Lomba - Detail](#3-fitur-lomba---detail)
5. [Fitur Expo - Detail](#4-fitur-expo---detail)
6. [Fitur Prestasi - Detail](#5-fitur-prestasi---detail)
7. [Sistem Autentikasi & Keamanan](#6-sistem-autentikasi--keamanan)
8. [Custom Form Builder](#7-custom-form-builder)
9. [Database Schema](#8-database-schema)
10. [API Routes Baru](#9-api-routes-baru)
11. [File Upload Strategy](#10-file-upload-strategy)
12. [Kalender Integration](#11-kalender-integration)
13. [Timeline Implementasi](#12-timeline-implementasi)

---

## 1. RINGKASAN KONDISI SAAT INI

### ✅ Yang Sudah Ada
| Komponen | Lokasi | Status |
|----------|--------|--------|
| Halaman Lomba List | `/app/lomba/page.tsx` | ✅ Berfungsi |
| Halaman Lomba Detail | `/app/lomba/[slug]/page.tsx` | ✅ Berfungsi |
| Halaman Daftar Lomba | `/app/lomba/[slug]/daftar/page.tsx` | ✅ Form sederhana |
| Halaman Expo List | `/app/expo/page.tsx` | ✅ Berfungsi |
| Halaman Expo Detail | `/app/expo/[slug]/page.tsx` | ✅ Berfungsi |
| Halaman Daftar Expo | `/app/expo/[slug]/daftar/page.tsx` | ✅ Tersedia |
| Halaman Prestasi List | `/app/prestasi/page.tsx` | ✅ Berfungsi |
| Halaman Submit Prestasi | `/app/prestasi/submit/page.tsx` | ✅ Form 3-tahap |
| Admin Dashboard | `/app/admin/page.tsx` | ✅ Berfungsi |
| Admin Lomba CRUD | `/app/admin/lomba/` | ✅ Create/Edit/Delete |
| Admin Expo CRUD | `/app/admin/expo/` | ✅ Create/Edit/Delete |
| Admin Prestasi Verify | `/app/admin/prestasi/page.tsx` | ⚠️ Bermasalah (token) |
| Kalender | `/app/kalender/page.tsx` | ✅ Menampilkan lomba |
| Auth Middleware | `/middleware.ts` | ✅ Cookie-based |
| Admin Login | `/app/admin/login/page.tsx` | ✅ JWT-based |

### ❌ Masalah Saat Ini
1. **Status Mapping** - `approved` vs `verified` membingungkan
2. **Cache Issues** - UI tidak update setelah verifikasi
3. **Limited Flexibility** - Form pendaftaran tidak bisa custom per lomba

### 🔄 Alur Data Saat Ini
```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Frontend  │────▶│ Next.js API Route│────▶│  PostgreSQL  │
└─────────────┘     └──────────────────┘     └──────────────┘
```

---

## 2. ARSITEKTUR BARU

### 🎯 Prinsip Desain
1. **Langsung ke Database** - Direct access via Prisma ORM
2. **Type-Safe** - Prisma ORM untuk query aman
3. **Modular** - Fitur terpisah, mudah maintain

### 📊 Arsitektur Hybrid
```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  Next.js App Router (React Server Components + Client)      │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌────────────────┐ ┌───────────────┐ ┌────────────────┐
│ API: Custom    │ │ API: Custom   │ │ API: Static    │
│ (Transaksional)│ │ (Admin CRUD)  │ │ (Content)      │
├────────────────┤ ├───────────────┤ ├────────────────┤
│ • Submission   │ │ • Lomba CRUD  │ │ • FAQ          │
│ • Registration │ │ • Expo CRUD   │ │ • Tips         │
│ • Verification │ │ • Prestasi    │ │ • Panduan      │
│ • File Upload  │ │   Management  │ │                │
└───────┬────────┘ └───────┬───────┘ └────────────────┘
        │                  │
        └──────────────────┼─────────────────┘
                           ▼
                   ┌───────────────┐
                   │   Prisma ORM  │
                   └───────┬───────┘
                           ▼
                   ┌───────────────┐
                   │  PostgreSQL   │
                   │  (Same DB!)   │
                   └───────────────┘
```

### 📁 Struktur File Baru
```
lib/
├── prisma/
│   ├── client.ts          # Prisma client instance
│   └── schema.prisma      # Database schema
├── services/
│   ├── lomba.service.ts   # Business logic lomba
│   ├── expo.service.ts    # Business logic expo
│   ├── prestasi.service.ts# Business logic prestasi
│   └── upload.service.ts  # File upload handling
├── validations/
│   ├── lomba.schema.ts    # Zod schemas
│   ├── expo.schema.ts
│   └── prestasi.schema.ts
└── auth/
    ├── session.ts         # Session management
    └── admin.ts           # Admin authentication

app/api/
├── v2/                    # NEW API routes (versioned)
│   ├── lomba/
│   │   ├── route.ts       # GET all, POST create
│   │   ├── [id]/
│   │   │   ├── route.ts   # GET one, PATCH, DELETE
│   │   │   └── register/
│   │   │       └── route.ts # POST registration
│   ├── expo/
│   │   ├── route.ts
│   │   ├── [id]/
│   │   │   ├── route.ts
│   │   │   └── register/
│   │   │       └── route.ts
│   ├── prestasi/
│   │   ├── route.ts
│   │   ├── submit/
│   │   │   └── route.ts   # POST submission
│   │   └── [id]/
│   │       ├── route.ts
│   │       └── verify/
│   │           └── route.ts # POST verify/reject
│   └── uploads/
│       └── route.ts       # File upload endpoint
└── admin/                 # Keep existing, update to use Prisma
```

---

## 3. FITUR LOMBA - DETAIL

### 3.1 Jenis Lomba & Pendaftaran

| Jenis | Sumber | Tombol "Daftar" | Aksi |
|-------|--------|-----------------|------|
| **Internal** | Kampus sendiri | ✅ Aktif | → Form internal (custom) |
| **Eksternal + Link** | Luar, ada link | ✅ Aktif | → Redirect ke link luar |
| **Eksternal - Info Only** | Luar, info saja | ❌ Tidak ada | Hanya "Lihat Detail" |

### 3.2 Field Database Lomba

```typescript
// Prisma Schema
model Lomba {
  id                  Int       @id @default(autoincrement())
  
  // Basic Info
  nama_lomba          String
  slug                String    @unique
  deskripsi           String?   @db.Text
  kategori            String    // teknologi, bisnis, dsb
  tingkat             String    // regional, nasional, internasional
  
  // Timing
  deadline            DateTime?
  tanggal_pelaksanaan DateTime?
  
  // Organization
  penyelenggara       String?
  lokasi              String?
  
  // Registration Type - KEY FIELD!
  sumber              String    @default("internal") // internal, eksternal
  tipe_pendaftaran    String    @default("internal") // internal, eksternal, none
  link_pendaftaran    String?   // For external registration
  
  // Custom Form (JSON) - for internal registration
  custom_form         Json?     // Field definitions
  
  // Details
  syarat_ketentuan    String?   @db.Text
  hadiah              Json?     // Array of prizes
  biaya               Int       @default(0)
  kontak_panitia      Json?     // {email, phone, website}
  
  // Display
  poster              String?   // File path/URL
  tags                Json?     // Array of tags
  is_featured         Boolean   @default(false)
  is_urgent           Boolean   @default(false)
  
  // Status
  status              String    @default("draft") // draft, open, closed
  is_deleted          Boolean   @default(false)
  
  // Timestamps
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt
  
  // Relations
  registrations       LombaRegistration[]
  
  @@index([slug])
  @@index([status])
  @@index([deadline])
}
```

### 3.3 Alur Tombol "Daftar" di Frontend

```typescript
// app/lomba/[slug]/page.tsx - Logic tombol Daftar

function DaftarButton({ lomba }) {
  // Case 1: Internal registration with custom form
  if (lomba.tipe_pendaftaran === 'internal') {
    return (
      <Link href={`/lomba/${lomba.slug}/daftar`}>
        <Button>Daftar Sekarang</Button>
      </Link>
    );
  }
  
  // Case 2: External registration via link
  if (lomba.tipe_pendaftaran === 'eksternal' && lomba.link_pendaftaran) {
    return (
      <a href={lomba.link_pendaftaran} target="_blank" rel="noopener noreferrer">
        <Button>
          <ExternalLink className="w-4 h-4 mr-2" />
          Daftar di Situs Penyelenggara
        </Button>
      </a>
    );
  }
  
  // Case 3: Info only - no registration button
  // (Or show disabled button / info message)
  return (
    <div className="text-center p-4 bg-gray-100 rounded-lg">
      <p className="text-gray-600">Informasi pendaftaran tersedia di website penyelenggara</p>
      {lomba.link_pendaftaran && (
        <a href={lomba.link_pendaftaran} className="text-primary underline">
          Kunjungi website
        </a>
      )}
    </div>
  );
}
```

### 3.4 Admin Interface - Create/Edit Lomba

Form admin untuk membuat lomba perlu field:

```
┌─────────────────────────────────────────────────────────────┐
│ BUAT LOMBA BARU                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Informasi Dasar                                             │
│ ├── Nama Lomba *                                            │
│ ├── Deskripsi                                               │
│ ├── Kategori *                                              │
│ ├── Tingkat * [Regional/Nasional/Internasional]            │
│ ├── Penyelenggara                                           │
│ └── Lokasi                                                  │
│                                                             │
│ Jadwal                                                      │
│ ├── Deadline Pendaftaran                                    │
│ └── Tanggal Pelaksanaan                                     │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ SUMBER & PENDAFTARAN                                    │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Sumber Lomba: ○ Internal  ● Eksternal                   │ │
│ │                                                         │ │
│ │ Tipe Pendaftaran:                                       │ │
│ │ ○ Form Internal (bisa custom)                           │ │
│ │ ● Link Eksternal                                        │ │
│ │ ○ Hanya Informasi (tidak ada pendaftaran)              │ │
│ │                                                         │ │
│ │ [Jika Eksternal/Link]                                   │ │
│ │ Link Pendaftaran: https://example.com/daftar            │ │
│ │                                                         │ │
│ │ [Jika Internal]                                         │ │
│ │ Form Fields: [+ Tambah Field]                           │ │
│ │ ├── Nama Lengkap (Text, Required)                       │ │
│ │ ├── NIM (Text, Required)                                │ │
│ │ ├── Email (Email, Required)                             │ │
│ │ └── Motivasi (Textarea, Optional)                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Detail Tambahan                                             │
│ ├── Syarat & Ketentuan (Rich Text)                         │
│ ├── Hadiah [+ Tambah]                                       │
│ ├── Biaya (Rp)                                              │
│ └── Kontak Panitia                                          │
│                                                             │
│ Media                                                       │
│ ├── Upload Poster                                           │
│ └── Tags                                                    │
│                                                             │
│ [Simpan sebagai Draft]  [Publish]                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. FITUR EXPO - DETAIL

### 4.1 Konsep Expo

```
Expo bisa dalam 2 konteks:
1. Event Internal - APM menyelenggarakan expo (karya mahasiswa)
2. Event Kerja Sama - Pihak luar mau kolaborasi

Untuk keduanya:
- Bisa dengan pendaftaran (form internal)
- Bisa tanpa pendaftaran (info only)
- Bisa dengan link luar (jarang)
```

### 4.2 Status Expo Global

Admin bisa mengontrol apakah fitur Expo aktif atau tidak:

```typescript
// Di SiteSettings atau dedicated table
model ExpoSettings {
  id                  Int       @id @default(1)
  is_active           Boolean   @default(true)
  inactive_message    String?   @default("Belum ada expo saat ini")
  next_expo_date      DateTime?
  updated_at          DateTime  @updatedAt
}
```

### 4.3 Field Database Expo

```typescript
model Expo {
  id                  Int       @id @default(autoincrement())
  
  // Basic Info
  nama_event          String
  slug                String    @unique
  tema                String?
  deskripsi           String?   @db.Text
  
  // Timing
  tanggal_mulai       DateTime
  tanggal_selesai     DateTime
  
  // Location
  lokasi              String
  alamat_lengkap      String?
  
  // Registration Type - Similar to Lomba
  tipe_pendaftaran    String    @default("none") // internal, eksternal, none
  link_pendaftaran    String?
  custom_form         Json?
  
  // Registration Settings
  registration_open   Boolean   @default(false)
  registration_deadline DateTime?
  max_participants    Int?
  biaya_partisipasi   Int       @default(0)
  
  // Content
  highlights          Json?     // Array of highlight items
  rundown             Json?     // Event schedule
  galeri              Json?     // Photo gallery
  benefit             String?   @db.Text
  website_resmi       String?
  
  // Display
  poster              String?
  is_featured         Boolean   @default(false)
  
  // Status
  status              String    @default("upcoming") // upcoming, ongoing, completed
  is_deleted          Boolean   @default(false)
  
  // Timestamps
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt
  
  // Relations
  registrations       ExpoRegistration[]
  
  @@index([slug])
  @@index([status])
}
```

### 4.4 Halaman Expo - Handling Status

```typescript
// app/expo/page.tsx

async function ExpoPage() {
  // Check global expo status
  const settings = await prisma.expoSettings.findFirst();
  
  if (!settings?.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Belum Ada Expo
          </h2>
          <p className="text-gray-500">
            {settings?.inactive_message || "Saat ini belum ada expo yang dijadwalkan."}
          </p>
          {settings?.next_expo_date && (
            <p className="mt-4 text-primary">
              Expo berikutnya: {format(settings.next_expo_date, 'dd MMMM yyyy')}
            </p>
          )}
          <Link href="/" className="mt-6 inline-block">
            <Button>Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Normal expo listing
  const activeExpos = await prisma.expo.findMany({
    where: { status: { in: ['upcoming', 'ongoing'] }, is_deleted: false },
    orderBy: { tanggal_mulai: 'asc' }
  });
  
  const pastExpos = await prisma.expo.findMany({
    where: { status: 'completed', is_deleted: false },
    orderBy: { tanggal_mulai: 'desc' },
    take: 6
  });
  
  return (
    <>
      {/* Active Expos */}
      <section>
        <h2>Expo Mendatang</h2>
        {activeExpos.map(expo => <ExpoCard key={expo.id} expo={expo} />)}
      </section>
      
      {/* Past Expos - Riwayat */}
      <section>
        <h2>Expo Sebelumnya</h2>
        {pastExpos.map(expo => <ExpoCard key={expo.id} expo={expo} variant="compact" />)}
      </section>
    </>
  );
}
```

---

## 5. FITUR PRESTASI - DETAIL

### 5.1 Alur Submission Prestasi (3 Tahap)

```
┌─────────────────────────────────────────────────────────────┐
│ TAHAP 1: INFO LOMBA/PRESTASI                                │
├─────────────────────────────────────────────────────────────┤
│ • Nama Prestasi (judul pencapaian)                          │
│ • Nama Lomba/Kompetisi                                      │
│ • Penyelenggara                                             │
│ • Tingkat (Regional/Nasional/Internasional)                │
│ • Peringkat (Juara 1, 2, 3, Harapan, dll)                   │
│ • Tanggal pencapaian                                        │
│ • Kategori                                                  │
│ • Deskripsi singkat                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ TAHAP 2: INFO TIM & PEMBIMBING                              │
├─────────────────────────────────────────────────────────────┤
│ ANGGOTA TIM                                                 │
│ ├── Ketua: Nama, NIM, Prodi, Angkatan, WhatsApp* (wajib)    │
│ └── Anggota (bisa tambah): Nama, NIM, Prodi                 │
│     → Minimal 1 anggota harus punya WhatsApp                │
│                                                             │
│ PEMBIMBING (opsional)                                       │
│ └── Nama Pembimbing, NIDN, WhatsApp* (wajib jika ada)       │
│                                                             │
│ INFO PENGISI (submitter)                                    │
│ ├── Nama                                                    │
│ ├── NIM                                                     │
│ ├── Email                                                   │
│ └── WhatsApp* (wajib, untuk dihubungi pengurus)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ TAHAP 3: DOKUMEN                                            │
├─────────────────────────────────────────────────────────────┤
│ WAJIB:                                                      │
│ ├── Sertifikat (PDF, max 5MB)                               │
│ ├── Dokumentasi (Gambar saja!)                              │
│ │   • Minimal 1 gambar                                      │
│ │   • Maksimal 6 gambar                                     │
│ │   • Format: JPG, PNG, WebP                                │
│ │   • Max per file: 2MB                                     │
│ └── Surat Pendukung (PDF, max 3MB)                          │
│     → Label BEBAS diisi mahasiswa                           │
│     → Contoh: "Surat Tugas", "SK Rektor", "Surat            │
│       Keterangan", dll (sesuai kompetisi)                   │
│                                                             │
│ OPSIONAL:                                                   │
│ ├── Link Berita (URL)                                       │
│ └── Link Portofolio (URL)                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                        [SUBMIT]
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ STATUS: MENUNGGU VERIFIKASI                                 │
│ → Pengurus akan menghubungi via WhatsApp jika perlu         │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Alur Admin Verifikasi

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN VERIFIKASI PRESTASI                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Filter: Pending | Approved | Rejected | Semua]             │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ SUBMISSION #42                          Status: PENDING │ │
│ │ Juara 1 Hackathon Nasional                              │ │
│ │ Oleh: John Doe (12345678)                               │ │
│ │ Submitted: 2 jam lalu                                   │ │
│ │                                                         │ │
│ │ [Lihat Detail] [Approve] [Tolak]                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                    [Klik "Lihat Detail"]
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ DETAIL SUBMISSION #42                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ INFO PRESTASI                                               │
│ ├── Nama: Juara 1 Hackathon Nasional                        │
│ ├── Lomba: Hackathon Indonesia 2026                         │
│ ├── Tingkat: Nasional                                       │
│ ├── Peringkat: Juara 1                                      │
│ ├── Tanggal: 15 Januari 2026                                │
│ └── Deskripsi: Tim kami berhasil...                         │
│                                                             │
│ TIM                                                         │
│ ├── Ketua: John Doe (12345678) - D4 JTD                     │
│ ├── Anggota: Jane Smith (12345679)                          │
│ └── Pembimbing: Dr. Budi (NIDN: 123456)                     │
│                                                             │
│ DOKUMEN                                                     │
│ ├── Sertifikat: [📄 Lihat PDF]                              │
│ ├── Dokumentasi: [📷 x4 gambar] [Klik untuk preview]        │
│ └── Surat Tugas: [📄 Lihat PDF]                             │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ KEPUTUSAN:                                                  │
│ ○ Tolak (dengan alasan)                                     │
│ ● Approve & Lanjut ke Editing                               │
│                                                             │
│ Catatan Reviewer:                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ (opsional, untuk ditunjukkan ke mahasiswa)              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Tolak]                                    [Approve & Edit] │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Halaman Edit Prestasi (Setelah Approve)

```
┌─────────────────────────────────────────────────────────────┐
│ EDIT PRESTASI UNTUK PUBLIKASI                               │
│ Data dari submission #42                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ INFORMASI TAMPILAN                                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Judul (untuk ditampilkan di web):                       │ │
│ │ [Juara 1 Hackathon Nasional 2026                    ]   │ │
│ │                                                         │ │
│ │ Deskripsi Lengkap:                                      │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Tim mahasiswa Teknik Telekomunikasi berhasil...     │ │ │
│ │ │ (Rich text editor)                                  │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ FOTO UNTUK TAMPILAN WEB                                     │
│ (Pilih dari dokumentasi yang diupload mahasiswa)            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Thumbnail (1 foto utama):                               │ │
│ │ ┌───┐ ┌───┐ ┌───┐ ┌───┐                                │ │
│ │ │ ✓ │ │   │ │   │ │   │  ← Klik untuk pilih            │ │
│ │ └───┘ └───┘ └───┘ └───┘                                │ │
│ │                                                         │ │
│ │ Galeri (pilih yang akan ditampilkan):                   │ │
│ │ ☑ Foto 1  ☑ Foto 2  ☐ Foto 3  ☑ Foto 4                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ PENGATURAN                                                  │
│ ☑ Tampilkan di Home (Featured)                              │
│ ☑ Publish segera                                            │
│                                                             │
│ [Simpan Draft]                             [Publish]        │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 Database Schema Prestasi

```typescript
// Submission (data mentah dari mahasiswa)
model PrestasiSubmission {
  id                  Int       @id @default(autoincrement())
  
  // Info Prestasi
  judul               String
  nama_lomba          String
  penyelenggara       String?
  tingkat             String    // regional, nasional, internasional
  peringkat           String
  tanggal             DateTime?
  kategori            String?
  deskripsi           String?   @db.Text
  
  // Submitter (dengan WhatsApp wajib!)
  submitter_name      String
  submitter_nim       String
  submitter_email     String
  submitter_whatsapp  String    // WAJIB - untuk dihubungi pengurus
  
  // Status
  status              String    @default("pending") // pending, approved, rejected
  reviewer_notes      String?   @db.Text
  reviewed_at         DateTime?
  reviewed_by         Int?      // Admin ID
  
  // Timestamps
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt
  
  // Relations
  team_members        PrestasiTeamMember[]
  pembimbing          PrestasiPembimbing[]
  documents           PrestasiDocument[]
  
  // Link to published prestasi (if approved)
  published_prestasi  Prestasi?
  
  @@index([status])
  @@index([submitter_nim])
}

// Tim peserta
model PrestasiTeamMember {
  id                  Int       @id @default(autoincrement())
  submission_id       Int
  nama                String
  nim                 String
  prodi               String?
  angkatan            String?
  whatsapp            String?   // Minimal 1 anggota harus punya WhatsApp
  is_ketua            Boolean   @default(false)
  
  submission          PrestasiSubmission @relation(fields: [submission_id], references: [id], onDelete: Cascade)
  
  @@index([submission_id])
}

// Pembimbing
model PrestasiPembimbing {
  id                  Int       @id @default(autoincrement())
  submission_id       Int
  nama                String
  nidn                String?
  whatsapp            String?   // WhatsApp pembimbing (wajib jika ada pembimbing)
  
  submission          PrestasiSubmission @relation(fields: [submission_id], references: [id], onDelete: Cascade)
  
  @@index([submission_id])
}

// Dokumen submission
model PrestasiDocument {
  id                  Int       @id @default(autoincrement())
  submission_id       Int
  type                String    // sertifikat, dokumentasi, surat_pendukung
  label               String?   // Label bebas untuk surat (mis: "Surat Tugas", "SK Rektor")
  file_path           String
  file_name           String
  file_type           String    // pdf, jpg, png
  file_size           Int
  
  submission          PrestasiSubmission @relation(fields: [submission_id], references: [id], onDelete: Cascade)
  
  @@index([submission_id])
  @@index([type])
}

// Prestasi yang sudah dipublish (hasil editing admin)
model Prestasi {
  id            Int       @id @default(autoincrement())
  submission_id Int       @unique
  
  // Display info (bisa berbeda dari submission)
  judul               String
  slug                String    @unique
  nama_lomba          String
  tingkat             String
  peringkat           String
  tahun               Int
  kategori            String?
  deskripsi           String?   @db.Text
  
  // Media (dipilih oleh admin)
  thumbnail           String?   // Main photo
  galeri              Json?     // Array of photo paths
  
  // Sertifikat - configurable visibility!
  sertifikat          String?   // Path ke file
  sertifikat_public   Boolean   @default(false) // Bisa publik atau admin-only
  
  // Links
  link_berita         String?
  link_portofolio     String?
  
  // Display settings
  is_featured         Boolean   @default(false)
  is_published        Boolean   @default(true)
  
  // Timestamps
  published_at        DateTime  @default(now())
  updated_at          DateTime  @updatedAt
  
  // Relations
  submission          PrestasiSubmission @relation(fields: [submission_id], references: [id])
  
  @@index([slug])
  @@index([tahun])
  @@index([is_published])
}
```

### 5.5 Surat Pendukung - Label Bebas

Karena setiap kompetisi dari penyelenggara berbeda-beda, mahasiswa **bebas mengisi label** untuk surat pendukung.

**Implementasi di Form:**
```typescript
// Form field untuk surat pendukung
<div className="space-y-2">
  <FormField 
    label="Nama/Jenis Surat"
    placeholder="Contoh: Surat Tugas, SK Rektor, Surat Keterangan, dll"
    required
  />
  <FileUpload 
    label="Upload Surat (PDF, max 3MB)"
    accept=".pdf"
    maxSize={3 * 1024 * 1024}
    required
  />
</div>
```

**Contoh data yang disimpan:**
```json
{
  "type": "surat_pendukung",
  "label": "Surat Tugas dari Wakil Rektor 3",
  "file_path": "/uploads/document/2026-01-29/abc123.pdf",
  "file_name": "surat_tugas.pdf",
  "file_type": "pdf",
  "file_size": 245000
}
```

---

## 6. SISTEM AUTENTIKASI & KEAMANAN

### 6.1 Strategi Auth

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYERS                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PUBLIC (No Auth Required)                                  │
│  ├── GET /api/v2/lomba           (list lomba)               │
│  ├── GET /api/v2/lomba/:id       (detail lomba)             │
│  ├── GET /api/v2/expo            (list expo)                │
│  ├── GET /api/v2/prestasi        (published prestasi)       │
│  ├── POST /api/v2/lomba/:id/register  (pendaftaran)         │
│  ├── POST /api/v2/expo/:id/register   (pendaftaran)         │
│  └── POST /api/v2/prestasi/submit     (submit prestasi)     │
│                                                             │
│  RATE LIMITED (Anti-spam)                                   │
│  ├── POST /api/v2/*/register     (5 req/hour per IP)        │
│  ├── POST /api/v2/prestasi/submit (3 req/hour per IP)       │
│  └── POST /api/v2/uploads        (10 req/hour per IP)       │
│                                                             │
│  ADMIN PROTECTED (Cookie Auth)                              │
│  ├── ALL /api/admin/*                                       │
│  ├── PATCH /api/v2/prestasi/:id/verify                      │
│  └── POST/PATCH/DELETE operations on admin routes           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Admin Authentication - Custom JWT ✅

**Keputusan: Custom JWT + Database**
- ✅ Full control
- ✅ No external dependency
- ✅ Session 7 hari (bisa lebih lama)
- ✅ Simple & reliable

### 6.3 Implementasi Auth (Opsi B - Custom JWT)

```typescript
// lib/auth/session.ts
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days

interface AdminSession {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
}

export async function createSession(admin: AdminSession) {
  const token = await new SignJWT({ ...admin })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(SECRET);
  
  cookies().set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });
  
  return token;
}

export async function verifySession(): Promise<AdminSession | null> {
  const token = cookies().get('admin_session')?.value;
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as AdminSession;
  } catch {
    return null;
  }
}

export async function destroySession() {
  cookies().delete('admin_session');
}
```

```typescript
// Database table for admins
model Admin {
  id                  Int       @id @default(autoincrement())
  email               String    @unique
  password_hash       String    // bcrypt hashed
  name                String
  role                String    @default("admin") // admin, superadmin
  is_active           Boolean   @default(true)
  last_login          DateTime?
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt
  
  @@index([email])
}
```

### 6.4 Rate Limiting

```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
  interval: number; // in ms
  uniqueTokenPerInterval: number;
};

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (limit: number, token: string): Promise<{ success: boolean; remaining: number }> => {
      return new Promise((resolve) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;
        
        if (!isRateLimited) {
          tokenCount[0] = currentUsage + 1;
          tokenCache.set(token, tokenCount);
        }
        
        resolve({
          success: !isRateLimited,
          remaining: Math.max(0, limit - currentUsage - 1),
        });
      });
    },
  };
}

// Usage in API route
const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest) {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success, remaining } = await limiter.check(5, ip); // 5 requests per hour
  
  if (!success) {
    return NextResponse.json(
      { error: 'Terlalu banyak percobaan. Coba lagi nanti.' },
      { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
    );
  }
  
  // ... rest of handler
}
```

### 6.5 Input Validation (Zod)

```typescript
// lib/validations/lomba.schema.ts
import { z } from 'zod';

// Regex untuk WhatsApp Indonesia
const whatsappRegex = /^(\+62|62|0)8[1-9][0-9]{7,10}$/;

export const lombaRegistrationSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter').max(100),
  nim: z.string().regex(/^\d{8,12}$/, 'NIM harus 8-12 digit angka'),
  email: z.string().email('Format email tidak valid'),
  whatsapp: z.string().regex(whatsappRegex, 'Format WhatsApp tidak valid (contoh: 081234567890)'),
  fakultas: z.string().min(1, 'Fakultas wajib dipilih'),
  prodi: z.string().min(1, 'Program studi wajib diisi'),
  // Custom fields will be validated dynamically
  custom_fields: z.record(z.any()).optional(),
});

export const prestasiSubmissionSchema = z.object({
  judul: z.string().min(5, 'Judul minimal 5 karakter').max(200),
  nama_lomba: z.string().min(3).max(200),
  tingkat: z.enum(['regional', 'nasional', 'internasional']),
  peringkat: z.string().min(1).max(50),
  tanggal: z.string().datetime().optional(),
  kategori: z.string().optional(),
  deskripsi: z.string().max(2000).optional(),
  
  // Submitter dengan WhatsApp wajib
  submitter_name: z.string().min(3).max(100),
  submitter_nim: z.string().regex(/^\d{8,12}$/),
  submitter_email: z.string().email(),
  submitter_whatsapp: z.string().regex(whatsappRegex, 'Format WhatsApp tidak valid'),
  
  team_members: z.array(z.object({
    nama: z.string().min(3),
    nim: z.string().regex(/^\d{8,12}$/),
    prodi: z.string().optional(),
    angkatan: z.string().optional(),
    whatsapp: z.string().regex(whatsappRegex).optional(),
    is_ketua: z.boolean().default(false),
  })).min(1, 'Minimal 1 anggota tim (ketua)')
    .refine(
      // Minimal 1 anggota harus punya WhatsApp
      (members) => members.some(m => m.whatsapp),
      'Minimal 1 anggota tim harus memiliki nomor WhatsApp'
    ),
  
  pembimbing: z.array(z.object({
    nama: z.string().min(3),
    nidn: z.string().optional(),
    whatsapp: z.string().regex(whatsappRegex, 'Format WhatsApp pembimbing tidak valid'),
  })).optional(),
  
  // Dokumen - surat dengan label bebas
  surat_label: z.string().min(3, 'Nama surat minimal 3 karakter').max(100),
});
```

---

## 7. CUSTOM FORM BUILDER (FULL)

### 7.1 Konsep - Full Form Builder ✅

Admin bisa mendefinisikan field tambahan untuk form pendaftaran lomba/expo internal dengan:
- **Drag & Drop** untuk mengatur urutan field
- **Validasi lengkap** (required, min/max, pattern, dll)
- **Conditional logic** (tampilkan field X jika field Y = nilai tertentu)

### 7.2 Field Types Supported

| Type | Deskripsi | Validasi |
|------|-----------|----------|
| `text` | Input teks biasa | min/max length, pattern |
| `email` | Input email | format email |
| `number` | Input angka | min/max value |
| `phone` | Input telepon/WA | format nomor |
| `select` | Dropdown pilihan | required, options |
| `multiselect` | Pilih multiple | min/max selections |
| `textarea` | Teks panjang | min/max length |
| `checkbox` | Centang tunggal | - |
| `checkboxGroup` | Centang multiple | min/max checked |
| `radio` | Pilih satu dari banyak | required |
| `date` | Pilih tanggal | min/max date |
| `file` | Upload file | max size, allowed types |

### 7.3 Data Structure

```typescript
// Field definition in JSON - EXTENDED for full builder
interface FormFieldDefinition {
  id: string;           // Unique identifier
  type: 'text' | 'email' | 'number' | 'phone' | 'select' | 'multiselect' | 
        'textarea' | 'checkbox' | 'checkboxGroup' | 'radio' | 'date' | 'file';
  label: string;
  placeholder?: string;
  helpText?: string;    // Hint dibawah field
  required: boolean;
  options?: { value: string; label: string }[];   // For select/radio/checkbox
  
  // Validasi
  validation?: {
    min?: number;       // min length / min value / min selections
    max?: number;       // max length / max value / max selections
    pattern?: string;   // Regex pattern
    message?: string;   // Custom error message
    allowedTypes?: string[];  // For file: ['pdf', 'jpg', 'png']
    maxFileSize?: number;     // For file: in bytes
  };
  
  // Conditional Logic
  condition?: {
    dependsOn: string;  // Field ID yang jadi trigger
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
    value: any;         // Nilai yang diharapkan
  };
  
  // Display
  width?: 'full' | 'half';  // Layout
  order: number;            // Urutan tampil
}

// Example: custom_form dengan conditional logic
{
  "fields": [
    {
      "id": "participation_type",
      "type": "radio",
      "label": "Tipe Partisipasi",
      "required": true,
      "options": [
        { "value": "individual", "label": "Individu" },
        { "value": "team", "label": "Tim" }
      ],
      "order": 1
    },
    {
      "id": "team_name",
      "type": "text",
      "label": "Nama Tim",
      "required": true,
      "condition": {
        "dependsOn": "participation_type",
        "operator": "equals",
        "value": "team"
      },
      "order": 2
    },
    {
      "id": "team_size",
      "type": "select",
      "label": "Jumlah Anggota",
      "required": true,
      "options": [
        { "value": "2", "label": "2 orang" },
        { "value": "3", "label": "3 orang" },
        { "value": "4", "label": "4 orang" },
        { "value": "5", "label": "5 orang" }
      ],
      "condition": {
        "dependsOn": "participation_type",
        "operator": "equals",
        "value": "team"
      },
      "order": 3
    },
    {
      "id": "experience",
      "type": "textarea",
      "label": "Pengalaman Lomba Sebelumnya",
      "required": false,
      "placeholder": "Ceritakan pengalaman lomba kamu...",
      "validation": {
        "max": 500,
        "message": "Maksimal 500 karakter"
      },
      "order": 4
    },
    {
      "id": "cv",
      "type": "file",
      "label": "Upload CV",
      "required": false,
      "helpText": "Format PDF, maksimal 2MB",
      "validation": {
        "allowedTypes": ["pdf"],
        "maxFileSize": 2097152
      },
      "order": 5
    }
  ]
}
```

### 7.4 Admin UI - Form Builder (Drag & Drop)

```
┌─────────────────────────────────────────────────────────────┐
│ FORM BUILDER - Lomba Hackathon 2026                         │
│ Drag & drop untuk mengatur urutan field                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─ DEFAULT FIELDS (Tidak bisa dihapus) ───────────────────┐ │
│ │ ✓ Nama Lengkap    ✓ NIM           ✓ Email               │ │
│ │ ✓ WhatsApp        ✓ Fakultas      ✓ Program Studi       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ CUSTOM FIELDS:                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⋮⋮ Tipe Partisipasi    Radio       Required  [⚙️] [🗑️] │ │
│ │    └─ Opsi: Individu, Tim                                │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ⋮⋮ Nama Tim            Text        Required  [⚙️] [🗑️] │ │
│ │    └─ 🔗 Tampil jika: Tipe Partisipasi = "Tim"          │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ⋮⋮ Jumlah Anggota      Select      Required  [⚙️] [🗑️] │ │
│ │    └─ 🔗 Tampil jika: Tipe Partisipasi = "Tim"          │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ⋮⋮ Pengalaman          Textarea    Optional  [⚙️] [🗑️] │ │
│ │    └─ Max 500 karakter                                   │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ⋮⋮ Upload CV           File        Optional  [⚙️] [🗑️] │ │
│ │    └─ PDF only, max 2MB                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [+ Tambah Field]                                            │
│                                                             │
│ ┌─ Add/Edit Field Modal ────────────────────────────────┐   │
│ │                                                       │   │
│ │ Tipe Field:  [Select ▾]                               │   │
│ │              ┌────────────────────────┐               │   │
│ │              │ Text                   │               │   │
│ │              │ Email                  │               │   │
│ │              │ Number                 │               │   │
│ │              │ Phone/WhatsApp         │               │   │
│ │              │ Select (Dropdown)      │ ◄─            │   │
│ │              │ Multi-Select           │               │   │
│ │              │ Radio (Pilih 1)        │               │   │
│ │              │ Checkbox               │               │   │
│ │              │ Checkbox Group         │               │   │
│ │              │ Textarea               │               │   │
│ │              │ Date Picker            │               │   │
│ │              │ File Upload            │               │   │
│ │              └────────────────────────┘               │   │
│ │                                                       │   │
│ │ Label:       [Jumlah Anggota                       ]  │   │
│ │ Placeholder: [Pilih jumlah anggota tim             ]  │   │
│ │ Help Text:   [Minimal 2, maksimal 5 orang          ]  │   │
│ │                                                       │   │
│ │ Opsi (untuk Select/Radio/Checkbox):                   │   │
│ │ ┌─────────────────────────────────────────────────┐   │   │
│ │ │ 2 orang                                    [🗑️] │   │   │
│ │ │ 3 orang                                    [🗑️] │   │   │
│ │ │ 4 orang                                    [🗑️] │   │   │
│ │ │ 5 orang                                    [🗑️] │   │   │
│ │ │ [+ Tambah Opsi]                                 │   │   │
│ │ └─────────────────────────────────────────────────┘   │   │
│ │                                                       │   │
│ │ Validasi:                                             │   │
│ │ ☑ Wajib diisi                                         │   │
│ │ ☐ Min: [  ]  Max: [  ]                                │   │
│ │ ☐ Custom pattern (regex): [                        ]  │   │
│ │                                                       │   │
│ │ Conditional Logic:                                    │   │
│ │ ☑ Tampilkan field ini hanya jika:                     │   │
│ │    Field [Tipe Partisipasi ▾]                         │   │
│ │    [equals ▾]                                         │   │
│ │    [Tim ▾]                                            │   │
│ │                                                       │   │
│ │ Layout:                                               │   │
│ │ ● Full width   ○ Half width                           │   │
│ │                                                       │   │
│ │ [Batal]                              [Simpan Field]   │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.5 Frontend - Dynamic Form Renderer dengan Conditional Logic

```typescript
// components/forms/DynamicForm.tsx
'use client';

import { useMemo } from 'react';
import { FormFieldDefinition } from '@/types';
import { FormField, TextAreaField, SelectField, FileUpload, RadioGroup, CheckboxGroup, DatePicker } from '@/components/forms';

interface DynamicFormProps {
  fields: FormFieldDefinition[];
  values: Record<string, any>;
  errors: Record<string, string>;
  onChange: (fieldId: string, value: any) => void;
}

// Helper: evaluasi conditional logic
function shouldShowField(field: FormFieldDefinition, values: Record<string, any>): boolean {
  if (!field.condition) return true;
  
  const { dependsOn, operator, value } = field.condition;
  const dependentValue = values[dependsOn];
  
  switch (operator) {
    case 'equals':
      return dependentValue === value;
    case 'notEquals':
      return dependentValue !== value;
    case 'contains':
      return Array.isArray(dependentValue) 
        ? dependentValue.includes(value)
        : String(dependentValue).includes(value);
    case 'greaterThan':
      return Number(dependentValue) > Number(value);
    case 'lessThan':
      return Number(dependentValue) < Number(value);
    default:
      return true;
  }
}

export function DynamicForm({ fields, values, errors, onChange }: DynamicFormProps) {
  // Sort by order & filter visible fields
  const visibleFields = useMemo(() => {
    return fields
      .filter(field => shouldShowField(field, values))
      .sort((a, b) => a.order - b.order);
  }, [fields, values]);

  return (
    <div className="space-y-4">
      {visibleFields.map((field) => {
        const commonProps = {
          key: field.id,
          label: field.label,
          required: field.required,
          error: errors[field.id],
          helpText: field.helpText,
        };
        
        switch (field.type) {
          case 'text':
          case 'email':
          case 'number':
          case 'phone':
            return (
              <FormField
                {...commonProps}
                type={field.type === 'phone' ? 'tel' : field.type}
                value={values[field.id] || ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                placeholder={field.placeholder}
              />
            );
          
          case 'textarea':
            return (
              <TextAreaField
                {...commonProps}
                value={values[field.id] || ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                maxLength={field.validation?.max}
              />
            );
          
          case 'select':
            return (
              <SelectField
                {...commonProps}
                value={values[field.id] || ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                options={field.options || []}
              />
            );
          
          case 'multiselect':
            return (
              <SelectField
                {...commonProps}
                value={values[field.id] || []}
                onChange={(selected) => onChange(field.id, selected)}
                options={field.options || []}
                multiple
              />
            );
          
          case 'radio':
            return (
              <RadioGroup
                {...commonProps}
                value={values[field.id] || ''}
                onChange={(value) => onChange(field.id, value)}
                options={field.options || []}
              />
            );
          
          case 'checkbox':
            return (
              <label key={field.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={values[field.id] || false}
                  onChange={(e) => onChange(field.id, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span>{field.label}</span>
              </label>
            );
          
          case 'checkboxGroup':
            return (
              <CheckboxGroup
                {...commonProps}
                value={values[field.id] || []}
                onChange={(selected) => onChange(field.id, selected)}
                options={field.options || []}
              />
            );
          
          case 'date':
            return (
              <DatePicker
                {...commonProps}
                value={values[field.id] || null}
                onChange={(date) => onChange(field.id, date)}
                minDate={field.validation?.min ? new Date(field.validation.min) : undefined}
                maxDate={field.validation?.max ? new Date(field.validation.max) : undefined}
              />
            );
          
          case 'file':
            return (
              <FileUpload
                {...commonProps}
                value={values[field.id]}
                onChange={(file) => onChange(field.id, file)}
                accept={field.validation?.allowedTypes?.map(t => `.${t}`).join(',')}
                maxSize={field.validation?.maxFileSize}
              />
            );
          
          default:
            return null;
        }
      })}
    </div>
  );
}
```

---

## 8. DATABASE SCHEMA

### 8.1 Full Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ADMIN & AUTH
// ============================================

model Admin {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  password_hash String
  name          String
  role          String    @default("admin")
  is_active     Boolean   @default(true)
  last_login    DateTime?
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  
  @@index([email])
}

// ============================================
// LOMBA
// ============================================

model Lomba {
  id                  Int       @id @default(autoincrement())
  nama_lomba          String
  slug                String    @unique
  deskripsi           String?   @db.Text
  kategori            String
  tingkat             String
  
  deadline            DateTime?
  tanggal_pelaksanaan DateTime?
  
  penyelenggara       String?
  lokasi              String?
  
  sumber              String    @default("internal")
  tipe_pendaftaran    String    @default("internal")
  link_pendaftaran    String?
  custom_form         Json?
  
  syarat_ketentuan    String?   @db.Text
  hadiah              Json?
  biaya               Int       @default(0)
  kontak_panitia      Json?
  
  poster              String?
  tags                Json?
  is_featured         Boolean   @default(false)
  is_urgent           Boolean   @default(false)
  
  status              String    @default("draft")
  is_deleted          Boolean   @default(false)
  
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt
  
  registrations       LombaRegistration[]
  
  @@index([slug])
  @@index([status])
  @@index([deadline])
}

model LombaRegistration {
  id            Int       @id @default(autoincrement())
  lomba_id      Int
  
  nama          String
  nim           String
  email         String
  whatsapp      String    // WAJIB - untuk dihubungi pengurus
  fakultas      String
  prodi         String
  
  custom_data   Json?     // Data dari custom form builder
  
  // Status - langsung masuk tanpa verifikasi
  status        String    @default("registered") // registered (langsung masuk)
  
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  
  lomba         Lomba     @relation(fields: [lomba_id], references: [id], onDelete: Cascade)
  
  @@index([lomba_id])
  @@index([email])
  @@index([nim])
}

// ============================================
// EXPO
// ============================================

model ExpoSettings {
  id                Int       @id @default(1)
  is_active         Boolean   @default(true)
  inactive_message  String?   @default("Belum ada expo saat ini. Nantikan update selanjutnya!") // Bisa diubah admin
  next_expo_date    DateTime?
  updated_at        DateTime  @updatedAt
}

model Expo {
  id                    Int       @id @default(autoincrement())
  nama_event            String
  slug                  String    @unique
  tema                  String?
  deskripsi             String?   @db.Text
  
  tanggal_mulai         DateTime
  tanggal_selesai       DateTime
  
  lokasi                String
  alamat_lengkap        String?
  
  tipe_pendaftaran      String    @default("none")
  link_pendaftaran      String?
  custom_form           Json?
  
  registration_open     Boolean   @default(false)
  registration_deadline DateTime?
  max_participants      Int?
  biaya_partisipasi     Int       @default(0)
  
  highlights            Json?
  rundown               Json?
  galeri                Json?
  benefit               String?   @db.Text
  website_resmi         String?
  
  poster                String?
  is_featured           Boolean   @default(false)
  
  status                String    @default("upcoming")
  is_deleted            Boolean   @default(false)
  
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt
  
  registrations         ExpoRegistration[]
  
  @@index([slug])
  @@index([status])
}

model ExpoRegistration {
  id            Int       @id @default(autoincrement())
  expo_id       Int
  
  nama          String
  nim           String
  email         String
  whatsapp      String    // WAJIB - untuk dihubungi pengurus
  
  project_name  String?
  project_desc  String?   @db.Text
  
  custom_data   Json?     // Data dari custom form builder
  
  // Status - langsung masuk tanpa verifikasi
  status        String    @default("registered") // registered (langsung masuk)
  
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  
  expo          Expo      @relation(fields: [expo_id], references: [id], onDelete: Cascade)
  
  @@index([expo_id])
  @@index([email])
  @@index([nim])
}

// ============================================
// PRESTASI
// ============================================

model PrestasiSubmission {
  id                Int       @id @default(autoincrement())
  
  judul             String
  nama_lomba        String
  penyelenggara     String?
  tingkat           String
  peringkat         String
  tanggal           DateTime?
  kategori          String?
  deskripsi         String?   @db.Text
  
  // Submitter dengan WhatsApp wajib
  submitter_name      String
  submitter_nim       String
  submitter_email     String
  submitter_whatsapp  String    // WAJIB - untuk dihubungi pengurus
  
  status            String    @default("pending")
  reviewer_notes    String?   @db.Text
  reviewed_at       DateTime?
  reviewed_by       Int?
  
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  
  team_members      PrestasiTeamMember[]
  pembimbing        PrestasiPembimbing[]
  documents         PrestasiDocument[]
  published         Prestasi?
  
  @@index([status])
  @@index([submitter_nim])
}

model PrestasiTeamMember {
  id            Int       @id @default(autoincrement())
  submission_id Int
  nama          String
  nim           String
  prodi         String?
  angkatan      String?
  whatsapp      String?   // Minimal 1 anggota harus punya WhatsApp
  is_ketua      Boolean   @default(false)
  
  submission    PrestasiSubmission @relation(fields: [submission_id], references: [id], onDelete: Cascade)
  
  @@index([submission_id])
}

model PrestasiPembimbing {
  id            Int       @id @default(autoincrement())
  submission_id Int
  nama          String
  nidn          String?
  whatsapp      String?   // WhatsApp pembimbing (wajib jika ada pembimbing)
  nidn          String?
  
  submission    PrestasiSubmission @relation(fields: [submission_id], references: [id], onDelete: Cascade)
  
  @@index([submission_id])
}

model PrestasiDocument {
  id            Int       @id @default(autoincrement())
  submission_id Int
  type          String    // sertifikat, dokumentasi, surat_tugas
  file_path     String
  file_name     String
  file_type     String
  file_size     Int
  
  submission    PrestasiSubmission @relation(fields: [submission_id], references: [id], onDelete: Cascade)
  
  @@index([submission_id])
  @@index([type])
}

model Prestasi {
  id            Int       @id @default(autoincrement())
  submission_id Int       @unique
  
  judul         String
  slug          String    @unique
  nama_lomba    String
  tingkat       String
  peringkat     String
  tahun         Int
  kategori      String?
  deskripsi     String?   @db.Text
  
  thumbnail     String?
  galeri        Json?
  sertifikat    String?
  
  link_berita     String?
  link_portofolio String?
  
  is_featured   Boolean   @default(false)
  is_published  Boolean   @default(true)
  
  published_at  DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  
  submission    PrestasiSubmission @relation(fields: [submission_id], references: [id])
  
  @@index([slug])
  @@index([tahun])
  @@index([is_published])
}
```

---

## 9. API ROUTES BARU

### 9.1 Struktur Lengkap

```
app/api/v2/
├── lomba/
│   ├── route.ts                    GET (list), POST (create - admin)
│   └── [id]/
│       ├── route.ts                GET (detail), PATCH, DELETE
│       └── register/
│           └── route.ts            POST (public registration)
│
├── expo/
│   ├── settings/
│   │   └── route.ts                GET, PATCH (admin)
│   ├── route.ts                    GET (list), POST (create - admin)
│   └── [id]/
│       ├── route.ts                GET, PATCH, DELETE
│       └── register/
│           └── route.ts            POST (public registration)
│
├── prestasi/
│   ├── route.ts                    GET (published list)
│   ├── submit/
│   │   └── route.ts                POST (public submission)
│   └── [id]/
│       ├── route.ts                GET (detail)
│       └── verify/
│           └── route.ts            POST (admin verify/reject)
│
├── admin/
│   ├── auth/
│   │   ├── login/route.ts          POST
│   │   └── logout/route.ts         POST
│   ├── submissions/
│   │   ├── route.ts                GET (all pending)
│   │   └── [id]/
│   │       └── route.ts            GET, PATCH (edit for publish)
│   └── registrations/
│       ├── lomba/route.ts          GET (list registrations)
│       └── expo/route.ts           GET (list registrations)
│
├── uploads/
│   └── route.ts                    POST (file upload)
│
└── calendar/
    └── route.ts                    GET (events for calendar)
```

### 9.2 Contoh API Implementation

```typescript
// app/api/v2/lomba/[id]/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { lombaRegistrationSchema } from '@/lib/validations/lomba.schema';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
    const { success } = await limiter.check(5, `register_${ip}`);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan. Coba lagi dalam 1 jam.' },
        { status: 429 }
      );
    }
    
    // Get lomba
    const lomba = await prisma.lomba.findUnique({
      where: { id: parseInt(params.id) },
    });
    
    if (!lomba) {
      return NextResponse.json({ error: 'Lomba tidak ditemukan' }, { status: 404 });
    }
    
    if (lomba.status !== 'open') {
      return NextResponse.json({ error: 'Pendaftaran sudah ditutup' }, { status: 400 });
    }
    
    if (lomba.tipe_pendaftaran !== 'internal') {
      return NextResponse.json(
        { error: 'Pendaftaran untuk lomba ini tidak melalui sistem kami' },
        { status: 400 }
      );
    }
    
    // Parse and validate body
    const body = await request.json();
    const validation = lombaRegistrationSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    const { custom_fields, ...baseData } = validation.data;
    
    // Check for duplicate registration
    const existing = await prisma.lombaRegistration.findFirst({
      where: {
        lomba_id: lomba.id,
        OR: [
          { nim: baseData.nim },
          { email: baseData.email },
        ],
      },
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'NIM atau email sudah terdaftar untuk lomba ini' },
        { status: 400 }
      );
    }
    
    // Create registration
    const registration = await prisma.lombaRegistration.create({
      data: {
        lomba_id: lomba.id,
        ...baseData,
        custom_data: custom_fields,
      },
    });
    
    // TODO: Send confirmation email
    
    return NextResponse.json({
      success: true,
      message: 'Pendaftaran berhasil!',
      data: { id: registration.id },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
```

---

## 10. FILE UPLOAD STRATEGY

### 10.1 Opsi Upload

| Opsi | Pro | Con | Rekomendasi |
|------|-----|-----|-------------|
| **Local Storage** | Simple, no external dependency | Not scalable, backup manual | ✅ Phase 1 |
| **Cloudinary** | Free tier, image optimization | External dependency | ⚠️ Optional |
| **Uploadthing** | Made for Next.js, easy | Paid after limit | ⚠️ Optional |
| **S3/MinIO** | Scalable, industry standard | Setup complexity | 🔮 Phase 2 |

### 10.2 Local Storage Implementation

```typescript
// app/api/v2/uploads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_TYPES: Record<string, string[]> = {
  document: ['application/pdf'],
  image: ['image/jpeg', 'image/png', 'image/webp'],
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'document' or 'image'
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File terlalu besar (max 5MB)' }, { status: 400 });
    }
    
    const allowedMimes = ALLOWED_TYPES[type] || [];
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipe file tidak diizinkan' }, { status: 400 });
    }
    
    // Create upload directory if not exists
    const dateFolder = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const uploadPath = path.join(UPLOAD_DIR, type, dateFolder);
    
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true });
    }
    
    // Generate unique filename
    const ext = path.extname(file.name);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(uploadPath, filename);
    
    // Write file
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));
    
    // Return public URL
    const publicUrl = `/uploads/${type}/${dateFolder}/${filename}`;
    
    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        filename: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

### 10.3 Folder Structure

```
public/
└── uploads/
    ├── document/
    │   ├── 2026-01-29/
    │   │   ├── abc123.pdf
    │   │   └── def456.pdf
    │   └── 2026-01-30/
    └── image/
        ├── 2026-01-29/
        │   ├── img001.jpg
        │   └── img002.png
        └── 2026-01-30/
```

---

## 11. KALENDER INTEGRATION

### 11.1 Data Source - Extensible ✅

Kalender akan menampilkan:
- ✅ **Lomba** (deadline & tanggal pelaksanaan)
- ✅ **Expo** (tanggal mulai - selesai)
- ✅ **Custom Events** (bisa ditambah admin untuk event lain)

### 11.2 Custom Event Table (untuk event selain Lomba/Expo)

```typescript
model CalendarEvent {
  id            Int       @id @default(autoincrement())
  
  title         String
  description   String?
  type          String    @default("event") // event, meeting, announcement, dll
  color         String?   @default("#3B82F6") // Hex color untuk display
  
  start_date    DateTime
  end_date      DateTime?
  all_day       Boolean   @default(true)
  
  link          String?   // Link ke detail (optional)
  
  is_active     Boolean   @default(true)
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  
  @@index([start_date])
  @@index([is_active])
}
```

### 11.3 API Endpoint - Gabungan Semua Event

```typescript
// app/api/v2/calendar/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // Format: YYYY-MM
  
  const startDate = new Date(`${month}-01`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  
  // Get lomba events
  const lombaEvents = await prisma.lomba.findMany({
    where: {
      status: 'open',
      is_deleted: false,
      OR: [
        { deadline: { gte: startDate, lt: endDate } },
        { tanggal_pelaksanaan: { gte: startDate, lt: endDate } },
      ],
    },
    select: {
      id: true,
      nama_lomba: true,
      slug: true,
      deadline: true,
      tanggal_pelaksanaan: true,
      kategori: true,
      is_urgent: true,
    },
  });
  
  // Get expo events
  const expoEvents = await prisma.expo.findMany({
    where: {
      is_deleted: false,
      OR: [
        { tanggal_mulai: { gte: startDate, lt: endDate } },
        { tanggal_selesai: { gte: startDate, lt: endDate } },
      ],
    },
    select: {
      id: true,
      nama_event: true,
      slug: true,
      tanggal_mulai: true,
      tanggal_selesai: true,
    },
  });
  
  // Get custom calendar events
  const customEvents = await prisma.calendarEvent.findMany({
    where: {
      is_active: true,
      OR: [
        { start_date: { gte: startDate, lt: endDate } },
        { end_date: { gte: startDate, lt: endDate } },
      ],
    },
  });
  
  // Transform to unified calendar events format
  const events = [
    // Lomba events
    ...lombaEvents.flatMap(l => {
      const result = [];
      if (l.deadline) {
        result.push({
          id: `lomba-deadline-${l.id}`,
          title: `📅 Deadline: ${l.nama_lomba}`,
          type: 'deadline',
          color: '#EF4444', // Red for deadlines
          startDate: l.deadline,
          link: `/lomba/${l.slug}`,
          kategori: l.kategori,
          isUrgent: l.is_urgent,
        });
      }
      if (l.tanggal_pelaksanaan) {
        result.push({
          id: `lomba-event-${l.id}`,
          title: `🏆 ${l.nama_lomba}`,
          type: 'lomba',
          color: '#8B5CF6', // Purple for lomba
          startDate: l.tanggal_pelaksanaan,
          link: `/lomba/${l.slug}`,
        });
      }
      return result;
    }),
    
    // Expo events
    ...expoEvents.map(e => ({
      id: `expo-${e.id}`,
      title: `🎪 ${e.nama_event}`,
      type: 'expo',
      color: '#10B981', // Green for expo
      startDate: e.tanggal_mulai,
      endDate: e.tanggal_selesai,
      link: `/expo/${e.slug}`,
    })),
    
    // Custom events
    ...customEvents.map(e => ({
      id: `event-${e.id}`,
      title: e.title,
      description: e.description,
      type: e.type,
      color: e.color,
      startDate: e.start_date,
      endDate: e.end_date,
      allDay: e.all_day,
      link: e.link,
    })),
  ];
  
  return NextResponse.json({ success: true, data: events });
}
```

---

## 12. FILE UPLOAD - BACKUP STRATEGY
      endDate: e.tanggal_selesai,
      link: `/expo/${e.slug}`,
    })),
  ];
  
  return NextResponse.json({ success: true, data: events });
}
```

---

## 12. FILE UPLOAD - BACKUP STRATEGY

Karena pakai local storage (ke VPS), penting untuk punya strategi backup yang baik:

### 12.1 Struktur Folder Upload

```
public/
└── uploads/
    ├── sertifikat/        # PDF sertifikat prestasi (max 5MB)
    │   └── 2026-01/
    │       └── uuid.pdf
    ├── dokumentasi/       # Foto dokumentasi (max 2MB per file)
    │   └── 2026-01/
    │       └── uuid.jpg
    ├── surat/             # Surat pendukung (max 3MB)
    │   └── 2026-01/
    │       └── uuid.pdf
    ├── poster/            # Poster lomba/expo
    │   └── 2026-01/
    │       └── uuid.jpg
    └── form-files/        # File dari custom form
        └── 2026-01/
            └── uuid.pdf
```

### 12.2 Backup Script (untuk VPS)

```bash
#!/bin/bash
# backup-uploads.sh - Jalankan via cron setiap hari

BACKUP_DIR="/var/backups/apm-portal"
SOURCE_DIR="/var/www/apm-portal/public/uploads"
DATE=$(date +%Y-%m-%d)

# Create backup with date
tar -czvf "$BACKUP_DIR/uploads-$DATE.tar.gz" "$SOURCE_DIR"

# Keep only last 30 days
find "$BACKUP_DIR" -name "uploads-*.tar.gz" -mtime +30 -delete

echo "Backup completed: uploads-$DATE.tar.gz"
```

### 12.3 Validasi & Limit per Tipe

```typescript
// lib/upload-config.ts
export const UPLOAD_CONFIG = {
  sertifikat: {
    maxSize: 5 * 1024 * 1024,  // 5MB
    allowedTypes: ['application/pdf'],
    folder: 'sertifikat',
  },
  dokumentasi: {
    maxSize: 2 * 1024 * 1024,  // 2MB per file
    maxFiles: 6,               // Maksimal 6 gambar
    minFiles: 1,               // Minimal 1 gambar
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    folder: 'dokumentasi',
  },
  surat: {
    maxSize: 3 * 1024 * 1024,  // 3MB
    allowedTypes: ['application/pdf'],
    folder: 'surat',
  },
  poster: {
    maxSize: 5 * 1024 * 1024,  // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    folder: 'poster',
  },
};
```

---

## 13. TIMELINE IMPLEMENTASI (UPDATED)

Dengan Full Form Builder, timeline lebih panjang:

### Phase 1: Foundation (Hari 1-2)
- [ ] Install Prisma & dependencies
- [ ] Setup full database schema (termasuk CalendarEvent)
- [ ] Run migrations
- [ ] Create Prisma client singleton
- [ ] Setup validation schemas (Zod) dengan WhatsApp
- [ ] Implement rate limiting

### Phase 2: Authentication (Hari 2-3)
- [ ] Create Admin table & seed initial admin
- [ ] Implement Custom JWT session (7 hari)
- [ ] Update middleware for new auth
- [ ] Update admin login/logout flow

### Phase 3: Custom Form Builder (Hari 3-5) ⭐
- [ ] Create FormFieldDefinition types
- [ ] Build admin Form Builder UI (drag & drop)
- [ ] Implement conditional logic engine
- [ ] Build DynamicForm renderer component
- [ ] Dynamic Zod validation generator
- [ ] Test semua field types

### Phase 4: Lomba Feature (Hari 5-7)
- [ ] Create Lomba API routes (CRUD)
- [ ] Integrate Form Builder ke Lomba
- [ ] Create LombaRegistration API (dengan WhatsApp)
- [ ] Update admin Lomba pages
- [ ] Update public Lomba pages (3 mode daftar)
- [ ] Handle internal vs external registration

### Phase 5: Expo Feature (Hari 7-8)
- [ ] Create ExpoSettings table & API (pesan customizable)
- [ ] Create Expo API routes (CRUD)
- [ ] Integrate Form Builder ke Expo
- [ ] Create ExpoRegistration API
- [ ] Update admin/public Expo pages

### Phase 6: Prestasi Feature (Hari 8-10)
- [ ] Create Prestasi submission API
- [ ] Handle surat dengan label bebas
- [ ] Validasi WhatsApp tim & pembimbing
- [ ] Create verification workflow
- [ ] Create publish/edit flow (sertifikat visibility toggle)
- [ ] Update admin/public Prestasi pages

### Phase 7: File Upload & Calendar (Hari 10-11)
- [ ] Implement file upload API dengan validasi per tipe
- [ ] Integrate dengan forms
- [ ] Create CalendarEvent CRUD
- [ ] Update calendar API (Lomba + Expo + Custom)
- [ ] Admin page untuk manage custom events

### Phase 8: Testing & Polish (Hari 11-12)
- [ ] End-to-end testing
- [ ] Bug fixes
- [ ] UI polish
- [ ] Documentation

**Total: ~12 hari kerja** (lebih lama karena Full Form Builder)

---

## ✅ SEMUA KEPUTUSAN SUDAH FINAL

Berdasarkan jawaban Anda, berikut ringkasan keputusan:

| Aspek | Keputusan |
|-------|-----------|
| Surat Pendukung | **Label bebas** - mahasiswa isi sendiri |
| Login Pendaftaran | **Tidak perlu** - NIM, Email, WhatsApp saja |
| WhatsApp | **Wajib** untuk pendaftar, submitter, min 1 anggota tim, pembimbing |
| Form Builder | **Full** - drag-drop, validasi, conditional logic |
| Mode Daftar | **3 mode** - internal, eksternal+link, info-only |
| Expo Message | **Customizable** oleh admin |
| Kalender | **Lomba + Expo + Custom Events** |
| File Storage | **Local** - dengan backup strategy |
| Email | **Tidak perlu** - dikasih tau manual |
| Data Lama | **Fresh start** - tidak ada migrasi |
| Sertifikat | **Configurable** - bisa publik atau private per prestasi |
| Verifikasi Pendaftaran | **Langsung masuk** tanpa approval |
| Upload Limits | Sertifikat 5MB, Surat 3MB, Foto 2MB/file (1-6 foto) |

---

**🚀 SIAP EKSEKUSI!**

Kalau sudah tidak ada pertanyaan lagi, saya akan mulai Phase 1: Install Prisma dan setup database schema.
