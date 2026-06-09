'use client';

import { useChildMe } from '@/lib/childHooks';
import { Gift, CheckCircle, Lock } from 'lucide-react';

export default function ChildRewards() {
  const { data } = useChildMe();
  if (!data) return <p className="text-center text-gray-400 py-10">Memuat…</p>;

  const points = data.weekPoints;
  const sorted = [...data.rewards].sort((a, b) => a.requiredPoint - b.requiredPoint);
  const nextReward = sorted.find((r) => points < r.requiredPoint) || null;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Reward Saya</h1>
        <p className="text-sm text-gray-500 mt-0.5">Reward yang bisa kamu dapatkan</p>
      </div>

      {nextReward && (
        <div className="bg-[#34A853] text-white rounded-2xl p-5 mb-5 shadow-md">
          <p className="text-xs font-medium opacity-80 mb-2">Reward Berikutnya</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Gift size={20} /></div>
            <h2 className="text-xl font-bold">{nextReward.title}</h2>
          </div>
          {nextReward.description && <p className="text-sm opacity-80 mb-3">{nextReward.description}</p>}
          <div className="w-full bg-white/30 rounded-full h-3 mb-2">
            <div className="bg-white h-3 rounded-full transition-all" style={{ width: `${Math.min((points / nextReward.requiredPoint) * 100, 100)}%` }} />
          </div>
          <p className="text-xs font-semibold">
            {nextReward.requiredPoint - points > 0 ? `Tinggal ${nextReward.requiredPoint - points} poin lagi!` : 'Kamu sudah bisa dapat reward ini!'}
          </p>
        </div>
      )}

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Semua Reward</h2>
      <div className="space-y-2 mb-6">
        {sorted.length === 0 && <p className="text-center text-gray-400 py-4">Belum ada reward.</p>}
        {sorted.map((reward) => {
          const canClaim = points >= reward.requiredPoint;
          const pct = Math.min((points / reward.requiredPoint) * 100, 100);
          return (
            <div key={reward.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${canClaim ? 'bg-blue-50 border-[#4285F4]' : 'bg-white border-gray-100'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${canClaim ? 'bg-[#4285F4]' : 'bg-gray-100'}`}>
                {canClaim ? <Gift size={20} className="text-white" /> : <Lock size={18} className="text-gray-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{reward.title}</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: canClaim ? '#4285F4' : '#d1d5db' }} />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-bold" style={{ color: canClaim ? '#4285F4' : '#9ca3af' }}>{reward.requiredPoint}</p>
                <p className="text-xs text-gray-400">poin</p>
                {canClaim && <p className="text-xs text-[#4285F4] font-semibold mt-0.5">Siap!</p>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-center">
        <p className="text-sm font-semibold text-gray-700">Terus semangat! Setiap poin lebih dekat ke reward!</p>
      </div>
    </div>
  );
}
