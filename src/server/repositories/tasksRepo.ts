import { prisma } from '@/server/db';

export function listTasks(childId: string) {
  return prisma.task.findMany({ where: { childId }, orderBy: { createdAt: 'asc' } });
}
export function createTask(childId: string, data: {
  title: string; description?: string; category: string; point: number; requiresApproval?: boolean;
}) {
  return prisma.task.create({ data: { ...data, childId } });
}
export function updateTask(id: string, childId: string, data: Record<string, unknown>) {
  return prisma.task.updateMany({ where: { id, childId }, data });
}
export function deleteTask(id: string, childId: string) {
  return prisma.task.deleteMany({ where: { id, childId } });
}
