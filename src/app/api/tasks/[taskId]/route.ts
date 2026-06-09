import { z } from 'zod';
import { prisma } from '@/server/db';
import { ok, fail, parseBody, handleError } from '@/lib/http';
import { requireUserId } from '@/server/auth/session';
import { updateTask, deleteTask } from '@/server/repositories/tasksRepo';

type Ctx = { params: Promise<{ taskId: string }> };

async function ownChildId(taskId: string, userId: string): Promise<string | null> {
  const task = await prisma.task.findFirst({ where: { id: taskId, child: { parentId: userId } } });
  return task?.childId ?? null;
}

const patch = z.object({
  title: z.string().optional(), description: z.string().optional(),
  category: z.string().optional(), point: z.coerce.number().int().optional(),
  requiresApproval: z.boolean().optional(), isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { taskId } = await params;
    const childId = await ownChildId(taskId, userId);
    if (!childId) return fail('Tugas tidak ditemukan', 404);
    await updateTask(taskId, childId, await parseBody(req, patch));
    return ok({ ok: true });
  } catch (e) { return handleError(e); }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { taskId } = await params;
    const childId = await ownChildId(taskId, userId);
    if (!childId) return fail('Tugas tidak ditemukan', 404);
    await deleteTask(taskId, childId);
    return ok({ ok: true });
  } catch (e) { return handleError(e); }
}
