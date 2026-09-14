import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function hasPremiumAccess(articleId: string) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    if (!userId) {
      const cookieStore = await cookies();
      const token = cookieStore.get('session_token')?.value;
      if (token) {
        const customSession = await prisma.session.findUnique({ where: { token } });
        if (customSession && customSession.expiresAt > new Date()) {
          userId = customSession.userId;
        }
      }
    }

    if (!userId) return false;

    const now = new Date();
    const [purchase, subscription] = await Promise.all([
      prisma.articlePurchase.findFirst({
        where: {
          userId,
          articleId,
          status: 'completed',
          expiresAt: { gt: now },
        },
        select: { id: true },
      }),
      prisma.subscription.findFirst({
        where: {
          userId,
          status: 'active',
          expiresAt: { gt: now },
        },
        select: { id: true },
      }),
    ]);

    return Boolean(purchase || subscription);
  } catch (error) {
    console.error('Premium access check failed:', error);
    return false;
  }
}

export function getPremiumPreviewContent(content: string) {
  const paragraphs = content.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi) ?? [];

  if (paragraphs.length === 0) {
    const stripped = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return stripped ? `<p>${stripped.slice(0, 700)}</p>` : '';
  }

  let html = '';
  let textLength = 0;

  for (const paragraph of paragraphs.slice(0, 4)) {
    html += paragraph;
    textLength += paragraph.replace(/<[^>]+>/g, '').length;
    if (textLength >= 420) break;
  }

  return html;
}
