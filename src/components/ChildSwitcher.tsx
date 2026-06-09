'use client';
import { useActiveChild } from '@/context/ActiveChild';

export default function ChildSwitcher() {
  const { children, activeChildId, setActiveChildId, isLoading } = useActiveChild();
  if (isLoading) return null;
  if (!children.length) return <span className="text-xs text-gray-400 px-3">Belum ada anak</span>;
  return (
    <select
      value={activeChildId ?? ''}
      onChange={(e) => setActiveChildId(e.target.value)}
      className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
    >
      {children.map((c) => <option key={c.id} value={c.id}>{c.avatar} {c.name}</option>)}
    </select>
  );
}
