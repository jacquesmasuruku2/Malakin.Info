import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveCurrentUserId } from '@/lib/current-user';

export async function GET(request: NextRequest) {
  try {
    const userId = await resolveCurrentUserId(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const donations = await prisma.donation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
