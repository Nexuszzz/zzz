'use client';

import { useEffect, useState } from 'react';

interface PageLoadingBarProps {
  isLoading: boolean;
}

export function PageLoadingBar({ isLoading }: PageLoadingBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      
      // Simulasi progress bar yang smooth
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev; // Stop di 90% sampai loading selesai
          return prev + Math.random() * 10;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      // Complete progress saat loading selesai
      setProgress(100);
      
      // Hide bar setelah animasi complete
      const timeout = setTimeout(() => {
        setProgress(0);
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  if (progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gray-200">
      <div
        className="h-full bg-gradient-to-r from-primary via-blue-500 to-cyan-500 transition-all duration-300 ease-out shadow-lg shadow-primary/50"
        style={{
          width: `${progress}%`,
          transition: progress === 100 ? 'width 0.3s ease-out' : 'width 0.2s ease-out',
        }}
      />
    </div>
  );
}
