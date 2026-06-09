import { z } from 'zod';
import { prisma } from '@/server/db';
import { ok, fail, parseBody, handleError } from '@/lib/http';
import { requireUserId } from '@/server/auth/session';
import { updateReward, deleteReward } from '@/server/repositories/rewardsRepo';

type Ctx = { params: Promise<{ rewardId: string }> };

async function ownChildId(rewardId: string, userId: string): Promise<string | null> {
  const r = await prisma.reward.findFirst({ where: { id: rewardId, child: { parentId: userId } } });
  return r?.childId ?? null;
}

const patch = z.object({
  title: z.string().optional(), description: z.string().optional(),
  rewardType: z.string().optional(), requiredPoint: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { rewardId } = await params;
    const childId = await ownChildId(rewardId, userId);
    if (!childId) return fail('Reward tidak ditemukan', 404);
    await updateReward(rewardId, childId, await parseBody(req, patch));
    return ok({ ok: true });
  } catch (e) { return handleError(e); }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { rewardId } = await params;
    const childId = await ownChildId(rewardId, userId);
    if (!childId) return fail('Reward tidak ditemukan', 404);
    await deleteReward(rewardId, childId);
    return ok({ ok: true });
  } catch (e) { return handleError(e); }
}
