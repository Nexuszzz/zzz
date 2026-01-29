import { Trophy, Calendar, Medal, Users, TrendingUp, ArrowUpRight, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma/client';

async function getStats() {
  try {
    const [lombaCount, expoCount, prestasiCount, registrasiCount] = await Promise.all([
      prisma.lomba.count({ where: { is_deleted: false } }),
      prisma.expo.count({ where: { is_deleted: false } }),
      prisma.prestasi.count({ where: { is_published: true } }),
      // Count all registrations (lomba + expo)
      Promise.all([
        prisma.lombaRegistration.count(),
        prisma.expoRegistration.count(),
      ]).then(([lr, er]) => lr + er),
    ]);

    return {
      lomba: lombaCount,
      expo: expoCount,
      prestasi: prestasiCount,
      registrasi: registrasiCount,
      unreadMessages: 0, // TODO: Implement messages table
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { lomba: 0, expo: 0, prestasi: 0, registrasi: 0, unreadMessages: 0 };
  }
}

async function getRecentPrestasi() {
  try {
    const prestasi = await prisma.prestasi.findMany({
      where: { is_published: true },
      orderBy: { published_at: 'desc' },
      take: 5,
      include: {
        submission: true,
      },
    });

    return prestasi.map(item => ({
      id: item.id,
      namaPrestasi: item.judul,
      namaLomba: item.nama_lomba,
      tingkat: item.tingkat,
      submitterName: item.submission?.submitter_name || '-',
      status: 'verified',
      dateCreated: item.published_at?.toISOString() || null,
    }));
  } catch (error) {
    console.error('Error fetching recent prestasi:', error);
    return [];
  }
}

async function getPendingVerification() {
  try {
    const [pendingPrestasi, pendingExpoReg] = await Promise.all([
      prisma.prestasiSubmission.count({ where: { status: 'pending' } }),
      prisma.expoRegistration.count({ where: { status: 'pending' } }),
    ]);

    return {
      prestasi: pendingPrestasi,
      registrasi: pendingExpoReg,
    };
  } catch (error) {
    console.error('Error fetching pending counts:', error);
    return { prestasi: 0, registrasi: 0 };
  }
}

// Helper functions for status display
function getStatusBadge(status: string): string {
  const badges: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-green-100 text-green-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return badges[status] || 'bg-slate-100 text-slate-800';
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Menunggu',
    verified: 'Terverifikasi',
    approved: 'Terverifikasi',
    rejected: 'Ditolak',
  };
  return labels[status] || status;
}

function formatDate(dateString: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function AdminDashboardPage() {
  const [stats, recentPrestasi, pending] = await Promise.all([
    getStats(),
    getRecentPrestasi(),
    getPendingVerification(),
  ]);

  const statCards = [
    {
      title: 'Total Lomba',
      value: stats.lomba,
      icon: Trophy,
      color: 'bg-blue-500',
      href: '/admin/lomba'
    },
    {
      title: 'Total Expo',
      value: stats.expo,
      icon: Calendar,
      color: 'bg-purple-500',
      href: '/admin/expo'
    },
    {
      title: 'Total Prestasi',
      value: stats.prestasi,
      icon: Medal,
      color: 'bg-green-500',
      href: '/admin/prestasi'
    },
    {
      title: 'Total Registrasi',
      value: stats.registrasi,
      icon: Users,
      color: 'bg-orange-500',
      href: '/admin/registrasi'
    },
    {
      title: 'Pesan Belum Dibaca',
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: 'bg-pink-500',
      href: '/admin/messages'
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-600">Selamat datang di Admin Portal APM</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pending Verification Alert */}
      {(pending.prestasi > 0 || pending.registrasi > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-amber-600" size={24} />
            <div>
              <p className="font-medium text-amber-800">Menunggu Verifikasi</p>
              <p className="text-sm text-amber-700">
                {pending.prestasi > 0 && `${pending.prestasi} prestasi`}
                {pending.prestasi > 0 && pending.registrasi > 0 && ' dan '}
                {pending.registrasi > 0 && `${pending.registrasi} registrasi`}
                {' '}membutuhkan verifikasi.
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              {pending.prestasi > 0 && (
                <Link
                  href="/admin/prestasi?status=pending"
                  className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Verifikasi Prestasi
                </Link>
              )}
              {pending.registrasi > 0 && (
                <Link
                  href="/admin/registrasi?status=pending"
                  className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Verifikasi Registrasi
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/lomba/create"
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trophy size={18} className="text-blue-600" />
                <span className="text-sm font-medium">Tambah Lomba Baru</span>
              </div>
              <ArrowUpRight size={16} className="text-slate-400" />
            </Link>
            <Link
              href="/admin/expo/create"
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-purple-600" />
                <span className="text-sm font-medium">Tambah Expo Baru</span>
              </div>
              <ArrowUpRight size={16} className="text-slate-400" />
            </Link>
            <Link
              href="/admin/prestasi?status=pending"
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Medal size={18} className="text-green-600" />
                <span className="text-sm font-medium">Verifikasi Prestasi</span>
              </div>
              <ArrowUpRight size={16} className="text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Recent Prestasi */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Prestasi Terbaru</h2>
            <Link href="/admin/prestasi" className="text-sm text-blue-600 hover:underline">
              Lihat Semua
            </Link>
          </div>

          {recentPrestasi.length === 0 ? (
            <p className="text-slate-500 text-center py-8">Belum ada prestasi terdaftar</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Prestasi</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Tingkat</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Pengisi</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Status</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPrestasi.map((item: Record<string, unknown>) => (
                    <tr key={item.id as number} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2">
                        <p className="font-medium text-slate-800 text-sm">{item.namaPrestasi as string}</p>
                        <p className="text-xs text-slate-500">{item.namaLomba as string}</p>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-slate-600 capitalize">{item.tingkat as string}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-slate-600">{(item.submitterName as string) || '-'}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(item.status as string)}`}>
                          {getStatusLabel(item.status as string)}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-slate-500">
                        {formatDate(item.dateCreated as string)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

