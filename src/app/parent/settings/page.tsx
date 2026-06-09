'use client';

import { useSession, signOut } from 'next-auth/react';
import { Bell, Globe, Trash2, RotateCcw, Mail, User, LogOut } from 'lucide-react';

export default function ParentSettings() {
  const { data: session } = useSession();

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-500 mt-0.5">Kelola preferensi akun dan aplikasi</p>
      </div>

      <div className="space-y-4">
        {/* Account */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Akun</h2>
          <div className="space-y-1">
            <div className="flex items-center gap-3 p-3 rounded-lg">
              <span className="text-gray-400"><User size={16} /></span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Nama</p>
                <p className="text-xs text-gray-500">{session?.user?.name ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg">
              <span className="text-gray-400"><Mail size={16} /></span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Email</p>
                <p className="text-xs text-gray-500">{session?.user?.email ?? '—'}</p>
              </div>
            </div>
            <button onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg text-left text-[#EA4335] transition-colors">
              <LogOut size={16} />
              <span className="text-sm font-medium">Keluar dari akun</span>
            </button>
          </div>
        </div>

        {/* Notifications (cosmetic) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Bell size={14} className="text-[#4285F4]" /> Notifikasi
          </h2>
          <div className="space-y-1">
            {[
              { label: 'Reminder Tugas Harian', sub: 'Notifikasi untuk tugas yang belum selesai', checked: true },
              { label: 'Reward Tercapai', sub: 'Notifikasi ketika anak mencapai reward', checked: true },
              { label: 'Update Mingguan', sub: 'Laporan ringkas setiap akhir minggu', checked: false },
            ].map((item, i) => (
              <label key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input type="checkbox" defaultChecked={item.checked} className="w-4 h-4 accent-[#4285F4]" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Preferences (cosmetic) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Globe size={14} className="text-[#4285F4]" /> Preferensi
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bahasa</label>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]">
                <option>Bahasa Indonesia</option>
                <option>Bahasa Inggris</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Zona Waktu</label>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]">
                <option>Asia/Jakarta (UTC+7)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger zone (cosmetic placeholders) */}
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[#EA4335] uppercase tracking-wide mb-3">Zona Berbahaya</h2>
          <div className="space-y-2">
            <div className="w-full flex items-center gap-3 p-3 rounded-lg text-left border border-gray-100">
              <RotateCcw size={16} className="text-orange-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">Reset Data Minggu Ini</p>
                <p className="text-xs text-gray-500">Belum tersedia</p>
              </div>
            </div>
            <div className="w-full flex items-center gap-3 p-3 rounded-lg text-left border border-gray-100">
              <Trash2 size={16} className="text-[#EA4335] shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">Hapus Semua Data</p>
                <p className="text-xs text-gray-500">Hapus tiap anak dari menu Anak</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 pt-2">
          <p>MTRC v0.1.0</p>
        </div>
      </div>
    </div>
  );
}
