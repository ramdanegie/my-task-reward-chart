'use client';

import { useState } from 'react';
import { useActiveChild } from '@/context/ActiveChild';
import { useSummary, useLogs, useTasks, useRewards } from '@/lib/hooks';
import { apiSend } from '@/lib/api';
import { toDateStr } from '@/lib/dates';
import RangeFilter from '@/components/RangeFilter';
import type { RangeType } from '@/domain/types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { CheckCircle, Clock, TrendingUp, AlertCircle, Target, Trophy } from 'lucide-react';

const GOOGLE = { blue: '#4285F4', red: '#EA4335', yellow: '#FBBC04', green: '#34A853' };
const PIE_COLORS = [GOOGLE.blue, GOOGLE.red, GOOGLE.yellow, GOOGLE.green, '#1a73e8', '#d93025', '#f9ab00'];
const catLabels: Record<string, string> = {
  pagi: 'Pagi', kebersihan: 'Kebersihan', kemandirian: 'Kemandirian',
  rumah: 'Rumah', belajar: 'Belajar', sikap: 'Sikap', malam: 'Malam',
};

interface Task { id: string; title: string; category: string; point: number }
interface Log { id: string; taskId: string; status: string; earnedPoint: number; completedAt?: string | null }
interface Reward { id: string; title: string; requiredPoint: number }

export default function ParentDashboard() {
  const { activeChild, activeChildId, isLoading } = useActiveChild();
  const [range, setRange] = useState<RangeType>('week');
  const [date, setDate] = useState(toDateStr(new Date()));
  const today = toDateStr(new Date());

  const { data: sum } = useSummary(activeChildId ?? undefined, range, date);
  const { data: tasks } = useTasks(activeChildId ?? undefined) as { data?: Task[] };
  const { data: logs, mutate: mutateLogs } = useLogs(activeChildId ?? undefined, today) as { data?: Log[]; mutate: () => void };
  const { data: rewards } = useRewards(activeChildId ?? undefined) as { data?: Reward[] };

  if (!isLoading && !activeChildId) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-2">Belum ada anak.</p>
        <a href="/parent/child" className="text-[#4285F4] font-medium hover:underline">Tambah anak di menu Anak →</a>
      </div>
    );
  }

  const taskMap = new Map((tasks ?? []).map((t) => [t.id, t]));
  const todayLogs = logs ?? [];
  const dailyPoints = todayLogs.filter((l) => l.status === 'completed').reduce((s, l) => s + l.earnedPoint, 0);
  const completedToday = todayLogs.filter((l) => l.status === 'completed');
  const waitingApproval = todayLogs.filter((l) => l.status === 'waiting_approval');

  const summary = sum?.summary;
  const periodPoints = summary?.totalPoints ?? 0;
  const dailyTarget = activeChild?.dailyPointTarget ?? 0;
  const weeklyTarget = activeChild?.weeklyPointTarget ?? 0;
  const periodTarget = range === 'week' ? weeklyTarget : weeklyTarget * 4;
  const chartData = summary?.series ?? [];
  const catData = (summary?.categoryBreakdown ?? []).map((c) => ({ name: catLabels[c.name] ?? c.name, value: c.value }));

  const act = async (logId: string, action: 'approve' | 'reject') => {
    await apiSend('/api/logs/' + logId, 'PATCH', { action });
    mutateLogs();
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header with range filter */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Progress {activeChild?.name}{activeChild ? `, ${activeChild.age} tahun` : ''}
          </p>
        </div>
        <RangeFilter range={range} date={date} onRangeChange={setRange} onDateChange={setDate} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Poin Hari Ini', val: `${dailyPoints}/${dailyTarget}`, icon: <Target size={18} />, color: GOOGLE.blue, pct: dailyTarget ? (dailyPoints / dailyTarget) * 100 : 0 },
          { label: range === 'week' ? 'Poin Minggu Ini' : 'Poin Bulan Ini', val: `${periodPoints}/${periodTarget}`, icon: <TrendingUp size={18} />, color: GOOGLE.green, pct: periodTarget ? (periodPoints / periodTarget) * 100 : 0 },
          { label: 'Selesai Hari Ini', val: `${completedToday.length}/${todayLogs.length || 0}`, icon: <CheckCircle size={18} />, color: GOOGLE.yellow, pct: todayLogs.length ? (completedToday.length / todayLogs.length) * 100 : 0 },
          { label: 'Perlu Approval', val: `${waitingApproval.length}`, icon: <AlertCircle size={18} />, color: GOOGLE.red, pct: null },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: c.color }}>{c.icon}</span>
              <p className="text-xs text-gray-500 leading-tight">{c.label}</p>
            </div>
            <p className="text-xl font-bold" style={{ color: c.color }}>{c.val}</p>
            {c.pct !== null && (
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div className="h-1.5 rounded-full" style={{ width: `${Math.min(c.pct, 100)}%`, background: c.color }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Progress {range === 'week' ? 'Mingguan' : 'Bulanan'}
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="points" stroke={GOOGLE.blue} strokeWidth={2.5} dot={{ fill: GOOGLE.blue, r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Kategori Tugas</h2>
          {catData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Belum ada data</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={(e) => e.name} labelLine={false}>
                  {catData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Task lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <CheckCircle size={15} style={{ color: GOOGLE.green }} /> Selesai Hari Ini
          </h2>
          <div className="space-y-2">
            {completedToday.length === 0 && <p className="text-sm text-gray-400 text-center py-3">Belum ada tugas selesai</p>}
            {completedToday.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">{taskMap.get(log.taskId)?.title ?? 'Tugas'}</p>
                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">+{log.earnedPoint}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock size={15} style={{ color: GOOGLE.yellow }} /> Menunggu Persetujuan
          </h2>
          <div className="space-y-2">
            {waitingApproval.length === 0 && <p className="text-sm text-gray-400 text-center py-3">Tidak ada</p>}
            {waitingApproval.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">{taskMap.get(log.taskId)?.title ?? 'Tugas'}</p>
                <div className="flex gap-1.5">
                  <button onClick={() => act(log.id, 'approve')} className="w-7 h-7 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600">✓</button>
                  <button onClick={() => act(log.id, 'reject')} className="w-7 h-7 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rewards */}
      {(rewards?.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Trophy size={15} style={{ color: GOOGLE.yellow }} /> Reward yang Akan Dicapai
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {(rewards ?? []).map((reward) => {
              const pct = Math.min((periodPoints / reward.requiredPoint) * 100, 100);
              const done = periodPoints >= reward.requiredPoint;
              return (
                <div key={reward.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs font-medium text-gray-700 mb-2 leading-tight">{reward.title}</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: done ? GOOGLE.green : GOOGLE.blue }} />
                  </div>
                  <p className="text-xs" style={{ color: done ? GOOGLE.green : '#6b7280' }}>
                    {done ? 'Siap diklaim!' : `${reward.requiredPoint - periodPoints} lagi`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
