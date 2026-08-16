#!/usr/bin/env bash
#
# deploy.sh — run ON THE SERVER (cPanel / DomaiNesia shared hosting), from
#             /home/creati64/repositories/my-task-reward-chart
#
# Builds in place. Passenger runs the app straight out of .next/standalone —
# there is no separate "live" folder and no rsync step.
#
#   Application root         : /home/creati64/repositories/my-task-reward-chart/.next/standalone
#   Application startup file : app.js        (NOT server.js)
#   Node.js version          : 20+
#   .env location            : /home/creati64/repositories/my-task-reward-chart/.env
#                              (repo root — .next/standalone is wiped every build)
#
# Flags (env vars):
#   BASELINE=1   first deploy onto a database that already has tables (Prisma P3005)
#   SEED=1       run prisma/seed.ts (creates the demo parent + child — dev only)
#
# Usage:
#   ./deploy.sh              # normal deploy
#   BASELINE=1 ./deploy.sh   # one-time, on a pre-existing database
#
set -euo pipefail

cd "$(dirname "$0")"

REPO_DIR="$(pwd)"
STANDALONE_DIR="$REPO_DIR/.next/standalone"
BASELINE_MIGRATION="0_init"

# ── 0. Preflight ────────────────────────────────────────────────────────
if [ ! -f .env ]; then
  echo "ERROR: .env not found at $REPO_DIR/.env" >&2
  echo "       Copy .env.example and fill in the production values first." >&2
  exit 1
fi

# Read DATABASE_URL out of .env for the migration steps below. Prisma CLI reads
# .env on its own, but this script needs the value for its own checks.
set -a
# shellcheck disable=SC1091
source .env
set +a

case "${DATABASE_URL:-}" in
  mysql://*) : ;;
  "") echo "ERROR: DATABASE_URL is empty in .env" >&2; exit 1 ;;
  *)  echo "ERROR: DATABASE_URL is not a mysql:// URL — schema.prisma expects MySQL." >&2; exit 1 ;;
esac

echo "==> Deploying $REPO_DIR"

# ── 1. Code + dependencies ──────────────────────────────────────────────
echo "==> Pulling latest code"
git pull --ff-only

# devDependencies are kept on purpose: `prisma` (CLI, for migrate deploy) and
# `tsx` (for the seed) both live there. Only .next/standalone ships to runtime,
# so the extra packages never reach the running server.
echo "==> Installing dependencies"
npm ci

echo "==> Generating Prisma client"
npx prisma generate

# ── 2. Database schema ──────────────────────────────────────────────────
# One-time baseline: the database already has tables (created by an earlier
# `db push`) but no _prisma_migrations bookkeeping table, so migrate deploy
# aborts with P3005. `migrate resolve --applied` only INSERTs a bookkeeping
# row — it runs no DDL and touches no data.
if [ "${BASELINE:-0}" = "1" ]; then
  echo "==> Baselining: checking that the live schema matches schema.prisma"
  DRIFT="$(npx prisma migrate diff \
             --from-url "$DATABASE_URL" \
             --to-schema-datamodel prisma/schema.prisma \
             --script 2>/dev/null || true)"
  if [ -n "$(printf '%s' "$DRIFT" | tr -d '[:space:]')" ]; then
    echo "ERROR: live database does not match schema.prisma. Baselining now would" >&2
    echo "       record a migration that was never actually applied. Gap:" >&2
    echo "$DRIFT" >&2
    exit 1
  fi
  echo "    schema matches — marking $BASELINE_MIGRATION as applied"
  npx prisma migrate resolve --applied "$BASELINE_MIGRATION"
fi

echo "==> Applying database migrations"
npx prisma migrate deploy

if [ "${SEED:-0}" = "1" ]; then
  echo "==> Seeding (idempotent — skips if a child already exists)"
  npm run db:seed
fi

# ── 3. Build ────────────────────────────────────────────────────────────
# NOTE: this regenerates .next/standalone, which is Passenger's app root, so the
# site is briefly unavailable while the build runs. Fine at this scale; if it
# ever matters, build into a staging dir and rsync (see OPTION B below).
echo "==> Building standalone bundle"
npm run build:standalone

# ── 4. Permissions + restart ────────────────────────────────────────────
if [ -d "$STANDALONE_DIR/public" ]; then
  chmod -R 755 "$STANDALONE_DIR/public"
fi

echo "==> Restarting Passenger"
mkdir -p "$STANDALONE_DIR/tmp"
touch "$STANDALONE_DIR/tmp/restart.txt"

echo ""
echo "Deploy finished. Passenger restarts on the next request."
echo "Check startup logs (env loading, DB host) in Passenger's stderr.log."

# ── FIRST-TIME SETUP (once) in cPanel > Setup Node.js App ───────────────
#  Application root         : /home/creati64/repositories/my-task-reward-chart/.next/standalone
#  Application startup file : app.js
#  Node.js version          : 20+
#
#  Then create /home/creati64/repositories/my-task-reward-chart/.env with the
#  production values (see .env.example):
#    DATABASE_URL="mysql://creati64_user:pass@antillo-db.id.rapidplex.com:3306/creati64_mtrc"
#    AUTH_URL="https://<your-domain>"
#    AUTH_SECRET="..."            # npx auth secret
#    CHILD_SESSION_SECRET="..."   # openssl rand -base64 32
#    AUTH_TRUST_HOST=true
#
#  First deploy onto the existing database:  BASELINE=1 ./deploy.sh
#  Every deploy after that:                  ./deploy.sh
# ───────────────────────────────────────────────────────────────────────
#
# ── OPTION B: if `next build` gets SIGKILLed on the server (RAM < ~2GB) ──
#  Build on your laptop and ship the result — no build on the server.
#
#  The Prisma query engine is a platform-specific binary, so a macOS build will
#  not run on the host. Add the host's target to prisma/schema.prisma first:
#
#    generator client {
#      provider      = "prisma-client-js"
#      binaryTargets = ["native", "debian-openssl-3.0.x"]
#    }
#
#  (Confirm the host's target with: ssh USER@HOST 'openssl version')
#
#    # locally:
#    npm run build:standalone
#    rsync -avz --delete --exclude '.env' --exclude 'tmp' \
#      .next/standalone/ USER@HOST:/home/creati64/repositories/my-task-reward-chart/.next/standalone/
#
#    # migrations still run once on the server (needs the server .env):
#    ssh USER@HOST 'cd /home/creati64/repositories/my-task-reward-chart && npx prisma migrate deploy'
#    ssh USER@HOST 'touch /home/creati64/repositories/my-task-reward-chart/.next/standalone/tmp/restart.txt'
# ───────────────────────────────────────────────────────────────────────
