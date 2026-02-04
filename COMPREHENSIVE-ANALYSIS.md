# 📊 COMPREHENSIVE ANALYSIS - APM PORTAL

**Tanggal Analisis:** 4 Februari 2026  
**Versi:** 1.0.0  
**Scope:** Full Stack Analysis (Frontend, Backend, Database, Flow)

---

## 🏗️ ARCHITECTURE OVERVIEW

### **Tech Stack:**
- **Frontend:** Next.js 14.2 (App Router) + React 18.2 + TypeScript 5.5
- **Backend:** Next.js API Routes
- **Database:** Neon PostgreSQL 17 (Cloud)
- **ORM:** Prisma 7.3.0
- **Styling:** Tailwind CSS 3.4
- **Icons:** Lucide React

### **Project Identity:**
- **Nama:** APM Portal (Ajang Prestasi Mahasiswa)
- **Institusi:** Jurusan Teknik Elektro - Prodi Telekomunikasi
- **Target User:** 
  - Mahasiswa D3 Teknik Telekomunikasi
  - Mahasiswa D4 Jaringan Telekomunikasi Digital
  - Admin/Pengurus APM

---

## 📦 DATABASE SCHEMA (12 Tables)

### **1. Admin & Auth**
```
apm_admins
├── id, email, password_hash, name, role
├── is_active, last_login
└── created_at, updated_at
```

### **2. Lomba (Kompetisi)**
```
apm_lomba
├── id, nama_lomba, slug, deskripsi
├── kategori, tingkat (regional/nasional/internasional)
├── deadline, tanggal_pelaksanaan
├── penyelenggara, lokasi
├── sumber (internal/eksternal)
├── tipe_pendaftaran (internal/eksternal/none)
├── link_pendaftaran, custom_form (JSON)
├── syarat_ketentuan, hadiah (JSON), biaya
├── kontak_panitia (JSON), poster, tags (JSON)
├── is_featured, is_urgent, status
└── is_deleted, created_at, updated_at

apm_lomba_registrations (LANGSUNG REGISTERED, NO APPROVAL)
├── id, lomba_id, nama, nim, email, whatsapp
├── fakultas, prodi, custom_data (JSON)
├── status = 'registered' (auto)
└── created_at, updated_at
```

**PENTING:** 
- Lomba bisa **internal** (form di portal) atau **eksternal** (link keluar)
- Registrasi lomba **LANGSUNG MASUK** tanpa verifikasi admin
- Tipe pendaftaran: `internal` (form APM), `eksternal` (link luar), `none` (info only)

### **3. Expo (Pameran Karya)**
```
apm_expo_settings (Global Settings)
├── id = 1, is_active, inactive_message
├── next_expo_date
└── updated_at

apm_expo
├── id, nama_event, slug, tema, deskripsi
├── tanggal_mulai, tanggal_selesai
├── lokasi, alamat_lengkap
├── tipe_pendaftaran, link_pendaftaran, custom_form (JSON)
├── registration_open, registration_deadline
├── max_participants, biaya_partisipasi
├── highlights (JSON), rundown (JSON), galeri (JSON)
├── benefit, website_resmi, poster
├── is_featured, status (upcoming/ongoing/completed)
└── is_deleted, created_at, updated_at

apm_expo_registrations (LANGSUNG REGISTERED, NO APPROVAL)
├── id, expo_id, nama, nim, email, whatsapp
├── project_name, project_desc, custom_data (JSON)
├── status = 'registered' (auto)
└── created_at, updated_at
```

**PENTING:**
- Expo bisa `active` atau `inactive` (controlled by settings)
- Registrasi expo **LANGSUNG MASUK** tanpa verifikasi admin

### **4. Prestasi (Submit Achievement)**
```
apm_prestasi_submissions (User Submit Form)
├── id, judul, nama_lomba, penyelenggara
├── tingkat, peringkat, tanggal, kategori, deskripsi
├── submitter_name, submitter_nim, submitter_email, submitter_whatsapp
├── pembimbing_nama, pembimbing_nidn, pembimbing_whatsapp
├── sertifikat_url, foto_urls (JSON), surat_urls (JSON)
├── status (pending/approved/rejected) ← NEEDS VERIFICATION
├── reviewer_notes, verified_at
└── created_at, updated_at

apm_prestasi_team_members
├── id, submission_id, nama, nim, prodi

apm_prestasi_pembimbing
├── id, submission_id, nama, nidn, whatsapp

apm_prestasi_documents
├── id, submission_id, file_url, label, type

apm_prestasi (Published Prestasi - AFTER VERIFICATION)
├── id, submission_id, judul, nama_lomba
├── penyelenggara, tingkat, peringkat
├── tanggal, kategori, deskripsi
├── thumbnail_url, galeri (JSON)
├── team_members (JSON), pembimbing (JSON)
├── is_published, published_at
└── created_at, updated_at
```

