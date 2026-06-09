import { prisma } from '@/server/db';
import { computeBalance, buildTransferPair } from '@/server/services/financeService';
import type { PocketWithBalance } from '@/domain/types';

export function listPockets(childId: string) {
  return prisma.pocket.findMany({ where: { childId }, orderBy: { createdAt: 'asc' } });
}

export async function pocketsWithBalances(childId: string): Promise<PocketWithBalance[]> {
  const pockets = await prisma.pocket.findMany({ where: { childId }, orderBy: { createdAt: 'asc' } });
  const txns = await prisma.pocketTransaction.findMany({
    where: { pocket: { childId } },
    select: { pocketId: true, amount: true, txnType: true },
  });
  return pockets.map((p) => ({
    id: p.id, name: p.name, type: p.type, initialBalance: p.initialBalance, isActive: p.isActive,
    balance: computeBalance(p.initialBalance, txns.filter((t) => t.pocketId === p.id)),
  }));
}

export function createPocket(childId: string, data: {
  name: string; type?: string; initialBalance?: number;
}) {
  return prisma.pocket.create({ data: { ...data, childId } });
}

export function deletePocket(id: string, childId: string) {
  return prisma.pocket.deleteMany({ where: { id, childId } });
}

export function listTransactions(childId: string, start?: string, end?: string) {
  return prisma.pocketTransaction.findMany({
    where: {
      pocket: { childId },
      ...(start && end ? { occurredAt: { gte: new Date(start), lte: new Date(end + 'T23:59:59') } } : {}),
    },
    orderBy: { occurredAt: 'desc' },
    include: { pocket: { select: { name: true } } },
  });
}

export function createTransaction(data: {
  pocketId: string; amount: number; txnType: string; source: string; note?: string;
}) {
  return prisma.pocketTransaction.create({ data });
}

export async function transfer(fromPocketId: string, toPocketId: string, amount: number, note?: string) {
  const [debit, credit] = buildTransferPair(fromPocketId, toPocketId, amount, note);
  return prisma.$transaction([
    prisma.pocketTransaction.create({ data: debit }),
    prisma.pocketTransaction.create({ data: credit }),
  ]);
}
