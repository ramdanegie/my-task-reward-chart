'use client';

import { useRouter } from 'next/navigation';
import { LayoutDashboard, Star, ChevronRight, BarChart2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#4285F4] mb-5 shadow-lg">
            <BarChart2 size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">MTRC</h1>
          <p className="text-base text-gray-500">My Task Reward Chart</p>
          <p className="text-sm text-gray-400 mt-2">Bangun Kebiasaan Baik Anak dengan Menyenangkan</p>
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
          {/* Parent Button */}
          <button
            onClick={() => router.push('/parent/login')}
            className="w-full flex items-center gap-4 p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-[#4285F4] hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-[#4285F4] transition-colors">
              <LayoutDashboard size={24} className="text-[#4285F4] group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1 text-left">
              <h2 className="text-base font-semibold text-gray-900">Akses Orang Tua</h2>
              <p className="text-sm text-gray-500">Kelola tugas dan pantau progress anak</p>
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:text-[#4285F4] transition-colors" />
          </button>

          {/* Child Button */}
          <button
            onClick={() => router.push('/child/enter')}
            className="w-full flex items-center gap-4 p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-[#34A853] hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-[#34A853] transition-colors">
              <Star size={24} className="text-[#34A853] group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1 text-left">
              <h2 className="text-base font-semibold text-gray-900">Mode Anak</h2>
              <p className="text-sm text-gray-500">Lihat tugas dan kumpulkan poin</p>
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:text-[#34A853] transition-colors" />
          </button>
        </div>

        {/* Google Brand Color Dots */}
        <div className="mt-12 flex justify-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#4285F4]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#EA4335]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#FBBC04]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#34A853]"></div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Demo Frontend · Versi MVP 0.1.0</p>
        </div>
      </div>
    </div>
  );
}
