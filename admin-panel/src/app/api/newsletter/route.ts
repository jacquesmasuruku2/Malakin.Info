import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const subscribers = await prisma.newsletterSubscription.findMany({
      orderBy: { subscribedAt: 'desc' },
    });

    const serialized = subscribers.map((s) => ({
      id: s.id,
      email: s.email,
      isActive: s.isActive,
      subscribedAt: s.subscribedAt?.toISOString(),
      unsubscribedAt: s.unsubscribedAt?.toISOString() || null,
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return NextResponse.json({ error: 'Failed to fetch subscribers', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
  }
}
