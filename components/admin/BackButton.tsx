'use client';

import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

interface BackButtonProps {
  href?: string;
  label?: string;
  showDashboard?: boolean;
}

export function BackButton({ href, label = 'Kembali', showDashboard = true }: BackButtonProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {href && (
        <Link
          href={href}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={16} />
          <span>{label}</span>
        </Link>
      )}
      {showDashboard && href !== '/admin' && (
        <Link
          href="/admin"
          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Home size={16} />
          <span>Dashboard</span>
        </Link>
      )}
    </div>
  );
}
