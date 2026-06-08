'use client';

import { useState } from 'react';
import { dummyRewards, dummyRewardClaims, calculateWeeklyPoints } from '@/data/dummy';
import { Plus, Edit, Trash2, Gift, X, CheckCircle } from 'lucide-react';

const rewardTypeLabels: Record<string, string> = {
  activity: 'Aktivitas', playtime: 'Bermain', food: 'Makanan',
  movie: 'Film', toy: 'Mainan', outing: 'Jalan-jalan',
};

export default function ParentRewards() {
  const [rewards, setRewards] = useState(dummyRewards);
  const [showForm, setShowForm] = useState(false);
  const weeklyPoints = calculateWeeklyPoints();

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Reward</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola reward yang dapat dicapai anak</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#4285F4] text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm font-medium">
          <Plus size={16} /> Reward Baru
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Tambah Reward Baru</h2>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form className="space-y-3">
              <input type="text" placeholder="Nama reward" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
              <textarea placeholder="Deskripsi reward" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4] resize-none" rows={2} />
              <input type="number" placeholder="Minimal poin" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]">
                <option>Pilih tipe reward</option>
                {Object.entries(rewardTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50">Batal</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#4285F4] text-white text-sm font-medium rounded-lg hover:bg-blue-600">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Points banner */}
      <div className="bg-[#4285F4] text-white rounded-xl p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">Poin Mingguan Saat Ini</p>
          <p className="text-3xl font-bold mt-1">{weeklyPoints} poin</p>
        </div>
        <Gift size={36} className="opacity-20" />
      </div>

      {/* Rewards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {rewards.map(reward => {
          const canClaim = weeklyPoints >= reward.requiredPoint;
          const isClaimed = dummyRewardClaims.some(c => c.rewardId === reward.id);
          const pct = Math.min((weeklyPoints / reward.requiredPoint) * 100, 100);

          return (
            <div key={reward.id} className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 transition-all ${!reward.isActive && 'opacity-50'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{rewardTypeLabels[reward.type]}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${reward.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {reward.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{reward.title}</h3>
              <p className="text-xs text-gray-500 mb-4">{reward.description}</p>

              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span className="font-semibold" style={{ color: canClaim ? '#34A853' : '#4285F4' }}>{reward.requiredPoint} poin</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: canClaim ? '#34A853' : '#4285F4' }} />
                </div>
              </div>

              {isClaimed && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-3 py-2 rounded-lg mb-3">
                  <CheckCircle size={13} /> Sudah Diklaim
                </div>
              )}

              <div className="flex gap-2">
                {canClaim && !isClaimed ? (
                  <button className="flex-1 bg-[#34A853] text-white text-sm font-medium py-2 rounded-lg hover:bg-green-600">Klaim Reward</button>
                ) : !canClaim ? (
                  <div className="flex-1 bg-gray-100 text-gray-500 text-sm py-2 rounded-lg text-center">{reward.requiredPoint - weeklyPoints} poin lagi</div>
                ) : (
                  <div className="flex-1 bg-green-100 text-green-600 text-sm py-2 rounded-lg text-center">Diklaim</div>
                )}
                <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-blue-50 hover:text-[#4285F4]"><Edit size={16} /></button>
                <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-[#EA4335]"><Trash2 size={16} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Gift size={15} className="text-[#4285F4]" /> Riwayat Reward Diberikan
        </h2>
        <div className="space-y-2">
          {dummyRewardClaims.map(claim => {
            const r = rewards.find(x => x.id === claim.rewardId);
            return (
              <div key={claim.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-[#34A853]">
                <div>
                  <p className="text-sm font-medium text-gray-800">{r?.title}</p>
                  <p className="text-xs text-gray-400">{new Date(claim.date).toLocaleDateString('id-ID')}</p>
                </div>
                <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Diberikan</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
