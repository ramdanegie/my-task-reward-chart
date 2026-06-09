import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';
import { DEFAULT_TASKS, DEFAULT_REWARDS } from '../src/server/defaults';
import { generateAccessCode } from '../src/server/auth/childSession';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'demo@mtrc.app';
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const parent = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: 'Orang Tua Demo', passwordHash },
  });

  const existing = await prisma.child.findFirst({ where: { parentId: parent.id } });
  if (existing) {
    console.log('Seed sudah ada, lewati.');
    return;
  }

  const child = await prisma.child.create({
    data: {
      parentId: parent.id, name: 'Raka', age: 7, avatar: '🧒',
      dailyPointTarget: 60, weeklyPointTarget: 350, accessCode: generateAccessCode(),
    },
  });

  await prisma.task.createMany({ data: DEFAULT_TASKS.map((t) => ({ ...t, childId: child.id })) });
  await prisma.reward.createMany({ data: DEFAULT_REWARDS.map((r) => ({ ...r, childId: child.id })) });

  const gaji = await prisma.pocket.create({
    data: { childId: child.id, name: 'Kantong Gaji', type: 'gaji', initialBalance: 50000 },
  });
  await prisma.pocket.create({
    data: { childId: child.id, name: 'Kantong THR', type: 'thr', initialBalance: 0 },
  });
  await prisma.pocket.create({
    data: { childId: child.id, name: 'Kantong Investasi', type: 'investasi', initialBalance: 0 },
  });
  await prisma.pocketTransaction.create({
    data: { pocketId: gaji.id, amount: 20000, txnType: 'credit', source: 'gaji', note: 'Gaji mingguan' },
  });

  console.log(`Seed selesai. Login: ${email} / demo1234. Kode anak: ${child.accessCode}`);
}

main().finally(() => prisma.$disconnect());