**PENTING:**
- Prestasi **HARUS MELALUI VERIFIKASI ADMIN**
- Flow: Submit (pending) → Admin Review → Approved → Published ke public galeri
- Admin bisa approve atau reject dengan notes

### **5. Calendar & Messages**
```
apm_calendar_events
├── id, title, type (lomba/expo/deadline/event)
├── start_date, end_date, time
├── lokasi, description, link, kategori
├── is_urgent
└── created_at, updated_at

(Note: Messages belum implement table, menggunakan API sementara)
```

---

## 🔄 USER FLOW MAPPING

### **FLOW 1: Browse & Daftar Lomba**
```
User → Browse /lomba 
     → Filter (kategori, tingkat, status)
     → Klik detail /lomba/[slug]
     → Lihat info lengkap (deadline, syarat, hadiah)
     ↓
     JIKA tipe_pendaftaran = 'eksternal':
     → Klik button "Daftar Sekarang" 
     → Redirect ke link_pendaftaran (external website)
     ↓
     JIKA tipe_pendaftaran = 'internal':
     → Klik button "Daftar via APM"
     → Isi form registrasi (nama, NIM, email, WA, fakultas, prodi)
     → Submit form
     → Status = 'registered' (LANGSUNG MASUK, NO APPROVAL)
     → Redirect ke /lomba dengan success message
     ↓
     JIKA tipe_pendaftaran = 'none':
     → Hanya info, no registration button
```

**KEY INSIGHT:** 
- APM berfungsi sebagai **katalog lomba** + **facilitator**
- Untuk lomba eksternal: APM hanya provide info, user daftar sendiri ke website lomba
- Untuk lomba internal: APM handle full registration process

### **FLOW 2: Submit Prestasi (NEEDS VERIFICATION)**
```
User → Menu Prestasi → Button "Laporkan Prestasi"
     → Redirect ke /prestasi/submit
     ↓
     WIZARD STEP 1: Informasi Prestasi
     → Judul karya, nama lomba, penyelenggara
     → Tingkat (regional/nasional/internasional)
     → Peringkat, tanggal lomba, kategori, deskripsi
     ↓
     WIZARD STEP 2: Tim & Pembimbing
     → Data submitter (nama, NIM, email, WA)
     → Add team members (nama, NIM, prodi) - dynamic form
     → Data dosen pembimbing (nama, NIDN, WA)
     ↓
     WIZARD STEP 3: Upload Dokumen
     → Sertifikat/piagam resmi (required)
     → Foto dokumentasi (required)
     → Surat tugas/keterangan (optional)
     → Dokumen pendukung lain (optional)
     ↓
     Submit → Create PrestasiSubmission (status = 'pending')
     → Success message: "Prestasi berhasil dilaporkan. Menunggu verifikasi admin."
     ↓
     ADMIN DASHBOARD (/admin/prestasi)
     → Admin lihat list pending submissions
     → Klik "Review" → Modal detail
     → Admin bisa:
        - Approve (publish ke public galeri)
        - Reject (with notes)
     ↓
     JIKA APPROVED:
     → Create record di apm_prestasi (is_published = true)
     → Status submission = 'approved'
     → Prestasi muncul di /prestasi (public galeri)
     → User dapat email notifikasi (jika implement)
     ↓
     JIKA REJECTED:
     → Status submission = 'rejected'
     → Reviewer notes disimpan
     → User dapat email notifikasi (jika implement)
```

**KEY INSIGHT:**
- Submit prestasi **TIDAK LANGSUNG PUBLISH**
- Harus melalui review admin untuk validasi dokumen
- Mencegah spam dan fake achievement

