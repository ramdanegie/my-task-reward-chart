import { ok, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { regenerateAccessCode, getChild } from '@/server/repositories/childrenRepo';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    await regenerateAccessCode(id, userId);
    const child = await getChild(id, userId);
    return ok({ accessCode: child?.accessCode });
  } catch (e) { return handleError(e); }
}
