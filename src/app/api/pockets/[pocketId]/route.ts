import { prisma } from '@/server/db';
import { ok, fail, handleError } from '@/lib/http';
import { requireUserId } from '@/server/auth/session';
import { deletePocket } from '@/server/repositories/financeRepo';

export async function DELETE(_req: Request, { params }: { params: Promise<{ pocketId: string }> }) {
  try {
    const userId = await requireUserId();
    const { pocketId } = await params;
    const pocket = await prisma.pocket.findFirst({ where: { id: pocketId, child: { parentId: userId } } });
    if (!pocket) return fail('Kantong tidak ditemukan', 404);
    await deletePocket(pocketId, pocket.childId);
    return ok({ ok: true });
  } catch (e) { return handleError(e); }
}
