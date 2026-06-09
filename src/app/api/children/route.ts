import { z } from 'zod';
import { prisma } from '@/server/db';
import { ok, parseBody, handleError } from '@/lib/http';
import { requireUserId } from '@/server/auth/session';
import { listChildren, createChild } from '@/server/repositories/childrenRepo';
import { DEFAULT_TASKS, DEFAULT_REWARDS } from '@/server/defaults';

export async function GET() {
  try {
    const userId = await requireUserId();
    return ok(await listChildren(userId));
  } catch (e) { return handleError(e); }
}

const createSchema = z.object({
  name: z.string().min(1),
  age: z.coerce.number().int().min(1).max(18),
  avatar: z.string().optional(),
  dailyPointTarget: z.coerce.number().int().optional(),
  weeklyPointTarget: z.coerce.number().int().optional(),
  seedDefaults: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const { seedDefaults, ...data } = await parseBody(req, createSchema);
    const child = await createChild(userId, data);
    if (seedDefaults) {
      await prisma.task.createMany({ data: DEFAULT_TASKS.map((t) => ({ ...t, childId: child.id })) });
      await prisma.reward.createMany({ data: DEFAULT_REWARDS.map((r) => ({ ...r, childId: child.id })) });
    }
    return ok(child, 201);
  } catch (e) { return handleError(e); }
}
