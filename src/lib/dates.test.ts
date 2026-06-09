import { describe, it, expect } from 'vitest';
import { toDateStr, getWeekRange, getMonthRange, eachDayInRange } from './dates';

describe('dates', () => {
  it('formats a date to YYYY-MM-DD', () => {
    expect(toDateStr(new Date('2026-06-09T10:00:00'))).toBe('2026-06-09');
  });

  it('returns Monday..Sunday for the ISO week of a date', () => {
    // 2026-06-09 is a Tuesday
    expect(getWeekRange('2026-06-09')).toEqual({ start: '2026-06-08', end: '2026-06-14' });
  });

  it('returns first..last day of month', () => {
    expect(getMonthRange('2026-06-09')).toEqual({ start: '2026-06-01', end: '2026-06-30' });
  });

  it('lists each day in an inclusive range', () => {
    expect(eachDayInRange('2026-06-08', '2026-06-10')).toEqual([
      '2026-06-08', '2026-06-09', '2026-06-10',
    ]);
  });
});
