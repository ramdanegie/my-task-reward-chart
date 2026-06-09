import { ok, fail, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { getChild } from '@/server/repositories/childrenRepo';
import { listTasks } from '@/server/repositories/tasksRepo';
import { logsInRange } from '@/server/repositories/logsRepo';
import { buildSummary } from '@/server/services/summaryService';
import { getWeekRange, getMonthRange, eachDayInRange, toDateStr } from '@/lib/dates';
import type { RangeType } from '@/domain/types';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    const child = await getChild(id, userId);
    if (!child) return fail('Anak tidak ditemukan', 404);

    const url = new URL(req.url);
    const range = (url.searchParams.get('range') as RangeType) ?? 'week';
    const date = url.searchParams.get('date') ?? toDateStr(new Date());
    const { start, end } = range === 'month' ? getMonthRange(date) : getWeekRange(date);

    const [tasks, logs] = await Promise.all([listTasks(id), logsInRange(id, start, end)]);
    const summary = buildSummary({
      tasks: tasks.map((t) => ({ id: t.id, title: t.title, category: t.category })),
      logs: logs.map((l) => ({ taskId: l.taskId, logDate: l.logDate, status: l.status, earnedPoint: l.earnedPoint })),
      days: eachDayInRange(start, end),
      dailyTarget: child.dailyPointTarget,
      weeklyTarget: child.weeklyPointTarget,
      rangeType: range,
    });
    return ok({ range, start, end, summary });
  } catch (e) { return handleError(e); }
}
