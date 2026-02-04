# Page Loading Implementation

## Fitur yang Sudah Diimplementasikan

### 1. Global Page Loading Bar
Setiap kali user pindah halaman (client-side navigation), akan muncul **loading bar berwarna biru di atas** yang menunjukkan progress.

**File yang dibuat:**
- `hooks/usePageLoading.ts` - Hook untuk detect route changes
- `components/layout/PageLoadingBar.tsx` - Loading bar component
- `components/layout/ConditionalLayout.tsx` - Updated dengan loading bar

**Cara Kerja:**
- Otomatis detect perubahan pathname dan searchParams
- Loading bar muncul di atas halaman (fixed position, z-index 9999)
- Progress bar bergerak smooth dari 0% → 90% → 100%
- Hilang otomatis setelah navigation selesai

### 2. Navigation Hook dengan Loading State
Hook untuk navigasi programmatic dengan built-in loading state, mencegah spam klik.

**File yang dibuat:**
- `hooks/useNavigate.ts` - Hook untuk router.push dengan loading state
- `hooks/index.ts` - Updated exports

**Cara Penggunaan:**

#### Contoh 1: Basic Navigation
```tsx
'use client';

import { useNavigate } from '@/hooks';
import { Button } from '@/components/ui';

export function MyComponent() {
  const { navigate, isNavigating } = useNavigate();

  return (
    <Button 
      onClick={() => navigate('/lomba')}
      disabled={isNavigating}
    >
      {isNavigating ? 'Loading...' : 'Lihat Lomba'}
    </Button>
  );
}
```

#### Contoh 2: Multiple Navigation Buttons
```tsx
'use client';

import { useNavigate } from '@/hooks';
import { Button } from '@/components/ui';
import { ArrowLeft, Home } from 'lucide-react';

export function NavigationButtons() {
  const { navigate, isNavigating } = useNavigate();

  return (
    <div className="flex gap-4">
      <Button 
        onClick={() => navigate('/prestasi')}
        disabled={isNavigating}
        variant="primary"
      >
        {isNavigating ? 'Loading...' : 'Submit Prestasi'}
      </Button>
      
      <Button 
        onClick={() => navigate('/')}
        disabled={isNavigating}
        variant="outline"
      >
        <Home className="w-4 h-4 mr-2" />
        {isNavigating ? 'Loading...' : 'Beranda'}
      </Button>
    </div>
  );
}
```

#### Contoh 3: Dengan Loader Icon
```tsx
'use client';

import { useNavigate } from '@/hooks';
import { Button } from '@/components/ui';
import { Loader2 } from 'lucide-react';

export function SubmitButton() {
  const { navigate, isNavigating } = useNavigate();

  const handleSubmit = async () => {
    // Lakukan validasi atau submit form dulu
    const success = await submitForm();
    
    if (success) {
      navigate('/prestasi/submit-success');
    }
  };

  return (
    <Button 
      onClick={handleSubmit}
      disabled={isNavigating}
      variant="primary"
    >
      {isNavigating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {isNavigating ? 'Navigating...' : 'Submit'}
    </Button>
  );
}
```

## Fitur yang Sudah Aktif Otomatis

### ✅ Link Navigation
Semua komponen `<Link>` dari Next.js sudah otomatis menampilkan loading bar:
```tsx
import Link from 'next/link';

// Loading bar muncul otomatis saat diklik
<Link href="/lomba">
  <Button>Lihat Lomba</Button>
</Link>
```

### ✅ Browser Back/Forward
Loading bar juga muncul saat user tekan tombol back/forward di browser.

### ✅ Admin & Public Routes
Loading bar bekerja di semua halaman (public dan admin).

## Migration Guide (Optional)

Jika ingin update halaman yang sudah ada untuk menggunakan `useNavigate`:

### Before:
```tsx
import { useRouter } from 'next/navigation';

export function MyPage() {
  const router = useRouter();
  
  return (
    <Button onClick={() => router.push('/lomba')}>
      Lihat Lomba
    </Button>
  );
}
```

### After:
```tsx
import { useNavigate } from '@/hooks';

export function MyPage() {
  const { navigate, isNavigating } = useNavigate();
  
  return (
    <Button 
      onClick={() => navigate('/lomba')}
      disabled={isNavigating}
    >
      {isNavigating ? 'Loading...' : 'Lihat Lomba'}
    </Button>
  );
}
```

## Testing

1. **Test Global Loading Bar:**
   - Klik menu navigasi di header
   - Perhatikan loading bar biru di bagian atas
   - Loading bar harus smooth dan hilang setelah halaman loaded

2. **Test useNavigate Hook:**
   - Klik tombol yang menggunakan `useNavigate`
   - Tombol harus disabled saat loading
   - Text harus berubah menjadi "Loading..." atau "Navigating..."
   - Tidak bisa spam klik

3. **Test Browser Navigation:**
   - Tekan tombol back browser
   - Loading bar harus muncul
   - Tekan tombol forward
   - Loading bar harus muncul

## Performance Notes

- Loading bar menggunakan CSS transition untuk smooth animation
- Hook `usePageLoading` menggunakan minimal delay (500ms) untuk UX yang baik
- Tidak ada re-render berlebihan karena menggunakan state management yang efisien
- `useNavigate` menggunakan `useTransition` dari React untuk concurrent rendering

## Customization

### Mengubah Warna Loading Bar
Edit file `components/layout/PageLoadingBar.tsx`:
```tsx
// Ganti gradient colors
className="h-full bg-gradient-to-r from-success via-emerald-500 to-teal-500"
```

### Mengubah Durasi Loading
Edit file `hooks/usePageLoading.ts`:
```tsx
setTimeout(() => {
  setIsNavigating(false);
}, 1000); // Ubah dari 500 ke 1000 untuk loading lebih lama
```

### Mengubah Height Loading Bar
Edit file `components/layout/PageLoadingBar.tsx`:
```tsx
<div className="fixed top-0 left-0 right-0 z-[9999] h-2 bg-gray-200">
  // Ubah h-1 menjadi h-2 untuk bar lebih tebal
```
