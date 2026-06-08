'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, Star, Gift, BarChart2 } from 'lucide-react';

const navItems = [
  { href: '/child', label: 'Tugas', icon: ClipboardList },
  { href: '/child/points', label: 'Poin Saya', icon: Star },
  { href: '/child/rewards', label: 'Reward', icon: Gift },
];

export default function ChildLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#4285F4] flex items-center justify-center">
            <BarChart2 size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">MTRC</h1>
            <p className="text-xs text-gray-400">Mode Anak</p>
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
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                  isActive ? 'text-[#4285F4]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
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
