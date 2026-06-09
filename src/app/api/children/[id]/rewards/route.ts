import { z } from 'zod';
import { ok, parseBody, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { listRewards, createReward } from '@/server/repositories/rewardsRepo';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    return ok(await listRewards(id));
  } catch (e) { return handleError(e); }
}

const schema = z.object({
  title: z.string().min(1), description: z.string().optional(),
  rewardType: z.string().min(1), requiredPoint: z.coerce.number().int().min(0),
});

export async function POST(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    return ok(await createReward(id, await parseBody(req, schema)), 201);
  } catch (e) { return handleError(e); }
}
