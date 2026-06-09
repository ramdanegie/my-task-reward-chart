import { z } from 'zod';
import { prisma } from '@/server/db';
import { ok, fail, parseBody, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { transfer } from '@/server/repositories/financeRepo';

const schema = z.object({
  fromPocketId: z.string(), toPocketId: z.string(),
  amount: z.coerce.number().int().positive(), note: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    const { fromPocketId, toPocketId, amount, note } = await parseBody(req, schema);
    if (fromPocketId === toPocketId) return fail('Kantong asal dan tujuan sama', 400);
    const count = await prisma.pocket.count({ where: { id: { in: [fromPocketId, toPocketId] }, childId: id } });
    if (count !== 2) return fail('Kantong tidak valid', 404);
    await transfer(fromPocketId, toPocketId, amount, note);
    return ok({ ok: true }, 201);
  } catch (e) { return handleError(e); }
}
