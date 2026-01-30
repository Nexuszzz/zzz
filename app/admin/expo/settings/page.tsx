'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Settings, Calendar, MessageSquare, Power } from 'lucide-react';

interface ExpoSettingsData {
  is_active: boolean;
  inactive_message: string;
  next_expo_date: string;
}

export default function ExpoSettingsPage() {
  const router = useRouter();
  
  const [settings, setSettings] = useState<ExpoSettingsData>({
    is_active: true,
    inactive_message: 'Belum ada expo saat ini. Nantikan update selanjutnya!',
    next_expo_date: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch current settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/expo/settings');
        const data = await res.json();

        if (res.ok && data.data) {
          const s = data.data;
          setSettings({
            is_active: s.is_active ?? true,
            inactive_message: s.inactive_message || 'Belum ada expo saat ini. Nantikan update selanjutnya!',
            next_expo_date: s.next_expo_date ? new Date(s.next_expo_date).toISOString().split('T')[0] : '',
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/expo/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: settings.is_active,
          inactive_message: settings.inactive_message,
          next_expo_date: settings.next_expo_date || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan pengaturan');
      }

      setSuccess('Pengaturan berhasil disimpan!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/expo"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Settings size={24} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Pengaturan Expo</h1>
            <p className="text-slate-600">Kelola tampilan dan ketersediaan halaman expo publik</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Error/Success Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
            {success}
          </div>
        )}

        {/* Toggle Expo Active */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${settings.is_active ? 'bg-green-100' : 'bg-slate-100'}`}>
                <Power size={24} className={settings.is_active ? 'text-green-600' : 'text-slate-400'} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Status Expo</h2>
                <p className="text-slate-600 text-sm mt-1">
                  {settings.is_active 
                    ? 'Halaman expo aktif dan dapat diakses publik'
                    : 'Halaman expo nonaktif, menampilkan pesan maintenance'
                  }
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.is_active}
                onChange={(e) => setSettings(prev => ({ ...prev, is_active: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
        </div>

        {/* Inactive Message */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <MessageSquare size={20} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Pesan Saat Nonaktif</h2>
              <p className="text-slate-500 text-sm">Ditampilkan ketika halaman expo dinonaktifkan</p>
            </div>
          </div>
          <textarea
            value={settings.inactive_message}
            onChange={(e) => setSettings(prev => ({ ...prev, inactive_message: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Contoh: Pendaftaran expo sedang ditutup. Nantikan update selanjutnya!"
          />
        </div>

        {/* Next Expo Date */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Jadwal Expo Berikutnya</h2>
              <p className="text-slate-500 text-sm">Opsional - Ditampilkan saat expo nonaktif</p>
            </div>
          </div>
          <input
            type="date"
            value={settings.next_expo_date}
            onChange={(e) => setSettings(prev => ({ ...prev, next_expo_date: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {settings.next_expo_date && (
            <p className="mt-2 text-sm text-slate-500">
              Expo berikutnya: {new Date(settings.next_expo_date).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
        </div>

        {/* Preview Card */}
        {!settings.is_active && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="font-semibold text-amber-800 mb-2">Preview Tampilan Publik</h3>
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <p className="text-slate-600 text-center">{settings.inactive_message}</p>
              {settings.next_expo_date && (
                <p className="text-center text-sm text-blue-600 mt-2">
                  Expo berikutnya: {new Date(settings.next_expo_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/expo"
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Simpan Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
