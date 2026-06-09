'use client';

import { useState } from 'react';
import { useActiveChild } from '@/context/ActiveChild';
import { useSummary, useNotes } from '@/lib/hooks';
import { apiSend } from '@/lib/api';
import { toDateStr } from '@/lib/dates';
import RangeFilter from '@/components/RangeFilter';
import type { RangeType } from '@/domain/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Trash2, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

interface Note { id: string; noteDate: string; note: string }

export default function ParentReports() {
  const { activeChild, activeChildId, isLoading } = useActiveChild();
  const [range, setRange] = useState<RangeType>('week');
  const [date, setDate] = useState(toDateStr(new Date()));
  const [newNote, setNewNote] = useState('');

  const { data: sum } = useSummary(activeChildId ?? undefined, range, date);
  const { data: notes, mutate: mutateNotes } = useNotes(activeChildId ?? undefined) as { data?: Note[]; mutate: () => void };

  if (!isLoading && !activeChildId) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-2">Belum ada anak.</p>
        <a href="/parent/child" className="text-[#4285F4] font-medium hover:underline">Tambah anak dulu →</a>
      </div>
    );
  }

  const summary = sum?.summary;
  const totalPoints = summary?.totalPoints ?? 0;
  const weeklyTarget = activeChild?.weeklyPointTarget ?? 0;
  const target = weeklyTarget * (range === 'month' ? 4 : 1);
  const series = summary?.series ?? [];
  const days = series.length || (range === 'week' ? 7 : 30);
  const completedCount = summary?.completedCount ?? 0;
  const totalInstances = summary?.totalTaskInstances ?? 0;

  const addNote = async () => {
    if (!newNote.trim()) return;
    await apiSend('/api/children/' + activeChildId + '/notes', 'POST', { noteDate: toDateStr(new Date()), note: newNote.trim() });
    setNewNote(''); mutateNotes();
  };
  const delNote = async (id: string) => { await apiSend('/api/notes/' + id, 'DELETE'); mutateNotes(); };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analisis progress {activeChild?.name}</p>
        </div>
        <RangeFilter range={range} date={date} onRangeChange={setRange} onDateChange={setDate} />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[
          { label: `Poin ${range === 'week' ? 'Minggu' : 'Bulan'} Ini`, val: totalPoints.toLocaleString('id-ID'), sub: `dari ${target} target`, pct: target ? (totalPoints / target) * 100 : 0, color: '#4285F4' },
          { label: 'Tugas Selesai', val: String(completedCount), sub: `dari ${totalInstances} tercatat`, pct: totalInstances ? (completedCount / totalInstances) * 100 : 0, color: '#34A853' },
          { label: 'Rata-rata Harian', val: String(Math.round(totalPoints / Math.max(days, 1))), sub: 'poin per hari', pct: null, color: '#FBBC04' },
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
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Grafik Progress {range === 'week' ? 'Mingguan' : 'Bulanan'}</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="points" fill="#4285F4" name="Poin" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Best & Worst */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><TrendingUp size={15} className="text-[#34A853]" /> Paling Konsisten</h2>
          <div className="space-y-2">
            {(summary?.topTasks ?? []).length === 0 && <p className="text-sm text-gray-400 text-center py-2">Belum ada data</p>}
            {(summary?.topTasks ?? []).map((t) => (
              <div key={t.taskId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg text-sm">
                <span className="text-gray-700">{t.title}</span>
                <span className="font-semibold text-[#34A853]">{t.completed}× selesai</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><AlertTriangle size={15} className="text-[#EA4335]" /> Sering Terlewat</h2>
          <div className="space-y-2">
            {(summary?.missedTasks ?? []).length === 0 && <p className="text-sm text-gray-400 text-center py-2">Tidak ada</p>}
            {(summary?.missedTasks ?? []).map((t) => (
              <div key={t.taskId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg text-sm">
                <span className="text-gray-700">{t.title}</span>
                <span className="font-semibold text-[#EA4335]">{t.missed}× terlewat</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><Calendar size={15} className="text-[#4285F4]" /> Catatan Harian</h2>
        <div className="mb-4">
          <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Tambahkan catatan hari ini..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4] resize-none" rows={2} />
          <button onClick={addNote} className="mt-2 text-sm font-medium bg-[#4285F4] text-white px-4 py-2 rounded-lg hover:bg-blue-600">Simpan</button>
        </div>
        <div className="space-y-2">
          {(notes ?? []).length === 0 && <p className="text-sm text-gray-400 text-center py-2">Belum ada catatan</p>}
          {(notes ?? []).map((note) => (
            <div key={note.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{new Date(note.noteDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <p className="text-sm text-gray-800">{note.note}</p>
              </div>
              <button onClick={() => delNote(note.id)} className="p-1.5 text-gray-400 hover:text-[#EA4335] rounded ml-2 shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 flex gap-3">
        <Lightbulb size={18} className="text-[#4285F4] shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1.5">Insight</h3>
          <p className="text-xs text-gray-600">
            {totalPoints >= target && target > 0
              ? 'Target tercapai! Pertahankan kebiasaan baik ini.'
              : `Tinggal ${Math.max(target - totalPoints, 0)} poin lagi untuk mencapai target ${range === 'week' ? 'minggu' : 'bulan'} ini.`}
          </p>
        </div>
      </div>
    </div>
  );
}
