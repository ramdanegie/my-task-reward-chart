// Dummy data for MTRC application

export interface Child {
  id: string;
  name: string;
  age: number;
  avatar: string;
  dailyPointTarget: number;
  weeklyPointTarget: number;
  isActive: boolean;
}

export interface Task {
  id: string;
  childId: string;
  title: string;
  description: string;
  category: 'pagi' | 'kebersihan' | 'kemandirian' | 'rumah' | 'belajar' | 'sikap' | 'malam';
  point: number;
  requiresApproval: boolean;
  isActive: boolean;
}

export interface DailyTaskLog {
  id: string;
  taskId: string;
  date: string;
  status: 'pending' | 'in_progress' | 'waiting_approval' | 'completed' | 'missed';
  earnedPoint: number;
  completedAt?: string;
  approvedAt?: string;
}

export interface Reward {
  id: string;
  childId: string;
  title: string;
  description: string;
  requiredPoint: number;
  type: 'activity' | 'playtime' | 'food' | 'movie' | 'toy' | 'outing';
  isActive: boolean;
}

export interface RewardClaim {
  id: string;
  rewardId: string;
  date: string;
  status: 'claimed' | 'given' | 'pending';
}

export interface ParentNote {
  id: string;
  date: string;
  note: string;
}

export interface Pocket {
  id: string;
  childId: string;
  name: string;
  type: string; // custom label: "Kantong Gaji", "Kantong THR", etc.
  initialBalance: number;
  isActive: boolean;
  createdAt: string;
}

export interface PocketTransaction {
  id: string;
  pocketId: string;
  amount: number;
  txnType: 'credit' | 'debit';
  source: string; // "gaji", "reward", "transfer", "pengeluaran", etc.
  note: string;
  createdAt: string;
}

// ─── Children ─────────────────────────────────────────────────────────────────

export const dummyChildren: Child[] = [
  { id: 'child-1', name: 'Raka', age: 7, avatar: 'R', dailyPointTarget: 60, weeklyPointTarget: 350, isActive: true },
  { id: 'child-2', name: 'Sari', age: 9, avatar: 'S', dailyPointTarget: 70, weeklyPointTarget: 400, isActive: true },
];

// Active child (can be changed by parent)
export let activeChildId = 'child-1';
export const setActiveChildId = (id: string) => { activeChildId = id; };

export const dummyChild = dummyChildren[0]; // backward-compat

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const dummyTasks: Task[] = [
  { id: 'task-1', childId: 'child-1', title: 'Bangun pagi tanpa rewel', description: 'Bangun tepat waktu tanpa dibangunkan', category: 'pagi', point: 5, requiresApproval: false, isActive: true },
  { id: 'task-2', childId: 'child-1', title: 'Merapikan tempat tidur', description: 'Merapikan seprai dan bantal', category: 'pagi', point: 5, requiresApproval: false, isActive: true },
  { id: 'task-3', childId: 'child-1', title: 'Mandi sendiri', description: 'Mandi tanpa bantuan orang tua', category: 'kebersihan', point: 5, requiresApproval: true, isActive: true },
  { id: 'task-4', childId: 'child-1', title: 'Gosok gigi pagi dan malam', description: 'Gosok gigi minimal 2 kali sehari', category: 'kebersihan', point: 5, requiresApproval: false, isActive: true },
  { id: 'task-5', childId: 'child-1', title: 'Memakai baju sendiri', description: 'Mengganti pakaian sendiri', category: 'kemandirian', point: 5, requiresApproval: false, isActive: true },
  { id: 'task-6', childId: 'child-1', title: 'Membereskan mainan', description: 'Merapikan semua mainan di tempat yang benar', category: 'rumah', point: 5, requiresApproval: true, isActive: true },
  { id: 'task-7', childId: 'child-1', title: 'Membaca/belajar 15 menit', description: 'Belajar atau membaca selama 15 menit', category: 'belajar', point: 10, requiresApproval: true, isActive: true },
  { id: 'task-8', childId: 'child-1', title: 'Membantu pekerjaan rumah ringan', description: 'Membantu orang tua dengan tugas ringan', category: 'rumah', point: 10, requiresApproval: true, isActive: true },
  { id: 'task-9', childId: 'child-1', title: 'Bicara sopan', description: 'Menggunakan bahasa yang baik dan sopan', category: 'sikap', point: 10, requiresApproval: false, isActive: true },
  { id: 'task-10', childId: 'child-1', title: 'Tidur tepat waktu', description: 'Tidur sebelum jam 21:00', category: 'malam', point: 10, requiresApproval: false, isActive: true },
  // Sari's tasks
  { id: 'task-11', childId: 'child-2', title: 'Bangun pagi', description: 'Bangun sebelum jam 06:30', category: 'pagi', point: 5, requiresApproval: false, isActive: true },
  { id: 'task-12', childId: 'child-2', title: 'Belajar 30 menit', description: 'Belajar atau membaca 30 menit', category: 'belajar', point: 15, requiresApproval: true, isActive: true },
  { id: 'task-13', childId: 'child-2', title: 'Membereskan kamar', description: 'Merapikan seluruh kamar', category: 'rumah', point: 10, requiresApproval: true, isActive: true },
];

