# 📋 IMPLEMENTATION PLAN - APM Portal Completion

## 📌 Overview

Dokumen ini berisi rencana implementasi lengkap untuk menyelesaikan fitur Lomba, Expo, dan Prestasi agar sesuai dengan spesifikasi yang diminta.

**Status Saat Ini:**
- ✅ Schema Database: LENGKAP
- ✅ API Backend: 80% SIAP
- ❌ Frontend UI: 60% - Banyak gap

---

## 🎯 TARGET AKHIR

### 1. LOMBA
- [x] Admin bisa CRUD lomba dengan semua field
- [ ] Admin bisa pilih `tipe_pendaftaran` (internal/eksternal/info-only)
- [ ] Admin bisa upload poster
- [ ] Admin bisa set Draft/Publish
- [ ] Public detail page: tombol daftar conditional berdasarkan tipe
- [x] Lomba muncul di Home (featured)
- [x] Lomba muncul di /lomba
- [ ] Lomba muncul di Kalender (perlu verifikasi)

### 2. EXPO
- [x] Admin bisa CRUD expo dengan field dasar
- [ ] Admin bisa toggle ExpoSettings (aktif/nonaktif)
- [ ] Admin bisa pilih `tipe_pendaftaran`
- [ ] Admin bisa upload poster/galeri
- [ ] Public page cek `is_active` untuk tampilkan inactive_message
- [x] Expo muncul di Home
- [x] Expo muncul di /expo

### 3. PRESTASI
- [ ] Form submit 3-step wizard
- [ ] Step 2: Input pembimbing dengan WhatsApp
- [ ] Step 3: Multi-upload dokumentasi (1-6 gambar)
- [ ] Step 3: Upload surat pendukung dengan label
- [x] Admin list submission dengan filter
- [x] Admin approve/reject dengan notes
- [ ] Admin halaman Edit Publikasi (post-approve)
- [ ] Admin pilih thumbnail, galeri, sertifikat visibility
- [x] Prestasi muncul di Home
- [x] Prestasi muncul di /prestasi

---

## 🔧 PHASE 1: SHARED COMPONENTS (Foundation)

### 1.1 Image Upload Component
**File:** `components/admin/ImageUpload.tsx`

```tsx
// Props:
// - value: string | string[] - current image path(s)
// - onChange: (value) => void
// - multiple?: boolean - single or multi upload
// - maxFiles?: number - max files for multi upload
// - accept?: string - file types (default: image/*)
// - maxSize?: number - max file size in MB
// - label?: string
// - error?: string
// - helperText?: string

// Features:
// - Drag & drop support
// - Preview with remove button
// - Progress indicator
// - File type validation
// - Size validation
// - Reorder (for multiple)
```

### 1.2 File Upload Component
**File:** `components/admin/FileUpload.tsx`

```tsx
// Similar to ImageUpload but for PDFs
// - Shows file icon instead of preview
// - Supports custom label per file (for surat pendukung)
```

### 1.3 Upload API Enhancement
**File:** `app/api/upload/route.ts`

Current: Basic upload
Needed:
- Support multiple files in single request
- Return array of paths
- Subdirectory support (lomba, expo, prestasi)
- File type validation
- Size limit enforcement

---

## 🏆 PHASE 2: LOMBA COMPLETION

### 2.1 Admin Form - Tambah Field Baru
**File:** `app/admin/lomba/create/page.tsx`

**Changes:**
1. Add `tipe_pendaftaran` radio/select:
   ```tsx
   <RadioGroup name="tipe_pendaftaran" options={[
     { value: 'internal', label: 'Internal (Form di website)' },
     { value: 'eksternal', label: 'Eksternal (Link luar)' },
     { value: 'none', label: 'Info Only (Tanpa pendaftaran)' }
   ]} />
   ```

2. Conditional `link_pendaftaran` field (show when eksternal)

3. Add poster upload:
   ```tsx
   <ImageUpload
     label="Poster Lomba"
     value={formData.poster}
     onChange={(path) => setFormData({...formData, poster: path})}
   />
   ```

