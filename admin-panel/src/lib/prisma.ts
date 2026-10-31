import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function withConnectionTimeouts(url: string | undefined) {
  if (!url) return url;

  const options = ['connect_timeout=5', 'pool_timeout=8']
    .filter((option) => !new RegExp(`[?&]${option.split('=')[0]}=`, 'i').test(url));
  if (options.length === 0) return url;

  return `${url}${url.includes('?') ? '&' : '?'}${options.join('&')}`;
}

const databaseUrl = withConnectionTimeouts(process.env.DATABASE_URL);
if (!databaseUrl) {
  console.warn('[admin-panel prisma] DATABASE_URL is not configured.');
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: { db: { url: databaseUrl } },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
