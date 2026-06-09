'use client';

import { useChildMe } from '@/lib/childHooks';
import { formatRupiah } from '@/lib/format';
import { Wallet } from 'lucide-react';

const POCKET_COLORS = ['bg-[#4285F4]', 'bg-[#34A853]', 'bg-[#EA4335]', 'bg-[#FBBC04]', 'bg-purple-500'];

export default function ChildWallet() {
  const { data } = useChildMe();
  if (!data) return <p className="text-center text-gray-400 py-10">Memuat…</p>;

  const pockets = data.pockets.filter((p) => p.isActive);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Kantong Saya</h1>
        <p className="text-sm text-gray-500 mt-0.5">Tabungan dan saldo kamu</p>
      </div>

      <div className="bg-[#4285F4] text-white rounded-2xl p-5 mb-5 shadow-md">
        <p className="text-sm opacity-80 mb-1">Total Saldo</p>
        <p className="text-4xl font-bold">{formatRupiah(data.total)}</p>
        <p className="text-xs opacity-70 mt-1">{pockets.length} kantong</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {pockets.length === 0 && <p className="text-center text-gray-400 py-4">Belum ada kantong.</p>}
        {pockets.map((p, i) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${POCKET_COLORS[i % POCKET_COLORS.length]} flex items-center justify-center shrink-0`}>
              <Wallet size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{p.name}</p>
              <p className="text-xs text-gray-400">Saldo awal {formatRupiah(p.initialBalance)}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-gray-900">{formatRupiah(p.balance)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
