import { prisma } from '@/lib/prisma';
import { withRetry } from '@/lib/database';

export function yearRange(year: number) {
  return {
    gte: new Date(Date.UTC(year, 0, 1)),
    lt: new Date(Date.UTC(year + 1, 0, 1)),
  };
}

export function isValidArchiveYear(year: number) {
  return Number.isInteger(year) && year >= 1990 && year <= 2100;
}

export async function getArchiveYears(): Promise<number[]> {
  const rows = await withRetry(() =>
    prisma.$queryRaw<{ year: number }[]>`
      SELECT DISTINCT EXTRACT(YEAR FROM "publishedAt")::int AS year
      FROM "Article"
      ORDER BY year DESC
    `
  );

  if (rows && rows.length > 0) {
    return rows.map((row) => Number(row.year)).filter((year) => isValidArchiveYear(year));
  }

  const dates = await withRetry(() =>
    prisma.article.findMany({
      select: { publishedAt: true },
    })
  );

  return [...new Set((dates || []).map((item) => item.publishedAt.getUTCFullYear()))]
    .filter((year) => isValidArchiveYear(year))
    .sort((a, b) => b - a);
}
