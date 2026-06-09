import { prisma } from '@/server/db';

export function listNotes(childId: string, start?: string, end?: string) {
  return prisma.parentNote.findMany({
    where: { childId, ...(start && end ? { noteDate: { gte: start, lte: end } } : {}) },
    orderBy: { noteDate: 'desc' },
  });
}
export function createNote(childId: string, noteDate: string, note: string) {
  return prisma.parentNote.create({ data: { childId, noteDate, note } });
}
export function deleteNote(id: string, childId: string) {
  return prisma.parentNote.deleteMany({ where: { id, childId } });
}
