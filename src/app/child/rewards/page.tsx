'use client';

import { dummyRewards, dummyRewardClaims, calculateWeeklyPoints, getRewardById } from '@/data/dummy';
import { Gift, CheckCircle, Lock } from 'lucide-react';

export default function ChildRewards() {
  const weeklyPoints = calculateWeeklyPoints();
  const sorted = [...dummyRewards].sort((a, b) => a.requiredPoint - b.requiredPoint);
  const nextReward = sorted.find(r => weeklyPoints < r.requiredPoint) || null;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Reward Saya</h1>
        <p className="text-sm text-gray-500 mt-0.5">Reward yang bisa kamu dapatkan</p>
      </div>

      {/* Next reward */}
      {nextReward && (
        <div className="bg-[#34A853] text-white rounded-2xl p-5 mb-5 shadow-md">
          <p className="text-xs font-medium opacity-80 mb-2">Reward Berikutnya</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Gift size={20} />
            </div>
            <h2 className="text-xl font-bold">{nextReward.title}</h2>
          </div>
          <p className="text-sm opacity-80 mb-3">{nextReward.description}</p>
          <div className="w-full bg-white/30 rounded-full h-3 mb-2">
            <div className="bg-white h-3 rounded-full transition-all"
              style={{ width: `${Math.min((weeklyPoints / nextReward.requiredPoint) * 100, 100)}%` }} />
          </div>
          <p className="text-xs font-semibold">
            {nextReward.requiredPoint - weeklyPoints > 0
              ? `Tinggal ${nextReward.requiredPoint - weeklyPoints} poin lagi!`
              : 'Kamu sudah bisa klaim reward ini!'}
          </p>
        </div>
      )}

      {/* All rewards */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Semua Reward</h2>
      <div className="space-y-2 mb-6">
        {sorted.map(reward => {
          const canClaim = weeklyPoints >= reward.requiredPoint;
          const isClaimed = dummyRewardClaims.some(c => c.rewardId === reward.id);
          const pct = Math.min((weeklyPoints / reward.requiredPoint) * 100, 100);

          return (
            <div key={reward.id}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                isClaimed ? 'bg-green-50 border-[#34A853]' :
                canClaim ? 'bg-blue-50 border-[#4285F4]' :
                'bg-white border-gray-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isClaimed ? 'bg-[#34A853]' : canClaim ? 'bg-[#4285F4]' : 'bg-gray-100'
              }`}>
                {isClaimed ? <CheckCircle size={20} className="text-white" /> :
                 canClaim ? <Gift size={20} className="text-white" /> :
                 <Lock size={18} className="text-gray-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{reward.title}</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                  <div className="h-1.5 rounded-full transition-all"
                    style={{ width: `${pct}%`, background: isClaimed ? '#34A853' : canClaim ? '#4285F4' : '#d1d5db' }} />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-bold" style={{ color: isClaimed ? '#34A853' : canClaim ? '#4285F4' : '#9ca3af' }}>
                  {reward.requiredPoint}
                </p>
                <p className="text-xs text-gray-400">poin</p>
                {isClaimed && <p className="text-xs text-[#34A853] font-semibold mt-0.5">Diklaim</p>}
                {canClaim && !isClaimed && <p className="text-xs text-[#4285F4] font-semibold mt-0.5">Siap!</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Claimed history */}
      {dummyRewardClaims.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Sudah Diklaim</h2>
          <div className="space-y-2">
            {dummyRewardClaims.map(claim => {
              const r = getRewardById(claim.rewardId);
              return (
                <div key={claim.id} className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border-2 border-[#34A853]">
                  <div className="w-9 h-9 rounded-xl bg-[#34A853] flex items-center justify-center shrink-0">
                    <CheckCircle size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{r?.title}</p>
                    <p className="text-xs text-gray-500">{new Date(claim.date).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-5 bg-blue-50 rounded-xl border border-blue-100 p-4 text-center">
        <p className="text-sm font-semibold text-gray-700">Terus semangat! Setiap poin lebih dekat ke reward!</p>
      </div>
    </div>
  );
}
