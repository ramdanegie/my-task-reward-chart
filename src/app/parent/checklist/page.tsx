'use client';

import { useState } from 'react';
import { useActiveChild } from '@/context/ActiveChild';
import { useTasks, useLogs } from '@/lib/hooks';
import { apiSend } from '@/lib/api';
import { toDateStr } from '@/lib/dates';
import { CheckCircle, Circle, Clock, Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Task { id: string; title: string; point: number; isActive: boolean }
interface Log { id: string; taskId: string; status: string; earnedPoint: number; completedAt?: string | null }

export default function ParentChecklist() {
  const { activeChild, activeChildId, isLoading } = useActiveChild();
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));

  const { data: tasks } = useTasks(activeChildId ?? undefined) as { data?: Task[] };
  const { data: logs, mutate } = useLogs(activeChildId ?? undefined, selectedDate) as { data?: Log[]; mutate: () => void };

  if (!isLoading && !activeChildId) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-2">Belum ada anak.</p>
        <a href="/parent/child" className="text-[#4285F4] font-medium hover:underline">Tambah anak dulu →</a>
      </div>
    );
  }

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + offset);
    setSelectedDate(toDateStr(d));
  };

  const activeTasks = (tasks ?? []).filter((t) => t.isActive);
  const taskMap = new Map(activeTasks.map((t) => [t.id, t]));
  const logByTask = new Map((logs ?? []).map((l) => [l.taskId, l]));

  const completed = (logs ?? []).filter((l) => l.status === 'completed' && taskMap.has(l.taskId));
  const waiting = (logs ?? []).filter((l) => l.status === 'waiting_approval' && taskMap.has(l.taskId));
  const pending = activeTasks.filter((t) => {
    const s = logByTask.get(t.id)?.status;
    return s !== 'completed' && s !== 'waiting_approval';
  });
  const dailyPoints = completed.reduce((s, l) => s + l.earnedPoint, 0);

  const act = async (logId: string, action: 'approve' | 'reject') => {
    await apiSend('/api/logs/' + logId, 'PATCH', { action }); mutate();
  };
  const markDone = async (taskId: string) => {
    await apiSend('/api/children/' + activeChildId + '/logs', 'POST', { taskId, date: selectedDate, done: true }); mutate();
  };

  const displayDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Checklist Harian</h1>
        <p className="text-sm text-gray-500 mt-0.5">Pantau dan setujui tugas harian anak</p>
      </div>

      {/* Date navigator */}
      <div className="flex flex-wrap gap-3 mb-3">
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-50 text-gray-500"><ChevronLeft size={16} /></button>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2 py-1.5 text-sm text-gray-700 focus:outline-none border-none bg-transparent" />
          <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-50 text-gray-500"><ChevronRight size={16} /></button>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-4">{displayDate} · {activeChild?.name}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Selesai', val: completed.length, color: '#34A853', bg: 'bg-green-50' },
          { label: 'Pending', val: pending.length, color: '#4285F4', bg: 'bg-blue-50' },
          { label: 'Menunggu Approval', val: waiting.length, color: '#FBBC04', bg: 'bg-yellow-50' },
          { label: 'Poin', val: dailyPoints, color: '#EA4335', bg: 'bg-red-50' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-4 border border-gray-100`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {/* Completed */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <CheckCircle size={15} className="text-[#34A853]" /> Selesai ({completed.length})
          </h2>
          <div className="space-y-2">
            {completed.length === 0 && <p className="text-sm text-gray-400 text-center py-2">Belum ada</p>}
            {completed.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-[#34A853]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={16} className="text-[#34A853] shrink-0" />
                  <p className="text-sm font-medium text-gray-800">{taskMap.get(log.taskId)?.title}</p>
                </div>
                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">+{log.earnedPoint} poin</span>
              </div>
            ))}
          </div>
        </div>

        {/* Waiting */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock size={15} className="text-[#FBBC04]" /> Menunggu Persetujuan ({waiting.length})
          </h2>
          <div className="space-y-2">
            {waiting.length === 0 && <p className="text-sm text-gray-400 text-center py-2">Tidak ada</p>}
            {waiting.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-[#FBBC04]">
                <div className="flex items-center gap-2.5">
                  <Clock size={16} className="text-[#FBBC04] shrink-0" />
                  <p className="text-sm font-medium text-gray-800">{taskMap.get(log.taskId)?.title}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => act(log.id, 'approve')} className="px-3 py-1.5 bg-[#34A853] text-white text-xs font-medium rounded-lg hover:bg-green-600">Setujui</button>
                  <button onClick={() => act(log.id, 'reject')} className="px-3 py-1.5 bg-[#EA4335] text-white text-xs font-medium rounded-lg hover:bg-red-600">Tolak</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Circle size={15} className="text-[#4285F4]" /> Belum Dikerjakan ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.length === 0 && <p className="text-sm text-gray-400 text-center py-2">Semua tugas sudah dikerjakan</p>}
            {pending.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-gray-200">
                <div className="flex items-center gap-2.5">
                  <Circle size={16} className="text-gray-300 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{task.title}</p>
                    <p className="text-xs text-gray-400">{task.point} poin</p>
                  </div>
                </div>
                <button onClick={() => markDone(task.id)} className="px-3 py-1.5 bg-[#4285F4] text-white text-xs font-medium rounded-lg hover:bg-blue-600 flex items-center gap-1">
                  <Star size={12} /> Selesai
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
