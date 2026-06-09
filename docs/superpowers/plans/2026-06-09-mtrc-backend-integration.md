# MTRC Backend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn MTRC from a dummy-data frontend demo into a backend-integrated app with real auth, persistent per-account data, multi-child support, weekly/monthly filters, and a custom multi-pocket savings feature.

**Architecture:** Next.js 15 App Router + Route Handlers as the API layer, Prisma + SQLite for persistence, Auth.js v5 for parent auth (email/password + Google), and a signed-cookie access-code session for child mode. DDD-lite layering: route handler → service (pure use-case logic, unit-tested) → repository (Prisma access). Client pages stay client components and fetch via SWR.

**Tech Stack:** Next.js 15, TypeScript, Prisma, SQLite, Auth.js v5 (`next-auth@beta`), `@auth/prisma-adapter`, `bcryptjs`, `zod`, `swr`, `vitest` (unit tests), Recharts (existing), Tailwind (existing).

**Spec:** `docs/superpowers/specs/2026-06-09-mtrc-backend-integration-design.md`

**Conventions for all tasks:**
- Money is stored/handled as **integer Rupiah** (no decimals).
- Dates for logs/notes are `YYYY-MM-DD` strings (lexicographically comparable).
- Run unit tests with `npx vitest run <path>`.
- After each task, commit with the message shown.

---

## Phase A — Foundation & Tooling

### Task A1: Install dependencies & init Prisma

**Files:**
- Modify: `package.json`
- Create: `prisma/schema.prisma` (via `prisma init`)
- Create: `.env`, `.env.example`

- [ ] **Step 1: Install runtime + dev deps**

```bash
npm install @prisma/client next-auth@beta @auth/prisma-adapter bcryptjs zod swr
npm install -D prisma @types/bcryptjs tsx vitest
```

- [ ] **Step 2: Init Prisma with SQLite**

```bash
npx prisma init --datasource-provider sqlite
```

- [ ] **Step 3: Create `.env`**

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="dev-secret-change-me"
CHILD_SESSION_SECRET="dev-child-secret-change-me"
# Optional — Google OAuth (email/password works without these):
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
```

- [ ] **Step 4: Create `.env.example`** (same keys, empty values, with a comment pointing to https://console.cloud.google.com for Google OAuth credentials and `npx auth secret` for `AUTH_SECRET`).

- [ ] **Step 5: Add scripts to `package.json`**

```json
"scripts": {
  "dev": "next dev",
  "build": "prisma generate && next build",
  "start": "next start",
  "lint": "next lint",
  "db:migrate": "prisma migrate dev",
  "db:seed": "tsx prisma/seed.ts",
  "db:reset": "prisma migrate reset --force",
  "test": "vitest run"
}
```

- [ ] **Step 6: Update `.gitignore`** — add lines: `*.db`, `*.db-journal`, `/prisma/dev.db`, `.env`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: add prisma, auth, swr deps and env scaffolding"
```

---

