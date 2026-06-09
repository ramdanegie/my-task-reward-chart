import { z } from 'zod';
import { cookies } from 'next/headers';
import { ok, fail, parseBody, handleError } from '@/lib/http';
import { getChildByAccessCode } from '@/server/repositories/childrenRepo';
import { signChildToken } from '@/server/auth/childSession';

const schema = z.object({ code: z.string().min(4) });

export async function POST(req: Request) {
  try {
    const { code } = await parseBody(req, schema);
    const child = await getChildByAccessCode(code.toUpperCase());
    if (!child || !child.isActive) return fail('Kode tidak valid', 404);
    const token = signChildToken(child.id, process.env.CHILD_SESSION_SECRET ?? '');
    (await cookies()).set('child_session', token, {
      httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30,
    });
    return ok({ ok: true, name: child.name });
  } catch (e) { return handleError(e); }
}

export async function DELETE() {
  (await cookies()).delete('child_session');
  return ok({ ok: true });
}
