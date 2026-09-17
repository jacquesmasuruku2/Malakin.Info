import { prisma } from '@/lib/prisma';
import { withRetry } from '@/lib/database';

export type FooterPartner = {
  id: string;
  companyName: string;
  imageUrl: string;
  websiteUrl: string | null;
};

function normalizeWebsiteUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).toString();
  } catch {
    return null;
  }
}

/** Approved partners that have a logo ready for the footer strip. */
export async function getFooterPartners(): Promise<FooterPartner[]> {
  try {
    const partners =
      (await withRetry(() =>
        prisma.partnership.findMany({
          where: { status: 'approved' },
          select: {
            id: true,
            companyName: true,
            imageUrl: true,
            websiteUrl: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 24,
        }),
      )) || [];

    return partners
      .filter(
        (partner): partner is typeof partner & { imageUrl: string } =>
          typeof partner.imageUrl === 'string' &&
          partner.imageUrl.trim().length > 0 &&
          !partner.imageUrl.startsWith('data:'),
      )
      .slice(0, 12)
      .map((partner) => ({
        id: partner.id,
        companyName: partner.companyName,
        imageUrl: partner.imageUrl.trim(),
        websiteUrl: normalizeWebsiteUrl(partner.websiteUrl),
      }));
  } catch {
    return [];
  }
}
