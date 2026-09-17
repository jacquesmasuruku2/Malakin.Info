const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const hasLocalEnvironmentFile = fs.existsSync('.env') || fs.existsSync('.env.local');

if (!process.env.DATABASE_URL && !hasLocalEnvironmentFile) {
  console.warn('[admin-panel] DATABASE_URL is not configured; skipping Prisma migrations for this preview build.');
  process.exit(0);
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function runPrisma(args) {
  return spawnSync(command, ['prisma', ...args], {
    stdio: 'inherit',
    env: process.env,
  });
}

function unlockKnownTables() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    return prisma
      .$executeRawUnsafe('ALTER TABLE IF EXISTS "JobApplicationMessage" SET (schema_locked = false)')
      .catch(() => null)
      .finally(() => prisma.$disconnect());
  } catch {
    return Promise.resolve();
  }
}

async function main() {
  await unlockKnownTables();

  let result = runPrisma(['migrate', 'deploy']);
  if ((result.status ?? 1) === 0) {
    process.exit(0);
  }

  // Recover from a previously failed migration when the table already exists
  // (CockroachDB schema_locked can interrupt index creation mid-migration).
  console.warn('[admin-panel] migrate deploy failed; attempting recovery for JobApplicationMessage…');
  await unlockKnownTables();

  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const rows = await prisma.$queryRawUnsafe(`
      SELECT 1 AS ok FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'JobApplicationMessage'
      LIMIT 1
    `);
    await prisma.$disconnect();

    if (Array.isArray(rows) && rows.length > 0) {
      const resolve = runPrisma([
        'migrate',
        'resolve',
        '--applied',
        '20260917_job_application_messages',
      ]);
      if ((resolve.status ?? 1) === 0) {
        result = runPrisma(['migrate', 'deploy']);
        process.exit(result.status ?? 1);
      }
    }
  } catch (error) {
    console.error('[admin-panel] migration recovery failed:', error);
  }

  process.exit(result.status ?? 1);
}

main();
