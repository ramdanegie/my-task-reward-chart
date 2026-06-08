# MTRC - My Task Reward Chart
## Frontend Application (Dummy Data Demo)

**Version:** 0.1.0 MVP  
**Status:** Frontend Demo with Dummy Data  
**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Recharts

---

## 📋 Overview

MTRC adalah aplikasi web untuk membantu orang tua membuat, memantau, dan mengevaluasi tugas harian anak usia 7 tahun menggunakan sistem poin dan reward.

Aplikasi ini dirancang dengan **dua mode utama**:
- **Parent Mode**: Dashboard lengkap untuk mengelola tugas, reward, dan memantau progress anak
- **Child Mode**: Antarmuka sederhana untuk anak usia 7 tahun agar dapat melihat tugas dan mengumpulkan poin

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm atau yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Buka browser dan akses:
- **Local:** http://localhost:3000
- **Halaman Utama:** Pilih mode Orang Tua atau Anak

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page dengan pilihan role
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   │
│   ├── parent/
│   │   ├── layout.tsx           # Parent layout dengan sidebar
│   │   ├── login/page.tsx       # Parent login page
│   │   ├── dashboard/page.tsx   # Parent dashboard (main stats)
│   │   ├── tasks/page.tsx       # Task management
│   │   ├── child/page.tsx       # Child profile management
│   │   ├── checklist/page.tsx   # Daily checklist & approval
│   │   ├── rewards/page.tsx     # Reward management
│   │   ├── reports/page.tsx     # Weekly reports & insights
│   │   └── settings/page.tsx    # Settings & preferences
│   │
│   └── child/
│       ├── layout.tsx           # Child layout dengan bottom nav
│       ├── page.tsx             # Child dashboard (tugas harian)
│       ├── points/page.tsx      # Child points tracking
│       └── rewards/page.tsx     # Child rewards view
│
├── components/
│   └── ParentSidebar.tsx        # Navigation sidebar untuk parent mode
│
└── data/
    └── dummy.ts                 # Dummy data & data types
