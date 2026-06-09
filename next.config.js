/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a self-contained Node server at .next/standalone/server.js
  output: 'standalone',
  // Pin the tracing root to this project (a stray lockfile in $HOME confuses inference)
  outputFileTracingRoot: __dirname,
  // Keep the native SQLite driver out of the bundler; load it at runtime
  serverExternalPackages: ['better-sqlite3'],
}

module.exports = nextConfig
