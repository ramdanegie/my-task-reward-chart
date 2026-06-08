'use client';

import { useState } from 'react';
import { dummyTasks } from '@/data/dummy';
import { Plus, Edit, Trash2, Eye, EyeOff, X } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  pagi: 'Pagi', kebersihan: 'Kebersihan', kemandirian: 'Kemandirian',
  rumah: 'Rumah Tangga', belajar: 'Belajar', sikap: 'Sikap/Perilaku', malam: 'Malam',
};

const GOOGLE = { blue: '#4285F4', red: '#EA4335', yellow: '#FBBC04', green: '#34A853' };

export default function ParentTasks() {
  const [tasks, setTasks] = useState(dummyTasks);
  const [showForm, setShowForm] = useState(false);

  const toggleTaskStatus = (id: string) =>
    setTasks(tasks.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));

  const grouped = tasks.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, typeof tasks>);

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Tugas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola daftar tugas harian anak</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#4285F4] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          <Plus size={16} /> Tugas Baru
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Tambah Tugas Baru</h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form className="space-y-3">
              <input type="text" placeholder="Nama tugas" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
              <textarea placeholder="Deskripsi" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4] resize-none" rows={2} />
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]">
                <option value="">Pilih kategori</option>
                {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input type="number" placeholder="Poin" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50">Batal</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#4285F4] text-white text-sm font-medium rounded-lg hover:bg-blue-600">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tasks by category */}
      <div className="space-y-5">
        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, catTasks]) => (
          <div key={cat} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{categoryLabels[cat]}</h2>
            <div className="space-y-2">
              {catTasks.map(task => (
                <div key={task.id} className={`p-3.5 rounded-lg border transition-all ${task.isActive ? 'border-blue-100 bg-blue-50/40' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-800">{task.title}</h3>
                        {task.requiresApproval && (
                          <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded shrink-0">Approval</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                    </div>
                    <span className="text-sm font-bold px-2.5 py-1 rounded-lg bg-[#4285F4] text-white shrink-0">{task.point} poin</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <button onClick={() => toggleTaskStatus(task.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400" title={task.isActive ? 'Nonaktifkan' : 'Aktifkan'}>
                      {task.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400"><Edit size={15} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-[#EA4335]"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Template hint */}
      <div className="mt-5 bg-blue-50 rounded-xl border border-blue-100 p-4 flex items-start gap-3">
        <div className="w-1 h-full bg-[#4285F4] rounded-full self-stretch shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-800 mb-1">Template Default Tersedia</p>
          <p className="text-xs text-gray-600 mb-3">Gunakan template tugas default untuk anak usia 7 tahun. Bisa disesuaikan sesuai kebutuhan.</p>
          <button className="text-xs font-medium bg-[#4285F4] text-white px-3 py-1.5 rounded-lg hover:bg-blue-600">Gunakan Template</button>
        </div>
      </div>
    </div>
  );
}
