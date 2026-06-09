# MTRC — My Task Reward Chart

Aplikasi web untuk membantu orang tua membuat, memantau, dan mengevaluasi tugas
harian anak menggunakan sistem poin, reward, dan **kantong saldo** — kini dengan
**backend nyata** (database, autentikasi, multi-anak).

**Tech stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma + SQLite ·
Auth.js v5 (email/password + Google) · SWR · Recharts · Vitest.

---

## Fitur

- **Autentikasi orang tua** — daftar/login email & password, plus opsi Google OAuth.
- **Multi-anak** — satu akun mengelola banyak profil anak, dengan pemilih anak aktif.
- **Tugas & checklist harian** — CRUD tugas, checklist, alur persetujuan (approval).
- **Sistem poin** — agregasi harian/mingguan/bulanan otomatis dari log.
- **Filter mingguan & bulanan** — dashboard dan laporan dengan navigasi periode.
- **Reward** — CRUD reward, pemberian reward, opsi kredit otomatis ke kantong.
- **Kantong saldo (multi-pocket)** — kantong kustom (Gaji, THR, Investasi, …),
  transaksi kredit/debit, **transfer antar kantong**, riwayat terfilter.
- **Mode Anak via kode** — anak membuka tampilannya sendiri dengan kode akses
  (tanpa login penuh orang tua); melihat tugas, poin, reward, dan saldo.

---

## Menjalankan secara lokal

```bash
# 1. Install dependencies
npm install

# 2. Siapkan environment (lihat .env.example)
cp .env.example .env
#   - AUTH_SECRET           : npx auth secret
#   - CHILD_SESSION_SECRET  : string acak
#   - AUTH_GOOGLE_ID/SECRET : opsional (login Google)

# 3. Migrasi database + data demo
npx prisma migrate deploy
npm run db:seed     # mencetak login demo + kode anak

# 4. Jalankan
npm run dev         # http://localhost:3000
```

**Akun demo (dari seed):** `demo@mtrc.app` / `demo1234`. Seed juga mencetak kode
Mode Anak (mis. `4XY6FD`) untuk dipakai di halaman **Mode Anak**.

### Perintah lain

```bash
npm test            # unit test (vitest): points, summary, finance, dates, auth
npm run db:reset    # reset & migrasi ulang database
npm run build       # build produksi (prisma generate + next build)
```

---

## Deploy (server Node)

Domain target: `https://mtrc.creativeshine.id`.

```bash
./build.sh                       # build standalone -> .next/standalone/
node .next/standalone/server.js  # jalankan (default PORT 3000)
```

`build.sh` menjalankan `npm ci`, `prisma generate`, `prisma migrate deploy`,
`next build`, lalu merakit bundle standalone (menyalin static, public, dan prisma).
Letakkan reverse proxy (Nginx/Caddy) di depan untuk TLS pada domain.

**Env produksi penting:** `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL=https://mtrc.creativeshine.id`,
`AUTH_TRUST_HOST=true`, `CHILD_SESSION_SECRET`, (opsional) `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`.
Pastikan `DATABASE_URL` menunjuk ke file SQLite yang persisten (gunakan path absolut di server).

---

## Arsitektur (DDD-lite)

```
prisma/                 schema.prisma, migrations, seed.ts
src/
  domain/               tipe domain murni
  server/
    db.ts               Prisma client (driver adapter better-sqlite3)
    repositories/       akses data per aggregate
    services/           use-case murni (points, summary, finance) + unit test
    auth/               password, child session, helper sesi
  app/api/.../route.ts  REST route handlers
  app/parent, app/child halaman (client) yang mengambil data via SWR
  lib/                  api helper, formatters, SWR hooks
  auth.ts               konfigurasi Auth.js v5
  middleware.ts         proteksi /parent (sesi) & /child (kode anak)
```

Spec & rencana implementasi ada di `docs/superpowers/`.
