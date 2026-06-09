'use client';

import { useState } from 'react';
import { useActiveChild } from '@/context/ActiveChild';
import { useTasks } from '@/lib/hooks';
import { apiSend } from '@/lib/api';
import { Plus, Edit, Trash2, Eye, EyeOff, X } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  pagi: 'Pagi', kebersihan: 'Kebersihan', kemandirian: 'Kemandirian',
  rumah: 'Rumah Tangga', belajar: 'Belajar', sikap: 'Sikap/Perilaku', malam: 'Malam',
};

interface Task {
  id: string; title: string; description: string; category: string;
  point: number; requiresApproval: boolean; isActive: boolean;
}

const emptyForm = { title: '', description: '', category: 'pagi', point: '5', requiresApproval: false };

export default function ParentTasks() {
  const { activeChildId, isLoading } = useActiveChild();
  const { data: tasks, mutate } = useTasks(activeChildId ?? undefined) as { data?: Task[]; mutate: () => void };
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  if (!isLoading && !activeChildId) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-2">Belum ada anak.</p>
        <a href="/parent/child" className="text-[#4285F4] font-medium hover:underline">Tambah anak dulu →</a>
      </div>
    );
  }

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (t: Task) => {
    setEditId(t.id);
    setForm({ title: t.title, description: t.description ?? '', category: t.category, point: String(t.point), requiresApproval: t.requiresApproval });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = {
      title: form.title.trim(), description: form.description, category: form.category,
      point: Number(form.point) || 0, requiresApproval: form.requiresApproval,
    };
    if (editId) await apiSend('/api/tasks/' + editId, 'PATCH', payload);
    else await apiSend('/api/children/' + activeChildId + '/tasks', 'POST', payload);
    setShowForm(false); mutate();
  };

  const toggle = async (t: Task) => { await apiSend('/api/tasks/' + t.id, 'PATCH', { isActive: !t.isActive }); mutate(); };
  const del = async (id: string) => { if (!confirm('Hapus tugas ini?')) return; await apiSend('/api/tasks/' + id, 'DELETE'); mutate(); };

  const grouped = (tasks ?? []).reduce((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Tugas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola daftar tugas harian anak</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#4285F4] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
          <Plus size={16} /> Tugas Baru
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Tugas' : 'Tambah Tugas Baru'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form className="space-y-3" onSubmit={submit}>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nama tugas"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi" rows={2}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4] resize-none" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]">
                {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input type="number" value={form.point} onChange={(e) => setForm({ ...form, point: e.target.value })} placeholder="Poin"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.requiresApproval} onChange={(e) => setForm({ ...form, requiresApproval: e.target.checked })} />
                Perlu persetujuan orang tua
              </label>
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
        {Object.keys(grouped).length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">Belum ada tugas. Tambahkan tugas baru.</p>
        )}
        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, catTasks]) => (
          <div key={cat} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{categoryLabels[cat] ?? cat}</h2>
            <div className="space-y-2">
              {catTasks.map((task) => (
                <div key={task.id} className={`p-3.5 rounded-lg border transition-all ${task.isActive ? 'border-blue-100 bg-blue-50/40' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-800">{task.title}</h3>
                        {task.requiresApproval && (
                          <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded shrink-0">Approval</span>
                        )}
                      </div>
                      {task.description && <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>}
                    </div>
                    <span className="text-sm font-bold px-2.5 py-1 rounded-lg bg-[#4285F4] text-white shrink-0">{task.point} poin</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <button onClick={() => toggle(task)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400" title={task.isActive ? 'Nonaktifkan' : 'Aktifkan'}>
                      {task.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400"><Edit size={15} /></button>
                    <button onClick={() => del(task.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-[#EA4335]"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
