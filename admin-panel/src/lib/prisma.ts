import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};
let prismaClient: PrismaClient | undefined;

function withConnectionTimeouts(url: string | undefined) {
  if (!url) return url;

  const options = ['connect_timeout=5', 'pool_timeout=8']
    .filter((option) => !new RegExp(`[?&]${option.split('=')[0]}=`, 'i').test(url));
  if (options.length === 0) return url;

  return `${url}${url.includes('?') ? '&' : '?'}${options.join('&')}`;
}

function getPrismaClient() {
  const databaseUrl = withConnectionTimeouts(process.env.DATABASE_URL);
  if (!databaseUrl) {
    throw new Error('[admin-panel prisma] DATABASE_URL is not configured.');
  }

  const existingClient = globalForPrisma.prisma ?? prismaClient;
  if (existingClient) return existingClient;

  prismaClient = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: { db: { url: databaseUrl } },
  });

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;
  return prismaClient;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, client);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