### Task A2: Prisma schema (all models)

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Replace `prisma/schema.prisma` with the full schema**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  passwordHash  String?
  accounts      Account[]
  sessions      Session[]
  children      Child[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Child {
  id                String         @id @default(cuid())
  parentId          String
  name              String
  age               Int
  avatar            String         @default("🧒")
  dailyPointTarget  Int            @default(60)
  weeklyPointTarget Int            @default(350)
  accessCode        String         @unique
  isActive          Boolean        @default(true)
  parent            User           @relation(fields: [parentId], references: [id], onDelete: Cascade)
  tasks             Task[]
  logs              DailyTaskLog[]
  rewards           Reward[]
  rewardClaims      RewardClaim[]
  notes             ParentNote[]
  pockets           Pocket[]
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
}

model Task {
  id               String         @id @default(cuid())
  childId          String
  title            String
  description      String         @default("")
  category         String
  point            Int
  requiresApproval Boolean        @default(false)
  isActive         Boolean        @default(true)
  child            Child          @relation(fields: [childId], references: [id], onDelete: Cascade)
  logs             DailyTaskLog[]
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
}

model DailyTaskLog {
  id           String    @id @default(cuid())
  childId      String
  taskId       String
  logDate      String
  status       String    @default("pending")
  earnedPoint  Int       @default(0)
  approvedById String?
  completedAt  DateTime?
  approvedAt   DateTime?
  note         String?
  child        Child     @relation(fields: [childId], references: [id], onDelete: Cascade)
  task         Task      @relation(fields: [taskId], references: [id], onDelete: Cascade)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@unique([taskId, logDate])
}

model Reward {
  id            String        @id @default(cuid())
  childId       String
  title         String
  description   String        @default("")
  rewardType    String
  requiredPoint Int
  isActive      Boolean       @default(true)
  child         Child         @relation(fields: [childId], references: [id], onDelete: Cascade)
  claims        RewardClaim[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model RewardClaim {
  id             String    @id @default(cuid())
  childId        String
  rewardId       String
  totalPointUsed Int       @default(0)
  pocketId       String?
  status         String    @default("claimed")
  claimedAt      DateTime? @default(now())
  givenAt        DateTime?
  child          Child     @relation(fields: [childId], references: [id], onDelete: Cascade)
  reward         Reward    @relation(fields: [rewardId], references: [id], onDelete: Cascade)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model ParentNote {
  id        String   @id @default(cuid())
  childId   String
  noteDate  String
  note      String
  child     Child    @relation(fields: [childId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Pocket {
  id             String              @id @default(cuid())
  childId        String
  name           String
  type           String              @default("custom")
  initialBalance Int                 @default(0)
  isActive       Boolean             @default(true)
  child          Child               @relation(fields: [childId], references: [id], onDelete: Cascade)
  transactions   PocketTransaction[]
  createdAt      DateTime            @default(now())
  updatedAt      DateTime            @updatedAt
}

model PocketTransaction {
  id              String   @id @default(cuid())
  pocketId        String
  amount          Int
  txnType         String
  source          String   @default("manual")
  note            String?
  transferGroupId String?
  occurredAt      DateTime @default(now())
  pocket          Pocket   @relation(fields: [pocketId], references: [id], onDelete: Cascade)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

- [ ] **Step 2: Create the migration**

Run: `npx prisma migrate dev --name init`
Expected: migration created under `prisma/migrations/`, `dev.db` generated, "Your database is now in sync".

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(db): add full prisma schema and initial migration"
```

---

### Task A3: Prisma client singleton + vitest config

**Files:**
- Create: `src/server/db.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Create `src/server/db.ts`**

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
});
```

- [ ] **Step 3: Commit**

```bash
git add src/server/db.ts vitest.config.ts
git commit -m "feat: add prisma client singleton and vitest config"
```

---

## Phase B — Pure Domain Logic (TDD)

### Task B1: Date range helpers

**Files:**
- Create: `src/lib/dates.ts`
- Test: `src/lib/dates.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { toDateStr, getWeekRange, getMonthRange, eachDayInRange } from './dates';

describe('dates', () => {
  it('formats a date to YYYY-MM-DD', () => {
    expect(toDateStr(new Date('2026-06-09T10:00:00'))).toBe('2026-06-09');
  });

  it('returns Monday..Sunday for the ISO week of a date', () => {
    // 2026-06-09 is a Tuesday
    expect(getWeekRange('2026-06-09')).toEqual({ start: '2026-06-08', end: '2026-06-14' });
  });

  it('returns first..last day of month', () => {
    expect(getMonthRange('2026-06-09')).toEqual({ start: '2026-06-01', end: '2026-06-30' });
  });

  it('lists each day in an inclusive range', () => {
    expect(eachDayInRange('2026-06-08', '2026-06-10')).toEqual([
      '2026-06-08', '2026-06-09', '2026-06-10',
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/dates.test.ts`
Expected: FAIL (module not found / functions undefined).

- [ ] **Step 3: Implement `src/lib/dates.ts`**

```ts
export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parse(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getWeekRange(dateStr: string): { start: string; end: string } {
  const d = parse(dateStr);
  const day = (d.getDay() + 6) % 7; // Mon=0 .. Sun=6
  const monday = new Date(d);
  monday.setDate(d.getDate() - day);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: toDateStr(monday), end: toDateStr(sunday) };
}

export function getMonthRange(dateStr: string): { start: string; end: string } {
  const d = parse(dateStr);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { start: toDateStr(start), end: toDateStr(end) };
}

export function eachDayInRange(start: string, end: string): string[] {
  const out: string[] = [];
  const cur = parse(start);
  const last = parse(end);
  while (cur <= last) {
    out.push(toDateStr(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/dates.test.ts` → Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/dates.ts src/lib/dates.test.ts
git commit -m "feat: add date range helpers with tests"
```

---

### Task B2: Domain types

**Files:**
- Create: `src/domain/types.ts`

- [ ] **Step 1: Create `src/domain/types.ts`** (shared client/server types; mirrors Prisma but framework-free)

```ts
export type TaskCategory =
  | 'pagi' | 'kebersihan' | 'kemandirian' | 'rumah' | 'belajar' | 'sikap' | 'malam';

export type LogStatus =
  | 'pending' | 'in_progress' | 'waiting_approval' | 'completed' | 'missed';

export type RewardType =
  | 'activity' | 'playtime' | 'food' | 'movie' | 'toy' | 'outing';

export type TxnType = 'credit' | 'debit';
export type TxnSource = 'gaji' | 'reward' | 'transfer' | 'pengeluaran' | 'manual';

export type RangeType = 'week' | 'month';

export interface PocketWithBalance {
  id: string;
  name: string;
  type: string;
  initialBalance: number;
  isActive: boolean;
  balance: number;
}

export interface ChildSummary {
  totalPoints: number;
  dailyTargetPct: number;
  weeklyTargetPct: number;
  completedCount: number;
  totalTaskInstances: number;
  series: { label: string; date: string; points: number }[];
  categoryBreakdown: { name: string; value: number }[];
  topTasks: { taskId: string; title: string; completed: number }[];
  missedTasks: { taskId: string; title: string; missed: number }[];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/domain/types.ts
git commit -m "feat: add framework-free domain types"
```

---

### Task B3: Points aggregation logic

**Files:**
- Create: `src/server/services/pointsService.ts`
- Test: `src/server/services/pointsService.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { sumCompletedPoints, pointsByDay } from './pointsService';

const logs = [
  { logDate: '2026-06-08', status: 'completed', earnedPoint: 10 },
  { logDate: '2026-06-08', status: 'waiting_approval', earnedPoint: 0 },
  { logDate: '2026-06-09', status: 'completed', earnedPoint: 5 },
  { logDate: '2026-06-09', status: 'completed', earnedPoint: 5 },
];

describe('pointsService', () => {
  it('sums only completed points', () => {
    expect(sumCompletedPoints(logs)).toBe(20);
  });

  it('groups completed points by day across a range', () => {
    expect(pointsByDay(logs, ['2026-06-08', '2026-06-09', '2026-06-10'])).toEqual([
      { date: '2026-06-08', points: 10 },
      { date: '2026-06-09', points: 10 },
      { date: '2026-06-10', points: 0 },
    ]);
  });
});
```

- [ ] **Step 2: Run test** → `npx vitest run src/server/services/pointsService.test.ts` → Expected: FAIL.

- [ ] **Step 3: Implement `src/server/services/pointsService.ts`**

```ts
export interface PointLog {
  logDate: string;
  status: string;
  earnedPoint: number;
}

export function sumCompletedPoints(logs: PointLog[]): number {
  return logs
    .filter((l) => l.status === 'completed')
    .reduce((sum, l) => sum + l.earnedPoint, 0);
}

export function pointsByDay(logs: PointLog[], days: string[]): { date: string; points: number }[] {
  return days.map((date) => ({
    date,
    points: sumCompletedPoints(logs.filter((l) => l.logDate === date)),
  }));
}
```

- [ ] **Step 4: Run test** → Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/server/services/pointsService.ts src/server/services/pointsService.test.ts
git commit -m "feat: add points aggregation logic with tests"
```

---

### Task B4: Summary builder

**Files:**
- Create: `src/server/services/summaryService.ts`
- Test: `src/server/services/summaryService.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { buildSummary } from './summaryService';

const tasks = [
  { id: 't1', title: 'Mandi', category: 'kebersihan' },
  { id: 't2', title: 'Belajar', category: 'belajar' },
];
const logs = [
  { taskId: 't1', logDate: '2026-06-08', status: 'completed', earnedPoint: 5 },
  { taskId: 't1', logDate: '2026-06-09', status: 'completed', earnedPoint: 5 },
  { taskId: 't2', logDate: '2026-06-08', status: 'missed', earnedPoint: 0 },
];

describe('summaryService', () => {
  it('builds a summary for a week range', () => {
    const s = buildSummary({
      tasks, logs,
      days: ['2026-06-08', '2026-06-09'],
      dailyTarget: 60, weeklyTarget: 350, rangeType: 'week',
    });
    expect(s.totalPoints).toBe(10);
    expect(s.completedCount).toBe(2);
    expect(s.series.map((p) => p.points)).toEqual([5, 5]);
    expect(s.categoryBreakdown).toContainEqual({ name: 'kebersihan', value: 10 });
    expect(s.topTasks[0]).toEqual({ taskId: 't1', title: 'Mandi', completed: 2 });
    expect(s.missedTasks[0]).toEqual({ taskId: 't2', title: 'Belajar', missed: 1 });
  });
});
```

- [ ] **Step 2: Run test** → Expected: FAIL.

- [ ] **Step 3: Implement `src/server/services/summaryService.ts`**

```ts
import type { ChildSummary, RangeType } from '@/domain/types';
import { sumCompletedPoints, pointsByDay } from './pointsService';

interface SummaryTask { id: string; title: string; category: string }
interface SummaryLog { taskId: string; logDate: string; status: string; earnedPoint: number }

interface BuildArgs {
  tasks: SummaryTask[];
  logs: SummaryLog[];
  days: string[];
  dailyTarget: number;
  weeklyTarget: number;
  rangeType: RangeType;
}

const DOW = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function labelFor(date: string, rangeType: RangeType): string {
  const [y, m, d] = date.split('-').map(Number);
  if (rangeType === 'week') return DOW[new Date(y, m - 1, d).getDay()];
  return String(d);
}

export function buildSummary(args: BuildArgs): ChildSummary {
  const { tasks, logs, days, dailyTarget, weeklyTarget, rangeType } = args;
  const totalPoints = sumCompletedPoints(logs);
  const byDay = pointsByDay(logs, days);
  const completed = logs.filter((l) => l.status === 'completed');
  const taskById = new Map(tasks.map((t) => [t.id, t]));

  const catMap = new Map<string, number>();
  for (const l of completed) {
    const cat = taskById.get(l.taskId)?.category ?? 'lainnya';
    catMap.set(cat, (catMap.get(cat) ?? 0) + l.earnedPoint);
  }

  const completedCount = new Map<string, number>();
  const missedCount = new Map<string, number>();
  for (const l of logs) {
    if (l.status === 'completed') completedCount.set(l.taskId, (completedCount.get(l.taskId) ?? 0) + 1);
    if (l.status === 'missed') missedCount.set(l.taskId, (missedCount.get(l.taskId) ?? 0) + 1);
  }

  const topTasks = [...completedCount.entries()]
    .map(([taskId, c]) => ({ taskId, title: taskById.get(taskId)?.title ?? '', completed: c }))
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 5);

  const missedTasks = [...missedCount.entries()]
    .map(([taskId, c]) => ({ taskId, title: taskById.get(taskId)?.title ?? '', missed: c }))
    .sort((a, b) => b.missed - a.missed)
    .slice(0, 5);

  const periodTarget = rangeType === 'week' ? weeklyTarget : weeklyTarget * 4;

  return {
    totalPoints,
    dailyTargetPct: dailyTarget ? Math.min((totalPoints / dailyTarget) * 100, 100) : 0,
    weeklyTargetPct: periodTarget ? Math.min((totalPoints / periodTarget) * 100, 100) : 0,
    completedCount: completed.length,
    totalTaskInstances: logs.length,
    series: byDay.map((p) => ({ label: labelFor(p.date, rangeType), date: p.date, points: p.points })),
    categoryBreakdown: [...catMap.entries()].map(([name, value]) => ({ name, value })),
    topTasks,
    missedTasks,
  };
}
```

- [ ] **Step 4: Run test** → Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/server/services/summaryService.ts src/server/services/summaryService.test.ts
git commit -m "feat: add summary builder with tests"
```

---

### Task B5: Finance (balance + transfer) logic

**Files:**
- Create: `src/server/services/financeService.ts`
- Test: `src/server/services/financeService.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { computeBalance, buildTransferPair } from './financeService';

describe('financeService', () => {
  it('computes balance = initial + credits - debits', () => {
    const txns = [
      { amount: 50000, txnType: 'credit' },
      { amount: 20000, txnType: 'debit' },
      { amount: 10000, txnType: 'credit' },
    ];
    expect(computeBalance(100000, txns)).toBe(140000);
  });

  it('builds a paired transfer (debit source, credit target) sharing a group id', () => {
    const pair = buildTransferPair('p1', 'p2', 30000, 'pindah ke investasi');
    expect(pair).toHaveLength(2);
    expect(pair[0]).toMatchObject({ pocketId: 'p1', amount: 30000, txnType: 'debit', source: 'transfer' });
    expect(pair[1]).toMatchObject({ pocketId: 'p2', amount: 30000, txnType: 'credit', source: 'transfer' });
    expect(pair[0].transferGroupId).toBe(pair[1].transferGroupId);
    expect(pair[0].transferGroupId).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test** → Expected: FAIL.

- [ ] **Step 3: Implement `src/server/services/financeService.ts`** (pure helpers; DB functions added in Task C5)

```ts
import { randomUUID } from 'node:crypto';

interface BalanceTxn { amount: number; txnType: string }

export function computeBalance(initialBalance: number, txns: BalanceTxn[]): number {
  return txns.reduce(
    (bal, t) => bal + (t.txnType === 'credit' ? t.amount : -t.amount),
    initialBalance,
  );
}

export interface TransferTxnInput {
  pocketId: string;
  amount: number;
  txnType: 'credit' | 'debit';
  source: 'transfer';
  note?: string;
  transferGroupId: string;
}

export function buildTransferPair(
  fromPocketId: string,
  toPocketId: string,
  amount: number,
  note?: string,
): [TransferTxnInput, TransferTxnInput] {
  const transferGroupId = randomUUID();
  return [
    { pocketId: fromPocketId, amount, txnType: 'debit', source: 'transfer', note, transferGroupId },
    { pocketId: toPocketId, amount, txnType: 'credit', source: 'transfer', note, transferGroupId },
  ];
}
```

- [ ] **Step 4: Run test** → Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/server/services/financeService.ts src/server/services/financeService.test.ts
git commit -m "feat: add finance balance + transfer logic with tests"
```

---

### Task B6: Password hashing util

**Files:**
- Create: `src/server/auth/password.ts`
- Test: `src/server/auth/password.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './password';

describe('password', () => {
  it('hashes and verifies a password', async () => {
    const hash = await hashPassword('secret123');
    expect(hash).not.toBe('secret123');
    expect(await verifyPassword('secret123', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test** → Expected: FAIL.

- [ ] **Step 3: Implement `src/server/auth/password.ts`**

```ts
import bcrypt from 'bcryptjs';

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
```

- [ ] **Step 4: Run test** → Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/server/auth/password.ts src/server/auth/password.test.ts
git commit -m "feat: add password hashing util with tests"
```

---

### Task B7: Child access-code session token

**Files:**
- Create: `src/server/auth/childSession.ts`
- Test: `src/server/auth/childSession.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { signChildToken, verifyChildToken, generateAccessCode } from './childSession';

const SECRET = 'test-secret';

describe('childSession', () => {
  it('signs and verifies a child token', () => {
    const token = signChildToken('child-123', SECRET);
    expect(verifyChildToken(token, SECRET)).toBe('child-123');
  });

  it('rejects a tampered token', () => {
    const token = signChildToken('child-123', SECRET);
    expect(verifyChildToken(token + 'x', SECRET)).toBeNull();
    expect(verifyChildToken(token, 'other-secret')).toBeNull();
  });

  it('generates a 6-char uppercase access code', () => {
    const code = generateAccessCode();
    expect(code).toMatch(/^[A-Z0-9]{6}$/);
  });
});
```

- [ ] **Step 2: Run test** → Expected: FAIL.

- [ ] **Step 3: Implement `src/server/auth/childSession.ts`**

```ts
import { createHmac, randomInt } from 'node:crypto';

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function signChildToken(childId: string, secret: string): string {
  const sig = sign(childId, secret);
  return `${Buffer.from(childId).toString('base64url')}.${sig}`;
}

export function verifyChildToken(token: string, secret: string): string | null {
  const [encId, sig] = token.split('.');
  if (!encId || !sig) return null;
  const childId = Buffer.from(encId, 'base64url').toString('utf8');
  const expected = sign(childId, secret);
  if (sig.length !== expected.length) return null;
  // constant-time-ish compare
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0 ? childId : null;
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateAccessCode(): string {
  let out = '';
  for (let i = 0; i < 6; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}
```

> Note: test regex `[A-Z0-9]` matches the ambiguous-free alphabet used here.

- [ ] **Step 4: Run test** → Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/server/auth/childSession.ts src/server/auth/childSession.test.ts
git commit -m "feat: add child access-code session token with tests"
```

---

## Phase C — Repositories & Seed

> Repositories are thin Prisma wrappers. They are exercised by manual end-to-end verification (Phase J) rather than unit tests, since the pure logic they call is already covered.

### Task C1: Auth/session helpers (server-side current user + child)

**Files:**
- Create: `src/server/auth/session.ts`

- [ ] **Step 1: Create `src/server/auth/session.ts`**

```ts
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { prisma } from '@/server/db';
import { verifyChildToken } from './childSession';

export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('UNAUTHORIZED');
  return session.user.id;
}

/** Throws if the child does not belong to the logged-in parent. */
export async function assertChildOwnership(childId: string, userId: string): Promise<void> {
  const child = await prisma.child.findFirst({ where: { id: childId, parentId: userId } });
  if (!child) throw new Error('FORBIDDEN');
}

export async function getChildSessionId(): Promise<string | null> {
  const token = (await cookies()).get('child_session')?.value;
  if (!token) return null;
  return verifyChildToken(token, process.env.CHILD_SESSION_SECRET ?? '');
}
```

> `auth` is created in Task D1; this file imports it but is only used by routes built after D1, so ordering is fine.

- [ ] **Step 2: Commit**

```bash
git add src/server/auth/session.ts
git commit -m "feat: add server-side session/ownership helpers"
```

---

### Task C2: Children repository

**Files:**
- Create: `src/server/repositories/childrenRepo.ts`

- [ ] **Step 1: Create `src/server/repositories/childrenRepo.ts`**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/server/repositories/childrenRepo.ts
git commit -m "feat: add children repository"
```

---

### Task C3: Tasks, logs, rewards, claims, notes repositories

**Files:**
- Create: `src/server/repositories/tasksRepo.ts`
- Create: `src/server/repositories/logsRepo.ts`
- Create: `src/server/repositories/rewardsRepo.ts`
- Create: `src/server/repositories/notesRepo.ts`

- [ ] **Step 1: Create `src/server/repositories/tasksRepo.ts`**

```ts
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
```

- [ ] **Step 2: Create `src/server/repositories/logsRepo.ts`**

```ts
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
```

- [ ] **Step 3: Create `src/server/repositories/rewardsRepo.ts`**

```ts
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
```

- [ ] **Step 4: Create `src/server/repositories/notesRepo.ts`**

```ts
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
```

- [ ] **Step 5: Commit**

```bash
git add src/server/repositories
git commit -m "feat: add tasks/logs/rewards/notes repositories"
```

---

### Task C4: Finance repository + DB-level balance/transfer

**Files:**
- Create: `src/server/repositories/financeRepo.ts`
- Modify: `src/server/services/financeService.ts`

- [ ] **Step 1: Create `src/server/repositories/financeRepo.ts`**

```ts
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
```

- [ ] **Step 2: Verify build still type-checks**

Run: `npx tsc --noEmit`
Expected: no errors in these files (Auth.js-dependent files may still be absent — ignore unrelated errors until Phase D; if needed run after Phase D).

- [ ] **Step 3: Commit**

```bash
git add src/server/repositories/financeRepo.ts
git commit -m "feat: add finance repository with balances and atomic transfer"
```

---

### Task C5: Default-data + seed

**Files:**
- Create: `src/server/defaults.ts`
- Create: `prisma/seed.ts`

- [ ] **Step 1: Create `src/server/defaults.ts`** (PRD §13 default tasks & rewards, reused by seed and child creation)

```ts
export const DEFAULT_TASKS = [
  { title: 'Bangun pagi tanpa rewel', category: 'pagi', point: 5, requiresApproval: false },
  { title: 'Merapikan tempat tidur', category: 'pagi', point: 5, requiresApproval: false },
  { title: 'Mandi sendiri', category: 'kebersihan', point: 5, requiresApproval: true },
  { title: 'Gosok gigi pagi dan malam', category: 'kebersihan', point: 5, requiresApproval: false },
  { title: 'Memakai baju sendiri', category: 'kemandirian', point: 5, requiresApproval: false },
  { title: 'Membereskan mainan', category: 'rumah', point: 5, requiresApproval: true },
  { title: 'Membaca/belajar 15 menit', category: 'belajar', point: 10, requiresApproval: true },
  { title: 'Membantu pekerjaan rumah ringan', category: 'rumah', point: 10, requiresApproval: true },
  { title: 'Bicara sopan', category: 'sikap', point: 10, requiresApproval: false },
  { title: 'Tidur tepat waktu', category: 'malam', point: 10, requiresApproval: false },
] as const;

export const DEFAULT_REWARDS = [
  { title: 'Pilih menu sarapan', rewardType: 'food', requiredPoint: 50 },
  { title: 'Main tambahan 30 menit', rewardType: 'playtime', requiredPoint: 60 },
  { title: 'Pilih film keluarga', rewardType: 'movie', requiredPoint: 70 },
  { title: 'Jalan-jalan kecil', rewardType: 'outing', requiredPoint: 85 },
  { title: 'Beli mainan kecil', rewardType: 'toy', requiredPoint: 100 },
] as const;
```

- [ ] **Step 2: Create `prisma/seed.ts`**

```ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEFAULT_TASKS, DEFAULT_REWARDS } from '../src/server/defaults';
import { generateAccessCode } from '../src/server/auth/childSession';

const prisma = new PrismaClient();

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
```

- [ ] **Step 3: Run the seed**

Run: `npm run db:seed`
Expected: prints "Seed selesai. Login: demo@mtrc.app / demo1234. Kode anak: XXXXXX".

- [ ] **Step 4: Commit**

```bash
git add src/server/defaults.ts prisma/seed.ts
git commit -m "feat: add default data and seed script"
```

---

## Phase D — Auth (Auth.js v5)

### Task D1: Auth.js config + route handler

**Files:**
- Create: `src/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/types/next-auth.d.ts`

- [ ] **Step 1: Create `src/auth.ts`**

```ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { prisma } from '@/server/db';
import { verifyPassword } from '@/server/auth/password';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/parent/login' },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        const email = String(creds?.email ?? '').toLowerCase();
        const password = String(creds?.password ?? '');
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        if (!(await verifyPassword(password, user.passwordHash))) return null;
        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
```

- [ ] **Step 2: Create `src/app/api/auth/[...nextauth]/route.ts`**

```ts
import { handlers } from '@/auth';
export const { GET, POST } = handlers;
```

- [ ] **Step 3: Create `src/types/next-auth.d.ts`**

```ts
import 'next-auth';
declare module 'next-auth' {
  interface Session {
    user: { id: string } & import('next-auth').DefaultSession['user'];
  }
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit` → Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/auth.ts "src/app/api/auth/[...nextauth]/route.ts" src/types/next-auth.d.ts
git commit -m "feat(auth): add Auth.js config with credentials + google"
```

---

### Task D2: Register API + zod validation helper

**Files:**
- Create: `src/lib/http.ts`
- Create: `src/app/api/auth/register/route.ts`

- [ ] **Step 1: Create `src/lib/http.ts`** (shared route helpers)

```ts
import { NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';

export function ok<T>(data: T, init?: number) {
  return NextResponse.json(data, { status: init ?? 200 });
}
export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  return schema.parse(await req.json());
}
export function handleError(e: unknown) {
  if (e instanceof ZodError) return fail(e.issues[0]?.message ?? 'Invalid input', 422);
  const msg = e instanceof Error ? e.message : 'Server error';
  if (msg === 'UNAUTHORIZED') return fail('Silakan login', 401);
  if (msg === 'FORBIDDEN') return fail('Akses ditolak', 403);
  return fail(msg, 500);
}
```

- [ ] **Step 2: Create `src/app/api/auth/register/route.ts`**

```ts
import { z } from 'zod';
import { prisma } from '@/server/db';
import { hashPassword } from '@/server/auth/password';
import { ok, fail, parseBody, handleError } from '@/lib/http';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export async function POST(req: Request) {
  try {
    const { name, email, password } = await parseBody(req, schema);
    const lower = email.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email: lower } });
    if (exists) return fail('Email sudah terdaftar', 409);
    const user = await prisma.user.create({
      data: { name, email: lower, passwordHash: await hashPassword(password) },
    });
    return ok({ id: user.id, email: user.email }, 201);
  } catch (e) {
    return handleError(e);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/http.ts src/app/api/auth/register/route.ts
git commit -m "feat(auth): add register endpoint and http helpers"
```

---

### Task D3: Login & register pages

**Files:**
- Modify: `src/app/parent/login/page.tsx` (replace dummy)
- Create: `src/app/parent/register/page.tsx`
- Create: `src/app/providers.tsx`
- Modify: `src/app/layout.tsx` (wrap with SessionProvider)

- [ ] **Step 1: Create `src/app/providers.tsx`**

```tsx
'use client';
import { SessionProvider } from 'next-auth/react';
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

- [ ] **Step 2: Wrap `src/app/layout.tsx` body content** with `<Providers>...</Providers>` (import from `./providers`). Keep existing `<html>/<body>` and metadata.

- [ ] **Step 3: Replace `src/app/parent/login/page.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ParentLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) { setError('Email atau password salah'); return; }
    router.push('/parent/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Masuk Orang Tua</h1>
        <p className="text-sm text-gray-500 mb-5">Kelola tugas & progress anak</p>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <form onSubmit={submit} className="space-y-3">
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
          <button disabled={loading} type="submit"
            className="w-full bg-[#4285F4] text-white py-2.5 rounded-lg hover:bg-blue-600 text-sm font-semibold disabled:opacity-60">
            {loading ? 'Memproses…' : 'Masuk'}
          </button>
        </form>
        <button onClick={() => signIn('google', { callbackUrl: '/parent/dashboard' })}
          className="w-full mt-3 border border-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 text-sm">
          Masuk dengan Google
        </button>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Belum punya akun? <Link href="/parent/register" className="text-[#4285F4] font-medium">Daftar</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/app/parent/register/page.tsx`** (same styling; posts to `/api/auth/register`, then `signIn('credentials', …)` and redirects to `/parent/dashboard`). Fields: name, email, password. On API error, show `error` from JSON.

```tsx
'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ParentRegister() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    if (!res.ok) { setError((await res.json()).error ?? 'Gagal daftar'); setLoading(false); return; }
    await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    router.push('/parent/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Daftar Orang Tua</h1>
        <p className="text-sm text-gray-500 mb-5">Buat akun baru</p>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
          <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
          <input type="password" required placeholder="Password (min 6)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]" />
          <button disabled={loading} type="submit"
            className="w-full bg-[#4285F4] text-white py-2.5 rounded-lg hover:bg-blue-600 text-sm font-semibold disabled:opacity-60">
            {loading ? 'Memproses…' : 'Daftar'}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Sudah punya akun? <Link href="/parent/login" className="text-[#4285F4] font-medium">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/providers.tsx src/app/layout.tsx src/app/parent/login/page.tsx src/app/parent/register/page.tsx
git commit -m "feat(auth): add real login/register pages and SessionProvider"
```

---

### Task D4: Middleware (protect /parent and /child)

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create `src/middleware.ts`**

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Parent area: require Auth.js session cookie
  if (pathname.startsWith('/parent') &&
      !pathname.startsWith('/parent/login') && !pathname.startsWith('/parent/register')) {
    const hasSession =
      req.cookies.has('authjs.session-token') || req.cookies.has('__Secure-authjs.session-token');
    if (!hasSession) return NextResponse.redirect(new URL('/parent/login', req.url));
  }

  // Child area: require child_session cookie
  if (pathname.startsWith('/child') && !pathname.startsWith('/child/enter')) {
    if (!req.cookies.has('child_session')) {
      return NextResponse.redirect(new URL('/child/enter', req.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ['/parent/:path*', '/child/:path*'] };
```

- [ ] **Step 2: Manual check**

Run `npm run dev`, visit `http://localhost:3000/parent/dashboard` while logged out → should redirect to `/parent/login`. Visit `/child` → should redirect to `/child/enter`.

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(auth): add middleware protecting parent and child areas"
```

---

## Phase E — API Routes

> All parent routes call `requireUserId()` then `assertChildOwnership(childId, userId)` before touching child-scoped data. All routes wrap logic in `try/catch` returning `handleError(e)`.

### Task E1: Children routes (multi-child CRUD + access code)

**Files:**
- Create: `src/app/api/children/route.ts`
- Create: `src/app/api/children/[id]/route.ts`
- Create: `src/app/api/children/[id]/access-code/route.ts`

- [ ] **Step 1: Create `src/app/api/children/route.ts`** (GET list, POST create with optional default seeding)

```ts
import { z } from 'zod';
import { prisma } from '@/server/db';
import { ok, parseBody, handleError } from '@/lib/http';
import { requireUserId } from '@/server/auth/session';
import { listChildren, createChild } from '@/server/repositories/childrenRepo';
import { DEFAULT_TASKS, DEFAULT_REWARDS } from '@/server/defaults';

export async function GET() {
  try {
    const userId = await requireUserId();
    return ok(await listChildren(userId));
  } catch (e) { return handleError(e); }
}

const createSchema = z.object({
  name: z.string().min(1),
  age: z.coerce.number().int().min(1).max(18),
  avatar: z.string().optional(),
  dailyPointTarget: z.coerce.number().int().optional(),
  weeklyPointTarget: z.coerce.number().int().optional(),
  seedDefaults: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const { seedDefaults, ...data } = await parseBody(req, createSchema);
    const child = await createChild(userId, data);
    if (seedDefaults) {
      await prisma.task.createMany({ data: DEFAULT_TASKS.map((t) => ({ ...t, childId: child.id })) });
      await prisma.reward.createMany({ data: DEFAULT_REWARDS.map((r) => ({ ...r, childId: child.id })) });
    }
    return ok(child, 201);
  } catch (e) { return handleError(e); }
}
```

- [ ] **Step 2: Create `src/app/api/children/[id]/route.ts`** (GET one, PATCH update, DELETE)

```ts
import { z } from 'zod';
import { ok, parseBody, fail, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { getChild, updateChild, deleteChild } from '@/server/repositories/childrenRepo';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const child = await getChild(id, userId);
    return child ? ok(child) : fail('Anak tidak ditemukan', 404);
  } catch (e) { return handleError(e); }
}

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  age: z.coerce.number().int().optional(),
  avatar: z.string().optional(),
  dailyPointTarget: z.coerce.number().int().optional(),
  weeklyPointTarget: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    await updateChild(id, userId, await parseBody(req, patchSchema));
    return ok({ ok: true });
  } catch (e) { return handleError(e); }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await deleteChild(id, userId);
    return ok({ ok: true });
  } catch (e) { return handleError(e); }
}
```

- [ ] **Step 3: Create `src/app/api/children/[id]/access-code/route.ts`** (POST regenerate)

```ts
import { ok, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { regenerateAccessCode, getChild } from '@/server/repositories/childrenRepo';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    await regenerateAccessCode(id, userId);
    const child = await getChild(id, userId);
    return ok({ accessCode: child?.accessCode });
  } catch (e) { return handleError(e); }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/children
git commit -m "feat(api): add children CRUD + access-code routes"
```

---

### Task E2: Tasks, rewards, notes routes

**Files:**
- Create: `src/app/api/children/[id]/tasks/route.ts`
- Create: `src/app/api/tasks/[taskId]/route.ts`
- Create: `src/app/api/children/[id]/rewards/route.ts`
- Create: `src/app/api/rewards/[rewardId]/route.ts`
- Create: `src/app/api/children/[id]/notes/route.ts`

- [ ] **Step 1: Create `src/app/api/children/[id]/tasks/route.ts`**

```ts
import { z } from 'zod';
import { ok, parseBody, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { listTasks, createTask } from '@/server/repositories/tasksRepo';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    return ok(await listTasks(id));
  } catch (e) { return handleError(e); }
}

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  point: z.coerce.number().int().min(0),
  requiresApproval: z.boolean().optional(),
});

export async function POST(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    return ok(await createTask(id, await parseBody(req, schema)), 201);
  } catch (e) { return handleError(e); }
}
```

- [ ] **Step 2: Create `src/app/api/tasks/[taskId]/route.ts`** (PATCH/DELETE; ownership via task→child→parent)

```ts
import { z } from 'zod';
import { prisma } from '@/server/db';
import { ok, fail, parseBody, handleError } from '@/lib/http';
import { requireUserId } from '@/server/auth/session';
import { updateTask, deleteTask } from '@/server/repositories/tasksRepo';

type Ctx = { params: Promise<{ taskId: string }> };

async function ownChildId(taskId: string, userId: string): Promise<string | null> {
  const task = await prisma.task.findFirst({ where: { id: taskId, child: { parentId: userId } } });
  return task?.childId ?? null;
}

const patch = z.object({
  title: z.string().optional(), description: z.string().optional(),
  category: z.string().optional(), point: z.coerce.number().int().optional(),
  requiresApproval: z.boolean().optional(), isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { taskId } = await params;
    const childId = await ownChildId(taskId, userId);
    if (!childId) return fail('Tugas tidak ditemukan', 404);
    await updateTask(taskId, childId, await parseBody(req, patch));
    return ok({ ok: true });
  } catch (e) { return handleError(e); }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { taskId } = await params;
    const childId = await ownChildId(taskId, userId);
    if (!childId) return fail('Tugas tidak ditemukan', 404);
    await deleteTask(taskId, childId);
    return ok({ ok: true });
  } catch (e) { return handleError(e); }
}
```

- [ ] **Step 3: Create rewards routes** — `src/app/api/children/[id]/rewards/route.ts` (GET/POST mirroring tasks but using `listRewards`/`createReward`, schema `{ title, description?, rewardType, requiredPoint }`) and `src/app/api/rewards/[rewardId]/route.ts` (PATCH/DELETE mirroring tasks with `updateReward`/`deleteReward`, ownership via `prisma.reward.findFirst({ where: { id, child: { parentId } } })`).

```ts
// src/app/api/children/[id]/rewards/route.ts
import { z } from 'zod';
import { ok, parseBody, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { listRewards, createReward } from '@/server/repositories/rewardsRepo';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    return ok(await listRewards(id));
  } catch (e) { return handleError(e); }
}

const schema = z.object({
  title: z.string().min(1), description: z.string().optional(),
  rewardType: z.string().min(1), requiredPoint: z.coerce.number().int().min(0),
});

export async function POST(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    return ok(await createReward(id, await parseBody(req, schema)), 201);
  } catch (e) { return handleError(e); }
}
```

```ts
// src/app/api/rewards/[rewardId]/route.ts
import { z } from 'zod';
import { prisma } from '@/server/db';
import { ok, fail, parseBody, handleError } from '@/lib/http';
import { requireUserId } from '@/server/auth/session';
import { updateReward, deleteReward } from '@/server/repositories/rewardsRepo';

type Ctx = { params: Promise<{ rewardId: string }> };

async function ownChildId(rewardId: string, userId: string): Promise<string | null> {
  const r = await prisma.reward.findFirst({ where: { id: rewardId, child: { parentId: userId } } });
  return r?.childId ?? null;
}

const patch = z.object({
  title: z.string().optional(), description: z.string().optional(),
  rewardType: z.string().optional(), requiredPoint: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { rewardId } = await params;
    const childId = await ownChildId(rewardId, userId);
    if (!childId) return fail('Reward tidak ditemukan', 404);
    await updateReward(rewardId, childId, await parseBody(req, patch));
    return ok({ ok: true });
  } catch (e) { return handleError(e); }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { rewardId } = await params;
    const childId = await ownChildId(rewardId, userId);
    if (!childId) return fail('Reward tidak ditemukan', 404);
    await deleteReward(rewardId, childId);
    return ok({ ok: true });
  } catch (e) { return handleError(e); }
}
```

- [ ] **Step 4: Create `src/app/api/children/[id]/notes/route.ts`** (GET list with optional `?start&end`, POST create `{ noteDate, note }`)

```ts
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
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/children src/app/api/tasks src/app/api/rewards
git commit -m "feat(api): add tasks, rewards, notes routes"
```

---

### Task E3: Summary route

**Files:**
- Create: `src/app/api/children/[id]/summary/route.ts`

- [ ] **Step 1: Create the route** (uses dates + summaryService + repos)

```ts
import { ok, fail, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { getChild } from '@/server/repositories/childrenRepo';
import { listTasks } from '@/server/repositories/tasksRepo';
import { logsInRange } from '@/server/repositories/logsRepo';
import { buildSummary } from '@/server/services/summaryService';
import { getWeekRange, getMonthRange, eachDayInRange, toDateStr } from '@/lib/dates';
import type { RangeType } from '@/domain/types';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    const child = await getChild(id, userId);
    if (!child) return fail('Anak tidak ditemukan', 404);

    const url = new URL(req.url);
    const range = (url.searchParams.get('range') as RangeType) ?? 'week';
    const date = url.searchParams.get('date') ?? toDateStr(new Date());
    const { start, end } = range === 'month' ? getMonthRange(date) : getWeekRange(date);

    const [tasks, logs] = await Promise.all([listTasks(id), logsInRange(id, start, end)]);
    const summary = buildSummary({
      tasks: tasks.map((t) => ({ id: t.id, title: t.title, category: t.category })),
      logs: logs.map((l) => ({ taskId: l.taskId, logDate: l.logDate, status: l.status, earnedPoint: l.earnedPoint })),
      days: eachDayInRange(start, end),
      dailyTarget: child.dailyPointTarget,
      weeklyTarget: child.weeklyPointTarget,
      rangeType: range,
    });
    return ok({ range, start, end, summary });
  } catch (e) { return handleError(e); }
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/api/children/[id]/summary/route.ts"
git commit -m "feat(api): add weekly/monthly summary route"
```

---

### Task E4: Daily logs + checklist + approval routes

**Files:**
- Create: `src/app/api/children/[id]/logs/route.ts`
- Create: `src/app/api/logs/[logId]/route.ts`

- [ ] **Step 1: Create `src/app/api/children/[id]/logs/route.ts`** (GET `?date=`, POST toggle/complete a task for a date)

```ts
import { z } from 'zod';
import { ok, parseBody, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { prisma } from '@/server/db';
import { logsForDate, upsertLog } from '@/server/repositories/logsRepo';
import { toDateStr } from '@/lib/dates';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    const date = new URL(req.url).searchParams.get('date') ?? toDateStr(new Date());
    return ok(await logsForDate(id, date));
  } catch (e) { return handleError(e); }
}

const schema = z.object({ taskId: z.string(), date: z.string(), done: z.boolean() });

export async function POST(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    const { taskId, date, done } = await parseBody(req, schema);
    const task = await prisma.task.findFirst({ where: { id: taskId, childId: id } });
    if (!task) return ok({ ok: false }, 404);
    const status = !done ? 'pending' : task.requiresApproval ? 'waiting_approval' : 'completed';
    const earnedPoint = status === 'completed' ? task.point : 0;
    return ok(await upsertLog(id, taskId, date, {
      status, earnedPoint, completedAt: done ? new Date() : null,
    }));
  } catch (e) { return handleError(e); }
}
```

- [ ] **Step 2: Create `src/app/api/logs/[logId]/route.ts`** (PATCH approve/reject — parent only)

```ts
import { z } from 'zod';
import { prisma } from '@/server/db';
import { ok, fail, parseBody, handleError } from '@/lib/http';
import { requireUserId } from '@/server/auth/session';
import { setLogStatus } from '@/server/repositories/logsRepo';

type Ctx = { params: Promise<{ logId: string }> };
const schema = z.object({ action: z.enum(['approve', 'reject']) });

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { logId } = await params;
    const log = await prisma.dailyTaskLog.findFirst({
      where: { id: logId, child: { parentId: userId } }, include: { task: true },
    });
    if (!log) return fail('Log tidak ditemukan', 404);
    const { action } = await parseBody(req, schema);
    const data = action === 'approve'
      ? { status: 'completed', earnedPoint: log.task.point, approvedAt: new Date() }
      : { status: 'missed', earnedPoint: 0, approvedAt: new Date() };
    await setLogStatus(logId, log.childId, data);
    return ok({ ok: true });
  } catch (e) { return handleError(e); }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/children src/app/api/logs
git commit -m "feat(api): add daily logs checklist + approval routes"
```

---

### Task E5: Finance routes (pockets, transactions, transfer)

**Files:**
- Create: `src/app/api/children/[id]/pockets/route.ts`
- Create: `src/app/api/pockets/[pocketId]/route.ts`
- Create: `src/app/api/children/[id]/transactions/route.ts`
- Create: `src/app/api/children/[id]/transfer/route.ts`

- [ ] **Step 1: Create `src/app/api/children/[id]/pockets/route.ts`** (GET balances, POST create)

```ts
import { z } from 'zod';
import { ok, parseBody, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { pocketsWithBalances, createPocket } from '@/server/repositories/financeRepo';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    const pockets = await pocketsWithBalances(id);
    return ok({ pockets, total: pockets.reduce((s, p) => s + p.balance, 0) });
  } catch (e) { return handleError(e); }
}

