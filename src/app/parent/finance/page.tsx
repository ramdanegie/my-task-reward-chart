'use client';

import { useState } from 'react';
import { useActiveChild } from '@/context/ActiveChild';
import { usePockets, useTransactions } from '@/lib/hooks';
import { apiSend } from '@/lib/api';
import { formatRupiah, formatDateID } from '@/lib/format';
import { getWeekRange, getMonthRange } from '@/lib/period';
import RangeFilter from '@/components/RangeFilter';
import { toDateStr } from '@/lib/dates';
import type { RangeType } from '@/domain/types';
import { Plus, Wallet, ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, X, Trash2, TrendingUp } from 'lucide-react';

const POCKET_COLORS = ['bg-[#4285F4]', 'bg-[#34A853]', 'bg-[#EA4335]', 'bg-[#FBBC04]', 'bg-purple-500'];

interface Txn { id: string; pocketId: string; amount: number; txnType: string; source: string; note?: string | null; occurredAt: string; pocket?: { name: string } }

export default function ParentFinance() {
  const { activeChild, activeChildId, isLoading } = useActiveChild();
  const [range, setRange] = useState<RangeType>('week');
  const [date, setDate] = useState(toDateStr(new Date()));
  const { start, end } = range === 'month' ? getMonthRange(date) : getWeekRange(date);

  const { data: pocketData, mutate: mutatePockets } = usePockets(activeChildId ?? undefined);
  const { data: txns, mutate: mutateTxns } = useTransactions(activeChildId ?? undefined, start, end) as { data?: Txn[]; mutate: () => void };

  const [showAddPocket, setShowAddPocket] = useState(false);
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [pocketForm, setPocketForm] = useState({ name: '', type: 'gaji', initialBalance: '' });
  const [txnForm, setTxnForm] = useState({ pocketId: '', txnType: 'credit', amount: '', source: 'gaji', note: '' });
  const [transferForm, setTransferForm] = useState({ fromPocketId: '', toPocketId: '', amount: '', note: '' });

  if (!isLoading && !activeChildId) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-2">Belum ada anak.</p>
        <a href="/parent/child" className="text-[#4285F4] font-medium hover:underline">Tambah anak dulu →</a>
      </div>
    );
  }

  const pockets = pocketData?.pockets ?? [];
  const total = pocketData?.total ?? 0;
  const reload = () => { mutatePockets(); mutateTxns(); };

  const addPocket = async () => {
    if (!pocketForm.name.trim()) return;
    await apiSend('/api/children/' + activeChildId + '/pockets', 'POST', {
      name: pocketForm.name.trim(), type: pocketForm.type, initialBalance: Number(pocketForm.initialBalance) || 0,
    });
    setShowAddPocket(false); setPocketForm({ name: '', type: 'gaji', initialBalance: '' }); reload();
  };
  const delPocket = async (id: string) => {
    if (!confirm('Hapus kantong ini beserta transaksinya?')) return;
    await apiSend('/api/pockets/' + id, 'DELETE'); reload();
  };
  const addTxn = async () => {
    if (!txnForm.pocketId || !txnForm.amount) return;
    await apiSend('/api/children/' + activeChildId + '/transactions', 'POST', {
      pocketId: txnForm.pocketId, txnType: txnForm.txnType, amount: Number(txnForm.amount), source: txnForm.source, note: txnForm.note,
    });
    setShowAddTxn(false); setTxnForm({ pocketId: '', txnType: 'credit', amount: '', source: 'gaji', note: '' }); reload();
  };
  const doTransfer = async () => {
    if (!transferForm.fromPocketId || !transferForm.toPocketId || !transferForm.amount) return;
    await apiSend('/api/children/' + activeChildId + '/transfer', 'POST', {
      fromPocketId: transferForm.fromPocketId, toPocketId: transferForm.toPocketId, amount: Number(transferForm.amount), note: transferForm.note,
    });
    setShowTransfer(false); setTransferForm({ fromPocketId: '', toPocketId: '', amount: '', note: '' }); reload();
  };

  const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]';

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Keuangan Anak</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola kantong saldo {activeChild?.name}</p>
        </div>
        <RangeFilter range={range} date={date} onRangeChange={setRange} onDateChange={setDate} />
      </div>

      {/* Total balance */}
      <div className="bg-[#4285F4] text-white rounded-2xl p-5 mb-5 flex items-center justify-between shadow-md">
        <div>
          <p className="text-sm opacity-80 mb-1">Total Saldo {activeChild?.name}</p>
          <p className="text-3xl font-bold">{formatRupiah(total)}</p>
          <p className="text-xs opacity-70 mt-1">{pockets.length} kantong</p>
        </div>
        <Wallet size={36} className="opacity-20" />
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap mb-4">
        <button onClick={() => setShowAddPocket(true)} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
          <Plus size={15} /> Kantong
        </button>
        <button onClick={() => setShowAddTxn(true)} className="flex items-center gap-1.5 bg-[#4285F4] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600">
          <Plus size={15} /> Transaksi
        </button>
        <button onClick={() => setShowTransfer(true)} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
          <ArrowLeftRight size={15} /> Transfer
        </button>
      </div>

      {/* Pocket cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {pockets.length === 0 && <p className="text-sm text-gray-400 col-span-full">Belum ada kantong. Tambah kantong dulu.</p>}
        {pockets.map((p, i) => (
          <div key={p.id} className="p-4 rounded-xl border-2 border-gray-100 bg-white">
            <div className="flex items-start justify-between">
              <div className={`w-9 h-9 rounded-xl ${POCKET_COLORS[i % POCKET_COLORS.length]} flex items-center justify-center mb-3`}>
                <Wallet size={18} className="text-white" />
              </div>
              <button onClick={() => delPocket(p.id)} className="p-1 text-gray-300 hover:text-[#EA4335]"><Trash2 size={15} /></button>
            </div>
            <p className="text-sm font-semibold text-gray-800">{p.name}</p>
            <p className="text-lg font-bold mt-1 text-[#4285F4]">{formatRupiah(p.balance)}</p>
            <p className="text-xs text-gray-400 mt-0.5">Saldo awal {formatRupiah(p.initialBalance)}</p>
          </div>
        ))}
      </div>

      {/* Transaction history (filtered by range) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <TrendingUp size={15} className="text-[#4285F4]" /> Riwayat Transaksi
        </h2>
        <div className="space-y-2">
          {(txns ?? []).length === 0 && <p className="text-sm text-gray-400 text-center py-4">Belum ada transaksi pada periode ini</p>}
          {(txns ?? []).map((txn) => (
            <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                {txn.txnType === 'credit'
                  ? <ArrowUpCircle size={18} className="text-[#34A853] shrink-0" />
                  : <ArrowDownCircle size={18} className="text-[#EA4335] shrink-0" />}
                <div>
                  <p className="text-sm font-medium text-gray-800">{txn.note || txn.source}</p>
                  <p className="text-xs text-gray-400">{txn.pocket?.name} · {txn.source} · {formatDateID(txn.occurredAt.slice(0, 10))}</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${txn.txnType === 'credit' ? 'text-[#34A853]' : 'text-[#EA4335]'}`}>
                {txn.txnType === 'credit' ? '+' : '-'}{formatRupiah(txn.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Pocket Modal */}
      {showAddPocket && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Tambah Kantong</h2>
              <button onClick={() => setShowAddPocket(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <input value={pocketForm.name} onChange={(e) => setPocketForm({ ...pocketForm, name: e.target.value })} placeholder="Nama (mis. Kantong Gaji)" className={inputCls} />
              <select value={pocketForm.type} onChange={(e) => setPocketForm({ ...pocketForm, type: e.target.value })} className={inputCls}>
                {['gaji', 'thr', 'investasi', 'tabungan', 'custom'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="number" value={pocketForm.initialBalance} onChange={(e) => setPocketForm({ ...pocketForm, initialBalance: e.target.value })} placeholder="Saldo awal (Rp)" className={inputCls} />
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowAddPocket(false)} className="flex-1 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-lg">Batal</button>
                <button onClick={addPocket} className="flex-1 py-2.5 bg-[#4285F4] text-white text-sm font-medium rounded-lg hover:bg-blue-600">Tambah</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddTxn && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Tambah Transaksi</h2>
              <button onClick={() => setShowAddTxn(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <select value={txnForm.pocketId} onChange={(e) => setTxnForm({ ...txnForm, pocketId: e.target.value })} className={inputCls}>
                <option value="">Pilih kantong</option>
                {pockets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
                <button onClick={() => setTxnForm({ ...txnForm, txnType: 'credit' })} className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 ${txnForm.txnType === 'credit' ? 'bg-[#34A853] text-white' : 'bg-white text-gray-600'}`}>
                  <ArrowUpCircle size={15} /> Kredit
                </button>
                <button onClick={() => setTxnForm({ ...txnForm, txnType: 'debit' })} className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 ${txnForm.txnType === 'debit' ? 'bg-[#EA4335] text-white' : 'bg-white text-gray-600'}`}>
                  <ArrowDownCircle size={15} /> Debit
                </button>
              </div>
              <input type="number" value={txnForm.amount} onChange={(e) => setTxnForm({ ...txnForm, amount: e.target.value })} placeholder="Jumlah (Rp)" className={inputCls} />
              <select value={txnForm.source} onChange={(e) => setTxnForm({ ...txnForm, source: e.target.value })} className={inputCls}>
                {['gaji', 'reward', 'pengeluaran', 'manual'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input value={txnForm.note} onChange={(e) => setTxnForm({ ...txnForm, note: e.target.value })} placeholder="Catatan" className={inputCls} />
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowAddTxn(false)} className="flex-1 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-lg">Batal</button>
                <button onClick={addTxn} className="flex-1 py-2.5 bg-[#4285F4] text-white text-sm font-medium rounded-lg hover:bg-blue-600">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Transfer Antar Kantong</h2>
              <button onClick={() => setShowTransfer(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <select value={transferForm.fromPocketId} onChange={(e) => setTransferForm({ ...transferForm, fromPocketId: e.target.value })} className={inputCls}>
                <option value="">Dari kantong</option>
                {pockets.map((p) => <option key={p.id} value={p.id}>{p.name} ({formatRupiah(p.balance)})</option>)}
              </select>
              <select value={transferForm.toPocketId} onChange={(e) => setTransferForm({ ...transferForm, toPocketId: e.target.value })} className={inputCls}>
                <option value="">Ke kantong</option>
                {pockets.filter((p) => p.id !== transferForm.fromPocketId).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="number" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} placeholder="Jumlah (Rp)" className={inputCls} />
              <input value={transferForm.note} onChange={(e) => setTransferForm({ ...transferForm, note: e.target.value })} placeholder="Catatan (opsional)" className={inputCls} />
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowTransfer(false)} className="flex-1 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-lg">Batal</button>
                <button onClick={doTransfer} className="flex-1 py-2.5 bg-[#4285F4] text-white text-sm font-medium rounded-lg hover:bg-blue-600">Transfer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
