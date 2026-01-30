'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Trophy,
  Calendar,
  Award,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Lomba',
    href: '/admin/lomba',
    icon: Trophy,
  },
  {
    label: 'Expo',
    href: '/admin/expo',
    icon: Calendar,
  },
  {
    label: 'Expo Settings',
    href: '/admin/expo/settings',
    icon: Settings,
  },
  {
    label: 'Prestasi',
    href: '/admin/prestasi',
    icon: Award,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-[#0B4F94] to-[#083d73] text-white transition-all duration-300 z-40 flex flex-col shadow-xl ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-blue-400/20 px-4">
          {!collapsed ? (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-[#0B4F94] font-bold text-lg">APM</span>
              </div>
              <span className="font-bold text-xl">Admin Portal</span>
            </Link>
          ) : (
            <Link href="/admin">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-[#0B4F94] font-bold text-lg">APM</span>
              </div>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname?.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-white text-[#0B4F94] shadow-lg'
                        : 'text-blue-50 hover:bg-blue-600/40'
                    } ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#0B4F94]' : 'text-white'}`} />
                    {!collapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse Button */}
        <div className="p-3 border-t border-blue-400/20">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 transition-all"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Spacer to prevent content from going under sidebar */}
      <div className={`transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`} />
    </>
  );
}
