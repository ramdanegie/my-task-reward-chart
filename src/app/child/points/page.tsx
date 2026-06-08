'use client';

import { dummyChild, calculateWeeklyPoints } from '@/data/dummy';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star, Gift } from 'lucide-react';

const dailyData = [
  { day: 'Sen', poin: 240 }, { day: 'Sel', poin: 280 }, { day: 'Rab', poin: 250 },
  { day: 'Kam', poin: 300 }, { day: 'Jum', poin: 270 }, { day: 'Sab', poin: 310 },
  { day: 'Min', poin: 280 },
];

export default function ChildPoints() {
  const weeklyPoints = calculateWeeklyPoints();
  const pct = Math.min((weeklyPoints / dummyChild.weeklyPointTarget) * 100, 100);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Poin Saya</h1>
        <p className="text-sm text-gray-500 mt-0.5">Progress poin mingguan</p>
      </div>

      {/* Big stat */}
      <div className="bg-[#FBBC04] rounded-2xl p-6 mb-5 text-center shadow-md">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/30 mb-3">
          <Star size={24} className="text-white" />
        </div>
        <p className="text-sm text-white/80 mb-1">Poin Minggu Ini</p>
        <p className="text-5xl font-bold text-white mb-2">{weeklyPoints}</p>
        <p className="text-sm text-white/80 mb-3">dari {dummyChild.weeklyPointTarget} target</p>
        <div className="w-full bg-white/30 rounded-full h-3">
          <div className="bg-white h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-white/80 mt-2">
          {weeklyPoints >= dummyChild.weeklyPointTarget
            ? 'Target tercapai minggu ini!'
            : `Tinggal ${dummyChild.weeklyPointTarget - weeklyPoints} poin lagi!`}
        </p>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Grafik Poin Mingguan</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="poin" stroke="#4285F4" strokeWidth={2.5} dot={{ fill: '#4285F4', r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Daily breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Perincian Harian</h2>
        <div className="space-y-2">
          {dailyData.map(d => (
            <div key={d.day} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 w-10">{d.day}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                <div className="h-2.5 rounded-full bg-[#4285F4]" style={{ width: `${(d.poin / 350) * 100}%` }} />
              </div>
              <span className="text-sm font-bold text-[#4285F4] w-12 text-right">{d.poin}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
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
