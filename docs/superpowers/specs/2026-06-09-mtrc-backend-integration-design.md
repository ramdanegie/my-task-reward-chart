# Spec — Integrasi Backend MTRC + Multi-Anak, Filter Waktu, Kantong Saldo

**Tanggal:** 2026-06-09
**Status:** Disetujui (siap masuk tahap rencana implementasi)

## Context

Aplikasi MTRC saat ini adalah **demo frontend murni**: seluruh data berada di
`src/data/dummy.ts` dan React state, terikat pada satu anak hardcoded (`child-1`),
tanpa backend, tanpa persistensi, dan "login" hanya tombol navigasi tanpa auth.

Beberapa kebutuhan PRD belum terpenuhi:
- **Multi-anak** per akun orang tua (PRD §4.3, §5.5).
- **Filter mingguan & bulanan** pada dashboard dan laporan (PRD §4.5, §15.8) —
  saat ini `calculateWeeklyPoints()` mengembalikan nilai hardcoded `280`.
- **Saldo/kantong (multi-pocket)** yang dikelola orang tua dan tampil di dashboard
  anak (PRD §3.3, §4.6, §4.9, §5.4, §15.7) — belum ada sama sekali.

Selain itu, pengguna meminta **integrasi backend nyata** untuk menggantikan dummy data.

Tujuan: mengubah MTRC dari demo menjadi aplikasi ber-backend dengan auth nyata,
data persisten per akun, dan tiga fitur PRD di atas terimplementasi end-to-end.

## Keputusan (hasil brainstorming)

| Topik | Keputusan |
| --- | --- |
| Backend | Next.js API Routes + Prisma + **SQLite** (sesuai PRD §11.1, gaya DDD) |
| Auth | **Email/password + Google** via Auth.js v5 |
| Akses anak | **Kode/PIN per anak** (anak buka tampilannya sendiri tanpa login orang tua) |
| Cakupan | **Penuh sekaligus**: migrasi backend + auth + multi-anak + filter + kantong |
| Mata uang | **IDR**, disimpan sebagai Integer Rupiah (tanpa sen) |
| Data fetching klien | **SWR** (revalidate otomatis setelah mutasi) |

## Arsitektur (DDD-lite)

```
prisma/
  schema.prisma          # SQLite datasource + semua model
  seed.ts                # data demo awal (parent, anak, tugas/reward default, kantong)
src/
  domain/                # tipe & aturan domain murni (Child, Task, Points, Finance)
  server/
    db.ts                # Prisma client singleton
    repositories/        # akses data per aggregate
    services/            # use-case: pointsService, financeService, summaryService
  app/api/.../route.ts   # Route Handlers (REST) -> panggil services
  lib/
    api.ts               # helper fetch sisi-klien
    format.ts            # format Rupiah, tanggal
    hooks/               # SWR hooks (useChildren, useSummary, dst.)
  auth.ts                # konfigurasi Auth.js v5
  middleware.ts          # proteksi /parent/* (sesi) & /child/* (kode anak)
  context/ActiveChild.tsx# pemilih anak aktif (multi-anak)
```

- Halaman tetap **client component** (Recharts + interaktif), ambil data via SWR.
- Server-components sengaja dihindari agar churn ke halaman existing minimal.
- Lapisan: `route handler` (interface) → `service` (use-case/aturan) → `repository`
  (akses Prisma). Service murni & dapat di-unit-test tanpa HTTP.

## Database (Prisma / SQLite)

Mengikuti skema PRD §7 + tabel Auth.js. Nominal uang = **Integer Rupiah**.

Model:
- **Auth.js**: `User` (orang tua), `Account`, `Session`, `VerificationToken`.
- `Child` — `parentId(userId)`, `name`, `age`, `avatar`, `dailyPointTarget`,
  `weeklyPointTarget`, `accessCode` (unik, untuk PIN anak), `isActive`, timestamps.
- `Task` — `childId`, `title`, `description`, `category`, `point`,
  `requiresApproval`, `isActive`, timestamps.
- `DailyTaskLog` — `childId`, `taskId`, `logDate`, `status`
  (`pending|in_progress|waiting_approval|completed|missed`), `earnedPoint`,
  `approvedById?`, `completedAt?`, `approvedAt?`, `note?`, timestamps.
- `Reward` — `childId`, `title`, `description`, `rewardType`, `requiredPoint`,
  `isActive`, timestamps.
- `RewardClaim` — `childId`, `rewardId`, `totalPointUsed`, `pocketId?`
  (kredit otomatis ke kantong saat diberikan), `status` (`claimed|given`),
  `claimedAt?`, `givenAt?`, timestamps.
- `ParentNote` — `childId`, `noteDate`, `note`, timestamps.
- `Pocket` — `childId`, `name`, `type`, `initialBalance:Int`, `isActive`, timestamps.
- `PocketTransaction` — `pocketId`, `amount:Int`, `txnType` (`credit|debit`),
  `source` (`gaji|reward|transfer|pengeluaran|manual`), `note`,
  `transferGroupId?` (transfer antar kantong = 2 transaksi berpasangan), timestamps.

Relasi: `User 1—* Child`; `Child 1—*` (Task, DailyTaskLog, Reward, RewardClaim,
ParentNote, Pocket); `Pocket 1—* PocketTransaction`. Isolasi data dijamin lewat
`Child.parentId` (semua query parent difilter ke anak milik user yang login).

