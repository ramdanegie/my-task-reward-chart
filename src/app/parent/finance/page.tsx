'use client';

import { useState } from 'react';
import {
  dummyChildren, dummyPockets, dummyTransactions,
  getPocketBalance, getChildPockets, type Pocket, type PocketTransaction, type FilterPeriod
} from '@/data/dummy';
import { Plus, Wallet, ArrowUpCircle, ArrowDownCircle, ChevronDown, X, TrendingUp } from 'lucide-react';

const POCKET_COLORS = ['bg-[#4285F4]', 'bg-[#34A853]', 'bg-[#EA4335]', 'bg-[#FBBC04]', 'bg-purple-500'];

export default function ParentFinance() {
  const [activeChildId, setActiveChildId] = useState('child-1');
  const [period, setPeriod] = useState<FilterPeriod>('week');
  const [activePocketId, setActivePocketId] = useState<string | null>(null);
  const [showAddPocket, setShowAddPocket] = useState(false);
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [newPocketName, setNewPocketName] = useState('');
  const [newPocketBalance, setNewPocketBalance] = useState('');
  const [txnAmount, setTxnAmount] = useState('');
  const [txnType, setTxnType] = useState<'credit' | 'debit'>('credit');
  const [txnNote, setTxnNote] = useState('');
  const [txnSource, setTxnSource] = useState('gaji');

  const [pockets, setPockets] = useState(dummyPockets);
  const [transactions, setTransactions] = useState(dummyTransactions);

  const child = dummyChildren.find(c => c.id === activeChildId)!;
  const childPockets = pockets.filter(p => p.childId === activeChildId && p.isActive);

  const getBalance = (pocketId: string) => {
    const pocket = pockets.find(p => p.id === pocketId);
    if (!pocket) return 0;
    const txns = transactions.filter(t => t.pocketId === pocketId);
    return txns.reduce((sum, t) => t.txnType === 'credit' ? sum + t.amount : sum - t.amount, pocket.initialBalance);
  };

  const totalBalance = childPockets.reduce((sum, p) => sum + getBalance(p.id), 0);
  const activePocket = childPockets.find(p => p.id === activePocketId) || childPockets[0] || null;
  const pocketTransactions = activePocket ? transactions.filter(t => t.pocketId === activePocket.id) : [];

  const addPocket = () => {
    if (!newPocketName.trim()) return;
    const pocket: Pocket = {
      id: `pocket-${Date.now()}`, childId: activeChildId, name: newPocketName.trim(),
      type: newPocketName.toLowerCase(), initialBalance: parseInt(newPocketBalance) || 0,
      isActive: true, createdAt: new Date().toISOString().split('T')[0],
    };
    setPockets([...pockets, pocket]);
    setShowAddPocket(false); setNewPocketName(''); setNewPocketBalance('');
  };

  const addTransaction = () => {
    if (!activePocket || !txnAmount) return;
    const txn: PocketTransaction = {
      id: `txn-${Date.now()}`, pocketId: activePocket.id, amount: parseInt(txnAmount),
      txnType, source: txnSource, note: txnNote,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTransactions([txn, ...transactions]);
    setShowAddTxn(false); setTxnAmount(''); setTxnNote('');
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Keuangan Anak</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola kantong saldo {child.name}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <select value={activeChildId} onChange={e => { setActiveChildId(e.target.value); setActivePocketId(null); }}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#4285F4]">
              {dummyChildren.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
            <button onClick={() => setPeriod('week')} className={`px-3 py-2 ${period === 'week' ? 'bg-[#4285F4] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Minggu</button>
            <button onClick={() => setPeriod('month')} className={`px-3 py-2 ${period === 'month' ? 'bg-[#4285F4] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Bulan</button>
          </div>
        </div>
      </div>

      {/* Total balance */}
      <div className="bg-[#4285F4] text-white rounded-2xl p-5 mb-5 flex items-center justify-between shadow-md">
        <div>
          <p className="text-sm opacity-80 mb-1">Total Saldo {child.name}</p>
          <p className="text-3xl font-bold">Rp {totalBalance.toLocaleString('id-ID')}</p>
          <p className="text-xs opacity-70 mt-1">{childPockets.length} kantong aktif</p>
        </div>
        <Wallet size={36} className="opacity-20" />
      </div>

      {/* Pocket cards */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">Kantong Saldo</h2>
        <button onClick={() => setShowAddPocket(true)} className="flex items-center gap-1.5 text-xs font-medium text-[#4285F4] hover:underline">
          <Plus size={14} /> Tambah Kantong
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {childPockets.map((p, i) => {
          const bal = getBalance(p.id);
          const isActive = (activePocket?.id || childPockets[0]?.id) === p.id;
          return (
            <button key={p.id} onClick={() => setActivePocketId(p.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${isActive ? 'border-[#4285F4] bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
              <div className={`w-9 h-9 rounded-xl ${POCKET_COLORS[i % POCKET_COLORS.length]} flex items-center justify-center mb-3`}>
                <Wallet size={18} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-800">{p.name}</p>
              <p className="text-lg font-bold mt-1" style={{ color: isActive ? '#4285F4' : '#111827' }}>
                Rp {bal.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Saldo awal Rp {p.initialBalance.toLocaleString('id-ID')}</p>
            </button>
          );
        })}
      </div>

      {/* Transactions of active pocket */}
      {activePocket && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <TrendingUp size={15} className="text-[#4285F4]" />
              Transaksi — {activePocket.name}
            </h2>
            <button onClick={() => setShowAddTxn(true)} className="flex items-center gap-1.5 bg-[#4285F4] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-600">
              <Plus size={13} /> Transaksi
            </button>
          </div>
          <div className="space-y-2">
            {pocketTransactions.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Belum ada transaksi</p>}
            {pocketTransactions.map(txn => (
              <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  {txn.txnType === 'credit'
                    ? <ArrowUpCircle size={18} className="text-[#34A853] shrink-0" />
                    : <ArrowDownCircle size={18} className="text-[#EA4335] shrink-0" />}
                  <div>
                    <p className="text-sm font-medium text-gray-800">{txn.note}</p>
                    <p className="text-xs text-gray-400">{txn.source} · {txn.createdAt}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${txn.txnType === 'credit' ? 'text-[#34A853]' : 'text-[#EA4335]'}`}>
                  {txn.txnType === 'credit' ? '+' : '-'}Rp {txn.amount.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Pocket Modal */}
      {showAddPocket && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Tambah Kantong</h2>
              <button onClick={() => setShowAddPocket(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Nama Kantong</label>
                <input value={newPocketName} onChange={e => setNewPocketName(e.target.value)}
                  placeholder="mis. Kantong Gaji, Kantong THR" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Saldo Awal (Rp)</label>
                <input type="number" value={newPocketBalance} onChange={e => setNewPocketBalance(e.target.value)}
                  placeholder="0" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
              </div>
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
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
                <button onClick={() => setTxnType('credit')} className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 ${txnType === 'credit' ? 'bg-[#34A853] text-white' : 'bg-white text-gray-600'}`}>
                  <ArrowUpCircle size={15} /> Kredit (masuk)
                </button>
                <button onClick={() => setTxnType('debit')} className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 ${txnType === 'debit' ? 'bg-[#EA4335] text-white' : 'bg-white text-gray-600'}`}>
                  <ArrowDownCircle size={15} /> Debit (keluar)
                </button>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Jumlah (Rp)</label>
                <input type="number" value={txnAmount} onChange={e => setTxnAmount(e.target.value)}
                  placeholder="0" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Sumber</label>
                <select value={txnSource} onChange={e => setTxnSource(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]">
                  {['gaji', 'reward', 'thr', 'transfer', 'pengeluaran', 'lainnya'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Catatan</label>
                <input value={txnNote} onChange={e => setTxnNote(e.target.value)}
                  placeholder="Keterangan transaksi" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowAddTxn(false)} className="flex-1 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-lg">Batal</button>
                <button onClick={addTransaction} className="flex-1 py-2.5 bg-[#4285F4] text-white text-sm font-medium rounded-lg hover:bg-blue-600">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