### **FLOW 3: Expo Registration**
```
User → Browse /expo
     → Filter (status, tanggal)
     → Klik detail /expo/[slug]
     → Lihat info lengkap (tema, rundown, benefit)
     ↓
     JIKA registration_open = true:
     → Klik button "Daftar Expo"
     → Isi form (nama, NIM, email, WA, project_name, project_desc)
     → Submit form
     → Status = 'registered' (LANGSUNG MASUK, NO APPROVAL)
     → Redirect ke /expo dengan success message
     ↓
     ADMIN DASHBOARD (/admin/registrasi)
     → Admin lihat list registrasi (expo + lomba)
     → Bisa filter by expo, status
     → No approval needed, only for monitoring
```

**KEY INSIGHT:**
- Expo registration juga **LANGSUNG MASUK**
- Admin hanya monitoring, tidak perlu approve
- Untuk koordinasi booth dan logistik event

### **FLOW 4: Admin Management**
```
Admin Login → /admin/login
          → Redirect ke /admin (dashboard)
          ↓
          DASHBOARD:
          - Stats: Total lomba, expo, prestasi, registrasi, messages
          - Recent prestasi
          - Pending verification count
          ↓
          MENU MANAGEMENT:
          
          1. /admin/lomba
             → CRUD lomba (create, edit, delete, restore)
             → Set featured, urgent, status
             → Upload poster
             → Configure form builder (internal registration)
          
          2. /admin/expo
             → CRUD expo (create, edit, delete, restore)
             → Set registration status (open/close)
             → Upload poster, galeri
             → Configure form builder
          
          3. /admin/prestasi
             → View all submissions (pending, approved, rejected)
             → Review modal (view detail, sertifikat, foto)
             → Approve/Reject with notes
             → Search & filter
          
          4. /admin/registrasi
             → View all registrations (lomba + expo)
             → Filter by event, status
             → Export data (future feature)
          
          5. /admin/messages
             → View contact form messages
             → Mark as read/unread
             → Delete messages
```

---

## 🎨 PUBLIC PAGES

### **1. Homepage (`/`)**
- Hero banner
- Featured lomba (4 cards)
- Recent prestasi (3 cards)
- Upcoming expo (3 cards)
- CTA sections
- Stats counter

### **2. Lomba & Kompetisi (`/lomba`)**
- Filter: kategori, tingkat, status
- Search bar
- Grid cards with status badge
- Detail page (`/lomba/[slug]`)
  - Info lengkap (deadline, lokasi, biaya, peserta)
  - Countdown timer
  - Syarat & ketentuan
  - Timeline lomba
  - Hadiah & prizes
  - Button daftar (internal/external)

### **3. Prestasi & Pencapaian (`/prestasi`)**
- Filter: tahun, tingkat, kategori
- Search bar
- Grid cards with verified badge
- Detail page (`/prestasi/[slug]`)
  - Info prestasi lengkap
  - Team members
  - Dosen pembimbing
  - Galeri foto
  - Sertifikat/dokumentasi
- Button "Laporkan Prestasi" → `/prestasi/submit`

### **4. Expo & Pameran (`/expo`)**
- Filter: status (upcoming/ongoing/completed)
- Grid cards with date info
- Detail page (`/expo/[slug]`)
  - Info expo (tema, rundown, benefit)
  - Timeline & lokasi
  - Highlights & galeri
  - Button "Daftar Expo" (if registration open)

### **5. Kalender (`/kalender`)**
- Calendar view + List view
- Filter by type (lomba/expo/deadline/event)
- Interactive calendar
- Event detail modal

### **6. Resources (`/resources`)**
- Cards: FAQ, Panduan, Tips, Download, Template
- `/resources/faq` - 12 FAQ questions
- `/resources/panduan` - Step-by-step guides (NEED FIX: currently only submit prestasi)
- `/resources/tips` - 12 tips strategi kompetisi
- `/resources/download` - Coming Soon
- `/resources/template` - Coming Soon

### **7. Tentang (`/tentang`)**
- Hero section (visi misi)
- Stats counter
- Team members
- Values/filosofi
- FAQ section
- Contact CTA
- Link to `/tentang/struktur` (organizational structure)

### **8. Kontak (`/kontak`)**
- Contact form (nama, email, phone, subjek, pesan)
- Contact info cards (email, phone, alamat, jam kerja)
- Map embed (future)

---

## 🔧 API ROUTES

