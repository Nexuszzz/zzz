'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook untuk navigasi dengan loading state
 * Mencegah spam klik dan memberikan feedback visual
 */
export function useNavigate() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigate = (url: string) => {
    setIsNavigating(true);
    startTransition(() => {
      router.push(url);
      // Reset state setelah delay untuk smooth UX
      setTimeout(() => {
        setIsNavigating(false);
      }, 500);
    });
  };

  return {
    navigate,
    isNavigating: isPending || isNavigating,
  };
}
