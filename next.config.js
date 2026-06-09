/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a self-contained Node server at .next/standalone/server.js
  output: 'standalone',
  // Pin the tracing root to this project (a stray lockfile in $HOME confuses inference)
  outputFileTracingRoot: __dirname,
  // No native better-sqlite3 adapter needed for Prisma SQLite client
}

module.exports = nextConfig