4. Change status to Draft/Publish toggle:
   ```tsx
   // status: 'draft' | 'open' | 'closed'
   <Select name="status" options={[
     { value: 'draft', label: 'Draft (Belum dipublish)' },
     { value: 'open', label: 'Published (Bisa dilihat publik)' },
     { value: 'closed', label: 'Closed (Pendaftaran ditutup)' }
   ]} />
   ```

### 2.2 Admin Form - Edit Page
**File:** `app/admin/lomba/[id]/edit/page.tsx`

Same as create but:
- Fetch existing data
- Pre-fill form
- PATCH instead of POST

### 2.3 Public Detail - Conditional Button
**File:** `app/lomba/[slug]/page.tsx`

**Current (lines 270-285):**
```tsx
// Always shows both buttons
<Link href={`/lomba/${lomba.slug}/daftar`}>
  <Button>Daftar Sekarang</Button>
</Link>
{lombaDetail.linkPendaftaran && (
  <a href={lombaDetail.linkPendaftaran}>
    <Button>Website Penyelenggara</Button>
  </a>
)}
```

**Target:**
```tsx
{/* Conditional based on tipe_pendaftaran */}
{lombaDetail.tipePendaftaran === 'internal' && (
  <Link href={`/lomba/${lomba.slug}/daftar`}>
    <Button>Daftar Sekarang</Button>
  </Link>
)}

{lombaDetail.tipePendaftaran === 'eksternal' && lombaDetail.linkPendaftaran && (
  <a href={lombaDetail.linkPendaftaran} target="_blank">
    <Button>Daftar di Website Penyelenggara</Button>
  </a>
)}

{lombaDetail.tipePendaftaran === 'none' && (
  // No button or "Lihat Detail" only
  <p className="text-muted">Lomba ini hanya untuk informasi</p>
)}
```

### 2.4 API - Expose tipe_pendaftaran
**File:** `app/api/lomba/route.ts`

Ensure `tipe_pendaftaran` is included in response:
```typescript
// In transform/select, add:
tipe_pendaftaran: item.tipe_pendaftaran,
```

---

## 🎪 PHASE 3: EXPO COMPLETION

### 3.1 Expo Settings Admin Page
**File:** `app/admin/expo/settings/page.tsx` (NEW)

```tsx
// UI:
// - Toggle: Expo Aktif/Nonaktif
// - Textarea: Pesan saat nonaktif
// - DatePicker: Tanggal expo berikutnya (optional)
// - Save button

// Fetch: GET /api/admin/expo/1/settings
// Update: PATCH /api/admin/expo/1/settings
```

### 3.2 Admin Sidebar - Add Settings Menu
**File:** `components/admin/Sidebar.tsx`

Add under Expo menu:
```tsx
{ name: 'Pengaturan', href: '/admin/expo/settings', icon: Settings }
```

### 3.3 Admin Form - Tambah Field
**File:** `app/admin/expo/create/page.tsx`

Add:
1. `tipe_pendaftaran` radio (same as lomba)
2. Poster upload
3. Galeri upload (multi)
4. Status draft/publish

### 3.4 Public Expo - Check is_active
**File:** `app/expo/page.tsx` and `ExpoPageClient.tsx`

```tsx
// Fetch expo settings first
const settingsRes = await fetch('/api/expo/settings');
const settings = await settingsRes.json();

if (!settings.is_active) {
  return (
    <div className="text-center py-20">
      <h2>Belum Ada Expo</h2>
      <p>{settings.inactive_message}</p>
    </div>
  );
}

// Continue with normal expo list
```

### 3.5 API - Public Settings Endpoint
**File:** `app/api/expo/settings/route.ts` (NEW)

```typescript
// GET /api/expo/settings
// Returns: { is_active, inactive_message, next_expo_date }
// No auth required (public)
```

---

## 🏅 PHASE 4: PRESTASI COMPLETION

### 4.1 Form 3-Step Wizard
**File:** `app/prestasi/submit/page.tsx` (REWRITE)

**Structure:**
```tsx
const [step, setStep] = useState(1);

// Step 1: Info Prestasi
// Step 2: Tim & Pembimbing
// Step 3: Upload Dokumen

// Navigation:
// - Validate current step before next
// - Allow back without losing data
// - Submit only on step 3
```

**Step 1 - Info Prestasi:**
- Judul prestasi
- Nama lomba
- Penyelenggara
- Tingkat (regional/nasional/internasional)
- Peringkat
- Tanggal
- Kategori
- Deskripsi

