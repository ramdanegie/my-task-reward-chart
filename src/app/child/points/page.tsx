'use client';

import { useChildMe } from '@/lib/childHooks';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star, Gift } from 'lucide-react';

export default function ChildPoints() {
  const { data } = useChildMe();
  if (!data) return <p className="text-center text-gray-400 py-10">Memuat…</p>;

  const { weekPoints, weekSeries, child } = data;
  const target = child.weeklyPointTarget || 1;
  const pct = Math.min((weekPoints / target) * 100, 100);
  const maxPoint = Math.max(...weekSeries.map((d) => d.points), 1);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Poin Saya</h1>
        <p className="text-sm text-gray-500 mt-0.5">Progress poin mingguan</p>
      </div>

      <div className="bg-[#FBBC04] rounded-2xl p-6 mb-5 text-center shadow-md">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/30 mb-3">
          <Star size={24} className="text-white" />
        </div>
        <p className="text-sm text-white/80 mb-1">Poin Minggu Ini</p>
        <p className="text-5xl font-bold text-white mb-2">{weekPoints}</p>
        <p className="text-sm text-white/80 mb-3">dari {child.weeklyPointTarget} target</p>
        <div className="w-full bg-white/30 rounded-full h-3">
          <div className="bg-white h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-white/80 mt-2">
          {weekPoints >= child.weeklyPointTarget ? 'Target tercapai minggu ini!' : `Tinggal ${child.weeklyPointTarget - weekPoints} poin lagi!`}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Grafik Poin Mingguan</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weekSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="points" stroke="#4285F4" strokeWidth={2.5} dot={{ fill: '#4285F4', r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Perincian Harian</h2>
        <div className="space-y-2">
          {weekSeries.map((d) => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 w-10">{d.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                <div className="h-2.5 rounded-full bg-[#4285F4]" style={{ width: `${(d.points / maxPoint) * 100}%` }} />
              </div>
              <span className="text-sm font-bold text-[#4285F4] w-12 text-right">{d.points}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 flex gap-3">
        <Gift size={18} className="text-[#4285F4] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-1">Kumpulkan Poin untuk Reward</p>
          <p className="text-xs text-gray-600">Setiap tugas yang selesai memberi poin. Semakin banyak poin, semakin besar reward!</p>
        </div>
      </div>
    </div>
  );
}
