import type { ChildSummary, RangeType } from '@/domain/types';
import { sumCompletedPoints, pointsByDay } from './pointsService';

interface SummaryTask { id: string; title: string; category: string }
interface SummaryLog { taskId: string; logDate: string; status: string; earnedPoint: number }

interface BuildArgs {
  tasks: SummaryTask[];
  logs: SummaryLog[];
  days: string[];
  dailyTarget: number;
  weeklyTarget: number;
  rangeType: RangeType;
}

const DOW = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function labelFor(date: string, rangeType: RangeType): string {
  const [y, m, d] = date.split('-').map(Number);
  if (rangeType === 'week') return DOW[new Date(y, m - 1, d).getDay()];
  return String(d);
}

export function buildSummary(args: BuildArgs): ChildSummary {
  const { tasks, logs, days, dailyTarget, weeklyTarget, rangeType } = args;
  const totalPoints = sumCompletedPoints(logs);
  const byDay = pointsByDay(logs, days);
  const completed = logs.filter((l) => l.status === 'completed');
  const taskById = new Map(tasks.map((t) => [t.id, t]));

  const catMap = new Map<string, number>();
  for (const l of completed) {
    const cat = taskById.get(l.taskId)?.category ?? 'lainnya';
    catMap.set(cat, (catMap.get(cat) ?? 0) + l.earnedPoint);
  }

  const completedCount = new Map<string, number>();
  const missedCount = new Map<string, number>();
  for (const l of logs) {
    if (l.status === 'completed') completedCount.set(l.taskId, (completedCount.get(l.taskId) ?? 0) + 1);
    if (l.status === 'missed') missedCount.set(l.taskId, (missedCount.get(l.taskId) ?? 0) + 1);
  }

  const topTasks = [...completedCount.entries()]
    .map(([taskId, c]) => ({ taskId, title: taskById.get(taskId)?.title ?? '', completed: c }))
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 5);

  const missedTasks = [...missedCount.entries()]
    .map(([taskId, c]) => ({ taskId, title: taskById.get(taskId)?.title ?? '', missed: c }))
    .sort((a, b) => b.missed - a.missed)
    .slice(0, 5);

  const periodTarget = rangeType === 'week' ? weeklyTarget : weeklyTarget * 4;

  return {
    totalPoints,
    dailyTargetPct: dailyTarget ? Math.min((totalPoints / dailyTarget) * 100, 100) : 0,
    weeklyTargetPct: periodTarget ? Math.min((totalPoints / periodTarget) * 100, 100) : 0,
    completedCount: completed.length,
    totalTaskInstances: logs.length,
    series: byDay.map((p) => ({ label: labelFor(p.date, rangeType), date: p.date, points: p.points })),
    categoryBreakdown: [...catMap.entries()].map(([name, value]) => ({ name, value })),
    topTasks,
    missedTasks,
  };
}
