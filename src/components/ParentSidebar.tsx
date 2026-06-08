'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, CheckSquare, Gift, FileText, BookMarked, Settings, LogOut, BarChart2, X, Wallet } from 'lucide-react';

const navItems = [
  { href: '/parent/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
  { href: '/parent/child', label: 'Anak', icon: <Users size={18} /> },
  { href: '/parent/tasks', label: 'Tugas', icon: <CheckSquare size={18} /> },
  { href: '/parent/rewards', label: 'Reward', icon: <Gift size={18} /> },
  { href: '/parent/checklist', label: 'Checklist', icon: <BookMarked size={18} /> },
  { href: '/parent/reports', label: 'Laporan', icon: <FileText size={18} /> },
  { href: '/parent/finance', label: 'Keuangan', icon: <Wallet size={18} /> },
  { href: '/parent/settings', label: 'Pengaturan', icon: <Settings size={18} /> },
];

interface Props {
  open?: boolean;
  onClose?: () => void;
}

export default function ParentSidebar({ open, onClose }: Props) {
  const pathname = usePathname();

  const sidebar = (
    <aside className="w-60 bg-white border-r border-gray-100 h-full flex flex-col shadow-sm">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <Link href="/parent/dashboard" onClick={onClose} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-lg bg-[#4285F4] flex items-center justify-center">
            <BarChart2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm leading-tight">MTRC</h1>
            <p className="text-xs text-gray-400">Parent Mode</p>
          </div>
        </Link>
        {/* Close button — only shown in mobile drawer */}
        {onClose && (
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 md:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                isActive ? 'bg-blue-50 text-[#4285F4] font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={isActive ? 'text-[#4285F4]' : 'text-gray-400'}>{item.icon}</span>
              <span>{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4285F4]" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:bg-red-50 hover:text-[#EA4335] rounded-lg transition-all text-sm">
          <LogOut size={18} />
          <span>Keluar</span>
        </Link>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: static sidebar */}
      <div className="hidden md:flex md:w-60 md:shrink-0 h-screen sticky top-0">
        {sidebar}
      </div>

      {/* Mobile: drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={onClose} />
          <div className="relative h-full">
            {sidebar}
          </div>
        </div>
      )}
    </>
  );
}
