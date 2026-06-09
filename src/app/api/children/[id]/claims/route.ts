import { z } from 'zod';
import { prisma } from '@/server/db';
import { ok, fail, parseBody, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { listClaims, createClaim } from '@/server/repositories/rewardsRepo';
import { createTransaction } from '@/server/repositories/financeRepo';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    return ok(await listClaims(id));
  } catch (e) { return handleError(e); }
}

const schema = z.object({ rewardId: z.string(), pocketId: z.string().optional() });

export async function POST(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    const { rewardId, pocketId } = await parseBody(req, schema);
    const reward = await prisma.reward.findFirst({ where: { id: rewardId, childId: id } });
    if (!reward) return fail('Reward tidak ditemukan', 404);
    const claim = await createClaim(id, {
      rewardId, totalPointUsed: reward.requiredPoint, pocketId: pocketId ?? null,
      status: 'given', givenAt: new Date(),
    });
    if (pocketId) {
      await createTransaction({ pocketId, amount: reward.requiredPoint, txnType: 'credit', source: 'reward', note: reward.title });
    }
    return ok(claim, 201);
  } catch (e) { return handleError(e); }
}
