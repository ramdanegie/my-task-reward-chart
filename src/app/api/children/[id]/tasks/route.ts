import { z } from 'zod';
import { ok, parseBody, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { listTasks, createTask } from '@/server/repositories/tasksRepo';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    return ok(await listTasks(id));
  } catch (e) { return handleError(e); }
}

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  point: z.coerce.number().int().min(0),
  requiresApproval: z.boolean().optional(),
});

export async function POST(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    return ok(await createTask(id, await parseBody(req, schema)), 201);
  } catch (e) { return handleError(e); }
}
