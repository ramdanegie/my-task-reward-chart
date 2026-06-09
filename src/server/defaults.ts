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
