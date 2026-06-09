import { z } from 'zod';
import { ok, parseBody, fail, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { getChild, updateChild, deleteChild } from '@/server/repositories/childrenRepo';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const child = await getChild(id, userId);
    return child ? ok(child) : fail('Anak tidak ditemukan', 404);
  } catch (e) { return handleError(e); }
}

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  age: z.coerce.number().int().optional(),
  avatar: z.string().optional(),
  dailyPointTarget: z.coerce.number().int().optional(),
  weeklyPointTarget: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    await updateChild(id, userId, await parseBody(req, patchSchema));
    return ok({ ok: true });
  } catch (e) { return handleError(e); }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await deleteChild(id, userId);
    return ok({ ok: true });
  } catch (e) { return handleError(e); }
}
