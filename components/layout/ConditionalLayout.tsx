'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageLoadingBar } from '@/components/layout/PageLoadingBar';
import { usePageLoading } from '@/hooks/usePageLoading';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoading = usePageLoading();
  
  // Check if current path is admin route
  const isAdminRoute = pathname?.startsWith('/admin');
  
  // Admin routes: no public header/footer (they have their own layout)
  if (isAdminRoute) {
    return (
      <>
        <PageLoadingBar isLoading={isLoading} />
        {children}
      </>
    );
  }
  
  // Public routes: show header and footer
  return (
    <>
      <PageLoadingBar isLoading={isLoading} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