## Auth (Auth.js v5)

- Provider **Credentials** (email/password, hash dengan `bcryptjs`) + **Google**.
- Halaman `/parent/login` (ganti tombol dummy) + `/parent/register`.
- Endpoint registrasi `POST /api/auth/register` (buat user, hash password).
- `middleware.ts` melindungi `/parent/*` → redirect ke `/parent/login` bila belum login.
- Env diperlukan: `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `DATABASE_URL="file:./dev.db"`, `CHILD_SESSION_SECRET`. Disediakan `.env.example`
  + instruksi setup Google OAuth. Email/password berfungsi tanpa kredensial Google.

## Multi-anak

- `/parent/child`: dari form tunggal → **daftar anak + tambah/edit/hapus**, dengan
  opsi "Pakai tugas & reward default" (seed PRD §13.1 & §13.2) saat membuat anak baru.
- **Pemilih anak aktif** (dropdown) di sidebar/topbar parent; `activeChildId`
  disimpan di React context (`ActiveChild.tsx`) + localStorage. Semua halaman parent
  membaca `activeChildId`.
- Opsi **"Semua Anak"** untuk ringkasan keluarga agregat di dashboard.

## Filter Mingguan & Bulanan

- Toggle **Minggu / Bulan** + navigasi periode (← →) di **Dashboard** dan **Laporan**.
- `summaryService.getSummary(childId, { range, date })` menghitung dari log asli:
  total poin, % target, seri per-hari (minggu) / per-tanggal (bulan), breakdown
  kategori, tugas paling konsisten & paling sering terlewat.
- Endpoint `GET /api/children/:id/summary?range=week|month&date=YYYY-MM-DD`.
- Menggantikan `calculateWeeklyPoints()` hardcoded.

## Saldo / Kantong (fitur baru)

- Halaman parent baru **`/parent/finance`** (+ menu sidebar "Keuangan"):
  - Kelola kantong: nama/tipe/saldo awal custom (Gaji, THR, Investasi, dst.).
  - Catat transaksi kredit/debit; **transfer antar kantong** (2 transaksi berpasangan
    via `transferGroupId`, atomic dalam satu Prisma transaction).
  - Riwayat transaksi dengan filter minggu/bulan.
- `financeService.getBalances(childId)` = `initialBalance + Σkredit − Σdebit` per
  kantong + total. Endpoint `GET /api/children/:id/pockets`.
- **Dashboard Anak** menampilkan ringkasan saldo tiap kantong + total (read-only).
- Reward opsional meng-kredit kantong saat statusnya jadi "given" (`RewardClaim.pocketId`).

## Mode Anak via Kode/PIN

- Landing "Mode Anak" → input kode → `POST /api/child-access { code }` → set cookie
  `child_session` (httpOnly, signed pakai `CHILD_SESSION_SECRET`, scoped ke 1 anak).
- `/child/*` membaca cookie → memuat data anak itu saja (tugas, poin, reward, saldo).
  Anak bisa checklist tugas (buat/update `DailyTaskLog`); selebihnya read-only.
- `middleware.ts` menolak akses `/child/*` tanpa cookie valid → redirect ke input kode.
- Orang tua dapat melihat & regenerate kode anak di halaman anak.

## Migrasi & data demo

- Migrasi semua halaman dari `dummy.ts` → API + SWR hooks:
  `parent/{dashboard,tasks,checklist,rewards,reports,settings,child}`,
  `child/{page,points,rewards}`. Tipe data dipindah ke `src/domain/`.
- `dummy.ts` dihapus setelah migrasi selesai.
- `prisma/seed.ts`: 1 parent demo + 1 anak + tugas/reward default + contoh
  kantong/transaksi, supaya app langsung berisi saat pertama dijalankan.
- `Dockerfile` + volume SQLite (PRD §11.1 minta deploy Docker) — disertakan, opsional.
- `.gitignore`: pastikan `dev.db`, `*.db`, dan `.env` ter-ignore.

## Verifikasi (end-to-end)

1. `npm install`, set `.env`, `npx prisma migrate dev`, `npm run db:seed`.
2. `npm run dev` → register & login parent (email/password; Google bila kredensial ada).
3. Buat anak baru dengan seed default → muncul di pemilih anak.
4. Tambah/edit tugas → checklist harian → poin terhitung otomatis.
5. Toggle filter **Minggu/Bulan** di dashboard & laporan → angka berubah sesuai periode.
6. Halaman Keuangan: buat kantong, catat kredit/debit, transfer antar kantong →
   saldo akurat; riwayat terfilter per minggu/bulan.
7. Buka **Mode Anak** via kode → tugas, poin, reward, dan saldo kantong tampil benar.
8. **Unit test**: `pointsService` (agregasi minggu/bulan) & `financeService`
   (perhitungan saldo + transfer berpasangan).

## Out of scope (iterasi ini)

Sesuai PRD §10: leaderboard, chat, AI assistant, notifikasi WhatsApp, gamifikasi
kompleks, marketplace reward, video, pembayaran/subscription. Saran budgeting otomatis
(PRD §4.9) ditunda ke fase berikutnya.
