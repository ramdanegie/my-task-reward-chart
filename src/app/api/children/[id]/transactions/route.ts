import { z } from 'zod';
import { prisma } from '@/server/db';
import { ok, fail, parseBody, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { listTransactions, createTransaction } from '@/server/repositories/financeRepo';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    const url = new URL(req.url);
    return ok(await listTransactions(id,
      url.searchParams.get('start') ?? undefined, url.searchParams.get('end') ?? undefined));
  } catch (e) { return handleError(e); }
}

const schema = z.object({
  pocketId: z.string(),
  amount: z.coerce.number().int().positive(),
  txnType: z.enum(['credit', 'debit']),
  source: z.enum(['gaji', 'reward', 'transfer', 'pengeluaran', 'manual']).optional(),
  note: z.string().optional(),
});

export async function POST(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    const body = await parseBody(req, schema);
    const pocket = await prisma.pocket.findFirst({ where: { id: body.pocketId, childId: id } });
    if (!pocket) return fail('Kantong tidak ditemukan', 404);
    return ok(await createTransaction({ ...body, source: body.source ?? 'manual' }), 201);
  } catch (e) { return handleError(e); }
}
