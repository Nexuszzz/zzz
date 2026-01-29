'use client';

import { Sidebar } from '@/components/admin/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      
      <main className="flex-1 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
