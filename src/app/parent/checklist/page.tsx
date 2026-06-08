'use client';

import { useState } from 'react';
import { getDummyDailyTaskLogs, getTaskById, calculateDailyPoints } from '@/data/dummy';
import { CheckCircle, Circle, Clock, Star } from 'lucide-react';

export default function ParentChecklist() {
  const today = new Date().toISOString().split('T')[0];
  const [logs, setLogs] = useState(getDummyDailyTaskLogs(today));
  const dailyPoints = calculateDailyPoints(logs);

  const approve = (id: string) => setLogs(logs.map(l =>
    l.id === id ? { ...l, status: 'completed' as const, earnedPoint: getTaskById(l.taskId)?.point || 0 } : l
  ));
  const reject = (id: string) => setLogs(logs.map(l =>
    l.id === id ? { ...l, status: 'pending' as const, earnedPoint: 0 } : l
  ));

  const completed = logs.filter(l => l.status === 'completed');
  const waiting = logs.filter(l => l.status === 'waiting_approval');
  const pending = logs.filter(l => ['pending', 'in_progress'].includes(l.status));

  const stats = [
    { label: 'Selesai', val: completed.length, color: '#34A853', bg: 'bg-green-50' },
    { label: 'Pending', val: pending.length, color: '#4285F4', bg: 'bg-blue-50' },
    { label: 'Menunggu Approval', val: waiting.length, color: '#FBBC04', bg: 'bg-yellow-50' },
    { label: 'Poin Hari Ini', val: dailyPoints, color: '#EA4335', bg: 'bg-red-50' },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Checklist Harian</h1>
        <p className="text-sm text-gray-500 mt-0.5">Pantau dan setujui tugas harian anak</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-4 border border-gray-100`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {/* Completed */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <CheckCircle size={15} className="text-[#34A853]" /> Tugas Selesai ({completed.length})
          </h2>
          <div className="space-y-2">
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
            {waiting.length === 0 && <p className="text-sm text-gray-400 text-center py-3">Tidak ada tugas menunggu</p>}
            {waiting.map(log => {
              const task = getTaskById(log.taskId);
              return (
                <div key={log.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-[#FBBC04]">
                  <div className="flex items-center gap-2.5">
                    <Clock size={16} className="text-[#FBBC04] shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{task?.title}</p>
                      <p className="text-xs text-gray-400">Dikerjakan {log.completedAt}</p>
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
                    <Star size={12} /> Tandai Selesai
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
