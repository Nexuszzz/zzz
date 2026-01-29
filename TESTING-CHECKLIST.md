# 🧪 Checklist Testing APM Portal

## Akses
- **Website**: http://localhost:3000
- **Directus Admin**: http://localhost:8055
- **Directus Login**: admin@apm-portal.id / Admin@APM2026!

---

## ✅ A. Test Directus Schema

### A1. Cek Collections di Directus Admin
Buka http://localhost:8055/admin dan verifikasi collections berikut ada:

| # | Collection | Status |
|---|------------|--------|
| 1 | `lomba` | ⬜ Ada |
| 2 | `prestasi` | ⬜ Ada |
| 3 | `prestasi_tim` | ⬜ Ada |
| 4 | `expo` | ⬜ Ada |
| 5 | `submissions` | ⬜ Ada |
| 6 | `pages` | ⬜ Ada |
| 7 | `team_members` | ⬜ Ada |
| 8 | `resources` | ⬜ Ada |
| 9 | `site_settings` | ⬜ Ada |

### A2. Cek Fields Prestasi
Buka collection `prestasi` dan verifikasi fields:

| # | Field | Status |
|---|-------|--------|
| 1 | judul | ⬜ Ada |
| 2 | slug | ⬜ Ada |
| 3 | nama_lomba | ⬜ Ada |
| 4 | peringkat | ⬜ Ada |
| 5 | tingkat | ⬜ Ada |
| 6 | kategori | ⬜ Ada |
| 7 | tanggal | ⬜ Ada |
| 8 | status (pending/approved/rejected) | ⬜ Ada |
| 9 | is_published | ⬜ Ada |
| 10 | submitter_name | ⬜ Ada |
| 11 | submitter_nim | ⬜ Ada |
| 12 | submitter_email | ⬜ Ada |
| 13 | sertifikat | ⬜ Ada |
| 14 | reviewer_notes | ⬜ Ada |
| 15 | reviewed_at | ⬜ Ada |

---

## ✅ B. Test Halaman Public

### B1. Landing Page
Buka http://localhost:3000

| # | Test | Status |
|---|------|--------|
| 1 | Halaman tampil tanpa error | ⬜ Pass |
| 2 | Stats section tampil | ⬜ Pass |
| 3 | Featured lomba tampil (jika ada data) | ⬜ Pass |

### B2. Halaman Lomba
Buka http://localhost:3000/lomba

| # | Test | Status |
|---|------|--------|
| 1 | Halaman tampil tanpa error | ⬜ Pass |
| 2 | List lomba tampil (jika ada data) | ⬜ Pass |
| 3 | Filter kategori berfungsi | ⬜ Pass |

### B3. Halaman Prestasi
Buka http://localhost:3000/prestasi

| # | Test | Status |
|---|------|--------|
| 1 | Halaman tampil tanpa error | ⬜ Pass |
| 2 | Hanya prestasi `status=approved` & `is_published=true` tampil | ⬜ Pass |

### B4. Halaman Expo
Buka http://localhost:3000/expo

| # | Test | Status |
|---|------|--------|
| 1 | Halaman tampil tanpa error | ⬜ Pass |
| 2 | List expo tampil (jika ada data) | ⬜ Pass |

### B5. Halaman Kalender
Buka http://localhost:3000/kalender

| # | Test | Status |
|---|------|--------|
| 1 | Halaman tampil tanpa error | ⬜ Pass |
| 2 | Events dari lomba/expo tampil di kalender | ⬜ Pass |

---

## ✅ C. Test Submission Prestasi (PENTING!)

### C1. Buka Form Submission
Buka http://localhost:3000/submission

| # | Test | Status |
|---|------|--------|
| 1 | Halaman tampil tanpa error | ⬜ Pass |
| 2 | Multi-step form berjalan | ⬜ Pass |

### C2. Isi Form Submission
Isi data berikut:

**Step 1 - Info Lomba:**
- Nama Lomba: `Test Lomba ABC`
- Penyelenggara: `Kementerian Pendidikan`
- Kategori: `Teknologi`
- Tingkat: `Nasional`
- Tanggal: `2026-01-15`
- Lokasi: `Jakarta`
- Peringkat: `Juara 1`

**Step 2 - Tim:**
- Nama Ketua: `John Doe`
- NIM: `12345678`
- Prodi: Pilih salah satu

**Step 3 - Upload:**
- Upload file sertifikat (PDF/JPG/PNG, max 5MB)

