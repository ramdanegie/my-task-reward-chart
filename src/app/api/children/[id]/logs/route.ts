import { z } from 'zod';
import { ok, parseBody, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { prisma } from '@/server/db';
import { logsForDate, upsertLog } from '@/server/repositories/logsRepo';
import { toDateStr } from '@/lib/dates';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    const date = new URL(req.url).searchParams.get('date') ?? toDateStr(new Date());
    return ok(await logsForDate(id, date));
  } catch (e) { return handleError(e); }
}

const schema = z.object({ taskId: z.string(), date: z.string(), done: z.boolean() });

export async function POST(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    const { taskId, date, done } = await parseBody(req, schema);
    const task = await prisma.task.findFirst({ where: { id: taskId, childId: id } });
    if (!task) return ok({ ok: false }, 404);
    const status = !done ? 'pending' : task.requiresApproval ? 'waiting_approval' : 'completed';
    const earnedPoint = status === 'completed' ? task.point : 0;
    return ok(await upsertLog(id, taskId, date, {
      status, earnedPoint, completedAt: done ? new Date() : null,
    }));
  } catch (e) { return handleError(e); }
}
