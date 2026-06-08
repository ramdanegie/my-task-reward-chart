'use client';

import { useState } from 'react';
import { dummyChildren, dummyParentNotes, getWeeklyChartData, calculateWeeklyPoints, type FilterPeriod } from '@/data/dummy';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, Trash2, TrendingUp, AlertTriangle, Lightbulb, ChevronDown } from 'lucide-react';

export default function ParentReports() {
  const [activeChildId, setActiveChildId] = useState('child-1');
  const [period, setPeriod] = useState<FilterPeriod>('week');
  const [newNote, setNewNote] = useState('');

  const child = dummyChildren.find(c => c.id === activeChildId)!;
  const weeklyPoints = calculateWeeklyPoints(activeChildId, period);
  const target = child.weeklyPointTarget * (period === 'month' ? 4 : 1);
  const chartData = getWeeklyChartData(period).map(d => ({ ...d, selesai: Math.round(d.points / 3.5) }));

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analisis progress {child.name}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <select value={activeChildId} onChange={e => setActiveChildId(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#4285F4]">
              {dummyChildren.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
            <button onClick={() => setPeriod('week')} className={`px-3 py-2 ${period === 'week' ? 'bg-[#4285F4] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Minggu</button>
            <button onClick={() => setPeriod('month')} className={`px-3 py-2 ${period === 'month' ? 'bg-[#4285F4] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Bulan</button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[
          { label: `Poin ${period === 'week' ? 'Minggu' : 'Bulan'} Ini`, val: weeklyPoints.toLocaleString(), sub: `dari ${target} target`, pct: (weeklyPoints / target) * 100, color: '#4285F4' },
          { label: 'Tugas Selesai', val: period === 'week' ? '52' : '198', sub: `dari ${period === 'week' ? '56' : '224'} total`, pct: period === 'week' ? 93 : 88, color: '#34A853' },
          { label: 'Rata-rata Harian', val: String(Math.round(weeklyPoints / (period === 'week' ? 7 : 30))), sub: 'poin per hari', pct: null, color: '#FBBC04' },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className="text-3xl font-bold mb-1" style={{ color: c.color }}>{c.val}</p>
            <p className="text-xs text-gray-400">{c.sub}</p>
            {c.pct !== null && <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2"><div className="h-1.5 rounded-full" style={{ width: `${Math.min(c.pct, 100)}%`, background: c.color }} /></div>}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Grafik Progress {period === 'week' ? 'Mingguan' : 'Bulanan'}</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip /><Legend />
            <Bar dataKey="points" fill="#4285F4" name="Poin" radius={[4,4,0,0]} />
            <Bar dataKey="selesai" fill="#34A853" name="Tugas Selesai" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Best & Worst */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><TrendingUp size={15} className="text-[#34A853]" /> Paling Konsisten</h2>
          <div className="space-y-2">
            {[['Bangun pagi tanpa rewel', '6/7'], ['Gosok gigi', '7/7'], ['Bicara sopan', '6/7']].map(([t, s]) => (
              <div key={t} className="flex items-center justify-between p-3 bg-green-50 rounded-lg text-sm">
                <span className="text-gray-700">{t}</span>
                <span className="font-semibold text-[#34A853]">{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><AlertTriangle size={15} className="text-[#EA4335]" /> Sering Terlewat</h2>
          <div className="space-y-2">
            {[['Tidur tepat waktu', '3/7'], ['Belajar 15 menit', '5/7'], ['Membereskan mainan', '4/7']].map(([t, s]) => (
              <div key={t} className="flex items-center justify-between p-3 bg-red-50 rounded-lg text-sm">
                <span className="text-gray-700">{t}</span>
                <span className="font-semibold text-[#EA4335]">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><Calendar size={15} className="text-[#4285F4]" /> Catatan Harian</h2>
        <div className="mb-4">
          <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Tambahkan catatan hari ini..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4] resize-none" rows={2} />
          <button className="mt-2 text-sm font-medium bg-[#4285F4] text-white px-4 py-2 rounded-lg hover:bg-blue-600">Simpan</button>
        </div>
        <div className="space-y-2">
          {dummyParentNotes.map((note, i) => (
            <div key={i} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{new Date(note.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <p className="text-sm text-gray-800">{note.note}</p>
              </div>
              <button className="p-1.5 text-gray-400 hover:text-[#EA4335] rounded ml-2 shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 flex gap-3">
        <Lightbulb size={18} className="text-[#4285F4] shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1.5">Insight & Rekomendasi</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li><strong>Pagi:</strong> Konsisten bangun pagi dan menjaga kebersihan. Pertahankan!</li>
            <li><strong>Malam:</strong> Perhatian pada "tidur tepat waktu". Atur rutinitas 30 menit lebih awal.</li>
            <li><strong>Belajar:</strong> Target 71% tercapai. Buat jadwal belajar yang lebih menarik.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