const schema = z.object({
  name: z.string().min(1), type: z.string().optional(),
  initialBalance: z.coerce.number().int().min(0).optional(),
});

export async function POST(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    return ok(await createPocket(id, await parseBody(req, schema)), 201);
  } catch (e) { return handleError(e); }
}
```

- [ ] **Step 2: Create `src/app/api/pockets/[pocketId]/route.ts`** (DELETE; ownership via pocket→child→parent)

```ts
import { prisma } from '@/server/db';
import { ok, fail, handleError } from '@/lib/http';
import { requireUserId } from '@/server/auth/session';
import { deletePocket } from '@/server/repositories/financeRepo';

export async function DELETE(_req: Request, { params }: { params: Promise<{ pocketId: string }> }) {
  try {
    const userId = await requireUserId();
    const { pocketId } = await params;
    const pocket = await prisma.pocket.findFirst({ where: { id: pocketId, child: { parentId: userId } } });
    if (!pocket) return fail('Kantong tidak ditemukan', 404);
    await deletePocket(pocketId, pocket.childId);
    return ok({ ok: true });
  } catch (e) { return handleError(e); }
}
```

- [ ] **Step 3: Create `src/app/api/children/[id]/transactions/route.ts`** (GET `?start&end`, POST credit/debit)

```ts
import { z } from 'zod';
import { prisma } from '@/server/db';
import { ok, fail, parseBody, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { listTransactions, createTransaction } from '@/server/repositories/financeRepo';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    const url = new URL(req.url);
    return ok(await listTransactions(id,
      url.searchParams.get('start') ?? undefined, url.searchParams.get('end') ?? undefined));
  } catch (e) { return handleError(e); }
}

