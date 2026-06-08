'use client';

import { useState } from 'react';
import { dummyChildren, type Child } from '@/data/dummy';
import { Plus, Edit, User, Check, X } from 'lucide-react';

const COLORS = ['bg-[#4285F4]', 'bg-[#34A853]', 'bg-[#EA4335]', 'bg-[#FBBC04]'];

export default function ParentChild() {
  const [children, setChildren] = useState<Child[]>(dummyChildren);
  const [activeId, setActiveId] = useState('child-1');
  const [editId, setEditId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');

  const active = children.find(c => c.id === activeId) || children[0];

  const addChild = () => {
    if (!newName.trim()) return;
    const child: Child = {
      id: `child-${Date.now()}`, name: newName.trim(), age: parseInt(newAge) || 7,
      avatar: newName[0].toUpperCase(), dailyPointTarget: 60, weeklyPointTarget: 350, isActive: true,
    };
    setChildren([...children, child]);
    setActiveId(child.id);
    setShowAdd(false); setNewName(''); setNewAge('');
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
        {children.map((c, i) => (
          <button key={c.id} onClick={() => setActiveId(c.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all shrink-0 ${
              activeId === c.id ? 'border-[#4285F4] bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'
            }`}>
            <div className={`w-8 h-8 rounded-full ${COLORS[i % COLORS.length]} text-white flex items-center justify-center text-sm font-bold`}>
              {c.name[0]}
            </div>
            <span className={`text-sm font-medium ${activeId === c.id ? 'text-[#4285F4]' : 'text-gray-700'}`}>{c.name}</span>
            {activeId === c.id && <Check size={14} className="text-[#4285F4]" />}
          </button>
        ))}
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
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Nama Anak</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nama anak"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Usia</label>
                <input type="number" value={newAge} onChange={e => setNewAge(e.target.value)} placeholder="7"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-lg">Batal</button>
                <button onClick={addChild} className="flex-1 py-2.5 bg-[#4285F4] text-white text-sm font-medium rounded-lg hover:bg-blue-600">Tambah</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit form for active child */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
          <div className={`w-16 h-16 rounded-2xl ${COLORS[children.indexOf(active) % COLORS.length]} flex items-center justify-center`}>
            <span className="text-white text-2xl font-bold">{active.name[0]}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{active.name}</h2>
            <p className="text-sm text-gray-500">{active.age} tahun · ID: {active.id}</p>
          </div>
        </div>
        <form className="space-y-4" onSubmit={e => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Anak</label>
            <input type="text" defaultValue={active.name}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Usia</label>
              <input type="number" defaultValue={active.age}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Harian</label>
              <input type="number" defaultValue={active.dailyPointTarget}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Poin Mingguan</label>
            <input type="number" defaultValue={active.weeklyPointTarget}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="flex-1 bg-[#4285F4] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-600">Simpan Perubahan</button>
            <button type="button" className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">Batal</button>
          </div>
        </form>
      </div>

      {/* Summary of all children */}
      <div className="mt-5 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Semua Anak ({children.length})</h3>
        <div className="space-y-2">
          {children.map((c, i) => (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${COLORS[i % COLORS.length]} text-white flex items-center justify-center text-xs font-bold`}>{c.name[0]}</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.age} tahun · Target {c.dailyPointTarget} poin/hari</p>
                </div>
              </div>
              <button onClick={() => setActiveId(c.id)} className="text-xs text-[#4285F4] hover:underline font-medium">
                {activeId === c.id ? 'Aktif' : 'Pilih'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