**Step 2 - Tim & Pembimbing:**
```tsx
// Tim Section
<DynamicInputList
  label="Anggota Tim"
  fields={['nama', 'nim', 'prodi', 'whatsapp']}
  minItems={1}
  maxItems={10}
  requiredWhatsApp={true} // At least 1 member must have WhatsApp
/>

// Pembimbing Section (NEW!)
<DynamicInputList
  label="Dosen Pembimbing"
  fields={['nama', 'nidn', 'whatsapp']}
  minItems={0}
  maxItems={3}
  requiredWhatsApp={true} // If pembimbing exists, WhatsApp required
/>
```

**Step 3 - Upload Dokumen:**
```tsx
// Sertifikat (required, PDF only)
<FileUpload
  label="Sertifikat"
  accept=".pdf"
  required
/>

// Dokumentasi (required 1-6, images only)
<ImageUpload
  label="Dokumentasi Kegiatan"
  multiple
  minFiles={1}
  maxFiles={6}
  helperText="Upload 1-6 foto dokumentasi"
/>

// Surat Pendukung (optional, with custom labels)
<FileUploadWithLabels
  label="Surat Pendukung"
  accept=".pdf"
  maxFiles={5}
  labelPlaceholder="Contoh: Surat Tugas, SK Rektor, dll"
/>
```

### 4.2 Submit API Enhancement
**File:** `app/api/prestasi/submit/route.ts`

Already supports multi-file, but ensure:
- Pembimbing data is saved
- Document labels are saved
- Proper validation for required files

### 4.3 Admin - Edit Publikasi Page
**File:** `app/admin/prestasi/[id]/publish/page.tsx` (NEW)

**Purpose:** After approve, admin edits publication details

**UI Sections:**

```tsx
// Section 1: Basic Info
<FormField label="Judul Publik" value={judul} />
<FormField label="Deskripsi Publik" value={deskripsi} multiline />

// Section 2: Media Selection
// Show all dokumentasi from submission
<ThumbnailSelector
  images={submission.documents.filter(d => d.type === 'dokumentasi')}
  selected={thumbnail}
  onSelect={setThumbnail}
/>

<GaleriSelector
  images={submission.documents.filter(d => d.type === 'dokumentasi')}
  selected={galeri}
  onSelect={setGaleri}
/>

// Section 3: Settings
<Checkbox label="Tampilkan di Home (Featured)" checked={is_featured} />
<Checkbox label="Sertifikat boleh dilihat publik" checked={sertifikat_public} />

<Select label="Status" options={[
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' }
]} />

// Section 4: Links (optional)
<FormField label="Link Berita" />
<FormField label="Link Portfolio" />
```

### 4.4 Admin API - Publish Endpoint
**File:** `app/api/admin/prestasi/[id]/publish/route.ts` (NEW)

```typescript
// POST /api/admin/prestasi/:id/publish
// Body: { judul, deskripsi, thumbnail, galeri, is_featured, sertifikat_public, is_published, link_berita, link_portofolio }

// Creates or updates Prestasi record from PrestasiSubmission
```

### 4.5 Admin Flow Update
**File:** `app/admin/prestasi/page.tsx`

After approve:
- Show "Edit untuk Publikasi" button
- Link to `/admin/prestasi/[id]/publish`

---

## 📅 PHASE 5: CALENDAR VERIFICATION

### 5.1 Verify Lomba in Calendar
**File:** `app/api/calendar/route.ts`

Already implemented (lines 114-149). Verify it works:
- Deadline lomba appears
- Tanggal pelaksanaan appears
- Link to `/lomba/[slug]`

### 5.2 Verify Expo in Calendar
Already implemented (lines 163-195). Verify:
- tanggal_mulai - tanggal_selesai range
- Link to `/expo/[slug]`

---

## 📁 FILE CHANGES SUMMARY

