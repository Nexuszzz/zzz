'use client';

import { LogOut, Bell, User, Home, Trophy, Users, Calendar, Award, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/lomba', label: 'Lomba', icon: Trophy },
  { href: '/admin/expo', label: 'Expo', icon: Calendar },
  { href: '/admin/prestasi', label: 'Prestasi', icon: Award },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    // Clear auth cookies
    document.cookie = 'admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'apm_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/admin/login');
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <header className="h-16 bg-slate-800 fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 lg:px-6">
      {/* Logo & Mobile Menu Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          {showMobileMenu ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
        </button>
        
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-white font-semibold hidden sm:block">APM Admin</span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${active 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Back to Public Site */}
        <Link
          href="/"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <Home size={14} />
          <span>Lihat Situs</span>
        </Link>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <Bell size={20} className="text-slate-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <span className="text-white text-sm hidden sm:block">Admin</span>
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                <Link
                  href="/admin/settings"
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings size={16} />
                  <span>Pengaturan</span>
                </Link>
                <hr className="my-1 border-slate-200" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="fixed top-16 left-0 right-0 bg-slate-800 border-t border-slate-700 z-50 lg:hidden">
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                      ${active 
                        ? 'bg-blue-600 text-white' 
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <hr className="border-slate-700 my-2" />
              <Link
                href="/"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Home size={20} />
                <span>Lihat Situs Publik</span>
              </Link>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
