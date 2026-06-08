'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, Star, Gift, BarChart2, Wallet } from 'lucide-react';
import { dummyChildren } from '@/data/dummy';

const ACTIVE_CHILD_ID = 'child-1';

const navItems = [
  { href: '/child', label: 'Tugas', icon: ClipboardList },
  { href: '/child/points', label: 'Poin', icon: Star },
  { href: '/child/rewards', label: 'Reward', icon: Gift },
  { href: '/child/wallet', label: 'Kantong', icon: Wallet },
];

export default function ChildLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const child = dummyChildren.find(c => c.id === ACTIVE_CHILD_ID) || dummyChildren[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4285F4] flex items-center justify-center">
              <BarChart2 size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">MTRC</h1>
              <p className="text-xs text-gray-400">Mode Anak</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#4285F4] flex items-center justify-center">
              <span className="text-white text-xs font-bold">{child.name[0]}</span>
            </div>
            <span className="text-sm font-medium text-gray-700">{child.name}</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-4 py-5 pb-28">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-10">
        <div className="max-w-2xl mx-auto flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${isActive ? 'text-[#4285F4]' : 'text-gray-400 hover:text-gray-600'}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-xs font-medium">{label}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-[#4285F4]" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