### NEW FILES TO CREATE:
1. `components/admin/ImageUpload.tsx`
2. `components/admin/FileUpload.tsx`
3. `components/admin/FileUploadWithLabels.tsx`
4. `components/admin/ThumbnailSelector.tsx`
5. `components/admin/GaleriSelector.tsx`
6. `app/admin/expo/settings/page.tsx`
7. `app/admin/lomba/[id]/edit/page.tsx`
8. `app/admin/expo/[id]/edit/page.tsx`
9. `app/admin/prestasi/[id]/publish/page.tsx`
10. `app/api/expo/settings/route.ts`
11. `app/api/admin/prestasi/[id]/publish/route.ts`

### FILES TO MODIFY:
1. `app/admin/lomba/create/page.tsx` - Add tipe_pendaftaran, poster
2. `app/admin/expo/create/page.tsx` - Add tipe_pendaftaran, poster, galeri
3. `app/lomba/[slug]/page.tsx` - Conditional button
4. `app/expo/page.tsx` - Check is_active
5. `app/expo/ExpoPageClient.tsx` - Handle inactive state
6. `app/prestasi/submit/page.tsx` - 3-step wizard rewrite
7. `app/api/upload/route.ts` - Multi-file support
8. `app/api/lomba/route.ts` - Expose tipe_pendaftaran
9. `app/api/expo/route.ts` - Expose tipe_pendaftaran
10. `app/admin/prestasi/page.tsx` - Add publish button
11. `components/admin/Sidebar.tsx` - Add expo settings menu

---

## ⏰ IMPLEMENTATION ORDER

### Sprint 1: Foundation (Upload Components)
1. ✅ ImageUpload component
2. ✅ FileUpload component
3. ✅ FileUploadWithLabels component
4. ✅ Enhance upload API

### Sprint 2: Lomba Completion
5. ✅ Update admin form (tipe_pendaftaran, poster, status)
6. ✅ Update public detail page (conditional button)
7. ✅ Create edit page
8. ✅ Verify calendar integration

### Sprint 3: Expo Completion
9. ✅ Create settings page
10. ✅ Update admin form
11. ✅ Update public page (is_active check)
12. ✅ Create public settings API

### Sprint 4: Prestasi Completion
13. ✅ Rewrite submit form (3-step wizard)
14. ✅ Add pembimbing input
15. ✅ Add multi-dokumentasi upload
16. ✅ Create admin publish page
17. ✅ Create publish API
18. ✅ Update admin list (publish button)

### Sprint 5: Testing & Polish
19. ✅ Test all flows end-to-end
20. ✅ Fix any bugs
21. ✅ Verify calendar
22. ✅ Final QA

---

## 🧪 TESTING CHECKLIST

### Lomba
- [ ] Admin: Create lomba with internal registration
- [ ] Admin: Create lomba with external link
- [ ] Admin: Create lomba info-only
- [ ] Admin: Upload poster
- [ ] Admin: Save as draft
- [ ] Admin: Publish lomba
- [ ] Public: See internal daftar button
- [ ] Public: See external link button
- [ ] Public: No button for info-only
- [ ] Calendar: Deadline appears
- [ ] Calendar: Tanggal pelaksanaan appears

### Expo
- [ ] Admin: Toggle expo active/inactive
- [ ] Admin: Set inactive message
- [ ] Admin: Create expo with all fields
- [ ] Admin: Upload poster & galeri
- [ ] Public: See inactive message when off
- [ ] Public: See expo list when active
- [ ] Calendar: Expo dates appear

### Prestasi
- [ ] User: Complete step 1 (info)
- [ ] User: Complete step 2 (tim + pembimbing)
- [ ] User: Complete step 3 (documents)
- [ ] User: Submit successfully
- [ ] Admin: See submission in list
- [ ] Admin: Approve submission
- [ ] Admin: Open publish page
- [ ] Admin: Select thumbnail
- [ ] Admin: Select galeri photos
- [ ] Admin: Set sertifikat visibility
- [ ] Admin: Publish
- [ ] Public: See prestasi in list
- [ ] Public: See detail with correct content

---

## 📝 NOTES

1. **Database**: Schema sudah lengkap, tidak perlu migration
2. **API**: Sebagian besar sudah siap, hanya perlu minor updates
3. **Focus**: Utama di Frontend UI yang masih banyak gap
4. **Priority**: Prestasi paling kompleks, kerjakan terakhir
5. **Testing**: Setiap phase harus ditest sebelum lanjut

---

*Last Updated: 2026-01-30*
