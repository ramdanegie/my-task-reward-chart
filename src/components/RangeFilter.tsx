'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { RangeType } from '@/domain/types';
import { getWeekRange, getMonthRange, formatPeriodLabel } from '@/lib/period';

interface Props {
  range: RangeType; date: string;
  onRangeChange: (r: RangeType) => void; onDateChange: (d: string) => void;
}

export default function RangeFilter({ range, date, onRangeChange, onDateChange }: Props) {
  const shift = (dir: -1 | 1) => {
    const [y, m, d] = date.split('-').map(Number);
    const base = new Date(y, m - 1, d);
    if (range === 'week') base.setDate(base.getDate() + dir * 7);
    else base.setMonth(base.getMonth() + dir);
    onDateChange(`${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`);
  };
  const r = range === 'week' ? getWeekRange(date) : getMonthRange(date);
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
        {(['week', 'month'] as RangeType[]).map((rt) => (
          <button key={rt} onClick={() => onRangeChange(rt)}
            className={`px-3 py-1.5 text-sm ${range === rt ? 'bg-[#4285F4] text-white' : 'bg-white text-gray-600'}`}>
            {rt === 'week' ? 'Minggu' : 'Bulan'}
          </button>
        ))}
      </div>
      <div className="inline-flex items-center gap-2">
        <button onClick={() => shift(-1)} className="p-1.5 rounded hover:bg-gray-100"><ChevronLeft size={16} /></button>
        <span className="text-sm text-gray-600 min-w-32 text-center">{formatPeriodLabel(range, r.start, r.end)}</span>
        <button onClick={() => shift(1)} className="p-1.5 rounded hover:bg-gray-100"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}
