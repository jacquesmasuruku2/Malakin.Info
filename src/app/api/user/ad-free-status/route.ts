import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

async function resolveCurrentUserId(request: NextRequest) {
  // Try NextAuth session first (for Google OAuth users)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return session.user.id;
  }

  // Then try Authorization header (from localStorage)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const customSession = await prisma.session.findUnique({
      where: { token },
    });
    if (customSession) {
      return customSession.userId;
    }
  }

  // Finally try session token cookie
  const sessionToken = request.cookies.get('session_token')?.value;
  if (!sessionToken) {
    return null;
  }

  const customSession = await prisma.session.findUnique({
    where: { token: sessionToken },
  });

  return customSession?.userId ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await resolveCurrentUserId(request);
    
    if (!userId) {
      return NextResponse.json({ adFree: false }, { status: 200 });
    }

    const now = new Date();

    // Check if user has an active subscription
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

    // Check if user has any active article purchase
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
