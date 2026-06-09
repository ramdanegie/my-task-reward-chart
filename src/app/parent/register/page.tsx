'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ParentRegister() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    if (!res.ok) { setError((await res.json()).error ?? 'Gagal daftar'); setLoading(false); return; }
    await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    router.push('/parent/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Daftar Orang Tua</h1>
        <p className="text-sm text-gray-500 mb-5">Buat akun baru</p>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
          <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
          <input type="password" required placeholder="Password (min 6)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
          <button disabled={loading} type="submit"
            className="w-full bg-[#4285F4] text-white py-2.5 rounded-lg hover:bg-blue-600 text-sm font-semibold disabled:opacity-60">
            {loading ? 'Memproses…' : 'Daftar'}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Sudah punya akun? <Link href="/parent/login" className="text-[#4285F4] font-medium">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
