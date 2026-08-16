#!/usr/bin/env bash
#
# build.sh — Build MTRC into a self-contained Node server (Next.js standalone).
#
# Output: JavaScript bundle at .next/standalone/  →  run with `node`.
# Run after building:
#   node .next/standalone/server.js
#
# Deploy target: 
#   Run the node server (default port 3000) and put a reverse proxy
#   (Nginx / Caddy) in front to terminate TLS for the domain.
#
# Required production environment variables (set on the server before starting):
#   DATABASE_URL=mysql://user:pass@host:3306/dbname   # MySQL connection string
#   AUTH_SECRET=<random>                        # generate with: npx auth secret
#   AUTH_URL=    # canonical URL for Auth.js callbacks
#   AUTH_TRUST_HOST=true                        # trust the proxy host header
#   CHILD_SESSION_SECRET=<random>               # signs the child access-code cookie
#   AUTH_GOOGLE_ID=<optional>                   # Google OAuth (login with Google)
#   AUTH_GOOGLE_SECRET=<optional>
#   PORT=3000                                   # port the node server listens on
#
set -euo pipefail

cd "$(dirname "$0")"

echo "==> Installing dependencies (npm ci)"
npm ci

echo "==> Generating Prisma client"
npx prisma generate

echo "==> Applying database migrations (prisma migrate deploy)"
# One-time only, if the database already has tables but no _prisma_migrations
# table (error P3005), baseline it first:
#   npx prisma migrate resolve --applied 0_init
npx prisma migrate deploy

echo "==> Building Next.js (standalone output)"
npx next build

echo "==> Assembling standalone bundle"
# Next.js standalone output excludes static assets, public/, and the prisma folder.
# Copy them in so `node .next/standalone/server.js` runs without extra setup.
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
[ -d public ] && cp -r public .next/standalone/public || true
cp -r prisma .next/standalone/prisma

echo ""
echo "Build complete."
echo "Start the server with:"
echo "    node .next/standalone/server.js"
echo "It listens on \$PORT (default 3000). Point https://<domain.com> at it via your reverse proxy."
