import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function withConnectionTimeouts(url: string | undefined) {
  if (!url) return url;
  const extras: string[] = [];
  if (!/[?&]connect_timeout=/i.test(url)) extras.push('connect_timeout=5');
  if (!/[?&]pool_timeout=/i.test(url)) extras.push('pool_timeout=8');
  if (extras.length === 0) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${extras.join('&')}`;
}

const databaseUrl = withConnectionTimeouts(process.env.DATABASE_URL);

if (!databaseUrl) {
  console.warn('[prisma] DATABASE_URL is not defined. Prisma requests will fail until it is set.');
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL) {
  globalForPrisma.prisma = prisma;
}
