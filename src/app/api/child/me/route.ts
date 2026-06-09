import { ok, fail, handleError } from '@/lib/http';
import { prisma } from '@/server/db';
import { getChildSessionId } from '@/server/auth/session';
import { pocketsWithBalances } from '@/server/repositories/financeRepo';
import { logsInRange } from '@/server/repositories/logsRepo';
import { sumCompletedPoints, pointsByDay } from '@/server/services/pointsService';
import { toDateStr, getWeekRange, eachDayInRange } from '@/lib/dates';

const DOW = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
function dow(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return DOW[new Date(y, m - 1, d).getDay()];
}

export async function GET() {
  try {
    const childId = await getChildSessionId();
    if (!childId) return fail('Belum masuk', 401);
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) return fail('Anak tidak ditemukan', 404);

    const today = toDateStr(new Date());
    const week = getWeekRange(today);
    const [tasks, logs, rewards, pockets, weekLogs] = await Promise.all([
      prisma.task.findMany({ where: { childId, isActive: true } }),
      prisma.dailyTaskLog.findMany({ where: { childId, logDate: today } }),
      prisma.reward.findMany({ where: { childId, isActive: true }, orderBy: { requiredPoint: 'asc' } }),
      pocketsWithBalances(childId),
      logsInRange(childId, week.start, week.end),
    ]);

    const wl = weekLogs.map((l) => ({ logDate: l.logDate, status: l.status, earnedPoint: l.earnedPoint }));
    const weekPoints = sumCompletedPoints(wl);
    const weekSeries = pointsByDay(wl, eachDayInRange(week.start, week.end)).map((p) => ({ label: dow(p.date), points: p.points }));

    return ok({
      child: {
        id: child.id, name: child.name, avatar: child.avatar,
        dailyPointTarget: child.dailyPointTarget, weeklyPointTarget: child.weeklyPointTarget,
      },
      tasks, logs, rewards, pockets, total: pockets.reduce((s, p) => s + p.balance, 0),
      today, weekPoints, weekSeries,
    });
  } catch (e) { return handleError(e); }
}
