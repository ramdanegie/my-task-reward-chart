import { getWeekRange, getMonthRange } from './dates';
import { formatDateID } from './format';

export { getWeekRange, getMonthRange };

export function formatPeriodLabel(range: 'week' | 'month', start: string, end: string): string {
  if (range === 'month') {
    const [y, m] = start.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }
  return `${formatDateID(start)} – ${formatDateID(end)}`;
}