const schema = z.object({
  pocketId: z.string(),
  amount: z.coerce.number().int().positive(),
  txnType: z.enum(['credit', 'debit']),
  source: z.enum(['gaji', 'reward', 'transfer', 'pengeluaran', 'manual']).optional(),
  note: z.string().optional(),
});

export async function POST(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    const body = await parseBody(req, schema);
    const pocket = await prisma.pocket.findFirst({ where: { id: body.pocketId, childId: id } });
    if (!pocket) return fail('Kantong tidak ditemukan', 404);
    return ok(await createTransaction({ ...body, source: body.source ?? 'manual' }), 201);
  } catch (e) { return handleError(e); }
}
```

- [ ] **Step 4: Create `src/app/api/children/[id]/transfer/route.ts`** (POST atomic transfer)

```ts
import { z } from 'zod';
import { prisma } from '@/server/db';
import { ok, fail, parseBody, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { transfer } from '@/server/repositories/financeRepo';

const schema = z.object({
  fromPocketId: z.string(), toPocketId: z.string(),
  amount: z.coerce.number().int().positive(), note: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    const { fromPocketId, toPocketId, amount, note } = await parseBody(req, schema);
    if (fromPocketId === toPocketId) return fail('Kantong asal dan tujuan sama', 400);
    const count = await prisma.pocket.count({ where: { id: { in: [fromPocketId, toPocketId] }, childId: id } });
    if (count !== 2) return fail('Kantong tidak valid', 404);
    await transfer(fromPocketId, toPocketId, amount, note);
    return ok({ ok: true }, 201);
  } catch (e) { return handleError(e); }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/children src/app/api/pockets
git commit -m "feat(api): add pockets, transactions, transfer routes"
```

---

### Task E6: Child-access route + child data route

**Files:**
- Create: `src/app/api/child-access/route.ts`
- Create: `src/app/api/child/me/route.ts`

- [ ] **Step 1: Create `src/app/api/child-access/route.ts`** (POST code→set cookie; DELETE→logout)

```ts
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
```

- [ ] **Step 2: Create `src/app/api/child/me/route.ts`** (returns the logged-in child's profile, tasks, today logs, rewards, pockets — for child mode)

```ts
import { ok, fail, handleError } from '@/lib/http';
import { prisma } from '@/server/db';
import { getChildSessionId } from '@/server/auth/session';
import { pocketsWithBalances } from '@/server/repositories/financeRepo';
import { toDateStr } from '@/lib/dates';

export async function GET() {
  try {
    const childId = await getChildSessionId();
    if (!childId) return fail('Belum masuk', 401);
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) return fail('Anak tidak ditemukan', 404);
    const today = toDateStr(new Date());
    const [tasks, logs, rewards, pockets] = await Promise.all([
      prisma.task.findMany({ where: { childId, isActive: true } }),
      prisma.dailyTaskLog.findMany({ where: { childId, logDate: today } }),
      prisma.reward.findMany({ where: { childId, isActive: true }, orderBy: { requiredPoint: 'asc' } }),
      pocketsWithBalances(childId),
    ]);
    return ok({
      child: { id: child.id, name: child.name, avatar: child.avatar, dailyPointTarget: child.dailyPointTarget },
      tasks, logs, rewards, pockets, total: pockets.reduce((s, p) => s + p.balance, 0), today,
    });
  } catch (e) { return handleError(e); }
}
```

- [ ] **Step 3: Create `src/app/api/child/logs/route.ts`** (child toggles own task — reuses child session)

```ts
import { z } from 'zod';
import { prisma } from '@/server/db';
import { ok, fail, parseBody, handleError } from '@/lib/http';
import { getChildSessionId } from '@/server/auth/session';
import { upsertLog } from '@/server/repositories/logsRepo';

const schema = z.object({ taskId: z.string(), date: z.string(), done: z.boolean() });

export async function POST(req: Request) {
  try {
    const childId = await getChildSessionId();
    if (!childId) return fail('Belum masuk', 401);
    const { taskId, date, done } = await parseBody(req, schema);
    const task = await prisma.task.findFirst({ where: { id: taskId, childId } });
    if (!task) return fail('Tugas tidak ditemukan', 404);
    const status = !done ? 'pending' : task.requiresApproval ? 'waiting_approval' : 'completed';
    const earnedPoint = status === 'completed' ? task.point : 0;
    return ok(await upsertLog(childId, taskId, date, {
      status, earnedPoint, completedAt: done ? new Date() : null,
    }));
  } catch (e) { return handleError(e); }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/child-access src/app/api/child
git commit -m "feat(api): add child access + child data/logs routes"
```

---

## Phase F — Client Foundation

### Task F1: Fetch helper, formatters, SWR hooks

**Files:**
- Create: `src/lib/api.ts`
- Create: `src/lib/format.ts`
- Create: `src/lib/hooks.ts`

- [ ] **Step 1: Create `src/lib/api.ts`**

```ts
export async function jsonFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Gagal memuat');
  return res.json();
}

export async function apiSend<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Gagal');
  return res.json();
}
```

- [ ] **Step 2: Create `src/lib/format.ts`**

```ts
export function formatRupiah(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

export function formatDateID(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
```

- [ ] **Step 3: Create `src/lib/hooks.ts`** (typed SWR hooks)

```ts
'use client';
import useSWR from 'swr';
import { jsonFetcher } from './api';
import type { ChildSummary, PocketWithBalance, RangeType } from '@/domain/types';

export interface ChildDTO {
  id: string; name: string; age: number; avatar: string;
  dailyPointTarget: number; weeklyPointTarget: number; accessCode: string; isActive: boolean;
}

export function useChildren() {
  return useSWR<ChildDTO[]>('/api/children', jsonFetcher);
}
export function useTasks(childId?: string) {
  return useSWR(childId ? `/api/children/${childId}/tasks` : null, jsonFetcher);
}
export function useRewards(childId?: string) {
  return useSWR(childId ? `/api/children/${childId}/rewards` : null, jsonFetcher);
}
export function useLogs(childId: string | undefined, date: string) {
  return useSWR(childId ? `/api/children/${childId}/logs?date=${date}` : null, jsonFetcher);
}
export function useSummary(childId: string | undefined, range: RangeType, date: string) {
  return useSWR<{ range: RangeType; start: string; end: string; summary: ChildSummary }>(
    childId ? `/api/children/${childId}/summary?range=${range}&date=${date}` : null, jsonFetcher);
}
export function usePockets(childId?: string) {
  return useSWR<{ pockets: PocketWithBalance[]; total: number }>(
    childId ? `/api/children/${childId}/pockets` : null, jsonFetcher);
}
export function useTransactions(childId: string | undefined, start?: string, end?: string) {
  const qs = start && end ? `?start=${start}&end=${end}` : '';
  return useSWR(childId ? `/api/children/${childId}/transactions${qs}` : null, jsonFetcher);
}
export function useNotes(childId?: string) {
  return useSWR(childId ? `/api/children/${childId}/notes` : null, jsonFetcher);
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/api.ts src/lib/format.ts src/lib/hooks.ts
git commit -m "feat(client): add fetch helper, formatters, SWR hooks"
```

---

### Task F2: Active-child context + child switcher

**Files:**
- Create: `src/context/ActiveChild.tsx`
- Modify: `src/app/parent/layout.tsx`
- Modify: `src/components/ParentSidebar.tsx`

- [ ] **Step 1: Create `src/context/ActiveChild.tsx`**

```tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useChildren, type ChildDTO } from '@/lib/hooks';

interface Ctx {
  children: ChildDTO[];
  activeChildId: string | null;
  activeChild: ChildDTO | null;
  setActiveChildId: (id: string) => void;
  isLoading: boolean;
  refresh: () => void;
}
const ActiveChildContext = createContext<Ctx | null>(null);

export function ActiveChildProvider({ children: kids }: { children: React.ReactNode }) {
  const { data, isLoading, mutate } = useChildren();
  const [activeChildId, setId] = useState<string | null>(null);

  useEffect(() => {
    if (!data?.length) return;
    const stored = localStorage.getItem('activeChildId');
    const valid = data.find((c) => c.id === stored);
    setId(valid ? stored : data[0].id);
  }, [data]);

  const setActiveChildId = (id: string) => {
    setId(id);
    localStorage.setItem('activeChildId', id);
  };

  return (
    <ActiveChildContext.Provider value={{
      children: data ?? [],
      activeChildId,
      activeChild: data?.find((c) => c.id === activeChildId) ?? null,
      setActiveChildId, isLoading, refresh: () => mutate(),
    }}>
      {kids}
    </ActiveChildContext.Provider>
  );
}

export function useActiveChild() {
  const ctx = useContext(ActiveChildContext);
  if (!ctx) throw new Error('useActiveChild must be used within ActiveChildProvider');
  return ctx;
}
```

- [ ] **Step 2: Wrap parent layout** — in `src/app/parent/layout.tsx`, import `ActiveChildProvider` and wrap the existing `<div className="flex h-screen…">` tree with it.

- [ ] **Step 3: Add a child switcher to the parent UI** — create `src/components/ChildSwitcher.tsx`:

```tsx
'use client';
import { useActiveChild } from '@/context/ActiveChild';

export default function ChildSwitcher() {
  const { children, activeChildId, setActiveChildId, isLoading } = useActiveChild();
  if (isLoading) return null;
  if (!children.length) return <span className="text-xs text-gray-400 px-3">Belum ada anak</span>;
  return (
    <select
      value={activeChildId ?? ''}
      onChange={(e) => setActiveChildId(e.target.value)}
      className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
    >
      {children.map((c) => <option key={c.id} value={c.id}>{c.avatar} {c.name}</option>)}
    </select>
  );
}
```

Then render `<ChildSwitcher />` in `ParentSidebar` (below the logo block) and in the mobile topbar in `parent/layout.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/context/ActiveChild.tsx src/components/ChildSwitcher.tsx src/app/parent/layout.tsx src/components/ParentSidebar.tsx
git commit -m "feat(client): add active-child context and child switcher"
```

---

### Task F3: Range filter component

**Files:**
- Create: `src/components/RangeFilter.tsx`

- [ ] **Step 1: Create `src/components/RangeFilter.tsx`** (Minggu/Bulan toggle + period nav; lifts state to parent)

```tsx
'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { RangeType } from '@/domain/types';
import { getWeekRange, getMonthRange, formatPeriodLabel } from '@/lib/period';

interface Props {
  range: RangeType; date: string;
  onRangeChange: (r: RangeType) => void; onDateChange: (d: string) => void;
}

export default function RangeFilter({ range, date, onRangeChange, onDateChange }: Props) {
  const shift = (dir: -1 | 1) => {
    const [y, m, d] = date.split('-').map(Number);
    const base = new Date(y, m - 1, d);
    if (range === 'week') base.setDate(base.getDate() + dir * 7);
    else base.setMonth(base.getMonth() + dir);
    onDateChange(`${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`);
  };
  const r = range === 'week' ? getWeekRange(date) : getMonthRange(date);
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
        {(['week', 'month'] as RangeType[]).map((rt) => (
          <button key={rt} onClick={() => onRangeChange(rt)}
            className={`px-3 py-1.5 text-sm ${range === rt ? 'bg-[#4285F4] text-white' : 'bg-white text-gray-600'}`}>
            {rt === 'week' ? 'Minggu' : 'Bulan'}
          </button>
        ))}
      </div>
      <div className="inline-flex items-center gap-2">
        <button onClick={() => shift(-1)} className="p-1.5 rounded hover:bg-gray-100"><ChevronLeft size={16} /></button>
        <span className="text-sm text-gray-600 min-w-32 text-center">{formatPeriodLabel(range, r.start, r.end)}</span>
        <button onClick={() => shift(1)} className="p-1.5 rounded hover:bg-gray-100"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/lib/period.ts`** (client-safe re-exports of dates + a label)

```ts
import { getWeekRange, getMonthRange } from './dates';
export { getWeekRange, getMonthRange };
import { formatDateID } from './format';

export function formatPeriodLabel(range: 'week' | 'month', start: string, end: string): string {
  if (range === 'month') {
    const [y, m] = start.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }
  return `${formatDateID(start)} – ${formatDateID(end)}`;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/RangeFilter.tsx src/lib/period.ts
git commit -m "feat(client): add weekly/monthly range filter component"
```

---

## Phase G — Migrate Parent Pages

> For each page: remove `import … from '@/data/dummy'`, fetch via hooks scoped to `activeChildId`, render a loading state while `isLoading`, and an empty state when no child exists. Keep the existing JSX/styling — only swap the data source and wire mutations. Below, only the data-layer changes are specified; reuse the existing markup.

### Task G1: Parent dashboard → live summary + range filter

**Files:**
- Modify: `src/app/parent/dashboard/page.tsx`

- [ ] **Step 1: Rewrite the data layer**
  - Replace dummy imports with: `useActiveChild`, `useSummary`, `useLogs`, `useRewards`, `RangeFilter`, `useState`.
  - State: `const [range, setRange] = useState<RangeType>('week')` and `const [date, setDate] = useState(toDateStr(new Date()))` (import `toDateStr` from `@/lib/dates`).
  - `const { activeChildId, activeChild } = useActiveChild();`
  - `const { data: sum } = useSummary(activeChildId ?? undefined, range, date);`
  - `const today = toDateStr(new Date()); const { data: todayLogs } = useLogs(activeChildId ?? undefined, today);`
  - `const { data: rewards } = useRewards(activeChildId ?? undefined);`
- [ ] **Step 2: Bind UI**
  - Header subtitle: `Progress {activeChild?.name}, {activeChild?.age} tahun`.
  - Render `<RangeFilter range={range} date={date} onRangeChange={setRange} onDateChange={setDate} />` under the header.
  - Stat cards use `sum.summary.totalPoints`, `sum.summary.weeklyTargetPct`, completed/total from `sum.summary`.
  - Weekly line chart `data={sum.summary.series}` with `dataKey="points"`, x `dataKey="label"`.
  - Pie chart `data={sum.summary.categoryBreakdown}`.
  - "Selesai Hari Ini" / "Menunggu Persetujuan" lists read from `todayLogs` (filter by status). Wire approve/reject buttons to `apiSend('/api/logs/'+log.id, 'PATCH', { action })` then `mutate`.
  - Rewards progress uses `rewards` + `sum.summary.totalPoints`.
  - If `!activeChildId`: render a centered message "Belum ada anak. Tambah anak di menu Anak." with a link to `/parent/child`.
- [ ] **Step 3: Verify** — `npm run dev`, login as demo, dashboard renders real numbers; toggling Minggu/Bulan changes the chart and totals.
- [ ] **Step 4: Commit**

```bash
git add src/app/parent/dashboard/page.tsx
git commit -m "feat(parent): wire dashboard to live summary with range filter"
```

---

### Task G2: Parent children page → multi-child list + CRUD + access code

**Files:**
- Modify: `src/app/parent/child/page.tsx`

- [ ] **Step 1: Replace the single-profile form with a list view**
  - Use `useChildren()` + `useActiveChild()`.
  - Render each child as a card: avatar, name, age, targets, **access code** (with a "Regenerate" button → `apiSend('/api/children/'+id+'/access-code', 'POST')` then `mutate`), Edit and Delete buttons.
  - "Tambah Anak" button opens an inline form (name, age, avatar emoji, daily/weekly targets, checkbox "Pakai tugas & reward default"). Submit → `apiSend('/api/children', 'POST', form)` then `mutate` + `refresh()`.
  - Edit → `apiSend('/api/children/'+id, 'PATCH', form)`. Delete → confirm, then `apiSend('/api/children/'+id, 'DELETE', undefined)` then `mutate`.
- [ ] **Step 2: Verify** — add a second child with defaults; it appears in the switcher; access code shows and regenerates.
- [ ] **Step 3: Commit**

```bash
git add src/app/parent/child/page.tsx
git commit -m "feat(parent): multi-child list with CRUD and access codes"
```

---

### Task G3: Parent tasks page → live CRUD

**Files:**
- Modify: `src/app/parent/tasks/page.tsx`

- [ ] **Step 1: Wire data** — `useActiveChild()` + `useTasks(activeChildId)`. Group by `category` (reuse existing grouping UI). Add task form → `apiSend('/api/children/'+activeChildId+'/tasks','POST',form)`. Toggle active / edit → `apiSend('/api/tasks/'+id,'PATCH',{…})`. Delete → `apiSend('/api/tasks/'+id,'DELETE')`. `mutate` after each.
- [ ] **Step 2: Verify** — create/edit/delete a task; persists across refresh.
- [ ] **Step 3: Commit**

```bash
git add src/app/parent/tasks/page.tsx
git commit -m "feat(parent): wire tasks page to API CRUD"
```

---

### Task G4: Parent checklist page → live logs + approval

**Files:**
- Modify: `src/app/parent/checklist/page.tsx`

- [ ] **Step 1: Wire data** — `useActiveChild()`, `useTasks`, `useLogs(activeChildId, today)`. Show each active task with its log status; parent can toggle done via `apiSend('/api/children/'+id+'/logs','POST',{taskId,date:today,done})`; approve/reject waiting items via `apiSend('/api/logs/'+logId,'PATCH',{action})`. `mutate` the logs after each.
- [ ] **Step 2: Verify** — toggling and approving updates status and points.
- [ ] **Step 3: Commit**

```bash
git add src/app/parent/checklist/page.tsx
git commit -m "feat(parent): wire checklist to live logs + approval"
```

---

### Task G5: Parent rewards page → live CRUD + claim

**Files:**
- Modify: `src/app/parent/rewards/page.tsx`

- [ ] **Step 1: Wire data** — `useRewards(activeChildId)` + `usePockets(activeChildId)`. Add/edit/delete reward via rewards routes. "Beri reward" → `apiSend('/api/children/'+id+'/...'`)`: create a claim. (Claims endpoint: add `POST /api/children/[id]/claims` mirroring notes route using `createClaim`; include optional `pocketId` to auto-credit — if `pocketId` set, also `createTransaction({pocketId, amount: reward.requiredPoint, txnType:'credit', source:'reward'})`.) Show claim history from `listClaims`.
- [ ] **Step 2: Add claims route** — `src/app/api/children/[id]/claims/route.ts`:

```ts
import { z } from 'zod';
import { prisma } from '@/server/db';
import { ok, fail, parseBody, handleError } from '@/lib/http';
import { requireUserId, assertChildOwnership } from '@/server/auth/session';
import { listClaims, createClaim } from '@/server/repositories/rewardsRepo';
import { createTransaction } from '@/server/repositories/financeRepo';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    return ok(await listClaims(id));
  } catch (e) { return handleError(e); }
}

const schema = z.object({ rewardId: z.string(), pocketId: z.string().optional() });

export async function POST(req: Request, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await assertChildOwnership(id, userId);
    const { rewardId, pocketId } = await parseBody(req, schema);
    const reward = await prisma.reward.findFirst({ where: { id: rewardId, childId: id } });
    if (!reward) return fail('Reward tidak ditemukan', 404);
    const claim = await createClaim(id, {
      rewardId, totalPointUsed: reward.requiredPoint, pocketId: pocketId ?? null,
      status: 'given', givenAt: new Date(),
    });
    if (pocketId) {
      await createTransaction({ pocketId, amount: reward.requiredPoint, txnType: 'credit', source: 'reward', note: reward.title });
    }
    return ok(claim, 201);
  } catch (e) { return handleError(e); }
}
```

- [ ] **Step 3: Verify** — giving a reward with a pocket selected credits that pocket.
- [ ] **Step 4: Commit**

```bash
git add src/app/parent/rewards/page.tsx "src/app/api/children/[id]/claims/route.ts"
git commit -m "feat(parent): wire rewards CRUD + claim with optional pocket credit"
```

---

### Task G6: Parent reports page → live summary + monthly + notes

**Files:**
- Modify: `src/app/parent/reports/page.tsx`

- [ ] **Step 1: Wire data** — `useActiveChild()`, `useSummary(activeChildId, range, date)` with `RangeFilter`, `useNotes(activeChildId)`. Bar chart from `summary.series`. "Tugas paling konsisten" from `summary.topTasks`, "sering terlewat" from `summary.missedTasks`. Notes list from `useNotes`; add-note form → `apiSend('/api/children/'+id+'/notes','POST',{noteDate:today,note})`.
- [ ] **Step 2: Verify** — switching Minggu/Bulan recomputes the report; adding a note persists.
- [ ] **Step 3: Commit**

```bash
git add src/app/parent/reports/page.tsx
git commit -m "feat(parent): wire reports to live summary (week/month) + notes"
```

---

### Task G7: Parent settings + sign-out

**Files:**
- Modify: `src/app/parent/settings/page.tsx`
- Modify: `src/components/ParentSidebar.tsx`

- [ ] **Step 1: Settings** — replace dummy account fields with the session user's name/email (via `useSession()` from `next-auth/react`). The "Keluar" link in `ParentSidebar` → `onClick={() => signOut({ callbackUrl: '/' })}` (import `signOut` from `next-auth/react`; convert the `<Link>` to a `<button>`).
- [ ] **Step 2: Verify** — sign-out returns to landing and protects `/parent/*` again.
- [ ] **Step 3: Commit**

```bash
git add src/app/parent/settings/page.tsx src/components/ParentSidebar.tsx
git commit -m "feat(parent): settings shows account + real sign-out"
```

---

## Phase H — Child Mode (PIN) Pages

### Task H1: Child access entry page

**Files:**
- Create: `src/app/child/enter/page.tsx`
- Modify: `src/app/page.tsx` (Mode Anak button → `/child/enter`)

- [ ] **Step 1: Create `src/app/child/enter/page.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiSend } from '@/lib/api';

export default function ChildEnter() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await apiSend('/api/child-access', 'POST', { code: code.trim().toUpperCase() });
      router.push('/child');
    } catch {
      setError('Kode tidak valid'); setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
        <div className="text-5xl mb-3">🧒</div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Halo!</h1>
        <p className="text-sm text-gray-500 mb-5">Masukkan kode dari orang tua</p>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6}
          placeholder="KODE" className="w-full text-center tracking-[0.4em] text-2xl font-bold px-3 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#34A853]" />
        <button disabled={loading} type="submit"
          className="w-full bg-[#34A853] text-white py-3 rounded-xl text-base font-semibold disabled:opacity-60">
          {loading ? 'Memeriksa…' : 'Masuk'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Update landing** — in `src/app/page.tsx`, change the Child button `onClick` to `router.push('/child/enter')`.
- [ ] **Step 3: Verify** — entering the seeded child code (from `npm run db:seed` output) navigates to `/child`.
- [ ] **Step 4: Commit**

```bash
git add src/app/child/enter/page.tsx src/app/page.tsx
git commit -m "feat(child): add access-code entry page"
```

---

### Task H2: Child dashboard, points, rewards → live data + pockets

**Files:**
- Modify: `src/app/child/page.tsx`
- Modify: `src/app/child/points/page.tsx`
- Modify: `src/app/child/rewards/page.tsx`
- Create: `src/lib/childHooks.ts`

- [ ] **Step 1: Create `src/lib/childHooks.ts`**

```ts
'use client';
import useSWR from 'swr';
import { jsonFetcher } from './api';
import type { PocketWithBalance } from '@/domain/types';

export interface ChildMe {
  child: { id: string; name: string; avatar: string; dailyPointTarget: number };
  tasks: { id: string; title: string; category: string; point: number; requiresApproval: boolean }[];
  logs: { id: string; taskId: string; status: string; earnedPoint: number }[];
  rewards: { id: string; title: string; requiredPoint: number }[];
  pockets: PocketWithBalance[];
  total: number;
  today: string;
}
export function useChildMe() {
  return useSWR<ChildMe>('/api/child/me', jsonFetcher);
}
```

- [ ] **Step 2: Child dashboard** — replace dummy usage in `src/app/child/page.tsx` with `useChildMe()`. Build `logs` keyed by `taskId`; toggling a task calls `apiSend('/api/child/logs','POST',{taskId,date:me.today,done})` then `mutate()`. Compute `dailyPoints` via completed logs. Add a **pockets summary card** above tasks: list each `me.pockets` with `formatRupiah(p.balance)` and a total `formatRupiah(me.total)`. Keep existing greeting/progress/motivation/markup.
- [ ] **Step 3: Child points page** — use `useChildMe()` (or `useSummary` is parent-only; for child use the logs in `me` for today and show daily points + pockets). Replace dummy chart series with completed-today breakdown; keep simple.
- [ ] **Step 4: Child rewards page** — use `me.rewards` + current daily points to show progress to each reward (reuse existing visuals).
- [ ] **Step 5: Verify** — child view shows real tasks, can check tasks, sees pocket balances; refresh persists.
- [ ] **Step 6: Commit**

```bash
git add src/app/child src/lib/childHooks.ts
git commit -m "feat(child): wire child mode to live data incl. pockets"
```

---

## Phase I — Finance Page

### Task I1: Parent finance page + sidebar entry

**Files:**
- Create: `src/app/parent/finance/page.tsx`
- Modify: `src/components/ParentSidebar.tsx` (add "Keuangan" nav item)

- [ ] **Step 1: Add nav item** — in `ParentSidebar`, add to `navItems` after Reward: `{ href: '/parent/finance', label: 'Keuangan', icon: <Wallet size={18} /> }` (import `Wallet` from `lucide-react`).
- [ ] **Step 2: Create `src/app/parent/finance/page.tsx`**
  - Data: `useActiveChild()`, `usePockets(activeChildId)`, `useTransactions(activeChildId, start, end)` driven by a `RangeFilter`.
  - **Pockets section**: cards per pocket showing name, type, `formatRupiah(balance)`, delete button (`apiSend('/api/pockets/'+id,'DELETE')`). A "Tambah Kantong" form (name, type select [gaji/thr/investasi/custom], initialBalance) → `apiSend('/api/children/'+id+'/pockets','POST',form)`. Total balance header via `data.total`.
  - **Transaction form**: pocket select, txnType (credit/debit), amount, source select, note → `apiSend('/api/children/'+id+'/transactions','POST',form)`.
  - **Transfer form**: from-pocket, to-pocket, amount, note → `apiSend('/api/children/'+id+'/transfer','POST',form)`.
  - **History**: table from `useTransactions`, each row: date (`formatDateID` of `occurredAt`), pocket name, `txnType` badge, `formatRupiah(amount)`, source, note. Filtered by `RangeFilter` (compute start/end from range+date via `getWeekRange`/`getMonthRange`).
  - `mutate()` pockets + transactions after every mutation.
- [ ] **Step 3: Verify** — create pockets, add credit/debit, transfer between pockets; balances update; history filters by week/month.
- [ ] **Step 4: Commit**

```bash
git add src/app/parent/finance/page.tsx src/components/ParentSidebar.tsx
git commit -m "feat(finance): add parent finance page (pockets, transactions, transfer)"
```

---

## Phase J — Cleanup, Docker, Verification

### Task J1: Remove dummy data, type-check, lint

**Files:**
- Delete: `src/data/dummy.ts`

- [ ] **Step 1: Confirm no remaining imports**

Run: `grep -rn "data/dummy" src/`
Expected: no matches. If any remain, migrate them before deleting.

- [ ] **Step 2: Delete the file**

```bash
git rm src/data/dummy.ts
```

- [ ] **Step 3: Type-check & build**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds (Prisma generate runs via build script).

- [ ] **Step 4: Run all unit tests**

Run: `npm test`
Expected: all suites pass (dates, points, summary, finance, password, childSession).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove dummy data; type-check and tests green"
```

---

### Task J2: Dockerfile + README + .env.example finalize

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`
- Modify: `README.md`
- Modify: `next.config.js` (add `output: 'standalone'`)

- [ ] **Step 1: Set standalone output** — in `next.config.js`, add `output: 'standalone'` to the config object.
- [ ] **Step 2: Create `Dockerfile`**

```dockerfile
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

- [ ] **Step 3: Create `.dockerignore`** — lines: `node_modules`, `.next`, `.git`, `*.db`, `.env`.
- [ ] **Step 4: Update `README.md`** — replace the "Dummy Data Demo" framing with the real setup: env vars, `npx prisma migrate dev`, `npm run db:seed` (prints demo login + child code), `npm run dev`, test command, and `docker build`/`docker run -v` note for SQLite persistence.
- [ ] **Step 5: Commit**

```bash
git add Dockerfile .dockerignore README.md next.config.js
git commit -m "chore: add Dockerfile, standalone output, updated README"
```

---

### Task J3: End-to-end verification (manual)

- [ ] **Step 1:** `npm run db:reset && npm run db:seed && npm run dev`.
- [ ] **Step 2:** Register a new parent → land on dashboard (empty state, no child).
- [ ] **Step 3:** Add a child with "Pakai default" → tasks & rewards appear; child shows in switcher.
- [ ] **Step 4:** Checklist a few tasks; approve a waiting item → dashboard points update.
- [ ] **Step 5:** Toggle Minggu/Bulan on dashboard and reports → aggregates change.
- [ ] **Step 6:** Finance: create Kantong Gaji/THR/Investasi, add a credit, do a transfer → balances correct; filter history by week/month.
- [ ] **Step 7:** Add a second child → verify data isolation between children via the switcher.
- [ ] **Step 8:** Copy a child's access code, open `/child/enter` in a private window, enter code → child dashboard shows that child's tasks, points, and pocket balances; check a task.
- [ ] **Step 9:** Sign out → `/parent/*` redirects to login; child cookie still scoped to child only.
- [ ] **Step 10:** (If Google credentials set) test "Masuk dengan Google".

---

## Self-Review

**Spec coverage:**
- Backend (Next.js API + Prisma + SQLite) → Phase A, C, E ✓
- Auth email/password + Google → Phase B6, D ✓
- Multi-child (CRUD, switcher, isolation, family aggregate via switcher) → C2, E1, F2, G2 ✓
  (Note: explicit "Semua Anak" aggregate view is satisfied minimally by per-child switching; a dedicated aggregate screen is deferred — acceptable per spec's "opsi".)
- Weekly/monthly filter → B1, B4, E3, F3, G1, G6, I1 ✓
- Pockets (custom multi-pocket, transactions, transfer, child view, reward credit) → B5, C4, E5, G5, H2, I1 ✓
- Child PIN access → B7, C1, E6, H1, H2, D4 ✓
- Migration off dummy + seed + Docker → C5, G/H, J ✓

**Placeholder scan:** No TBD/TODO; UI-migration tasks specify exact hooks, endpoints, and bindings rather than vague "handle X".

**Type consistency:** `ChildSummary`, `PocketWithBalance`, `RangeType` defined in `src/domain/types.ts` (B2) and consumed consistently in services (B4), hooks (F1), and components (F3, G, I). Repo function names (`pocketsWithBalances`, `createTransaction`, `transfer`, `upsertLog`, `setLogStatus`) match across C and E. Route param contexts use `params: Promise<…>` (Next.js 15) consistently.
