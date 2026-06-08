'use client';

import { useState } from 'react';
import { dummyChild, dummyTasks, getDummyDailyTaskLogs, getTaskById, calculateDailyPoints } from '@/data/dummy';
import { CheckCircle, Circle, Clock, Zap } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  pagi: 'Pagi', kebersihan: 'Kebersihan', kemandirian: 'Kemandirian',
  rumah: 'Rumah', belajar: 'Belajar', sikap: 'Sikap', malam: 'Malam',
};

export default function ChildDashboard() {
  const today = new Date().toISOString().split('T')[0];
  const [logs, setLogs] = useState(getDummyDailyTaskLogs(today));
  const dailyPoints = calculateDailyPoints(logs);

  const toggleTask = (logId: string) => {
    setLogs(logs.map(log => {
      if (log.id !== logId) return log;
      const task = getTaskById(log.taskId);
      const isDone = log.status === 'completed';
      return {
        ...log,
        status: isDone ? 'pending' : task?.requiresApproval ? 'waiting_approval' : 'completed',
        earnedPoint: isDone ? 0 : task?.point || 0,
        completedAt: isDone ? undefined : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      } as typeof log;
    }));
  };

  const completed = logs.filter(l => l.status === 'completed').length;
  const pct = Math.min((dailyPoints / dummyChild.dailyPointTarget) * 100, 100);

  const grouped = logs.reduce((acc, log) => {
    const task = getTaskById(log.taskId);
    if (task) {
      if (!acc[task.category]) acc[task.category] = [];
      acc[task.category].push({ ...log, task });
    }
    return acc;
  }, {} as Record<string, Array<{ task: typeof dummyTasks[0] } & typeof logs[0]>>);

  return (
    <div>
      {/* Greeting */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Halo, {dummyChild.name}!</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ayo selesaikan tugas hari ini</p>
      </div>

      {/* Progress card */}
      <div className="bg-[#4285F4] text-white rounded-2xl p-5 mb-5 shadow-md">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium opacity-80">Poin Hari Ini</p>
          <div className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-full">
            <Zap size={12} />
            <span className="text-xs font-semibold">{completed} selesai</span>
          </div>
        </div>
        <p className="text-4xl font-bold mb-1">{dailyPoints}</p>
        <p className="text-xs opacity-70 mb-3">dari {dummyChild.dailyPointTarget} poin target</p>
        <div className="w-full bg-white/30 rounded-full h-3">
          <div className="bg-white h-3 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Motivation */}
      {dailyPoints >= dummyChild.dailyPointTarget ? (
        <div className="bg-[#34A853] text-white rounded-xl p-4 mb-5 text-center">
          <p className="font-bold">Target tercapai! Kamu luar biasa hari ini!</p>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-5 text-center">
          <p className="text-sm text-amber-700 font-medium">Tinggal {dummyChild.dailyPointTarget - dailyPoints} poin lagi untuk mencapai target!</p>
        </div>
      )}

      {/* Tasks */}
      <div className="space-y-5">
        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, tasks]) => (
          <div key={cat}>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{categoryLabels[cat]}</h2>
            <div className="space-y-2">
              {tasks.map(item => {
                const isDone = item.status === 'completed';
                const isWaiting = item.status === 'waiting_approval';
                return (
                  <button key={item.id} onClick={() => toggleTask(item.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all active:scale-98 text-left ${
                      isDone ? 'bg-green-50 border-[#34A853]' :
                      isWaiting ? 'bg-yellow-50 border-[#FBBC04]' :
                      'bg-white border-gray-100 hover:border-[#4285F4]'
                    }`}
                  >
                    <div className="shrink-0">
                      {isDone ? <CheckCircle size={24} className="text-[#34A853]" /> :
                       isWaiting ? <Clock size={24} className="text-[#FBBC04]" /> :
                       <Circle size={24} className="text-gray-200" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${isDone ? 'text-[#34A853]' : isWaiting ? 'text-yellow-700' : 'text-gray-800'}`}>
                        {item.task.title}
                      </p>
                      {isWaiting && <p className="text-xs text-yellow-600 mt-0.5">Menunggu persetujuan orang tua</p>}
                      {isDone && <p className="text-xs text-green-600 mt-0.5">Selesai! Dapat {item.earnedPoint} poin</p>}
                    </div>
                    <span className={`text-lg font-bold shrink-0 ${isDone ? 'text-[#34A853]' : 'text-[#4285F4]'}`}>
                      {item.task.point}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
