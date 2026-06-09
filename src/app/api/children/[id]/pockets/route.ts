import { z } from 'zod';
import { ok, parseBody, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { pocketsWithBalances, createPocket } from '@/server/repositories/financeRepo';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    const pockets = await pocketsWithBalances(id);
    return ok({ pockets, total: pockets.reduce((s, p) => s + p.balance, 0) });
  } catch (e) { return handleError(e); }
}

const schema = z.object({
  name: z.string().min(1), type: z.string().optional(),
  initialBalance: z.coerce.number().int().min(0).optional(),
});

export async function POST(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    return ok(await createPocket(id, await parseBody(req, schema)), 201);
  } catch (e) { return handleError(e); }
}
