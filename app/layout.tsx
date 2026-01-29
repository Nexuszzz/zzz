import type { Metadata } from 'next';
import './globals.css';
import { ConditionalLayout } from '@/components/layout/ConditionalLayout';

export const metadata: Metadata = {
  title: {
    default: 'APM Portal - Ajang Prestasi Mahasiswa',
    template: '%s | APM Portal',
  },
  description:
    'Portal Ajang Prestasi Mahasiswa Polinema - Informasi lomba, kompetisi, prestasi, dan expo untuk mahasiswa.',
  keywords: [
    'lomba mahasiswa',
    'kompetisi',
    'prestasi',
    'expo teknologi',
    'hackathon',
    'polinema',
  ],
  authors: [{ name: 'APM Team' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://apm-portal.id',
    siteName: 'APM Portal',
    title: 'APM Portal - Ajang Prestasi Mahasiswa',
    description:
      'Portal Ajang Prestasi Mahasiswa Polinema - Informasi lomba, kompetisi, prestasi, dan expo untuk mahasiswa.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'APM Portal - Ajang Prestasi Mahasiswa',
    description:
      'Portal Ajang Prestasi Mahasiswa Polinema - Informasi lomba, kompetisi, prestasi, dan expo untuk mahasiswa.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-text-main antialiased flex flex-col">
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}

