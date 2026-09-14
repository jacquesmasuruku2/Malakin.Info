import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveCurrentUserId } from '@/lib/current-user';

export async function GET(request: NextRequest) {
  try {
    const userId = await resolveCurrentUserId(request);

    if (!userId) {
      return NextResponse.json({ adFree: false }, { status: 200 });
    }

    const now = new Date();

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
        expiresAt: {
          gt: now,
        },
      },
    });

    if (activeSubscription) {
      return NextResponse.json({
        adFree: true,
        type: 'subscription',
        expiresAt: activeSubscription.expiresAt,
      });
    }

    const activePurchase = await prisma.articlePurchase.findFirst({
      where: {
        userId,
        status: 'completed',
        expiresAt: {
          gt: now,
        },
      },
    });

    if (activePurchase) {
      return NextResponse.json({
        adFree: true,
        type: 'article_purchase',
        expiresAt: activePurchase.expiresAt,
      });
    }

    return NextResponse.json({ adFree: false });
  } catch (error) {
    console.error('Error checking ad-free status:', error);
    return NextResponse.json({ adFree: false }, { status: 500 });
  }
}
