import { describe, it, expect } from 'vitest';
import { sumCompletedPoints, pointsByDay } from './pointsService';

const logs = [
  { logDate: '2026-06-08', status: 'completed', earnedPoint: 10 },
  { logDate: '2026-06-08', status: 'waiting_approval', earnedPoint: 0 },
  { logDate: '2026-06-09', status: 'completed', earnedPoint: 5 },
  { logDate: '2026-06-09', status: 'completed', earnedPoint: 5 },
];

describe('pointsService', () => {
  it('sums only completed points', () => {
    expect(sumCompletedPoints(logs)).toBe(20);
  });

  it('groups completed points by day across a range', () => {
    expect(pointsByDay(logs, ['2026-06-08', '2026-06-09', '2026-06-10'])).toEqual([
      { date: '2026-06-08', points: 10 },
      { date: '2026-06-09', points: 10 },
      { date: '2026-06-10', points: 0 },
    ]);
  });
});
