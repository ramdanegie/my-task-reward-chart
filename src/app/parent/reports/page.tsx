'use client';

import { useState } from 'react';
import { dummyParentNotes } from '@/data/dummy';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, Trash2, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

const weeklyData = [
  { day: 'Sen', poin: 240, selesai: 87 }, { day: 'Sel', poin: 280, selesai: 100 },
  { day: 'Rab', poin: 250, selesai: 75 }, { day: 'Kam', poin: 300, selesai: 100 },
  { day: 'Jum', poin: 270, selesai: 86 }, { day: 'Sab', poin: 310, selesai: 100 },
  { day: 'Min', poin: 280, selesai: 88 },
];

export default function ParentReports() {
  const [newNote, setNewNote] = useState('');

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Laporan Mingguan</h1>
        <p className="text-sm text-gray-500 mt-0.5">Analisis progress dan kebiasaan anak minggu ini</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Poin Minggu Ini', val: '1.930', sub: 'dari 2.450 target', pct: 79, color: '#4285F4' },
          { label: 'Tugas Selesai', val: '52', sub: 'dari 56 total tugas', pct: 93, color: '#34A853' },
          { label: 'Rata-rata Harian', val: '276', sub: 'poin per hari', pct: null, color: '#FBBC04' },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className="text-3xl font-bold mb-1" style={{ color: c.color }}>{c.val}</p>
            <p className="text-xs text-gray-400">{c.sub}</p>
            {c.pct && (
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                <div className="h-1.5 rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Grafik Progress Harian</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="poin" fill="#4285F4" name="Poin" radius={[4, 4, 0, 0]} />
            <Bar dataKey="selesai" fill="#34A853" name="Penyelesaian %" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Best & Worst */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp size={15} className="text-[#34A853]" /> Paling Konsisten
          </h2>
          <div className="space-y-2">
            {[['Bangun pagi tanpa rewel', '6/7'], ['Gosok gigi pagi dan malam', '7/7'], ['Bicara sopan', '6/7']].map(([t, s]) => (
              <div key={t} className="flex items-center justify-between p-3 bg-green-50 rounded-lg text-sm">
                <span className="text-gray-700">{t}</span>
                <span className="font-semibold text-[#34A853]">{s} hari</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={15} className="text-[#EA4335]" /> Sering Terlewat
          </h2>
          <div className="space-y-2">
            {[['Tidur tepat waktu', '3/7'], ['Belajar/membaca 15 menit', '5/7'], ['Membereskan mainan', '4/7']].map(([t, s]) => (
              <div key={t} className="flex items-center justify-between p-3 bg-red-50 rounded-lg text-sm">
                <span className="text-gray-700">{t}</span>
                <span className="font-semibold text-[#EA4335]">{s} hari</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Parent notes */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Calendar size={15} className="text-[#4285F4]" /> Catatan Harian Minggu Ini
        </h2>
        <div className="mb-4">
          <textarea value={newNote} onChange={e => setNewNote(e.target.value)}
            placeholder="Tambahkan catatan hari ini..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4] resize-none" rows={3} />
          <button className="mt-2 text-sm font-medium bg-[#4285F4] text-white px-4 py-2 rounded-lg hover:bg-blue-600">Simpan Catatan</button>
        </div>
        <div className="space-y-2">
          {dummyParentNotes.map((note, i) => (
            <div key={i} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p className="text-xs text-gray-400 mb-1">{new Date(note.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-sm text-gray-800">{note.note}</p>
              </div>
              <button className="p-1.5 text-gray-400 hover:text-[#EA4335] rounded ml-3 shrink-0"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-5 flex gap-3">
        <Lightbulb size={18} className="text-[#4285F4] shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Insight & Rekomendasi</h3>
          <ul className="text-xs text-gray-600 space-y-1.5">
            <li><strong>Pagi:</strong> Konsisten bangun pagi dan menjaga kebersihan diri. Pertahankan!</li>
            <li><strong>Malam:</strong> Perlu perhatian pada "tidur tepat waktu". Coba atur rutinitas 30 menit lebih awal.</li>
            <li><strong>Belajar:</strong> Target belajar sudah 71% tercapai. Buat jadwal belajar yang lebih menarik.</li>
            <li><strong>Minggu Depan:</strong> Fokus pada 2-3 tugas yang sering terlewat dan beri motivasi ekstra.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