// ─── Logs ─────────────────────────────────────────────────────────────────────

export const getDummyDailyTaskLogs = (date: string, childId = 'child-1'): DailyTaskLog[] => {
  const base: DailyTaskLog[] = [
    { id: 'log-1', taskId: 'task-1', date, status: 'completed', earnedPoint: 5, completedAt: '06:30', approvedAt: '06:30' },
    { id: 'log-2', taskId: 'task-2', date, status: 'completed', earnedPoint: 5, completedAt: '06:45', approvedAt: '06:45' },
    { id: 'log-3', taskId: 'task-3', date, status: 'waiting_approval', earnedPoint: 0, completedAt: '07:00' },
    { id: 'log-4', taskId: 'task-4', date, status: 'completed', earnedPoint: 5, completedAt: '07:15', approvedAt: '07:15' },
    { id: 'log-5', taskId: 'task-5', date, status: 'completed', earnedPoint: 5, completedAt: '07:30', approvedAt: '07:30' },
    { id: 'log-6', taskId: 'task-6', date, status: 'completed', earnedPoint: 5, completedAt: '17:00', approvedAt: '17:15' },
    { id: 'log-7', taskId: 'task-7', date, status: 'completed', earnedPoint: 10, completedAt: '18:00', approvedAt: '18:30' },
    { id: 'log-8', taskId: 'task-8', date, status: 'pending', earnedPoint: 0 },
    { id: 'log-9', taskId: 'task-9', date, status: 'completed', earnedPoint: 10, completedAt: '16:00', approvedAt: '16:00' },
    { id: 'log-10', taskId: 'task-10', date, status: 'pending', earnedPoint: 0 },
  ];
  if (childId === 'child-2') return [
    { id: 'log-s1', taskId: 'task-11', date, status: 'completed', earnedPoint: 5, completedAt: '06:20' },
    { id: 'log-s2', taskId: 'task-12', date, status: 'waiting_approval', earnedPoint: 0, completedAt: '16:00' },
    { id: 'log-s3', taskId: 'task-13', date, status: 'pending', earnedPoint: 0 },
  ];
  return base;
};

// ─── Weekly data by filter ────────────────────────────────────────────────────

export type FilterPeriod = 'week' | 'month';

export const getWeeklyChartData = (period: FilterPeriod = 'week') => {
  if (period === 'week') return [
    { label: 'Sen', points: 240 }, { label: 'Sel', points: 280 }, { label: 'Rab', points: 250 },
    { label: 'Kam', points: 300 }, { label: 'Jum', points: 270 }, { label: 'Sab', points: 310 }, { label: 'Min', points: 280 },
  ];
  return [
    { label: 'Mgg 1', points: 1650 }, { label: 'Mgg 2', points: 1920 }, { label: 'Mgg 3', points: 1750 }, { label: 'Mgg 4', points: 1980 },
  ];
};

export const calculateWeeklyPoints = (childId = 'child-1', period: FilterPeriod = 'week') => {
  if (childId === 'child-2') return period === 'week' ? 210 : 830;
  return period === 'week' ? 280 : 1150;
};

// ─── Rewards ──────────────────────────────────────────────────────────────────

export const dummyRewards: Reward[] = [
  { id: 'reward-1', childId: 'child-1', title: 'Pilih menu sarapan', description: 'Kamu bisa memilih menu sarapan favorit', requiredPoint: 50, type: 'food', isActive: true },
  { id: 'reward-2', childId: 'child-1', title: 'Main tambahan 30 menit', description: 'Waktu bermain ditambah 30 menit', requiredPoint: 60, type: 'playtime', isActive: true },
  { id: 'reward-3', childId: 'child-1', title: 'Pilih film keluarga', description: 'Memilih film untuk ditonton bersama keluarga', requiredPoint: 70, type: 'movie', isActive: true },
  { id: 'reward-4', childId: 'child-1', title: 'Jalan-jalan kecil', description: 'Liburan kecil ke tempat favorit', requiredPoint: 85, type: 'outing', isActive: true },
  { id: 'reward-5', childId: 'child-1', title: 'Beli mainan kecil', description: 'Belanja mainan kecil dengan orang tua', requiredPoint: 100, type: 'toy', isActive: true },
];

export const dummyRewardClaims: RewardClaim[] = [
  { id: 'claim-1', rewardId: 'reward-1', date: '2024-01-02', status: 'given' },
  { id: 'claim-2', rewardId: 'reward-2', date: '2024-01-09', status: 'given' },
];

