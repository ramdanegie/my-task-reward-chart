'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiSend } from '@/lib/api';

export default function ChildEnter() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await apiSend('/api/child-access', 'POST', { code: code.trim().toUpperCase() });
      router.push('/child');
    } catch {
      setError('Kode tidak valid'); setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
        <div className="text-5xl mb-3">🧒</div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Halo!</h1>
        <p className="text-sm text-gray-500 mb-5">Masukkan kode dari orang tua</p>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6}
          placeholder="KODE" className="w-full text-center tracking-[0.4em] text-2xl font-bold px-3 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#34A853]" />
        <button disabled={loading} type="submit"
          className="w-full bg-[#34A853] text-white py-3 rounded-xl text-base font-semibold disabled:opacity-60">
          {loading ? 'Memeriksa…' : 'Masuk'}
        </button>
      </form>
    </div>
  );
}
