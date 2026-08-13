import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_STATION } from '../route';

export async function GET() {
  try {
    const station = await prisma.radioStation.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(station ?? DEFAULT_STATION, { status: 200 });
  } catch (error) {
    console.error('[radio API] Error fetching active station:', error);
    return NextResponse.json(DEFAULT_STATION, { status: 200 });
  }
}
