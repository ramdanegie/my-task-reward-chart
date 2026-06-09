'use client';

import { useState } from 'react';
import { useActiveChild } from '@/context/ActiveChild';
import { useRewards, usePockets, useClaims, useSummary } from '@/lib/hooks';
import { apiSend } from '@/lib/api';
import { toDateStr } from '@/lib/dates';
import { Plus, Edit, Trash2, Gift, X, CheckCircle } from 'lucide-react';

const rewardTypeLabels: Record<string, string> = {
  activity: 'Aktivitas', playtime: 'Bermain', food: 'Makanan',
  movie: 'Film', toy: 'Mainan', outing: 'Jalan-jalan',
};

interface Reward { id: string; title: string; description: string; rewardType: string; requiredPoint: number; isActive: boolean }
interface Claim { id: string; rewardId: string; givenAt?: string | null; status: string }
interface Pocket { id: string; name: string }

const emptyForm = { title: '', description: '', requiredPoint: '50', rewardType: 'food' };

export default function ParentRewards() {
  const { activeChildId, isLoading } = useActiveChild();
  const { data: rewards, mutate: mutateRewards } = useRewards(activeChildId ?? undefined) as { data?: Reward[]; mutate: () => void };
  const { data: pocketData } = usePockets(activeChildId ?? undefined);
  const { data: claims, mutate: mutateClaims } = useClaims(activeChildId ?? undefined) as { data?: Claim[]; mutate: () => void };
  const { data: sum } = useSummary(activeChildId ?? undefined, 'week', toDateStr(new Date()));

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [claimReward, setClaimReward] = useState<Reward | null>(null);
  const [claimPocket, setClaimPocket] = useState('');

  if (!isLoading && !activeChildId) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-2">Belum ada anak.</p>
        <a href="/parent/child" className="text-[#4285F4] font-medium hover:underline">Tambah anak dulu →</a>
      </div>
    );
  }

  const weeklyPoints = sum?.summary.totalPoints ?? 0;
  const pockets: Pocket[] = pocketData?.pockets ?? [];
  const claimList = claims ?? [];

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (r: Reward) => {
    setEditId(r.id);
    setForm({ title: r.title, description: r.description ?? '', requiredPoint: String(r.requiredPoint), rewardType: r.rewardType });
    setShowForm(true);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = { title: form.title.trim(), description: form.description, requiredPoint: Number(form.requiredPoint) || 0, rewardType: form.rewardType };
    if (editId) await apiSend('/api/rewards/' + editId, 'PATCH', payload);
    else await apiSend('/api/children/' + activeChildId + '/rewards', 'POST', payload);
    setShowForm(false); mutateRewards();
  };
  const del = async (id: string) => { if (!confirm('Hapus reward ini?')) return; await apiSend('/api/rewards/' + id, 'DELETE'); mutateRewards(); };

  const doClaim = async () => {
    if (!claimReward) return;
    await apiSend('/api/children/' + activeChildId + '/claims', 'POST', {
      rewardId: claimReward.id, pocketId: claimPocket || undefined,
    });
    setClaimReward(null); setClaimPocket('');
    mutateClaims();
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Reward</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola reward yang dapat dicapai anak</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#4285F4] text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm font-medium">
          <Plus size={16} /> Reward Baru
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Reward' : 'Tambah Reward Baru'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form className="space-y-3" onSubmit={submit}>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nama reward"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi reward" rows={2}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4] resize-none" />
              <input type="number" value={form.requiredPoint} onChange={(e) => setForm({ ...form, requiredPoint: e.target.value })} placeholder="Minimal poin"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
              <select value={form.rewardType} onChange={(e) => setForm({ ...form, rewardType: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]">
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

      {/* Claim Modal */}
      {claimReward && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Beri Reward</h2>
              <button onClick={() => setClaimReward(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Berikan <b>{claimReward.title}</b> kepada anak?</p>
            <label className="text-sm font-medium text-gray-700 block mb-1">Kreditkan ke kantong (opsional)</label>
            <select value={claimPocket} onChange={(e) => setClaimPocket(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#4285F4]">
              <option value="">Tanpa kantong</option>
              {pockets.map((p) => <option key={p.id} value={p.id}>{p.name} (+{claimReward.requiredPoint})</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setClaimReward(null)} className="flex-1 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-lg">Batal</button>
              <button onClick={doClaim} className="flex-1 py-2.5 bg-[#34A853] text-white text-sm font-medium rounded-lg hover:bg-green-600">Beri Reward</button>
            </div>
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
        {(rewards ?? []).length === 0 && <p className="text-sm text-gray-400 col-span-full text-center py-6">Belum ada reward.</p>}
        {(rewards ?? []).map((reward) => {
          const canClaim = weeklyPoints >= reward.requiredPoint;
          const isClaimed = claimList.some((c) => c.rewardId === reward.id);
          const pct = Math.min((weeklyPoints / reward.requiredPoint) * 100, 100);
          return (
            <div key={reward.id} className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 transition-all ${!reward.isActive && 'opacity-50'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{rewardTypeLabels[reward.rewardType] ?? reward.rewardType}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${reward.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {reward.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{reward.title}</h3>
              {reward.description && <p className="text-xs text-gray-500 mb-4">{reward.description}</p>}
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
                  <CheckCircle size={13} /> Sudah Diberikan
                </div>
              )}
              <div className="flex gap-2">
                {canClaim ? (
                  <button onClick={() => { setClaimReward(reward); setClaimPocket(''); }} className="flex-1 bg-[#34A853] text-white text-sm font-medium py-2 rounded-lg hover:bg-green-600">Beri Reward</button>
                ) : (
                  <div className="flex-1 bg-gray-100 text-gray-500 text-sm py-2 rounded-lg text-center">{reward.requiredPoint - weeklyPoints} poin lagi</div>
                )}
                <button onClick={() => openEdit(reward)} className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-blue-50 hover:text-[#4285F4]"><Edit size={16} /></button>
                <button onClick={() => del(reward.id)} className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-[#EA4335]"><Trash2 size={16} /></button>
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
          {claimList.length === 0 && <p className="text-sm text-gray-400 text-center py-2">Belum ada</p>}
          {claimList.map((claim) => {
            const r = (rewards ?? []).find((x) => x.id === claim.rewardId);
            return (
              <div key={claim.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-[#34A853]">
                <div>
                  <p className="text-sm font-medium text-gray-800">{r?.title ?? 'Reward'}</p>
                  <p className="text-xs text-gray-400">{claim.givenAt ? new Date(claim.givenAt).toLocaleDateString('id-ID') : ''}</p>
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
