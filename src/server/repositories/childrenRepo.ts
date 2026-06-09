import { prisma } from '@/server/db';
import { generateAccessCode } from '@/server/auth/childSession';

export function listChildren(parentId: string) {
  return prisma.child.findMany({ where: { parentId }, orderBy: { createdAt: 'asc' } });
}

export function getChild(childId: string, parentId: string) {
  return prisma.child.findFirst({ where: { id: childId, parentId } });
}

export function getChildByAccessCode(code: string) {
  return prisma.child.findUnique({ where: { accessCode: code } });
}

export function createChild(parentId: string, data: {
  name: string; age: number; avatar?: string; dailyPointTarget?: number; weeklyPointTarget?: number;
}) {
  return prisma.child.create({
    data: { ...data, parentId, accessCode: generateAccessCode() },
  });
}

export function updateChild(childId: string, parentId: string, data: Record<string, unknown>) {
  return prisma.child.updateMany({ where: { id: childId, parentId }, data });
}

export function regenerateAccessCode(childId: string, parentId: string) {
  return prisma.child.updateMany({
    where: { id: childId, parentId },
    data: { accessCode: generateAccessCode() },
  });
}

export function deleteChild(childId: string, parentId: string) {
  return prisma.child.deleteMany({ where: { id: childId, parentId } });
}