### **Public APIs:**
```
GET  /api/lomba            - List lomba (filter, search, pagination)
GET  /api/lomba?slug=xxx   - Get lomba by slug
GET  /api/prestasi         - List prestasi (filter, search, pagination)
GET  /api/prestasi?slug=xxx - Get prestasi by slug
GET  /api/expo             - List expo (filter, search, pagination)
GET  /api/expo/settings    - Get expo global settings
GET  /api/expo?slug=xxx    - Get expo by slug
GET  /api/calendar         - Get calendar events
GET  /api/faq              - Get FAQ list
GET  /api/tips             - Get tips list
GET  /api/panduan          - Get panduan (type=pendaftaran|expo)
POST /api/kontak           - Submit contact form
```

### **Admin APIs:**
```
POST   /api/admin/login              - Admin login
GET    /api/admin/lomba              - List lomba (admin)
POST   /api/admin/lomba              - Create lomba
PATCH  /api/admin/lomba/[id]         - Update lomba
DELETE /api/admin/lomba/[id]         - Delete lomba (soft/permanent)

GET    /api/admin/expo               - List expo (admin)
POST   /api/admin/expo               - Create expo
PATCH  /api/admin/expo/[id]          - Update expo
DELETE /api/admin/expo/[id]          - Delete expo

GET    /api/admin/prestasi           - List prestasi submissions
GET    /api/admin/prestasi/[id]      - Get submission detail
PATCH  /api/admin/prestasi/[id]      - Approve/Reject submission

GET    /api/admin/registrasi         - List all registrations (lomba + expo)
GET    /api/admin/registrasi/[id]    - Get registration detail
```

---

## ⚠️ ISSUES FOUND

### **ISSUE 1: Panduan Pendaftaran Tidak Sesuai**
**Current:** `/resources/panduan` isinya langkah-langkah submit prestasi  
**Expected:** Seharusnya ada 2 panduan terpisah:
1. **Panduan Daftar Lomba** - Cara browse dan daftar lomba (internal/external)
2. **Panduan Submit Prestasi** - Cara melaporkan prestasi yang sudah diraih

**Impact:** User bingung karena panduan tidak match dengan konteks  
**Priority:** HIGH - Need immediate fix

### **ISSUE 2: Coming Soon Pages Need Better Design**
**Current:** Download & Template pages dengan emoji dan list text  
**Fixed:** Sudah diupdate dengan card-based layout, lucide icons, professional design

---

## ✅ RECOMMENDED FIXES

### **1. Split Panduan API**
```typescript
// app/api/panduan/route.ts
const staticPanduan = {
    daftar_lomba: [
        { step: 1, title: 'Browse Katalog Lomba', description: '...' },
        { step: 2, title: 'Pilih Lomba Sesuai Minat', description: '...' },
        { step: 3, title: 'Baca Detail & Syarat', description: '...' },
        { step: 4, title: 'Klik Button Daftar', description: '...' },
        { step: 5, title: 'Isi Form (jika internal)', description: '...' },
        { step: 6, title: 'Atau Redirect ke Website Lomba (jika eksternal)', description: '...' },
    ],
    submit_prestasi: [
        // Existing content (already correct)
    ],
    expo: [
        // Existing expo guide
    ],
};

// Check `type` query param: ?type=daftar_lomba | submit_prestasi | expo
```

### **2. Update Panduan Pages**
```
/resources/panduan                  → Panduan Daftar Lomba (new content)
/resources/panduan-submit-prestasi  → Panduan Submit Prestasi (current content)
```

---

## 📝 SUMMARY

### **Unique Features:**
1. **Dual Registration System**: Internal (APM handles) vs External (redirect to lomba website)
2. **Verification Workflow**: Prestasi needs admin approval, Lomba/Expo auto-registered
3. **Form Builder**: Custom form untuk lomba/expo registration (JSON schema)
4. **Calendar Integration**: Centralized event calendar (lomba, expo, deadline)
5. **Stats Dashboard**: Real-time monitoring untuk admin

### **Key Differentiators:**
- **APM = Katalog + Facilitator**, bukan penyelenggara lomba
- **Submit Prestasi ≠ Daftar Lomba** (different flows, different purposes)
- **Verification Layer** untuk maintain data quality prestasi
- **Flexible Registration** (internal form OR external link)

### **Tech Excellence:**
- Modern stack (Next.js 14 App Router, Prisma ORM, Neon Cloud DB)
- Type-safe with TypeScript
- Responsive design with Tailwind CSS
- Server-side rendering (SSR) for SEO
- Real-time data with revalidation strategy

---

**Generated:** February 4, 2026  
**Author:** AI Development Assistant  
**Version:** 1.0.0
