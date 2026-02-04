# APM Portal - Blueprint & Development Plan

> **Dokumen ini adalah panduan lengkap pengembangan APM Portal**
> 
> Dibuat: 26 Januari 2026
> Status: PLANNING → READY FOR EXECUTION

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Arsitektur Sistem](#arsitektur-sistem)
3. [Database Schema](#database-schema)
4. [Route Structure](#route-structure)
5. [Fitur Detail](#fitur-detail)
6. [UI/UX Guidelines](#uiux-guidelines)
7. [Development Phases](#development-phases)
8. [Todo List](#todo-list)

---

## Overview

### Tentang APM Portal

APM Portal adalah website untuk Politeknik Negeri Malang (Polinema) yang berfungsi sebagai:
- **Pusat informasi lomba** - Menginformasikan lomba yang relevan untuk mahasiswa
- **Galeri prestasi** - Showcase pencapaian mahasiswa prodi
- **Informasi expo** - Event pameran karya mahasiswa (PBL, dll)
- **Resource center** - Materi dan dokumen pendukung

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| CMS/Backend | Custom Next.js API |
| Database | PostgreSQL 15 |
| Container | Docker |
| Auth | JWT Authentication |

### User Roles

| Role | Akses |
|------|-------|
| **Publik** | View semua halaman, submit prestasi, daftar expo |
| **Pengurus** | Dashboard admin, CRUD lomba/expo, verifikasi prestasi |

---

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ARSITEKTUR APM PORTAL                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │                 │    │                 │    │                 │         │
│  │  DIRECTUS CMS   │    │  NEXT.JS APP    │    │  NEXT.JS APP    │         │
│  │  (Port 8055)    │    │  PUBLIC PAGES   │    │  ADMIN PAGES    │         │
│  │                 │    │  (Port 3000)    │    │  (/admin/*)     │         │
│  │  Untuk:         │    │                 │    │                 │         │
│  │  - Resources    │    │  Untuk:         │    │  Untuk:         │         │
│  │  - About        │    │  - Lomba list   │    │  - Dashboard    │         │
│  │  - FAQ          │    │  - Prestasi     │    │  - CRUD Lomba   │         │
│  │  - Tim          │    │  - Expo         │    │  - CRUD Expo    │         │
│  │                 │    │  - Forms        │    │  - Verifikasi   │         │
│  │                 │    │                 │    │                 │         │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘         │
│           │                      │                      │                   │
│           │    ┌─────────────────┴──────────────────────┘                   │
│           │    │                                                            │
│           ▼    ▼                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         DIRECTUS REST API                           │   │
│  │                        (Authentication + CRUD)                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                           POSTGRESQL                                │   │
│  │                         (Port 5432)                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Existing Collections (Sudah Ada)

#### `apm_lomba`
| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary key |
| nama_lomba | string | Nama lomba |
| slug | string | URL slug |
| deskripsi | text | Deskripsi (rich text) |
| penyelenggara | string | Nama penyelenggara |
| kategori | string | Teknologi/Bisnis/Desain/Akademik |
| tingkat | string | Nasional/Internasional/Regional |
| deadline | datetime | Batas pendaftaran |
| tanggal_pelaksanaan | date | Tanggal lomba |
| lokasi | string | Lokasi/Online |
| biaya | int | Biaya pendaftaran (0 = gratis) |
| link_pendaftaran | string | URL pendaftaran |
| poster | file | Poster lomba |
| tags | json | Array tags |
| status | enum | open/closed/coming-soon |
| is_featured | boolean | Tampil di homepage |
| is_urgent | boolean | Deadline dekat |
| date_created | timestamp | - |
| date_updated | timestamp | - |
| user_created | uuid | - |
| user_updated | uuid | - |

#### `apm_expo`
| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary key |
| nama_event | string | Nama expo |
| slug | string | URL slug |
| tema | string | Tema expo |
| tanggal_mulai | date | - |
| tanggal_selesai | date | - |
| lokasi | string | - |
| alamat_lengkap | string | - |
| google_maps_embed | text | Embed code |
| deskripsi | text | Rich text |
| highlights | json | Array of highlights |
| rundown | json | Array of rundown |
| biaya_partisipasi | int | - |
| benefit | text | - |
| website_resmi | string | - |
| poster | file | - |
| is_featured | boolean | - |
| status | enum | upcoming/ongoing/completed |
| **registration_open** | boolean | **NEW** - Buka pendaftaran |
| **registration_deadline** | datetime | **NEW** - Batas daftar |
| **max_participants** | int | **NEW** - Kuota peserta |
| date_created | timestamp | - |

#### `apm_prestasi` (UPDATE)
| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary key |
| nama_prestasi | string | Judul prestasi |
| slug | string | URL slug |
| kompetisi | string | Nama kompetisi |
| penyelenggara | string | - |
| tingkat | enum | Nasional/Internasional/Regional |
| peringkat | string | Juara 1, Finalist, dll |
| tanggal | date | Tanggal pencapaian |
| kategori | string | - |
| deskripsi | text | - |
| foto | file | Foto utama |
| sertifikat | file | **NEW** - Upload sertifikat |
| dokumentasi | json | Array file IDs |
| is_featured | boolean | - |
| **status** | enum | **NEW** - pending/verified/rejected |
| **reviewer_notes** | text | **NEW** - Catatan reviewer |
| **verified_at** | timestamp | **NEW** |
| **verified_by** | uuid | **NEW** - User ID |
| **submitter_name** | string | **NEW** - Nama pengirim |
| **submitter_nim** | string | **NEW** - NIM pengirim |
| **submitter_email** | string | **NEW** - Email pengirim |
| date_created | timestamp | - |

#### `apm_prestasi_tim`
| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary key |
| prestasi_id | int | FK ke apm_prestasi |
| nama | string | Nama anggota |
| nim | string | NIM |
| role | enum | ketua/anggota |
| angkatan | string | Tahun angkatan |
| foto | file | Foto anggota |

#### `apm_resources` (Existing)
| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary key |
| judul | string | - |
| slug | string | - |
| kategori | string | - |
| deskripsi | text | - |
| file | file | - |
| thumbnail | file | - |
| is_featured | boolean | - |
| date_created | timestamp | - |

#### `apm_about`, `apm_faq`, `apm_tim` (Existing - No Changes)

### New Collection

#### `apm_expo_registrations` (NEW)
| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary key |
| expo_id | int | FK ke apm_expo |
| nama_project | string | Judul karya/project |
| deskripsi_project | text | Deskripsi singkat |
| link_demo | string | Link demo/video (optional) |
| ketua_nama | string | Nama ketua tim |
| ketua_nim | string | NIM ketua |
| ketua_email | string | Email ketua |
| ketua_phone | string | No. telepon ketua |
| anggota_1_nama | string | Nama anggota 1 |
| anggota_1_nim | string | NIM anggota 1 |
| anggota_2_nama | string | Nama anggota 2 (optional) |
| anggota_2_nim | string | NIM anggota 2 |
| anggota_3_nama | string | Nama anggota 3 (optional) |
| anggota_3_nim | string | NIM anggota 3 |
| status | enum | pending/approved/rejected |
| reviewer_notes | text | Catatan jika ditolak |
| date_created | timestamp | - |

---

## Route Structure

### Public Routes

```
/                           → Homepage
│
├── /lomba                  → List semua lomba
│   └── /[slug]             → Detail lomba
│
├── /prestasi               → Gallery prestasi (verified only)
│   ├── /submit             → Form submit prestasi ⭐
│   └── /[slug]             → Detail prestasi
│
├── /expo                   → List expo events
│   └── /[slug]             → Detail expo
│       └── /daftar         → Form daftar expo ⭐ (jika registration_open)
│
├── /resources              → List resources
│   └── /[slug]             → Detail & download
│
├── /about                  → Tentang APM
├── /faq                    → FAQ
├── /tim                    → Pengurus APM
├── /kalender               → Kalender event
└── /search                 → Global search
```

### Admin Routes

```
/admin
│
├── /login                  → Login page (Directus auth)
│
├── /dashboard              → Overview & statistik
│   ├── Lomba aktif count
│   ├── Prestasi pending count
│   ├── Expo upcoming count
│   ├── Registrasi baru count
│   └── Recent activities
│
├── /lomba                  → CRUD Lomba
│   ├── /                   → List semua lomba (table)
│   ├── /create             → Form create lomba
│   └── /[id]/edit          → Form edit lomba
│
├── /expo                   → CRUD Expo
│   ├── /                   → List semua expo (table)
│   ├── /create             → Form create expo
│   └── /[id]/edit          → Form edit expo
│
├── /prestasi               → Verifikasi Prestasi
│   ├── /                   → List semua submission
│   ├── ?status=pending     → Filter pending
│   └── /[id]               → Detail & approve/reject
│
├── /expo-registrations     → Verifikasi Pendaftaran Expo
│   ├── /                   → List per expo
│   └── /[id]               → Detail & approve/reject
│
└── /settings               → Pengaturan akun admin
```

---

## Fitur Detail

### 1. Public - Submit Prestasi

**Route**: `/prestasi/submit`

**Flow**:
1. User mengisi form:
   - Nama prestasi
   - Kompetisi/event
   - Penyelenggara
   - Tingkat (dropdown)
   - Peringkat
   - Tanggal
   - Deskripsi
   - Upload sertifikat (wajib)
   - Upload foto dokumentasi (optional)
   - Data tim (ketua + max 5 anggota)
   - Data submitter (nama, NIM, email)
2. Submit → data masuk dengan status `pending`
3. Tampil pesan sukses + info akan diverifikasi

**Validasi**:
- Sertifikat wajib (PDF/JPG/PNG, max 5MB)
- Email format valid
- NIM format valid (angka)
- Minimal 1 anggota tim (ketua)

### 2. Public - Daftar Expo

**Route**: `/expo/[slug]/daftar`

**Kondisi tampil**: Hanya jika `registration_open = true` dan belum lewat `registration_deadline`

**Flow**:
1. User mengisi form:
   - Nama project
   - Deskripsi singkat
   - Link demo (optional)
   - Data ketua (nama, NIM, email, phone)
   - Data anggota (max 3 orang, minimal kosong)
2. Submit → data masuk dengan status `pending`
3. Tampil pesan sukses

**Validasi**:
- Semua field ketua wajib
- Max 3 anggota tambahan
- Cek duplikasi NIM (tidak boleh daftar 2x)

### 3. Admin - Dashboard

**Widgets**:
```
┌─────────────────────────────────────────────────────────────────────┐
│                           DASHBOARD                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │   LOMBA     │  │  PRESTASI   │  │    EXPO     │  │ REGISTRASI  ││
│  │   AKTIF     │  │   PENDING   │  │   UPCOMING  │  │    BARU     ││
│  │             │  │             │  │             │  │             ││
│  │     12      │  │      5      │  │      2      │  │     18      ││
│  │             │  │  ⚠️ Review  │  │             │  │  ⚠️ Review  ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                     RECENT ACTIVITIES                           ││
│  │  • Prestasi baru dari Ahmad (5 menit lalu)                      ││
│  │  • Registrasi expo dari Tim ABC (1 jam lalu)                    ││
│  │  • Lomba Hackathon ditutup (2 jam lalu)                         ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌──────────────────────────┐  ┌──────────────────────────────────┐│
│  │    QUICK ACTIONS         │  │       LOMBA DEADLINE SOON        ││
│  │                          │  │                                  ││
│  │  [+ Tambah Lomba]        │  │  • Hackathon ITB - 3 hari lagi   ││
│  │  [+ Tambah Expo]         │  │  • UI/UX Challenge - 7 hari lagi ││
│  │  [Review Prestasi (5)]   │  │                                  ││
│  └──────────────────────────┘  └──────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4. Admin - CRUD Lomba

**List View**:
- Table dengan kolom: Nama, Kategori, Tingkat, Deadline, Status, Actions
- Filter: Status, Kategori
- Sort: Deadline, Date created
- Actions: Edit, Delete, Toggle Featured

**Create/Edit Form**:
```
┌─────────────────────────────────────────────────────────────────────┐
│  TAMBAH LOMBA BARU                                         [Simpan] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Informasi Dasar                                                    │
│  ├── Nama Lomba *           [________________________]              │
│  ├── Penyelenggara *        [________________________]              │
│  ├── Kategori *             [Pilih kategori ▼]                      │
│  └── Tingkat *              [Pilih tingkat ▼]                       │
│                                                                     │
│  Waktu & Lokasi                                                     │
│  ├── Deadline Pendaftaran * [📅 Pilih tanggal]                      │
│  ├── Tanggal Pelaksanaan    [📅 Pilih tanggal]                      │
│  └── Lokasi                 [________________________]              │
│                                                                     │
│  Detail                                                             │
│  ├── Deskripsi *            ┌────────────────────────┐              │
│  │                          │ Rich Text Editor       │              │
│  │                          │ B I U | • | Link       │              │
│  │                          │                        │              │
│  │                          └────────────────────────┘              │
│  ├── Biaya Pendaftaran      [Rp 0] (0 = Gratis)                     │
│  └── Link Pendaftaran       [________________________]              │
│                                                                     │
│  Media                                                              │
│  └── Poster                 [📁 Upload file] atau drag & drop       │
│                                                                     │
│  Pengaturan                                                         │
│  ├── Status                 ○ Open  ○ Coming Soon  ○ Closed         │
│  ├── [✓] Tampilkan di Homepage (Featured)                          │
│  └── [✓] Tandai sebagai Urgent                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5. Admin - CRUD Expo

Mirip dengan CRUD Lomba, dengan tambahan:
- Toggle `registration_open`
- Field `registration_deadline`
- Field `max_participants`
- View registrations count

### 6. Admin - Verifikasi Prestasi

**List View**:
- Filter tabs: Semua | Pending | Verified | Rejected
- Table: Nama Prestasi, Submitter, Tanggal Submit, Status, Actions
- Badge count untuk pending

**Detail View**:
```
┌─────────────────────────────────────────────────────────────────────┐
│  REVIEW PRESTASI                                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────┐  ┌──────────────────────────────────┐│
│  │                          │  │  INFORMASI SUBMITTER             ││
│  │    [Foto Sertifikat]     │  │  Nama: Ahmad Rizki               ││
│  │                          │  │  NIM: 1234567890                 ││
│  │    [📥 Download]         │  │  Email: ahmad@student.ac.id      ││
│  │                          │  │  Submitted: 26 Jan 2026, 10:30   ││
│  └──────────────────────────┘  └──────────────────────────────────┘│
│                                                                     │
│  DETAIL PRESTASI                                                    │
│  ├── Nama: Juara 1 Hackathon Nasional                              │
│  ├── Kompetisi: Hackathon Indonesia 2026                           │
│  ├── Penyelenggara: Kemenkominfo                                   │
│  ├── Tingkat: Nasional                                             │
│  ├── Peringkat: Juara 1                                            │
│  └── Tanggal: 20 Januari 2026                                      │
│                                                                     │
│  TIM                                                                │
│  ├── 1. Ahmad Rizki (Ketua) - 1234567890                           │
│  ├── 2. Budi Santoso - 1234567891                                  │
│  └── 3. Citra Dewi - 1234567892                                    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  Catatan (opsional jika reject)                                 ││
│  │  [____________________________________________]                  ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  [❌ Reject]                                      [✅ Approve]      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 7. Admin - Verifikasi Expo Registration

Mirip dengan verifikasi prestasi, menampilkan:
- Info project
- Data ketua + anggota
- Approve/Reject dengan catatan

---

## UI/UX Guidelines

### Admin Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  [APM Logo]  Admin Portal                      🔔  👤 Admin Name ▼  │
├─────────────┬───────────────────────────────────────────────────────┤
│             │                                                       │
│  📊 Dashboard│                                                       │
│             │              MAIN CONTENT AREA                        │
│  📋 Lomba    │                                                       │
│  └ List     │                                                       │
│  └ Tambah   │                                                       │
│             │                                                       │
│  🎪 Expo     │                                                       │
│  └ List     │                                                       │
│  └ Tambah   │                                                       │
│             │                                                       │
│  🏆 Prestasi │                                                       │
│  └ Pending 5│                                                       │
│             │                                                       │
│  📝 Expo Reg │                                                       │
│             │                                                       │
│  ⚙️ Settings │                                                       │
│             │                                                       │
├─────────────┴───────────────────────────────────────────────────────┤
│  © 2026 APM Polinema                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Color Scheme (Admin)

| Element | Color |
|---------|-------|
| Primary | `#2563eb` (Blue) |
| Success | `#16a34a` (Green) |
| Warning | `#f59e0b` (Amber) |
| Danger | `#dc2626` (Red) |
| Sidebar BG | `#1e293b` (Slate 800) |
| Content BG | `#f8fafc` (Slate 50) |

### Status Badge Colors

| Status | Color |
|--------|-------|
| pending | Yellow/Amber |
| verified/approved | Green |
| rejected | Red |
| open | Green |
| closed | Gray |
| coming-soon | Blue |

---

## Development Phases

### Phase 1: Database Schema Update ⏱️ 1 hour
- [ ] Update `apm_prestasi` dengan field baru
- [ ] Update `apm_expo` dengan field registrasi
- [ ] Create `apm_expo_registrations` collection
- [ ] Setup permissions di Directus

### Phase 2: Public Forms ⏱️ 2-3 hours
- [ ] Create `/prestasi/submit` page & form
- [ ] Create `/expo/[slug]/daftar` page & form
- [ ] API routes untuk submit
- [ ] Form validation
- [ ] Success/error handling

### Phase 3: Admin Layout & Auth ⏱️ 2 hours
- [ ] Create admin layout (sidebar, header)
- [ ] Login page dengan Directus auth
- [ ] Protected routes middleware
- [ ] Session management

### Phase 4: Admin Dashboard ⏱️ 2 hours
- [ ] Dashboard page dengan statistik
- [ ] Stat cards (counts)
- [ ] Recent activities
- [ ] Quick actions

### Phase 5: Admin CRUD Lomba ⏱️ 3 hours
- [ ] List page dengan DataTable
- [ ] Create form dengan rich text editor
- [ ] Edit form
- [ ] Delete confirmation
- [ ] Toggle featured/urgent

### Phase 6: Admin CRUD Expo ⏱️ 2 hours
- [ ] List page
- [ ] Create/Edit form
- [ ] Registration toggle

### Phase 7: Admin Verifikasi ⏱️ 2-3 hours
- [ ] Prestasi list dengan filter status
- [ ] Prestasi detail & review
- [ ] Approve/Reject actions
- [ ] Expo registration list & review

### Phase 8: Testing & Polish ⏱️ 2 hours
- [ ] Test all flows
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive check

**Total Estimated Time: 16-18 hours**

---

## Todo List

### 🔴 Priority 1: Database & API

- [ ] 1.1 Update Directus schema untuk `apm_prestasi`
  - Tambah: status, reviewer_notes, verified_at, verified_by
  - Tambah: submitter_name, submitter_nim, submitter_email
  - Tambah: sertifikat (file field)

- [ ] 1.2 Update Directus schema untuk `apm_expo`
  - Tambah: registration_open, registration_deadline, max_participants

- [ ] 1.3 Create collection `apm_expo_registrations`
  - Semua field sesuai schema di atas

- [ ] 1.4 Setup Directus permissions
  - Public: read lomba, expo, prestasi (verified), resources
  - Public: create prestasi, expo_registrations
  - Admin role: full CRUD semua collection

- [ ] 1.5 Create API routes
  - POST `/api/prestasi/submit`
  - POST `/api/expo/[id]/register`
  - GET/PATCH `/api/admin/prestasi`
  - GET/PATCH `/api/admin/expo-registrations`

### 🟡 Priority 2: Public Forms

- [ ] 2.1 Create `/prestasi/submit/page.tsx`
  - Form component dengan semua field
  - File upload untuk sertifikat
  - Dynamic tim member fields
  - Client-side validation
  - Submit handler

- [ ] 2.2 Create `/expo/[slug]/daftar/page.tsx`
  - Cek registration_open sebelum render
  - Form component
  - Dynamic anggota fields (max 3)
  - Submit handler

- [ ] 2.3 Create form components
  - `components/forms/FileUpload.tsx`
  - `components/forms/TeamMemberInput.tsx`
  - `components/forms/FormField.tsx`

### 🟢 Priority 3: Admin System

- [ ] 3.1 Admin Layout
  - `app/admin/layout.tsx`
  - `components/admin/Sidebar.tsx`
  - `components/admin/Header.tsx`
  - `components/admin/AdminProvider.tsx` (auth context)

- [ ] 3.2 Login & Auth
  - `app/admin/login/page.tsx`
  - `lib/admin-auth.ts` (Directus auth functions)
  - `middleware.ts` (protect /admin routes)

- [ ] 3.3 Dashboard
  - `app/admin/dashboard/page.tsx`
  - `components/admin/StatCard.tsx`
  - `components/admin/RecentActivity.tsx`

- [ ] 3.4 CRUD Components
  - `components/admin/DataTable.tsx`
  - `components/admin/RichTextEditor.tsx`
  - `components/admin/ConfirmDialog.tsx`
  - `components/admin/StatusBadge.tsx`

- [ ] 3.5 Lomba Pages
  - `app/admin/lomba/page.tsx` (list)
  - `app/admin/lomba/create/page.tsx`
  - `app/admin/lomba/[id]/edit/page.tsx`
  - `components/admin/LombaForm.tsx`

- [ ] 3.6 Expo Pages
  - `app/admin/expo/page.tsx` (list)
  - `app/admin/expo/create/page.tsx`
  - `app/admin/expo/[id]/edit/page.tsx`
  - `components/admin/ExpoForm.tsx`

- [ ] 3.7 Verifikasi Prestasi
  - `app/admin/prestasi/page.tsx` (list)
  - `app/admin/prestasi/[id]/page.tsx` (detail/review)
  - `components/admin/PrestasiReview.tsx`

- [ ] 3.8 Verifikasi Expo Registration
  - `app/admin/expo-registrations/page.tsx`
  - `app/admin/expo-registrations/[id]/page.tsx`

### 🔵 Priority 4: Polish

- [ ] 4.1 Loading states untuk semua async operations
- [ ] 4.2 Error boundaries dan error pages
- [ ] 4.3 Toast notifications untuk actions
- [ ] 4.4 Responsive design check
- [ ] 4.5 Form validation messages
- [ ] 4.6 Empty states untuk tables

---

## Files to Create (Summary)

```
app/
├── admin/
│   ├── layout.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── lomba/
│   │   ├── page.tsx
│   │   ├── create/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx
│   ├── expo/
│   │   ├── page.tsx
│   │   ├── create/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx
│   ├── prestasi/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── expo-registrations/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── settings/
│       └── page.tsx
├── prestasi/
│   └── submit/
│       └── page.tsx
├── expo/
│   └── [slug]/
│       └── daftar/
│           └── page.tsx
└── api/
    ├── admin/
    │   ├── auth/
    │   │   └── route.ts
    │   ├── lomba/
    │   │   └── route.ts
    │   ├── expo/
    │   │   └── route.ts
    │   ├── prestasi/
    │   │   └── route.ts
    │   └── expo-registrations/
    │       └── route.ts
    ├── prestasi/
    │   └── submit/
    │       └── route.ts
    └── expo/
        └── [id]/
            └── register/
                └── route.ts

components/
├── admin/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── AdminProvider.tsx
│   ├── DataTable.tsx
│   ├── StatCard.tsx
│   ├── RecentActivity.tsx
│   ├── RichTextEditor.tsx
│   ├── ConfirmDialog.tsx
│   ├── StatusBadge.tsx
│   ├── LombaForm.tsx
│   ├── ExpoForm.tsx
│   └── PrestasiReview.tsx
└── forms/
    ├── FileUpload.tsx
    ├── TeamMemberInput.tsx
    └── FormField.tsx

lib/
└── admin-auth.ts

middleware.ts (update)
```

---

## Ready for Execution ✅

Blueprint ini sudah mencakup:
- ✅ Database schema lengkap
- ✅ Route structure detail
- ✅ Fitur spesifikasi
- ✅ UI mockups
- ✅ Development phases
- ✅ Todo list terstruktur
- ✅ File structure

**Pertanyaan terakhir sebelum eksekusi:**

1. Rich text editor: Sederhana (bold, italic, list) atau lengkap?
2. Delete: Hard delete atau soft delete?
3. Ada tambahan fitur lain?

---

*Document version: 1.0*
*Last updated: 26 Januari 2026*
