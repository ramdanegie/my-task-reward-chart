'use client';

import { useChildMe } from '@/lib/childHooks';
import { apiSend } from '@/lib/api';
import { CheckCircle, Circle, Clock, Zap } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  pagi: 'Pagi', kebersihan: 'Kebersihan', kemandirian: 'Kemandirian',
  rumah: 'Rumah', belajar: 'Belajar', sikap: 'Sikap', malam: 'Malam',
};

export default function ChildDashboard() {
  const { data, mutate } = useChildMe();
  if (!data) return <p className="text-center text-gray-400 py-10">Memuat…</p>;

  const { child, tasks, logs, today } = data;
  const logByTask = new Map(logs.map((l) => [l.taskId, l]));
  const dailyPoints = logs.filter((l) => l.status === 'completed').reduce((s, l) => s + l.earnedPoint, 0);
  const completed = logs.filter((l) => l.status === 'completed').length;
  const pct = Math.min((dailyPoints / (child.dailyPointTarget || 1)) * 100, 100);

  const toggle = async (taskId: string) => {
    const done = logByTask.get(taskId)?.status === 'completed';
    await apiSend('/api/child/logs', 'POST', { taskId, date: today, done: !done });
    mutate();
  };

  const grouped = tasks.reduce((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {} as Record<string, typeof tasks>);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Halo, {child.name}!</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ayo selesaikan tugas hari ini</p>
      </div>

      <div className="bg-[#4285F4] text-white rounded-2xl p-5 mb-5 shadow-md">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium opacity-80">Poin Hari Ini</p>
          <div className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-full">
            <Zap size={12} />
            <span className="text-xs font-semibold">{completed} selesai</span>
          </div>
        </div>
        <p className="text-4xl font-bold mb-1">{dailyPoints}</p>
        <p className="text-xs opacity-70 mb-3">dari {child.dailyPointTarget} poin target</p>
        <div className="w-full bg-white/30 rounded-full h-3">
          <div className="bg-white h-3 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {dailyPoints >= child.dailyPointTarget ? (
        <div className="bg-[#34A853] text-white rounded-xl p-4 mb-5 text-center">
          <p className="font-bold">Target tercapai! Kamu luar biasa hari ini!</p>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-5 text-center">
          <p className="text-sm text-amber-700 font-medium">Tinggal {child.dailyPointTarget - dailyPoints} poin lagi untuk mencapai target!</p>
        </div>
      )}

      <div className="space-y-5">
        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, catTasks]) => (
          <div key={cat}>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{categoryLabels[cat] ?? cat}</h2>
            <div className="space-y-2">
              {catTasks.map((task) => {
                const status = logByTask.get(task.id)?.status;
                const isDone = status === 'completed';
                const isWaiting = status === 'waiting_approval';
                return (
                  <button key={task.id} onClick={() => toggle(task.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all active:scale-98 text-left ${
                      isDone ? 'bg-green-50 border-[#34A853]' :
                      isWaiting ? 'bg-yellow-50 border-[#FBBC04]' :
                      'bg-white border-gray-100 hover:border-[#4285F4]'
                    }`}>
                    <div className="shrink-0">
                      {isDone ? <CheckCircle size={24} className="text-[#34A853]" /> :
                       isWaiting ? <Clock size={24} className="text-[#FBBC04]" /> :
                       <Circle size={24} className="text-gray-200" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${isDone ? 'text-[#34A853]' : isWaiting ? 'text-yellow-700' : 'text-gray-800'}`}>
                        {task.title}
                      </p>
                      {isWaiting && <p className="text-xs text-yellow-600 mt-0.5">Menunggu persetujuan orang tua</p>}
                      {isDone && <p className="text-xs text-green-600 mt-0.5">Selesai! Dapat {task.point} poin</p>}
                    </div>
                    <span className={`text-lg font-bold shrink-0 ${isDone ? 'text-[#34A853]' : 'text-[#4285F4]'}`}>{task.point}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-center text-gray-400 py-6">Belum ada tugas hari ini.</p>}
      </div>
    </div>
  );
}
