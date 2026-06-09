import { prisma } from '@/server/db';

export function listRewards(childId: string) {
  return prisma.reward.findMany({ where: { childId }, orderBy: { requiredPoint: 'asc' } });
}
export function createReward(childId: string, data: {
  title: string; description?: string; rewardType: string; requiredPoint: number;
}) {
  return prisma.reward.create({ data: { ...data, childId } });
}
export function updateReward(id: string, childId: string, data: Record<string, unknown>) {
  return prisma.reward.updateMany({ where: { id, childId }, data });
}
export function deleteReward(id: string, childId: string) {
  return prisma.reward.deleteMany({ where: { id, childId } });
}
export function listClaims(childId: string) {
  return prisma.rewardClaim.findMany({ where: { childId }, orderBy: { createdAt: 'desc' } });
}
export function createClaim(childId: string, data: {
  rewardId: string; totalPointUsed: number; pocketId?: string | null; status: string; givenAt?: Date | null;
}) {
  return prisma.rewardClaim.create({ data: { ...data, childId } });
}
