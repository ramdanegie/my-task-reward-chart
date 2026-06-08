'use client';

import { dummyChild } from '@/data/dummy';
import { User, Target, Calendar, Info } from 'lucide-react';

export default function ParentChild() {
  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profil Anak</h1>
        <p className="text-sm text-gray-500 mt-0.5">Kelola data dan pengaturan profil anak</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {/* Avatar row */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
            <User size={32} className="text-[#4285F4]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{dummyChild.name}</h2>
            <p className="text-sm text-gray-500">{dummyChild.age} tahun</p>
          </div>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Anak</label>
            <input type="text" defaultValue={dummyChild.name}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5"><Calendar size={14} />Usia</span>
            </label>
            <input type="number" defaultValue={dummyChild.age}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5"><Target size={14} />Target Poin Harian</span>
            </label>
            <input type="number" defaultValue={dummyChild.dailyPointTarget}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
            <p className="text-xs text-gray-400 mt-1">Poin yang ingin dicapai setiap hari</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5"><Target size={14} />Target Poin Mingguan</span>
            </label>
            <input type="number" defaultValue={dummyChild.weeklyPointTarget}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
            <p className="text-xs text-gray-400 mt-1">Poin yang ingin dicapai setiap minggu</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-[#4285F4] text-white py-2.5 rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold">Simpan Perubahan</button>
            <button type="button" className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm">Batal</button>
          </div>
        </form>
      </div>

      <div className="mt-4 bg-blue-50 rounded-xl border border-blue-100 p-4 flex gap-3">
        <Info size={16} className="text-[#4285F4] shrink-0 mt-0.5" />
        <ul className="text-xs text-gray-600 space-y-1">
          <li>Target poin dapat disesuaikan kapan saja</li>
          <li>Usia anak mempengaruhi rekomendasi tugas</li>
          <li>Perubahan profil langsung diterapkan</li>
        </ul>
      </div>
    </div>
  );
}
