// Dummy data for MTRC application

export interface Child {
  id: string;
  name: string;
  age: number;
  avatar: string;
  dailyPointTarget: number;
  weeklyPointTarget: number;
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

// Dummy Child
export const dummyChild: Child = {
  id: 'child-1',
  name: 'Raka',
  age: 7,
  avatar: '🧒',
  dailyPointTarget: 60,
  weeklyPointTarget: 350,
};

// Dummy Tasks
export const dummyTasks: Task[] = [
  {
    id: 'task-1',
    childId: 'child-1',
    title: 'Bangun pagi tanpa rewel',
    description: 'Bangun tepat waktu tanpa dibangunkan',
    category: 'pagi',
    point: 5,
    requiresApproval: false,
    isActive: true,
  },
  {
    id: 'task-2',
    childId: 'child-1',
    title: 'Merapikan tempat tidur',
    description: 'Merapikan seprai dan bantal',
    category: 'pagi',
    point: 5,
    requiresApproval: false,
    isActive: true,
  },
  {
    id: 'task-3',
    childId: 'child-1',
    title: 'Mandi sendiri',
    description: 'Mandi tanpa bantuan orang tua',
    category: 'kebersihan',
    point: 5,
    requiresApproval: true,
    isActive: true,
  },
  {
    id: 'task-4',
    childId: 'child-1',
    title: 'Gosok gigi pagi dan malam',
    description: 'Gosok gigi minimal 2 kali sehari',
    category: 'kebersihan',
    point: 5,
    requiresApproval: false,
    isActive: true,
  },
  {
    id: 'task-5',
    childId: 'child-1',
    title: 'Memakai baju sendiri',
    description: 'Mengganti pakaian sendiri',
    category: 'kemandirian',
    point: 5,
    requiresApproval: false,
    isActive: true,
  },
  {
    id: 'task-6',
    childId: 'child-1',
    title: 'Membereskan mainan',
    description: 'Merapikan semua mainan di tempat yang benar',
    category: 'rumah',
    point: 5,
    requiresApproval: true,
    isActive: true,
  },
  {
    id: 'task-7',
    childId: 'child-1',
    title: 'Membaca/belajar 15 menit',
    description: 'Belajar atau membaca selama 15 menit',
    category: 'belajar',
    point: 10,
    requiresApproval: true,
    isActive: true,
  },
  {
    id: 'task-8',
    childId: 'child-1',
    title: 'Membantu pekerjaan rumah ringan',
    description: 'Membantu orang tua dengan tugas ringan',
    category: 'rumah',
    point: 10,
    requiresApproval: true,
    isActive: true,
  },
  {
    id: 'task-9',
    childId: 'child-1',
    title: 'Bicara sopan',
    description: 'Menggunakan bahasa yang baik dan sopan',
    category: 'sikap',
    point: 10,
    requiresApproval: false,
    isActive: true,
  },
  {
    id: 'task-10',
    childId: 'child-1',
    title: 'Tidur tepat waktu',
    description: 'Tidur sebelum jam 21:00',
    category: 'malam',
    point: 10,
    requiresApproval: false,
    isActive: true,
  },
];

// Dummy Daily Task Logs for today
export const getDummyDailyTaskLogs = (date: string): DailyTaskLog[] => [
  {
    id: 'log-1',
    taskId: 'task-1',
    date,
    status: 'completed',
    earnedPoint: 5,
    completedAt: '06:30',
    approvedAt: '06:30',
  },
  {
    id: 'log-2',
    taskId: 'task-2',
    date,
    status: 'completed',
    earnedPoint: 5,
    completedAt: '06:45',
    approvedAt: '06:45',
  },
  {
    id: 'log-3',
    taskId: 'task-3',
    date,
    status: 'waiting_approval',
    earnedPoint: 0,
    completedAt: '07:00',
  },
  {
    id: 'log-4',
    taskId: 'task-4',
    date,
    status: 'completed',
    earnedPoint: 5,
    completedAt: '07:15',
    approvedAt: '07:15',
  },
  {
    id: 'log-5',
    taskId: 'task-5',
    date,
    status: 'completed',
    earnedPoint: 5,
    completedAt: '07:30',
    approvedAt: '07:30',
  },
  {
    id: 'log-6',
    taskId: 'task-6',
    date,
    status: 'completed',
    earnedPoint: 5,
    completedAt: '17:00',
    approvedAt: '17:15',
  },
  {
    id: 'log-7',
    taskId: 'task-7',
    date,
    status: 'completed',
    earnedPoint: 10,
    completedAt: '18:00',
    approvedAt: '18:30',
  },
  {
    id: 'log-8',
    taskId: 'task-8',
    date,
    status: 'pending',
    earnedPoint: 0,
  },
  {
    id: 'log-9',
    taskId: 'task-9',
    date,
    status: 'completed',
    earnedPoint: 10,
    completedAt: '16:00',
    approvedAt: '16:00',
  },
  {
    id: 'log-10',
    taskId: 'task-10',
    date,
    status: 'pending',
    earnedPoint: 0,
  },
];

// Dummy Rewards
export const dummyRewards: Reward[] = [
  {
    id: 'reward-1',
    childId: 'child-1',
    title: 'Pilih menu sarapan',
    description: 'Kamu bisa memilih menu sarapan favorit',
    requiredPoint: 50,
    type: 'food',
    isActive: true,
  },
  {
    id: 'reward-2',
    childId: 'child-1',
    title: 'Main tambahan 30 menit',
    description: 'Waktu bermain ditambah 30 menit',
    requiredPoint: 60,
    type: 'playtime',
    isActive: true,
  },
  {
    id: 'reward-3',
    childId: 'child-1',
    title: 'Pilih film keluarga',
    description: 'Kamu bisa memilih film untuk ditonton bersama keluarga',
    requiredPoint: 70,
    type: 'movie',
    isActive: true,
  },
  {
    id: 'reward-4',
    childId: 'child-1',
    title: 'Jalan-jalan kecil',
    description: 'Liburan kecil ke tempat favorit',
    requiredPoint: 85,
    type: 'outing',
    isActive: true,
  },
  {
    id: 'reward-5',
    childId: 'child-1',
    title: 'Beli mainan kecil',
    description: 'Belanja mainan kecil dengan orang tua',
    requiredPoint: 100,
    type: 'toy',
    isActive: true,
  },
];

// Dummy Reward Claims
export const dummyRewardClaims: RewardClaim[] = [
  {
    id: 'claim-1',
    rewardId: 'reward-1',
    date: '2024-01-02',
    status: 'given',
  },
  {
    id: 'claim-2',
    rewardId: 'reward-2',
    date: '2024-01-09',
    status: 'given',
  },
];

// Dummy Parent Notes
export const dummyParentNotes: ParentNote[] = [
  {
    id: 'note-1',
    date: '2024-01-08',
    note: 'Hari ini Raka sangat semangat membereskan mainan. Dia juga membantu membereskan kamar tanpa diminta.',
  },
  {
    id: 'note-2',
    date: '2024-01-07',
    note: 'Masih perlu dibantu untuk tidur tepat waktu. Tapi overall hari ini bagus, semua tugas pagi selesai dengan baik.',
  },
  {
    id: 'note-3',
    date: '2024-01-06',
    note: 'Raka berhasil belajar 20 menit tanpa dipaksa. Dia membaca cerita sendiri dan terlihat menikmati.',
  },
  {
    id: 'note-4',
    date: '2024-01-05',
    note: 'Pagi ini sedikit rewel saat dibangunkan, tapi setelah itu semua lancar.',
  },
  {
    id: 'note-5',
    date: '2024-01-04',
    note: 'Hari yang sempurna! Semua tugas selesai tepat waktu. Raka terlihat bangga dengan poinnya.',
  },
];

// Calculate daily points
export const calculateDailyPoints = (logs: DailyTaskLog[]): number => {
  return logs
    .filter((log) => log.status === 'completed')
    .reduce((sum, log) => sum + log.earnedPoint, 0);
};

// Calculate weekly points
export const calculateWeeklyPoints = (): number => {
  return 280; // Dummy value
};

// Get task by ID
export const getTaskById = (id: string): Task | undefined => {
  return dummyTasks.find((task) => task.id === id);
};

// Get reward by ID
export const getRewardById = (id: string): Reward | undefined => {
  return dummyRewards.find((reward) => reward.id === id);
};
