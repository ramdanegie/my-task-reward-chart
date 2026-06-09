import { z } from 'zod';
import { ok, parseBody, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { listNotes, createNote } from '@/server/repositories/notesRepo';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    const url = new URL(req.url);
    return ok(await listNotes(id, url.searchParams.get('start') ?? undefined, url.searchParams.get('end') ?? undefined));
  } catch (e) { return handleError(e); }
}

const schema = z.object({ noteDate: z.string(), note: z.string().min(1) });

export async function POST(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    const { noteDate, note } = await parseBody(req, schema);
    return ok(await createNote(id, noteDate, note), 201);
  } catch (e) { return handleError(e); }
}
