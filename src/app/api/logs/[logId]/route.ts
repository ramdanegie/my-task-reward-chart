import { z } from 'zod';
import { prisma } from '@/server/db';
import { ok, fail, parseBody, handleError } from '@/lib/http';
import { requireUserId } from '@/server/auth/session';
import { setLogStatus } from '@/server/repositories/logsRepo';

type Ctx = { params: Promise<{ logId: string }> };
const schema = z.object({ action: z.enum(['approve', 'reject']) });

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { logId } = await params;
    const log = await prisma.dailyTaskLog.findFirst({
      where: { id: logId, child: { parentId: userId } }, include: { task: true },
    });
    if (!log) return fail('Log tidak ditemukan', 404);
    const { action } = await parseBody(req, schema);
    const data = action === 'approve'
      ? { status: 'completed', earnedPoint: log.task.point, approvedAt: new Date() }
      : { status: 'missed', earnedPoint: 0, approvedAt: new Date() };
    await setLogStatus(logId, log.childId, data);
    return ok({ ok: true });
  } catch (e) { return handleError(e); }
}
