'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import ParentSidebar from '@/components/ParentSidebar';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <ParentSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="flex md:hidden items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
            <Menu size={22} />
          </button>
          <span className="font-bold text-gray-900 text-sm">MTRC — Parent Mode</span>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
