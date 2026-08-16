#!/usr/bin/env bash
#
# Assemble .next/standalone into a directory Passenger can run as its app root.
#
# `next build` with output:"standalone" emits a minimal server, but leaves out:
#   - .next/static           (JS/CSS chunks the browser requests)
#   - public/                (static assets, if the project has any)
#   - prisma/                (schema + migrations, needed by the Prisma CLI)
#   - node_modules/.prisma   (generated client + query-engine binary)
# This copies them in, then swaps the entrypoint for the .env-loading app.js.
#
# Called by: npm run build:standalone
set -euo pipefail

cd "$(dirname "$0")/.."

SA=".next/standalone"

if [ ! -f "$SA/server.js" ] && [ ! -f "$SA/_next_server.js" ]; then
  echo "ERROR: $SA/server.js missing — did 'next build' run with output:'standalone'?" >&2
  exit 1
fi

echo "  -> static chunks"
mkdir -p "$SA/.next/static"
cp -r .next/static/. "$SA/.next/static/"

if [ -d public ]; then
  echo "  -> public/"
  mkdir -p "$SA/public"
  cp -r public/. "$SA/public/"
fi

echo "  -> prisma/ (schema + migrations)"
rm -rf "$SA/prisma"
cp -r prisma "$SA/prisma"

# The generated Prisma client lives in node_modules/.prisma and is loaded at
# runtime (serverExternalPackages), so Next's file tracing may miss the engine
# binary. Copy both packages verbatim.
echo "  -> prisma client + query engine"
for pkg in ".prisma" "@prisma/client"; do
  if [ -d "node_modules/$pkg" ]; then
    rm -rf "${SA:?}/node_modules/$pkg"
    mkdir -p "$SA/node_modules/$(dirname "$pkg")"
    cp -r "node_modules/$pkg" "$SA/node_modules/$pkg"
  fi
done

# Passenger's "startup file" setting is per-app and easy to get wrong, so make
# BOTH app.js and server.js the env-loading wrapper. The real Next server is
# moved aside to _next_server.js, which app.js requires at the end.
echo "  -> entrypoint wrapper (app.js)"
if [ -f "$SA/server.js" ] && [ ! -f "$SA/_next_server.js" ]; then
  mv "$SA/server.js" "$SA/_next_server.js"
fi
cp app.js "$SA/app.js"
cp app.js "$SA/server.js"

echo "  standalone ready at $SA"
