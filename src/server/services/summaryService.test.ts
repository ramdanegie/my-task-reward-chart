import { describe, it, expect } from 'vitest';
import { buildSummary } from './summaryService';

const tasks = [
  { id: 't1', title: 'Mandi', category: 'kebersihan' },
  { id: 't2', title: 'Belajar', category: 'belajar' },
];
const logs = [
  { taskId: 't1', logDate: '2026-06-08', status: 'completed', earnedPoint: 5 },
  { taskId: 't1', logDate: '2026-06-09', status: 'completed', earnedPoint: 5 },
  { taskId: 't2', logDate: '2026-06-08', status: 'missed', earnedPoint: 0 },
];

describe('summaryService', () => {
  it('builds a summary for a week range', () => {
    const s = buildSummary({
      tasks, logs,
      days: ['2026-06-08', '2026-06-09'],
      dailyTarget: 60, weeklyTarget: 350, rangeType: 'week',
    });
    expect(s.totalPoints).toBe(10);
    expect(s.completedCount).toBe(2);
    expect(s.series.map((p) => p.points)).toEqual([5, 5]);
    expect(s.categoryBreakdown).toContainEqual({ name: 'kebersihan', value: 10 });
    expect(s.topTasks[0]).toEqual({ taskId: 't1', title: 'Mandi', completed: 2 });
    expect(s.missedTasks[0]).toEqual({ taskId: 't2', title: 'Belajar', missed: 1 });
  });
});
