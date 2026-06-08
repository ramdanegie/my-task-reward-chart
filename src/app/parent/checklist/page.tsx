'use client';

import { useState } from 'react';
import { dummyChildren, getDummyDailyTaskLogs, getTaskById, calculateDailyPoints } from '@/data/dummy';
import { CheckCircle, Circle, Clock, Star, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ParentChecklist() {
  const [activeChildId, setActiveChildId] = useState('child-1');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState(() => getDummyDailyTaskLogs(selectedDate, activeChildId));

  const child = dummyChildren.find(c => c.id === activeChildId)!;
  const dailyPoints = calculateDailyPoints(logs);

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    const newDate = d.toISOString().split('T')[0];
    setSelectedDate(newDate);
    setLogs(getDummyDailyTaskLogs(newDate, activeChildId));
  };

  const switchChild = (id: string) => {
    setActiveChildId(id);
    setLogs(getDummyDailyTaskLogs(selectedDate, id));
  };

  const approve = (id: string) => setLogs(logs.map(l =>
    l.id === id ? { ...l, status: 'completed' as const, earnedPoint: getTaskById(l.taskId)?.point || 0 } : l
  ));
  const reject = (id: string) => setLogs(logs.map(l =>
    l.id === id ? { ...l, status: 'pending' as const, earnedPoint: 0 } : l
  ));

  const completed = logs.filter(l => l.status === 'completed');
  const waiting = logs.filter(l => l.status === 'waiting_approval');
  const pending = logs.filter(l => ['pending', 'in_progress'].includes(l.status));

  const displayDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Checklist Harian</h1>
        <p className="text-sm text-gray-500 mt-0.5">Pantau dan setujui tugas harian anak</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Child selector */}
        <div className="relative">
          <select value={activeChildId} onChange={e => switchChild(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#4285F4]">
            {dummyChildren.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Date navigator */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-50 text-gray-500"><ChevronLeft size={16} /></button>
          <input type="date" value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setLogs(getDummyDailyTaskLogs(e.target.value, activeChildId)); }}
            className="px-2 py-1.5 text-sm text-gray-700 focus:outline-none border-none bg-transparent" />
          <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-50 text-gray-500"><ChevronRight size={16} /></button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4">{displayDate} · {child.name}</p>

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
            {completed.map(log => {
              const task = getTaskById(log.taskId);
              return (
                <div key={log.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-[#34A853]">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle size={16} className="text-[#34A853] shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{task?.title}</p>
                      <p className="text-xs text-gray-400">Selesai {log.completedAt}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">+{log.earnedPoint} poin</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Waiting */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock size={15} className="text-[#FBBC04]" /> Menunggu Persetujuan ({waiting.length})
          </h2>
          <div className="space-y-2">
            {waiting.length === 0 && <p className="text-sm text-gray-400 text-center py-2">Tidak ada</p>}
            {waiting.map(log => {
              const task = getTaskById(log.taskId);
              return (
                <div key={log.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-[#FBBC04]">
                  <div className="flex items-center gap-2.5">
                    <Clock size={16} className="text-[#FBBC04] shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{task?.title}</p>
                      <p className="text-xs text-gray-400">{log.completedAt}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => approve(log.id)} className="px-3 py-1.5 bg-[#34A853] text-white text-xs font-medium rounded-lg hover:bg-green-600">Setujui</button>
                    <button onClick={() => reject(log.id)} className="px-3 py-1.5 bg-[#EA4335] text-white text-xs font-medium rounded-lg hover:bg-red-600">Tolak</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Circle size={15} className="text-[#4285F4]" /> Belum Dikerjakan ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map(log => {
              const task = getTaskById(log.taskId);
              return (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-gray-200">
                  <div className="flex items-center gap-2.5">
                    <Circle size={16} className="text-gray-300 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{task?.title}</p>
                      <p className="text-xs text-gray-400">{task?.point} poin</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-[#4285F4] text-white text-xs font-medium rounded-lg hover:bg-blue-600 flex items-center gap-1">
                    <Star size={12} /> Selesai
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