| # | Test | Status |
|---|------|--------|
| 1 | Validasi form berjalan | ⬜ Pass |
| 2 | File upload berhasil | ⬜ Pass |
| 3 | Submit berhasil (muncul success message) | ⬜ Pass |

### C3. Verifikasi di Directus
Buka http://localhost:8055/admin/content/prestasi

| # | Test | Status |
|---|------|--------|
| 1 | Data prestasi baru muncul | ⬜ Pass |
| 2 | Status = `pending` | ⬜ Pass |
| 3 | is_published = `false` | ⬜ Pass |
| 4 | File sertifikat ter-upload | ⬜ Pass |

---

## ✅ D. Test Approval Workflow

### D1. Login Admin Dashboard
Buka http://localhost:3000/admin

| # | Test | Status |
|---|------|--------|
| 1 | Login redirect (jika belum login) | ⬜ Pass |
| 2 | Dashboard tampil dengan stats | ⬜ Pass |
| 3 | Pending count menunjukkan prestasi baru | ⬜ Pass |

### D2. Verifikasi Prestasi via Admin
Buka http://localhost:3000/admin/prestasi

| # | Test | Status |
|---|------|--------|
| 1 | List prestasi tampil | ⬜ Pass |
| 2 | Filter status=pending berfungsi | ⬜ Pass |
| 3 | Klik prestasi untuk review | ⬜ Pass |

### D3. Approve Prestasi
Klik prestasi yang pending → Approve

| # | Test | Status |
|---|------|--------|
| 1 | Approve berhasil | ⬜ Pass |
| 2 | Status berubah ke `approved` (di Directus: `approved`) | ⬜ Pass |
| 3 | is_published berubah ke `true` | ⬜ Pass |
| 4 | reviewed_at terisi | ⬜ Pass |

### D4. Cek di Halaman Public
Buka http://localhost:3000/prestasi

| # | Test | Status |
|---|------|--------|
| 1 | Prestasi yang di-approve muncul | ⬜ Pass |

---

## ✅ E. Test API Endpoints

### E1. Test via Browser/Curl

| # | Endpoint | Expected | Status |
|---|----------|----------|--------|
| 1 | `http://localhost:3000/api/lomba` | JSON data | ⬜ Pass |
| 2 | `http://localhost:3000/api/prestasi` | JSON data | ⬜ Pass |
| 3 | `http://localhost:3000/api/expo` | JSON data | ⬜ Pass |
| 4 | `http://localhost:3000/api/site-settings` | JSON dengan stats | ⬜ Pass |
| 5 | `http://localhost:3000/api/pages?slug=about` | Page data | ⬜ Pass |
| 6 | `http://localhost:3000/api/calendar` | Calendar events | ⬜ Pass |

---

## ✅ F. Test Directus Direct Access

### F1. Public Read Access
Cek apakah data bisa diakses tanpa login:

| # | URL | Expected | Status |
|---|-----|----------|--------|
| 1 | `http://localhost:8055/items/lomba` | JSON data | ⬜ Pass |
| 2 | `http://localhost:8055/items/prestasi` | JSON data | ⬜ Pass |
| 3 | `http://localhost:8055/items/expo` | JSON data | ⬜ Pass |
| 4 | `http://localhost:8055/items/pages` | JSON data | ⬜ Pass |
| 5 | `http://localhost:8055/items/site_settings` | JSON data | ⬜ Pass |

---

## ✅ G. Test Error Handling

| # | Test | Expected | Status |
|---|------|----------|--------|
| 1 | Submit form tanpa sertifikat | Error message | ⬜ Pass |
| 2 | Upload file > 5MB | Error message | ⬜ Pass |
| 3 | Akses halaman tidak ada | 404 page | ⬜ Pass |

---

## 📋 Summary Testing

| Section | Passed | Failed | Total |
|---------|--------|--------|-------|
| A. Directus Schema | _ | _ | 24 |
| B. Halaman Public | _ | _ | 10 |
| C. Submission | _ | _ | 10 |
| D. Approval Workflow | _ | _ | 10 |
| E. API Endpoints | _ | _ | 6 |
| F. Directus Access | _ | _ | 5 |
| G. Error Handling | _ | _ | 3 |
| **TOTAL** | _ | _ | **68** |

---

## 🐛 Issues Found

List issues yang ditemukan saat testing:

1. ...
2. ...
3. ...

---

## Notes

- Jika ada error, cek console browser (F12 → Console)
- Cek terminal Next.js untuk server-side errors
- Cek `docker-compose logs directus` untuk Directus errors
