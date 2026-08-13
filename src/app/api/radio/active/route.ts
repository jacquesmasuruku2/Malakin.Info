import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    return NextResponse.json(
      station ?? {
        id: 'default-radio',
        name: 'Malakinfo Radio',
        streamUrl: 'https://stream.zeno.fm/5k7n5xq7z4zuv',
        logoUrl: '/images/logo.png',
        description: 'Le son de Malakinfo en direct',
        showLabel: true,
        isActive: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[radio API] Error fetching active station:', error);

    return NextResponse.json(
      {
        id: 'default-radio',
        name: 'Malakinfo Radio',
        streamUrl: 'https://stream.zeno.fm/5k7n5xq7z4zuv',
        logoUrl: '/images/logo.png',
        description: 'Le son de Malakinfo en direct',
        showLabel: true,
        isActive: true,
      },
      { status: 200 }
    );
  }
}
