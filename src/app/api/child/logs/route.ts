import { z } from 'zod';
import { prisma } from '@/server/db';
import { ok, fail, parseBody, handleError } from '@/lib/http';
import { getChildSessionId } from '@/server/auth/session';
import { upsertLog } from '@/server/repositories/logsRepo';

const schema = z.object({ taskId: z.string(), date: z.string(), done: z.boolean() });

export async function POST(req: Request) {
  try {
    const childId = await getChildSessionId();
    if (!childId) return fail('Belum masuk', 401);
    const { taskId, date, done } = await parseBody(req, schema);
    const task = await prisma.task.findFirst({ where: { id: taskId, childId } });
    if (!task) return fail('Tugas tidak ditemukan', 404);
    const status = !done ? 'pending' : task.requiresApproval ? 'waiting_approval' : 'completed';
    const earnedPoint = status === 'completed' ? task.point : 0;
    return ok(await upsertLog(childId, taskId, date, {
      status, earnedPoint, completedAt: done ? new Date() : null,
    }));
  } catch (e) { return handleError(e); }
}