// ─── Parent Notes ─────────────────────────────────────────────────────────────

export const dummyParentNotes: ParentNote[] = [
  { id: 'note-1', date: '2024-01-08', note: 'Raka sangat semangat membereskan mainan. Juga membantu membereskan kamar tanpa diminta.' },
  { id: 'note-2', date: '2024-01-07', note: 'Masih perlu dibantu untuk tidur tepat waktu. Tapi overall hari ini bagus.' },
  { id: 'note-3', date: '2024-01-06', note: 'Raka berhasil belajar 20 menit tanpa dipaksa.' },
  { id: 'note-4', date: '2024-01-05', note: 'Pagi ini sedikit rewel saat dibangunkan, tapi setelah itu semua lancar.' },
  { id: 'note-5', date: '2024-01-04', note: 'Hari yang sempurna! Semua tugas selesai tepat waktu.' },
];

// ─── Pockets ──────────────────────────────────────────────────────────────────

export const dummyPockets: Pocket[] = [
  { id: 'pocket-1', childId: 'child-1', name: 'Kantong Gaji', type: 'gaji', initialBalance: 50000, isActive: true, createdAt: '2024-01-01' },
  { id: 'pocket-2', childId: 'child-1', name: 'Kantong Tabungan', type: 'tabungan', initialBalance: 100000, isActive: true, createdAt: '2024-01-01' },
  { id: 'pocket-3', childId: 'child-1', name: 'Kantong THR', type: 'thr', initialBalance: 200000, isActive: true, createdAt: '2024-01-01' },
  { id: 'pocket-4', childId: 'child-2', name: 'Kantong Gaji', type: 'gaji', initialBalance: 75000, isActive: true, createdAt: '2024-01-01' },
  { id: 'pocket-5', childId: 'child-2', name: 'Kantong Investasi', type: 'investasi', initialBalance: 150000, isActive: true, createdAt: '2024-01-01' },
];

export const dummyTransactions: PocketTransaction[] = [
  { id: 'txn-1', pocketId: 'pocket-1', amount: 10000, txnType: 'credit', source: 'gaji', note: 'Gaji minggu ke-1', createdAt: '2024-01-07' },
  { id: 'txn-2', pocketId: 'pocket-1', amount: 5000, txnType: 'credit', source: 'reward', note: 'Bonus tugas selesai', createdAt: '2024-01-09' },
  { id: 'txn-3', pocketId: 'pocket-1', amount: 8000, txnType: 'debit', source: 'pengeluaran', note: 'Beli es krim', createdAt: '2024-01-10' },
  { id: 'txn-4', pocketId: 'pocket-1', amount: 10000, txnType: 'credit', source: 'gaji', note: 'Gaji minggu ke-2', createdAt: '2024-01-14' },
  { id: 'txn-5', pocketId: 'pocket-2', amount: 20000, txnType: 'credit', source: 'transfer', note: 'Pindah dari Kantong Gaji', createdAt: '2024-01-08' },
  { id: 'txn-6', pocketId: 'pocket-2', amount: 10000, txnType: 'credit', source: 'gaji', note: 'Tabungan rutin', createdAt: '2024-01-14' },
  { id: 'txn-7', pocketId: 'pocket-3', amount: 200000, txnType: 'credit', source: 'thr', note: 'THR Lebaran', createdAt: '2024-01-01' },
  { id: 'txn-8', pocketId: 'pocket-4', amount: 15000, txnType: 'credit', source: 'gaji', note: 'Gaji minggu ke-1', createdAt: '2024-01-07' },
  { id: 'txn-9', pocketId: 'pocket-4', amount: 5000, txnType: 'debit', source: 'pengeluaran', note: 'Jajan', createdAt: '2024-01-09' },
];

export const getPocketBalance = (pocketId: string): number => {
  const pocket = dummyPockets.find(p => p.id === pocketId);
  if (!pocket) return 0;
  const txns = dummyTransactions.filter(t => t.pocketId === pocketId);
  return txns.reduce((sum, t) => t.txnType === 'credit' ? sum + t.amount : sum - t.amount, pocket.initialBalance);
};

export const getChildPockets = (childId: string) => dummyPockets.filter(p => p.childId === childId && p.isActive);

export const getPocketTransactions = (pocketId: string, period?: FilterPeriod) =>
  dummyTransactions.filter(t => t.pocketId === pocketId);

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const calculateDailyPoints = (logs: DailyTaskLog[]): number =>
  logs.filter(l => l.status === 'completed').reduce((sum, l) => sum + l.earnedPoint, 0);

export const getTaskById = (id: string) => dummyTasks.find(t => t.id === id);
export const getRewardById = (id: string) => dummyRewards.find(r => r.id === id);
export const getChildById = (id: string) => dummyChildren.find(c => c.id === id);
