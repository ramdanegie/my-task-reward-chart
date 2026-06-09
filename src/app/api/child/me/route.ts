import { ok, fail, handleError } from '@/lib/http';
import { prisma } from '@/server/db';
import { getChildSessionId } from '@/server/auth/session';
import { pocketsWithBalances } from '@/server/repositories/financeRepo';
import { toDateStr } from '@/lib/dates';

export async function GET() {
  try {
    const childId = await getChildSessionId();
    if (!childId) return fail('Belum masuk', 401);
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) return fail('Anak tidak ditemukan', 404);
    const today = toDateStr(new Date());
    const [tasks, logs, rewards, pockets] = await Promise.all([
      prisma.task.findMany({ where: { childId, isActive: true } }),
      prisma.dailyTaskLog.findMany({ where: { childId, logDate: today } }),
      prisma.reward.findMany({ where: { childId, isActive: true }, orderBy: { requiredPoint: 'asc' } }),
      pocketsWithBalances(childId),
    ]);
    return ok({
      child: { id: child.id, name: child.name, avatar: child.avatar, dailyPointTarget: child.dailyPointTarget },
      tasks, logs, rewards, pockets, total: pockets.reduce((s, p) => s + p.balance, 0), today,
    });
  } catch (e) { return handleError(e); }
}