```

---

## 🎯 Features Implemented

### Parent Mode

#### 1. **Dashboard** 📊
- Total poin hari ini & minggu ini
- Tingkat penyelesaian tugas
- Chart progress mingguan (Line Chart)
- Breakdown kategori tugas (Pie Chart)
- Status tugas (completed, pending, waiting approval)
- Daftar reward yang akan dicapai

#### 2. **Profile Anak** 👦
- Edit nama anak
- Edit usia
- Target poin harian & mingguan
- Menyimpan perubahan

#### 3. **Manajemen Tugas** ✅
- Daftar tugas dikelompokkan per kategori
- Status aktif/nonaktif
- Tampilan poin per tugas
- Indikator "Perlu Approval"
- Form untuk tambah tugas baru

#### 4. **Checklist Harian** ☑️
- Tampilan tugas selesai
- Tugas menunggu approval (dengan tombol approve/reject)
- Tugas belum dikerjakan
- Real-time poin counter

#### 5. **Manajemen Reward** 🎁
- Daftar reward dengan tipe (food, playtime, movie, outing, toy, activity)
- Indikator minimal poin
- Tombol klaim reward
- Riwayat reward yang diberikan

#### 6. **Laporan Mingguan** 📈
- Grafik bar progress harian
- Total poin minggu
- Tugas yang paling konsisten
- Tugas yang sering terlewat
- Catatan harian orang tua
- Insights & rekomendasi

#### 7. **Settings** ⚙️
- Pengaturan akun
- Notifikasi preferences
- Bahasa & zona waktu
- Zona berbahaya (reset, delete)

---

### Child Mode

#### 1. **Dashboard Harian** 📝
- Greeting yang ramah anak-anak
- Progress bar poin harian
- Tugas dikelompok per kategori
- Status tugas visual (✅ selesai, ⏳ menunggu approval, ⭕ pending)
- Interaktif - klik untuk tandai selesai
- Pesan motivasi berdasarkan progress

#### 2. **Points Tracking** ⭐
- Tampilan besar poin mingguan
- Grafik line chart progress harian
- Perincian poin per hari
- Info motivasi tentang reward

#### 3. **Rewards View** 🎁
- Highlight reward berikutnya
- Daftar semua reward dengan progress
- Visual status (dapat diklaim, sudah diklaim, belum tercapai)
- Riwayat reward yang sudah diklaim

---

## 📊 Dummy Data Included

### Child Profile
- **Nama:** Raka
- **Usia:** 7 tahun
- **Daily Target:** 60 poin
- **Weekly Target:** 350 poin

### Tasks (10 Default Tasks)
Tugas-tugas untuk anak usia 7 tahun:
- Pagi (2): Bangun pagi, Merapikan tempat tidur
- Kebersihan (2): Mandi, Gosok gigi
- Kemandirian (1): Memakai baju sendiri
- Rumah Tangga (2): Membereskan mainan, Membantu pekerjaan rumah
- Belajar (1): Membaca/belajar 15 menit
- Sikap/Perilaku (1): Bicara sopan
- Malam (1): Tidur tepat waktu

### Rewards (5 Default Rewards)
- Pilih menu sarapan (50 poin) 🍕
- Main tambahan 30 menit (60 poin) 🎮
- Pilih film keluarga (70 poin) 🎬
- Jalan-jalan kecil (85 poin) 🎢
- Beli mainan kecil (100 poin) 🧩

### Daily Logs
- Tugas untuk hari ini dengan status yang bervariasi
- Simulasi beberapa tugas sudah selesai
- Beberapa tugas menunggu approval

### Parent Notes
- 5 catatan harian contoh untuk minggu ini

---

## 🎨 Design Features

### Parent Mode
- Sidebar navigasi dengan ikon
- Gradient backgrounds (purple, pink, blue)
- Card-based layout
- Charts & analytics
- Color-coded status indicators

### Child Mode
- Friendly & playful design
- Large buttons & text (usia 7 tahun)
- Lots of emojis
- Bottom navigation (sticky)
- Interactive task cards
- Progress bars yang mudah dipahami
- Cheerful color palette

---

## 🔧 Technology Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 15** | Framework React dengan App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling & responsive design |
| **Recharts** | Charts & graphs |
| **Lucide React** | Icons |
| **React Hooks** | State management |

---

## 🚀 Building for Production

```bash
# Build production bundle
npm run build

# Start production server
npm start
```

---

## 📝 Notes

### Dummy Data
Semua data dalam aplikasi ini adalah **dummy/contoh**. Data disimpan hanya dalam state React dan akan hilang jika page di-refresh. Tidak ada backend atau database yang sebenarnya.

### Next Steps untuk Backend Integration
1. Buat backend API (Next.js API Routes, Express, atau framework lain)
2. Integrasikan database (PostgreSQL, MongoDB, SQLite)
3. Tambahkan authentication (JWT, OAuth)
4. Connect frontend ke API endpoints
5. Implement real-time updates (Socket.io atau WebSocket)

### Features untuk Phase 2+
- Multi-anak dalam satu akun
- Notifikasi real-time
- Gamification (badges, levels)
- AI insights & recommendations
- Export laporan PDF
- Mobile app (React Native/Flutter)

---

## 📸 Screenshots

### Landing Page
Pilihan antara Parent dan Child mode

### Parent Dashboard
Visualisasi stats dan progress anak

### Child Tasks
Interface sederhana untuk anak mengerjakan tugas

### Parent Checklist
Approval interface untuk tugas yang menunggu persetujuan

---

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hooks](https://react.dev/reference/react)
- [Recharts](https://recharts.org/)

---

## 📄 License

MIT License - Feel free to use for educational & personal projects

---

## 🤝 Contributing

Kontribusi welcome! Silakan fork dan submit pull requests.

---

## 📧 Support

Jika ada pertanyaan atau issues, silakan buat issue di repository ini.

---

**Last Updated:** January 2024  
**Demo Status:** ✅ Fully Functional with Dummy Data
