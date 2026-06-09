import { prisma } from '@/server/db';
import { ok, fail, handleError } from '@/lib/http';
import { requireUserId } from '@/server/auth/session';
import { deleteNote } from '@/server/repositories/notesRepo';

export async function DELETE(_req: Request, { params }: { params: Promise<{ noteId: string }> }) {
  try {
    const userId = await requireUserId();
    const { noteId } = await params;
    const note = await prisma.parentNote.findFirst({ where: { id: noteId, child: { parentId: userId } } });
    if (!note) return fail('Catatan tidak ditemukan', 404);
    await deleteNote(noteId, note.childId);
    return ok({ ok: true });
  } catch (e) { return handleError(e); }
}
