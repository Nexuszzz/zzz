'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function usePageLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Set loading saat route berubah
    setIsLoading(true);

    // Hapus loading setelah render selesai
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Delay minimal untuk smooth UX

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  return isLoading;
}
