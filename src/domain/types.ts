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
