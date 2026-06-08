'use client';

import {
  dummyChild, dummyRewards, getDummyDailyTaskLogs,
  calculateDailyPoints, calculateWeeklyPoints, getTaskById,
} from '@/data/dummy';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { CheckCircle, Clock, TrendingUp, AlertCircle, Target, Trophy } from 'lucide-react';

const GOOGLE = { blue: '#4285F4', red: '#EA4335', yellow: '#FBBC04', green: '#34A853' };

export default function ParentDashboard() {
  const today = new Date().toISOString().split('T')[0];
  const dailyLogs = getDummyDailyTaskLogs(today);
  const dailyPoints = calculateDailyPoints(dailyLogs);
  const weeklyPoints = calculateWeeklyPoints();
  const completed = dailyLogs.filter(l => l.status === 'completed').length;
  const waitingApproval = dailyLogs.filter(l => l.status === 'waiting_approval');
  const totalTasks = dailyLogs.length;

  const weeklyData = [
    { day: 'Sen', poin: 240 }, { day: 'Sel', poin: 280 }, { day: 'Rab', poin: 250 },
    { day: 'Kam', poin: 300 }, { day: 'Jum', poin: 270 }, { day: 'Sab', poin: 310 },
    { day: 'Min', poin: dailyPoints },
  ];
  const catData = [
    { name: 'Pagi', value: 10 }, { name: 'Kebersihan', value: 10 },
    { name: 'Kemandirian', value: 5 }, { name: 'Rumah', value: 15 },
    { name: 'Belajar', value: 10 }, { name: 'Sikap', value: 10 }, { name: 'Malam', value: 10 },
  ];
  const PIE_COLORS = [GOOGLE.blue, GOOGLE.red, GOOGLE.yellow, GOOGLE.green, '#1a73e8', '#d93025', '#f9ab00'];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Progress {dummyChild.name}, {dummyChild.age} tahun</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Poin Hari Ini', val: `${dailyPoints}/${dummyChild.dailyPointTarget}`, icon: <Target size={18} />, color: GOOGLE.blue, pct: (dailyPoints/dummyChild.dailyPointTarget)*100 },
          { label: 'Poin Minggu Ini', val: `${weeklyPoints}/${dummyChild.weeklyPointTarget}`, icon: <TrendingUp size={18} />, color: GOOGLE.green, pct: (weeklyPoints/dummyChild.weeklyPointTarget)*100 },
          { label: 'Selesai Hari Ini', val: `${completed}/${totalTasks}`, icon: <CheckCircle size={18} />, color: GOOGLE.yellow, pct: (completed/totalTasks)*100 },
          { label: 'Perlu Approval', val: `${waitingApproval.length}`, icon: <AlertCircle size={18} />, color: GOOGLE.red, pct: null },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span style={{ color: c.color }}>{c.icon}</span>
              <p className="text-xs text-gray-500">{c.label}</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: c.color }}>{c.val}</p>
            {c.pct !== null && (
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(c.pct,100)}%`, background: c.color }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Progress Mingguan</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="poin" stroke={GOOGLE.blue} strokeWidth={2.5} dot={{ fill: GOOGLE.blue, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Kategori Tugas</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={(e) => e.name} labelLine={false}>
                {catData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Task lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <CheckCircle size={15} style={{ color: GOOGLE.green }} /> Selesai Hari Ini
          </h2>
          <div className="space-y-2">
            {dailyLogs.filter(l => l.status === 'completed').map(log => {
              const task = getTaskById(log.taskId);
              return (
                <div key={log.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{task?.title}</p>
                    <p className="text-xs text-gray-400">{log.completedAt}</p>
                  </div>
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">+{log.earnedPoint}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock size={15} style={{ color: GOOGLE.yellow }} /> Menunggu Persetujuan
          </h2>
          <div className="space-y-2">
            {waitingApproval.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Tidak ada tugas menunggu</p>
            )}
            {waitingApproval.map(log => {
              const task = getTaskById(log.taskId);
              return (
                <div key={log.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{task?.title}</p>
                    <p className="text-xs text-gray-400">{log.completedAt}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button className="w-7 h-7 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600">✓</button>
                    <button className="w-7 h-7 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600">✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rewards progress */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Trophy size={15} style={{ color: GOOGLE.yellow }} /> Reward yang Akan Dicapai
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {dummyRewards.map(reward => {
            const pct = Math.min((weeklyPoints / reward.requiredPoint) * 100, 100);
            const done = weeklyPoints >= reward.requiredPoint;
            return (
              <div key={reward.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs font-medium text-gray-700 mb-2 leading-tight">{reward.title}</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: done ? GOOGLE.green : GOOGLE.blue }} />
                </div>
                <p className="text-xs" style={{ color: done ? GOOGLE.green : '#6b7280' }}>
                  {done ? 'Siap diklaim!' : `${reward.requiredPoint - weeklyPoints} poin lagi`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
