'use client';

import { useEffect, useState } from 'react';
import { useChildren, type ChildDTO } from '@/lib/hooks';
import { useActiveChild } from '@/context/ActiveChild';
import { apiSend } from '@/lib/api';
import { Plus, X, Check, Trash2, RefreshCw, KeyRound } from 'lucide-react';

const COLORS = ['bg-[#4285F4]', 'bg-[#34A853]', 'bg-[#EA4335]', 'bg-[#FBBC04]'];

export default function ParentChild() {
  const { data: children, mutate } = useChildren();
  const { activeChildId, setActiveChildId, refresh } = useActiveChild();
  const list = children ?? [];

  const [selId, setSelId] = useState<string | null>(null);
  const active = list.find((c) => c.id === (selId ?? activeChildId)) ?? list[0] ?? null;

  const [showAdd, setShowAdd] = useState(false);
  const [add, setAdd] = useState({ name: '', age: '7', avatar: '🧒', dailyPointTarget: '60', weeklyPointTarget: '350', seedDefaults: true });

  const [edit, setEdit] = useState({ name: '', age: '', dailyPointTarget: '', weeklyPointTarget: '' });
  useEffect(() => {
    if (active) setEdit({ name: active.name, age: String(active.age), dailyPointTarget: String(active.dailyPointTarget), weeklyPointTarget: String(active.weeklyPointTarget) });
  }, [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const reload = () => { mutate(); refresh(); };

  const addChild = async () => {
    if (!add.name.trim()) return;
    const child = await apiSend<ChildDTO>('/api/children', 'POST', {
      name: add.name.trim(), age: Number(add.age) || 7, avatar: add.avatar || '🧒',
      dailyPointTarget: Number(add.dailyPointTarget) || 60, weeklyPointTarget: Number(add.weeklyPointTarget) || 350,
      seedDefaults: add.seedDefaults,
    });
    setShowAdd(false);
    setAdd({ name: '', age: '7', avatar: '🧒', dailyPointTarget: '60', weeklyPointTarget: '350', seedDefaults: true });
    reload();
    setActiveChildId(child.id); setSelId(child.id);
  };

  const saveEdit = async () => {
    if (!active) return;
    await apiSend('/api/children/' + active.id, 'PATCH', {
      name: edit.name, age: Number(edit.age),
      dailyPointTarget: Number(edit.dailyPointTarget), weeklyPointTarget: Number(edit.weeklyPointTarget),
    });
    reload();
  };

  const del = async (id: string) => {
    if (!confirm('Hapus profil anak ini? Semua data terkait (tugas, poin, kantong) ikut terhapus.')) return;
    await apiSend('/api/children/' + id, 'DELETE');
    setSelId(null);
    reload();
  };

  const regen = async (id: string) => {
    await apiSend('/api/children/' + id + '/access-code', 'POST');
    reload();
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Anak</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola profil semua anak</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-[#4285F4] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600">
          <Plus size={16} /> Tambah Anak
        </button>
      </div>

      {/* Child selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {list.map((c, i) => (
          <button key={c.id} onClick={() => setSelId(c.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all shrink-0 ${
              active?.id === c.id ? 'border-[#4285F4] bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'
            }`}>
            <div className={`w-8 h-8 rounded-full ${COLORS[i % COLORS.length]} text-white flex items-center justify-center text-sm font-bold`}>
              {c.avatar || c.name[0]}
            </div>
            <span className={`text-sm font-medium ${active?.id === c.id ? 'text-[#4285F4]' : 'text-gray-700'}`}>{c.name}</span>
            {active?.id === c.id && <Check size={14} className="text-[#4285F4]" />}
          </button>
        ))}
        {list.length === 0 && <p className="text-sm text-gray-400 py-2">Belum ada anak. Klik "Tambah Anak".</p>}
      </div>

      {/* Add child modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Tambah Profil Anak</h2>
              <button onClick={() => setShowAdd(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 block mb-1">Nama Anak</label>
                  <input value={add.name} onChange={(e) => setAdd({ ...add, name: e.target.value })} placeholder="Nama anak"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Emoji</label>
                  <input value={add.avatar} onChange={(e) => setAdd({ ...add, avatar: e.target.value })} placeholder="🧒" maxLength={2}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Usia</label>
                  <input type="number" value={add.age} onChange={(e) => setAdd({ ...add, age: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Target/hari</label>
                  <input type="number" value={add.dailyPointTarget} onChange={(e) => setAdd({ ...add, dailyPointTarget: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Target/mgg</label>
                  <input type="number" value={add.weeklyPointTarget} onChange={(e) => setAdd({ ...add, weeklyPointTarget: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={add.seedDefaults} onChange={(e) => setAdd({ ...add, seedDefaults: e.target.checked })} />
                Pakai tugas &amp; reward default
              </label>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-lg">Batal</button>
                <button onClick={addChild} className="flex-1 py-2.5 bg-[#4285F4] text-white text-sm font-medium rounded-lg hover:bg-blue-600">Tambah</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit form for active child */}
      {active && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
            <div className={`w-16 h-16 rounded-2xl ${COLORS[list.indexOf(active) % COLORS.length]} flex items-center justify-center`}>
              <span className="text-white text-2xl font-bold">{active.avatar || active.name[0]}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{active.name}</h2>
              <p className="text-sm text-gray-500">{active.age} tahun</p>
            </div>
          </div>

          {/* Access code */}
          <div className="flex items-center justify-between mb-5 p-3 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-[#4285F4]" />
              <div>
                <p className="text-xs text-gray-500">Kode Mode Anak</p>
                <p className="text-lg font-bold tracking-widest text-[#4285F4]">{active.accessCode}</p>
              </div>
            </div>
            <button onClick={() => regen(active.id)} className="flex items-center gap-1.5 text-xs font-medium text-[#4285F4] hover:underline">
              <RefreshCw size={14} /> Ganti Kode
            </button>
          </div>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); saveEdit(); }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Anak</label>
              <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Usia</label>
                <input type="number" value={edit.age} onChange={(e) => setEdit({ ...edit, age: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Harian</label>
                <input type="number" value={edit.dailyPointTarget} onChange={(e) => setEdit({ ...edit, dailyPointTarget: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Poin Mingguan</label>
              <input type="number" value={edit.weeklyPointTarget} onChange={(e) => setEdit({ ...edit, weeklyPointTarget: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" className="flex-1 bg-[#4285F4] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-600">Simpan Perubahan</button>
              <button type="button" onClick={() => del(active.id)} className="flex items-center justify-center gap-1.5 px-4 border border-red-200 text-[#EA4335] py-2.5 rounded-lg text-sm hover:bg-red-50">
                <Trash2 size={15} /> Hapus
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary of all children */}
      {list.length > 0 && (
        <div className="mt-5 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Semua Anak ({list.length})</h3>
          <div className="space-y-2">
            {list.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${COLORS[i % COLORS.length]} text-white flex items-center justify-center text-xs font-bold`}>{c.avatar || c.name[0]}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.age} tahun · Target {c.dailyPointTarget} poin/hari · Kode {c.accessCode}</p>
                  </div>
                </div>
                <button onClick={() => setSelId(c.id)} className="text-xs text-[#4285F4] hover:underline font-medium">
                  {active?.id === c.id ? 'Aktif' : 'Pilih'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
