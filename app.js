/**
 * Passenger / cPanel startup file (CommonJS — this package has no "type":"module").
 *
 * Next.js `output: "standalone"` produces a server.js that does NOT read .env.
 * This file loads .env first, then boots the standalone server.
 *
 * In cPanel "Setup Node.js App":
 *   - Application root         : /home/creati64/repositories/my-task-reward-chart/.next/standalone
 *   - Application startup file : app.js   (NOT server.js — server.js skips .env)
 *   - Node.js version          : 20+
 *
 * Where to put .env: the REPO ROOT
 *   /home/creati64/repositories/my-task-reward-chart/.env
 * `.next/standalone/` is wiped and regenerated on every build, so a .env placed
 * inside it would be lost. The repo root is two levels up and survives builds —
 * that path is in the search list below.
 *
 * Note: NEXT_PUBLIC_* is baked at BUILD time, not runtime. It must be correct in
 * the repo-root .env before `npm run build:standalone`.
 */
const fs = require('node:fs');
const path = require('node:path');

function loadEnvFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  let count = 0;
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim().replace(/^export\s+/, '');
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    // Real environment variables win over .env (Passenger can inject its own).
    if (!(key in process.env)) {
      process.env[key] = value;
      count++;
    }
  }
  return count;
}

// Search order: standalone dir → repo root (../../ from standalone) → Passenger cwd.
const candidates = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', '..', '.env'),
  path.join(process.cwd(), '.env'),
];

let loadedFrom = null;
let loadedCount = 0;
for (const file of candidates) {
  if (fs.existsSync(file)) {
    loadedCount = loadEnvFile(file);
    loadedFrom = file;
    break;
  }
}

// Diagnostics to stderr (shows up in Passenger stderr.log).
if (loadedFrom) {
  const dbHost = (() => {
    try {
      return process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).host : '(empty)';
    } catch {
      return '(unparseable)';
    }
  })();
  console.error(
    `[app] .env loaded from ${loadedFrom} (${loadedCount} vars). ` +
      `DATABASE_URL host=${dbHost}. AUTH_URL=${process.env.AUTH_URL || '(empty)'}`,
  );
} else {
  console.error(
    `[app] ⚠ no .env found. Looked in: ${candidates.join(' , ')}. ` +
      `DATABASE_URL is ${process.env.DATABASE_URL ? '(set from system env)' : '(empty → will fail)'}`,
  );
}

// Auth.js behind the cPanel proxy: trust the forwarded host unless told otherwise.
if (!process.env.AUTH_TRUST_HOST) process.env.AUTH_TRUST_HOST = 'true';

// Boot the Next standalone server AFTER env is set (it listens on process.env.PORT,
// which Passenger assigns). build:standalone renames the generated server.js to
// _next_server.js so both app.js and server.js end up being this env-loader wrapper.
require('./_next_server.js');
