/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a self-contained Node server at .next/standalone/server.js
  output: 'standalone',
  // Pin the tracing root to this project (a stray lockfile in $HOME confuses inference)
  outputFileTracingRoot: __dirname,

  // Keep Prisma out of the webpack bundle so its query-engine binary resolves at
  // runtime via require(). bcryptjs is pure JS but bundling it bloats the server
  // chunk for no gain. Also lowers peak build memory on small shared hosts.
  serverExternalPackages: ['@prisma/client', '.prisma/client', 'bcryptjs'],

  // ── Low-RAM build (shared hosting / cPanel LVE) ──────────────────────
  // Default worker count is (cores - 1), which on a shared box means many
  // workers competing for a small memory cap → SIGKILL. Force one worker.
  experimental: {
    cpus: 1,
    workerThreads: false,
    webpackMemoryOptimizations: true,
  },
};

module.exports = nextConfig;
