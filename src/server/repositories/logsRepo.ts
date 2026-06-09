import { prisma } from '@/server/db';

export function logsForDate(childId: string, date: string) {
  return prisma.dailyTaskLog.findMany({ where: { childId, logDate: date } });
}
export function logsInRange(childId: string, start: string, end: string) {
  return prisma.dailyTaskLog.findMany({
    where: { childId, logDate: { gte: start, lte: end } },
  });
}
export function upsertLog(childId: string, taskId: string, logDate: string, data: {
  status: string; earnedPoint: number; completedAt?: Date | null;
}) {
  return prisma.dailyTaskLog.upsert({
    where: { taskId_logDate: { taskId, logDate } },
    create: { childId, taskId, logDate, ...data },
    update: data,
  });
}
export function setLogStatus(id: string, childId: string, data: {
  status: string; earnedPoint: number; approvedAt?: Date | null;
}) {
  return prisma.dailyTaskLog.updateMany({ where: { id, childId }, data });
}
