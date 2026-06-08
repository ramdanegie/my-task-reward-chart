'use client';

import { dummyPockets, dummyTransactions, getPocketBalance } from '@/data/dummy';
import { Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const ACTIVE_CHILD_ID = 'child-1';
const POCKET_COLORS = ['bg-[#4285F4]', 'bg-[#34A853]', 'bg-[#EA4335]', 'bg-[#FBBC04]', 'bg-purple-500'];

export default function ChildWallet() {
  const pockets = dummyPockets.filter(p => p.childId === ACTIVE_CHILD_ID && p.isActive);
  const totalBalance = pockets.reduce((sum, p) => sum + getPocketBalance(p.id), 0);
  const allTxns = dummyTransactions
    .filter(t => pockets.some(p => p.id === t.pocketId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Kantong Saya</h1>
        <p className="text-sm text-gray-500 mt-0.5">Tabungan dan saldo kamu</p>
      </div>

      {/* Total */}
      <div className="bg-[#4285F4] text-white rounded-2xl p-5 mb-5 shadow-md">
        <p className="text-sm opacity-80 mb-1">Total Saldo</p>
        <p className="text-4xl font-bold">Rp {totalBalance.toLocaleString('id-ID')}</p>
        <p className="text-xs opacity-70 mt-1">{pockets.length} kantong</p>
      </div>

      {/* Pocket cards */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {pockets.map((p, i) => {
          const bal = getPocketBalance(p.id);
          const txns = dummyTransactions.filter(t => t.pocketId === p.id);
          const totalCredit = txns.filter(t => t.txnType === 'credit').reduce((s, t) => s + t.amount, 0);
          const totalDebit = txns.filter(t => t.txnType === 'debit').reduce((s, t) => s + t.amount, 0);
          return (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${POCKET_COLORS[i % POCKET_COLORS.length]} flex items-center justify-center shrink-0`}>
                <Wallet size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                  <span className="text-[#34A853]">+Rp {totalCredit.toLocaleString('id-ID')}</span>
                  <span className="text-[#EA4335]">-Rp {totalDebit.toLocaleString('id-ID')}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-gray-900">Rp {bal.toLocaleString('id-ID')}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Transaksi Terbaru</h2>
        <div className="space-y-2">
          {allTxns.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Belum ada transaksi</p>}
          {allTxns.map(txn => {
            const pocket = pockets.find(p => p.id === txn.pocketId);
            return (
              <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {txn.txnType === 'credit'
                    ? <ArrowUpCircle size={18} className="text-[#34A853] shrink-0" />
                    : <ArrowDownCircle size={18} className="text-[#EA4335] shrink-0" />}
                  <div>
                    <p className="text-sm font-medium text-gray-800">{txn.note}</p>
                    <p className="text-xs text-gray-400">{pocket?.name} · {txn.createdAt}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${txn.txnType === 'credit' ? 'text-[#34A853]' : 'text-[#EA4335]'}`}>
                  {txn.txnType === 'credit' ? '+' : '-'}Rp {txn.amount.toLocaleString('id-ID')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
